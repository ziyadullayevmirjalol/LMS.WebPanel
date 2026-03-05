'use client';

import { useState, useEffect } from 'react';
import { Loader2, AlertCircle, PlayCircle } from 'lucide-react';

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
    const [isMounted, setIsMounted] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getYoutubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center w-full h-full bg-slate-900/50 rounded-xl border border-slate-800 min-h-[200px]">
                <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const youtubeId = getYoutubeId(url);

    if (youtubeId) {
        return (
            <div className={`relative w-full aspect-video ${className} rounded-xl overflow-hidden shadow-2xl`}>
                <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0"
                />
            </div>
        );
    }

    // Fallback to video tag for other URLs (assumed direct files or supported formats)
    return (
        <div className={`relative w-full aspect-video ${className} bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800`}>
            {error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 p-4 text-center">
                    <AlertCircle className="h-8 w-8 text-amber-500 mb-2" />
                    <p className="text-sm text-slate-300 font-medium">Unable to load video</p>
                    <p className="text-xs text-slate-500 mt-1">Please check the URL: {url}</p>
                </div>
            ) : (
                <video
                    src={url}
                    controls={controls}
                    className="w-full h-full object-contain"
                    onError={() => setError(true)}
                    poster="" // Could add a poster if available
                >
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
}
