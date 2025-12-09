package com.sygsy.backend.repository;

import com.sygsy.backend.domain.Syllabus;
import com.sygsy.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SyllabusRepository extends JpaRepository<Syllabus, Long> {
    List<Syllabus> findByProfessor(User professor);
    List<Syllabus> findByWorkflowStatus(Syllabus.SyllabusStatus workflowStatus);
}
