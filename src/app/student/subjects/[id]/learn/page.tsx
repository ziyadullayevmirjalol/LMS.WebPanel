'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { subjectService, moduleService, lessonService, contentBlockService } from '@/lib/services/contentService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type { SubjectDto, ModuleDto, LessonDto, ContentBlockDto, EnrollmentDto, ContentType } from '@/types/dtos';
import {
    BookOpen,
    Loader2,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    PlayCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    Video,
    FileCode,
    ExternalLink,
    Puzzle
} from 'lucide-react';
import Link from 'next/link';
import ReactPlayer from 'react-player';

export default function StudentLearningPage() {
    const params = useParams();
    const router = useRouter();
    const subjectId = params.id as string;
    const { user } = useAuth();

    const [subject, setSubject] = useState<SubjectDto | null>(null);
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [lessonsByModule, setLessonsByModule] = useState<Record<string, LessonDto[]>>({});
    const [enrollment, setEnrollment] = useState<EnrollmentDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

    // Content state for active lesson
    const [contentBlocks, setContentBlocks] = useState<ContentBlockDto[]>([]);
    const [contentLoading, setContentLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Check enrollment first
            const enrollmentsData = await enrollmentService.getByStudent(user.id);
            const currentEnrollment = enrollmentsData.find(e => e.subjectId === subjectId);

            if (!currentEnrollment) {
                // Redirect back if not enrolled
                router.push(`/student/subjects/${subjectId}`);
                return;
            }

            setEnrollment(currentEnrollment);

            // Fetch subject and modules
            const [subjectData, modulesData] = await Promise.all([
                subjectService.getById(subjectId),
                moduleService.getBySubject(subjectId),
            ]);

            setSubject(subjectData);

            const sortedModules = modulesData.sort((a, b) => a.orderIndex - b.orderIndex);
            setModules(sortedModules);

            // Expand first module by default
            if (sortedModules.length > 0) {
                setActiveModuleId(sortedModules[0].id);
                fetchLessonsForModule(sortedModules[0].id);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load course content.');
        } finally {
            setLoading(false);
        }
    }, [subjectId, user, router]);

    const fetchLessonsForModule = async (moduleId: string) => {
        if (lessonsByModule[moduleId]) return; // Already loaded

        try {
            const lessons = await lessonService.getByModule(moduleId);
            const sortedLessons = lessons.sort((a, b) => a.orderIndex - b.orderIndex);

            setLessonsByModule(prev => ({
                ...prev,
                [moduleId]: sortedLessons
            }));

            // If this is the first module and we don't have an active lesson, set it
            if (activeModuleId === moduleId && !activeLessonId && sortedLessons.length > 0) {
                handleSelectLesson(sortedLessons[0].id);
            }
        } catch (err) {
            console.error('Failed to load lessons for module', err);
        }
    };

    const handleModuleToggle = (moduleId: string) => {
        setActiveModuleId(prev => prev === moduleId ? null : moduleId);
        if (activeModuleId !== moduleId) {
            fetchLessonsForModule(moduleId);
        }
    };

    const handleSelectLesson = async (lessonId: string) => {
        setActiveLessonId(lessonId);
        setContentLoading(true);
        try {
            const blocks = await contentBlockService.getByLesson(lessonId);
            setContentBlocks(blocks.sort((a, b) => a.orderIndex - b.orderIndex));
        } catch (err) {
            console.error('Failed to load content blocks', err);
        } finally {
            setContentLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const renderBlockIcon = (type: number) => {
        switch (type) {
            case 0: return <FileText size={20} className="text-blue-400" />;
            case 1: return <Video size={20} className="text-rose-400" />;
            case 2: return <Puzzle size={20} className="text-amber-400" />;
            case 3: return <FileCode size={20} className="text-emerald-400" />;
            default: return <FileText size={20} className="text-slate-400" />;
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
                <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <div className="min-h-screen flex flex-col bg-slate-950">
                {/* Header */}
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 md:px-6 sticky top-0 z-40">
                    <Link
                        href={`/student/subjects/${subjectId}`}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium hidden sm:inline">Back to Course</span>
                    </Link>
                    <div className="mx-auto flex-1 text-center px-4 truncate">
                        <h1 className="text-sm font-bold text-white truncate">{subject?.title}</h1>
                    </div>
                </header>

                {error ? (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-6 py-4">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                        {/* Sidebar Curriculum (Drawer on mobile, fixed on desktop) */}
                        <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-r border-slate-800 flex flex-col md:h-[calc(100vh-64px)] overflow-y-auto">
                            <div className="p-4 border-b border-slate-800">
                                <h2 className="font-bold text-white mb-2">Course Content</h2>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full"
                                        style={{ width: `${enrollment?.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2 text-right">
                                    {Math.round(enrollment?.progress || 0)}% Complete
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {modules.map((module, mIdx) => (
                                    <div key={module.id} className="border-b border-slate-800/50 last:border-0">
                                        <button
                                            onClick={() => handleModuleToggle(module.id)}
                                            className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-slate-800/30 transition ${activeModuleId === module.id ? 'bg-slate-800/50' : ''
                                                }`}
                                        >
                                            <div className="mt-1 text-slate-500">
                                                {activeModuleId === module.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-white">
                                                    Module {mIdx + 1}: {module.title}
                                                </h3>
                                                {lessonsByModule[module.id] && (
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {lessonsByModule[module.id]?.length || 0} lessons
                                                    </p>
                                                )}
                                            </div>
                                        </button>

                                        {/* Lessons List (Expanded Dropdown) */}
                                        {activeModuleId === module.id && lessonsByModule[module.id] && (
                                            <div className="bg-slate-900/50 py-1">
                                                {lessonsByModule[module.id]?.map((lesson, lIdx) => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleSelectLesson(lesson.id)}
                                                        className={`w-full text-left pl-10 pr-4 py-2.5 flex items-center gap-3 transition text-sm ${activeLessonId === lesson.id
                                                            ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-white'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent'
                                                            }`}
                                                    >
                                                        <PlayCircle size={14} className={activeLessonId === lesson.id ? 'text-indigo-400' : 'text-slate-500'} />
                                                        <span className="truncate flex-1">{lesson.title}</span>
                                                    </button>
                                                ))}
                                                {lessonsByModule[module.id]?.length === 0 && (
                                                    <div className="pl-10 pr-4 py-2 text-xs text-slate-500 italic">
                                                        No lessons in this module yet.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-8 md:h-[calc(100vh-64px)] relative scroll-smooth focus:outline-none">
                            {contentLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                </div>
                            ) : !activeLessonId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-20">
                                    <BookOpen className="h-16 w-16 text-slate-800 mb-6" />
                                    <h2 className="text-xl font-bold text-white mb-2">Select a lesson to begin</h2>
                                    <p className="text-slate-500">
                                        Choose a module and lesson from the sidebar to view its content.
                                    </p>
                                </div>
                            ) : contentBlocks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                                    <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">No content yet</h3>
                                    <p className="text-slate-500 text-sm">
                                        This lesson doesn't have any content blocks added yet. Please check back later.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto space-y-8 pb-32">
                                    {/* Lesson Title header could go here, but omitted to save space since usually blocks explain everything */}

                                    {contentBlocks.map((block) => (
                                        <div key={block.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg">
                                            {/* Block Header */}
                                            <div className="bg-slate-800/40 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {renderBlockIcon(block.type)}
                                                    <h3 className="font-bold text-white text-sm">
                                                        {block.type === 0 && 'Reading Material'}
                                                        {block.type === 1 && 'Video Lesson'}
                                                        {block.type === 2 && 'Knowledge Check'}
                                                        {block.type === 3 && 'Document'}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Block Content */}
                                            <div className="p-6 md:p-8">
                                                {block.type === 0 && ( // Text
                                                    <div className="prose prose-invert max-w-none">
                                                        <div className="whitespace-pre-wrap text-slate-300 leading-relaxed break-words font-medium">
                                                            {block.contentText}
                                                        </div>
                                                    </div>
                                                )}

                                                {block.type === 1 && ( // Video
                                                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/50 mx-auto border border-slate-800 flex items-center justify-center">
                                                        {block.mediaUrl ? (
                                                            <ReactPlayer
                                                                // @ts-expect-error react-player types issue with next.js compilation
                                                                url={block.mediaUrl}
                                                                width="100%"
                                                                height="100%"
                                                                controls
                                                                className="rounded-xl overflow-hidden"
                                                                fallback={<div className="text-slate-500">Loading video...</div>}
                                                            />
                                                        ) : (
                                                            <p className="text-slate-500 italic">No video URL provided.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === 3 && ( // PDF / Document
                                                    <div className="flex flex-col items-center justify-center py-10 bg-slate-800/20 rounded-xl border border-slate-800 border-dashed">
                                                        <FileCode size={48} className="text-emerald-500/50 mb-4" />
                                                        <h4 className="text-white font-medium mb-2">Document Resource</h4>
                                                        {block.mediaUrl ? (
                                                            <a
                                                                href={block.mediaUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-6 py-2.5 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20 border border-emerald-500/20 rounded-lg text-sm font-bold transition flex items-center gap-2"
                                                            >
                                                                View Document <ExternalLink size={14} />
                                                            </a>
                                                        ) : (
                                                            <p className="text-slate-500 text-sm">No document URL provided.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === 2 && ( // Quiz
                                                    <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 text-center">
                                                        <Puzzle size={32} className="text-amber-400 mx-auto mb-4" />
                                                        <h4 className="text-lg font-bold text-white mb-2">Quiz Module</h4>
                                                        <p className="text-slate-400 text-sm mb-6">Test your knowledge on this topic.</p>
                                                        <Link
                                                            href={`/student/quiz/${block.id}`}
                                                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                                                        >
                                                            Start Quiz
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
