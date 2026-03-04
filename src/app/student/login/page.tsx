'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function StudentLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await login({ email, password });
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(
                axiosError?.response?.data?.message ||
                'Login failed. Please check your credentials and try again.'
            );
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                        <span className="text-white text-2xl font-bold">S</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white">
                    Student Login
                </h2>
                <p className="mt-2 text-center text-sm text-cyan-200/70">
                    Access your courses and learning materials
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-cyan-100">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-cyan-400/50" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-cyan-300/40 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                                    placeholder="student@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-cyan-100">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-cyan-400/50" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-cyan-300/40 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
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
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-cyan-500/25 text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 focus:ring-offset-slate-900 disabled:opacity-50 transition"
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
                                    'Sign in as Student'
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
                                <span className="px-2 bg-transparent text-cyan-300/50">
                                    New student?
                                </span>
                            </div>
                        </div>
                        <div className="mt-4">
                            <Link
                                href="/student/register"
                                className="w-full flex justify-center py-2.5 px-4 border border-white/10 rounded-lg text-sm font-medium text-cyan-200 hover:bg-white/5 transition"
                            >
                                Register as Student
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
