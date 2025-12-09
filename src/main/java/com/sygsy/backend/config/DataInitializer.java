package com.sygsy.backend.config;

import com.sygsy.backend.domain.User;
import com.sygsy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String adminUsername = "admin@ulasalle.edu.pe";
        String adminPassword = "admin123";
        
        userRepository.findByUsername(adminUsername).ifPresentOrElse(
                user -> {
                    log.info("Admin user found. Resetting password...");
                    user.setPassword(passwordEncoder.encode(adminPassword));
                    user.setRole(User.Role.COORDINATOR); // Ensure role
                    user.setStatus("ACTIVE");
                    userRepository.save(user);
                    log.info("Admin password reset to: " + adminPassword);
                },
                () -> {
                    log.info("Admin user not found. Creating...");
                    User admin = new User();
                    admin.setUsername(adminUsername);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setFullName("Administrador del Sistema");
                    admin.setRole(User.Role.COORDINATOR);
                    admin.setStatus("ACTIVE");
                    User savedUser = userRepository.save(admin);
                    log.info("Admin user created with ID: {}", savedUser.getId());
                    
                    // Verify immediately
                    userRepository.findByUsername(adminUsername).ifPresentOrElse(
                        u -> log.info("VERIFICATION SUCCESS: Found user [{}] in DB.", u.getUsername()),
                        () -> log.error("VERIFICATION FAILED: User [{}] NOT found after save!", adminUsername)
                    );
                    
                    log.info("Admin user created with password: " + adminPassword);
                }
        );
        
        log.info("========================================");
        log.info("ADMIN READY: " + adminUsername);
        log.info("========================================");
    }
}
