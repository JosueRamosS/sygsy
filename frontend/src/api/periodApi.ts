import api from './client';

export interface AcademicPeriod {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
}

export const periodApi = {
    getAll: async () => {
        const response = await api.get<AcademicPeriod[]>('/academic-periods');
        return response.data;
    }
};
