export interface User {
    id: number;
    username: string;
    fullName: string;
    role: 'COORDINATOR' | 'PROFESSOR';
    career?: string;
    // Add other user fields as needed
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    fullName: string;
    role: string;
    career?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}
