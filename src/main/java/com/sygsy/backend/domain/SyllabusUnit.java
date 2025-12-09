package com.sygsy.backend.domain;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "syllabus_units")
public class SyllabusUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer unitNumber; // 1, 2, 3, 4
    private String title; // "UNIDAD I", etc. or custom title

    private LocalDate startDate;
    private LocalDate endDate;
    
    @Column(columnDefinition = "TEXT")
    private String content; // General content for the unit

    // Detailed weekly content (4 weeks per unit)
    @Column(columnDefinition = "TEXT")
    private String week1Content;
    @Column(columnDefinition = "TEXT")
    private String week2Content;
    @Column(columnDefinition = "TEXT")
    private String week3Content;
    @Column(columnDefinition = "TEXT")
    private String week4Content;

    @Column(columnDefinition = "TEXT")
    private String methodology;

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

    public SyllabusUnit() {
    }

    public SyllabusUnit(Long id, Integer unitNumber, String title, LocalDate startDate, LocalDate endDate, String content, String week1Content, String week2Content, String week3Content, String week4Content, String methodology, Syllabus syllabus, String status, Long createdBy, Long modifiedBy, LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.id = id;
        this.unitNumber = unitNumber;
        this.title = title;
        this.startDate = startDate;
        this.endDate = endDate;
        this.content = content;
        this.week1Content = week1Content;
        this.week2Content = week2Content;
        this.week3Content = week3Content;
        this.week4Content = week4Content;
        this.methodology = methodology;
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

    public Integer getUnitNumber() {
        return unitNumber;
    }

    public void setUnitNumber(Integer unitNumber) {
        this.unitNumber = unitNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getWeek1Content() {
        return week1Content;
    }

    public void setWeek1Content(String week1Content) {
        this.week1Content = week1Content;
    }

    public String getWeek2Content() {
        return week2Content;
    }

    public void setWeek2Content(String week2Content) {
        this.week2Content = week2Content;
    }

    public String getWeek3Content() {
        return week3Content;
    }

    public void setWeek3Content(String week3Content) {
        this.week3Content = week3Content;
    }

    public String getWeek4Content() {
        return week4Content;
    }

    public void setWeek4Content(String week4Content) {
        this.week4Content = week4Content;
    }

    public String getMethodology() {
        return methodology;
    }

    public void setMethodology(String methodology) {
        this.methodology = methodology;
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
    public static SyllabusUnitBuilder builder() {
        return new SyllabusUnitBuilder();
    }

    public static class SyllabusUnitBuilder {
        private Long id;
        private Integer unitNumber;
        private String title;
        private LocalDate startDate;
        private LocalDate endDate;
        private String content;
        private String week1Content;
        private String week2Content;
        private String week3Content;
        private String week4Content;
        private String methodology;
        private Syllabus syllabus;
        private String status = "ACTIVE"; // Default
        private Long createdBy;
        private Long modifiedBy;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;

        SyllabusUnitBuilder() {
        }

        public SyllabusUnitBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SyllabusUnitBuilder unitNumber(Integer unitNumber) {
            this.unitNumber = unitNumber;
            return this;
        }

        public SyllabusUnitBuilder title(String title) {
            this.title = title;
            return this;
        }

        public SyllabusUnitBuilder startDate(LocalDate startDate) {
            this.startDate = startDate;
            return this;
        }

        public SyllabusUnitBuilder endDate(LocalDate endDate) {
            this.endDate = endDate;
            return this;
        }

        public SyllabusUnitBuilder content(String content) {
            this.content = content;
            return this;
        }

        public SyllabusUnitBuilder week1Content(String week1Content) {
            this.week1Content = week1Content;
            return this;
        }

        public SyllabusUnitBuilder week2Content(String week2Content) {
            this.week2Content = week2Content;
            return this;
        }

        public SyllabusUnitBuilder week3Content(String week3Content) {
            this.week3Content = week3Content;
            return this;
        }

        public SyllabusUnitBuilder week4Content(String week4Content) {
            this.week4Content = week4Content;
            return this;
        }

        public SyllabusUnitBuilder methodology(String methodology) {
            this.methodology = methodology;
            return this;
        }

        public SyllabusUnitBuilder syllabus(Syllabus syllabus) {
            this.syllabus = syllabus;
            return this;
        }

        public SyllabusUnitBuilder status(String status) {
            this.status = status;
            return this;
        }

        public SyllabusUnitBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public SyllabusUnitBuilder modifiedBy(Long modifiedBy) {
            this.modifiedBy = modifiedBy;
            return this;
        }

        public SyllabusUnitBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SyllabusUnitBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public SyllabusUnit build() {
            return new SyllabusUnit(id, unitNumber, title, startDate, endDate, content, week1Content, week2Content, week3Content, week4Content, methodology, syllabus, status, createdBy, modifiedBy, createdAt, modifiedAt);
        }

        public String toString() {
            return "SyllabusUnit.SyllabusUnitBuilder(id=" + this.id + ", unitNumber=" + this.unitNumber + ", title=" + this.title + ", startDate=" + this.startDate + ", endDate=" + this.endDate + ", content=" + this.content + ", week1Content=" + this.week1Content + ", week2Content=" + this.week2Content + ", week3Content=" + this.week3Content + ", week4Content=" + this.week4Content + ", methodology=" + this.methodology + ", syllabus=" + this.syllabus + ", status=" + this.status + ", createdBy=" + this.createdBy + ", modifiedBy=" + this.modifiedBy + ", createdAt=" + this.createdAt + ", modifiedAt=" + this.modifiedAt + ")";
        }
    }
}
