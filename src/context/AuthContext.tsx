'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { tokenManager } from '@/lib/tokenManager';
import { authService } from '@/lib/services/authService';
import type { LoginDto } from '@/types/dtos';

export type UserRole = 'Student' | 'Publisher' | 'Admin';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
}

export interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (dto: LoginDto) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Extract user from JWT claims.
 */
function userFromToken(token: string): User | null {
    const claims = tokenManager.decodeJwt(token);
    if (!claims.sub) return null;

    return {
        id: claims.sub as string,
        email: (claims.email ?? claims.Email ?? '') as string,
        fullName: (claims.name ?? claims.Name ?? claims.fullName ?? '') as string,
        role: (claims.role ?? claims.Role ?? 'Student') as UserRole,
    };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // ── Restore session on mount ──
    useEffect(() => {
        const restoreSession = async () => {
            // If we still have an access token in memory, use it
            const existingToken = tokenManager.getAccessToken();
            if (existingToken && !tokenManager.isAccessTokenExpired()) {
                const u = userFromToken(existingToken);
                setUser(u);
                setIsLoading(false);
                return;
            }

            // Otherwise try to refresh using stored refresh token
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
                try {
                    const result = await authService.refreshToken();
                    if (result) {
                        const u = userFromToken(result.accessToken);
                        setUser(u);
                        setIsLoading(false);
                        return;
                    }
                } catch {
                    // Refresh failed — clear everything
                    tokenManager.clearTokens();
                }
            }

            setUser(null);
            setIsLoading(false);
        };

        restoreSession();
    }, []);

    // ── Login ──
    const login = useCallback(
        async (dto: LoginDto) => {
            const response = await authService.login(dto);
            const u = userFromToken(response.accessToken);
            setUser(u);

            // Redirect based on role
            if (u?.role === 'Admin') {
                router.push('/admin');
            } else if (u?.role === 'Publisher') {
                router.push('/publisher');
            } else {
                router.push('/');
            }
        },
        [router]
    );

    // ── Logout ──
    const logout = useCallback(async () => {
        try {
            await authService.revokeToken();
        } catch {
            // Even if revoke fails, clear local state
        }
        tokenManager.clearTokens();
        setUser(null);
        router.push('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
