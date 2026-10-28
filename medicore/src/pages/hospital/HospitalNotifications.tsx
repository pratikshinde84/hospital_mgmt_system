import { motion } from '../../lib/motion';
import { format } from 'date-fns';
import { Bell, Check, CheckCheck, Trash2, Calendar, Info } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { EmptyState } from '../../components/common/EmptyState';

export default function HospitalNotifications() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2">Notifications {unreadCount > 0 && <span className="badge bg-red-100 text-red-600">{unreadCount} new</span>}</h1>
          <p className="page-subtitle">{notifications.length} total</p>
        </div>
        {unreadCount > 0 && <button onClick={markAllAsRead} className="btn-secondary text-sm"><CheckCheck size={15} /> Mark all read</button>}
      </div>
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="Hospital notifications will appear here." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n, i) => (
            <motion.div key={n.id} className={`card p-4 flex items-start gap-3 ${!n.isRead ? 'border-l-4 border-l-teal-500' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${!n.isRead ? 'bg-teal-100 dark:bg-teal-900/30 text-teal-600' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                <Bell size={15} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{n.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-xs text-slate-400 mt-1">{format(new Date(n.createdAt), 'PPp')}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!n.isRead && <button onClick={() => markAsRead(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all" title="Mark read"><Check size={13} /></button>}
                <button onClick={() => deleteNotification(n.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete"><Trash2 size={13} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

