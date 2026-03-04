'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import { lessonService, contentBlockService } from '@/lib/services/contentService';
import { quizService } from '@/lib/services/quizService';
import type {
    LessonDto,
    ContentBlockDto,
    ContentBlockCreateDto,
    QuizQuestionDto,
    QuizQuestionCreateDto,
} from '@/types/dtos';
import { ContentType } from '@/types/dtos';
import {
    FileText,
    Video,
    Puzzle,
    File,
    PlusCircle,
    Loader2,
    AlertCircle,
    X,
    ArrowLeft,
    ChevronDown,
} from 'lucide-react';
import Link from 'next/link';

const blockTypeIcons: Record<ContentType, React.ReactNode> = {
    [ContentType.Text]: <FileText size={16} className="text-blue-400" />,
    [ContentType.Video]: <Video size={16} className="text-rose-400" />,
    [ContentType.Quiz]: <Puzzle size={16} className="text-amber-400" />,
    [ContentType.Pdf]: <File size={16} className="text-emerald-400" />,
};

const blockTypeColors: Record<ContentType, string> = {
    [ContentType.Text]: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    [ContentType.Video]: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    [ContentType.Quiz]: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    [ContentType.Pdf]: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
};

export default function LessonDetailPage() {
    const params = useParams();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<LessonDto | null>(null);
    const [blocks, setBlocks] = useState<ContentBlockDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Content block creation
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockLoading, setBlockLoading] = useState(false);
    const [newBlock, setNewBlock] = useState<ContentBlockCreateDto>({
        lessonId: lessonId,
        type: ContentType.Text,
        contentText: '',
        mediaUrl: '',
        orderIndex: 0,
    });

    // Quiz management
    const [expandedQuizBlock, setExpandedQuizBlock] = useState<string | null>(null);
    const [quizQuestions, setQuizQuestions] = useState<Record<string, QuizQuestionDto[]>>(
        {}
    );
    const [showQuizModal, setShowQuizModal] = useState<string | null>(null);
    const [quizLoading, setQuizLoading] = useState(false);
    const [newQuestion, setNewQuestion] = useState<Omit<QuizQuestionCreateDto, 'contentBlockId'>>({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '',
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [lessonData, blocksData] = await Promise.all([
                lessonService.getById(lessonId),
                contentBlockService.getByLesson(lessonId),
            ]);
            setLesson(lessonData);
            setBlocks(blocksData);
        } catch {
            setError('Failed to load lesson data.');
        } finally {
            setLoading(false);
        }
    }, [lessonId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        setBlockLoading(true);
        try {
            const created = await contentBlockService.create({
                ...newBlock,
                lessonId,
                orderIndex: blocks.length + 1,
            });
            setBlocks((prev) => [...prev, created]);
            setNewBlock({ lessonId: lessonId, type: ContentType.Text, contentText: '', mediaUrl: '', orderIndex: 0 });
            setShowBlockModal(false);
        } catch {
            setError('Failed to create content block.');
        } finally {
            setBlockLoading(false);
        }
    };

    const handleLoadQuizQuestions = async (blockId: string) => {
        if (expandedQuizBlock === blockId) {
            setExpandedQuizBlock(null);
            return;
        }
        setExpandedQuizBlock(blockId);
        try {
            const questions = await quizService.getQuestions(blockId);
            setQuizQuestions((prev) => ({ ...prev, [blockId]: questions }));
        } catch {
            setError('Failed to load quiz questions.');
        }
    };

    const handleAddQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!showQuizModal) return;
        setQuizLoading(true);
        try {
            const created = await quizService.addQuestion({
                ...newQuestion,
                contentBlockId: showQuizModal,
            });
            setQuizQuestions((prev) => ({
                ...prev,
                [showQuizModal]: [...(prev[showQuizModal] || []), created],
            }));
            setNewQuestion({
                questionText: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                correctOption: 'A',
                explanation: '',
            });
            setShowQuizModal(null);
        } catch {
            setError('Failed to add question.');
        } finally {
            setQuizLoading(false);
        }
    };

    return (
        <ProtectedRoute allowedRoles={['Publisher', 'Admin']}>
            <DashboardLayout title="Publisher" navItems={publisherNavItems}>
                {lesson && (
                    <Link
                        href={`/publisher/modules/${lesson.moduleId}`}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition mb-6"
                    >
                        <ArrowLeft size={14} />
                        Back to Lessons
                    </Link>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-24">
                        <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{lesson?.title}</h1>
                                <p className="text-sm text-slate-400 mt-1">{lesson?.description}</p>
                            </div>
                            <button
                                onClick={() => setShowBlockModal(true)}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 text-sm font-medium"
                            >
                                <PlusCircle size={16} />
                                Add Content Block
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6 text-sm">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {blocks.length === 0 ? (
                            <div className="text-center py-20">
                                <FileText className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-400 mb-1">
                                    No content blocks yet
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Add text, video, quiz, or PDF blocks to build this lesson
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {blocks
                                    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                    .map((block, idx) => (
                                        <div key={block.id}>
                                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                                                            <span className="text-sm font-bold text-slate-400">
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {blockTypeIcons[block.type]}
                                                            <span
                                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${blockTypeColors[block.type]}`}
                                                            >
                                                                {ContentType[block.type]}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {block.type === ContentType.Quiz && (
                                                        <button
                                                            onClick={() => handleLoadQuizQuestions(block.id)}
                                                            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
                                                        >
                                                            {expandedQuizBlock === block.id ? 'Hide' : 'Show'}{' '}
                                                            Questions
                                                            <ChevronDown
                                                                size={14}
                                                                className={`transition-transform ${expandedQuizBlock === block.id ? 'rotate-180' : ''
                                                                    }`}
                                                            />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="mt-3 text-sm text-slate-300 bg-slate-800/50 rounded-lg p-3 max-h-32 overflow-auto">
                                                    <pre className="whitespace-pre-wrap font-sans">
                                                        {block.type === ContentType.Text || block.type === ContentType.Quiz ? block.contentText : block.mediaUrl}
                                                    </pre>
                                                </div>
                                            </div>

                                            {/* Quiz Questions Expansion */}
                                            {block.type === ContentType.Quiz && expandedQuizBlock === block.id && (
                                                <div className="ml-14 mt-2 space-y-2">
                                                    {(quizQuestions[block.id] || []).map((q, qIdx) => (
                                                        <div
                                                            key={q.id}
                                                            className="bg-slate-900/60 rounded-lg border border-slate-800 p-4"
                                                        >
                                                            <p className="text-sm font-medium text-white mb-2">
                                                                Q{qIdx + 1}: {q.questionText}
                                                            </p>
                                                            <div className="space-y-1">
                                                                <div className={`text-xs px-2 py-1 rounded ${q.correctOption === 'A' ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-400'}`}>
                                                                    A. {q.optionA} {q.correctOption === 'A' && ' ✓'}
                                                                </div>
                                                                <div className={`text-xs px-2 py-1 rounded ${q.correctOption === 'B' ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-400'}`}>
                                                                    B. {q.optionB} {q.correctOption === 'B' && ' ✓'}
                                                                </div>
                                                                {q.optionC && (
                                                                    <div className={`text-xs px-2 py-1 rounded ${q.correctOption === 'C' ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-400'}`}>
                                                                        C. {q.optionC} {q.correctOption === 'C' && ' ✓'}
                                                                    </div>
                                                                )}
                                                                {q.optionD && (
                                                                    <div className={`text-xs px-2 py-1 rounded ${q.correctOption === 'D' ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-400'}`}>
                                                                        D. {q.optionD} {q.correctOption === 'D' && ' ✓'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            {q.explanation && (
                                                                <p className="text-xs text-slate-500 mt-2 italic">
                                                                    {q.explanation}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <button
                                                        onClick={() => setShowQuizModal(block.id)}
                                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition px-3 py-2"
                                                    >
                                                        <PlusCircle size={12} />
                                                        Add Question
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </>
                )}

                {/* ── Create Content Block Modal ── */}
                {showBlockModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Add Content Block
                                </h2>
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateBlock} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Type
                                    </label>
                                    <select
                                        value={newBlock.type}
                                        onChange={(e) =>
                                            setNewBlock((prev) => ({
                                                ...prev,
                                                type: Number(e.target.value) as ContentType,
                                            }))
                                        }
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white text-sm transition"
                                    >
                                        <option value={ContentType.Text}>Text</option>
                                        <option value={ContentType.Video}>Video</option>
                                        <option value={ContentType.Quiz}>Quiz</option>
                                        <option value={ContentType.Pdf}>PDF</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Content
                                    </label>
                                    <textarea
                                        required
                                        rows={5}
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition resize-none font-mono"
                                        placeholder={
                                            newBlock.type === ContentType.Text
                                                ? 'Enter text content...'
                                                : newBlock.type === ContentType.Video
                                                    ? 'Enter video URL...'
                                                    : newBlock.type === ContentType.Pdf
                                                        ? 'Enter PDF URL...'
                                                        : 'Quiz block — add questions after creating'
                                        }
                                        value={(newBlock.type === ContentType.Text || newBlock.type === ContentType.Quiz ? newBlock.contentText : newBlock.mediaUrl) || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (newBlock.type === ContentType.Text || newBlock.type === ContentType.Quiz) {
                                                setNewBlock((prev) => ({ ...prev, contentText: val, mediaUrl: '' }));
                                            } else {
                                                setNewBlock((prev) => ({ ...prev, mediaUrl: val, contentText: '' }));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowBlockModal(false)}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={blockLoading}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {blockLoading ? 'Creating...' : 'Add Block'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── Add Quiz Question Modal ── */}
                {showQuizModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-white">
                                    Add Quiz Question
                                </h2>
                                <button
                                    onClick={() => setShowQuizModal(null)}
                                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleAddQuestion} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Question
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
                                        placeholder="What is...?"
                                        value={newQuestion.questionText}
                                        onChange={(e) =>
                                            setNewQuestion((prev) => ({
                                                ...prev,
                                                questionText: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Options
                                    </label>
                                    <div className="space-y-4">
                                        {(['A', 'B', 'C', 'D'] as const).map((optStr) => (
                                            <div key={optStr} className="flex items-center gap-2">
                                                <input
                                                    type="radio"
                                                    name="correctOption"
                                                    checked={newQuestion.correctOption === optStr}
                                                    onChange={() =>
                                                        setNewQuestion((prev) => ({
                                                            ...prev,
                                                            correctOption: optStr,
                                                        }))
                                                    }
                                                    className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 focus:ring-emerald-500"
                                                />
                                                <input
                                                    type="text"
                                                    required={optStr === 'A' || optStr === 'B'} // Minimum 2 options
                                                    className="flex-1 rounded-lg py-2 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm transition"
                                                    placeholder={`Option ${optStr}`}
                                                    value={newQuestion[`option${optStr}` as keyof typeof newQuestion] as string}
                                                    onChange={(e) =>
                                                        setNewQuestion((prev) => ({
                                                            ...prev,
                                                            [`option${optStr}`]: e.target.value,
                                                        }))
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">
                                        Explanation (optional)
                                    </label>
                                    <input
                                        type="text"
                                        className="block w-full rounded-lg py-2.5 px-3 bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm transition"
                                        placeholder="Why is this the correct answer?"
                                        value={newQuestion.explanation}
                                        onChange={(e) =>
                                            setNewQuestion((prev) => ({
                                                ...prev,
                                                explanation: e.target.value,
                                            }))
                                        }
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowQuizModal(null)}
                                        className="flex-1 py-2.5 px-4 rounded-lg border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={quizLoading}
                                        className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 disabled:opacity-50 transition"
                                    >
                                        {quizLoading ? 'Adding...' : 'Add Question'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
