'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { LogOut, BookOpen, PlusCircle } from 'lucide-react';

export default function PublisherDashboard() {
    const { user, logout } = useAuth();

    return (
        <ProtectedRoute allowedRoles={['Publisher']}>
            <div className="min-h-screen bg-slate-50">
                <nav className="bg-white shadow border-b border-slate-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-indigo-600">LMS Publisher Portal</span>
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
                    <div className="px-4 py-6 sm:px-0 flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-slate-900">My Subjects</h1>
                        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition shadow-sm text-sm font-medium">
                            <PlusCircle size={18} />
                            Create Subject
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-0">
                        {/* Example Subject Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                            <div className="h-32 bg-indigo-100 flex justify-center items-center">
                                <BookOpen className="h-10 w-10 text-indigo-300" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Introduction to C#</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">Learn the basics of C# and .NET development in this comprehensive beginner course.</p>
                                <div className="flex justify-between items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Published
                                    </span>
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900">Manage</button>
                                </div>
                            </div>
                        </div>

                        {/* Another Example Subject Card */}
                        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                            <div className="h-32 bg-slate-100 flex justify-center items-center">
                                <BookOpen className="h-10 w-10 text-slate-300" />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-slate-900 mb-1">Advanced React Patterns</h3>
                                <p className="text-sm text-slate-500 mb-4 line-clamp-2">Deep dive into hooks, context, and performance optimization techniques.</p>
                                <div className="flex justify-between items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                        Draft
                                    </span>
                                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-900">Continue Editing</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
