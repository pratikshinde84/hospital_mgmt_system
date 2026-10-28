import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Save, Building, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentUser, updateUserProfile } from '../../services/authService';
import type { HospitalUser } from '../../types';
import { cn } from '../../utils/cn';

const schema = z.object({
  hospitalName: z.string().min(2),
  contactNumber: z.string().min(10),
  emergencyContact: z.string().min(10),
  description: z.string().min(10),
  address: z.string().min(5),
  city: z.string().min(2),
  state: z.string().min(2),
  pinCode: z.string().min(5),
  website: z.string().optional(),
});

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DEPARTMENTS_LIST = ['General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','ENT','Ophthalmology','Dentistry','Gynecology','Oncology','Psychiatry'];
const FACILITIES_LIST = ['Emergency Department','ICU','Pharmacy','Laboratory','Radiology','Ambulance','Operation Theatre','Inpatient Services','Parking','Cardiac ICU'];

export default function HospitalProfile() {
  const { user, refreshSession } = useAuth();
  const hospital = getCurrentUser() as HospitalUser | undefined;
  const [workingHours, setWorkingHours] = useState(hospital?.workingHours ?? {
    monday:{isOpen:true,openTime:'09:00',closeTime:'18:00'},
    tuesday:{isOpen:true,openTime:'09:00',closeTime:'18:00'},
    wednesday:{isOpen:true,openTime:'09:00',closeTime:'18:00'},
    thursday:{isOpen:true,openTime:'09:00',closeTime:'18:00'},
    friday:{isOpen:true,openTime:'09:00',closeTime:'18:00'},
    saturday:{isOpen:true,openTime:'09:00',closeTime:'14:00'},
    sunday:{isOpen:false,openTime:'',closeTime:''},
  });
  const [departments, setDepartments] = useState<string[]>(hospital?.departments ?? []);
  const [facilities, setFacilities] = useState<string[]>(hospital?.facilities ?? []);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      hospitalName: hospital?.hospitalName ?? '',
      contactNumber: hospital?.contactNumber ?? '',
      emergencyContact: hospital?.emergencyContact ?? '',
      description: hospital?.description ?? '',
      address: hospital?.address ?? '',
      city: hospital?.city ?? '',
      state: hospital?.state ?? '',
      pinCode: hospital?.pinCode ?? '',
      website: hospital?.website ?? '',
    },
  });

  const toggleDept = (d: string) => setDepartments((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  const toggleFac = (f: string) => setFacilities((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (!user) return;
    const res = updateUserProfile(user.id, { ...data, workingHours, departments, facilities });
    if (res.success) { refreshSession(); toast.success('Profile updated'); }
    else toast.error(res.error ?? 'Failed');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Building size={22} className="text-teal-600" /> Hospital Profile</h1>
        <p className="page-subtitle">Update your hospital's public information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Hospital Name</label>
              <input {...register('hospitalName')} className="input-field" />
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input {...register('contactNumber')} className="input-field" />
            </div>
            <div>
              <label className="label">Emergency Contact</label>
              <input {...register('emergencyContact')} className="input-field" />
            </div>
            <div>
              <label className="label">Website</label>
              <input {...register('website')} className="input-field" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea {...register('description')} className="input-field resize-none" rows={3} />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Street Address</label>
              <input {...register('address')} className="input-field" />
            </div>
            <div><label className="label">City</label><input {...register('city')} className="input-field" /></div>
            <div><label className="label">State</label><input {...register('state')} className="input-field" /></div>
            <div><label className="label">PIN Code</label><input {...register('pinCode')} className="input-field" /></div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-4 flex items-center gap-2">
            <Clock size={16} className="text-teal-600" /> Working Hours
          </h2>
          <div className="space-y-3">
            {DAYS.map((day) => {
              const sch = workingHours[day as keyof typeof workingHours];
              return (
                <div key={day} className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 w-32">
                    <input type="checkbox" checked={sch.isOpen} onChange={(e) => setWorkingHours((h) => ({ ...h, [day]: { ...sch, isOpen: e.target.checked } }))} className="rounded" id={`open-${day}`} />
                    <label htmlFor={`open-${day}`} className="text-sm capitalize text-slate-700 dark:text-slate-300">{day}</label>
                  </div>
                  {sch.isOpen && (
                    <>
                      <input type="time" value={sch.openTime} onChange={(e) => setWorkingHours((h) => ({ ...h, [day]: { ...sch, openTime: e.target.value } }))} className="input-field w-32 py-1.5 text-sm" />
                      <span className="text-slate-400 text-sm">to</span>
                      <input type="time" value={sch.closeTime} onChange={(e) => setWorkingHours((h) => ({ ...h, [day]: { ...sch, closeTime: e.target.value } }))} className="input-field w-32 py-1.5 text-sm" />
                    </>
                  )}
                  {!sch.isOpen && <span className="text-xs text-red-500">Closed</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Departments */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Departments</h2>
          <div className="flex flex-wrap gap-2">
            {DEPARTMENTS_LIST.map((d) => (
              <button key={d} type="button" onClick={() => toggleDept(d)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border', departments.includes(d) ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300')}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Facilities */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Facilities</h2>
          <div className="flex flex-wrap gap-2">
            {FACILITIES_LIST.map((f) => (
              <button key={f} type="button" onClick={() => toggleFac(f)}
                className={cn('px-3 py-1.5 rounded-xl text-xs font-medium transition-all border', facilities.includes(f) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300')}>
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary"><Save size={16} /> Save Profile</button>
        </div>
      </form>
    </div>
  );
}
