package com.sygsy.backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "syllabi")
public class Syllabus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // I. DATOS GENERALES
    private String faculty;
    private String career;
    
    @ManyToOne
    @JoinColumn(name = "academic_period_id", nullable = false)
    private AcademicPeriod academicPeriod;
    
    private String semester;
    private Integer credits;
    private Integer totalHours;
    private Integer theoryHours;
    private Integer practiceHours;
    private String trainingArea; // Área de formación
    private String courseCode;
    private String courseName;
    private String courseType; // Tipo de curso
    private String prerequisites;

    @ManyToOne
    @JoinColumn(name = "professor_id")
    private User professor;

    private String professorEmail; // Redundant but requested in "Datos Generales"
    
    @ManyToOne
    @JoinColumn(name = "coordinator_id")
    private User coordinator; // Coordinator who created the syllabus

    // II. COMPETENCIA DEL CURSO
    @Column(columnDefinition = "TEXT")
    private String courseCompetence;

    // III. COMPETENCIA DEL PERFIL DE EGRESO
    @Column(columnDefinition = "TEXT")
    private String profileCompetence;

    // IV. COMPETENCIAS PREVIAS
    @Column(columnDefinition = "TEXT")
    private String previousCompetence;

    // V. SUMILLA
    @Column(columnDefinition = "TEXT")
    private String sumilla;

    // VI. UNIDADES DE APRENDIZAJE
    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SyllabusUnit> units = new ArrayList<>();

    // VII. BIBLIOGRAFÍA
    @Column(columnDefinition = "TEXT")
    private String bibliography;

    // VIII. ACTIVIDADES (Assuming generic text for now, or could be a list)
    @Column(columnDefinition = "TEXT")
    private String activities;

    // IX. CRITERIOS DE EVALUACIÓN
    @OneToMany(mappedBy = "syllabus", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evaluation> evaluations = new ArrayList<>();

    // Workflow Status
    @Enumerated(EnumType.STRING)
    private SyllabusStatus workflowStatus = SyllabusStatus.CREATED;

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

    public Syllabus() {
    }

    public Syllabus(Long id, String faculty, String career, AcademicPeriod academicPeriod, String semester, Integer credits, Integer totalHours, Integer theoryHours, Integer practiceHours, String trainingArea, String courseCode, String courseName, String courseType, String prerequisites, User professor, String professorEmail, User coordinator, String courseCompetence, String profileCompetence, String previousCompetence, String sumilla, List<SyllabusUnit> units, String bibliography, String activities, List<Evaluation> evaluations, SyllabusStatus workflowStatus, String status, Long createdBy, Long modifiedBy, LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.id = id;
        this.faculty = faculty;
        this.career = career;
        this.academicPeriod = academicPeriod;
        this.semester = semester;
        this.credits = credits;
        this.totalHours = totalHours;
        this.theoryHours = theoryHours;
        this.practiceHours = practiceHours;
        this.trainingArea = trainingArea;
        this.courseCode = courseCode;
        this.courseName = courseName;
        this.courseType = courseType;
        this.prerequisites = prerequisites;
        this.professor = professor;
        this.professorEmail = professorEmail;
        this.coordinator = coordinator;
        this.courseCompetence = courseCompetence;
        this.profileCompetence = profileCompetence;
        this.previousCompetence = previousCompetence;
        this.sumilla = sumilla;
        this.units = units != null ? units : new ArrayList<>();
        this.bibliography = bibliography;
        this.activities = activities;
        this.evaluations = evaluations != null ? evaluations : new ArrayList<>();
        this.workflowStatus = workflowStatus != null ? workflowStatus : SyllabusStatus.CREATED;
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

    public String getFaculty() {
        return faculty;
    }

    public void setFaculty(String faculty) {
        this.faculty = faculty;
    }

    public String getCareer() {
        return career;
    }

    public void setCareer(String career) {
        this.career = career;
    }

    public AcademicPeriod getAcademicPeriod() {
        return academicPeriod;
    }

    public void setAcademicPeriod(AcademicPeriod academicPeriod) {
        this.academicPeriod = academicPeriod;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Integer getTotalHours() {
        return totalHours;
    }

    public void setTotalHours(Integer totalHours) {
        this.totalHours = totalHours;
    }

    public Integer getTheoryHours() {
        return theoryHours;
    }

    public void setTheoryHours(Integer theoryHours) {
        this.theoryHours = theoryHours;
    }

    public Integer getPracticeHours() {
        return practiceHours;
    }

    public void setPracticeHours(Integer practiceHours) {
        this.practiceHours = practiceHours;
    }

    public String getTrainingArea() {
        return trainingArea;
    }

    public void setTrainingArea(String trainingArea) {
        this.trainingArea = trainingArea;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseType() {
        return courseType;
    }

    public void setCourseType(String courseType) {
        this.courseType = courseType;
    }

    public String getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(String prerequisites) {
        this.prerequisites = prerequisites;
    }

    public User getProfessor() {
        return professor;
    }

    public void setProfessor(User professor) {
        this.professor = professor;
    }

    public String getProfessorEmail() {
        return professorEmail;
    }

    public void setProfessorEmail(String professorEmail) {
        this.professorEmail = professorEmail;
    }

    public User getCoordinator() {
        return coordinator;
    }

    public void setCoordinator(User coordinator) {
        this.coordinator = coordinator;
    }

    public String getCourseCompetence() {
        return courseCompetence;
    }

    public void setCourseCompetence(String courseCompetence) {
        this.courseCompetence = courseCompetence;
    }

    public String getProfileCompetence() {
        return profileCompetence;
    }

    public void setProfileCompetence(String profileCompetence) {
        this.profileCompetence = profileCompetence;
    }

    public String getPreviousCompetence() {
        return previousCompetence;
    }

    public void setPreviousCompetence(String previousCompetence) {
        this.previousCompetence = previousCompetence;
    }

    public String getSumilla() {
        return sumilla;
    }

    public void setSumilla(String sumilla) {
        this.sumilla = sumilla;
    }

    public List<SyllabusUnit> getUnits() {
        return units;
    }

    public void setUnits(List<SyllabusUnit> units) {
        this.units = units;
    }

    public String getBibliography() {
        return bibliography;
    }

    public void setBibliography(String bibliography) {
        this.bibliography = bibliography;
    }

    public String getActivities() {
        return activities;
    }

    public void setActivities(String activities) {
        this.activities = activities;
    }

    public List<Evaluation> getEvaluations() {
        return evaluations;
    }

    public void setEvaluations(List<Evaluation> evaluations) {
        this.evaluations = evaluations;
    }

    public SyllabusStatus getWorkflowStatus() {
        return workflowStatus;
    }

    public void setWorkflowStatus(SyllabusStatus workflowStatus) {
        this.workflowStatus = workflowStatus;
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

    public enum SyllabusStatus {
        CREATED,    // Uploaded by Coordinator
        ASSIGNED,   // Assigned to Professor (might be same as Created if assigned on upload)
        SUBMITTED,  // Professor filled and sent back
        APPROVED,   // Coordinator approved
        RETURNED    // Coordinator returned for corrections
    }

    // Builder
    public static SyllabusBuilder builder() {
        return new SyllabusBuilder();
    }

    public static class SyllabusBuilder {
        private Long id;
        private String faculty;
        private String career;
        private AcademicPeriod academicPeriod;
        private String semester;
        private Integer credits;
        private Integer totalHours;
        private Integer theoryHours;
        private Integer practiceHours;
        private String trainingArea;
        private String courseCode;
        private String courseName;
        private String courseType;
        private String prerequisites;
        private User professor;
        private String professorEmail;
        private User coordinator;
        private String courseCompetence;
        private String profileCompetence;
        private String previousCompetence;
        private String sumilla;
        private List<SyllabusUnit> units;
        private String bibliography;
        private String activities;
        private List<Evaluation> evaluations;
        private SyllabusStatus workflowStatus = SyllabusStatus.CREATED;
        private String status = "ACTIVE";
        private Long createdBy;
        private Long modifiedBy;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;

        SyllabusBuilder() {
        }

        public SyllabusBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public SyllabusBuilder faculty(String faculty) {
            this.faculty = faculty;
            return this;
        }

        public SyllabusBuilder career(String career) {
            this.career = career;
            return this;
        }

        public SyllabusBuilder academicPeriod(AcademicPeriod academicPeriod) {
            this.academicPeriod = academicPeriod;
            return this;
        }

        public SyllabusBuilder semester(String semester) {
            this.semester = semester;
            return this;
        }

        public SyllabusBuilder credits(Integer credits) {
            this.credits = credits;
            return this;
        }

        public SyllabusBuilder totalHours(Integer totalHours) {
            this.totalHours = totalHours;
            return this;
        }

        public SyllabusBuilder theoryHours(Integer theoryHours) {
            this.theoryHours = theoryHours;
            return this;
        }

        public SyllabusBuilder practiceHours(Integer practiceHours) {
            this.practiceHours = practiceHours;
            return this;
        }

        public SyllabusBuilder trainingArea(String trainingArea) {
            this.trainingArea = trainingArea;
            return this;
        }

        public SyllabusBuilder courseCode(String courseCode) {
            this.courseCode = courseCode;
            return this;
        }

        public SyllabusBuilder courseName(String courseName) {
            this.courseName = courseName;
            return this;
        }

        public SyllabusBuilder courseType(String courseType) {
            this.courseType = courseType;
            return this;
        }

        public SyllabusBuilder prerequisites(String prerequisites) {
            this.prerequisites = prerequisites;
            return this;
        }

        public SyllabusBuilder professor(User professor) {
            this.professor = professor;
            return this;
        }

        public SyllabusBuilder professorEmail(String professorEmail) {
            this.professorEmail = professorEmail;
            return this;
        }

        public SyllabusBuilder coordinator(User coordinator) {
            this.coordinator = coordinator;
            return this;
        }

        public SyllabusBuilder courseCompetence(String courseCompetence) {
            this.courseCompetence = courseCompetence;
            return this;
        }

        public SyllabusBuilder profileCompetence(String profileCompetence) {
            this.profileCompetence = profileCompetence;
            return this;
        }

        public SyllabusBuilder previousCompetence(String previousCompetence) {
            this.previousCompetence = previousCompetence;
            return this;
        }

        public SyllabusBuilder sumilla(String sumilla) {
            this.sumilla = sumilla;
            return this;
        }

        public SyllabusBuilder units(List<SyllabusUnit> units) {
            this.units = units;
            return this;
        }

        public SyllabusBuilder bibliography(String bibliography) {
            this.bibliography = bibliography;
            return this;
        }

        public SyllabusBuilder activities(String activities) {
            this.activities = activities;
            return this;
        }

        public SyllabusBuilder evaluations(List<Evaluation> evaluations) {
            this.evaluations = evaluations;
            return this;
        }

        public SyllabusBuilder workflowStatus(SyllabusStatus workflowStatus) {
            this.workflowStatus = workflowStatus;
            return this;
        }

        public SyllabusBuilder status(String status) {
            this.status = status;
            return this;
        }

        public SyllabusBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public SyllabusBuilder modifiedBy(Long modifiedBy) {
            this.modifiedBy = modifiedBy;
            return this;
        }

        public SyllabusBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public SyllabusBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public Syllabus build() {
            return new Syllabus(id, faculty, career, academicPeriod, semester, credits, totalHours, theoryHours, practiceHours, trainingArea, courseCode, courseName, courseType, prerequisites, professor, professorEmail, coordinator, courseCompetence, profileCompetence, previousCompetence, sumilla, units, bibliography, activities, evaluations, workflowStatus, status, createdBy, modifiedBy, createdAt, modifiedAt);
        }

        public String toString() {
            return "Syllabus.SyllabusBuilder(id=" + this.id + ", faculty=" + this.faculty + ", career=" + this.career + ", academicPeriod=" + this.academicPeriod + ", semester=" + this.semester + ", credits=" + this.credits + ", totalHours=" + this.totalHours + ", theoryHours=" + this.theoryHours + ", practiceHours=" + this.practiceHours + ", trainingArea=" + this.trainingArea + ", courseCode=" + this.courseCode + ", courseName=" + this.courseName + ", courseType=" + this.courseType + ", prerequisites=" + this.prerequisites + ", professor=" + this.professor + ", professorEmail=" + this.professorEmail + ", coordinator=" + this.coordinator + ", courseCompetence=" + this.courseCompetence + ", profileCompetence=" + this.profileCompetence + ", previousCompetence=" + this.previousCompetence + ", sumilla=" + this.sumilla + ", units=" + this.units + ", bibliography=" + this.bibliography + ", activities=" + this.activities + ", evaluations=" + this.evaluations + ", workflowStatus=" + this.workflowStatus + ", status=" + this.status + ", createdBy=" + this.createdBy + ", modifiedBy=" + this.modifiedBy + ", createdAt=" + this.createdAt + ", modifiedAt=" + this.modifiedAt + ")";
        }
    }
}
