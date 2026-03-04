import api from '@/lib/api';
import type {
    EnrollmentDto,
    CreateEnrollmentDto,
    UpdateProgressDto,
} from '@/types/dtos';

export const enrollmentService = {
    /**
     * GET /api/enrollments/{studentId}
     */
    async getByStudent(studentId: string): Promise<EnrollmentDto[]> {
        const response = await api.get<EnrollmentDto[]>(`/enrollments/student/${studentId}`);
        return response.data;
    },

    /**
     * POST /api/enrollments
     */
    async enroll(dto: CreateEnrollmentDto): Promise<EnrollmentDto> {
        const response = await api.post<EnrollmentDto>('/enrollments', dto);
        return response.data;
    },

    /**
     * PUT /api/enrollments/{id}/progress
     */
    async updateProgress(id: string, dto: UpdateProgressDto): Promise<void> {
        await api.put(`/enrollments/${id}/progress`, dto);
    },
};
