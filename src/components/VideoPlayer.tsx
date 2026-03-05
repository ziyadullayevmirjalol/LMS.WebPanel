'use client';

import dynamic from 'next/dynamic';
import { Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// Dynamically import ReactPlayer to ensure it only renders on the client
const ReactPlayer = dynamic(() => import('react-player'), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 min-h-[200px]">
            <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
        </div>
    )
});

interface VideoPlayerProps {
    url: string;
    width?: string | number;
    height?: string | number;
    controls?: boolean;
    className?: string;
}

export default function VideoPlayer({
    url,
    width = '100%',
    height = '100%',
    controls = true,
    className = '',
}: VideoPlayerProps) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
        <div className={`relative w-full h-full min-h-[200px] ${className}`}>
            {loading && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 z-10 rounded-xl">
                    <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm text-slate-300 font-medium">Unable to load video</p>
                    <p className="text-xs text-slate-500 mt-1">Please check the URL or your connection</p>
                </div>
            )}

            <ReactPlayer
                url={url}
                width={width}
                height={height}
                controls={controls}
                onReady={() => setLoading(false)}
                onBuffer={() => setLoading(true)}
                onBufferEnd={() => setLoading(false)}
                onError={() => {
                    setLoading(false);
                    setError(true);
                }}
                className="rounded-xl overflow-hidden shadow-2xl"
                style={{ borderRadius: '12px', overflow: 'hidden' }}
            />
        </div>
    );
}
