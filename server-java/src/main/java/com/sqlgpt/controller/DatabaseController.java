package com.sqlgpt.controller;

import com.sqlgpt.model.DatabaseConnection;
import com.sqlgpt.repository.DatabaseConnectionRepository;
import com.sqlgpt.service.DatabaseExecutorService;
import com.sqlgpt.service.EncryptionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/database")
public class DatabaseController {

    private final DatabaseConnectionRepository dbConnectionRepository;
    private final DatabaseExecutorService dbExecutorService;
    private final EncryptionService encryptionService;

    public DatabaseController(
            DatabaseConnectionRepository dbConnectionRepository,
            DatabaseExecutorService dbExecutorService,
            EncryptionService encryptionService) {
        this.dbConnectionRepository = dbConnectionRepository;
        this.dbExecutorService = dbExecutorService;
        this.encryptionService = encryptionService;
    }

    @PostMapping("/connect")
    public ResponseEntity<?> connectDatabase(
            @RequestBody Map<String, Object> request,
            Principal principal) {
        try {
            String userId = principal.getName();
            String name = (String) request.get("name");
            String type = (String) request.get("type");
            String host = (String) request.get("host");
            int port = Integer.parseInt(request.get("port").toString());
            String username = (String) request.get("username");
            String password = (String) request.get("password");
            String database = (String) request.get("database");
            boolean createIfNotExists = request.containsKey("createIfNotExists") && (boolean) request.get("createIfNotExists");

            if (type == null || !"mysql".equalsIgnoreCase(type)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Unsupported database type. Only MySQL is supported."));
            }

            // Test connection and create database if requested
            dbExecutorService.testAndCreateDatabase(type, host, port, username, password, database, createIfNotExists);

            // Save Connection
            String encryptedPassword = encryptionService.encrypt(password);
            DatabaseConnection dbConn = new DatabaseConnection();
            dbConn.setUserId(userId);
            dbConn.setName(name);
            dbConn.setType(type.toLowerCase());
            dbConn.setHost(host);
            dbConn.setPort(port);
            dbConn.setUsername(username);
            dbConn.setPassword(encryptedPassword);
            dbConn.setDatabase(database);

            DatabaseConnection saved = dbConnectionRepository.save(dbConn);
            saved.setPassword(null); // Do not return encrypted password to frontend

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Connection failed: " + e.getMessage()));
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<DatabaseConnection>> listDatabases(Principal principal) {
        String userId = principal.getName();
        List<DatabaseConnection> connections = dbConnectionRepository.findByUserId(userId);
        
        // Sanitize password field
        connections.forEach(conn -> conn.setPassword(null));
        return ResponseEntity.ok(connections);
    }

    @GetMapping("/{id}/tables")
    public ResponseEntity<?> getTables(
            @PathVariable String id,
            Principal principal) {
        try {
            String userId = principal.getName();
            Optional<DatabaseConnection> connOpt = dbConnectionRepository.findById(id);

            if (connOpt.isEmpty() || !connOpt.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Connection not found"));
            }

            DatabaseConnection dbConn = connOpt.get();
            String decryptedPassword = encryptionService.decrypt(dbConn.getPassword());

            List<String> tables = dbExecutorService.getTables(dbConn, decryptedPassword);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/tables/{table}/columns")
    public ResponseEntity<?> getColumns(
            @PathVariable String id,
            @PathVariable String table,
            Principal principal) {
        try {
            String userId = principal.getName();
            Optional<DatabaseConnection> connOpt = dbConnectionRepository.findById(id);

            if (connOpt.isEmpty() || !connOpt.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Connection not found"));
            }

            DatabaseConnection dbConn = connOpt.get();
            String decryptedPassword = encryptionService.decrypt(dbConn.getPassword());

            List<Map<String, Object>> columns = dbExecutorService.getColumns(dbConn, decryptedPassword, table);
            return ResponseEntity.ok(columns);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDatabase(
            @PathVariable String id,
            Principal principal) {
        try {
            String userId = principal.getName();
            Optional<DatabaseConnection> connOpt = dbConnectionRepository.findById(id);

            if (connOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Database connection not found"));
            }

            DatabaseConnection dbConn = connOpt.get();
            if (!dbConn.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Not authorized to delete this database connection"));
            }

            List<String> tables = new ArrayList<>();
            try {
                String decryptedPassword = encryptionService.decrypt(dbConn.getPassword());
                tables = dbExecutorService.getTables(dbConn, decryptedPassword);
            } catch (Exception connError) {
                // Allow deletion of broken connections
            }

            if (!tables.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "message", String.format("Cannot delete database connection. The database '%s' is not empty (contains %d table(s)). Only empty databases can be deleted.",
                                dbConn.getDatabase(), tables.size())
                ));
            }

            dbConnectionRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Database connection deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createDatabase(
            @RequestBody Map<String, Object> request,
            Principal principal) {
        try {
            String userId = principal.getName();
            String connectionId = (String) request.get("connectionId");
            String database = (String) request.get("database");
            String name = (String) request.get("name");

            if (connectionId == null || database == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "connectionId and database are required"));
            }

            Optional<DatabaseConnection> baseConnOpt = dbConnectionRepository.findById(connectionId);
            if (baseConnOpt.isEmpty() || !baseConnOpt.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Base connection not found"));
            }

            DatabaseConnection baseConn = baseConnOpt.get();
            String decryptedPassword = encryptionService.decrypt(baseConn.getPassword());

            // Create remote DB
            dbExecutorService.testAndCreateDatabase(
                    baseConn.getType(), baseConn.getHost(), baseConn.getPort(),
                    baseConn.getUsername(), decryptedPassword, database, true);

            // Create new DatabaseConnection record
            DatabaseConnection newConn = new DatabaseConnection();
            newConn.setUserId(userId);
            newConn.setName(name != null && !name.trim().isEmpty() ? name.trim() : baseConn.getName() + " - " + database);
            newConn.setType(baseConn.getType());
            newConn.setHost(baseConn.getHost());
            newConn.setPort(baseConn.getPort());
            newConn.setUsername(baseConn.getUsername());
            newConn.setPassword(baseConn.getPassword()); // keep encrypted password
            newConn.setDatabase(database);

            DatabaseConnection saved = dbConnectionRepository.save(newConn);
            saved.setPassword(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to create database and connection: " + e.getMessage()));
        }
    }
}
