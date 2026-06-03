package com.sqlgpt.repository;

import com.sqlgpt.model.DatabaseConnection;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface DatabaseConnectionRepository extends MongoRepository<DatabaseConnection, String> {
    List<DatabaseConnection> findByUserId(String userId);
}
