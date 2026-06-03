package com.sqlgpt.controller;

import com.sqlgpt.model.DatabaseConnection;
import com.sqlgpt.repository.DatabaseConnectionRepository;
import com.sqlgpt.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final DatabaseConnectionRepository dbConnectionRepository;
    private final AiService aiService;

    public AiController(
            DatabaseConnectionRepository dbConnectionRepository,
            AiService aiService) {
        this.dbConnectionRepository = dbConnectionRepository;
        this.aiService = aiService;
    }

    @PostMapping("/generate-sql")
    public ResponseEntity<?> generateSql(
            @RequestBody Map<String, Object> request,
            Principal principal) {
        try {
            String userId = principal.getName();
            String prompt = (String) request.get("prompt");
            String connectionId = (String) request.get("connectionId");
            List<Map<String, Object>> tableSchema = (List<Map<String, Object>>) request.get("tableSchema");

            if (prompt == null || connectionId == null || tableSchema == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Missing required fields"));
            }

            Optional<DatabaseConnection> connOpt = dbConnectionRepository.findById(connectionId);
            if (connOpt.isEmpty() || !connOpt.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Connection not found"));
            }

            DatabaseConnection dbConn = connOpt.get();
            Map<String, Object> aiResult = aiService.generateSql(prompt, dbConn.getType(), tableSchema);
            return ResponseEntity.ok(aiResult);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage() != null ? e.getMessage() : "Failed to generate SQL"));
        }
    }
}
