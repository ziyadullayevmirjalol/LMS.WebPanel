'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { studentNavItems } from '@/components/DashboardLayout';
import { subjectService, moduleService, lessonService } from '@/lib/services/contentService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type { SubjectDto, ModuleDto, LessonDto, EnrollmentDto } from '@/types/dtos';
import {
    BookOpen,
    ArrowLeft,
    Loader2,
    AlertCircle,
    PlayCircle,
    Lock,
    CheckCircle2,
    ChevronRight,
    User,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentSubjectDetailPage() {
    const params = useParams();
    const subjectId = params.id as string;
    const router = useRouter();
    const { user } = useAuth();

    const [subject, setSubject] = useState<SubjectDto | null>(null);
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [lessonsByModule, setLessonsByModule] = useState<Record<string, LessonDto[]>>({});
    const [enrollment, setEnrollment] = useState<EnrollmentDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [subjData, modsData, enrollments] = await Promise.all([
                subjectService.getById(subjectId),
                moduleService.getBySubject(subjectId),
                user ? enrollmentService.getByStudent(user.id) : Promise.resolve([]),
            ]);

            setSubject(subjData);
            setModules(modsData.sort((a, b) => a.order - b.order));

            const userEnrollment = enrollments.find((e) => e.subjectId === subjectId) || null;
            setEnrollment(userEnrollment);

            // Fetch lessons for all modules
            const lessonPromises = modsData.map((m) => lessonService.getByModule(m.id));
            const allLessons = await Promise.all(lessonPromises);

            const lessonsMap: Record<string, LessonDto[]> = {};
            modsData.forEach((m, idx) => {
                lessonsMap[m.id] = allLessons[idx].sort((a, b) => a.order - b.order);
            });
            setLessonsByModule(lessonsMap);
        } catch (err) {
            console.error(err);
            setError('Failed to load course details.');
        } finally {
            setLoading(false);
        }
    }, [subjectId, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEnroll = async () => {
        if (!user) {
            router.push('/login');
            return;
        }

        setEnrollLoading(true);
        setError('');
        try {
            const newEnrollment = await enrollmentService.enroll({
                studentId: user.id,
                subjectId: subjectId,
            });
            setEnrollment(newEnrollment);
        } catch (err) {
            console.error(err);
            setError('Enrollment failed. Please try again.');
        } finally {
            setEnrollLoading(false);
        }
    };

    const getFirstLessonId = () => {
        if (modules.length > 0) {
            const firstMod = modules[0];
            const modLessons = lessonsByModule[firstMod.id];
            if (modLessons && modLessons.length > 0) {
                return modLessons[0].id;
            }
        }
        return null;
    };

    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <DashboardLayout title="Course Details" navItems={studentNavItems}>
                <div className="max-w-4xl mx-auto">
                    <Link
                        href="/student/explore"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Explore
                    </Link>

                    {loading ? (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                        </div>
                    ) : !subject ? (
                        <div className="text-center py-24">
                            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-white">Course not found</h3>
                        </div>
                    ) : (
                        <>
                            {/* Header Card */}
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 mb-8 overflow-hidden relative shadow-2xl">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                                <div className="relative z-10">
                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20 uppercase tracking-wider">
                                            Course
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <User size={14} />
                                            {subject.publisherName || 'LMS Instructor'}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Calendar size={14} />
                                            {subject.createdAt ? new Date(subject.createdAt).toLocaleDateString() : 'Active'}
                                        </div>
                                    </div>

                                    <h1 className="text-3xl md:text-4xl font-black text-white mb-4">
                                        {subject.title}
                                    </h1>
                                    <p className="text-slate-400 text-lg max-w-2xl leading-relaxed mb-8">
                                        {subject.description}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-4">
                                        {enrollment ? (
                                            <Link
                                                href={getFirstLessonId() ? `/student/learn/${getFirstLessonId()}` : '#'}
                                                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition shadow-xl shadow-emerald-500/20 group"
                                            >
                                                <PlayCircle size={20} />
                                                Continue Learning
                                                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        ) : (
                                            <button
                                                onClick={handleEnroll}
                                                disabled={enrollLoading}
                                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition shadow-xl shadow-indigo-500/20 disabled:opacity-50"
                                            >
                                                {enrollLoading ? (
                                                    <>
                                                        <Loader2 size={20} className="animate-spin" />
                                                        Enrolling...
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 size={20} />
                                                        Enroll for Free
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        {enrollment && (
                                            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 px-4 py-4 rounded-2xl border border-emerald-400/20">
                                                <CheckCircle2 size={20} />
                                                <span className="font-bold">You are enrolled</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 mb-8 text-sm">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            {/* Syllabus Section */}
                            <div className="mb-12">
                                <h2 className="text-2xl font-bold text-white mb-6">Course Syllabus</h2>
                                <div className="space-y-4">
                                    {modules.map((mod, modIdx) => (
                                        <div
                                            key={mod.id}
                                            className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden"
                                        >
                                            <div className="px-6 py-4 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                        {modIdx + 1}
                                                    </span>
                                                    <h3 className="font-bold text-white">{mod.title}</h3>
                                                </div>
                                                <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                                                    {lessonsByModule[mod.id]?.length || 0} Lessons
                                                </span>
                                            </div>

                                            <div className="divide-y divide-slate-800">
                                                {(lessonsByModule[mod.id] || []).map((lesson, lessonIdx) => (
                                                    <div
                                                        key={lesson.id}
                                                        className={`px-6 py-4 flex items-center justify-between transition ${enrollment ? 'hover:bg-slate-800/20 cursor-pointer' : 'opacity-60 grayscale-[0.5]'
                                                            }`}
                                                        onClick={() => {
                                                            if (enrollment) {
                                                                router.push(`/student/learn/${lesson.id}`);
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-slate-600 text-xs font-mono">
                                                                {modIdx + 1}.{lessonIdx + 1}
                                                            </span>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-slate-200">
                                                                    {lesson.title}
                                                                </h4>
                                                                <p className="text-xs text-slate-500 line-clamp-1">
                                                                    {lesson.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {enrollment ? (
                                                            <ChevronRight size={16} className="text-indigo-400" />
                                                        ) : (
                                                            <Lock size={16} className="text-slate-600" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                                    {modules.length === 0 && (
                                        <div className="text-center py-12 bg-slate-900 rounded-2xl border border-slate-800 border-dashed">
                                            <p className="text-slate-500">No content available for this course yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
