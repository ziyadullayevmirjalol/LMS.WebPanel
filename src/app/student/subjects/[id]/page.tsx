'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { studentNavItems } from '@/components/DashboardLayout';
import { subjectService, moduleService } from '@/lib/services/contentService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type { SubjectDto, ModuleDto, EnrollmentDto } from '@/types/dtos';
import {
    BookOpen,
    Loader2,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    PlayCircle,
    List,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentSubjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id as string;
    const { user } = useAuth();

    const [subject, setSubject] = useState<SubjectDto | null>(null);
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [enrollment, setEnrollment] = useState<EnrollmentDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [subjectData, modulesData, enrollmentsData] = await Promise.all([
                subjectService.getById(subjectId),
                moduleService.getBySubject(subjectId),
                enrollmentService.getByStudent(user.id),
            ]);

            setSubject(subjectData);
            setModules(modulesData);

            // Check if already enrolled
            const currentEnrollment = enrollmentsData.find(e => e.subjectId === subjectId);
            if (currentEnrollment) {
                setEnrollment(currentEnrollment);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load subject details.');
        } finally {
            setLoading(false);
        }
    }, [subjectId, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEnroll = async () => {
        if (!user) return;
        setEnrolling(true);
        setError('');
        try {
            const newEnrollment = await enrollmentService.enroll({
                studentId: user.id,
                subjectId,
            });
            setEnrollment(newEnrollment);
        } catch (err) {
            console.error(err);
            setError('Failed to enroll in the course. Please try again.');
        } finally {
            setEnrolling(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <DashboardLayout title="Course Details" navItems={studentNavItems}>
                <Link
                    href={enrollment ? "/student" : "/student/explore"}
                    className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition mb-6"
                >
                    <ArrowLeft size={14} />
                    Back to {enrollment ? 'Dashboard' : 'Explore'}
                </Link>

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : error ? (
                    <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                ) : subject ? (
                    <div className="max-w-4xl mx-auto">
                        {/* Header Section */}
                        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 mb-8 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                                <div className="h-32 w-32 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                                    <BookOpen size={48} />
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="bg-slate-800 text-slate-300 text-xs font-bold px-3 py-1 rounded-full border border-slate-700">
                                            Course
                                        </span>
                                        {enrollment && (
                                            <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                                                <CheckCircle size={12} />
                                                Enrolled
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                                        {subject.title}
                                    </h1>
                                    <p className="text-slate-400 text-base leading-relaxed mb-6">
                                        {subject.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        {enrollment ? (
                                            <Link
                                                href={`/student/subjects/${subject.id}/learn`}
                                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3.5 rounded-xl hover:bg-emerald-500 transition shadow-lg shadow-emerald-500/20 font-bold"
                                            >
                                                <PlayCircle size={20} />
                                                Continue Learning
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={handleEnroll}
                                                disabled={enrolling}
                                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {enrolling ? (
                                                    <Loader2 size={20} className="animate-spin" />
                                                ) : (
                                                    <BookOpen size={20} />
                                                )}
                                                Enroll Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modules Section */}
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <List size={20} className="text-indigo-400" />
                            Course Curriculum
                        </h2>

                        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                            {modules.length === 0 ? (
                                <div className="text-center py-12 px-4">
                                    <p className="text-slate-400">Content for this course is being prepared.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-800/50">
                                    {modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, idx) => (
                                        <div key={module.id} className="p-5 hover:bg-slate-800/20 transition flex items-start gap-4">
                                            <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 border border-slate-700">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white mb-1">{module.title}</h3>
                                                {module.description && (
                                                    <p className="text-sm text-slate-400">{module.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : null}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
