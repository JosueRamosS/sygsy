package com.sygsy.backend.config;

import com.sygsy.backend.domain.User;
import com.sygsy.backend.domain.Career;
import com.sygsy.backend.repository.UserRepository;
import com.sygsy.backend.repository.CareerRepository;
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
    private final CareerRepository careerRepository;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, CareerRepository careerRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.careerRepository = careerRepository;
    }

    @Override
    public void run(String... args) {
        // Seed Careers first
        if (careerRepository.count() == 0) {
            log.info("Seeding careers...");
            careerRepository.save(new Career("Ingeniería de Software"));
            careerRepository.save(new Career("Derecho"));
            careerRepository.save(new Career("Arquitectura y Urbanismo"));
        }

        String adminUsername = "admin@ulasalle.edu.pe";
        String adminPassword = "admin123";

        // CLEANUP: Removed for production to preserve users
        // userRepository.deleteAll();
        // 1. ADMIN (Super Admin, no career scope)
        userRepository.findByUsername(adminUsername).ifPresentOrElse(
                user -> {
                    log.info("Admin user found. Resetting password...");
                    user.setPassword(passwordEncoder.encode(adminPassword));
                    user.setRole(User.Role.COORDINATOR);
                    user.setCareer(null); // Ensure admin has no career
                    user.setStatus("ACTIVE");
                    userRepository.save(user);
                    log.info("Admin reset.");
                },
                () -> {
                    User admin = new User();
                    admin.setUsername(adminUsername);
                    admin.setPassword(passwordEncoder.encode(adminPassword));
                    admin.setFullName("Administrador del Sistema");
                    admin.setRole(User.Role.COORDINATOR);
                    admin.setCareer(null);
                    admin.setStatus("ACTIVE");
                    userRepository.save(admin);
                    log.info("Admin created.");
                }
        );
        
        log.info("========================================");
        log.info("SEED DATA READY");
        log.info("Admin: " + adminUsername + " (No Career)");
        log.info("========================================");
    }
}
