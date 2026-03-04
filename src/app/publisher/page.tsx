'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import { subjectService } from '@/lib/services/contentService';
import { useAuth } from '@/context/AuthContext';
import type { SubjectDto, SubjectCreateDto } from '@/types/dtos';
import {
    BookOpen,
    PlusCircle,
    Loader2,
    AlertCircle,
    X,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function PublisherDashboard() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newSubject, setNewSubject] = useState<SubjectCreateDto>({
        title: '',
        description: '',
    });

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await subjectService.getAll();
            setSubjects(data);
        } catch {
            setError('Failed to load subjects.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleCreateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const created = await subjectService.create(newSubject);
            setSubjects((prev) => [created, ...prev]);
            setNewSubject({ title: '', description: '' });
            setShowCreateModal(false);
        } catch {
            setError('Failed to create subject.');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Publisher']}>
            <DashboardLayout title="Publisher" navItems={publisherNavItems}>
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">My Subjects</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Manage your educational content
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 text-sm font-medium"
                    >
                        <PlusCircle size={16} />
                        Create Subject
                    </button>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Subjects Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-24">
                        <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-1">
                            No subjects yet
                        </h3>
                        <p className="text-sm text-slate-500 mb-6">
                            Create your first subject to start building your course
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-500 transition text-sm font-medium"
                        >
                            <PlusCircle size={16} />
                            Create Subject
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition group"
                            >
                                <div className="h-28 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center">
                                    <BookOpen className="h-10 w-10 text-indigo-500/30 group-hover:text-indigo-500/50 transition" />
                                </div>
                                <div className="p-5">
                                    <h3 className="text-base font-semibold text-white mb-1 truncate">
                                        {subject.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-4 min-h-[2.5rem]">
                                        {subject.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">
                                            {subject.createdAt
                                                ? new Date(subject.createdAt).toLocaleDateString()
                                                : ''}
                                        </span>
                                        <Link
                                            href={`/publisher/subjects/${subject.id}`}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
                                        >
                                            Manage
                                            <ExternalLink size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Create Subject Modal ── */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Create New Subject
                                </h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateSubject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        placeholder="e.g., Introduction to C#"
                                        value={newSubject.title}
                                        onChange={(e) =>
                                            setNewSubject((prev) => ({ ...prev, title: e.target.value }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Description
                                    </label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition resize-none"
                                        placeholder="What will students learn?"
                                        value={newSubject.description}
                                        onChange={(e) =>
                                            setNewSubject((prev) => ({
                                                ...prev,
                                                description: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createLoading}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {createLoading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 size={14} className="animate-spin" />
                                                Creating...
                                            </span>
                                        ) : (
                                            'Create Subject'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
