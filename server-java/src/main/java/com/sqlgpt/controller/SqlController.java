package com.sqlgpt.controller;

import com.sqlgpt.model.DatabaseConnection;
import com.sqlgpt.model.QueryHistory;
import com.sqlgpt.repository.DatabaseConnectionRepository;
import com.sqlgpt.repository.QueryHistoryRepository;
import com.sqlgpt.service.DatabaseExecutorService;
import com.sqlgpt.service.EncryptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/sql")
public class SqlController {

    private final DatabaseConnectionRepository dbConnectionRepository;
    private final QueryHistoryRepository queryHistoryRepository;
    private final DatabaseExecutorService dbExecutorService;
    private final EncryptionService encryptionService;

    public SqlController(
            DatabaseConnectionRepository dbConnectionRepository,
            QueryHistoryRepository queryHistoryRepository,
            DatabaseExecutorService dbExecutorService,
            EncryptionService encryptionService) {
        this.dbConnectionRepository = dbConnectionRepository;
        this.queryHistoryRepository = queryHistoryRepository;
        this.dbExecutorService = dbExecutorService;
        this.encryptionService = encryptionService;
    }

    private boolean isDangerousQuery(String sql) {
        if (sql == null) return false;
        String upperSql = sql.toUpperCase();

        // Compile regex safety rules matching sqlValidator.ts
        Pattern dropPattern = Pattern.compile("\\bDROP\\b\\s+(DATABASE|TABLE|INDEX|VIEW|USER)\\b");
        Pattern truncatePattern = Pattern.compile("\\bTRUNCATE\\b\\s+TABLE\\b");
        Pattern alterPattern = Pattern.compile("\\bALTER\\b\\s+TABLE\\b");
        Pattern grantPattern = Pattern.compile("\\bGRANT\\b\\s+ALL\\b");

        if (dropPattern.matcher(upperSql).find() ||
            truncatePattern.matcher(upperSql).find() ||
            alterPattern.matcher(upperSql).find() ||
            grantPattern.matcher(upperSql).find()) {
            return true;
        }

        // DELETE without WHERE
        if (upperSql.contains("DELETE") && upperSql.contains("FROM")) {
            if (!upperSql.contains("WHERE")) {
                return true;
            }
        }

        // UPDATE without WHERE
        if (upperSql.contains("UPDATE") && upperSql.contains("SET")) {
            if (!upperSql.contains("WHERE")) {
                return true;
            }
        }

        return false;
    }

    @PostMapping("/execute")
    public ResponseEntity<?> executeSql(
            @RequestBody Map<String, Object> request,
            Principal principal) {
        long startTime = System.currentTimeMillis();
        String userId = principal.getName();

        String connectionId = (String) request.get("connectionId");
        String sql = (String) request.get("sql");
        String prompt = (String) request.get("prompt");
        String explanation = (String) request.get("explanation");
        boolean bypassValidator = request.containsKey("bypassValidator") && (boolean) request.get("bypassValidator");

        if (connectionId == null || sql == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
        }

        if (!bypassValidator && isDangerousQuery(sql)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Query execution blocked: Potentially dangerous query detected (e.g., DROP, DELETE without WHERE)"));
        }

        Optional<DatabaseConnection> connOpt = dbConnectionRepository.findById(connectionId);
        if (connOpt.isEmpty() || !connOpt.get().getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Connection not found"));
        }

        DatabaseConnection dbConn = connOpt.get();
        String decryptedPassword = encryptionService.decrypt(dbConn.getPassword());

        try {
            List<Map<String, Object>> results = dbExecutorService.executeSql(dbConn, decryptedPassword, sql);
            long executionTimeMs = System.currentTimeMillis() - startTime;

            // Save success record to MongoDB history
            QueryHistory history = new QueryHistory();
            history.setUserId(userId);
            history.setConnectionId(connectionId);
            history.setPrompt(prompt != null && !prompt.trim().isEmpty() ? prompt : "Manual Execution");
            history.setGeneratedSql(sql);
            history.setExplanation(explanation != null ? explanation : "");
            history.setExecutionTimeMs((int) executionTimeMs);
            history.setStatus("success");
            queryHistoryRepository.save(history);

            return ResponseEntity.ok(Map.of("results", results, "executionTimeMs", executionTimeMs));

        } catch (Exception e) {
            long executionTimeMs = System.currentTimeMillis() - startTime;
            
            // Save error record to MongoDB history
            try {
                QueryHistory history = new QueryHistory();
                history.setUserId(userId);
                history.setConnectionId(connectionId);
                history.setPrompt(prompt != null && !prompt.trim().isEmpty() ? prompt : "Manual Execution");
                history.setGeneratedSql(sql);
                history.setExplanation(explanation != null ? explanation : "");
                history.setExecutionTimeMs((int) executionTimeMs);
                history.setStatus("error");
                history.setErrorMessage(e.getMessage());
                queryHistoryRepository.save(history);
            } catch (Exception ex) {
                // Ignore history write errors on database failures
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Query execution failed"));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<QueryHistory>> getQueryHistory(Principal principal) {
        String userId = principal.getName();
        List<QueryHistory> history = queryHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<DatabaseConnection> connections = dbConnectionRepository.findByUserId(userId);

        // Map connection ID to connection name to emulate populate('connectionId', 'name')
        Map<String, DatabaseConnection> connMap = new HashMap<>();
        connections.forEach(c -> connMap.put(c.getId(), c));

        history.forEach(h -> {
            if (connMap.containsKey(h.getConnectionId())) {
                DatabaseConnection c = connMap.get(h.getConnectionId());
                QueryHistory.ConnectionDetails details = new QueryHistory.ConnectionDetails();
                details.setId(c.getId());
                details.setName(c.getName());
                h.setPopulatedConnection(details);
            }
        });

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<?> deleteQueryHistoryItem(
            @PathVariable String id,
            Principal principal) {
        String userId = principal.getName();
        Optional<QueryHistory> itemOpt = queryHistoryRepository.findById(id);

        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "History item not found"));
        }

        QueryHistory item = itemOpt.get();
        if (!item.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to delete this history item"));
        }

        queryHistoryRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "History item deleted successfully"));
    }

    @DeleteMapping("/history")
    public ResponseEntity<?> clearQueryHistory(Principal principal) {
        String userId = principal.getName();
        queryHistoryRepository.deleteByUserId(userId);
        return ResponseEntity.ok(Map.of("message", "Query history cleared successfully"));
    }

    @DeleteMapping("/history/connection/{connectionId}")
    public ResponseEntity<?> clearConnectionQueryHistory(
            @PathVariable String connectionId,
            Principal principal) {
        String userId = principal.getName();
        queryHistoryRepository.deleteByUserIdAndConnectionId(userId, connectionId);
        return ResponseEntity.ok(Map.of("message", "Database query history cleared successfully"));
    }
}
