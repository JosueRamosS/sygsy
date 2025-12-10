import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginRequest, AuthResponse } from '../types/auth';
import api from '../api/client';
import toast from 'react-hot-toast';
import { getRoleDisplayName } from '../utils/roleUtils';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored token/user on mount
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('user');
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: LoginRequest) => {
        try {
            const response = await api.post<AuthResponse>('/auth/login', credentials);
            const { token, ...userData } = response.data;

            // Normalize role to match User interface
            const userToStore: User = {
                id: userData.id,
                username: userData.username,
                fullName: userData.username, // Using username as fallback for fullname if backend response varies
                role: userData.role as 'COORDINATOR' | 'PROFESSOR',
                career: userData.career
            };

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(userToStore));
            setUser(userToStore);

            toast.success(`Bienvenido, ${getRoleDisplayName(userToStore.role, userToStore.career)}`);
        } catch (error: any) {
            console.error("Login failed", error);
            toast.error('Credenciales inválidas');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
