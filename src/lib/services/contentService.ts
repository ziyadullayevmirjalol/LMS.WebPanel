import api from '@/lib/api';
import type {
    SubjectDto,
    SubjectCreateDto,
    ModuleDto,
    ModuleCreateDto,
    LessonDto,
    LessonCreateDto,
    ContentBlockDto,
    ContentBlockCreateDto,
} from '@/types/dtos';

// ── Subjects ──

export const subjectService = {
    async getAll(): Promise<SubjectDto[]> {
        const response = await api.get<SubjectDto[]>('/Subjects');
        return response.data;
    },

    async getById(id: string): Promise<SubjectDto> {
        const response = await api.get<SubjectDto>(`/Subjects/${id}`);
        return response.data;
    },

    async getPublisherSubjects(): Promise<SubjectDto[]> {
        const response = await api.get<SubjectDto[]>('/Subjects/publisher');
        return response.data;
    },

    async create(dto: SubjectCreateDto): Promise<SubjectDto> {
        const response = await api.post<SubjectDto>('/Subjects', dto);
        return response.data;
    },

    async publish(id: string): Promise<void> {
        await api.post(`/Subjects/${id}/publish`);
    },

    async update(id: string, dto: any): Promise<SubjectDto> {
        const response = await api.put<SubjectDto>(`/Subjects/${id}`, dto);
        return response.data;
    },

    async toggleStatus(id: string, isActive: boolean): Promise<void> {
        await api.patch(`/Subjects/${id}/status`, isActive);
    },

    async delete(id: string): Promise<void> {
        await api.post(`/Subjects/${id}/delete`);
    },
};

// ── Modules ──

export const moduleService = {
    async getBySubject(subjectId: string): Promise<ModuleDto[]> {
        const response = await api.get<ModuleDto[]>(`/Modules/subject/${subjectId}`);
        return response.data;
    },

    async getById(id: string): Promise<ModuleDto> {
        const response = await api.get<ModuleDto>(`/Modules/${id}`);
        return response.data;
    },

    async create(dto: ModuleCreateDto): Promise<ModuleDto> {
        const response = await api.post<ModuleDto>('/Modules', dto);
        return response.data;
    },

    async getPublisherModules(): Promise<ModuleDto[]> {
        const response = await api.get<ModuleDto[]>('/Modules/publisher');
        return response.data;
    },

    async update(id: string, dto: any): Promise<ModuleDto> {
        const response = await api.put<ModuleDto>(`/Modules/${id}`, dto);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/Modules/${id}`);
    },
};

// ── Lessons ──

export const lessonService = {
    async getByModule(moduleId: string): Promise<LessonDto[]> {
        const response = await api.get<LessonDto[]>(`/Lessons/module/${moduleId}`);
        return response.data;
    },

    async getById(id: string): Promise<LessonDto> {
        const response = await api.get<LessonDto>(`/Lessons/${id}`);
        return response.data;
    },

    async create(dto: LessonCreateDto): Promise<LessonDto> {
        const response = await api.post<LessonDto>('/Lessons', dto);
        return response.data;
    },

    async getPublisherLessons(): Promise<LessonDto[]> {
        const response = await api.get<LessonDto[]>('/Lessons/publisher');
        return response.data;
    },

    async update(id: string, dto: any): Promise<LessonDto> {
        const response = await api.put<LessonDto>(`/Lessons/${id}`, dto);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/Lessons/${id}`);
    },
};

// ── Content Blocks ──

export const contentBlockService = {
    async getByLesson(lessonId: string): Promise<ContentBlockDto[]> {
        const response = await api.get<ContentBlockDto[]>(`/ContentBlocks/lesson/${lessonId}`);
        return response.data;
    },

    async getById(id: string): Promise<ContentBlockDto> {
        const response = await api.get<ContentBlockDto>(`/ContentBlocks/${id}`);
        return response.data;
    },

    async create(dto: ContentBlockCreateDto): Promise<ContentBlockDto> {
        const response = await api.post<ContentBlockDto>('/ContentBlocks', dto);
        return response.data;
    },
    async update(id: string, dto: any): Promise<ContentBlockDto> {
        const response = await api.put<ContentBlockDto>(`/ContentBlocks/${id}`, dto);
        return response.data;
    },
    async delete(id: string): Promise<void> {
        await api.delete(`/ContentBlocks/${id}`);
    },
};
