'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { adminNavItems } from '@/components/DashboardLayout';
import { adminService } from '@/lib/services/adminService';
import {
    BookOpen,
    Loader2,
    AlertCircle,
    CheckCircle,
    User,
    Calendar,
    Trash2,
} from 'lucide-react';

export default function AdminSubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getAllSubjects();
            setSubjects(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load subjects.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleHardDelete = async (id: string) => {
        if (!window.confirm('PERMANENT DELETE: This cannot be undone. Are you sure?')) return;
        setActionLoading(id);
        try {
            await adminService.hardDeleteSubject(id);
            setSubjects((prev) => prev.filter((s) => s.id !== id));
        } catch {
            setError('Failed to permanently delete subject.');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout title="Admin Portal" navItems={adminNavItems}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">All Subjects</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        System-wide overview of educational content
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : subjects.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                        <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400">No subjects found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((subject) => (
                            <div key={subject.id} className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden hover:border-slate-700 transition group">
                                <div className="p-5 flex flex-col h-full">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                                            {subject.title}
                                        </h3>
                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                            {subject.isDeleted ? (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                                                    Deleted
                                                </span>
                                            ) : subject.isPublished ? (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${subject.isActive
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                    {subject.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            ) : (
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">
                                        {subject.description}
                                    </p>
                                    <div className="pt-4 border-t border-slate-800 space-y-2">
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <User size={12} className="text-slate-600" />
                                            <span>Publisher: <span className="text-slate-300">{subject.publisherName}</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <Calendar size={12} className="text-slate-600" />
                                            <span>Created: {new Date(subject.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
                                        <button
                                            onClick={() => handleHardDelete(subject.id)}
                                            disabled={actionLoading === subject.id}
                                            title="Permanently Delete"
                                            className="inline-flex items-center gap-2 text-xs font-medium text-red-400 hover:text-red-300 transition disabled:opacity-50"
                                        >
                                            {actionLoading === subject.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                                            Final Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
