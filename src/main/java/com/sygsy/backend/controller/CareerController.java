package com.sygsy.backend.controller;

import com.sygsy.backend.domain.Career;
import com.sygsy.backend.service.CareerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/careers")
public class CareerController {

    private final CareerService careerService;

    public CareerController(CareerService careerService) {
        this.careerService = careerService;
    }

    @GetMapping
    public ResponseEntity<List<Career>> getAllCareers() {
        return ResponseEntity.ok(careerService.getAllCareers());
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')") // Assuming Admin is a Coordinator without career (or specific Admin role if we had one)
    public ResponseEntity<Career> createCareer(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        return ResponseEntity.ok(careerService.createCareer(name));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Void> deleteCareer(@PathVariable Long id) {
        careerService.deleteCareer(id);
        return ResponseEntity.noContent().build();
    }
}
