package com.sqlgpt.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;
import java.util.Date;

@Document(collection = "queryhistories")
public class QueryHistory {
    @Id
    @JsonProperty("_id")
    private String id;
    
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;
    
    @Field(targetType = FieldType.OBJECT_ID)
    private String connectionId;
    
    private String prompt;
    private String generatedSql;
    private String explanation;
    private Integer executionTimeMs;
    private String status; // success, error
    private String errorMessage;
    
    private Date createdAt = new Date();
    private Date updatedAt = new Date();

    private transient ConnectionDetails populatedConnection;

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    @JsonProperty("id")
    public String getIdAlias() {
        return id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(String connectionId) {
        this.connectionId = connectionId;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }

    public String getGeneratedSql() {
        return generatedSql;
    }

    public void setGeneratedSql(String generatedSql) {
        this.generatedSql = generatedSql;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public Integer getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Integer executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public ConnectionDetails getPopulatedConnection() {
        return populatedConnection;
    }

    public void setPopulatedConnection(ConnectionDetails populatedConnection) {
        this.populatedConnection = populatedConnection;
    }

    @JsonProperty("connectionId")
    public Object getSerializedConnectionId() {
        if (populatedConnection != null) {
            return populatedConnection;
        }
        return connectionId;
    }

    public static class ConnectionDetails {
        @JsonProperty("_id")
        private String id;
        private String name;

        // Getters and Setters
        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        @JsonProperty("id")
        public String getIdAlias() {
            return id;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }
    }
}
