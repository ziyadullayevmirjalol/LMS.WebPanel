'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { studentNavItems } from '@/components/DashboardLayout';
import { subjectService } from '@/lib/services/contentService';
import { enrollmentService } from '@/lib/services/enrollmentService';
import { useAuth } from '@/context/AuthContext';
import type { SubjectDto, EnrollmentDto } from '@/types/dtos';
import {
    BookOpen,
    Search,
    Loader2,
    AlertCircle,
    ExternalLink,
    CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

export default function StudentExplorePage() {
    const { user } = useAuth();
    const [subjects, setSubjects] = useState<SubjectDto[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<EnrollmentDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            console.log('[Explore] Fetching data...');
            const [allSubjects, enrollments] = await Promise.all([
                subjectService.getAll(),
                user ? enrollmentService.getByStudent(user.id) : Promise.resolve([]),
            ]);
            console.log('[Explore] Subjects fetched:', allSubjects);
            console.log('[Explore] Enrollments fetched:', enrollments);
            setSubjects(allSubjects);
            setMyEnrollments(enrollments);
        } catch (err) {
            console.error('[Explore] Fetch error:', err);
            setError('Failed to load courses.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isEnrolled = (subjectId: string) => {
        return myEnrollments.some((e) => e.subjectId === subjectId);
    };

    const filteredSubjects = subjects.filter((s) =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <DashboardLayout title="Explore Courses" navItems={studentNavItems}>
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Explore Courses</h1>
                    <p className="text-slate-400">Discover new subjects and start learning today.</p>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8 max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        placeholder="Search for subjects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                ) : filteredSubjects.length === 0 ? (
                    <div className="text-center py-24">
                        <BookOpen className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400">No courses found</h3>
                        <p className="text-sm text-slate-500">Try adjusting your search query.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredSubjects.map((subject) => (
                            <div
                                key={subject.id}
                                className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col group hover:border-slate-700 transition shadow-lg"
                            >
                                <div className="h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center relative">
                                    <BookOpen className="h-12 w-12 text-indigo-500/40" />
                                    {isEnrolled(subject.id) && (
                                        <div className="absolute top-3 right-3 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                            <CheckCircle size={16} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                                        {subject.title}
                                    </h3>
                                    <p className="text-sm text-slate-400 mb-6 line-clamp-3">
                                        {subject.description}
                                    </p>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-xs text-slate-500">
                                            By {subject.publisherName || 'LMS Team'}
                                        </span>
                                        <Link
                                            href={`/student/subjects/${subject.id}`}
                                            className={`inline-flex items-center gap-1 text-sm font-semibold transition px-4 py-2 rounded-lg ${isEnrolled(subject.id)
                                                ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                                                : 'text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20'
                                                }`}
                                        >
                                            {isEnrolled(subject.id) ? 'Continue Learning' : 'View Details'}
                                            <ExternalLink size={14} />
                                        </Link>
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
