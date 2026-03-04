import api from '@/lib/api';
import type { PublisherDto } from '@/types/dtos';

export const adminService = {
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
