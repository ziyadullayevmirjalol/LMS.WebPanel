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
     * POST /api/Auth/login
     */
    async login(dto: LoginDto): Promise<AuthResponseDto> {
        const response = await api.post<AuthResponseDto>('/Auth/login', dto);
        const { accessToken, refreshToken } = response.data;
        tokenManager.setTokens(accessToken, refreshToken);
        return response.data;
    },

    /**
     * POST /api/Auth/register/publisher
     */
    async registerPublisher(dto: RegisterDto): Promise<void> {
        await api.post('/Auth/register/publisher', dto);
    },

    /**
     * POST /api/Auth/register/student
     */
    async registerStudent(dto: RegisterDto): Promise<void> {
        await api.post('/Auth/register/student', dto);
    },

    /**
     * POST /api/Auth/refresh
     * Returns new tokens; also updates the token manager.
     */
    async refreshToken(): Promise<RefreshResponseDto | null> {
        const currentRefresh = tokenManager.getRefreshToken();
        if (!currentRefresh) return null;

        try {
            console.log('[Auth] Attempting token refresh...');
            const response = await api.post<RefreshResponseDto>('/Auth/refresh', { refreshToken: currentRefresh });
            const { accessToken, refreshToken } = response.data;
            tokenManager.setTokens(accessToken, refreshToken);
            console.log('[Auth] Token refresh succeeded');
            return response.data;
        } catch (err) {
            console.warn('[Auth] Token refresh failed:', err);
            tokenManager.clearTokens();
            return null;
        }
    },

    /**
     * POST /api/Auth/revoke
     */
    async revokeToken(): Promise<void> {
        const currentRefresh = tokenManager.getRefreshToken();
        if (!currentRefresh) return;

        try {
            await api.post('/Auth/revoke', { refreshToken: currentRefresh });
        } finally {
            tokenManager.clearTokens();
        }
    },

    /**
     * PUT /api/Auth/profile
     */
    async updateProfile(dto: any): Promise<void> {
        await api.put('/Auth/profile', dto);
    },
};
