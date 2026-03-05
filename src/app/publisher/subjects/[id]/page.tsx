'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import { subjectService, moduleService } from '@/lib/services/contentService';
import type { SubjectDto, ModuleDto, ModuleCreateDto } from '@/types/dtos';
import {
    Layers,
    PlusCircle,
    Loader2,
    AlertCircle,
    X,
    ArrowLeft,
    ExternalLink,
    CheckCircle,
    Trash2,
    Eye,
    EyeOff,
    Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id as string;

    const [subject, setSubject] = useState<SubjectDto | null>(null);
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [newModule, setNewModule] = useState<Omit<ModuleCreateDto, 'subjectId'>>({
        title: '',
        orderIndex: 0,
    });
    const [publishLoading, setPublishLoading] = useState(false);
    const [statusLoading, setStatusLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editingSubject, setEditingSubject] = useState<SubjectDto | null>(null);
    const [updateSubjectLoading, setUpdateSubjectLoading] = useState(false);

    const [editingModule, setEditingModule] = useState<ModuleDto | null>(null);
    const [updateModuleLoading, setUpdateModuleLoading] = useState(false);
    const [deleteModuleLoadingId, setDeleteModuleLoadingId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [subjectData, modulesData] = await Promise.all([
                subjectService.getById(subjectId),
                moduleService.getBySubject(subjectId),
            ]);
            setSubject(subjectData);
            setModules(modulesData);
        } catch {
            setError('Failed to load subject data.');
        } finally {
            setLoading(false);
        }
    }, [subjectId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePublish = async () => {
        if (!subject) return;
        setPublishLoading(true);
        try {
            await subjectService.publish(subjectId);
            setSubject((prev) => prev ? { ...prev, isPublished: true } : null);
        } catch {
            setError('Failed to publish subject.');
        } finally {
            setPublishLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!subject) return;
        setStatusLoading(true);
        try {
            const nextStatus = !subject.isActive;
            await subjectService.toggleStatus(subjectId, nextStatus);
            setSubject((prev) => prev ? { ...prev, isActive: nextStatus } : null);
        } catch {
            setError('Failed to update subject status.');
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!subject || !window.confirm('Are you sure you want to delete this subject? It will be hidden from your dashboard.')) return;
        setDeleteLoading(true);
        try {
            await subjectService.delete(subjectId);
            router.push('/publisher');
        } catch {
            setError('Failed to delete subject.');
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleUpdateSubject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingSubject) return;
        setUpdateSubjectLoading(true);
        try {
            const updated = await subjectService.update(subjectId, {
                title: editingSubject.title,
                description: editingSubject.description,
            });
            setSubject(updated);
            setEditingSubject(null);
        } catch {
            setError('Failed to update subject.');
        } finally {
            setUpdateSubjectLoading(false);
        }
    };

    const handleCreateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateLoading(true);
        try {
            const created = await moduleService.create({
                ...newModule,
                subjectId,
                orderIndex: modules.length + 1,
            });
            setModules((prev) => [...prev, created]);
            setNewModule({ title: '', orderIndex: 0 });
            setShowCreateModal(false);
        } catch {
            setError('Failed to create module.');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleUpdateModule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingModule) return;
        setUpdateModuleLoading(true);
        try {
            const updated = await moduleService.update(editingModule.id, {
                title: editingModule.title,
                orderIndex: editingModule.orderIndex,
            });
            setModules((prev) =>
                prev.map((m) => (m.id === updated.id ? updated : m))
            );
            setEditingModule(null);
        } catch {
            setError('Failed to update module.');
        } finally {
            setUpdateModuleLoading(false);
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return;
        setDeleteModuleLoadingId(id);
        try {
            await moduleService.delete(id);
            setModules((prev) => prev.filter((m) => m.id !== id));
        } catch {
            setError('Failed to delete module.');
        } finally {
            setDeleteModuleLoadingId(null);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Publisher', 'Admin']}>
            <DashboardLayout title="Publisher" navItems={publisherNavItems}>
                <Link
                    href="/publisher"
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition mb-6"
                >
                    <ArrowLeft size={14} />
                    Back to Subjects
                </Link>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-start gap-3">
                                <div className="mt-1">
                                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                        {subject?.title}
                                        {subject?.isPublished && (
                                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
                                                Published
                                            </span>
                                        )}
                                        {!subject?.isPublished && (
                                            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                                                Draft
                                            </span>
                                        )}
                                    </h1>
                                    <p className="text-sm text-slate-400 mt-1">
                                        {subject?.description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {subject?.isActive && !subject?.isPublished && (
                                    <button
                                        onClick={handlePublish}
                                        disabled={publishLoading}
                                        className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-lg hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 text-sm font-medium disabled:opacity-50"
                                    >
                                        {publishLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                        Publish
                                    </button>
                                )}

                                {subject?.isPublished && (
                                    <button
                                        onClick={handleToggleStatus}
                                        disabled={statusLoading}
                                        title={subject.isActive ? 'Deactivate (Hide from students)' : 'Activate (Show to students)'}
                                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition shadow-lg text-sm font-medium disabled:opacity-50 ${subject.isActive
                                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 shadow-slate-900/20'
                                            : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 shadow-emerald-900/20'
                                            }`}
                                    >
                                        {statusLoading ? <Loader2 size={16} className="animate-spin" /> : (subject.isActive ? <EyeOff size={16} /> : <Eye size={16} />)}
                                        {subject.isActive ? 'Deactivate' : 'Activate'}
                                    </button>
                                )}

                                <button
                                    onClick={() => setEditingSubject(subject)}
                                    title="Edit Subject Info"
                                    className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition"
                                >
                                    <Pencil size={18} />
                                </button>

                                <button
                                    onClick={handleDelete}
                                    disabled={deleteLoading}
                                    title="Delete Subject"
                                    className="p-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition disabled:opacity-50"
                                >
                                    {deleteLoading ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                </button>

                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 text-sm font-medium"
                                >
                                    <PlusCircle size={16} />
                                    Add Module
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {modules.length === 0 ? (
                            <div className="text-center py-20">
                                <Layers className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-400 mb-1">
                                    No modules yet
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Add your first module to structure this subject
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {modules
                                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                    .map((mod, idx) => (
                                        <div
                                            key={mod.id}
                                            className="bg-slate-900 rounded-xl border border-slate-800 p-5 flex items-center justify-between hover:border-slate-700 transition group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                                                    <span className="text-sm font-bold text-indigo-400">
                                                        {idx + 1}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-white">
                                                        {mod.title}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-0.5">
                                                        {mod.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                                                    <button
                                                        onClick={() => setEditingModule(mod)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition"
                                                        title="Edit Module"
                                                    >
                                                        <Pencil size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteModule(mod.id)}
                                                        disabled={deleteModuleLoadingId === mod.id}
                                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-50"
                                                        title="Delete Module"
                                                    >
                                                        {deleteModuleLoadingId === mod.id ? (
                                                            <Loader2 size={14} className="animate-spin" />
                                                        ) : (
                                                            <Trash2 size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                                <Link
                                                    href={`/publisher/modules/${mod.id}`}
                                                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition opacity-0 group-hover:opacity-100"
                                                >
                                                    Manage Lessons
                                                    <ExternalLink size={12} />
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Create Module Modal ── */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Add Module</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateModule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        placeholder="e.g., Getting Started"
                                        value={newModule.title}
                                        onChange={(e) =>
                                            setNewModule((prev) => ({ ...prev, title: e.target.value }))
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
                                        {createLoading ? 'Creating...' : 'Add Module'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Edit Subject Modal ── */}
                {editingSubject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Edit Subject Info</h2>
                                <button
                                    onClick={() => setEditingSubject(null)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateSubject} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        value={editingSubject.title}
                                        onChange={(e) => setEditingSubject({ ...editingSubject, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition resize-none"
                                        value={editingSubject.description}
                                        onChange={(e) => setEditingSubject({ ...editingSubject, description: e.target.value })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingSubject(null)}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateSubjectLoading}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {updateSubjectLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Edit Module Modal ── */}
                {editingModule && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">Edit Module</h2>
                                <button
                                    onClick={() => setEditingModule(null)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleUpdateModule} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        value={editingModule.title}
                                        onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Order Index</label>
                                    <input
                                        type="number"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        value={editingModule.orderIndex}
                                        onChange={(e) => setEditingModule({ ...editingModule, orderIndex: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setEditingModule(null)}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updateModuleLoading}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {updateModuleLoading ? 'Saving...' : 'Save Changes'}
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
