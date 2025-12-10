import api from './client';
import type { User } from '../types/auth';

export const userApi = {
    getAll: async () => {
        const response = await api.get<User[]>('/users');
        return response.data;
    },
    getProfessors: async () => {
        const response = await api.get<User[]>('/users/professors');
        return response.data;
    },
    update: async (id: number, data: Partial<User>) => {
        const response = await api.put<User>(`/users/${id}`, data);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    }
};
