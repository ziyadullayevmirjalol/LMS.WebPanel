'use client';

import Link from 'next/link';
import { GraduationCap, BookMarked, Shield } from 'lucide-react';

const roles = [
    {
        title: 'Student',
        description: 'Access courses, take quizzes, and track your progress.',
        href: '/student/login',
        icon: GraduationCap,
        color: 'indigo',
        gradient: 'from-indigo-500 to-blue-600',
    },
    {
        title: 'Publisher',
        description: 'Create and manage subjects, modules, and lessons.',
        href: '/publisher/login',
        icon: BookMarked,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        title: 'Admin',
        description: 'Manage publishers and oversee the platform.',
        href: '/admin/login',
        icon: Shield,
        color: 'amber',
        gradient: 'from-amber-500 to-orange-600',
    },
];

export default function LoginSelectorPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center py-12 px-4">
            <div className="mb-10 text-center">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-5">
                    <span className="text-white text-3xl font-black">L</span>
                </div>
                <h1 className="text-3xl font-extrabold text-white mb-2">Welcome to LMS</h1>
                <p className="text-indigo-200/60 text-sm">Choose your role to sign in</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl w-full">
                {roles.map((role) => (
                    <Link
                        key={role.title}
                        href={role.href}
                        className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.03] shadow-lg"
                    >
                        <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${role.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            <role.icon className="text-white" size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{role.title}</h3>
                        <p className="text-xs text-indigo-200/50">{role.description}</p>
                    </Link>
                ))}
            </div>

            <p className="mt-10 text-xs text-indigo-200/40">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-2">
                    Register here
                </Link>
            </p>
        </div>
    );
}
