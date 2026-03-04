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
} from 'lucide-react';

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
                            <div key={student.id} className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-white truncate">
                                            {student.fullName}
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            Student ID: {student.id.split('-')[0]}...
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Mail size={14} className="text-slate-600" />
                                        <span className="truncate">{student.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Calendar size={14} className="text-slate-600" />
                                        <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
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
