package com.sygsy.backend.controller;

import com.sygsy.backend.domain.AcademicPeriod;
import com.sygsy.backend.dto.CreateAcademicPeriodDTO;
import com.sygsy.backend.service.AcademicPeriodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/academic-periods")
public class AcademicPeriodController {

    private final AcademicPeriodService academicPeriodService;

    public AcademicPeriodController(AcademicPeriodService academicPeriodService) {
        this.academicPeriodService = academicPeriodService;
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')") // Only coordinators can create academic periods
    public ResponseEntity<AcademicPeriod> createAcademicPeriod(
            @RequestBody CreateAcademicPeriodDTO dto,
            Authentication authentication) {
        String coordinatorUsername = authentication.getName();
        return ResponseEntity.ok(academicPeriodService.createAcademicPeriod(dto, coordinatorUsername));
    }

    @GetMapping
    public ResponseEntity<List<AcademicPeriod>> getAllAcademicPeriods() {
        return ResponseEntity.ok(academicPeriodService.getAllAcademicPeriods());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicPeriod> getAcademicPeriod(@PathVariable Long id) {
        return ResponseEntity.ok(academicPeriodService.getAcademicPeriod(id));
    }

    @GetMapping("/my-periods")
    @PreAuthorize("hasRole('COORDINATOR')") // Only coordinators can see their periods
    public ResponseEntity<List<AcademicPeriod>> getMyAcademicPeriods(Authentication authentication) {
        String coordinatorUsername = authentication.getName();
        return ResponseEntity.ok(academicPeriodService.getAcademicPeriodsByCoordinator(coordinatorUsername));
    }
}
