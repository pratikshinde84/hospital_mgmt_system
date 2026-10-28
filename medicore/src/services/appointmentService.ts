import type { Appointment, AppointmentStatus, Notification, RescheduleRecord } from '../types';
import { STORAGE_KEYS } from '../types';
import { getAll, create, update, findWhere, generateId, getStorage, setStorage } from '../storage';
import { format } from 'date-fns';

// ============================================================
// Appointment CRUD
// ============================================================

export function getAllAppointments(): Appointment[] {
  return getAll<Appointment>(STORAGE_KEYS.APPOINTMENTS);
}

export function getAppointmentById(id: string): Appointment | undefined {
  return getAllAppointments().find((a) => a.id === id);
}

export function getPatientAppointments(patientId: string): Appointment[] {
  return findWhere<Appointment>(STORAGE_KEYS.APPOINTMENTS, (a) => a.patientId === patientId);
}

export function getHospitalAppointments(hospitalId: string): Appointment[] {
  return findWhere<Appointment>(STORAGE_KEYS.APPOINTMENTS, (a) => a.hospitalId === hospitalId);
}

export function getDoctorAppointments(doctorId: string): Appointment[] {
  return findWhere<Appointment>(STORAGE_KEYS.APPOINTMENTS, (a) => a.doctorId === doctorId);
}

// ============================================================
// Booking Validation
// ============================================================

export function checkSlotAvailability(
  doctorId: string,
  date: string,
  timeSlot: string,
  excludeAppointmentId?: string
): boolean {
  const appointments = getAllAppointments();
  return !appointments.some(
    (a) =>
      a.doctorId === doctorId &&
      a.date === date &&
      a.timeSlot === timeSlot &&
      a.id !== excludeAppointmentId &&
      !['cancelled', 'rejected'].includes(a.status)
  );
}

export function hasExistingBooking(
  patientId: string,
  doctorId: string,
  date: string,
  timeSlot: string
): boolean {
  const appointments = getAllAppointments();
  return appointments.some(
    (a) =>
      a.patientId === patientId &&
      a.doctorId === doctorId &&
      a.date === date &&
      a.timeSlot === timeSlot &&
      !['cancelled', 'rejected'].includes(a.status)
  );
}

// ============================================================
// Book Appointment
// ============================================================

export interface BookingData {
  patientId: string;
  patientName: string;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  reason?: string;
  consultationFee: number;
}

export function bookAppointment(
  data: BookingData
): { success: boolean; error?: string; appointment?: Appointment } {
  // Validate date is not in the past
  const appointmentDate = new Date(data.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    return { success: false, error: 'Cannot book appointments for past dates.' };
  }

  // Check duplicate
  if (hasExistingBooking(data.patientId, data.doctorId, data.date, data.timeSlot)) {
    return { success: false, error: 'You already have a booking with this doctor at this time.' };
  }

  // Check slot availability
  if (!checkSlotAvailability(data.doctorId, data.date, data.timeSlot)) {
    return { success: false, error: 'This time slot is no longer available. Please select another.' };
  }

  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: generateId('appt'),
    ...data,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  };

  const appointments = getAllAppointments();
  appointments.push(appointment);
  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

  // Create notifications
  addNotification({
    userId: data.patientId,
    userRole: 'patient',
    type: 'appointment_booked',
    title: 'Appointment Booked',
    message: `Your appointment with ${data.doctorName} on ${format(new Date(data.date), 'PPP')} at ${data.timeSlot} has been submitted for confirmation.`,
    relatedId: appointment.id,
  });

  addNotification({
    userId: data.hospitalId,
    userRole: 'hospital',
    type: 'appointment_booked',
    title: 'New Appointment Request',
    message: `${data.patientName} has requested an appointment with ${data.doctorName} on ${format(new Date(data.date), 'PPP')} at ${data.timeSlot}.`,
    relatedId: appointment.id,
  });

  return { success: true, appointment };
}

// ============================================================
// Update Appointment Status
// ============================================================

export function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
  notes?: string
): { success: boolean; error?: string } {
  const appointments = getAllAppointments();
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index === -1) return { success: false, error: 'Appointment not found.' };

  const appt = appointments[index];
  const now = new Date().toISOString();

  appointments[index] = {
    ...appt,
    status,
    notes: notes ?? appt.notes,
    updatedAt: now,
    ...(status === 'cancelled' ? { cancelledAt: now, cancelReason: notes } : {}),
    ...(status === 'completed' ? { completedAt: now } : {}),
  };

  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

  // Notify patient
  const notifTitles: Record<string, string> = {
    confirmed: 'Appointment Confirmed',
    rejected: 'Appointment Rejected',
    cancelled: 'Appointment Cancelled',
    completed: 'Visit Completed',
    rescheduled: 'Appointment Rescheduled',
  };

  const notifMessages: Record<string, string> = {
    confirmed: `Your appointment with ${appt.doctorName} on ${format(new Date(appt.date), 'PPP')} has been confirmed.`,
    rejected: `Your appointment with ${appt.doctorName} has been rejected. ${notes ? 'Reason: ' + notes : ''}`,
    cancelled: `Your appointment with ${appt.doctorName} has been cancelled.`,
    completed: `Your visit with ${appt.doctorName} has been marked as completed.`,
    rescheduled: `Your appointment with ${appt.doctorName} has been rescheduled.`,
  };

  if (notifTitles[status]) {
    addNotification({
      userId: appt.patientId,
      userRole: 'patient',
      type: `appointment_${status}` as Notification['type'],
      title: notifTitles[status],
      message: notifMessages[status],
      relatedId: appointmentId,
    });
  }

  return { success: true };
}

