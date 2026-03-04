'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getLoginPath } from '@/lib/getLoginPath';
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
    login: (dto: LoginDto) => Promise<User | null>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Extract user from JWT claims.
 * Handles both standard JWT claims and ASP.NET namespaced claims.
 */
function userFromToken(token: string): User | null {
    const claims = tokenManager.decodeJwt(token);

    // ASP.NET uses long URI-based claim types — check both short and long forms
    const id = (
        claims.sub ??
        claims.nameid ??
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
        ''
    ) as string;

    const email = (
        claims.email ??
        claims.Email ??
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ??
        ''
    ) as string;

    const fullName = (
        claims.name ??
        claims.Name ??
        claims.fullName ??
        claims.given_name ??
        claims['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ??
        ''
    ) as string;

    const role = (
        claims.role ??
        claims.Role ??
        claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
        'Student'
    ) as UserRole;

    if (!id) return null;

    return { id, email, fullName, role };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // ── Restore session on mount ──
    useEffect(() => {
        const restoreSession = async () => {
            console.log('[AuthContext] restoreSession started');
            // If we still have an access token in memory, use it
            const existingToken = tokenManager.getAccessToken();
            if (existingToken && !tokenManager.isAccessTokenExpired()) {
                console.log('[AuthContext] Found valid access token in memory');
                const u = userFromToken(existingToken);
                setUser(u);
                setIsLoading(false);
                return;
            }

            // Otherwise try to refresh using stored refresh token
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
                console.log('[AuthContext] Found refresh token, attempting refresh');
                try {
                    const result = await authService.refreshToken();
                    if (result) {
                        console.log('[AuthContext] Refresh succeeded');
                        const u = userFromToken(result.accessToken);
                        setUser(u);
                        setIsLoading(false);
                        return;
                    } else {
                        console.log('[AuthContext] Refresh returned no result');
                    }
                } catch (err) {
                    console.error('[AuthContext] Refresh failed error:', err);
                    // Refresh failed — clear everything
                    tokenManager.clearTokens();
                }
            } else {
                console.log('[AuthContext] No refresh token found');
            }

            console.log('[AuthContext] No session restored, setting user to null');
            setUser(null);
            setIsLoading(false);
        };

        restoreSession();
    }, []);

    // ── Login: sets user state and returns the user. Does NOT redirect. ──
    const login = useCallback(
        async (dto: LoginDto): Promise<User | null> => {
            const response = await authService.login(dto);

            // Debug: log JWT claims so we can see the exact structure
            const claims = tokenManager.decodeJwt(response.accessToken);
            console.log('[Auth] JWT claims:', claims);

            const u = userFromToken(response.accessToken);
            console.log('[Auth] Extracted user:', u);

            setUser(u);
            return u;
        },
        []
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
        router.push(getLoginPath(pathname));
    }, [router, pathname]);

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

