import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from '../../lib/motion';
import { FileText, Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getAll, setStorage, generateId } from '../../storage';
import { STORAGE_KEYS } from '../../types';
import type { MedicalRecord } from '../../types';
import { getHospitalAppointments } from '../../services/appointmentService';
import { getDoctorsByHospital } from '../../services/doctorService';
import { getAllUsers } from '../../services/authService';
import type { PatientUser } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export default function HospitalRecords() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ patientId: '', doctorId: '', visitDate: new Date().toISOString().split('T')[0], symptoms: '', diagnosis: '', treatment: '', notes: '' });

  const records = useMemo(() => getAll<MedicalRecord>(STORAGE_KEYS.MEDICAL_RECORDS).filter((r) => r.hospitalId === user?.id), [user?.id, refresh]);
  const appointments = useMemo(() => getHospitalAppointments(user?.id ?? ''), [user?.id]);
  const doctors = useMemo(() => getDoctorsByHospital(user?.id ?? ''), [user?.id]);
  const patients = useMemo(() => {
    const ids = [...new Set(appointments.map((a) => a.patientId))];
    return getAllUsers().filter((u) => ids.includes(u.id)) as PatientUser[];
  }, [appointments]);

  const handleSave = () => {
    if (!form.patientId || !form.doctorId || !form.symptoms || !form.diagnosis || !form.treatment) { toast.error('Fill all required fields'); return; }
    const patient = patients.find((p) => p.id === form.patientId);
    const doctor = doctors.find((d) => d.id === form.doctorId);
    const record: MedicalRecord = {
      id: generateId('record'), hospitalId: user!.id, hospitalName: user!.name ?? '',
      patientId: form.patientId, patientName: patient?.fullName ?? 'Unknown',
      doctorId: form.doctorId, doctorName: doctor?.fullName ?? 'Unknown',
      visitDate: form.visitDate, symptoms: form.symptoms, diagnosis: form.diagnosis,
      treatment: form.treatment, notes: form.notes, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    const all = getAll<MedicalRecord>(STORAGE_KEYS.MEDICAL_RECORDS);
    all.push(record); setStorage(STORAGE_KEYS.MEDICAL_RECORDS, all);
    toast.success('Record added'); setRefresh((r) => r + 1); setIsModalOpen(false);
    setForm({ patientId: '', doctorId: '', visitDate: new Date().toISOString().split('T')[0], symptoms: '', diagnosis: '', treatment: '', notes: '' });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Medical Records</h1><p className="page-subtitle">{records.length} records - Sample Data Only</p></div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary"><Plus size={15} /> Add Record</button>
      </div>
      <div className="mb-5 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-2">
        <AlertTriangle size={14} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">Sample Data - Not Valid Medical Documents. For demonstration purposes only.</p>
      </div>
      {records.length === 0 ? (
        <EmptyState icon={FileText} title="No records" description="Add medical records for patients." />
      ) : (
        <div className="space-y-4">
          {records.map((r, i) => (
            <motion.div key={r.id} className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white font-heading">{r.patientName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{r.doctorName} - {format(new Date(r.visitDate), 'PPP')}</p>
                </div>
                <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-700 text-xs">Sample</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50"><p className="text-xs text-slate-400 mb-1">Symptoms</p><p className="text-slate-700 dark:text-slate-300">{r.symptoms}</p></div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-blue-400 mb-1">Diagnosis</p><p className="text-slate-700 dark:text-slate-300">{r.diagnosis}</p></div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-emerald-500 mb-1">Treatment</p><p className="text-slate-700 dark:text-slate-300">{r.treatment}</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Medical Record" size="md">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Patient *</label>
              <select value={form.patientId} onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))} className="input-field">
                <option value="">Select patient</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
              </select>
            </div>
            <div><label className="label">Doctor *</label>
              <select value={form.doctorId} onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))} className="input-field">
                <option value="">Select doctor</option>
                {doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}
              </select>
            </div>
            <div><label className="label">Visit Date *</label><input type="date" value={form.visitDate} onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))} className="input-field" /></div>
          </div>
          <div><label className="label">Symptoms * (Sample Data)</label><textarea value={form.symptoms} onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))} className="input-field resize-none" rows={2} /></div>
          <div><label className="label">Diagnosis * (Sample Data)</label><input value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} className="input-field" /></div>
          <div><label className="label">Treatment * (Sample Data)</label><textarea value={form.treatment} onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))} className="input-field resize-none" rows={2} /></div>
          <div><label className="label">Notes</label><input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="input-field" /></div>
          <div className="flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Add Record</button></div>
        </div>
      </Modal>
    </div>
  );
}

