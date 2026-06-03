package com.sqlgpt.service;

import com.sqlgpt.model.DatabaseConnection;
import org.springframework.stereotype.Service;
import java.sql.*;
import java.util.*;

@Service
public class DatabaseExecutorService {

    private String getJdbcUrl(String type, String host, int port, String database) {
        if ("mysql".equalsIgnoreCase(type)) {
            // Include developer-friendly parameters for local/development MySQL
            // environments
            return String.format("jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                    host, port, database);
        } else if ("postgres".equalsIgnoreCase(type)) {
            return String.format("jdbc:postgresql://%s:%d/%s", host, port, database);
        }
        throw new IllegalArgumentException("Unsupported database type: " + type);
    }

    private String getJdbcUrlNoDb(String type, String host, int port) {
        if ("mysql".equalsIgnoreCase(type)) {
            return String.format("jdbc:mysql://%s:%d/?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
                    host, port);
        } else if ("postgres".equalsIgnoreCase(type)) {
            return String.format("jdbc:postgresql://%s:%d/postgres", host, port);
        }
        throw new IllegalArgumentException("Unsupported database type: " + type);
    }

    public void testAndCreateDatabase(String type, String host, int port, String username, String password,
            String database, boolean createIfNotExists) throws SQLException {
        // Register drivers explicitly to be absolutely safe in dynamic runtime
        try {
            if ("mysql".equalsIgnoreCase(type)) {
                Class.forName("com.mysql.cj.jdbc.Driver");
            } else {
                Class.forName("org.postgresql.Driver");
            }
        } catch (ClassNotFoundException e) {
            throw new SQLException("Database driver not found", e);
        }

        if (createIfNotExists) {
            String initUrl = getJdbcUrlNoDb(type, host, port);
            try (Connection conn = DriverManager.getConnection(initUrl, username, password);
                    Statement stmt = conn.createStatement()) {
                if ("mysql".equalsIgnoreCase(type)) {
                    stmt.executeUpdate(String.format("CREATE DATABASE IF NOT EXISTS `%s`", database));
                } else if ("postgres".equalsIgnoreCase(type)) {
                    // Postgres doesn't support CREATE DATABASE IF NOT EXISTS, so check manually
                    boolean dbExists = false;
                    try (PreparedStatement pstmt = conn
                            .prepareStatement("SELECT 1 FROM pg_database WHERE datname = ?")) {
                        pstmt.setString(1, database);
                        try (ResultSet rs = pstmt.executeQuery()) {
                            if (rs.next()) {
                                dbExists = true;
                            }
                        }
                    }
                    if (!dbExists) {
                        stmt.executeUpdate(String.format("CREATE DATABASE \"%s\"", database));
                    }
                }
            }
        }

        // Test normal connection to the actual database
        String testUrl = getJdbcUrl(type, host, port, database);
        try (Connection conn = DriverManager.getConnection(testUrl, username, password)) {
            // Successfully connected!
        }
    }

    public List<String> getTables(DatabaseConnection dbConn, String decryptedPassword) throws SQLException {
        String url = getJdbcUrl(dbConn.getType(), dbConn.getHost(), dbConn.getPort(), dbConn.getDatabase());
        List<String> tables = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(url, dbConn.getUsername(), decryptedPassword)) {
            if ("mysql".equalsIgnoreCase(dbConn.getType())) {
                try (Statement stmt = conn.createStatement();
                        ResultSet rs = stmt.executeQuery("SHOW TABLES")) {
                    while (rs.next()) {
                        tables.add(rs.getString(1));
                    }
                }
            } else if ("postgres".equalsIgnoreCase(dbConn.getType())) {
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")) {
                    try (ResultSet rs = pstmt.executeQuery()) {
                        while (rs.next()) {
                            tables.add(rs.getString("table_name"));
                        }
                    }
                }
            }
        }
        return tables;
    }

    public List<Map<String, Object>> getColumns(DatabaseConnection dbConn, String decryptedPassword, String tableName)
            throws SQLException {
        String url = getJdbcUrl(dbConn.getType(), dbConn.getHost(), dbConn.getPort(), dbConn.getDatabase());
        List<Map<String, Object>> columns = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(url, dbConn.getUsername(), decryptedPassword)) {
            if ("mysql".equalsIgnoreCase(dbConn.getType())) {
                // To avoid SQL injection on table name: use PreparedStatement where possible or
                // validate table name, or standard dynamic metadata
                DatabaseMetaData metaData = conn.getMetaData();
                try (ResultSet rs = metaData.getColumns(null, null, tableName, null)) {
                    while (rs.next()) {
                        Map<String, Object> col = new HashMap<>();
                        col.put("name", rs.getString("COLUMN_NAME"));
                        col.put("type", rs.getString("TYPE_NAME"));
                        columns.add(col);
                    }
                }
            } else if ("postgres".equalsIgnoreCase(dbConn.getType())) {
                try (PreparedStatement pstmt = conn.prepareStatement(
                        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = ?")) {
                    pstmt.setString(1, tableName);
                    try (ResultSet rs = pstmt.executeQuery()) {
                        while (rs.next()) {
                            Map<String, Object> col = new HashMap<>();
                            col.put("name", rs.getString("column_name"));
                            col.put("type", rs.getString("data_type"));
                            columns.add(col);
                        }
                    }
                }
            }
        }
        return columns;
    }

    public List<Map<String, Object>> executeSql(DatabaseConnection dbConn, String decryptedPassword, String sql)
            throws SQLException {
        String url = getJdbcUrl(dbConn.getType(), dbConn.getHost(), dbConn.getPort(), dbConn.getDatabase());
        List<Map<String, Object>> results = new ArrayList<>();

        try (Connection conn = DriverManager.getConnection(url, dbConn.getUsername(), decryptedPassword);
                Statement stmt = conn.createStatement()) {

            boolean hasResultSet = stmt.execute(sql);
            if (hasResultSet) {
                try (ResultSet rs = stmt.getResultSet()) {
                    ResultSetMetaData meta = rs.getMetaData();
                    int colCount = meta.getColumnCount();

                    while (rs.next()) {
                        Map<String, Object> row = new LinkedHashMap<>();
                        for (int i = 1; i <= colCount; i++) {
                            String colName = meta.getColumnLabel(i);
                            Object colValue = rs.getObject(i);
                            row.put(colName, colValue);
                        }
                        results.add(row);
                    }
                }
            } else {
                Map<String, Object> affected = new HashMap<>();
                affected.put("affectedRows", stmt.getUpdateCount());
                results.add(affected);
            }
        }
        return results;
    }
}
