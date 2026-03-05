'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import { moduleService, lessonService } from '@/lib/services/contentService';
import type { ModuleDto, LessonDto, LessonCreateDto } from '@/types/dtos';
import {
    FileText,
    PlusCircle,
    Loader2,
    AlertCircle,
    X,
    ArrowLeft,
    ExternalLink,
    Pencil,
    Trash2,
} from 'lucide-react';
import Link from 'next/link';

export default function ModuleDetailPage() {
    const params = useParams();
    const moduleId = params.id as string;

    const [moduleData, setModuleData] = useState<ModuleDto | null>(null);
    const [lessons, setLessons] = useState<LessonDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newLesson, setNewLesson] = useState<Omit<LessonCreateDto, 'moduleId'>>({
        title: '',
        orderIndex: 0,
    });
    const [editingLesson, setEditingLesson] = useState<LessonDto | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [mod, lessonsData] = await Promise.all([
                moduleService.getById(moduleId),
                lessonService.getByModule(moduleId),
            ]);
            setModuleData(mod);
            setLessons(lessonsData);
        } catch {
            setError('Failed to load module data.');
        } finally {
            setLoading(false);
        }
    }, [moduleId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const created = await lessonService.create({
                ...newLesson,
                moduleId,
                orderIndex: lessons.length + 1,
            });
            setLessons((prev) => [...prev, created]);
            setNewLesson({ title: '', orderIndex: 0 });
            setShowCreateModal(false);
        } catch {
            setError('Failed to create lesson.');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUpdateLesson = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLesson) return;
        setUpdateLoading(true);
        try {
            const updated = await lessonService.update(editingLesson.id, {
                title: editingLesson.title,
                orderIndex: editingLesson.orderIndex,
            });
            setLessons((prev) =>
                prev.map((l) => (l.id === updated.id ? updated : l))
            );
            setEditingLesson(null);
        } catch {
            setError('Failed to update lesson.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleDeleteLesson = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        setDeleteLoadingId(id);
        try {
            await lessonService.delete(id);
            setLessons((prev) => prev.filter((l) => l.id !== id));
        } catch {
            setError('Failed to delete lesson.');
        } finally {
            setDeleteLoadingId(null);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Publisher', 'Admin']}>
            <DashboardLayout title="Publisher" navItems={publisherNavItems}>
                {moduleData && (
                    <Link
                        href={`/publisher/subjects/${moduleData.subjectId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition mb-6"
                    >
                        <ArrowLeft size={14} />
                        Back to Modules
                    </Link>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    {moduleData?.title}
                                </h1>
                                <p className="text-sm text-slate-400 mt-1">
                                    {moduleData?.description}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 text-sm font-medium"
                            >
                                <PlusCircle size={16} />
                                Add Lesson
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {lessons.length === 0 ? (
                            <div className="text-center py-20">
                                <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-400 mb-1">
                                    No lessons yet
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Add your first lesson to this module
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {lessons
                                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                    .map((lesson, idx) => (
                                        <div
                                            key={lesson.id}
                                            className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between hover:border-slate-700 transition group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-purple-400">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">
                                                        {lesson.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {lesson.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => setEditingLesson(lesson)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                                                        title="Edit Lesson"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLesson(lesson.id)}
                                                        disabled={deleteLoadingId === lesson.id}
                                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                                                        title="Delete Lesson"
                                                    >
                                                        {deleteLoadingId === lesson.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                                <Link
                                                    href={`/publisher/lessons/${lesson.id}`}
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    Manage Content
                                                    <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Create Lesson Modal ── */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Add Lesson</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateLesson} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        placeholder="e.g., Variables and Data Types"
                                        value={newLesson.title}
                                        onChange={(e) =>
                                            setNewLesson((prev) => ({ ...prev, title: e.target.value }))
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
                                        {createLoading ? 'Creating...' : 'Add Lesson'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Edit Lesson Modal ── */}
                {editingLesson && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Edit Lesson</h2>
                                <button
                                    onClick={() => setEditingLesson(null)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateLesson} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        value={editingLesson.title}
                                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Order Index</label>
                                    <input
                                        type="number"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        value={editingLesson.orderIndex}
                                        onChange={(e) => setEditingLesson({ ...editingLesson, orderIndex: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingLesson(null)}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateLoading}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {updateLoading ? 'Saving...' : 'Save Changes'}
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
