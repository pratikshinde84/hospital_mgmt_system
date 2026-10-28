import { STORAGE_KEYS } from '../types';
import {
  seedPatients,
  seedHospitals,
  seedDoctors,
  seedAppointments,
  seedMedicalRecords,
  seedPrescriptions,
  seedNotificationsForPatient,
  seedNotificationsForHospital,
  seedDepartments,
  seedFacilities,
} from '../data/seedData';
import { getStorage, setStorage } from './index';

export function initializeDemoData(force = false): void {
  const initialized = getStorage<boolean>(STORAGE_KEYS.INITIALIZED, false);
  if (initialized && !force) return;

  // Merge with existing users (don't overwrite if already populated)
  const existingUsers = getStorage<unknown[]>(STORAGE_KEYS.USERS, []);
  if (existingUsers.length === 0 || force) {
    const allUsers = [...seedPatients, ...seedHospitals];
    setStorage(STORAGE_KEYS.USERS, allUsers);
  }

  const existingDoctors = getStorage<unknown[]>(STORAGE_KEYS.DOCTORS, []);
  if (existingDoctors.length === 0 || force) {
    setStorage(STORAGE_KEYS.DOCTORS, seedDoctors);
  }

  const existingAppointments = getStorage<unknown[]>(STORAGE_KEYS.APPOINTMENTS, []);
  if (existingAppointments.length === 0 || force) {
    setStorage(STORAGE_KEYS.APPOINTMENTS, seedAppointments);
  }

  const existingRecords = getStorage<unknown[]>(STORAGE_KEYS.MEDICAL_RECORDS, []);
  if (existingRecords.length === 0 || force) {
    setStorage(STORAGE_KEYS.MEDICAL_RECORDS, seedMedicalRecords);
  }

  const existingPrescriptions = getStorage<unknown[]>(STORAGE_KEYS.PRESCRIPTIONS, []);
  if (existingPrescriptions.length === 0 || force) {
    setStorage(STORAGE_KEYS.PRESCRIPTIONS, seedPrescriptions);
  }

  const existingNotifications = getStorage<unknown[]>(STORAGE_KEYS.NOTIFICATIONS, []);
  if (existingNotifications.length === 0 || force) {
    const allNotifications = [...seedNotificationsForPatient, ...seedNotificationsForHospital];
    setStorage(STORAGE_KEYS.NOTIFICATIONS, allNotifications);
  }

  const existingDepartments = getStorage<unknown[]>(STORAGE_KEYS.DEPARTMENTS, []);
  if (existingDepartments.length === 0 || force) {
    setStorage(STORAGE_KEYS.DEPARTMENTS, seedDepartments);
  }

  const existingFacilities = getStorage<unknown[]>(STORAGE_KEYS.FACILITIES, []);
  if (existingFacilities.length === 0 || force) {
    setStorage(STORAGE_KEYS.FACILITIES, seedFacilities);
  }

  setStorage(STORAGE_KEYS.INITIALIZED, true);
}

export function resetAllDemoData(): void {
  initializeDemoData(true);
}
