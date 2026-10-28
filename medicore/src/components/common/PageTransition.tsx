import { motion } from '../../lib/motion';

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// Animated page heading with underline draw effect
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative inline-block">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">{title}</h1>
        <motion.div
          className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      {subtitle && (
        <motion.p
          className="text-sm text-slate-500 dark:text-slate-400 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}

// Animated stat card with number count-up
export function AnimatedStatCard({
  label, value, icon: Icon, color, sublabel, delay = 0
}: {
  label: string; value: number | string; icon: React.ElementType;
  color: string; sublabel?: string; delay?: number;
}) {
  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200, damping: 20 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <motion.div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}
          whileHover={{ rotate: 15, scale: 1.15 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
        >
          <Icon size={18} className="text-white" />
        </motion.div>
      </div>
      <motion.p
        className="text-3xl font-bold text-slate-900 dark:text-white font-heading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.2 }}
      >
        {value}
      </motion.p>
      {sublabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sublabel}</p>}
    </motion.div>
  );
}
