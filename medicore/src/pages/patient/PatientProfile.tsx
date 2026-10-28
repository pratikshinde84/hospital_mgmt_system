import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from '../../lib/motion';
import { User, Lock, Save, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile, changePassword, getCurrentUser } from '../../services/authService';
import type { PatientUser } from '../../types';
import { cn } from '../../utils/cn';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pinCode: z.string().optional(),
  bloodGroup: z.string().optional(),
  allergies: z.string().optional(),
  emergencyContact: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(8, 'Min 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export default function PatientProfile() {
  const { user, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);

  const currentUser = getCurrentUser() as PatientUser | undefined;

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: currentUser?.fullName ?? '',
      phone: currentUser?.phone ?? '',
      dateOfBirth: currentUser?.dateOfBirth ?? '',
      gender: currentUser?.gender,
      address: currentUser?.address ?? '',
      city: currentUser?.city ?? '',
      state: currentUser?.state ?? '',
      pinCode: currentUser?.pinCode ?? '',
      bloodGroup: currentUser?.bloodGroup ?? '',
      allergies: currentUser?.allergies ?? '',
      emergencyContact: currentUser?.emergencyContact ?? '',
    },
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    if (!user) return;
    const res = updateUserProfile(user.id, data);
    if (res.success) {
      refreshSession();
      toast.success('Profile updated successfully');
    } else {
      toast.error(res.error ?? 'Failed to update profile');
    }
  };

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    const res = changePassword(user.id, data.currentPassword, data.newPassword);
    if (res.success) {
      toast.success('Password changed successfully');
      passwordForm.reset();
    } else {
      toast.error(res.error ?? 'Failed to change password');
    }
  };

  const InputError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
        <AlertCircle size={12} /> {msg}
      </p>
    ) : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Profile Settings</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>

      {/* Avatar */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {user?.name?.charAt(0) ?? 'P'}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-lg">{user?.name}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 mt-1 text-xs">
            Patient Account
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-6 w-fit">
        {[
          { key: 'profile', label: 'Profile Info', icon: User },
          { key: 'security', label: 'Security', icon: Lock },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as 'profile' | 'security')}
            className={cn(
              'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            )}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' ? (
        <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
            <div className="card p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Full Name</label>
                  <input {...profileForm.register('fullName')} className="input-field" />
                  <InputError msg={profileForm.formState.errors.fullName?.message} />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input {...profileForm.register('phone')} className="input-field" />
                  <InputError msg={profileForm.formState.errors.phone?.message} />
                </div>
                <div>
                  <label className="label">Date of Birth</label>
                  <input type="date" {...profileForm.register('dateOfBirth')} className="input-field" />
                </div>
                <div>
                  <label className="label">Gender</label>
                  <select {...profileForm.register('gender')} className="input-field">
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Address</label>
                  <input {...profileForm.register('address')} className="input-field" placeholder="Street address" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input {...profileForm.register('city')} className="input-field" />
                </div>
                <div>
                  <label className="label">State</label>
                  <input {...profileForm.register('state')} className="input-field" />
                </div>
                <div>
                  <label className="label">PIN Code</label>
                  <input {...profileForm.register('pinCode')} className="input-field" />
                </div>
                <div>
                  <label className="label">Blood Group</label>
                  <select {...profileForm.register('bloodGroup')} className="input-field">
                    <option value="">Select</option>
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Emergency Contact</label>
                  <input {...profileForm.register('emergencyContact')} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Known Allergies (optional)</label>
                  <input {...profileForm.register('allergies')} className="input-field" placeholder="e.g., Penicillin, Peanuts (demo data only)" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="btn-primary">
                  <Save size={16} /> Save Changes
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      ) : (
        <motion.div key="security" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
            <div className="card p-6 space-y-5">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPwd ? 'text' : 'password'}
                    {...passwordForm.register('currentPassword')}
                    className="input-field pr-10"
                  />
                  <button type="button" onClick={() => setShowCurrentPwd(!showCurrentPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showCurrentPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <InputError msg={passwordForm.formState.errors.currentPassword?.message} />
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPwd ? 'text' : 'password'}
                    {...passwordForm.register('newPassword')}
                    className="input-field pr-10"
                    placeholder="Min 8 characters"
                  />
                  <button type="button" onClick={() => setShowNewPwd(!showNewPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showNewPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <InputError msg={passwordForm.formState.errors.newPassword?.message} />
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <input type="password" {...passwordForm.register('confirmPassword')} className="input-field" />
                <InputError msg={passwordForm.formState.errors.confirmPassword?.message} />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="btn-primary">
                  <Lock size={16} /> Change Password
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}

