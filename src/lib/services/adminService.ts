import api from '@/lib/api';
import type { PublisherDto } from '@/types/dtos';

export const adminService = {
    /**
     * GET /api/Admin/publishers
     */
    async getAllPublishers(): Promise<PublisherDto[]> {
        const response = await api.get<PublisherDto[]>('/Admin/publishers');
        return response.data;
    },

    /**
     * GET /api/Admin/students
     */
    async getAllStudents(): Promise<any[]> {
        const response = await api.get<any[]>('/Admin/students');
        return response.data;
    },

    /**
     * PATCH /api/Admin/students/{id}/status
     */
    async toggleStudentStatus(id: string, isActive: boolean): Promise<void> {
        await api.patch(`/Admin/students/${id}/status`, isActive);
    },

    /**
     * GET /api/Admin/subjects
     */
    async getAllSubjects(): Promise<any[]> {
        const response = await api.get<any[]>('/Admin/subjects');
        return response.data;
    },

    /**
     * POST /api/Admin/subjects/{id}/hard-delete
     */
    async hardDeleteSubject(id: string): Promise<void> {
        await api.post(`/Admin/subjects/${id}/hard-delete`);
    },

    /**
     * GET /api/Admin/publishers/pending
     */
    async getPendingPublishers(): Promise<PublisherDto[]> {
        const response = await api.get<PublisherDto[]>('/Admin/publishers/pending');
        return response.data;
    },

    /**
     * POST /api/Admin/publishers/{id}/approve
     */
    async approvePublisher(id: string): Promise<void> {
        const response = await api.post(`/Admin/publishers/${id}/approve`);
        return response?.data;
    },

    /**
     * POST /api/Admin/publishers/{id}/reject
     */
    async rejectPublisher(id: string): Promise<void> {
        const response = await api.post(`/Admin/publishers/${id}/reject`);
        return response?.data;
    },
};
