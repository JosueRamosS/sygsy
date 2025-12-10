package com.sygsy.backend.controller;

import com.sygsy.backend.config.JwtUtil;
import com.sygsy.backend.domain.User;
import com.sygsy.backend.dto.LoginRequest;
import com.sygsy.backend.dto.LoginResponse;
import com.sygsy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(),
                        loginRequest.getPassword()
                )
        );

        // Get user details
        User user = userRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        // Build response
        return ResponseEntity.ok(LoginResponse.builder()
                .token(token)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .career(user.getCareer())
                .expiresIn(jwtUtil.getExpirationTime())
                .build());
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('COORDINATOR')") // Only coordinators can create users
    public ResponseEntity<User> register(@RequestBody User user) {
        // Validate that user doesn't already exist
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("User already exists");
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setStatus("ACTIVE");
        return ResponseEntity.ok(userRepository.save(user));
    }
    @PostMapping("/register-batch")
    @PreAuthorize("hasRole('COORDINATOR')") // Only coordinators/admins can create users
    public ResponseEntity<java.util.List<User>> registerBatch(@RequestBody java.util.List<User> users) {
        java.util.List<User> savedUsers = new java.util.ArrayList<>();
        
        for (User user : users) {
            // Validate that user doesn't already exist
            if (userRepository.findByUsername(user.getUsername()).isPresent()) {
                // Determine behavior: Skip or Throw? 
                // For batch, skipping existing or updating might be better, 
                // but let's throw only if strict. Given user request, we'll just skip to avoid breaking the whole batch 
                // OR we can just continue. Let's log and continue? 
                // Simplest is to check and only save if new.
                continue; 
            }
            
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setStatus("ACTIVE");
            savedUsers.add(userRepository.save(user));
        }
        
        return ResponseEntity.ok(savedUsers);
    }
}