export function rescheduleAppointment(
  appointmentId: string,
  newDate: string,
  newTimeSlot: string,
  reason?: string
): { success: boolean; error?: string } {
  const appointments = getAllAppointments();
  const index = appointments.findIndex((a) => a.id === appointmentId);
  if (index === -1) return { success: false, error: 'Appointment not found.' };

  const appt = appointments[index];

  // Validate new date
  const newDateObj = new Date(newDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (newDateObj < today) {
    return { success: false, error: 'Cannot reschedule to a past date.' };
  }

  // Check new slot
  if (!checkSlotAvailability(appt.doctorId, newDate, newTimeSlot, appointmentId)) {
    return { success: false, error: 'The selected time slot is not available.' };
  }

  const history: RescheduleRecord[] = appt.rescheduleHistory ?? [];
  history.push({
    previousDate: appt.date,
    previousTimeSlot: appt.timeSlot,
    rescheduledAt: new Date().toISOString(),
    reason,
  });

  appointments[index] = {
    ...appt,
    date: newDate,
    timeSlot: newTimeSlot,
    status: 'rescheduled',
    rescheduleHistory: history,
    updatedAt: new Date().toISOString(),
  };

  setStorage(STORAGE_KEYS.APPOINTMENTS, appointments);

  addNotification({
    userId: appt.patientId,
    userRole: 'patient',
    type: 'appointment_rescheduled',
    title: 'Appointment Rescheduled',
    message: `Your appointment with ${appt.doctorName} has been rescheduled to ${format(new Date(newDate), 'PPP')} at ${newTimeSlot}.`,
    relatedId: appointmentId,
  });

  addNotification({
    userId: appt.hospitalId,
    userRole: 'hospital',
    type: 'appointment_rescheduled',
    title: 'Appointment Rescheduled',
    message: `${appt.patientName}'s appointment with ${appt.doctorName} has been rescheduled to ${format(new Date(newDate), 'PPP')} at ${newTimeSlot}.`,
    relatedId: appointmentId,
  });

  return { success: true };
}

// ============================================================
// Notification Helpers
// ============================================================

interface NotifInput {
  userId: string;
  userRole: 'patient' | 'hospital';
  type: Notification['type'];
  title: string;
  message: string;
  relatedId?: string;
}

function addNotification(data: NotifInput): void {
  const notifications = getStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  const newNotif: Notification = {
    id: generateId('notif'),
    ...data,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(newNotif);
  setStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

// ============================================================
// Analytics
// ============================================================

export function getHospitalAnalytics(hospitalId: string) {
  const appointments = getHospitalAppointments(hospitalId);
  const today = new Date().toISOString().split('T')[0];

  const totalAppointments = appointments.length;
  const todayAppointments = appointments.filter((a) => a.date === today).length;
  const pendingAppointments = appointments.filter((a) => a.status === 'pending').length;
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmed').length;
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const cancelledAppointments = appointments.filter((a) => ['cancelled', 'rejected'].includes(a.status)).length;

  // Get unique patients
  const uniquePatients = new Set(appointments.map((a) => a.patientId)).size;

  // Department stats
  const deptMap: Record<string, number> = {};
  appointments.forEach((a) => {
    deptMap[a.department] = (deptMap[a.department] || 0) + 1;
  });
  const departmentStats = Object.entries(deptMap).map(([department, count]) => ({
    department,
    count,
    percentage: totalAppointments > 0 ? Math.round((count / totalAppointments) * 100) : 0,
  }));

  // Trends — last 14 days
  const trends = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayAppts = appointments.filter((a) => a.date === dateStr);
    trends.push({
      date: format(d, 'MMM d'),
      total: dayAppts.length,
      completed: dayAppts.filter((a) => a.status === 'completed').length,
      cancelled: dayAppts.filter((a) => ['cancelled', 'rejected'].includes(a.status)).length,
      pending: dayAppts.filter((a) => a.status === 'pending').length,
    });
  }

  // Doctor stats
  const doctorMap: Record<string, { appointments: number; completed: number; cancelled: number }> = {};
  appointments.forEach((a) => {
    if (!doctorMap[a.doctorName]) {
      doctorMap[a.doctorName] = { appointments: 0, completed: 0, cancelled: 0 };
    }
    doctorMap[a.doctorName].appointments++;
    if (a.status === 'completed') doctorMap[a.doctorName].completed++;
    if (['cancelled', 'rejected'].includes(a.status)) doctorMap[a.doctorName].cancelled++;
  });
  const doctorStats = Object.entries(doctorMap).map(([doctorName, stats]) => ({
    doctorName,
    ...stats,
  }));

  return {
    totalAppointments,
    todayAppointments,
    pendingAppointments,
    confirmedAppointments,
    completedAppointments,
    cancelledAppointments,
    totalDoctors: 0, // filled in by caller
    totalPatients: uniquePatients,
    trends,
    departmentStats,
    doctorStats,
  };
}
