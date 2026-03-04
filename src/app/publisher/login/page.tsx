'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PublisherLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { user, login, isLoading: authLoading } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Redirect when user state is set
    useEffect(() => {
        if (authLoading) return;
        if (user) {
            if (user.role === 'Publisher') {
                router.push('/publisher');
            } else if (user.role === 'Admin') {
                router.push('/admin');
            } else if (user.role === 'Student') {
                router.push('/student');
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
                setError('Login succeeded but failed to read user data from token. Check console for JWT debug info.');
                setIsLoading(false);
            }
            // useEffect above will handle the redirect once user state is set
        } catch (err: unknown) {
            const axiosError = err as { response?: { status?: number; data?: { message?: string } } };
            if (axiosError?.response?.status === 403) {
                setError('Your publisher account is pending approval. Please wait for an admin to approve your account.');
            } else {
                setError(
                    axiosError?.response?.data?.message ||
                    'Login failed. Please check your credentials and try again.'
                );
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-white text-2xl font-bold">P</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white">
                    Publisher Login
                </h2>
                <p className="mt-2 text-center text-sm text-indigo-200/70">
                    Manage your courses and educational content
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-indigo-400/50" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-indigo-300/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="publisher@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-indigo-400/50" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-indigo-300/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-sm">
                                <AlertCircle size={16} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-indigo-500/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 disabled:opacity-50 transition"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign in as Publisher'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-indigo-300/50">
                                    New publisher?
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/publisher/register"
                                className="w-full flex justify-center py-2.5 px-4 border border-white/10 rounded-lg text-sm font-medium text-indigo-200 hover:bg-white/5 transition"
                            >
                                Register as Publisher
                            </Link>
                        </div>
                    </div>

                    <div className="mt-4 text-center">
                        <Link
                            href="/auth"
                            className="inline-flex items-center gap-2 text-sm font-medium text-indigo-300/70 hover:text-indigo-200 transition"
                        >
                            <ArrowLeft size={16} />
                            Back to role selection
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

