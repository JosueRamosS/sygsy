package com.sygsy.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evaluations")
public class Evaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // EVIDENCIA 1, PARCIAL, etc.
    private Double weight; // Percentage (e.g., 0.10, 0.20)
    private LocalDate consolidationDate;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "syllabus_id")
    @JsonIgnore
    private Syllabus syllabus;

    // Audit fields
    @Column(nullable = false)
    private String status = "ACTIVE";

    @Column(name = "created_id")
    private Long createdBy;

    @Column(name = "modified_id")
    private Long modifiedBy;

    @Column(name = "created", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "modified")
    private LocalDateTime modifiedAt;

    public Evaluation() {
    }

    public Evaluation(Long id, String name, Double weight, LocalDate consolidationDate, String description, Syllabus syllabus, String status, Long createdBy, Long modifiedBy, LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.id = id;
        this.name = name;
        this.weight = weight;
        this.consolidationDate = consolidationDate;
        this.description = description;
        this.syllabus = syllabus;
        this.status = status;
        this.createdBy = createdBy;
        this.modifiedBy = modifiedBy;
        this.createdAt = createdAt;
        this.modifiedAt = modifiedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        modifiedAt = LocalDateTime.now();
        if (status == null) {
            status = "ACTIVE";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        modifiedAt = LocalDateTime.now();
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getWeight() {
        return weight;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public LocalDate getConsolidationDate() {
        return consolidationDate;
    }

    public void setConsolidationDate(LocalDate consolidationDate) {
        this.consolidationDate = consolidationDate;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Syllabus getSyllabus() {
        return syllabus;
    }

    public void setSyllabus(Syllabus syllabus) {
        this.syllabus = syllabus;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(Long createdBy) {
        this.createdBy = createdBy;
    }

    public Long getModifiedBy() {
        return modifiedBy;
    }

    public void setModifiedBy(Long modifiedBy) {
        this.modifiedBy = modifiedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getModifiedAt() {
        return modifiedAt;
    }

    public void setModifiedAt(LocalDateTime modifiedAt) {
        this.modifiedAt = modifiedAt;
    }

    // Builder Implementation
    public static EvaluationBuilder builder() {
        return new EvaluationBuilder();
    }

    public static class EvaluationBuilder {
        private Long id;
        private String name;
        private Double weight;
        private LocalDate consolidationDate;
        private String description;
        private Syllabus syllabus;
        private String status = "ACTIVE";
        private Long createdBy;
        private Long modifiedBy;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;

        EvaluationBuilder() {
        }

        public EvaluationBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public EvaluationBuilder name(String name) {
            this.name = name;
            return this;
        }

        public EvaluationBuilder weight(Double weight) {
            this.weight = weight;
            return this;
        }

        public EvaluationBuilder consolidationDate(LocalDate consolidationDate) {
            this.consolidationDate = consolidationDate;
            return this;
        }

        public EvaluationBuilder description(String description) {
            this.description = description;
            return this;
        }

        public EvaluationBuilder syllabus(Syllabus syllabus) {
            this.syllabus = syllabus;
            return this;
        }

        public EvaluationBuilder status(String status) {
            this.status = status;
            return this;
        }

        public EvaluationBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public EvaluationBuilder modifiedBy(Long modifiedBy) {
            this.modifiedBy = modifiedBy;
            return this;
        }

        public EvaluationBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public EvaluationBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public Evaluation build() {
            return new Evaluation(id, name, weight, consolidationDate, description, syllabus, status, createdBy, modifiedBy, createdAt, modifiedAt);
        }

        public String toString() {
            return "Evaluation.EvaluationBuilder(id=" + this.id + ", name=" + this.name + ", weight=" + this.weight + ", consolidationDate=" + this.consolidationDate + ", description=" + this.description + ", syllabus=" + this.syllabus + ", status=" + this.status + ", createdBy=" + this.createdBy + ", modifiedBy=" + this.modifiedBy + ", createdAt=" + this.createdAt + ", modifiedAt=" + this.modifiedAt + ")";
        }
    }
}
