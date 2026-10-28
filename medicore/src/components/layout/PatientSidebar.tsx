import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  LayoutDashboard,
  Hospital,
  Stethoscope,
  CalendarPlus,
  CalendarDays,
  FileText,
  Pill,
  Bell,
  Bot,
  User,
  Settings,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotificationCount } from '../../hooks/useNotifications';
import { cn } from '../../utils/cn';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/patient/dashboard' },
  { label: 'Find Hospitals', icon: Hospital, href: '/patient/hospitals' },
  { label: 'Find Doctors', icon: Stethoscope, href: '/patient/doctors' },
  { label: 'Book Appointment', icon: CalendarPlus, href: '/patient/book' },
  { label: 'My Appointments', icon: CalendarDays, href: '/patient/appointments' },
  { label: 'Medical Records', icon: FileText, href: '/patient/records' },
  { label: 'Prescriptions', icon: Pill, href: '/patient/prescriptions' },
  { label: 'Notifications', icon: Bell, href: '/patient/notifications' },
  { label: 'AI Assistant', icon: Bot, href: '/patient/ai-assistant' },
  { label: 'Profile', icon: User, href: '/patient/profile' },
  { label: 'Settings', icon: Settings, href: '/patient/settings' },
];

interface PatientSidebarProps {
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function PatientSidebar({ onMobileClose, isMobile = false }: PatientSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const unreadCount = useNotificationCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const sidebarContent = (
    <div
      className={cn(
        'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 transition-all duration-300',
        collapsed && !isMobile ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 h-16 border-b border-slate-100 dark:border-slate-800 shrink-0', collapsed && !isMobile && 'justify-center px-0')}>
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center shrink-0">
          <Heart size={16} className="text-white" fill="white" />
        </div>
        {(!collapsed || isMobile) && (
          <span className="text-lg font-bold font-heading text-slate-900 dark:text-white whitespace-nowrap overflow-hidden">
            Medi<span className="text-blue-600">Core</span>
          </span>
        )}
        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shrink-0"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
        {isMobile && (
          <button
            onClick={onMobileClose}
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User info */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.name?.charAt(0) ?? 'P'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Patient</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={isMobile ? onMobileClose : undefined}
            className={({ isActive }) =>
              cn(
                'sidebar-link relative',
                isActive && 'active',
                collapsed && !isMobile && 'justify-center px-0'
              )
            }
            title={collapsed && !isMobile ? item.label : undefined}
          >
            <item.icon size={18} className="shrink-0" />
            {(!collapsed || isMobile) && (
              <span className="flex-1 truncate">{item.label}</span>
            )}
            {item.label === 'Notifications' && unreadCount > 0 && (!collapsed || isMobile) && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className={cn('px-3 py-3 border-t border-slate-100 dark:border-slate-800', collapsed && !isMobile && 'flex justify-center')}>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-all',
            collapsed && !isMobile && 'justify-center w-auto px-2'
          )}
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={18} className="shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return sidebarContent;
}

export function PatientLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <PatientSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="fixed left-0 top-0 h-full z-50 lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <PatientSidebar isMobile onMobileClose={() => setMobileOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 px-4 h-14 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <Heart size={14} className="text-white" fill="white" />
            </div>
            <span className="text-base font-bold font-heading text-slate-900 dark:text-white">
              Medi<span className="text-blue-600">Core</span>
            </span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

