'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/login');
      return;
    }

    // Redirect to role-specific dashboard
    switch (user.role) {
      case 'Admin':
        router.replace('/admin');
        break;
      case 'Publisher':
        router.replace('/publisher');
        break;
      default:
        router.replace('/login');
        break;
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-500 border-t-transparent" />
        <span className="text-sm text-indigo-200/50">Redirecting...</span>
      </div>
    </div>
  );
}
