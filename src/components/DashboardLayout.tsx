'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LogOut,
    LayoutDashboard,
    Users,
    BookOpen,
    Layers,
    FileText,
    Puzzle,
    ChevronRight,
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

    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* ── Sidebar ── */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 left-0 z-30">
                {/* Brand */}
                <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
                    <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <span className="text-white text-lg font-bold">L</span>
                    </div>
                    <span className="text-lg font-bold text-white">{title}</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                                    }`}
                            >
                                <span className={isActive ? 'text-indigo-400' : 'text-slate-500'}>
                                    {item.icon}
                                </span>
                                {item.label}
                                {isActive && (
                                    <ChevronRight size={14} className="ml-auto text-indigo-400" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User footer */}
                <div className="p-3 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-indigo-600/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-300">
                                {user?.fullName?.charAt(0)?.toUpperCase() || '?'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">
                                {user?.fullName}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        </div>
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
            <main className="flex-1 ml-64">
                <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
            </main>
        </div>
    );
}

// ── Pre-built nav configurations ──

export const adminNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard size={18} /> },
    { label: 'Publishers', href: '/admin/publishers', icon: <Users size={18} /> },
    { label: 'Subjects', href: '/admin/subjects', icon: <BookOpen size={18} /> },
];

export const publisherNavItems: NavItem[] = [
    { label: 'Dashboard', href: '/publisher', icon: <LayoutDashboard size={18} /> },
    { label: 'My Subjects', href: '/publisher/subjects', icon: <BookOpen size={18} /> },
    { label: 'Modules', href: '/publisher/modules', icon: <Layers size={18} /> },
    { label: 'Lessons', href: '/publisher/lessons', icon: <FileText size={18} /> },
    { label: 'Quizzes', href: '/publisher/quizzes', icon: <Puzzle size={18} /> },
];

export const studentNavItems: NavItem[] = [
    { label: 'My Courses', href: '/student', icon: <LayoutDashboard size={18} /> },
    { label: 'Explore', href: '/student/explore', icon: <BookOpen size={18} /> },
];
