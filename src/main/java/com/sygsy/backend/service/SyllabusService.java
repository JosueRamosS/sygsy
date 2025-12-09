package com.sygsy.backend.service;

import com.sygsy.backend.domain.AcademicPeriod;
import com.sygsy.backend.domain.Evaluation;
import com.sygsy.backend.domain.Syllabus;
import com.sygsy.backend.domain.SyllabusUnit;
import com.sygsy.backend.domain.User;
import com.sygsy.backend.repository.AcademicPeriodRepository;
import com.sygsy.backend.repository.SyllabusRepository;
import com.sygsy.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SyllabusService {

    private final SyllabusRepository syllabusRepository;
    private final UserRepository userRepository;
    private final AcademicPeriodRepository academicPeriodRepository;
    private final ExcelService excelService;

    public SyllabusService(SyllabusRepository syllabusRepository, UserRepository userRepository, AcademicPeriodRepository academicPeriodRepository, ExcelService excelService) {
        this.syllabusRepository = syllabusRepository;
        this.userRepository = userRepository;
        this.academicPeriodRepository = academicPeriodRepository;
        this.excelService = excelService;
    }

    @Transactional
    public Syllabus createSyllabus(com.sygsy.backend.dto.CreateSyllabusDTO dto, String coordinatorUsername) {
        // Get coordinator
        User coordinator = userRepository.findByUsername(coordinatorUsername)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));
        
        if (coordinator.getRole() != User.Role.COORDINATOR) {
            throw new RuntimeException("Only coordinators can create syllabi");
        }

        // Get academic period
        // Get academic period (by ID or Name)
        AcademicPeriod academicPeriod;
        if (dto.getAcademicPeriodId() != null) {
            academicPeriod = academicPeriodRepository.findById(dto.getAcademicPeriodId())
                    .orElseThrow(() -> new RuntimeException("Academic period not found with ID: " + dto.getAcademicPeriodId()));
        } else if (dto.getAcademicPeriod() != null) {
            academicPeriod = academicPeriodRepository.findByName(dto.getAcademicPeriod())
                    .orElseThrow(() -> new RuntimeException("Academic period not found with name: " + dto.getAcademicPeriod()));
        } else {
            throw new RuntimeException("Academic Period ID or Name must be provided");
        }

        // Validate professor exists and has PROFESSOR role
        User professor = null;
        if (dto.getProfessorEmail() != null) {
            professor = userRepository.findByUsername(dto.getProfessorEmail())
                    .orElseThrow(() -> new RuntimeException("Professor not found with email: " + dto.getProfessorEmail()));
            
            if (professor.getRole() != User.Role.PROFESSOR) {
                throw new RuntimeException("User " + dto.getProfessorEmail() + " is not a professor");
            }
        }

        Syllabus syllabus = Syllabus.builder()
                .academicPeriod(academicPeriod)
                .courseName(dto.getCourseName())
                .courseCode(dto.getCourseCode())
                .professorEmail(dto.getProfessorEmail())
                .professor(professor)
                .coordinator(coordinator)
                .workflowStatus(Syllabus.SyllabusStatus.CREATED)
                .createdBy(coordinator.getId())
                .build();

        // Initialize 4 Units
        List<SyllabusUnit> units = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            units.add(SyllabusUnit.builder()
                    .unitNumber(i)
                    .title("UNIDAD " + toRoman(i))
                    .syllabus(syllabus)
                    .createdBy(coordinator.getId())
                    .build());
        }
        syllabus.setUnits(units);

        // Initialize Evaluations
        List<Evaluation> evaluations = new ArrayList<>();
        evaluations.add(createEvaluation("EVIDENCIA 1", 0.10, syllabus, coordinator.getId()));
        evaluations.add(createEvaluation("EVIDENCIA 2", 0.10, syllabus, coordinator.getId()));
        evaluations.add(createEvaluation("EXAMEN PARCIAL", 0.30, syllabus, coordinator.getId()));
        evaluations.add(createEvaluation("EVIDENCIA 3", 0.10, syllabus, coordinator.getId()));
        evaluations.add(createEvaluation("EVIDENCIA 4", 0.10, syllabus, coordinator.getId()));
        evaluations.add(createEvaluation("EXAMEN FINAL", 0.30, syllabus, coordinator.getId()));
        syllabus.setEvaluations(evaluations);

        return syllabusRepository.save(syllabus);
    }

    @Transactional
    public Syllabus updateSyllabusFromExcel(Long id, MultipartFile file) {
        Syllabus existing = getSyllabus(id);
        List<Syllabus> parsedList = excelService.parseAllSyllabi(file);
        if (parsedList.isEmpty()) {
            throw new RuntimeException("No data found in Excel file");
        }
        Syllabus parsed = parsedList.get(0);

        // VALIDATION: Check if Excel professor email matches syllabus professor email
        if (parsed.getProfessorEmail() != null && existing.getProfessorEmail() != null) {
            if (!parsed.getProfessorEmail().equalsIgnoreCase(existing.getProfessorEmail())) {
                throw new RuntimeException(
                    "Professor email mismatch! Excel has '" + parsed.getProfessorEmail() + 
                    "' but syllabus is assigned to '" + existing.getProfessorEmail() + "'"
                );
            }
        }

        // Merge Excel data into existing syllabus (General Data)
        existing.setFaculty(parsed.getFaculty());
        existing.setCareer(parsed.getCareer());
        
        existing.setSemester(parsed.getSemester());
        existing.setCredits(parsed.getCredits());
        existing.setTotalHours(parsed.getTotalHours());
        existing.setTheoryHours(parsed.getTheoryHours());
        existing.setPracticeHours(parsed.getPracticeHours());
        existing.setTrainingArea(parsed.getTrainingArea());
        
        if (parsed.getCourseCode() != null && !parsed.getCourseCode().isEmpty()) existing.setCourseCode(parsed.getCourseCode());
        if (parsed.getCourseName() != null && !parsed.getCourseName().isEmpty()) existing.setCourseName(parsed.getCourseName());
        
        existing.setCourseType(parsed.getCourseType());
        existing.setPrerequisites(parsed.getPrerequisites());
        
        return syllabusRepository.save(existing);
    }

    @Transactional
    public List<Syllabus> importSyllabiFromExcel(MultipartFile file, Long academicPeriodId, String coordinatorUsername) {
        User coordinator = userRepository.findByUsername(coordinatorUsername)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));

        if (coordinator.getRole() != User.Role.COORDINATOR) {
            throw new RuntimeException("Only coordinators can import syllabi");
        }

        AcademicPeriod academicPeriod = academicPeriodRepository.findById(academicPeriodId)
                .orElseThrow(() -> new RuntimeException("Academic period not found"));

        List<Syllabus> parsedList = excelService.parseAllSyllabi(file);
        List<Syllabus> savedSyllabi = new ArrayList<>();

        for (Syllabus parsed : parsedList) {
            try {
                // Validate Professor
                User professor = null;
                if (parsed.getProfessorEmail() != null && !parsed.getProfessorEmail().isEmpty()) {
                    professor = userRepository.findByUsername(parsed.getProfessorEmail())
                            .orElseThrow(() -> new RuntimeException("Professor not found: " + parsed.getProfessorEmail()));
                    
                    if (professor.getRole() != User.Role.PROFESSOR) {
                        throw new RuntimeException("User " + parsed.getProfessorEmail() + " is not a professor");
                    }
                }

                // Create Syllabus
                Syllabus syllabus = Syllabus.builder()
                        .academicPeriod(academicPeriod)
                        .faculty(parsed.getFaculty())
                        .career(parsed.getCareer())
                        .semester(parsed.getSemester())
                        .credits(parsed.getCredits())
                        .totalHours(parsed.getTotalHours())
                        .theoryHours(parsed.getTheoryHours())
                        .practiceHours(parsed.getPracticeHours())
                        .trainingArea(parsed.getTrainingArea())
                        .courseCode(parsed.getCourseCode())
                        .courseName(parsed.getCourseName())
                        .courseType(parsed.getCourseType())
                        .prerequisites(parsed.getPrerequisites())
                        .professorEmail(parsed.getProfessorEmail())
                        .professor(professor)
                        .coordinator(coordinator)
                        .workflowStatus(Syllabus.SyllabusStatus.CREATED)
                        .createdBy(coordinator.getId())
                        .build();

                // Initialize Units (Default 4)
                List<SyllabusUnit> units = new ArrayList<>();
                for (int i = 1; i <= 4; i++) {
                    units.add(SyllabusUnit.builder()
                            .unitNumber(i)
                            .title("UNIDAD " + toRoman(i))
                            .syllabus(syllabus)
                            .createdBy(coordinator.getId())
                            .build());
                }
                syllabus.setUnits(units);

                // Initialize Evaluations (Default Template)
                List<Evaluation> evaluations = new ArrayList<>();
                evaluations.add(createEvaluation("EVIDENCIA 1", 0.10, syllabus, coordinator.getId()));
                evaluations.add(createEvaluation("EVIDENCIA 2", 0.10, syllabus, coordinator.getId()));
                evaluations.add(createEvaluation("EXAMEN PARCIAL", 0.30, syllabus, coordinator.getId()));
                evaluations.add(createEvaluation("EVIDENCIA 3", 0.10, syllabus, coordinator.getId()));
                evaluations.add(createEvaluation("EVIDENCIA 4", 0.10, syllabus, coordinator.getId()));
                evaluations.add(createEvaluation("EXAMEN FINAL", 0.30, syllabus, coordinator.getId()));
                syllabus.setEvaluations(evaluations);

                savedSyllabi.add(syllabusRepository.save(syllabus));

            } catch (Exception e) {
                // Log and continue? Or fail all? 
                // For now, let's fail all as it's safer for "Pre-load" than partial success
                throw new RuntimeException("Error importing syllabus for course " + parsed.getCourseName() + ": " + e.getMessage());
            }
        }

        return savedSyllabi;
    }

    private Evaluation createEvaluation(String name, Double weight, Syllabus syllabus, Long createdBy) {
        return Evaluation.builder()
                .name(name)
                .weight(weight)
                .syllabus(syllabus)
                .createdBy(createdBy)
                .build();
    }

    private String toRoman(int number) {
        switch (number) {
            case 1: return "I";
            case 2: return "II";
            case 3: return "III";
            case 4: return "IV";
            default: return String.valueOf(number);
        }
    }

    public List<Syllabus> getAllSyllabi() {
        return syllabusRepository.findAll();
    }

    public List<Syllabus> getSyllabiByStatus(Syllabus.SyllabusStatus workflowStatus) {
        return syllabusRepository.findByWorkflowStatus(workflowStatus);
    }

    public List<Syllabus> getSyllabiByProfessor(String username) {
        User professor = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
        return syllabusRepository.findByProfessor(professor);
    }

    public Syllabus getSyllabus(Long id) {
        return syllabusRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Syllabus not found"));
    }

    @Transactional
    public Syllabus updateSyllabus(Long id, Syllabus updatedSyllabus) {
        Syllabus existing = getSyllabus(id);
        
        // Update fields that professors can edit
        existing.setCourseCompetence(updatedSyllabus.getCourseCompetence());
        existing.setProfileCompetence(updatedSyllabus.getProfileCompetence());
        existing.setPreviousCompetence(updatedSyllabus.getPreviousCompetence());
        existing.setSumilla(updatedSyllabus.getSumilla());
        existing.setBibliography(updatedSyllabus.getBibliography());
        existing.setActivities(updatedSyllabus.getActivities());
        
        // Update Units
        if (updatedSyllabus.getUnits() != null) {
            existing.getUnits().clear();
            updatedSyllabus.getUnits().forEach(unit -> {
                unit.setSyllabus(existing);
                existing.getUnits().add(unit);
            });
        }

        // Update Evaluations
        if (updatedSyllabus.getEvaluations() != null) {
            existing.getEvaluations().clear();
            updatedSyllabus.getEvaluations().forEach(eval -> {
                eval.setSyllabus(existing);
                existing.getEvaluations().add(eval);
            });
        }

        return syllabusRepository.save(existing);
    }

    @Transactional
    public Syllabus updateStatus(Long id, Syllabus.SyllabusStatus workflowStatus) {
        Syllabus syllabus = getSyllabus(id);
        syllabus.setWorkflowStatus(workflowStatus);
        return syllabusRepository.save(syllabus);
    }
}
