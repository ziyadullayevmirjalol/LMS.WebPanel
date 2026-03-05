'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { publisherNavItems } from '@/components/DashboardLayout';
import ProfileForm from '@/components/ProfileForm';

export default function PublisherProfilePage() {
    return (
        <ProtectedRoute allowedRoles={['Publisher']}>
            <DashboardLayout title="Publisher Panel" navItems={publisherNavItems}>
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">Publisher Profile</h1>
                    <p className="text-slate-400 mt-2">Manage your account and credentials</p>
                </div>

                <ProfileForm />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
