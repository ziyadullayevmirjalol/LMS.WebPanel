'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Users, BookOpen } from 'lucide-react';

export default function AdminDashboard() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <div className="min-h-screen bg-slate-50">
                <nav className="bg-white shadow border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-indigo-600">LMS Admin Panel</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-slate-600">Welcome, {user?.fullName}</span>
                                <button
                                    onClick={logout}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
                                    title="Logout"
                                >
                                    <LogOut size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <h1 className="text-2xl font-semibold text-slate-900 mb-6">Dashboard Overview</h1>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Publishers Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                                            <Users className="h-6 w-6 text-indigo-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-slate-500 truncate">Pending Publisher Requests</dt>
                                                <dd>
                                                    <div className="text-lg font-medium text-slate-900">3</div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-indigo-600 hover:text-indigo-900">View all publishers</a>
                                    </div>
                                </div>
                            </div>

                            {/* Subject Stats Card */}
                            <div className="bg-white overflow-hidden shadow rounded-lg border border-slate-200">
                                <div className="p-5">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                                            <BookOpen className="h-6 w-6 text-green-600" />
                                        </div>
                                        <div className="ml-5 w-0 flex-1">
                                            <dl>
                                                <dt className="text-sm font-medium text-slate-500 truncate">Total Subjects Published</dt>
                                                <dd>
                                                    <div className="text-lg font-medium text-slate-900">12</div>
                                                </dd>
                                            </dl>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200">
                                    <div className="text-sm">
                                        <a href="#" className="font-medium text-green-600 hover:text-green-900">View subject catalog</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
