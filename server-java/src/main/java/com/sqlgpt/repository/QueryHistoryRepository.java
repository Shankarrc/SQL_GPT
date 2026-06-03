package com.sqlgpt.repository;

import com.sqlgpt.model.QueryHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface QueryHistoryRepository extends MongoRepository<QueryHistory, String> {
    List<QueryHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
    void deleteByUserIdAndConnectionId(String userId, String connectionId);
}
