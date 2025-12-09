package com.sygsy.backend.repository;

import com.sygsy.backend.domain.AcademicPeriod;
import com.sygsy.backend.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AcademicPeriodRepository extends JpaRepository<AcademicPeriod, Long> {
    Optional<AcademicPeriod> findByName(String name);
    List<AcademicPeriod> findByCoordinator(User coordinator);
}
