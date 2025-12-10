package com.sygsy.backend.service;

import com.sygsy.backend.domain.Career;
import com.sygsy.backend.repository.CareerRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CareerService {

    private static final Logger log = LoggerFactory.getLogger(CareerService.class);
    private final CareerRepository careerRepository;

    public CareerService(CareerRepository careerRepository) {
        this.careerRepository = careerRepository;
    }

    public List<Career> getAllCareers() {
        List<Career> careers = careerRepository.findAll();
        log.info("Found {} careers in the database.", careers.size());
        return careers;
    }

    public Career createCareer(String name) {
        if (careerRepository.findByName(name).isPresent()) {
            throw new RuntimeException("La carrera '" + name + "' ya existe.");
        }
        return careerRepository.save(new Career(name));
    }

    public void deleteCareer(Long id) {
        careerRepository.deleteById(id);
    }
}
