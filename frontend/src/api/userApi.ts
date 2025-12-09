import api from './client';
import type { User } from '../types/auth';

export const userApi = {
    getProfessors: async () => {
        const response = await api.get<User[]>('/users/professors');
        return response.data;
    }
};
