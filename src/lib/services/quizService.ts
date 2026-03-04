import api from '@/lib/api';
import type {
    QuizQuestionDto,
    CreateQuizQuestionDto,
    SubmitQuizDto,
    QuizAttemptDto,
} from '@/types/dtos';

export const quizService = {
    /**
     * GET /api/quiz/block/{contentBlockId}
     */
    async getQuestions(contentBlockId: string): Promise<QuizQuestionDto[]> {
        const response = await api.get<QuizQuestionDto[]>(`/quiz/block/${contentBlockId}`);
        return response.data;
    },

    /**
     * POST /api/quiz/question
     */
    async addQuestion(dto: CreateQuizQuestionDto): Promise<QuizQuestionDto> {
        const response = await api.post<QuizQuestionDto>('/quiz/question', dto);
        return response.data;
    },

    /**
     * POST /api/quiz/submit
     */
    async submitQuiz(dto: SubmitQuizDto): Promise<QuizAttemptDto> {
        const response = await api.post<QuizAttemptDto>('/quiz/submit', dto);
        return response.data;
    },

    /**
     * GET /api/quiz/attempts/{studentId}/{contentBlockId}
     */
    async getAttempts(studentId: string, contentBlockId: string): Promise<QuizAttemptDto[]> {
        const response = await api.get<QuizAttemptDto[]>(
            `/quiz/attempts/${studentId}/${contentBlockId}`
        );
        return response.data;
    },
};
