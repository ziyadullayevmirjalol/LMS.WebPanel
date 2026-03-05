'use client';

import Link from 'next/link';
import { GraduationCap, BookMarked, Shield, ArrowRight } from 'lucide-react';

const roles = [
    {
        title: 'Student',
        description: 'Join our community of learners. Access expert-led courses, test your knowledge with interactive quizzes, and track your educational journey with detailed progress analytics.',
        href: '/student/login',
        icon: GraduationCap,
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'Learner Portal',
    },
    {
        title: 'Publisher',
        description: 'Share your expertise with the world. Create rich educational subjects, structure them into modules, and reach thousands of students using our powerful course management tools.',
        href: '/publisher/login',
        icon: BookMarked,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
        badge: 'Content Creator',
    },
    {
        title: 'Admin',
        description: 'Platform command center. Oversee system operations, manage user accounts, verify content publisher credentials, and ensure the quality of educational materials.',
        href: '/admin/login',
        icon: Shield,
        color: 'red',
        gradient: 'from-red-500 to-rose-600',
        badge: 'System Admin',
    },
];

export default function LoginSelectorPage() {
    const landingPageUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://lms-jade-rho-79.vercel.app/';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 blur-[120px] rounded-full animate-pulse transition-delay-1000" />
            </div>

            <div className="mb-12 text-center relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-6">
                    <span className="text-white text-3xl font-black">L</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                    Premium Learning Management
                </h1>
                <p className="text-slate-400 text-base max-w-md mx-auto">
                    Select your access portal to continue. Every role is equipped with specialized tools for success.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full relative z-10 px-4">
                {roles.map((role) => (
                    <Link
                        key={role.title}
                        href={role.href}
                        className="group bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col hover:bg-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02] shadow-2xl"
                    >
                        <div className="mb-6 flex justify-between items-start">
                            <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                <role.icon className="text-white" size={28} />
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${role.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                role.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                    'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {role.badge}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">{role.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8 flex-1">
                            {role.description}
                        </p>
                        <div className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${role.color === 'blue' ? 'text-blue-400' :
                            role.color === 'emerald' ? 'text-emerald-400' :
                                'text-red-400'
                            }`}>
                            Sign In Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 relative z-10">
                <p className="text-sm text-slate-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-indigo-500/30 underline-offset-4">
                        Register here
                    </Link>
                </p>

                <div className="h-px w-12 bg-slate-800" />

                <a
                    href={landingPageUrl}
                    className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors py-2 px-4 rounded-full bg-slate-900/50 border border-slate-800"
                >
                    Return to Main Landing Page
                </a>
            </div>
        </div>
    );
}
