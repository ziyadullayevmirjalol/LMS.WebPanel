import api from '@/lib/api';
import type { PublisherDto } from '@/types/dtos';

export const adminService = {
    /**
     * GET /api/admin/publishers/pending
     */
    async getPendingPublishers(): Promise<PublisherDto[]> {
        const response = await api.get<PublisherDto[]>('/admin/publishers/pending');
        return response.data;
    },

    /**
     * POST /api/admin/publishers/{id}/approve
     */
    async approvePublisher(id: string): Promise<void> {
        await api.post(`/admin/publishers/${id}/approve`);
    },

    /**
     * POST /api/admin/publishers/{id}/reject
     */
    async rejectPublisher(id: string): Promise<void> {
        await api.post(`/admin/publishers/${id}/reject`);
    },
};
