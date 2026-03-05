'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/services/authService';
import {
    User,
    Mail,
    Lock,
    Shield,
    CheckCircle,
    AlertCircle,
    Loader2,
    Save
} from 'lucide-react';

export default function ProfileForm() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authService.updateProfile({
                fullName: formData.fullName,
                email: formData.email,
                currentPassword: formData.currentPassword || undefined,
                newPassword: formData.newPassword || undefined
            });
            setSuccess('Profile updated successfully');
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update profile. Please check your current password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
                <div className="bg-slate-800/40 px-8 py-6 border-b border-slate-800">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <User className="text-indigo-400" size={24} />
                        Personal Information
                    </h2>
                    <p className="text-sm text-slate-400 mt-1">Update your name and email address</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {success && (
                        <div className="flex items-center gap-2 text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm">
                            <CheckCircle size={16} />
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-2 text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <User size={14} className="text-slate-600" />
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                <Mail size={14} className="text-slate-600" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                                placeholder="Enter your email"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-800">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                            <Lock className="text-amber-400" size={20} />
                            Change Password
                        </h3>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                                    placeholder="Required to change password or email"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                                        placeholder="Min 6 characters"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition outline-none"
                                        placeholder="Repeat new password"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    Save Profile Changes
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-slate-900/50 rounded-3xl border border-slate-800 p-6 flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/20">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1">Account Security</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Your account information is encrypted and protected. We recommend using a strong, unique password to keep your learning progress safe.
                    </p>
                </div>
            </div>
        </div>
    );
}
