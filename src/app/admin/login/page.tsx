'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, login, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const landingPageUrl = process.env.NEXT_PUBLIC_LANDING_PAGE_URL || 'https://lms-jade-rho-79.vercel.app/';

    // Redirect when user state is set
    useEffect(() => {
        if (authLoading) return;
        if (user) {
            if (user.role === 'Admin') {
                router.push('/admin');
            } else {
                setError(`You are logged in as ${user.role}, not Admin. Please use the correct login page.`);
            }
        }
    }, [user, authLoading, router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const u = await login({ email, password });
            if (!u) {
                setError('Login succeeded but failed to read user data from token.');
                setIsLoading(false);
            } else if (u.role !== 'Admin') {
                setError(`This portal is for Admins only. You logged in as ${u.role}.`);
                setIsLoading(false);
            }
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(
                axiosError?.response?.data?.message ||
                'Login failed. Please check your credentials.'
            );
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-red-600 blur-[150px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-600 blur-[120px] rounded-full" />
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="h-16 w-16 rounded-2xl bg-red-600 flex items-center justify-center shadow-xl shadow-red-500/20 border border-white/10">
                        <span className="text-white text-3xl font-black">L</span>
                    </div>
                </div>
                <h2 className="text-center text-4xl font-extrabold text-white tracking-tight">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-red-200/50">
                    Secure management access for authorized personnel
                </p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-slate-900/50 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-3xl sm:px-12 border border-slate-800">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Admin Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-red-400/50" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                                    placeholder="admin@platform.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Secret Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-red-400/50" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-3 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm animate-shake">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-red-500/20 text-sm font-bold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 disabled:opacity-50 transition-all active:scale-[0.98]"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Authorizing...
                                </span>
                            ) : (
                                'Enter System'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col items-center gap-4">
                        <Link
                            href="/auth"
                            className="inline-flex items-center gap-2 text-sm font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Change Access Portal
                        </Link>
                        <a
                            href={landingPageUrl}
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                        >
                            Back to Landing Page
                        </a>
                    </div>
                </div>
            </div>
            <div className="mt-8 text-center relative z-10 px-4">
                <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
                    Authorized Admin Access Only • Platform Monitor v2.0
                </p>
            </div>
        </div>
    );
}

