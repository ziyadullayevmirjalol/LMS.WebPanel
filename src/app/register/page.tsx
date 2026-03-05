'use client';

import Link from 'next/link';
import { GraduationCap, BookMarked, ArrowRight } from 'lucide-react';

const roles = [
    {
        title: 'Student',
        description: 'Sign up to browse and enroll in professional courses, participate in interactive quizzes, and track your learning progress with our intuitive learner dashboard.',
        href: '/student/register',
        icon: GraduationCap,
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-600',
        badge: 'Learner Account',
    },
    {
        title: 'Publisher',
        description: 'Register as a content creator to build rich educational subjects, manage your students, and share your expertise through our comprehensive publishing tools.',
        href: '/publisher/register',
        icon: BookMarked,
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
        badge: 'Creator Account',
    },
];

export default function RegisterSelectorPage() {
    const landingPageUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://lms-jade-rho-79.vercel.app/';

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden text-center">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 blur-[120px] rounded-full animate-pulse transition-delay-1000" />
            </div>

            <div className="mb-12 text-center relative z-10">
                <div className="h-16 w-16 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-6">
                    <span className="text-white text-3xl font-black">L</span>
                </div>
                <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                    Create Your Account
                </h1>
                <p className="text-slate-400 text-base max-w-sm mx-auto">
                    Join our educational ecosystem. Select the account type that best fits your goals.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full relative z-10 px-4">
                {roles.map((role) => (
                    <Link
                        key={role.title}
                        href={role.href}
                        className="group bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center hover:bg-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02] shadow-2xl"
                    >
                        <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-lg mb-8 group-hover:scale-110 transition-transform`}>
                            <role.icon className="text-white" size={36} />
                        </div>
                        <div className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full mb-4 ${role.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                            {role.badge}
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-4 text-center">{role.title}</h3>
                        <p className="text-sm text-slate-400 leading-relaxed mb-8 text-center">
                            {role.description}
                        </p>
                        <div className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${role.color === 'blue' ? 'text-blue-400' : 'text-emerald-400'
                            }`}>
                            Get Started Today <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 relative z-10">
                <p className="text-sm text-slate-500">
                    Already have an account?{' '}
                    <Link href="/auth" className="text-indigo-400 hover:text-indigo-300 font-bold underline decoration-indigo-500/30 underline-offset-4">
                        Sign In
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
