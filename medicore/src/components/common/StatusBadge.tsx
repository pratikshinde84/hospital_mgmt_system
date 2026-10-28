import type { AppointmentStatus } from '../../types';
import { cn } from '../../utils/cn';

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-50 text-amber-700 border border-amber-200',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-blue-50 text-blue-700 border border-blue-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-600 border border-red-200',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-red-50 text-red-600 border border-red-200',
  },
  rescheduled: {
    label: 'Rescheduled',
    className: 'bg-purple-50 text-purple-700 border border-purple-200',
  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'badge font-medium',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
