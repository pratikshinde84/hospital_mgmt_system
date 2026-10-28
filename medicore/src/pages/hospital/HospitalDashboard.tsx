import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { format } from 'date-fns';
import {
  Calendar, CheckCircle, Clock, Users, Stethoscope,
  ArrowRight, TrendingUp, Building, XCircle
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { getHospitalAppointments, getHospitalAnalytics } from '../../services/appointmentService';
import { getDoctorsByHospital } from '../../services/doctorService';
import { getUserNotifications } from '../../services/notificationService';
import { StatusBadge } from '../../components/common/StatusBadge';

const PIE_COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'];

function StatCard({ label, value, icon: Icon, colorClass, delta }: {
  label: string; value: number; icon: typeof Calendar;
  colorClass: string; delta?: string;
}) {
  return (
    <motion.div className="card p-5" whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-900 dark:text-white font-heading">{value}</p>
      {delta && <p className="text-xs text-slate-400 mt-1">{delta}</p>}
    </motion.div>
  );
}

export default function HospitalDashboard() {
  const { user } = useAuth();
  const hospitalId = user?.id ?? '';

  const appointments = useMemo(() => getHospitalAppointments(hospitalId), [hospitalId]);
  const doctors = useMemo(() => getDoctorsByHospital(hospitalId), [hospitalId]);
  const notifications = useMemo(() => getUserNotifications(hospitalId, 'hospital'), [hospitalId]);
  const analytics = useMemo(() => getHospitalAnalytics(hospitalId), [hospitalId]);

  const today = new Date().toISOString().split('T')[0];
  const todayAppts = appointments.filter((a) => a.date === today);
  const pending = appointments.filter((a) => a.status === 'pending');
  const recent = [...appointments]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pieData = analytics.departmentStats
    .slice(0, 5)
    .map((d) => ({ name: d.department, value: d.count }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <motion.h1
          className="text-2xl font-bold text-slate-900 dark:text-white font-heading"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Welcome, {user?.name}
        </motion.h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} Â· Hospital Dashboard
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Appointments" value={analytics.totalAppointments} icon={Calendar} colorClass="bg-blue-500" />
        <StatCard label="Today's Appointments" value={analytics.todayAppointments} icon={Clock} colorClass="bg-teal-500" />
        <StatCard label="Pending Requests" value={analytics.pendingAppointments} icon={TrendingUp} colorClass="bg-amber-500" />
        <StatCard label="Completed" value={analytics.completedAppointments} icon={CheckCircle} colorClass="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Confirmed" value={analytics.confirmedAppointments} icon={CheckCircle} colorClass="bg-blue-400" />
        <StatCard label="Cancelled/Rejected" value={analytics.cancelledAppointments} icon={XCircle} colorClass="bg-red-500" />
        <StatCard label="Total Doctors" value={doctors.length} icon={Stethoscope} colorClass="bg-purple-500" />
        <StatCard label="Unique Patients" value={analytics.totalPatients} icon={Users} colorClass="bg-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointment Trends */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-5">
            Appointment Trends â€” Last 14 Days
          </h2>
          {analytics.trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={analytics.trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" />
                <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} dot={false} name="Pending" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No data available yet
            </div>
          )}
        </div>

        {/* Dept Distribution */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-5">
            By Department
          </h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v} appointments`, '']} contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{d.name}</span>
                    </div>
                    <span className="font-medium text-slate-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No appointments yet
            </div>
          )}
        </div>

        {/* Pending Requests */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white font-heading">Pending Requests</h2>
            <Link to="/hospital/appointments" className="text-sm text-blue-600 flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {pending.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pending.slice(0, 4).map((appt) => (
                <div key={appt.id} className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{appt.patientName}</p>
                    <StatusBadge status={appt.status} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {appt.doctorName} Â· {format(new Date(appt.date), 'MMM d')} at {appt.timeSlot}
                  </p>
                </div>
              ))}
              {pending.length > 4 && (
                <p className="text-xs text-slate-400 text-center">+{pending.length - 4} more</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Appointments */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white font-heading">Recent Appointments</h2>
            <Link to="/hospital/appointments" className="text-sm text-blue-600 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">No appointments yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 dark:text-slate-400 text-left">
                    <th className="pb-2 font-medium">Patient</th>
                    <th className="pb-2 font-medium">Doctor</th>
                    <th className="pb-2 font-medium">Date</th>
                    <th className="pb-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {recent.map((a) => (
                    <tr key={a.id}>
                      <td className="py-2.5 font-medium text-slate-900 dark:text-white">{a.patientName}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{a.doctorName}</td>
                      <td className="py-2.5 text-slate-600 dark:text-slate-400">{format(new Date(a.date), 'MMM d')}</td>
                      <td className="py-2.5"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Doctor Availability */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 dark:text-white font-heading text-sm">Doctors</h2>
            <Link to="/hospital/doctors" className="text-sm text-blue-600 flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {doctors.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">No doctors added yet</p>
          ) : (
            <div className="space-y-3">
              {doctors.slice(0, 4).map((d) => (
                <div key={d.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {d.fullName.split(' ')[1]?.charAt(0) ?? 'D'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{d.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{d.specialization}</p>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${d.isAvailable ? 'bg-green-400' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

