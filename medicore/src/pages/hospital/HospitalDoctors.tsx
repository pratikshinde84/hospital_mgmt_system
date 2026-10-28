import { useState, useMemo } from 'react';
import { motion } from '../../lib/motion';
import { Plus, Search, Edit2, Trash2, Stethoscope, X, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getDoctorsByHospital, addDoctor, updateDoctor, deleteDoctor } from '../../services/doctorService';
import type { Doctor } from '../../types';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { cn } from '../../utils/cn';

const SPECIALIZATIONS = [
  'Cardiologist', 'Neurologist', 'Orthopedic Surgeon', 'Pediatrician',
  'Dermatologist', 'ENT Specialist', 'Gynecologist', 'Ophthalmologist',
  'Psychiatrist', 'General Physician', 'Oncologist', 'Radiologist',
  'Cardiac Surgeon', 'Gastroenterologist', 'Urologist', 'Endocrinologist',
];

const DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Dentistry',
  'Gynecology', 'Cardiac Surgery', 'Psychiatry', 'Oncology', 'Radiology',
];

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const DEFAULT_SLOTS = [
  { id: 's1', startTime: '09:00', endTime: '09:30', isAvailable: true },
  { id: 's2', startTime: '09:30', endTime: '10:00', isAvailable: true },
  { id: 's3', startTime: '10:00', endTime: '10:30', isAvailable: true },
  { id: 's4', startTime: '10:30', endTime: '11:00', isAvailable: true },
  { id: 's5', startTime: '11:00', endTime: '11:30', isAvailable: true },
  { id: 's6', startTime: '11:30', endTime: '12:00', isAvailable: true },
  { id: 's7', startTime: '14:00', endTime: '14:30', isAvailable: true },
  { id: 's8', startTime: '14:30', endTime: '15:00', isAvailable: true },
  { id: 's9', startTime: '15:00', endTime: '15:30', isAvailable: true },
  { id: 's10', startTime: '15:30', endTime: '16:00', isAvailable: true },
];

interface DoctorForm {
  fullName: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  workingDays: string[];
  biography: string;
  isAvailable: boolean;
  email: string;
  phone: string;
}

const defaultForm: DoctorForm = {
  fullName: '', specialization: '', department: '', qualification: '',
  experience: 1, consultationFee: 500, workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  biography: '', isAvailable: true, email: '', phone: '',
};

export default function HospitalDoctors() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<DoctorForm>(defaultForm);
  const [formError, setFormError] = useState('');
  const [refresh, setRefresh] = useState(0);

  const doctors = useMemo(() => getDoctorsByHospital(user?.id ?? ''), [user?.id, refresh]);

  const filtered = doctors.filter((d) =>
    !search || d.fullName.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingDoctor(null);
    setForm(defaultForm);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setForm({
      fullName: doc.fullName, specialization: doc.specialization, department: doc.department,
      qualification: doc.qualification, experience: doc.experience, consultationFee: doc.consultationFee,
      workingDays: doc.workingDays, biography: doc.biography, isAvailable: doc.isAvailable,
      email: doc.email ?? '', phone: doc.phone ?? '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!form.fullName || !form.specialization || !form.department || !form.qualification) {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (!user) return;

    if (editingDoctor) {
      updateDoctor(editingDoctor.id, form);
      toast.success('Doctor updated');
    } else {
      addDoctor({ ...form, hospitalId: user.id, timeSlots: DEFAULT_SLOTS });
      toast.success('Doctor added');
    }
    setRefresh((r) => r + 1);
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteDoctor(deleteId);
    toast.success('Doctor removed');
    setRefresh((r) => r + 1);
    setDeleteId(null);
  };

  const handleToggleAvailability = (doc: Doctor) => {
    updateDoctor(doc.id, { isAvailable: !doc.isAvailable });
    toast.success(`${doc.fullName} marked as ${!doc.isAvailable ? 'available' : 'unavailable'}`);
    setRefresh((r) => r + 1);
  };

  const toggleDay = (day: string) => {
    setForm((f) => ({
      ...f,
      workingDays: f.workingDays.includes(day)
        ? f.workingDays.filter((d) => d !== day)
        : [...f.workingDays, day],
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Doctors</h1>
          <p className="page-subtitle">{doctors.length} doctors on staff</p>
        </div>
        <button onClick={openAdd} className="btn-primary">
          <Plus size={16} /> Add Doctor
        </button>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search doctors..."
            className="input-field pl-9 text-sm"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Stethoscope}
          title="No doctors yet"
          description="Add your first doctor to start managing appointments."
          action={<button onClick={openAdd} className="btn-primary">Add Doctor</button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              className="card p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                    {doc.fullName.split(' ')[1]?.charAt(0) ?? 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{doc.fullName}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{doc.specialization}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleAvailability(doc)}
                  className={`p-1 rounded-lg transition-colors ${doc.isAvailable ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                  title={doc.isAvailable ? 'Mark unavailable' : 'Mark available'}
                >
                  {doc.isAvailable ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-4">
                <p>{doc.department}</p>
                <p>{doc.qualification}</p>
                <p>{doc.experience} years experience</p>
                <p className="font-medium text-slate-900 dark:text-white">Rs. {doc.consultationFee} per consultation</p>
                <p>Works: {doc.workingDays.map((d) => d.slice(0, 3)).join(', ')}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className={`badge text-xs ${doc.isAvailable ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20'}`}>
                  {doc.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(doc)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => setDeleteId(doc.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
        size="lg"
      >
        <div className="p-6 space-y-4">
          {formError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl text-sm text-red-600">
              <AlertCircle size={14} /> {formError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="input-field" placeholder="Dr. Full Name" />
            </div>
            <div>
              <label className="label">Specialization *</label>
              <select value={form.specialization} onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))} className="input-field">
                <option value="">Select</option>
                {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Department *</label>
              <select value={form.department} onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))} className="input-field">
                <option value="">Select</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Qualification *</label>
              <input value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} className="input-field" placeholder="MBBS, MD..." />
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input type="number" min={0} value={form.experience} onChange={(e) => setForm((f) => ({ ...f, experience: +e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Consultation Fee (Rs.)</label>
              <input type="number" min={0} value={form.consultationFee} onChange={(e) => setForm((f) => ({ ...f, consultationFee: +e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Working Days</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border',
                      form.workingDays.includes(day)
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Biography</label>
              <textarea
                value={form.biography}
                onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))}
                className="input-field resize-none"
                rows={3}
                placeholder="Brief professional biography... [Demo Profile - Sample Data]"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editingDoctor ? 'Update Doctor' : 'Add Doctor'}</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Remove Doctor"
        message="Are you sure you want to remove this doctor? Their appointment history will remain."
        confirmLabel="Remove"
        variant="danger"
      />
    </div>
  );
}

