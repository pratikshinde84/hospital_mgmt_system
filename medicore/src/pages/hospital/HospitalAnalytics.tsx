import { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getHospitalAnalytics } from '../../services/appointmentService';
import { getDoctorsByHospital } from '../../services/doctorService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, BarChart3 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function HospitalAnalytics() {
  const { user } = useAuth();
  const analytics = useMemo(() => getHospitalAnalytics(user?.id ?? ''), [user?.id]);
  const doctors = useMemo(() => getDoctorsByHospital(user?.id ?? ''), [user?.id]);

  const statusData = [
    { name: 'Pending', value: analytics.pendingAppointments, color: '#f59e0b' },
    { name: 'Confirmed', value: analytics.confirmedAppointments, color: '#3b82f6' },
    { name: 'Completed', value: analytics.completedAppointments, color: '#10b981' },
    { name: 'Cancelled', value: analytics.cancelledAppointments, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <BarChart3 size={22} className="text-teal-600" /> Analytics & Reports
        </h1>
        <p className="page-subtitle">Appointment trends and performance insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Appointments', value: analytics.totalAppointments, color: 'bg-blue-500' },
          { label: 'Completed', value: analytics.completedAppointments, color: 'bg-emerald-500' },
          { label: 'Unique Patients', value: analytics.totalPatients, color: 'bg-purple-500' },
          { label: 'Doctors', value: doctors.length, color: 'bg-teal-500' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{s.label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white font-heading">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trend Line */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-5">Appointment Trends (14 Days)</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={analytics.trends} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total" />
              <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} dot={false} name="Completed" />
              <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} dot={false} name="Cancelled" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-5">Status Distribution</h2>
          {statusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {statusData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                    <span className="text-slate-600 dark:text-slate-400">{d.name}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Department Bar */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-5">Appointments by Department</h2>
          {analytics.departmentStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.departmentStats} margin={{ top: 5, right: 10, left: -15, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="department" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Appointments" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Doctor Stats */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 dark:text-white font-heading mb-5">Doctor Performance</h2>
          {analytics.doctorStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={analytics.doctorStats.slice(0, 6)} margin={{ top: 5, right: 10, left: -15, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="doctorName" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No data yet</div>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">Analytics based on demo data in localStorage. Resets when demo data is cleared.</p>
    </div>
  );
}
