import api from './client';

export interface SyllabusUnit {
    id: number;
    unitNumber: number;
    title: string;
    startDate: string; // ISO Date "YYYY-MM-DD"
    endDate: string;
    content: string;
    week1Content: string;
    week2Content: string;
    week3Content: string;
    week4Content: string;
    methodology: string;
}

export interface SyllabusEvaluation {
    id: number;
    name: string; // e.g. "Evaluación de Entrada", "Consolidado 1"
    consolidationDate: string; // ISO Date "YYYY-MM-DD"
    description: string;
    percentage?: number; // Optional/Calculated by backend/PDF
}

export type SyllabusStatus = 'CREATED' | 'ASSIGNED' | 'SUBMITTED' | 'APPROVED' | 'RETURNED';

export interface Syllabus {
    id: number;
    courseName: string;
    courseCode: string;
    career: string;
    semester: string;
    credits: number;
    theoryHours: number;
    practiceHours: number;
    faculty: string;
    trainingArea: string;
    courseType: string;
    prerequisites: string;
    professorId: number;
    status: string; // "ACTIVE" etc
    workflowStatus: SyllabusStatus;
    professor?: {
        fullName: string;
        email: string;
    };
    academicPeriod?: {
        id: number;
        name: string;
    };

    // Content Fields
    courseCompetence?: string;
    profileCompetence?: string;
    previousCompetence?: string;
    sumilla?: string;
    bibliography?: string;
    activities?: string;

    // Dynamic lists
    units?: SyllabusUnit[];
    evaluations?: SyllabusEvaluation[];
}

export interface CreateSyllabusDTO {
    courseName: string;
    courseCode: string;
    academicPeriodId: number;
    professorEmail: string;
}

export const syllabusApi = {
    getAll: async () => {
        const response = await api.get<Syllabus[]>('/syllabi');
        return response.data;
    },

    getById: async (id: number) => {
        const response = await api.get<Syllabus>(`/syllabi/${id}`);
        return response.data;
    },

    create: async (data: CreateSyllabusDTO) => {
        const response = await api.post<Syllabus>('/syllabi', data);
        return response.data;
    },

    update: async (id: number, data: Syllabus) => {
        const response = await api.put<Syllabus>(`/syllabi/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: number, status: SyllabusStatus) => {
        const response = await api.post<Syllabus>(`/syllabi/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    },

    getPdf: async (id: number) => {
        const response = await api.get(`/syllabi/${id}/pdf`, { responseType: 'blob' });
        return response.data;
    },

    uploadExcel: async (id: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<Syllabus>(`/syllabi/${id}/upload-excel`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }
};
