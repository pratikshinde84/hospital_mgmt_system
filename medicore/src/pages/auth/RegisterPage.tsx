import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from '../../lib/motion';
import { Eye, EyeOff, Heart, UserPlus, AlertCircle, Info, User, Building } from 'lucide-react';
import { toast } from 'sonner';
import {
  registerPatient,
  registerHospital,
  login,
} from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import type { HospitalType } from '../../types';
import { cn } from '../../utils/cn';

const patientSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(10, 'Enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']).optional(),
    address: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const hospitalSchema = z
  .object({
    hospitalName: z.string().min(2, 'Hospital name is required'),
    email: z.string().email('Enter a valid email address'),
    contactNumber: z.string().min(10, 'Enter a valid contact number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    hospitalType: z.string().min(1, 'Select hospital type'),
    licenseNumber: z.string().min(2, 'License number is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pinCode: z.string().min(5, 'PIN code is required'),
    emergencyContact: z.string().min(10, 'Emergency contact is required'),
    description: z.string().min(10, 'Provide a brief description'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PatientForm = z.infer<typeof patientSchema>;
type HospitalForm = z.infer<typeof hospitalSchema>;

const hospitalTypes: HospitalType[] = [
  'General Hospital',
  'Specialty Hospital',
  'Teaching Hospital',
  "Children's Hospital",
  'Psychiatric Hospital',
  'Rehabilitation Center',
  'Clinic',
  'Diagnostic Center',
];

export default function RegisterPage() {
  const [role, setRole] = useState<'patient' | 'hospital'>('patient');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  const patientForm = useForm<PatientForm>({ resolver: zodResolver(patientSchema) });
  const hospitalForm = useForm<HospitalForm>({ resolver: zodResolver(hospitalSchema) });

  const onPatientSubmit = async (data: PatientForm) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = registerPatient(data as Parameters<typeof registerPatient>[0]);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? 'Registration failed');
      return;
    }

    login(data.email, data.password);
    refreshSession();
    toast.success('Account created! Welcome to MediCore.');
    navigate('/patient/dashboard', { replace: true });
  };

  const onHospitalSubmit = async (data: HospitalForm) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const result = registerHospital({ ...data, hospitalType: data.hospitalType as HospitalType } as Parameters<typeof registerHospital>[0]);
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? 'Registration failed');
      return;
    }

    login(data.email, data.password);
    refreshSession();
    toast.success('Hospital registered! Welcome to MediCore.');
    navigate('/hospital/dashboard', { replace: true });
  };

  const InputError = ({ msg }: { msg?: string }) =>
    msg ? (
      <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-600">
        <AlertCircle size={12} />
        {msg}
      </p>
    ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <span className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
              Medi<span className="text-blue-600">Core</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
            Create your account
          </h1>
        </motion.div>

        {/* Role Toggle */}
        <motion.div
          className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {(['patient', 'hospital'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                role === r
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              )}
            >
              {r === 'patient' ? <User size={16} /> : <Building size={16} />}
              {r === 'patient' ? 'Patient' : 'Hospital'}
            </button>
          ))}
        </motion.div>

        {/* Demo Notice */}
        <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-start gap-2">
          <Info size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Demo application. Data stored in browser localStorage only. Do not use real personal information.
          </p>
        </div>

        <motion.div
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <AnimatePresence mode="wait">
            {role === 'patient' ? (
              <motion.form
                key="patient"
                onSubmit={patientForm.handleSubmit(onPatientSubmit)}
                className="space-y-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Full Name *</label>
                    <input
                      {...patientForm.register('fullName')}
                      className={cn('input-field', patientForm.formState.errors.fullName && 'border-red-400')}
                      placeholder="Aarav Sharma"
                    />
                    <InputError msg={patientForm.formState.errors.fullName?.message} />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      {...patientForm.register('email')}
                      className={cn('input-field', patientForm.formState.errors.email && 'border-red-400')}
                      placeholder="aarav@example.com"
                    />
                    <InputError msg={patientForm.formState.errors.email?.message} />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      {...patientForm.register('phone')}
                      className={cn('input-field', patientForm.formState.errors.phone && 'border-red-400')}
                      placeholder="+91 98765 43210"
                    />
                    <InputError msg={patientForm.formState.errors.phone?.message} />
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...patientForm.register('password')}
                        className={cn('input-field pr-10', patientForm.formState.errors.password && 'border-red-400')}
                        placeholder="Min 8 characters"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <InputError msg={patientForm.formState.errors.password?.message} />
                  </div>
                  <div>
                    <label className="label">Confirm Password *</label>
                    <input
                      type="password"
                      {...patientForm.register('confirmPassword')}
                      className={cn('input-field', patientForm.formState.errors.confirmPassword && 'border-red-400')}
                      placeholder="Repeat password"
                    />
                    <InputError msg={patientForm.formState.errors.confirmPassword?.message} />
                  </div>
                  <div>
                    <label className="label">Date of Birth</label>
                    <input
                      type="date"
                      {...patientForm.register('dateOfBirth')}
                      className="input-field"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="label">Gender</label>
                    <select {...patientForm.register('gender')} className="input-field">
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">Prefer not to say</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Address</label>
                    <input
                      {...patientForm.register('address')}
                      className="input-field"
                      placeholder="Street, City, State"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full justify-center py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : (
                    <><UserPlus size={16} /> Create Patient Account</>
                  )}
                </button>
              </motion.form>
            ) : (
              <motion.form
                key="hospital"
                onSubmit={hospitalForm.handleSubmit(onHospitalSubmit)}
                className="space-y-4"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="label">Hospital Name *</label>
                    <input
                      {...hospitalForm.register('hospitalName')}
                      className={cn('input-field', hospitalForm.formState.errors.hospitalName && 'border-red-400')}
                      placeholder="Apollo MediCare Hospital"
                    />
                    <InputError msg={hospitalForm.formState.errors.hospitalName?.message} />
                  </div>
                  <div>
                    <label className="label">Email *</label>
                    <input
                      type="email"
                      {...hospitalForm.register('email')}
                      className={cn('input-field', hospitalForm.formState.errors.email && 'border-red-400')}
                      placeholder="info@hospital.com"
                    />
                    <InputError msg={hospitalForm.formState.errors.email?.message} />
                  </div>
                  <div>
                    <label className="label">Contact Number *</label>
                    <input
                      {...hospitalForm.register('contactNumber')}
                      className={cn('input-field', hospitalForm.formState.errors.contactNumber && 'border-red-400')}
                      placeholder="+91 22 6789 0123"
                    />
                    <InputError msg={hospitalForm.formState.errors.contactNumber?.message} />
                  </div>
                  <div>
                    <label className="label">Password *</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        {...hospitalForm.register('password')}
                        className={cn('input-field pr-10', hospitalForm.formState.errors.password && 'border-red-400')}
                        placeholder="Min 8 characters"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <InputError msg={hospitalForm.formState.errors.password?.message} />
                  </div>
                  <div>
                    <label className="label">Confirm Password *</label>
                    <input
                      type="password"
                      {...hospitalForm.register('confirmPassword')}
                      className={cn('input-field', hospitalForm.formState.errors.confirmPassword && 'border-red-400')}
                      placeholder="Repeat password"
                    />
                    <InputError msg={hospitalForm.formState.errors.confirmPassword?.message} />
                  </div>
                  <div>
                    <label className="label">Hospital Type *</label>
                    <select
                      {...hospitalForm.register('hospitalType')}
                      className={cn('input-field', hospitalForm.formState.errors.hospitalType && 'border-red-400')}
                    >
                      <option value="">Select type</option>
                      {hospitalTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <InputError msg={hospitalForm.formState.errors.hospitalType?.message} />
                  </div>
                  <div>
                    <label className="label">License Number *</label>
                    <input
                      {...hospitalForm.register('licenseNumber')}
                      className={cn('input-field', hospitalForm.formState.errors.licenseNumber && 'border-red-400')}
                      placeholder="MH-HOSP-2024-XXXX"
                    />
                    <InputError msg={hospitalForm.formState.errors.licenseNumber?.message} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Street Address *</label>
                    <input
                      {...hospitalForm.register('address')}
                      className={cn('input-field', hospitalForm.formState.errors.address && 'border-red-400')}
                      placeholder="12, Hospital Road"
                    />
                    <InputError msg={hospitalForm.formState.errors.address?.message} />
                  </div>
                  <div>
                    <label className="label">City *</label>
                    <input
                      {...hospitalForm.register('city')}
                      className={cn('input-field', hospitalForm.formState.errors.city && 'border-red-400')}
                      placeholder="Mumbai"
                    />
                    <InputError msg={hospitalForm.formState.errors.city?.message} />
                  </div>
                  <div>
                    <label className="label">State *</label>
                    <input
                      {...hospitalForm.register('state')}
                      className={cn('input-field', hospitalForm.formState.errors.state && 'border-red-400')}
                      placeholder="Maharashtra"
                    />
                    <InputError msg={hospitalForm.formState.errors.state?.message} />
                  </div>
                  <div>
                    <label className="label">PIN Code *</label>
                    <input
                      {...hospitalForm.register('pinCode')}
                      className={cn('input-field', hospitalForm.formState.errors.pinCode && 'border-red-400')}
                      placeholder="400001"
                    />
                    <InputError msg={hospitalForm.formState.errors.pinCode?.message} />
                  </div>
                  <div>
                    <label className="label">Emergency Contact *</label>
                    <input
                      {...hospitalForm.register('emergencyContact')}
                      className={cn('input-field', hospitalForm.formState.errors.emergencyContact && 'border-red-400')}
                      placeholder="+91 22 6789 9999"
                    />
                    <InputError msg={hospitalForm.formState.errors.emergencyContact?.message} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Hospital Description *</label>
                    <textarea
                      {...hospitalForm.register('description')}
                      className={cn('input-field resize-none', hospitalForm.formState.errors.description && 'border-red-400')}
                      rows={3}
                      placeholder="Brief description of your hospital and services..."
                    />
                    <InputError msg={hospitalForm.formState.errors.description?.message} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registering...' : (
                    <><Building size={16} /> Register Hospital</>
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

