import api from './client';

export interface Career {
    id: number;
    name: string;
}

export const careerApi = {
    getAll: async () => {
        const response = await api.get<Career[]>('/careers');
        return response.data;
    },
    create: async (name: string) => {
        const response = await api.post<Career>('/careers', { name });
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/careers/${id}`);
    }
};
