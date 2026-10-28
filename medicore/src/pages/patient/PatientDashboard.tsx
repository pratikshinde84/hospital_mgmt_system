import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  Calendar, CheckCircle, XCircle, Clock, ArrowRight,
  Hospital, Stethoscope, Bell, Bot, TrendingUp, Heart
} from 'lucide-react';
import { format, isToday, isFuture } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { getPatientAppointments } from '../../services/appointmentService';
import { getAllUsers } from '../../services/authService';
import { getDoctorsByHospital } from '../../services/doctorService';
import { getUserNotifications } from '../../services/notificationService';
import { StatusBadge } from '../../components/common/StatusBadge';
import type { HospitalUser, Appointment } from '../../types';

const HEALTH_TIPS = [
  { tip: 'Drink at least 8 glasses of water daily to stay hydrated.', icon: 'ðŸ’§' },
  { tip: 'Aim for 7â€“9 hours of sleep each night for optimal health.', icon: 'ðŸ˜´' },
  { tip: 'Take a 30-minute walk daily to improve cardiovascular health.', icon: 'ðŸš¶' },
  { tip: 'Eat a balanced diet rich in fruits, vegetables, and whole grains.', icon: 'ðŸ¥—' },
  { tip: 'Schedule regular preventive checkups with your doctor.', icon: 'ðŸ¥' },
];

function StatCard({ label, value, icon: Icon, color, sublabel }: {
  label: string; value: number; icon: typeof Calendar;
  color: string; sublabel?: string;
}) {
  return (
    <motion.div
      className="card p-5"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white font-heading">{value}</p>
      {sublabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sublabel}</p>}
    </motion.div>
  );
}

export default function PatientDashboard() {
  const { user } = useAuth();
  const appointments = useMemo(() => getPatientAppointments(user?.id ?? ''), [user?.id]);
  const notifications = useMemo(() => getUserNotifications(user?.id ?? '', 'patient'), [user?.id]);

  const hospitals = useMemo(
    () => getAllUsers().filter((u): u is HospitalUser => u.role === 'hospital'),
    []
  );

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => isFuture(new Date(a.date)) && !['cancelled', 'rejected'].includes(a.status))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 3),
    [appointments]
  );

  const nextAppointment = upcoming[0];
  const total = appointments.length;
  const completed = appointments.filter((a) => a.status === 'completed').length;
  const cancelled = appointments.filter((a) => ['cancelled', 'rejected'].includes(a.status)).length;
  const unreadNotifs = notifications.filter((n) => !n.isRead).length;

  const today = new Date().getHours();
  const greeting =
    today < 12 ? 'Good morning' : today < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <motion.h1
          className="text-2xl font-bold text-slate-900 dark:text-white font-heading"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'} ðŸ‘‹
        </motion.h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Appointments" value={total} icon={Calendar} color="bg-blue-500" />
        <StatCard label="Upcoming" value={upcoming.length} icon={Clock} color="bg-amber-500" />
        <StatCard label="Completed" value={completed} icon={CheckCircle} color="bg-emerald-500" />
        <StatCard label="Cancelled" value={cancelled} icon={XCircle} color="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Appointment */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white font-heading">
                Next Appointment
              </h2>
              <Link to="/patient/appointments" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>

            {nextAppointment ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 border border-blue-100 dark:border-blue-800">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                      <Stethoscope size={22} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{nextAppointment.doctorName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{nextAppointment.department}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{nextAppointment.hospitalName}</p>
                    </div>
                  </div>
                  <StatusBadge status={nextAppointment.status} />
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-blue-100 dark:border-blue-800 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {format(new Date(nextAppointment.date), 'PPP')}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} />
                    {nextAppointment.timeSlot}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar size={36} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">No upcoming appointments</p>
                <Link to="/patient/book" className="btn-primary mt-4 text-sm">
                  Book an Appointment
                </Link>
              </div>
            )}
          </div>

          {/* Recent Appointments */}
          {appointments.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-900 dark:text-white font-heading">Recent Appointments</h2>
                <Link to="/patient/appointments" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              <div className="space-y-3">
                {appointments.slice(0, 4).map((appt) => (
                  <div key={appt.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <Stethoscope size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{appt.doctorName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {format(new Date(appt.date), 'MMM d, yyyy')} Â· {appt.timeSlot}
                      </p>
                    </div>
                    <StatusBadge status={appt.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Hospitals */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900 dark:text-white font-heading">Nearby Hospitals</h2>
              <Link to="/patient/hospitals" className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hospitals.slice(0, 4).map((h) => (
                <Link
                  key={h.id}
                  to={`/hospitals/${h.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shrink-0">
                    <Hospital size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{h.hospitalName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{h.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Book Appointment', href: '/patient/book', icon: Calendar, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                { label: 'Find Hospitals', href: '/patient/hospitals', icon: Hospital, color: 'text-teal-600 bg-teal-50 dark:bg-teal-900/20' },
                { label: 'Find Doctors', href: '/patient/doctors', icon: Stethoscope, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
                { label: 'AI Assistant', href: '/patient/ai-assistant', icon: Bot, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
              ].map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.color}`}>
                    <action.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {action.label}
                  </span>
                  <ArrowRight size={14} className="ml-auto text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white font-heading text-sm">Notifications</h3>
              {unreadNotifs > 0 && (
                <span className="badge bg-red-50 text-red-600 text-xs">{unreadNotifs} new</span>
              )}
            </div>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No notifications yet</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className={`p-3 rounded-xl text-xs ${n.isRead ? 'bg-slate-50 dark:bg-slate-700/30' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                    <p className={`font-medium mb-0.5 ${n.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-blue-800 dark:text-blue-300'}`}>
                      {n.title}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                  </div>
                ))}
                <Link to="/patient/notifications" className="text-xs text-blue-600 dark:text-blue-400 flex items-center justify-center gap-1 pt-1">
                  View all <ArrowRight size={12} />
                </Link>
              </div>
            )}
          </div>

          {/* Health Tips */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 dark:text-white font-heading text-sm mb-3 flex items-center gap-2">
              <Heart size={15} className="text-red-500" /> Health Tip
            </h3>
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20">
              {(() => {
                const tip = HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length];
                return (
                  <>
                    <span className="text-2xl block mb-2">{tip.icon}</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{tip.tip}</p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

