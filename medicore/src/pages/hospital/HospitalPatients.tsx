import { useMemo, useState } from 'react';
import { motion } from '../../lib/motion';
import { format } from 'date-fns';
import { Users, Search, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHospitalAppointments } from '../../services/appointmentService';
import { getAllUsers } from '../../services/authService';
import type { PatientUser } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';

export default function HospitalPatients() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [viewPatient, setViewPatient] = useState<{ patient: PatientUser | undefined; apptCount: number; lastVisit: string } | null>(null);

  const appointments = useMemo(() => getHospitalAppointments(user?.id ?? ''), [user?.id]);
  const allUsers = useMemo(() => getAllUsers(), []);

  const patientMap = useMemo(() => {
    const map: Record<string, { appts: typeof appointments; patient: PatientUser | undefined }> = {};
    appointments.forEach((a) => {
      if (!map[a.patientId]) {
        map[a.patientId] = {
          appts: [],
          patient: allUsers.find((u) => u.id === a.patientId) as PatientUser | undefined,
        };
      }
      map[a.patientId].appts.push(a);
    });
    return map;
  }, [appointments, allUsers]);

  const patients = useMemo(() => {
    return Object.entries(patientMap)
      .map(([id, data]) => ({
        id,
        name: data.patient?.fullName ?? data.appts[0]?.patientName ?? 'Unknown',
        phone: data.patient?.phone ?? data.appts[0]?.patientPhone ?? 'â€”',
        appointments: data.appts,
        patient: data.patient,
        lastVisit: data.appts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date ?? '',
      }))
      .filter((p) => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  }, [patientMap, search]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <p className="page-subtitle">{patients.length} unique patients</p>
      </div>

      <div className="card p-4 mb-6">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patients..." className="input-field pl-9 text-sm" />
        </div>
      </div>

      {patients.length === 0 ? (
        <EmptyState icon={Users} title="No patients yet" description="Patients who book appointments will appear here." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-left">
                <tr>
                  {['Patient', 'Phone', 'Total Visits', 'Last Visit', 'Last Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {patients.map((p, i) => {
                  const lastAppt = p.appointments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
                  return (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.phone}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.appointments.length}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {p.lastVisit ? format(new Date(p.lastVisit), 'MMM d, yyyy') : 'â€”'}
                      </td>
                      <td className="px-4 py-3">{lastAppt && <StatusBadge status={lastAppt.status} />}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setViewPatient({ patient: p.patient, apptCount: p.appointments.length, lastVisit: p.lastVisit })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!viewPatient} onClose={() => setViewPatient(null)} title="Patient Details" size="sm">
        {viewPatient && (
          <div className="p-6 space-y-3 text-sm">
            {[
              { label: 'Name', value: viewPatient.patient?.fullName ?? 'Unknown' },
              { label: 'Email', value: viewPatient.patient?.email ?? 'â€”' },
              { label: 'Phone', value: viewPatient.patient?.phone ?? 'â€”' },
              { label: 'DOB', value: viewPatient.patient?.dateOfBirth ? format(new Date(viewPatient.patient.dateOfBirth), 'PPP') : 'â€”' },
              { label: 'Gender', value: viewPatient.patient?.gender ?? 'â€”' },
              { label: 'Blood Group', value: viewPatient.patient?.bloodGroup ?? 'â€”' },
              { label: 'Total Appointments', value: String(viewPatient.apptCount) },
              { label: 'Last Visit', value: viewPatient.lastVisit ? format(new Date(viewPatient.lastVisit), 'PPP') : 'â€”' },
            ].map((item) => (
              <div key={item.label} className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="font-medium text-slate-900 dark:text-white capitalize">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

