import axios from 'axios';
import { tokenManager } from '@/lib/tokenManager';
import { getLoginPath } from '@/lib/getLoginPath';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://lmsapi-ojw1.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag to prevent multiple concurrent refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// ── Request interceptor: attach access token ──
api.interceptors.request.use(
    (config) => {
        const token = tokenManager.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 with token refresh ──
api.interceptors.response.use(
    (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Only attempt refresh on 401, and not for auth endpoints themselves
        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url?.includes('/Auth/')
        ) {
            console.warn(`[API Error] ${error.response?.status} ${error.config.url}`, error.response?.data);
            return Promise.reject(error);
        }

        if (isRefreshing) {
            // Queue this request until the refresh completes
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = getLoginPath();
            }
            return Promise.reject(error);
        }

        try {
            const { data } = await axios.post(
                `${api.defaults.baseURL}/Auth/refresh`,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            tokenManager.setTokens(data.accessToken, data.refreshToken);
            processQueue(null, data.accessToken);

            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            tokenManager.clearTokens();
            if (typeof window !== 'undefined') {
                window.location.href = getLoginPath();
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;
