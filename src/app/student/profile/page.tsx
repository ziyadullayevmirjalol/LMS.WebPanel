'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardLayout, { studentNavItems } from '@/components/DashboardLayout';
import ProfileForm from '@/components/ProfileForm';

export default function StudentProfilePage() {
    return (
        <ProtectedRoute allowedRoles={['Student', 'Publisher', 'Admin']}>
            <DashboardLayout title="My Account" navItems={studentNavItems}>
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight">Personal Profile</h1>
                    <p className="text-slate-400 mt-2">Manage your learning account and preferences</p>
                </div>

                <ProfileForm />
            </DashboardLayout>
        </ProtectedRoute>
    );
}
