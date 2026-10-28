// ============================================================
// Core Types for MediCore Hospital Management System
// ============================================================

export type UserRole = 'patient' | 'hospital';

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'rejected'
  | 'rescheduled';

export type HospitalType =
  | 'General Hospital'
  | 'Specialty Hospital'
  | 'Teaching Hospital'
  | 'Children\'s Hospital'
  | 'Psychiatric Hospital'
  | 'Rehabilitation Center'
  | 'Clinic'
  | 'Diagnostic Center';

export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export type NotificationType =
  | 'appointment_booked'
  | 'appointment_confirmed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'appointment_rejected'
  | 'appointment_completed'
  | 'prescription_added'
  | 'system';

// ============================================================
// User Entities
// ============================================================

export interface BaseUser {
  id: string;
  email: string;
  password: string; // hashed in demo
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PatientUser extends BaseUser {
  role: 'patient';
  fullName: string;
  phone: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  avatar?: string;
  bloodGroup?: string;
  allergies?: string;
  emergencyContact?: string;
}

export interface HospitalUser extends BaseUser {
  role: 'hospital';
  hospitalName: string;
  contactNumber: string;
  emergencyContact: string;
  hospitalType: HospitalType;
  licenseNumber: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  logo?: string;
  coverImage?: string;
  website?: string;
  workingHours: WorkingHours;
  departments: string[];
  facilities: string[];
  isVerified: boolean;
  rating?: number;
  totalDoctors?: number;
}

export interface WorkingHours {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

export interface DaySchedule {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

// ============================================================
// Doctor Entity
// ============================================================

export interface Doctor {
  id: string;
  hospitalId: string;
  fullName: string;
  specialization: string;
  department: string;
  qualification: string;
  experience: number; // years
  consultationFee: number;
  workingDays: string[];
  timeSlots: TimeSlot[];
  biography: string;
  avatar?: string;
  isAvailable: boolean;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// ============================================================
// Appointment Entity
// ============================================================

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  department: string;
  date: string; // ISO date string
  timeSlot: string;
  reason?: string;
  status: AppointmentStatus;
  notes?: string;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
  completedAt?: string;
  cancelReason?: string;
  rescheduleHistory?: RescheduleRecord[];
}

export interface RescheduleRecord {
  previousDate: string;
  previousTimeSlot: string;
  rescheduledAt: string;
  reason?: string;
}

// ============================================================
// Medical Records & Prescriptions
// ============================================================

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  visitDate: string;
  symptoms: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  appointmentId?: string;
  medicalRecordId?: string;
  medications: Medication[];
  instructions: string;
  issueDate: string;
  validUntil?: string;
  diagnosis: string;
  createdAt: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

// ============================================================
// Department Entity
// ============================================================

export interface Department {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  headDoctor?: string;
  isActive: boolean;
  floor?: string;
  roomNumbers?: string;
  createdAt: string;
}

export interface Facility {
  id: string;
  hospitalId: string;
  name: string;
  description?: string;
  isAvailable: boolean;
  floor?: string;
  operatingHours?: string;
  createdAt: string;
}

// ============================================================
// Notification Entity
// ============================================================

export interface Notification {
  id: string;
  userId: string;
  userRole: UserRole;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string; // appointment ID, prescription ID, etc.
  metadata?: Record<string, string>;
}

// ============================================================
// Chat / AI Assistant
// ============================================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isLoading?: boolean;
}

export interface ChatSession {
  id: string;
  userId?: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// App Settings
// ============================================================

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
}

// ============================================================
// Auth Context
// ============================================================

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}

export interface AuthSession {
  user: AuthUser;
  token: string; // demo token
  expiresAt: string;
}

// ============================================================
// Form Types
// ============================================================

export interface PatientRegisterForm {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dateOfBirth?: string;
  gender?: Gender;
  address?: string;
}

export interface HospitalRegisterForm {
  hospitalName: string;
  email: string;
  contactNumber: string;
  password: string;
  confirmPassword: string;
  hospitalType: HospitalType;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  emergencyContact: string;
  description: string;
}

export interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AppointmentBookingForm {
  hospitalId: string;
  doctorId: string;
  department: string;
  date: string;
  timeSlot: string;
  reason?: string;
}

// ============================================================
// Analytics Types
// ============================================================

export interface AppointmentTrend {
  date: string;
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
}

export interface DepartmentStats {
  department: string;
  count: number;
  percentage: number;
}

export interface DoctorStats {
  doctorName: string;
  appointments: number;
  completed: number;
  cancelled: number;
}

export interface HospitalAnalytics {
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  totalDoctors: number;
  totalPatients: number;
  trends: AppointmentTrend[];
  departmentStats: DepartmentStats[];
  doctorStats: DoctorStats[];
}

// ============================================================
// Storage Keys
// ============================================================

export const STORAGE_KEYS = {
  USERS: 'medicore_users',
  SESSION: 'medicore_session',
  HOSPITALS: 'medicore_hospitals',
  DOCTORS: 'medicore_doctors',
  APPOINTMENTS: 'medicore_appointments',
  DEPARTMENTS: 'medicore_departments',
  FACILITIES: 'medicore_facilities',
  MEDICAL_RECORDS: 'medicore_medical_records',
  PRESCRIPTIONS: 'medicore_prescriptions',
  NOTIFICATIONS: 'medicore_notifications',
  CHAT_HISTORY: 'medicore_chat_history',
  SETTINGS: 'medicore_settings',
  INITIALIZED: 'medicore_initialized',
} as const;
