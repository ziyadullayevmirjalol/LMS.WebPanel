'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
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
                setError('Login succeeded but failed to read user data from token. Check console for JWT debug info.');
                setIsLoading(false);
            } else if (u.role !== 'Admin') {
                setError(`This portal is for Admins only. You logged in as ${u.role}.`);
                setIsLoading(false);
            }
            // If u.role === 'Admin', the useEffect above will handle redirect
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <div className="h-14 w-14 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <Lock className="text-white h-8 w-8" />
                    </div>
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white">
                    Admin Portal
                </h2>
                <p className="mt-2 text-center text-sm text-red-200/70">
                    Sign in with your administrator credentials
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white/5 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-white/10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label className="block text-sm font-medium text-red-100">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-red-400/50" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-red-300/40 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                                    placeholder="admin@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-red-100">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-lg">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-red-400/50" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 sm:text-sm rounded-lg py-2.5 px-3 bg-white/10 border border-white/10 text-white placeholder-red-300/40 focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
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
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-lg shadow-red-500/25 text-sm font-semibold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900 disabled:opacity-50 transition"
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
                                    'Sign in as Admin'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/auth"
                            className="inline-flex items-center gap-2 text-sm font-medium text-red-300/70 hover:text-red-200 transition"
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

