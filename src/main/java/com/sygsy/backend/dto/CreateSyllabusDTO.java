package com.sygsy.backend.dto;

public class CreateSyllabusDTO {
    private String professorEmail;
    private Long academicPeriodId; // Reference to AcademicPeriod
    private String academicPeriod; // Alternative: Name of AcademicPeriod (e.g. "2025-I")
    private String courseName;     // Optional, for identification
    private String courseCode;     // Optional

    public CreateSyllabusDTO() {
    }

    public CreateSyllabusDTO(String professorEmail, Long academicPeriodId, String academicPeriod, String courseName, String courseCode) {
        this.professorEmail = professorEmail;
        this.academicPeriodId = academicPeriodId;
        this.academicPeriod = academicPeriod;
        this.courseName = courseName;
        this.courseCode = courseCode;
    }

    public String getProfessorEmail() {
        return professorEmail;
    }

    public void setProfessorEmail(String professorEmail) {
        this.professorEmail = professorEmail;
    }

    public Long getAcademicPeriodId() {
        return academicPeriodId;
    }

    public void setAcademicPeriodId(Long academicPeriodId) {
        this.academicPeriodId = academicPeriodId;
    }

    public String getAcademicPeriod() {
        return academicPeriod;
    }

    public void setAcademicPeriod(String academicPeriod) {
        this.academicPeriod = academicPeriod;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }
}
