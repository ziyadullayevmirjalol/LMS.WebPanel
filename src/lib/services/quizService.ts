import api from '@/lib/api';
import type {
    QuizQuestionDto,
    QuizQuestionCreateDto,
    QuizSubmitDto,
    QuizAttemptDto,
} from '@/types/dtos';

export const quizService = {
    /**
     * GET /api/quiz/block/{contentBlockId}
     */
    async getQuestions(contentBlockId: string): Promise<QuizQuestionDto[]> {
        const response = await api.get<QuizQuestionDto[]>(`/Quiz/block/${contentBlockId}`);
        return response.data;
    },

    /**
     * POST /api/quiz/question
     */
    async addQuestion(dto: QuizQuestionCreateDto): Promise<QuizQuestionDto> {
        const response = await api.post<QuizQuestionDto>('/Quiz/question', dto);
        return response.data;
    },

    /**
     * POST /api/quiz/submit
     */
    async submitQuiz(dto: QuizSubmitDto): Promise<QuizAttemptDto> {
        const response = await api.post<QuizAttemptDto>('/Quiz/submit', dto);
        return response.data;
    },

    /**
     * GET /api/quiz/attempts/{studentId}/{contentBlockId}
     */
    async getAttempts(studentId: string, contentBlockId: string): Promise<QuizAttemptDto[]> {
        const response = await api.get<QuizAttemptDto[]>(
            `/Quiz/attempts/${studentId}/${contentBlockId}`
        );
        return response.data;
    },
};
