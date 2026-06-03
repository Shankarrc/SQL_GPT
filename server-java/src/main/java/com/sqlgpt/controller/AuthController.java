package com.sqlgpt.controller;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.sqlgpt.model.User;
import com.sqlgpt.repository.UserRepository;
import com.sqlgpt.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider tokenProvider;
    private final String googleClientId;

    public AuthController(
            UserRepository userRepository,
            JwtTokenProvider tokenProvider,
            @Value("${app.google-client-id:}") String googleClientId) {
        this.userRepository = userRepository;
        this.tokenProvider = tokenProvider;
        this.googleClientId = googleClientId;
    }

    @PostMapping("/google")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> request) {
        String credential = request.get("credential");
        if (credential == null || credential.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Google credential is required"));
        }

        if (googleClientId == null || googleClientId.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Google Client ID is not configured on the server. Please set GOOGLE_CLIENT_ID."));
        }

        try {
            NetHttpTransport transport = new NetHttpTransport();
            GsonFactory jsonFactory = GsonFactory.getDefaultInstance();

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(credential);
            if (idToken == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Invalid Google credential token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String googleId = payload.getSubject();
            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            Optional<User> existingUser = userRepository.findByGoogleId(googleId)
                    .or(() -> userRepository.findByEmail(email));

            User user;
            if (existingUser.isEmpty()) {
                user = new User();
                user.setName(name != null ? name : "Google User");
                user.setEmail(email);
                user.setGoogleId(googleId);
                user.setPicture(picture);
                user = userRepository.save(user);
            } else {
                user = existingUser.get();
                boolean updated = false;
                if (user.getGoogleId() == null) {
                    user.setGoogleId(googleId);
                    updated = true;
                }
                if (picture != null && user.getPicture() == null) {
                    user.setPicture(picture);
                    updated = true;
                }
                if (updated) {
                    user = userRepository.save(user);
                }
            }

            String token = tokenProvider.generateToken(user.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("_id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("picture", user.getPicture());
            response.put("token", token);

            return ResponseEntity.ok(response);

        } catch (GeneralSecurityException | IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Authentication failed: " + e.getMessage()));
        }
    }
}
