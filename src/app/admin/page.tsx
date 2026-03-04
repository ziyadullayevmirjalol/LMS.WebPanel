'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { adminNavItems } from '@/components/DashboardLayout';
import { adminService } from '@/lib/services/adminService';
import { subjectService } from '@/lib/services/contentService';
import type { PublisherDto, SubjectDto } from '@/types/dtos';
import {
    Users,
    BookOpen,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
} from 'lucide-react';

export default function AdminDashboard() {
    const [pendingPublishers, setPendingPublishers] = useState<PublisherDto[]>([]);
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [publishers, allSubjects] = await Promise.all([
                adminService.getPendingPublishers(),
                subjectService.getAll(),
            ]);
            setPendingPublishers(publishers);
            setSubjects(allSubjects);
        } catch {
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await adminService.approvePublisher(id);
            setPendingPublishers((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setError('Failed to approve publisher.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        setActionLoading(id);
        try {
            await adminService.rejectPublisher(id);
            setPendingPublishers((prev) => prev.filter((p) => p.id !== id));
        } catch {
            setError('Failed to reject publisher.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout title="Admin Panel" navItems={adminNavItems}>
                <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>

                {error && (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* ── Stats Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Pending Publishers</p>
                                <p className="text-2xl font-bold text-white">
                                    {loading ? '—' : pendingPublishers.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                                <BookOpen className="h-6 w-6 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Subjects</p>
                                <p className="text-2xl font-bold text-white">
                                    {loading ? '—' : subjects.length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">System Status</p>
                                <p className="text-2xl font-bold text-emerald-400">Online</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Pending Publishers Table ── */}
                <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Pending Publisher Requests</h2>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {pendingPublishers.length} pending
                        </span>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                        </div>
                    ) : pendingPublishers.length === 0 ? (
                        <div className="text-center py-16">
                            <CheckCircle className="h-10 w-10 text-emerald-500/30 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No pending publisher requests</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Publisher
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {pendingPublishers.map((publisher) => (
                                    <tr key={publisher.id} className="hover:bg-slate-800/40 transition">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                                                    <span className="text-xs font-bold text-indigo-300">
                                                        {publisher.fullName?.charAt(0)?.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-white">
                                                    {publisher.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-400">{publisher.email}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleApprove(publisher.id)}
                                                    disabled={actionLoading === publisher.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 transition"
                                                >
                                                    {actionLoading === publisher.id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle size={12} />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleReject(publisher.id)}
                                                    disabled={actionLoading === publisher.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-50 transition"
                                                >
                                                    <XCircle size={12} />
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
