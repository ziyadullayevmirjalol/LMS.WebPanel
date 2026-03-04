import api from '@/lib/api';
import type {
    EnrollmentDto,
    EnrollmentCreateDto,
} from '@/types/dtos';

export const enrollmentService = {
    /**
     * GET /api/Enrollments/student/{studentId}
     */
    async getByStudent(studentId: string): Promise<EnrollmentDto[]> {
        const response = await api.get<EnrollmentDto[]>(`/Enrollments/student/${studentId}`);
        return response.data;
    },

    /**
     * POST /api/Enrollments
     */
    async enroll(dto: EnrollmentCreateDto): Promise<EnrollmentDto> {
        const response = await api.post<EnrollmentDto>('/Enrollments', dto);
        return response.data;
    },

    /**
     * PATCH /api/Enrollments/{id}/progress
     */
    async updateProgress(id: string, progress: number): Promise<void> {
        await api.patch(`/Enrollments/${id}/progress`, progress);
    },
};
