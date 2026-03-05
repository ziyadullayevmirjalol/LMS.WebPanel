'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { adminNavItems } from '@/components/DashboardLayout';
import ProfileForm from '@/components/ProfileForm';

export default function AdminProfilePage() {
    return (
        <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout title="Admin Portal" navItems={adminNavItems}>
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your administrative profile and security</p>
                </div>

                <ProfileForm />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
