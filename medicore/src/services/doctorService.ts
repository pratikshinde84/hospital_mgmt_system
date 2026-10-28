import type { Doctor, TimeSlot } from '../types';
import { STORAGE_KEYS } from '../types';
import { getAll, findWhere, getStorage, setStorage, generateId, update, remove } from '../storage';
import { getAllAppointments } from './appointmentService';

export function getAllDoctors(): Doctor[] {
  return getAll<Doctor>(STORAGE_KEYS.DOCTORS);
}

export function getDoctorById(id: string): Doctor | undefined {
  return getAllDoctors().find((d) => d.id === id);
}

export function getDoctorsByHospital(hospitalId: string): Doctor[] {
  return findWhere<Doctor>(STORAGE_KEYS.DOCTORS, (d) => d.hospitalId === hospitalId);
}

export function getDoctorsByDepartment(department: string): Doctor[] {
  return findWhere<Doctor>(STORAGE_KEYS.DOCTORS, (d) =>
    d.department.toLowerCase().includes(department.toLowerCase())
  );
}

export function searchDoctors(query: string): Doctor[] {
  const q = query.toLowerCase();
  return findWhere<Doctor>(
    STORAGE_KEYS.DOCTORS,
    (d) =>
      d.fullName.toLowerCase().includes(q) ||
      d.specialization.toLowerCase().includes(q) ||
      d.department.toLowerCase().includes(q)
  );
}

export function getAvailableSlots(
  doctorId: string,
  date: string
): { slot: string; isAvailable: boolean }[] {
  const doctor = getDoctorById(doctorId);
  if (!doctor) return [];

  const dayName = new Date(date)
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase();

  if (!doctor.workingDays.includes(dayName)) {
    return [];
  }

  const bookedSlots = getAllAppointments()
    .filter(
      (a) =>
        a.doctorId === doctorId &&
        a.date === date &&
        !['cancelled', 'rejected'].includes(a.status)
    )
    .map((a) => a.timeSlot);

  return doctor.timeSlots.map((slot) => ({
    slot: slot.startTime,
    isAvailable: slot.isAvailable && !bookedSlots.includes(slot.startTime),
  }));
}

export function addDoctor(
  data: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>
): Doctor {
  const now = new Date().toISOString();
  const doctor: Doctor = {
    ...data,
    id: generateId('doctor'),
    createdAt: now,
    updatedAt: now,
  };
  const doctors = getAllDoctors();
  doctors.push(doctor);
  setStorage(STORAGE_KEYS.DOCTORS, doctors);
  return doctor;
}

export function updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
  return update<Doctor>(STORAGE_KEYS.DOCTORS, id, updates);
}

export function deleteDoctor(id: string): boolean {
  return remove<Doctor>(STORAGE_KEYS.DOCTORS, id);
}
