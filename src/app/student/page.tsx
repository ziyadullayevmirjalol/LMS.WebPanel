'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { studentNavItems } from '@/components/DashboardLayout';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type { EnrollmentDto } from '@/types/dtos';
import {
    BookOpen,
    PlusCircle,
    Loader2,
    AlertCircle,
    PlayCircle,
    Clock,
    LayoutDashboard,
    Trophy,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState<EnrollmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchEnrollments = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        setError('');
        try {
            const data = await enrollmentService.getByStudent(user.id);
            setEnrollments(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load your courses.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchEnrollments();
    }, [fetchEnrollments]);

    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <DashboardLayout title="My Dashboard" navItems={studentNavItems}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            Welcome back, <span className="text-indigo-400">{user?.fullName?.split(' ')[0]}</span>!
                        </h1>
                        <p className="text-slate-400 mt-1">Ready to continue your learning journey?</p>
                    </div>
                    <Link
                        href="/student/explore"
                        className="inline-flex items-center gap-2 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-600/20 transition-all text-sm"
                    >
                        <PlusCircle size={18} />
                        Explore More
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <BookOpen size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enrolled</p>
                            <h3 className="text-2xl font-black text-white">{enrollments.length} Courses</h3>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Clock size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">In Progress</p>
                            <h3 className="text-2xl font-black text-white">
                                {enrollments.filter(e => e.progress > 0 && e.progress < 100).length} Subjects
                            </h3>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex items-center gap-5">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Trophy size={28} />
                        </div>
                        <div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Completed</p>
                            <h3 className="text-2xl font-black text-white">
                                {enrollments.filter(e => e.progress >= 100).length} Certificates
                            </h3>
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <LayoutDashboard size={20} className="text-indigo-400" />
                    My Current Courses
                </h2>

                {error && (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-8 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                        <div className="h-16 w-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                            <BookOpen size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">You haven&apos;t enrolled in any courses yet</h3>
                        <p className="text-slate-500 text-sm mb-8 mx-auto max-w-xs">
                            Check out our course catalog and start your learning adventure today.
                        </p>
                        <Link
                            href="/student/explore"
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-500 transition shadow-xl shadow-indigo-500/20"
                        >
                            Start Exploring
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {enrollments.map((enrollment) => (
                            <div
                                key={enrollment.id}
                                className="bg-slate-900 rounded-3xl border border-slate-800 p-6 flex flex-col group hover:border-slate-700 transition relative overflow-hidden shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-white">{Math.round(enrollment.progress)}%</span>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Progress</p>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{enrollment.subjectTitle || 'Unnamed Subject'}</h3>

                                {/* Progress Bar */}
                                <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                        style={{ width: `${enrollment.progress}%` }}
                                    />
                                </div>

                                <Link
                                    href={`/student/subjects/${enrollment.subjectId}`}
                                    className="mt-auto flex items-center justify-center gap-2 bg-slate-800 text-white py-3 rounded-2xl font-bold hover:bg-slate-700 transition-all group/btn"
                                >
                                    <PlayCircle size={18} className="text-indigo-400 group-hover/btn:scale-110 transition-transform" />
                                    Continue Learning
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
