package com.sygsy.backend.repository;

import com.sygsy.backend.domain.Career;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerRepository extends JpaRepository<Career, Long> {
    Optional<Career> findByName(String name);
}
