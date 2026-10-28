import { useState, useMemo } from 'react';
import { motion } from '../../lib/motion';
import { format } from 'date-fns';
import { Calendar, Search, Filter, Download, RefreshCw, X, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  getPatientAppointments,
  updateAppointmentStatus,
  rescheduleAppointment,
} from '../../services/appointmentService';
import { getDoctorById } from '../../services/doctorService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import type { Appointment, AppointmentStatus } from '../../types';

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function PatientAppointments() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleAppt, setRescheduleAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [refresh, setRefresh] = useState(0);

  const appointments = useMemo(
    () => getPatientAppointments(user?.id ?? ''),
    [user?.id, refresh]
  );

  const filtered = useMemo(() => {
    return appointments
      .filter((a) => {
        const q = search.toLowerCase();
        const matchSearch =
          !q ||
          a.doctorName.toLowerCase().includes(q) ||
          a.hospitalName.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q) ||
          a.id.toLowerCase().includes(q);
        const today = new Date().toISOString().split('T')[0];
        const matchStatus =
          statusFilter === 'all' ||
          (statusFilter === 'upcoming' ? a.date >= today && !['cancelled', 'rejected', 'completed'].includes(a.status) : a.status === statusFilter);
        return matchSearch && matchStatus;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [appointments, search, statusFilter]);

  const handleCancel = () => {
    if (!cancelId) return;
    const res = updateAppointmentStatus(cancelId, 'cancelled', 'Cancelled by patient');
    if (res.success) {
      toast.success('Appointment cancelled');
      setRefresh((r) => r + 1);
    } else {
      toast.error(res.error ?? 'Failed to cancel');
    }
    setCancelId(null);
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

  const exportCSV = () => {
    const rows = [
      ['ID', 'Doctor', 'Hospital', 'Department', 'Date', 'Time', 'Status', 'Fee'],
      ...filtered.map((a) => [
        a.id, a.doctorName, a.hospitalName, a.department,
        a.date, a.timeSlot, a.status, `Rs.${a.consultationFee}`,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'appointments.csv';
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Appointments exported');
  };

  const getSlots = (appt: Appointment) => {
    const doctor = getDoctorById(appt.doctorId);
    return doctor?.timeSlots.map((s) => s.startTime) ?? [];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">My Appointments</h1>
          <p className="page-subtitle">{appointments.length} total appointments</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm">
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appointments..."
            className="input-field pl-9 py-2 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No appointments found"
          description="Book your first appointment to get started."
          action={
            <a href="/patient/book" className="btn-primary">
              Book Appointment
            </a>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((appt, i) => (
            <motion.div
              key={appt.id}
              className="card p-5"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-900 dark:text-white">{appt.doctorName}</p>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {appt.department} - {appt.hospitalName}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={11}/>{format(new Date(appt.date), 'PPP')}</span>
                    <span className="flex items-center gap-1"><Clock size={11}/>{appt.timeSlot}</span>
                    <span>Rs. {appt.consultationFee}</span>
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ID: {appt.id}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {['pending', 'confirmed', 'rescheduled'].includes(appt.status) && (
                    <>
                      <button
                        onClick={() => {
                          setRescheduleAppt(appt);
                          setNewDate('');
                          setNewTime('');
                        }}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        <RefreshCw size={13} /> Reschedule
                      </button>
                      <button
                        onClick={() => setCancelId(appt.id)}
                        className="btn-danger text-xs py-1.5 px-3"
                      >
                        <X size={13} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel Confirm */}
      <ConfirmDialog
        isOpen={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={handleCancel}
        title="Cancel Appointment"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        confirmLabel="Yes, Cancel"
        variant="danger"
      />

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleAppt}
        onClose={() => setRescheduleAppt(null)}
        title="Reschedule Appointment"
        size="sm"
      >
        <div className="p-6 space-y-4">
          {rescheduleAppt && (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Rescheduling appointment with <strong>{rescheduleAppt.doctorName}</strong>
              </p>
              <div>
                <label className="label">New Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">New Time Slot</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="input-field"
                >
                  <option value="">Select time</option>
                  {getSlots(rescheduleAppt).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setRescheduleAppt(null)} className="btn-secondary">Cancel</button>
                <button onClick={handleReschedule} className="btn-primary">Confirm Reschedule</button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

