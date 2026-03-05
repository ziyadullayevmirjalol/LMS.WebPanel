'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    LogOut,
    LayoutDashboard,
    Users,
    BookOpen,
    Layers,
    FileText,
    Puzzle,
    ChevronRight,
    Menu,
    X,
    User,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    title: string;
    navItems: NavItem[];
}

export default function DashboardLayout({
    children,
    title,
    navItems,
}: DashboardLayoutProps) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Close sidebar on navigation (for mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    // Disable scrolling when sidebar is open on mobile
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isSidebarOpen]);

    const isActiveLink = (href: string) => {
        // Base paths that should only match exactly to avoid highlighting parents (like /admin) while on subpaths
        const basePaths = ['/admin', '/publisher', '/student'];

        if (basePaths.includes(href)) {
            return pathname === href;
        }

        return pathname === href || pathname.startsWith(href + '/');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
            {/* ── Mobile Top Header ── */}
            <header className="md:hidden h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white text-base font-bold">L</span>
                    </div>
                    <span className="text-base font-bold text-white truncate max-w-[150px]">{title}</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                >
                    <Menu size={20} />
                </button>
            </header>

            {/* ── Sidebar Backdrop (Mobile) ── */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out transform 
                           ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                           md:translate-x-0 md:static`}
            >
                {/* Brand & Close (Mobile) */}
                <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <span className="text-white text-lg font-bold">L</span>
                        </div>
                        <span className="text-lg font-bold text-white">{title}</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const active = isActiveLink(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                            >
                                <span className={active ? 'text-indigo-400' : 'text-slate-500'}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {active && (
                                    <ChevronRight size={14} className="ml-auto text-indigo-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <Link
                            href={`/${user?.role?.toLowerCase()}/profile`}
                            className="flex items-center gap-3 flex-1 min-w-0 group"
                        >
                            <div className="h-8 w-8 rounded-full bg-indigo-600/30 flex items-center justify-center group-hover:bg-indigo-600/50 transition-colors">
                                <span className="text-xs font-bold text-indigo-300">
                                    {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                                    {user?.fullName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-800 transition"
                            title="Logout"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── Main content ── */}
            <main className="flex-1 w-full min-w-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
            </main>
        </div>
    );
}

// ── Pre-built nav configurations ──

export const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Publishers', href: '/admin/publishers', icon: <Users size={18} /> },
    { label: 'Students', href: '/admin/students', icon: <Users size={18} /> },
    { label: 'Subjects', href: '/admin/subjects', icon: <BookOpen size={18} /> },
    { label: 'Profile', href: '/admin/profile', icon: <User size={18} /> },
];

export const publisherNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/publisher', icon: <LayoutDashboard size={18} /> },
    { label: 'My Subjects', href: '/publisher/subjects', icon: <BookOpen size={18} /> },
    { label: 'Modules', href: '/publisher/modules', icon: <Layers size={18} /> },
    { label: 'Lessons', href: '/publisher/lessons', icon: <FileText size={18} /> },
    { label: 'Quizzes', href: '/publisher/quizzes', icon: <Puzzle size={18} /> },
    { label: 'Profile', href: '/publisher/profile', icon: <User size={18} /> },
];

export const studentNavItems: NavItem[] = [
    { label: 'My Courses', href: '/student', icon: <LayoutDashboard size={18} /> },
    { label: 'Explore', href: '/student/explore', icon: <BookOpen size={18} /> },
    { label: 'Profile', href: '/student/profile', icon: <User size={18} /> },
];
