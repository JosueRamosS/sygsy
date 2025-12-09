package com.sygsy.backend.service;

import com.sygsy.backend.domain.AcademicPeriod;
import com.sygsy.backend.domain.User;
import com.sygsy.backend.dto.CreateAcademicPeriodDTO;
import com.sygsy.backend.repository.AcademicPeriodRepository;
import com.sygsy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AcademicPeriodService {

    private final AcademicPeriodRepository academicPeriodRepository;
    private final UserRepository userRepository;

    public AcademicPeriodService(AcademicPeriodRepository academicPeriodRepository, UserRepository userRepository) {
        this.academicPeriodRepository = academicPeriodRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AcademicPeriod createAcademicPeriod(CreateAcademicPeriodDTO dto, String coordinatorUsername) {
        User coordinator = userRepository.findByUsername(coordinatorUsername)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));

        if (coordinator.getRole() != User.Role.COORDINATOR) {
            throw new RuntimeException("Only coordinators can create academic periods");
        }

        // Check if period already exists
        if (academicPeriodRepository.findByName(dto.getName()).isPresent()) {
            throw new RuntimeException("Academic period with name '" + dto.getName() + "' already exists");
        }

        AcademicPeriod period = AcademicPeriod.builder()
                .name(dto.getName())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .coordinator(coordinator)
                .createdBy(coordinator.getId())
                .build();

        return academicPeriodRepository.save(period);
    }

    public List<AcademicPeriod> getAllAcademicPeriods() {
        return academicPeriodRepository.findAll();
    }

    public List<AcademicPeriod> getAcademicPeriodsByCoordinator(String coordinatorUsername) {
        User coordinator = userRepository.findByUsername(coordinatorUsername)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));
        return academicPeriodRepository.findByCoordinator(coordinator);
    }

    public AcademicPeriod getAcademicPeriod(Long id) {
        return academicPeriodRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Academic period not found"));
    }
}
