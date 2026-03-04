'use client';

import { useState, useEffect, useCallback } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import { moduleService } from '@/lib/services/contentService';
import type { ModuleDto } from '@/types/dtos';
import {
    Layers,
    Loader2,
    AlertCircle,
    ExternalLink,
    Search,
} from 'lucide-react';
import Link from 'next/link';

export default function PublisherModulesPage() {
    const [modules, setModules] = useState<ModuleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchModules = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await moduleService.getPublisherModules();
            setModules(data);
        } catch (err) {
            console.error('[PublisherModules] Fetch error:', err);
            setError('Failed to load modules.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchModules();
    }, [fetchModules]);

    const filteredModules = modules.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <ProtectedRoute allowedRoles={['Publisher']}>
            <DashboardLayout title="Modules" navItems={publisherNavItems}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-white">All Modules</h1>
                        <p className="text-sm text-slate-400 mt-1">
                            Browse and manage all modules across your subjects
                        </p>
                    </div>

                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search modules..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                        />
                    </div>
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
                ) : filteredModules.length === 0 ? (
                    <div className="text-center py-24 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                        <Layers className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-400 mb-1">
                            {searchQuery ? 'No matching modules found' : 'No modules yet'}
                        </h3>
                        <p className="text-sm text-slate-500">
                            {searchQuery ? 'Try a different search term' : 'Modules will appear here once you create them within your subjects'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredModules.map((module) => (
                            <div
                                key={module.id}
                                className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                        <Layers size={20} />
                                    </div>
                                    <Link
                                        href={`/publisher/modules/${module.id}`}
                                        className="text-slate-500 hover:text-white transition"
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                </div>
                                <h3 className="text-white font-medium mb-1 line-clamp-1">
                                    {module.title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>Order: {module.orderIndex}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span>Subject: {module.subjectId.substring(0, 8)}...</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </DashboardLayout>
        </ProtectedRoute>
    );
}
