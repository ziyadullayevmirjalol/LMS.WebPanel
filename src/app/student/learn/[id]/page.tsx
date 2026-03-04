'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { studentNavItems } from '@/components/DashboardLayout';
import { lessonService, contentBlockService, subjectService, moduleService } from '@/lib/services/contentService';
import { quizService } from '@/lib/services/quizService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type {
    LessonDto,
    ContentBlockDto,
    QuizQuestionDto,
    QuizAttemptDto,
    SubjectDto,
    ModuleDto,
    EnrollmentDto,
} from '@/types/dtos';
import {
    FileText,
    Video,
    Puzzle,
    File,
    Loader2,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    CheckCircle,
    HelpCircle,
    PlayCircle,
    Award,
    ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentLessonPlayer() {
    const params = useParams();
    const lessonId = params.id as string;
    const router = useRouter();
    const { user } = useAuth();

    const [lesson, setLesson] = useState<LessonDto | null>(null);
    const [blocks, setBlocks] = useState<ContentBlockDto[]>([]);
    const [subject, setSubject] = useState<SubjectDto | null>(null);
    const [enrollment, setEnrollment] = useState<EnrollmentDto | null>(null);
    const [allLessons, setAllLessons] = useState<LessonDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Quiz state
    const [quizAnswers, setQuizAnswers] = useState<Record<string, { questionId: string; selectedOptionIndex: number }[]>>({});
    const [quizQuestions, setQuizQuestions] = useState<Record<string, QuizQuestionDto[]>>({});
    const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttemptDto[]>>({});
    const [submittingQuiz, setSubmittingQuiz] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const lessonData = await lessonService.getById(lessonId);
            setLesson(lessonData);

            const [blocksData, modData] = await Promise.all([
                contentBlockService.getByLesson(lessonId),
                moduleService.getById(lessonData.moduleId),
            ]);
            setBlocks(blocksData.sort((a, b) => a.order - b.order));

            const [subjData, enrollments, modLessons] = await Promise.all([
                subjectService.getById(modData.subjectId),
                user ? enrollmentService.getByStudent(user.id) : Promise.resolve([]),
                lessonService.getByModule(modData.id),
            ]);

            setSubject(subjData);
            setAllLessons(modLessons.sort((a, b) => a.order - b.order));

            const userEnrollment = enrollments.find((e) => e.subjectId === subjData.id);
            if (!userEnrollment) {
                router.push(`/student/subjects/${subjData.id}`);
                return;
            }
            setEnrollment(userEnrollment);

            // Load quiz questions and attempts for quiz blocks
            const quizBlocks = blocksData.filter(b => b.type === 'Quiz');
            for (const block of quizBlocks) {
                const [questions, attempts] = await Promise.all([
                    quizService.getQuestions(block.id),
                    user ? quizService.getAttempts(user.id, block.id) : Promise.resolve([]),
                ]);
                setQuizQuestions(prev => ({ ...prev, [block.id]: questions }));
                setQuizAttempts(prev => ({ ...prev, [block.id]: attempts }));
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load lesson content.');
        } finally {
            setLoading(false);
        }
    }, [lessonId, user, router]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleQuizOptionChange = (blockId: string, questionId: string, optionIndex: number) => {
        setQuizAnswers(prev => {
            const currentAnswers = prev[blockId] || [];
            const existingIdx = currentAnswers.findIndex(a => a.questionId === questionId);

            const newAnswers = [...currentAnswers];
            if (existingIdx >= 0) {
                newAnswers[existingIdx] = { questionId, selectedOptionIndex: optionIndex };
            } else {
                newAnswers.push({ questionId, selectedOptionIndex: optionIndex });
            }

            return { ...prev, [blockId]: newAnswers };
        });
    };

    const handleSubmitQuiz = async (blockId: string) => {
        const answers = quizAnswers[blockId];
        const questions = quizQuestions[blockId];

        if (!answers || answers.length < (questions?.length || 0)) {
            alert('Please answer all questions before submitting.');
            return;
        }

        setSubmittingQuiz(blockId);
        try {
            const attempt = await quizService.submitQuiz({
                contentBlockId: blockId,
                answers: answers
            });
            setQuizAttempts(prev => ({ ...prev, [blockId]: [attempt, ...(prev[blockId] || [])] }));

            // If quiz is passed (score > 50%), maybe update progress
            if (attempt.score / attempt.totalQuestions >= 0.5) {
                // Logic to update student progress could go here
            }
        } catch (err) {
            console.error(err);
            alert('Failed to submit quiz.');
        } finally {
            setSubmittingQuiz(null);
        }
    };

    const getNextLessonId = () => {
        const currentIdx = allLessons.findIndex(l => l.id === lessonId);
        if (currentIdx >= 0 && currentIdx < allLessons.length - 1) {
            return allLessons[currentIdx + 1].id;
        }
        return null;
    };

    const getPrevLessonId = () => {
        const currentIdx = allLessons.findIndex(l => l.id === lessonId);
        if (currentIdx > 0) {
            return allLessons[currentIdx - 1].id;
        }
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
            </div>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <div className="min-h-screen bg-slate-950 text-slate-200">
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <Link
                            href={subject ? `/student/subjects/${subject.id}` : '/student'}
                            className="p-2 hover:bg-slate-800 rounded-lg transition"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-sm font-bold text-white line-clamp-1">{lesson?.title}</h1>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{subject?.title}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex flex-col items-end mr-4">
                            <p className="text-[10px] text-slate-500 font-bold uppercase">Course Progress</p>
                            <div className="w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                <div className="h-full bg-emerald-500" style={{ width: `${enrollment?.progress || 0}%` }} />
                            </div>
                        </div>
                        <Link
                            href="/student"
                            className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition"
                        >
                            Exit Player
                        </Link>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto px-6 py-12">
                    {error && (
                        <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-2xl px-6 py-4 mb-10">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-12">
                        {blocks.map((block) => (
                            <section key={block.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {block.type === 'Text' && (
                                    <div className="prose prose-invert max-w-none prose-headings:text-white prose-p:text-slate-300 prose-strong:text-indigo-300">
                                        <div dangerouslySetInnerHTML={{ __html: block.content }} />
                                    </div>
                                )}

                                {block.type === 'Video' && (
                                    <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-slate-800 ring-1 ring-white/5">
                                        <iframe
                                            src={block.content.includes('youtube.com') || block.content.includes('youtu.be')
                                                ? block.content.replace('watch?v=', 'embed/').split('&')[0]
                                                : block.content}
                                            className="w-full h-full"
                                            allowFullScreen
                                        />
                                    </div>
                                )}

                                {block.type === 'Pdf' && (
                                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 flex shadow-lg">
                                        <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500 mr-6">
                                            <File size={32} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-2">Reading Material</h3>
                                            <p className="text-slate-400 text-sm mb-4">Click below to open the PDF resource for this lesson.</p>
                                            <a
                                                href={block.content}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-5 py-2.5 rounded-xl font-bold text-sm transition"
                                            >
                                                Open PDF
                                                <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {block.type === 'Quiz' && (
                                    <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-10">
                                            <Puzzle size={120} />
                                        </div>
                                        <div className="p-8 border-b border-slate-800 bg-indigo-500/5 relative z-10">
                                            <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                                <HelpCircle className="text-indigo-500" />
                                                Knowledge Check
                                            </h3>
                                            <p className="text-indigo-200/50 text-sm mt-1">Test your understanding of the materials above.</p>
                                        </div>

                                        <div className="p-8 relative z-10">
                                            {quizAttempts[block.id]?.length > 0 && (
                                                <div className="mb-10 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Last Attempt Result</p>
                                                        <h4 className="text-2xl font-black text-white">
                                                            {quizAttempts[block.id][0].score} / {quizAttempts[block.id][0].totalQuestions} Correct
                                                        </h4>
                                                    </div>
                                                    <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                                                        <Award size={32} />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="space-y-10">
                                                {quizQuestions[block.id]?.map((q, qIdx) => (
                                                    <div key={q.id}>
                                                        <p className="text-lg font-bold text-white mb-6">
                                                            <span className="text-indigo-500 mr-2">#{qIdx + 1}</span> {q.questionText}
                                                        </p>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {q.options.map((opt, optIdx) => {
                                                                const isSelected = quizAnswers[block.id]?.find(a => a.questionId === q.id)?.selectedOptionIndex === optIdx;
                                                                return (
                                                                    <button
                                                                        key={optIdx}
                                                                        onClick={() => handleQuizOptionChange(block.id, q.id, optIdx)}
                                                                        className={`text-left p-5 rounded-2xl border transition-all duration-200 ${isSelected
                                                                            ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/20 translate-x-1'
                                                                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-center gap-4">
                                                                            <span className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-800'}`}>
                                                                                {String.fromCharCode(65 + optIdx)}
                                                                            </span>
                                                                            {opt.text}
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="mt-12 flex items-center gap-4">
                                                <button
                                                    onClick={() => handleSubmitQuiz(block.id)}
                                                    disabled={submittingQuiz === block.id || (quizAnswers[block.id]?.length || 0) < (quizQuestions[block.id]?.length || 0)}
                                                    className="flex-1 bg-indigo-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-600/30 active:scale-[0.98]"
                                                >
                                                    {submittingQuiz === block.id ? (
                                                        <div className="flex items-center justify-center gap-3">
                                                            <Loader2 className="animate-spin" />
                                                            Evaluating...
                                                        </div>
                                                    ) : 'Submit Answers'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>
                        ))}
                    </div>

                    {/* Bottom Navigation */}
                    <footer className="mt-24 pt-12 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <Link
                            href={getPrevLessonId() ? `/student/learn/${getPrevLessonId()}` : '#'}
                            className={`inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all ${getPrevLessonId()
                                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                : 'opacity-0 pointer-events-none'
                                }`}
                        >
                            <ArrowLeft size={18} />
                            Previous Lesson
                        </Link>

                        {getNextLessonId() ? (
                            <Link
                                href={`/student/learn/${getNextLessonId()}`}
                                className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/20 group"
                            >
                                Next Lesson
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link
                                href={subject ? `/student/subjects/${subject.id}` : '/student'}
                                className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                            >
                                Complete Course
                                <CheckCircle size={18} />
                            </Link>
                        )}
                    </footer>
                </main>
            </div>
        </ProtectedRoute>
    );
}
