/**
 * Determine the role-specific login page based on the current URL pathname.
 * Falls back to '/auth' for unknown paths.
 */
export function getLoginPath(pathname?: string): string {
    const path = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

    if (path.startsWith('/admin')) return '/admin/login';
    if (path.startsWith('/publisher')) return '/publisher/login';
    if (path.startsWith('/student')) return '/student/login';
    return '/auth';
}

