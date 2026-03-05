// ========== Enums ==========

export enum ContentType {
    Text = 0,
    Video = 1,
    Quiz = 2,
    Pdf = 3,
}

// ========== Auth DTOs ==========

export interface LoginDto {
    email?: string;
    password?: string;
}

export interface RegisterDto {
    email?: string;
    password?: string;
    fullName?: string;
}

export interface UserUpdateDto {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
}

export interface UserDto {
    id: string;
    email: string;
    fullName: string;
    role: string;
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
    isActive: boolean;
    createdAt?: string;
}

// ========== Subject DTOs ==========

export interface SubjectCreateDto {
    title: string;
    description: string;
    publisherId?: string;
}

export interface SubjectDto {
    id: string;
    title: string;
    description: string;
    isPublished: boolean;
    isActive: boolean;
    isDeleted: boolean;
    publisherId: string;
    publisherName?: string;
    createdAt?: string;
}

// ========== Module DTOs ==========

export interface ModuleCreateDto {
    title: string;
    orderIndex?: number;
    subjectId: string;
}

export interface ModuleDto {
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
    subjectId: string;
}


// ========== Lesson DTOs ==========

export interface LessonCreateDto {
    title: string;
    orderIndex?: number;
    moduleId: string;
}

export interface LessonDto {
    id: string;
    title: string;
    description?: string;
    orderIndex: number;
    moduleId: string;
}


// ========== Content Block DTOs ==========

export interface ContentBlockCreateDto {
    type: ContentType;
    contentText?: string;
    mediaUrl?: string;
    orderIndex?: number;
    lessonId: string;
}

export interface ContentBlockDto {
    id: string;
    type: ContentType;
    contentText?: string;
    mediaUrl?: string;
    orderIndex: number;
    lessonId: string;
}


// ========== Quiz DTOs ==========

export interface QuizQuestionCreateDto {
    questionText: string;
    optionA: string;
    optionB: string;
    optionC?: string;
    optionD?: string;
    correctOption: string;
    explanation?: string;
    contentBlockId: string;
}

export interface QuizQuestionDto {
    id: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC?: string;
    optionD?: string;
    correctOption: string;
    explanation?: string;
    contentBlockId: string;
}

export interface QuizSubmitDto {
    studentId: string;
    contentBlockId: string;
    answers?: Record<string, string>;
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

export interface EnrollmentCreateDto {
    studentId: string;
    subjectId: string;
}

export interface EnrollmentDto {
    id: string;
    studentId: string;
    subjectId: string;
    subjectTitle?: string;
    progress: number;
    enrolledAt: string;
}

// ========== Weather Forecast DTOs ==========
export interface WeatherForecast {
    date?: string;
    temperatureC?: number;
    temperatureF?: number;
    summary?: string;
}
