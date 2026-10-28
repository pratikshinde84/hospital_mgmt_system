import { useMemo } from 'react';
import { format } from 'date-fns';
import { Clock, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHospitalAppointments } from '../../services/appointmentService';
import { getDoctorsByHospital } from '../../services/doctorService';
import { StatusBadge } from '../../components/common/StatusBadge';

export default function HospitalSchedule() {
  const { user } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const appointments = useMemo(() => getHospitalAppointments(user?.id ?? ''), [user?.id]);
  const doctors = useMemo(() => getDoctorsByHospital(user?.id ?? ''), [user?.id]);

  const todayAppts = appointments
    .filter((a) => a.date === today && !['cancelled','rejected'].includes(a.status))
    .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));

  const doctorMap = Object.fromEntries(doctors.map((d) => [d.id, d]));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Clock size={22} className="text-teal-600" /> Today's Schedule</h1>
        <p className="page-subtitle">{format(new Date(), 'EEEE, MMMM d, yyyy')} · {todayAppts.length} appointments</p>
      </div>

      {todayAppts.length === 0 ? (
        <div className="card p-12 text-center">
          <Clock size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">No appointments scheduled for today</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayAppts.map((appt) => (
            <div key={appt.id} className="card p-4 flex items-center gap-4">
              <div className="w-16 text-center shrink-0">
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 font-heading">{appt.timeSlot}</p>
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white">{appt.patientName}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{appt.doctorName} · {appt.department}</p>
              </div>
              <StatusBadge status={appt.status} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 card p-6">
        <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Doctor Availability Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {doctors.map((doc) => {
            const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
            const worksToday = doc.workingDays.includes(dayName);
            const docAppts = todayAppts.filter((a) => a.doctorId === doc.id).length;
            return (
              <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {doc.fullName.split(' ')[1]?.charAt(0) ?? 'D'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{doc.fullName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{docAppts} appts today</p>
                </div>
                <span className={`w-2 h-2 rounded-full shrink-0 ${worksToday && doc.isAvailable ? 'bg-green-400' : 'bg-slate-300'}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
