'use client';

import { useState } from 'react';
import { authService } from '@/lib/services/authService';
import { Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await authService.registerPublisher({ email, password, fullName });
            setSuccess(true);
        } catch (err: unknown) {
            const axiosError = err as { response?: { data?: { message?: string } } };
            setError(
                axiosError?.response?.data?.message ||
                'Registration failed. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white/5 backdrop-blur-xl py-10 px-6 shadow-2xl sm:rounded-2xl border border-white/10 text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 mb-4">
                            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Registration Submitted!</h2>
                        <p className="text-indigo-200/70 mb-6">
                            Your publisher account request has been submitted. An admin will review
                            and approve your account. You&apos;ll be able to log in once approved.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center py-2.5 px-6 border border-transparent rounded-lg shadow-lg shadow-indigo-500/25 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <span className="text-white text-2xl font-bold">L</span>
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white">
                    Register as Publisher
                </h2>
                <p className="mt-2 text-center text-sm text-indigo-200/70">
                    Create and manage educational content on LMS
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        <div>
                            <label className="block text-sm font-medium text-indigo-100">
                                Full Name
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-indigo-400/50" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-indigo-300/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="John Smith"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

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
                                    placeholder="you@example.com"
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
                                    minLength={6}
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-indigo-300/40 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <p className="mt-1 text-xs text-indigo-300/40">Minimum 6 characters</p>
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
                                        Registering...
                                    </span>
                                ) : (
                                    'Create Publisher Account'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-indigo-300 hover:text-indigo-200 transition"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
