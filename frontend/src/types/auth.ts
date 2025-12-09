export interface User {
    id: number;
    username: string;
    fullName: string;
    role: 'COORDINATOR' | 'PROFESSOR';
    // Add other user fields as needed
}

export interface AuthResponse {
    token: string;
    type: string;
    id: number;
    username: string;
    role: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}
