/**
 * Token Manager — stores access token in memory, refresh token in localStorage.
 *
 * Access token is kept in-memory (more secure — not accessible to XSS via cookies).
 * Refresh token in localStorage as interim until backend supports httpOnly Set-Cookie.
 */

let accessToken: string | null = null;

const REFRESH_TOKEN_KEY = 'lms_refresh_token';

export const tokenManager = {
    getAccessToken(): string | null {
        return accessToken;
    },

    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setTokens(access: string, refresh: string): void {
        accessToken = access;
        if (typeof window !== 'undefined') {
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
        }
    },

    clearTokens(): void {
        accessToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            localStorage.removeItem('user');
        }
    },

    /**
     * Decode a JWT's payload without an external library.
     * Returns the parsed claims object.
     */
    decodeJwt(token: string): Record<string, unknown> {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch {
            return {};
        }
    },

    /**
     * Check if the current access token is expired (with 30s buffer).
     */
    isAccessTokenExpired(): boolean {
        if (!accessToken) return true;
        const claims = this.decodeJwt(accessToken);
        const exp = claims.exp as number | undefined;
        if (!exp) return true;
        return Date.now() >= (exp - 30) * 1000;
    },
};
