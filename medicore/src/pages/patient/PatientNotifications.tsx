import { motion } from '../../lib/motion';
import { format } from 'date-fns';
import { Bell, Check, CheckCheck, Trash2, Calendar, Pill, AlertCircle, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { EmptyState } from '../../components/common/EmptyState';
import type { NotificationType } from '../../types';

const iconMap: Record<NotificationType, { icon: typeof Bell; color: string }> = {
  appointment_booked: { icon: Calendar, color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  appointment_confirmed: { icon: Check, color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  appointment_cancelled: { icon: AlertCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  appointment_rescheduled: { icon: Calendar, color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  appointment_rejected: { icon: AlertCircle, color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  appointment_completed: { icon: CheckCheck, color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  prescription_added: { icon: Pill, color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  system: { icon: Info, color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400' },
};

export default function PatientNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="badge bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {unreadCount} new
              </span>
            )}
          </h1>
          <p className="page-subtitle">{notifications.length} total notifications</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn-secondary text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="You'll receive notifications here when your appointments are updated."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => {
            const { icon: Icon, color } = iconMap[n.type] ?? iconMap.system;
            return (
              <motion.div
                key={n.id}
                className={`card p-4 flex items-start gap-4 ${!n.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                    {format(new Date(n.createdAt), 'PPp')}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

