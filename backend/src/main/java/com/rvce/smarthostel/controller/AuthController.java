package com.rvce.smarthostel.controller;

import com.rvce.smarthostel.entity.User;

import com.rvce.smarthostel.dto.LoginRequest;
import com.rvce.smarthostel.dto.LoginResponse;
import com.rvce.smarthostel.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        // JWT is stateless, client just needs to remove the token
        return ResponseEntity.ok("Logged out successfully");
    }
    
    @GetMapping("/validate")
    public ResponseEntity<String> validateToken() {
        // If this endpoint is reached, the JWT is valid (handled by filter)
        return ResponseEntity.ok("Token is valid");
    }

    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        User savedUser = authService.registerUser(user);
        return ResponseEntity.ok(savedUser);
    }
}
