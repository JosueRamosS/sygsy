package com.sygsy.backend.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username; // Can be email

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String fullName;
    
    // Add missing email field if syllabus relies on it, though username might be email.
    // Based on Syllabus code: syllabus.getProfessor().getEmail() was called in PdfService refactor.
    // But original User didn't show getEmail(). It had username. 
    // Wait, PdfService had: syllabus.getProfessor().getEmail() : "" 
    // And earlier in Syllabus.java: private String professorEmail;
    // Let's add getEmail() that returns username just in case, or add actual email field.
    // Original User had username. I'll alias getEmail to getUsername for compatibility if needed or stick to username.
    // Actually, PdfService logic I wrote was: syllabus.getProfessorEmail() != null ? ... : syllabus.getProfessor().getEmail()
    // Let's check where getEmail would come from. `username` is often used as email.
    // I will add a helper method getEmail() that returns username to be safe.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

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

    public User() {
    }

    public User(Long id, String username, String password, String fullName, Role role, String status, Long createdBy, Long modifiedBy, LocalDateTime createdAt, LocalDateTime modifiedAt) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
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

    public enum Role {
        COORDINATOR,
        PROFESSOR
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return username; // Alias for compatibility if code calls getEmail()
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
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
    public static UserBuilder builder() {
        return new UserBuilder();
    }

    public static class UserBuilder {
        private Long id;
        private String username;
        private String password;
        private String fullName;
        private Role role;
        private String status = "ACTIVE";
        private Long createdBy;
        private Long modifiedBy;
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;

        UserBuilder() {
        }

        public UserBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public UserBuilder username(String username) {
            this.username = username;
            return this;
        }

        public UserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public UserBuilder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public UserBuilder role(Role role) {
            this.role = role;
            return this;
        }

        public UserBuilder status(String status) {
            this.status = status;
            return this;
        }

        public UserBuilder createdBy(Long createdBy) {
            this.createdBy = createdBy;
            return this;
        }

        public UserBuilder modifiedBy(Long modifiedBy) {
            this.modifiedBy = modifiedBy;
            return this;
        }

        public UserBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public UserBuilder modifiedAt(LocalDateTime modifiedAt) {
            this.modifiedAt = modifiedAt;
            return this;
        }

        public User build() {
            return new User(id, username, password, fullName, role, status, createdBy, modifiedBy, createdAt, modifiedAt);
        }

        public String toString() {
            return "User.UserBuilder(id=" + this.id + ", username=" + this.username + ", password=" + this.password + ", fullName=" + this.fullName + ", role=" + this.role + ", status=" + this.status + ", createdBy=" + this.createdBy + ", modifiedBy=" + this.modifiedBy + ", createdAt=" + this.createdAt + ", modifiedAt=" + this.modifiedAt + ")";
        }
    }
}
