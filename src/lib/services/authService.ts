import api from '@/lib/api';
import { tokenManager } from '@/lib/tokenManager';
import type {
    LoginDto,
    RegisterDto,
    AuthResponseDto,
    RefreshResponseDto,
} from '@/types/dtos';

export const authService = {
    /**
     * POST /api/auth/login
     */
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const response = await api.post<AuthResponseDto>('/auth/login', dto);
        const { accessToken, refreshToken } = response.data;
        tokenManager.setTokens(accessToken, refreshToken);
        return response.data;
    },

    /**
     * POST /api/auth/register/publisher
     */
    async registerPublisher(dto: RegisterDto): Promise<void> {
        await api.post('/auth/register/publisher', dto);
    },

    /**
     * POST /api/auth/register/student
     */
    async registerStudent(dto: RegisterDto): Promise<void> {
        await api.post('/auth/register/student', dto);
    },

    /**
     * POST /api/auth/refresh
     * Returns new tokens; also updates the token manager.
     */
    async refreshToken(): Promise<RefreshResponseDto | null> {
        const currentRefresh = tokenManager.getRefreshToken();
        if (!currentRefresh) return null;

        try {
            const response = await api.post<RefreshResponseDto>('/auth/refresh', {
                refreshToken: currentRefresh,
            });
            const { accessToken, refreshToken } = response.data;
            tokenManager.setTokens(accessToken, refreshToken);
            return response.data;
        } catch {
            tokenManager.clearTokens();
            return null;
        }
    },

    /**
     * POST /api/auth/revoke
     */
    async revokeToken(): Promise<void> {
        const currentRefresh = tokenManager.getRefreshToken();
        if (!currentRefresh) return;

        try {
            await api.post('/auth/revoke', { refreshToken: currentRefresh });
        } finally {
            tokenManager.clearTokens();
        }
    },
};
