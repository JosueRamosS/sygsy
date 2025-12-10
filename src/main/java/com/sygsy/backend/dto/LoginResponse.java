package com.sygsy.backend.dto;

public class LoginResponse {
    private String token;
    private String username;
    private String role;
    private String career; // Added field
    private Long expiresIn;

    public LoginResponse() {
    }

    public LoginResponse(String token, String username, String role, String career, Long expiresIn) {
        this.token = token;
        this.username = username;
        this.role = role;
        this.career = career;
        this.expiresIn = expiresIn;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getCareer() {
        return career;
    }

    public void setCareer(String career) {
        this.career = career;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    // Builder
    public static LoginResponseBuilder builder() {
        return new LoginResponseBuilder();
    }

    public static class LoginResponseBuilder {
        private String token;
        private String username;
        private String role;
        private String career;
        private Long expiresIn;

        LoginResponseBuilder() {
        }

        public LoginResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public LoginResponseBuilder username(String username) {
            this.username = username;
            return this;
        }

        public LoginResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public LoginResponseBuilder career(String career) {
            this.career = career;
            return this;
        }

        public LoginResponseBuilder expiresIn(Long expiresIn) {
            this.expiresIn = expiresIn;
            return this;
        }

        public LoginResponse build() {
            return new LoginResponse(token, username, role, career, expiresIn);
        }

        public String toString() {
            return "LoginResponse.LoginResponseBuilder(token=" + this.token + ", username=" + this.username + ", role=" + this.role + ", career=" + this.career + ", expiresIn=" + this.expiresIn + ")";
        }
    }
}
