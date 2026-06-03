package com.sqlgpt.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class AiService {

    private final String geminiApiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public AiService(
            @Value("${app.gemini-api-key}") String geminiApiKey,
            ObjectMapper objectMapper) {
        this.geminiApiKey = geminiApiKey;
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> generateSql(String prompt, String dbType, List<Map<String, Object>> tableSchema) {
        if (geminiApiKey == null || geminiApiKey.trim().isEmpty()) {
            throw new IllegalStateException("Gemini API key is not configured. Please add GEMINI_API_KEY to your environment variables.");
        }

        String systemPrompt = String.format("""
            You are an expert SQL generator and database administrator.
            The user is querying a %s database.
            The schema of the relevant tables is provided below:
            %s
            
            Generate an optimized SQL query based on the user's natural language request.
            Return the result in JSON format with the following keys:
            - "sql": The exact, valid SQL query to execute (do not wrap in markdown code blocks like ```sql)
            - "explanation": A brief explanation of how the query works
            - "recommendations": Suggestions for optimization (e.g., indexes to add)
            - "confidence": A score from 0 to 1 indicating your confidence in the query correctness.
            Only return valid JSON. Do not include markdown formatting like ```json.
            """, dbType, serializeSchema(tableSchema));

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;

        try {
            // Build the standard Gemini REST payload
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> partContainer = new HashMap<>();
            partContainer.put("parts", Collections.singletonList(textPart));

            Map<String, Object> sysTextPart = new HashMap<>();
            sysTextPart.put("text", systemPrompt);

            Map<String, Object> sysPartContainer = new HashMap<>();
            sysPartContainer.put("parts", Collections.singletonList(sysTextPart));

            Map<String, Object> generationConfig = new HashMap<>();
            generationConfig.put("responseMimeType", "application/json");

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(partContainer));
            requestBody.put("systemInstruction", sysPartContainer);
            requestBody.put("generationConfig", generationConfig);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);

            Map<String, Object> body = responseEntity.getBody();
            if (body == null) {
                throw new RuntimeException("Empty response received from Gemini AI");
            }

            // Extract the generated text from Gemini API response candidates structure
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new RuntimeException("No generation candidates returned from Gemini AI");
            }

            Map<String, Object> candidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts == null || parts.isEmpty()) {
                throw new RuntimeException("No text parts in response candidate content");
            }

            String aiJsonText = (String) parts.get(0).get("text");
            if (aiJsonText == null || aiJsonText.trim().isEmpty()) {
                throw new RuntimeException("Empty text in response candidate");
            }

            // Parse returned JSON text to Map matching expected format
            return objectMapper.readValue(aiJsonText, Map.class);

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate SQL query: " + e.getMessage(), e);
        }
    }

    private String serializeSchema(List<Map<String, Object>> tableSchema) {
        try {
            return objectMapper.writeValueAsString(tableSchema);
        } catch (Exception e) {
            return tableSchema.toString();
        }
    }
}
