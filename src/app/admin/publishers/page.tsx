'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { adminNavItems } from '@/components/DashboardLayout';
import { adminService } from '@/lib/services/adminService';
import type { PublisherDto } from '@/types/dtos';
import {
    Users,
    CheckCircle,
    XCircle,
    Loader2,
    AlertCircle,
    UserCheck,
    UserX,
} from 'lucide-react';

export default function AdminPublishersPage() {
    const [publishers, setPublishers] = useState<PublisherDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchPublishers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getAllPublishers();
            setPublishers(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load publishers.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPublishers();
    }, [fetchPublishers]);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        try {
            await adminService.approvePublisher(id);
            setPublishers((prev) =>
                prev.map((p) => (p.id === id ? { ...p, isApproved: true } : p))
            );
        } catch (err) {
            setError('Failed to approve publisher.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Are you sure you want to reject and delete this publisher?')) return;
        setActionLoading(id);
        try {
            await adminService.rejectPublisher(id);
            setPublishers((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            setError('Failed to reject publisher.');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout title="Admin Portal" navItems={adminNavItems}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Publishers</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage publisher accounts and approvals
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
                ) : publishers.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                        <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400">No publishers found</h3>
                    </div>
                ) : (
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/50">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Publisher
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {publishers.map((pub) => (
                                    <tr key={pub.id} className="hover:bg-slate-800/30 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                                                    {pub.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">
                                                        {pub.fullName}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {pub.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {pub.isApproved ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <CheckCircle size={12} />
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                                    <AlertCircle size={12} />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-400 text-nowrap">
                                            {pub.createdAt ? new Date(pub.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {!pub.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(pub.id)}
                                                    disabled={actionLoading === pub.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition disabled:opacity-50"
                                                >
                                                    {actionLoading === pub.id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : (
                                                        <UserCheck size={12} />
                                                    )}
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleReject(pub.id)}
                                                disabled={actionLoading === pub.id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-red-400 text-xs font-medium hover:bg-red-500/10 transition border border-red-500/20 disabled:opacity-50"
                                            >
                                                {actionLoading === pub.id ? (
                                                    <Loader2 size={12} className="animate-spin" />
                                                ) : (
                                                    <UserX size={12} />
                                                )}
                                                {pub.isApproved ? 'Delete' : 'Reject'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
