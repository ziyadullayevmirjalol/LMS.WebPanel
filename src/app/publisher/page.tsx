'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import { subjectService, moduleService, lessonService } from '@/lib/services/contentService';
import { quizService } from '@/lib/services/quizService';
import { useAuth } from '@/context/AuthContext';
import {
    BookOpen,
    PlusCircle,
    Loader2,
    AlertCircle,
    X,
    ExternalLink,
    Layers,
    FileText,
    Puzzle,
} from 'lucide-react';
import Link from 'next/link';
import type { SubjectDto } from '@/types/dtos';

export default function PublisherDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        subjects: 0,
        modules: 0,
        lessons: 0,
        quizzes: 0,
    });
    const [recentSubjects, setRecentSubjects] = useState<SubjectDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [subjects, modules, lessons, quizzes] = await Promise.all([
                subjectService.getPublisherSubjects(),
                moduleService.getPublisherModules(),
                lessonService.getPublisherLessons(),
                quizService.getPublisherQuizzes(),
            ]);

            setStats({
                subjects: subjects.length,
                modules: modules.length,
                lessons: lessons.length,
                quizzes: quizzes.length,
            });

            // Get last 3 subjects
            setRecentSubjects([...subjects].sort((a: SubjectDto, b: SubjectDto) =>
                new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
            ).slice(0, 3));

        } catch (err) {
            console.error('[PublisherDashboard] Fetch error:', err);
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const statCards = [
        { label: 'Total Subjects', value: stats.subjects, icon: <BookOpen size={20} />, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
        { label: 'Total Modules', value: stats.modules, icon: <Layers size={20} />, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Total Lessons', value: stats.lessons, icon: <FileText size={20} />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Quiz Questions', value: stats.quizzes, icon: <Puzzle size={20} />, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <ProtectedRoute allowedRoles={['Publisher']}>
            <DashboardLayout title="Dashboard" navItems={publisherNavItems}>
                {/* Welcome Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome back, {user?.fullName || 'Publisher'}
                    </h1>
                    <p className="text-slate-400">
                        Here's an overview of your educational content and progress.
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-8 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {statCards.map((stat, idx) => (
                        <div key={idx} className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2.5 ${stat.bg} ${stat.color} rounded-xl`}>
                                    {stat.icon}
                                </div>
                                <span className="text-2xl font-bold text-white">
                                    {loading ? '...' : stat.value}
                                </span>
                            </div>
                            <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                        </div>
                    ))}
                </div>

                {/* Recent Content Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Recent Subjects</h2>
                            <Link href="/publisher/subjects" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1">
                                View all <ExternalLink size={14} />
                            </Link>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                            </div>
                        ) : recentSubjects.length === 0 ? (
                            <div className="bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl p-12 text-center">
                                <BookOpen className="h-10 w-10 text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-500 text-sm">No subjects created yet.</p>
                                <Link href="/publisher/subjects" className="mt-4 inline-block text-indigo-400 text-sm font-medium">Create your first subject</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {recentSubjects.map((subject) => (
                                    <div key={subject.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                <BookOpen size={24} />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-medium">{subject.title}</h3>
                                                <p className="text-xs text-slate-500">Created on {new Date(subject.createdAt || '').toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${subject.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                                {subject.isPublished ? 'Published' : 'Draft'}
                                            </span>
                                            <Link href={`/publisher/subjects/${subject.id}`} className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition">
                                                <ExternalLink size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Access / Help Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white overflow-hidden relative group">
                            <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition duration-500">
                                <PlusCircle size={140} />
                            </div>
                            <h3 className="text-lg font-bold mb-2">Build your course</h3>
                            <p className="text-indigo-100 text-sm mb-6 opacity-80">Ready to share your knowledge? Start by creating a new subject.</p>
                            <Link href="/publisher/subjects" className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-indigo-50 transition relative z-10">
                                Get Started
                            </Link>
                        </div>

                        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                            <h3 className="text-white font-bold mb-4">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Avg. Modules/Subject</span>
                                    <span className="text-white font-medium">{(stats.modules / (stats.subjects || 1)).toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Total Lessons</span>
                                    <span className="text-white font-medium">{stats.lessons}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
