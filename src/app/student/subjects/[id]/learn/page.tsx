'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { subjectService, moduleService, lessonService, contentBlockService } from '@/lib/services/contentService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type { SubjectDto, ModuleDto, LessonDto, ContentBlockDto, EnrollmentDto } from '@/types/dtos';
import {
    BookOpen,
    Loader2,
    AlertCircle,
    ArrowLeft,
    PlayCircle,
    ChevronDown,
    ChevronRight,
    FileText,
    Video,
    FileCode,
    ExternalLink,
    Puzzle,
    List
} from 'lucide-react';
import Link from 'next/link';
import VideoPlayer from '@/components/VideoPlayer';

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
    const [isCurriculumOpen, setIsCurriculumOpen] = useState(false);

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
        setIsCurriculumOpen(false); // Close on mobile after selection
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
                        <span className="font-medium hidden sm:inline text-sm">Back</span>
                    </Link>
                    <div className="mx-auto flex-1 text-center px-4 truncate">
                        <h1 className="text-sm font-bold text-white truncate">{subject?.title}</h1>
                    </div>
                    <button
                        onClick={() => setIsCurriculumOpen(!isCurriculumOpen)}
                        className="md:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                    >
                        <List size={20} />
                    </button>
                </header>

                {error ? (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-6 py-4">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden relative">
                        {/* Sidebar Curriculum (Drawer on mobile, fixed on desktop) */}
                        <div
                            className={`fixed flex flex-col inset-y-0 left-0 z-50 w-80 sm:w-96 bg-slate-900 border-r border-slate-800 transition-transform duration-300 ease-in-out transform 
                                       ${isCurriculumOpen ? 'translate-x-0' : '-translate-x-full'} 
                                       md:relative md:translate-x-0 md:flex`}
                        >
                            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                                <h2 className="font-bold text-white">Course Curriculum</h2>
                                <button className="md:hidden text-slate-400" onClick={() => setIsCurriculumOpen(false)}>
                                    <ChevronRight className="rotate-180" size={20} />
                                </button>
                            </div>
                            <div className="p-4 border-b border-slate-800">
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                        style={{ width: `${enrollment?.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">
                                    {Math.round(enrollment?.progress || 0)}% Complete
                                </p>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {modules.map((module, mIdx) => (
                                    <div key={module.id} className="border-b border-slate-800/50 last:border-0">
                                        <button
                                            onClick={() => handleModuleToggle(module.id)}
                                            className={`w-full text-left px-4 py-4 flex items-start gap-3 hover:bg-slate-800/30 transition ${activeModuleId === module.id ? 'bg-slate-800/50' : ''
                                                }`}
                                        >
                                            <div className="mt-1 text-slate-500">
                                                {activeModuleId === module.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                            </div>
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-tight">
                                                    Module {mIdx + 1}
                                                </h3>
                                                <p className="text-sm font-bold text-white mt-0.5 leading-snug">
                                                    {module.title}
                                                </p>
                                            </div>
                                        </button>

                                        {activeModuleId === module.id && lessonsByModule[module.id] && (
                                            <div className="bg-slate-900/50 py-1">
                                                {lessonsByModule[module.id]?.map((lesson) => (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleSelectLesson(lesson.id)}
                                                        className={`w-full text-left pl-10 pr-4 py-3 flex items-center gap-3 transition text-sm ${activeLessonId === lesson.id
                                                            ? 'bg-indigo-500/10 border-l-2 border-indigo-500 text-white'
                                                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30 border-l-2 border-transparent'
                                                            }`}
                                                    >
                                                        <PlayCircle size={14} className={activeLessonId === lesson.id ? 'text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'text-slate-600'} />
                                                        <span className="truncate flex-1 font-medium">{lesson.title}</span>
                                                    </button>
                                                ))}
                                                {lessonsByModule[module.id]?.length === 0 && (
                                                    <div className="pl-10 pr-4 py-3 text-xs text-slate-500 italic">
                                                        No lessons in this module yet.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Backdrop Overlay */}
                        {isCurriculumOpen && (
                            <div
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                                onClick={() => setIsCurriculumOpen(false)}
                            />
                        )}

                        {/* Main Content Area */}
                        <div className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-10 relative scroll-smooth overflow-x-hidden">
                            {contentLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                </div>
                            ) : !activeLessonId ? (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-20">
                                    <div className="h-20 w-20 rounded-3xl bg-slate-900 flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
                                        <BookOpen className="h-10 w-10 text-indigo-500/50" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white mb-2">Ready to Start?</h2>
                                    <p className="text-slate-500 text-sm leading-relaxed">
                                        Select a lesson from the curriculum to begin your learning journey.
                                    </p>
                                    <button
                                        onClick={() => setIsCurriculumOpen(true)}
                                        className="md:hidden mt-8 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-500/20"
                                    >
                                        Browse Curriculum
                                    </button>
                                </div>
                            ) : contentBlocks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto py-20 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
                                    <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-white mb-2">No content yet</h3>
                                    <p className="text-slate-500 text-sm italic">
                                        Content for this lesson is being prepared.
                                    </p>
                                </div>
                            ) : (
                                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-32">
                                    {contentBlocks.map((block) => (
                                        <div key={block.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
                                            {/* Block Header */}
                                            <div className="bg-slate-800/30 px-6 sm:px-8 py-4 border-b border-slate-800/50 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800">
                                                        {renderBlockIcon(block.type)}
                                                    </div>
                                                    <h3 className="font-bold text-white text-xs sm:text-sm tracking-wide uppercase">
                                                        {block.type === 0 && 'Reading Material'}
                                                        {block.type === 1 && 'Video Presentation'}
                                                        {block.type === 2 && 'Knowledge Check'}
                                                        {block.type === 3 && 'Resource'}
                                                    </h3>
                                                </div>
                                            </div>

                                            {/* Block Content */}
                                            <div className="p-6 sm:p-10 lg:p-12">
                                                {block.type === 0 && ( // Text
                                                    <div className="prose prose-invert max-w-none">
                                                        <div className="whitespace-pre-wrap text-slate-300 leading-[1.8] text-base sm:text-lg font-medium tracking-tight">
                                                            {block.contentText}
                                                        </div>
                                                    </div>
                                                )}

                                                {block.type === 1 && ( // Video
                                                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black/50 mx-auto border border-slate-800 flex items-center justify-center shadow-2xl">
                                                        {block.mediaUrl ? (
                                                            <VideoPlayer
                                                                url={block.mediaUrl}
                                                                width="100%"
                                                                height="100%"
                                                                controls
                                                                className="rounded-2xl"
                                                            />
                                                        ) : (
                                                            <p className="text-slate-500 italic">No video source provided.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === 3 && ( // PDF / Document
                                                    <div className="flex flex-col items-center justify-center py-12 bg-slate-800/10 rounded-3xl border border-slate-800 border-dashed">
                                                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-6">
                                                            <FileCode size={32} />
                                                        </div>
                                                        <h4 className="text-white font-bold mb-2">Downloadable Resource</h4>
                                                        <p className="text-slate-500 text-sm mb-8 text-center px-6">Access additional documents related to this lesson.</p>
                                                        {block.mediaUrl ? (
                                                            <a
                                                                href={block.mediaUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-8 py-3.5 bg-emerald-600 text-white hover:bg-emerald-500 rounded-2xl text-sm font-black transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
                                                            >
                                                                View Document <ExternalLink size={16} />
                                                            </a>
                                                        ) : (
                                                            <p className="text-slate-500 text-sm italic underline">Resource link missing</p>
                                                        )}
                                                    </div>
                                                )}

                                                {block.type === 2 && ( // Quiz
                                                    <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-[2.5rem] p-8 sm:p-12 text-center relative overflow-hidden group">
                                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-500/20 transition-all" />
                                                        <div className="h-20 w-20 rounded-3xl bg-indigo-600/10 flex items-center justify-center text-indigo-400 mx-auto mb-6 shadow-xl border border-indigo-500/20">
                                                            <Puzzle size={40} />
                                                        </div>
                                                        <h4 className="text-2xl font-black text-white mb-3">Knowledge Check</h4>
                                                        <p className="text-slate-400 text-sm mb-8 max-w-xs mx-auto-leading-relaxed">
                                                            Quick quiz to test your understanding of the materials covered in this lesson.
                                                        </p>
                                                        <Link
                                                            href={`/student/quiz/${block.id}`}
                                                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/40 hover:-translate-y-1 active:translate-y-0"
                                                        >
                                                            Start Challenge
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
