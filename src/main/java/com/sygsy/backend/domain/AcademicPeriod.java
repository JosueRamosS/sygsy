package com.sygsy.backend.domain;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "academic_periods")
public class AcademicPeriod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // e.g., "2025-I"

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @ManyToOne
    @JoinColumn(name = "coordinator_id", nullable = false)
    private User coordinator;

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

    public AcademicPeriod() {
    }

    public AcademicPeriod(Long id, String name, LocalDate startDate, LocalDate endDate, User coordinator, String status, Long createdBy, Long modifiedBy, LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.id = id;
        this.name = name;
        this.startDate = startDate;
        this.endDate = endDate;
        this.coordinator = coordinator;
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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public User getCoordinator() {
        return coordinator;
    }

    public void setCoordinator(User coordinator) {
        this.coordinator = coordinator;
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

    // Builder
    public static AcademicPeriodBuilder builder() {
        return new AcademicPeriodBuilder();
    }

    public static class AcademicPeriodBuilder {
        private Long id;
        private String name;
        private LocalDate startDate;
        private LocalDate endDate;
        private User coordinator;
        private String status = "ACTIVE";
        private Long createdBy;
        private Long modifiedBy;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;

        AcademicPeriodBuilder() {
        }

        public AcademicPeriodBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public AcademicPeriodBuilder name(String name) {
            this.name = name;
            return this;
        }

        public AcademicPeriodBuilder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public AcademicPeriodBuilder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public AcademicPeriodBuilder coordinator(User coordinator) {
            this.coordinator = coordinator;
            return this;
        }

        public AcademicPeriodBuilder status(String status) {
            this.status = status;
            return this;
        }

        public AcademicPeriodBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public AcademicPeriodBuilder modifiedBy(Long modifiedBy) {
            this.modifiedBy = modifiedBy;
            return this;
        }

        public AcademicPeriodBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public AcademicPeriodBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public AcademicPeriod build() {
            return new AcademicPeriod(id, name, startDate, endDate, coordinator, status, createdBy, modifiedBy, createdAt, modifiedAt);
        }

        public String toString() {
            return "AcademicPeriod.AcademicPeriodBuilder(id=" + this.id + ", name=" + this.name + ", startDate=" + this.startDate + ", endDate=" + this.endDate + ", coordinator=" + this.coordinator + ", status=" + this.status + ", createdBy=" + this.createdBy + ", modifiedBy=" + this.modifiedBy + ", createdAt=" + this.createdAt + ", modifiedAt=" + this.modifiedAt + ")";
        }
    }
}
