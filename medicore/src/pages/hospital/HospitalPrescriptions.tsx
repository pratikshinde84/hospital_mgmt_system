import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { motion } from '../../lib/motion';
import { Pill, Plus, AlertTriangle, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getAll, setStorage, generateId } from '../../storage';
import { STORAGE_KEYS } from '../../types';
import type { Prescription, Medication } from '../../types';
import { getDoctorsByHospital } from '../../services/doctorService';
import { getAllUsers } from '../../services/authService';
import type { PatientUser } from '../../types';
import { getHospitalAppointments } from '../../services/appointmentService';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';

export default function HospitalPrescriptions() {
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [form, setForm] = useState({ patientId: '', doctorId: '', diagnosis: '', instructions: '', issueDate: new Date().toISOString().split('T')[0], validUntil: '' });
  const [meds, setMeds] = useState<Medication[]>([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);

  const prescriptions = useMemo(() => getAll<Prescription>(STORAGE_KEYS.PRESCRIPTIONS).filter((r) => r.hospitalId === user?.id), [user?.id, refresh]);
  const appointments = useMemo(() => getHospitalAppointments(user?.id ?? ''), [user?.id]);
  const doctors = useMemo(() => getDoctorsByHospital(user?.id ?? ''), [user?.id]);
  const patients = useMemo(() => {
    const ids = [...new Set(appointments.map((a) => a.patientId))];
    return getAllUsers().filter((u) => ids.includes(u.id)) as PatientUser[];
  }, [appointments]);

  const addMed = () => setMeds((m) => [...m, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  const updateMed = (i: number, field: keyof Medication, val: string) => setMeds((m) => m.map((med, idx) => idx === i ? { ...med, [field]: val } : med));
  const removeMed = (i: number) => setMeds((m) => m.filter((_, idx) => idx !== i));

  const handleSave = () => {
    if (!form.patientId || !form.doctorId || !form.diagnosis || meds[0].name === '') { toast.error('Fill all required fields and add at least one medication'); return; }
    const patient = patients.find((p) => p.id === form.patientId);
    const doctor = doctors.find((d) => d.id === form.doctorId);
    const rx: Prescription = {
      id: generateId('rx'), hospitalId: user!.id, hospitalName: user!.name ?? '',
      patientId: form.patientId, patientName: patient?.fullName ?? 'Unknown',
      doctorId: form.doctorId, doctorName: doctor?.fullName ?? 'Unknown',
      medications: meds, diagnosis: form.diagnosis, instructions: form.instructions,
      issueDate: form.issueDate, validUntil: form.validUntil || undefined, createdAt: new Date().toISOString(),
    };
    const all = getAll<Prescription>(STORAGE_KEYS.PRESCRIPTIONS);
    all.push(rx); setStorage(STORAGE_KEYS.PRESCRIPTIONS, all);
    toast.success('Prescription added'); setRefresh((r) => r + 1); setIsModalOpen(false);
    setForm({ patientId: '', doctorId: '', diagnosis: '', instructions: '', issueDate: new Date().toISOString().split('T')[0], validUntil: '' });
    setMeds([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Prescriptions</h1><p className="page-subtitle">{prescriptions.length} prescriptions - Sample Data Only</p></div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary"><Plus size={15} /> Add Prescription</button>
      </div>
      <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center gap-2">
        <AlertTriangle size={13} className="text-amber-600 shrink-0" />
        <p className="text-xs text-amber-700 dark:text-amber-400">Sample Data - Not Valid Medical Documents.</p>
      </div>
      {prescriptions.length === 0 ? (
        <EmptyState icon={Pill} title="No prescriptions" description="Add prescriptions for patients." />
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx, i) => (
            <motion.div key={rx.id} className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white font-heading">{rx.patientName}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{rx.doctorName} - {format(new Date(rx.issueDate), 'PPP')}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-0.5">{rx.diagnosis}</p>
                </div>
                <span className="badge bg-amber-50 text-amber-700 text-xs">Sample</span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-700">
                <table className="w-full text-xs"><thead className="bg-slate-50 dark:bg-slate-700/50"><tr>{['Medication','Dosage','Frequency','Duration'].map((h) => <th key={h} className="px-3 py-2 text-left font-semibold text-slate-600 dark:text-slate-400">{h}</th>)}</tr></thead>
                  <tbody>{rx.medications.map((m, j) => <tr key={j} className="border-t border-slate-100 dark:border-slate-700"><td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{m.name}</td><td className="px-3 py-2 text-slate-600 dark:text-slate-400">{m.dosage}</td><td className="px-3 py-2 text-slate-600 dark:text-slate-400">{m.frequency}</td><td className="px-3 py-2 text-slate-600 dark:text-slate-400">{m.duration}</td></tr>)}</tbody>
                </table>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Prescription" size="lg">
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Patient *</label><select value={form.patientId} onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))} className="input-field"><option value="">Select</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}</select></div>
            <div><label className="label">Doctor *</label><select value={form.doctorId} onChange={(e) => setForm((f) => ({ ...f, doctorId: e.target.value }))} className="input-field"><option value="">Select</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.fullName}</option>)}</select></div>
            <div><label className="label">Diagnosis *</label><input value={form.diagnosis} onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Issue Date</label><input type="date" value={form.issueDate} onChange={(e) => setForm((f) => ({ ...f, issueDate: e.target.value }))} className="input-field" /></div>
            <div className="col-span-2"><label className="label">Instructions</label><textarea value={form.instructions} onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))} className="input-field resize-none" rows={2} /></div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2"><label className="label mb-0">Medications *</label><button type="button" onClick={addMed} className="text-xs text-blue-600 font-medium">+ Add</button></div>
            {meds.map((m, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                <input placeholder="Medication name" value={m.name} onChange={(e) => updateMed(i, 'name', e.target.value)} className="input-field text-xs py-1.5 col-span-2" />
                <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} className="input-field text-xs py-1.5" />
                <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMed(i, 'frequency', e.target.value)} className="input-field text-xs py-1.5" />
                <input placeholder="Duration" value={m.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} className="input-field text-xs py-1.5" />
                {meds.length > 1 && <button type="button" onClick={() => removeMed(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Add Prescription</button></div>
        </div>
      </Modal>
    </div>
  );
}

