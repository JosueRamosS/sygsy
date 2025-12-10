package com.sygsy.backend.controller;

import com.sygsy.backend.domain.Syllabus;
import com.sygsy.backend.service.SyllabusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/syllabi")
public class SyllabusController {

    private final SyllabusService syllabusService;
    private final com.sygsy.backend.service.PdfService pdfService;

    public SyllabusController(SyllabusService syllabusService, com.sygsy.backend.service.PdfService pdfService) {
        this.syllabusService = syllabusService;
        this.pdfService = pdfService;
    }

    @PostMapping
    @PreAuthorize("hasRole('COORDINATOR')") // Only coordinators can create syllabi
    public ResponseEntity<Syllabus> createSyllabus(
            @RequestBody com.sygsy.backend.dto.CreateSyllabusDTO dto,
            Authentication authentication) {
        String coordinatorUsername = authentication.getName();
        return ResponseEntity.ok(syllabusService.createSyllabus(dto, coordinatorUsername));
    }

    @PostMapping("/{id}/upload-excel")
    @PreAuthorize("hasRole('COORDINATOR')") // Only coordinators can upload Excel with general data
    public ResponseEntity<Syllabus> uploadExcel(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return ResponseEntity.ok(syllabusService.updateSyllabusFromExcel(id, file, username));
    }

    @PostMapping("/upload-bulk")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<List<Syllabus>> uploadBulk(
            @RequestParam("file") MultipartFile file,
            @RequestParam("academicPeriodId") Long academicPeriodId,
            Authentication authentication
    ) {
        String coordinatorUsername = authentication.getName();
        return ResponseEntity.ok(syllabusService.importSyllabiFromExcel(file, academicPeriodId, coordinatorUsername));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Syllabus syllabus = syllabusService.getSyllabus(id);
        byte[] pdfBytes = pdfService.generateSyllabusPdf(syllabus);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=silabo_" + id + ".pdf")
                .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping
    public ResponseEntity<List<Syllabus>> listSyllabi(
            Authentication authentication,
            @RequestParam(required = false) Syllabus.SyllabusStatus status) {
        String username = authentication.getName();
        
        // Get filtered list based on role and career
        List<Syllabus> syllabi = syllabusService.getSyllabi(username);

        // Apply status filter if present
        if (status != null) {
            syllabi = syllabi.stream()
                .filter(s -> s.getWorkflowStatus() == status)
                .toList();
        }

        return ResponseEntity.ok(syllabi);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Syllabus> getSyllabus(@PathVariable Long id) {
        return ResponseEntity.ok(syllabusService.getSyllabus(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Syllabus> updateSyllabus(@PathVariable Long id, @RequestBody Syllabus syllabus) {
        return ResponseEntity.ok(syllabusService.updateSyllabus(id, syllabus));
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<Syllabus> updateStatus(
            @PathVariable Long id, 
            @RequestParam Syllabus.SyllabusStatus status,
            Authentication authentication
    ) {
        // Security check
        boolean isCoordinator = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_COORDINATOR"));
        boolean isProfessor = authentication.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_PROFESSOR"));
        
        if (isProfessor && status != Syllabus.SyllabusStatus.SUBMITTED) {
            throw new RuntimeException("Professors can only change status to SUBMITTED");
        }
        
        if (!isCoordinator && !isProfessor) {
             throw new RuntimeException("Unauthorized status change");
        }

        return ResponseEntity.ok(syllabusService.updateStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<Void> deleteSyllabus(@PathVariable Long id) {
        syllabusService.deleteSyllabus(id);
        return ResponseEntity.noContent().build();
    }
}
