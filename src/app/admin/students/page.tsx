'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { adminNavItems } from '@/components/DashboardLayout';
import { adminService } from '@/lib/services/adminService';
import {
    Users,
    Loader2,
    AlertCircle,
    User,
    Calendar,
    Mail,
    UserCheck,
    UserX,
} from 'lucide-react';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await adminService.getAllStudents();
            setStudents(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load students.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleToggleStatus = async (studentId: string, currentStatus: boolean) => {
        setActionLoading(studentId);
        try {
            await adminService.toggleStudentStatus(studentId, !currentStatus);
            setStudents((prev) =>
                prev.map((s) => s.id === studentId ? { ...s, isActive: !currentStatus } : s)
            );
        } catch (err) {
            console.error(err);
            setError('Failed to update student status.');
        } finally {
            setActionLoading(null);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout title="Admin Portal" navItems={adminNavItems}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Students</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Overview of registered students
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
                ) : students.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
                        <Users className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400">No students found</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {students.map((student) => (
                            <div key={student.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                                            <User size={20} />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-sm font-semibold text-white truncate">
                                                {student.fullName}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${student.isActive
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {student.isActive ? 'Active' : 'Deactivated'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleToggleStatus(student.id, student.isActive)}
                                        disabled={actionLoading === student.id}
                                        className={`p-1.5 rounded-lg transition disabled:opacity-50 shrink-0 ${student.isActive
                                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                            }`}
                                        title={student.isActive ? 'Deactivate Account' : 'Activate Account'}
                                    >
                                        {actionLoading === student.id ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : student.isActive ? (
                                            <UserX size={16} />
                                        ) : (
                                            <UserCheck size={16} />
                                        )}
                                    </button>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-800/50">
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Mail size={12} className="text-slate-600" />
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Calendar size={12} className="text-slate-600" />
                                        <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute >
    );
}
