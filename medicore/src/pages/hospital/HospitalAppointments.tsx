import { useState, useMemo } from 'react';
import { motion } from '../../lib/motion';
import { format } from 'date-fns';
import { Search, X, CheckCircle, XCircle, RefreshCw, Eye, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  getHospitalAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
} from '../../services/appointmentService';
import { getDoctorById } from '../../services/doctorService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import type { Appointment, AppointmentStatus } from '../../types';

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
  { label: 'Rejected', value: 'rejected' },
];

export default function HospitalAppointments() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [refresh, setRefresh] = useState(0);

  const [viewAppt, setViewAppt] = useState<Appointment | null>(null);
  const [actionAppt, setActionAppt] = useState<{ id: string; action: AppointmentStatus } | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  const appointments = useMemo(
    () => getHospitalAppointments(user?.id ?? ''),
    [user?.id, refresh]
  );

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          a.patientName.toLowerCase().includes(q) ||
          a.doctorName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || a.status === statusFilter;
        const matchDate = !dateFilter || a.date === dateFilter;
        return matchSearch && matchStatus && matchDate;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, search, statusFilter, dateFilter]);

  const handleAction = () => {
    if (!actionAppt) return;
    const reason = actionAppt.action === 'rejected' ? rejectReason : undefined;
    const res = updateAppointmentStatus(actionAppt.id, actionAppt.action, reason);
    if (res.success) {
      toast.success(`Appointment ${actionAppt.action}`);
      setRefresh((r) => r + 1);
    } else {
      toast.error(res.error ?? 'Action failed');
    }
    setActionAppt(null);
    setRejectReason('');
  };

  const handleReschedule = () => {
    if (!rescheduleAppt || !newDate || !newTime) {
      toast.error('Please select a new date and time');
      return;
    }
    const res = rescheduleAppointment(rescheduleAppt.id, newDate, newTime);
    if (res.success) {
      toast.success('Appointment rescheduled');
      setRefresh((r) => r + 1);
      setRescheduleAppt(null);
    } else {
      toast.error(res.error ?? 'Failed to reschedule');
    }
  };

  const getSlots = (appt: Appointment) => {
    return getDoctorById(appt.doctorId)?.timeSlots.map((s) => s.startTime) ?? [];
  };

  const actionLabel = actionAppt?.action === 'confirmed' ? 'Confirm' :
    actionAppt?.action === 'rejected' ? 'Reject' :
    actionAppt?.action === 'completed' ? 'Mark Completed' : 'Cancel';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Appointment Management</h1>
        <p className="page-subtitle">{appointments.length} total appointments</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by patient, doctor..."
              className="input-field pl-9 py-2 text-sm"
            />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={14} /></button>}
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field w-auto py-2 text-sm"
          />
          {dateFilter && <button onClick={() => setDateFilter('')} className="text-xs text-red-500 hover:text-red-700"><X size={14} /></button>}
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f.value ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={RefreshCw} title="No appointments found" description="Appointments will appear here when patients book." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-left">
                <tr>
                  {['Appt ID', 'Patient', 'Doctor', 'Dept', 'Date', 'Time', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filtered.map((appt, i) => (
                  <motion.tr
                    key={appt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400 font-mono">{appt.id.slice(-8)}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{appt.patientName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{appt.doctorName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{appt.department}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{format(new Date(appt.date), 'MMM d, yyyy')}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{appt.timeSlot}</td>
                    <td className="px-4 py-3"><StatusBadge status={appt.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewAppt(appt)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        {appt.status === 'pending' && (
                          <>
                            <button
                              onClick={() => setActionAppt({ id: appt.id, action: 'confirmed' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all"
                              title="Confirm"
                            >
                              <CheckCircle size={14} />
                            </button>
                            <button
                              onClick={() => setActionAppt({ id: appt.id, action: 'rejected' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </button>
                          </>
                        )}
                        {['confirmed', 'rescheduled'].includes(appt.status) && (
                          <>
                            <button
                              onClick={() => setActionAppt({ id: appt.id, action: 'completed' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                              title="Mark Completed"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => { setRescheduleAppt(appt); setNewDate(''); setNewTime(''); }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all"
                              title="Reschedule"
                            >
                              <RefreshCw size={14} />
                            </button>
                            <button
                              onClick={() => setActionAppt({ id: appt.id, action: 'cancelled' })}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewAppt} onClose={() => setViewAppt(null)} title="Appointment Details" size="md">
        {viewAppt && (
          <div className="p-6 space-y-4">
            {[
              { label: 'Appointment ID', value: viewAppt.id },
              { label: 'Patient', value: viewAppt.patientName },
              { label: 'Doctor', value: viewAppt.doctorName },
              { label: 'Department', value: viewAppt.department },
              { label: 'Date', value: format(new Date(viewAppt.date), 'PPP') },
              { label: 'Time', value: viewAppt.timeSlot },
              { label: 'Consultation Fee', value: `Rs. ${viewAppt.consultationFee}` },
              { label: 'Status', value: viewAppt.status },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">{item.label}</span>
                <span className="text-sm font-medium text-slate-900 dark:text-white capitalize">
                  {item.label === 'Status' ? <StatusBadge status={viewAppt.status} /> : item.value}
                </span>
              </div>
            ))}
            {viewAppt.reason && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                <p className="text-xs text-slate-500 mb-1">Reason for Visit</p>
                <p className="text-sm text-slate-700 dark:text-slate-300">{viewAppt.reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Confirm */}
      <Modal
        isOpen={!!actionAppt}
        onClose={() => { setActionAppt(null); setRejectReason(''); }}
        title={`${actionLabel} Appointment`}
        size="sm"
      >
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to {actionLabel.toLowerCase()} this appointment?
          </p>
          {actionAppt?.action === 'rejected' && (
            <div>
              <label className="label">Rejection Reason (optional)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="input-field resize-none"
                rows={2}
                placeholder="Reason for rejection..."
              />
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setActionAppt(null); setRejectReason(''); }} className="btn-secondary">Cancel</button>
            <button
              onClick={handleAction}
              className={actionAppt?.action === 'confirmed' || actionAppt?.action === 'completed' ? 'btn-primary' : 'btn-danger'}
            >
              {actionLabel}
            </button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal isOpen={!!rescheduleAppt} onClose={() => setRescheduleAppt(null)} title="Reschedule Appointment" size="sm">
        <div className="p-6 space-y-4">
          <div>
            <label className="label">New Date</label>
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="input-field" />
          </div>
          <div>
            <label className="label">New Time Slot</label>
            <select value={newTime} onChange={(e) => setNewTime(e.target.value)} className="input-field">
              <option value="">Select time</option>
              {rescheduleAppt && getSlots(rescheduleAppt).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRescheduleAppt(null)} className="btn-secondary">Cancel</button>
            <button onClick={handleReschedule} className="btn-primary">Confirm</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

