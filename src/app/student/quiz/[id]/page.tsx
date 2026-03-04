'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { quizService } from '@/lib/services/quizService';
import { useAuth } from '@/context/AuthContext';
import type { QuizQuestionDto, QuizAttemptDto } from '@/types/dtos';
import {
    Loader2,
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    XCircle,
    RotateCcw,
    Award
} from 'lucide-react';
import Link from 'next/link';

export default function StudentQuizPage() {
    const params = useParams();
    const router = useRouter();
    const contentBlockId = params.id as string;
    const { user } = useAuth();

    const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Result State
    const [result, setResult] = useState<QuizAttemptDto | null>(null);

    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await quizService.getQuestions(contentBlockId);
            setQuestions(data);

            // Try to load a previous attempt
            if (user) {
                try {
                    const attempts = await quizService.getAttempts(user.id, contentBlockId);
                    if (attempts && attempts.length > 0) {
                        // Show most recent attempt
                        setResult(attempts[0]);
                    }
                } catch (err) {
                    console.log('No previous attempts found or error fetching attempts.', err);
                }
            }
        } catch (err) {
            console.error(err);
            setError('Failed to load quiz questions.');
        } finally {
            setLoading(false);
        }
    }, [contentBlockId, user]);

    useEffect(() => {
        fetchQuestions();
    }, [fetchQuestions]);

    const handleSelectAnswer = (questionId: string, optionLetter: string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: optionLetter
        }));
    };

    const handleSubmitQuiz = async () => {
        if (!user) return;

        // Ensure all questions are answered
        if (Object.keys(answers).length < questions.length) {
            setError('Please answer all questions before submitting.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const attempt = await quizService.submitQuiz({
                studentId: user.id,
                contentBlockId,
                answers
            });
            setResult(attempt);
            // Optionally, scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
            console.error(err);
            setError('Failed to submit quiz. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRetake = () => {
        setResult(null);
        setAnswers({});
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Helper to calculate percentage
    const getPercentage = () => {
        if (!result) return 0;
        return Math.round((result.score / result.totalQuestions) * 100);
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
            <div className="min-h-screen bg-slate-950 py-10 px-4">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition mb-8"
                    >
                        <ArrowLeft size={14} />
                        Back to Lesson
                    </button>

                    {error && (
                        <div className="flex items-center gap-2 text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3 mb-6">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {!result ? ( // Quiz Taking View
                        <>
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-black text-white mb-3">Knowledge Check</h1>
                                <p className="text-slate-400">
                                    Answer {questions.length} question{questions.length !== 1 ? 's' : ''} to test your understanding.
                                </p>
                            </div>

                            {questions.length === 0 ? (
                                <div className="text-center py-20 bg-slate-900 rounded-3xl border border-slate-800">
                                    <p className="text-slate-400">This quiz doesn't have any questions yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {questions.map((q, idx) => (
                                        <div key={q.id} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-xl">
                                            <div className="mb-6">
                                                <span className="inline-block bg-indigo-500/10 text-indigo-400 text-xs font-bold px-3 py-1 rounded-full mb-3">
                                                    Question {idx + 1} of {questions.length}
                                                </span>
                                                <h3 className="text-xl font-medium text-white leading-relaxed">
                                                    {q.questionText}
                                                </h3>
                                            </div>

                                            <div className="space-y-3">
                                                {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                                                    const optionText = q[`option${opt}` as keyof typeof q] as string;
                                                    if (!optionText) return null; // Skip empty options

                                                    const isSelected = answers[q.id] === opt;

                                                    return (
                                                        <button
                                                            key={opt}
                                                            onClick={() => handleSelectAnswer(q.id, opt)}
                                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${isSelected
                                                                ? 'border-indigo-500 bg-indigo-500/10'
                                                                : 'border-slate-800 bg-slate-800/50 hover:border-slate-700 hover:bg-slate-800'
                                                                }`}
                                                        >
                                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${isSelected
                                                                ? 'bg-indigo-500 text-white'
                                                                : 'bg-slate-700 text-slate-400'
                                                                }`}>
                                                                {opt}
                                                            </div>
                                                            <span className={isSelected ? 'text-white font-medium' : 'text-slate-300'}>
                                                                {optionText}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))}

                                    <div className="pt-6 border-t border-slate-800 flex justify-end">
                                        <button
                                            onClick={handleSubmitQuiz}
                                            disabled={submitting || Object.keys(answers).length < questions.length}
                                            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {submitting ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <CheckCircle size={20} />
                                            )}
                                            Submit Answers
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : ( // Results View
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Score Card */}
                            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 md:p-12 text-center shadow-2xl relative overflow-hidden">
                                {getPercentage() >= 80 && (
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                )}

                                <div className="relative z-10">
                                    <div className={`h-24 w-24 rounded-full mx-auto flex items-center justify-center mb-6 shadow-xl ${getPercentage() >= 80
                                        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/40'
                                        : 'bg-slate-800 text-slate-400 shadow-slate-900/40 border border-slate-700'
                                        }`}>
                                        <Award size={48} />
                                    </div>

                                    <h2 className="text-4xl font-black text-white mb-2">
                                        {result.score} <span className="text-slate-500 text-2xl font-medium">/ {result.totalQuestions}</span>
                                    </h2>
                                    <p className={`text-xl font-bold mb-8 ${getPercentage() >= 80 ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        {getPercentage() >= 80 ? 'Excellent work! 🎉' : 'Keep practicing! 💪'}
                                    </p>

                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                        <button
                                            onClick={handleRetake}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-800 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-700 transition"
                                        >
                                            <RotateCcw size={18} />
                                            Retake Quiz
                                        </button>
                                        <button
                                            onClick={() => router.back()}
                                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
                                        >
                                            Continue Learning
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Review Answers (only showing what was correct vs incorrect, since we know correctOption) */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white px-2">Review Questions</h3>
                                {questions.map((q, idx) => {
                                    const userAnswer = answers[q.id];
                                    const isCorrect = userAnswer === q.correctOption;

                                    return (
                                        <div key={q.id} className={`rounded-2xl border p-6 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'
                                            }`}>
                                            <div className="flex items-start gap-4 mb-4">
                                                <div className={`mt-1 shrink-0 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                                </div>
                                                <div>
                                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block">
                                                        Question {idx + 1}
                                                    </span>
                                                    <p className="text-white font-medium">{q.questionText}</p>
                                                </div>
                                            </div>

                                            <div className="ml-10 space-y-2 mt-4">
                                                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                                                    <span className="text-xs text-slate-500 block mb-1">Your Answer:</span>
                                                    <p className={isCorrect ? 'text-emerald-400 font-medium' : 'text-rose-400 font-medium'}>
                                                        {q[`option${userAnswer as 'A' | 'B' | 'C' | 'D'}`]}
                                                    </p>
                                                </div>

                                                {!isCorrect && (
                                                    <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800">
                                                        <span className="text-xs text-slate-500 block mb-1">Correct Answer:</span>
                                                        <p className="text-emerald-400 font-medium">
                                                            {q[`option${q.correctOption as 'A' | 'B' | 'C' | 'D'}`]}
                                                        </p>
                                                    </div>
                                                )}

                                                {q.explanation && (
                                                    <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1 block">
                                                            Explanation
                                                        </span>
                                                        <p className="text-slate-300 text-sm">{q.explanation}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
