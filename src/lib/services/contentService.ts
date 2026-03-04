import api from '@/lib/api';
import type {
    SubjectDto,
    CreateSubjectDto,
    ModuleDto,
    CreateModuleDto,
    LessonDto,
    CreateLessonDto,
    ContentBlockDto,
    CreateContentBlockDto,
} from '@/types/dtos';

// ── Subjects ──

export const subjectService = {
    async getAll(): Promise<SubjectDto[]> {
        const response = await api.get<SubjectDto[]>('/subjects');
        return response.data;
    },

    async getById(id: string): Promise<SubjectDto> {
        const response = await api.get<SubjectDto>(`/subjects/${id}`);
        return response.data;
    },

    async create(dto: CreateSubjectDto): Promise<SubjectDto> {
        const response = await api.post<SubjectDto>('/subjects', dto);
        return response.data;
    },
};

// ── Modules ──

export const moduleService = {
    async getBySubject(subjectId: string): Promise<ModuleDto[]> {
        const response = await api.get<ModuleDto[]>(`/modules/subject/${subjectId}`);
        return response.data;
    },

    async getById(id: string): Promise<ModuleDto> {
        const response = await api.get<ModuleDto>(`/modules/${id}`);
        return response.data;
    },

    async create(dto: CreateModuleDto): Promise<ModuleDto> {
        const response = await api.post<ModuleDto>('/modules', dto);
        return response.data;
    },
};

// ── Lessons ──

export const lessonService = {
    async getByModule(moduleId: string): Promise<LessonDto[]> {
        const response = await api.get<LessonDto[]>(`/lessons/module/${moduleId}`);
        return response.data;
    },

    async getById(id: string): Promise<LessonDto> {
        const response = await api.get<LessonDto>(`/lessons/${id}`);
        return response.data;
    },

    async create(dto: CreateLessonDto): Promise<LessonDto> {
        const response = await api.post<LessonDto>('/lessons', dto);
        return response.data;
    },
};

// ── Content Blocks ──

export const contentBlockService = {
    async getByLesson(lessonId: string): Promise<ContentBlockDto[]> {
        const response = await api.get<ContentBlockDto[]>(`/contentblocks/lesson/${lessonId}`);
        return response.data;
    },

    async getById(id: string): Promise<ContentBlockDto> {
        const response = await api.get<ContentBlockDto>(`/contentblocks/${id}`);
        return response.data;
    },

    async create(dto: CreateContentBlockDto): Promise<ContentBlockDto> {
        const response = await api.post<ContentBlockDto>('/contentblocks', dto);
        return response.data;
    },
};
