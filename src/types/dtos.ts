// ========== Auth DTOs ==========

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    email: string;
    password: string;
    fullName: string;
}

export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
}

export interface RefreshRequestDto {
    refreshToken: string;
}

export interface RefreshResponseDto {
    accessToken: string;
    refreshToken: string;
}

export interface RevokeRequestDto {
    refreshToken: string;
}

// ========== Publisher DTOs ==========

export interface PublisherDto {
    id: string;
    email: string;
    fullName: string;
    isApproved: boolean;
    createdAt?: string;
}

// ========== Subject DTOs ==========

export interface SubjectDto {
    id: string;
    title: string;
    description: string;
    publisherId: string;
    publisherName?: string;
    createdAt?: string;
}

export interface CreateSubjectDto {
    title: string;
    description: string;
}

// ========== Module DTOs ==========

export interface ModuleDto {
    id: string;
    title: string;
    description: string;
    order: number;
    subjectId: string;
}

export interface CreateModuleDto {
    title: string;
    description: string;
    order: number;
    subjectId: string;
}

// ========== Lesson DTOs ==========

export interface LessonDto {
    id: string;
    title: string;
    description: string;
    order: number;
    moduleId: string;
}

export interface CreateLessonDto {
    title: string;
    description: string;
    order: number;
    moduleId: string;
}

// ========== Content Block DTOs ==========

export type ContentBlockType = 'Text' | 'Video' | 'Quiz' | 'Pdf';

export interface ContentBlockDto {
    id: string;
    type: ContentBlockType;
    content: string;
    order: number;
    lessonId: string;
}

export interface CreateContentBlockDto {
    type: ContentBlockType;
    content: string;
    order: number;
    lessonId: string;
}

// ========== Quiz DTOs ==========

export interface QuizOptionDto {
    text: string;
    isCorrect: boolean;
}

export interface QuizQuestionDto {
    id: string;
    questionText: string;
    options: QuizOptionDto[];
    contentBlockId: string;
    explanation?: string;
}

export interface CreateQuizQuestionDto {
    questionText: string;
    options: QuizOptionDto[];
    contentBlockId: string;
    explanation?: string;
}

export interface SubmitQuizDto {
    contentBlockId: string;
    answers: { questionId: string; selectedOptionIndex: number }[];
}

export interface QuizAttemptDto {
    id: string;
    studentId: string;
    contentBlockId: string;
    score: number;
    totalQuestions: number;
    attemptedAt: string;
}

// ========== Enrollment DTOs ==========

export interface EnrollmentDto {
    id: string;
    studentId: string;
    subjectId: string;
    subjectTitle?: string;
    progress: number;
    enrolledAt: string;
}

export interface CreateEnrollmentDto {
    studentId: string;
    subjectId: string;
}

export interface UpdateProgressDto {
    progress: number;
}
