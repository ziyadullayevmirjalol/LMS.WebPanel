'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { getLoginPath } from '@/lib/getLoginPath';

export default function ProtectedRoute({
    children,
    allowedRoles,
}: {
    children: React.ReactNode;
    allowedRoles: string[];
}) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!user || !allowedRoles.includes(user.role)) {
                router.push(getLoginPath(pathname));
            }
        }
    }, [user, isLoading, router, allowedRoles, pathname]);

    if (isLoading || !user || !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
                    <span className="text-sm text-indigo-200/50">Loading...</span>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
