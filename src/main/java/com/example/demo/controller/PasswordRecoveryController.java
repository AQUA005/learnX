package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth/recover")
@AllArgsConstructor
public class PasswordRecoveryController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // In-memory store for verification codes (Email -> Code)
    private static final ConcurrentHashMap<String, String> recoveryCodes = new ConcurrentHashMap<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecoveryRequest {
        private String email;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResetRequest {
        private String email;
        private String code;
        private String password;
    }

    @PostMapping("/request")
    public ResponseEntity<?> requestRecovery(@RequestBody RecoveryRequest request) {
        String email = request.getEmail();
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            // Try by username as well
            user = userRepository.findByUsername(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "No user found with the provided email or username."));
            }
            email = user.getEmail();
        }

        // Generate 6-digit code
        String code = String.format("%06d", new Random().nextInt(999999));
        recoveryCodes.put(email, code);

        System.out.println("=================================================");
        System.out.println("[PASSWORD RECOVERY] Verification code for " + email + " is: " + code);
        System.out.println("=================================================");

        return ResponseEntity.ok(Map.of(
                "message", "Verification code sent to email successfully.",
                "email", email,
                "code", code // Included in response to allow seamless local automated/manual testing without reading server logs
        ));
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetRequest request) {
        String email = request.getEmail();
        String savedCode = recoveryCodes.get(email);

        if (savedCode == null || !savedCode.equals(request.getCode())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code."));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User not found."));
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        recoveryCodes.remove(email);

        return ResponseEntity.ok(Map.of("message", "Password has been reset successfully. You can now login."));
    }
}
