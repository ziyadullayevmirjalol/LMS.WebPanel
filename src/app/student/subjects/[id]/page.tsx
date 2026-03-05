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
                        <div className="bg-slate-900 rounded-[2.5rem] border border-slate-800 p-6 sm:p-10 mb-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl -ml-8 -mb-8 pointer-events-none" />

                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10 text-center md:text-left">
                                <div className="h-24 w-24 md:h-40 md:w-40 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20 shadow-xl group hover:scale-105 transition-transform duration-500">
                                    <BookOpen size={48} className="md:w-16 md:h-16" />
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-4">
                                        <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">
                                            Course
                                        </span>
                                        {enrollment && (
                                            <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1 uppercase tracking-widest">
                                                <CheckCircle size={12} />
                                                Enrolled
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tighter leading-none">
                                        {subject.title}
                                    </h1>
                                    <p className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                                        {subject.description}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        {enrollment ? (
                                            <Link
                                                href={`/student/subjects/${subject.id}/learn`}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-10 py-4 rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20 font-black hover:-translate-y-1 active:translate-y-0"
                                            >
                                                <PlayCircle size={22} />
                                                Continue Learning
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={handleEnroll}
                                                disabled={enrolling}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 font-black disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 active:translate-y-0"
                                            >
                                                {enrolling ? (
                                                    <Loader2 size={22} className="animate-spin" />
                                                ) : (
                                                    <BookOpen size={22} />
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
