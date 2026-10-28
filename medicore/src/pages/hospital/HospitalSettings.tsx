import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Moon, Sun, Monitor, Lock, RefreshCw, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { changePassword } from '../../services/authService';
import { resetAllDemoData } from '../../storage/initStorage';
import { ConfirmDialog } from '../../components/common/Modal';
import { cn } from '../../utils/cn';

const pwSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type PwForm = z.infer<typeof pwSchema>;

export default function HospitalSettings() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });

  const onPwSubmit: SubmitHandler<PwForm> = (data) => {
    if (!user) return;
    const res = changePassword(user.id, data.currentPassword, data.newPassword);
    if (res.success) { toast.success('Password changed'); reset(); }
    else toast.error(res.error ?? 'Failed');
  };

  const handleReset = () => { resetAllDemoData(); toast.success('Demo data reset'); setResetConfirm(false); setTimeout(() => window.location.reload(), 1500); };

  const THEMES = [{ value: 'light', label: 'Light', icon: Sun }, { value: 'dark', label: 'Dark', icon: Moon }, { value: 'system', label: 'System', icon: Monitor }] as const;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="page-header"><h1 className="page-title">Settings</h1><p className="page-subtitle">Manage preferences</p></div>
      <div className="space-y-5">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Appearance</h3>
          <div className="flex gap-3">
            {THEMES.map((t) => (
              <button key={t.value} onClick={() => setTheme(t.value)}
                className={cn('flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all', theme === t.value ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/20' : 'border-slate-200 dark:border-slate-700')}>
                <t.icon size={18} className={theme === t.value ? 'text-teal-600' : 'text-slate-500'} />
                <span className={cn('text-xs font-medium', theme === t.value ? 'text-teal-700 dark:text-teal-400' : 'text-slate-600 dark:text-slate-400')}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2"><Lock size={15} /> Change Password</h3>
          <form onSubmit={handleSubmit(onPwSubmit)} className="space-y-4">
            <div><label className="label">Current Password</label><input type="password" {...register('currentPassword')} className="input-field" /></div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} {...register('newPassword')} className="input-field pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPwd ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
              {errors.newPassword && <p className="text-xs text-red-600 mt-1">{String(errors.newPassword.message)}</p>}
            </div>
            <div><label className="label">Confirm Password</label><input type="password" {...register('confirmPassword')} className="input-field" />{errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{String(errors.confirmPassword.message)}</p>}</div>
            <button type="submit" className="btn-primary"><Lock size={14} /> Change Password</button>
          </form>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-2">Reset Demo Data</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">Revert all sample data back to defaults.</p>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 mb-4 flex items-start gap-2">
            <AlertTriangle size={13} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">This overwrites all current data. Cannot be undone.</p>
          </div>
          <button onClick={() => setResetConfirm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium">
            <RefreshCw size={14} /> Reset Demo Data
          </button>
        </div>
      </div>
      <ConfirmDialog isOpen={resetConfirm} onClose={() => setResetConfirm(false)} onConfirm={handleReset} title="Reset Demo Data" message="Reset all sample data?" confirmLabel="Reset" variant="warning" />
    </div>
  );
}
