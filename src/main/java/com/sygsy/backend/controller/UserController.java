package com.sygsy.backend.controller;

import com.sygsy.backend.domain.User;
import com.sygsy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<List<User>> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/professors")
    public ResponseEntity<List<User>> listProfessors() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.PROFESSOR));
    }

    @GetMapping("/coordinators")
    public ResponseEntity<List<User>> listCoordinators() {
        return ResponseEntity.ok(userRepository.findByRole(User.Role.COORDINATOR));
    }
}
