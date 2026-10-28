import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from '../../lib/motion';
import { Eye, EyeOff, Heart, LogIn, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { DEMO_PATIENT_EMAIL, DEMO_PATIENT_PASSWORD, DEMO_HOSPITAL_EMAIL, DEMO_HOSPITAL_PASSWORD } from '../../data/seedData';
import { cn } from '../../utils/cn';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = login(data.email, data.password);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? 'Login failed');
      return;
    }

    refreshSession();
    toast.success('Welcome back!');

    if (result.session?.user.role === 'hospital') {
      navigate('/hospital/dashboard', { replace: true });
    } else {
      navigate('/patient/dashboard', { replace: true });
    }
  };

  const fillDemo = (role: 'patient' | 'hospital') => {
    if (role === 'patient') {
      setValue('email', DEMO_PATIENT_EMAIL);
      setValue('password', DEMO_PATIENT_PASSWORD);
    } else {
      setValue('email', DEMO_HOSPITAL_EMAIL);
      setValue('password', DEMO_HOSPITAL_PASSWORD);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Medi<span className="text-blue-600">Core</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Sign in to your MediCore account
          </p>
        </motion.div>

        {/* Demo Notice */}
        <motion.div
          className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start gap-3">
            <Info size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-1">
                Demo Application - College Project
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                This uses localStorage only. Data exists only in this browser. Do not enter real credentials.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Demo Account Buttons */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            type="button"
            onClick={() => fillDemo('patient')}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all text-left"
          >
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Demo Patient</span>
            <span className="text-xs text-blue-600 dark:text-blue-500 font-mono">{DEMO_PATIENT_EMAIL}</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('hospital')}
            className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-700 hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-all text-left"
          >
            <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">Demo Hospital</span>
            <span className="text-xs text-teal-600 dark:text-teal-500 font-mono">{DEMO_HOSPITAL_EMAIL}</span>
          </button>
        </motion.div>

        {/* Form Card */}
        <motion.div
          className="card p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={cn('input-field', errors.email && 'border-red-400 focus:ring-red-400')}
                placeholder="you@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={cn('input-field pr-10', errors.password && 'border-red-400 focus:ring-red-400')}
                  placeholder="Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full justify-center py-3 mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

