import type {
  PatientUser,
  HospitalUser,
  AuthSession,
  AuthUser,
  PatientRegisterForm,
  HospitalRegisterForm,
} from '../types';
import { STORAGE_KEYS } from '../types';
import { getStorage, setStorage, getAll, create, generateId } from '../storage';

type AnyUser = PatientUser | HospitalUser;

// Simple password "hash" for demo - not for production use
function hashPassword(password: string): string {
  // In a real app, use bcrypt. This is demo-only.
  return btoa(password + '_medicore_demo_salt');
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function getAllUsers(): AnyUser[] {
  return getStorage<AnyUser[]>(STORAGE_KEYS.USERS, []);
}

export function findUserByEmail(email: string): AnyUser | undefined {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerPatient(
  data: PatientRegisterForm
): { success: boolean; error?: string; user?: PatientUser } {
  const existing = findUserByEmail(data.email);
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const now = new Date().toISOString();
  const newUser: PatientUser = {
    id: generateId('patient'),
    email: data.email.toLowerCase().trim(),
    password: hashPassword(data.password),
    role: 'patient',
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    dateOfBirth: data.dateOfBirth,
    gender: data.gender,
    address: data.address,
    createdAt: now,
    updatedAt: now,
  };

  const users = getAllUsers();
  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);

  return { success: true, user: newUser };
}

export function registerHospital(
  data: HospitalRegisterForm
): { success: boolean; error?: string; user?: HospitalUser } {
  const existing = findUserByEmail(data.email);
  if (existing) {
    return { success: false, error: 'An account with this email already exists.' };
  }

  const now = new Date().toISOString();
  const newUser: HospitalUser = {
    id: generateId('hospital'),
    email: data.email.toLowerCase().trim(),
    password: hashPassword(data.password),
    role: 'hospital',
    hospitalName: data.hospitalName.trim(),
    contactNumber: data.contactNumber.trim(),
    emergencyContact: data.emergencyContact.trim(),
    hospitalType: data.hospitalType,
    licenseNumber: data.licenseNumber.trim(),
    description: data.description.trim(),
    address: data.address.trim(),
    city: data.city.trim(),
    state: data.state.trim(),
    pinCode: data.pinCode.trim(),
    isVerified: false,
    departments: [],
    facilities: [],
    workingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
      sunday: { isOpen: false, openTime: '', closeTime: '' },
    },
    createdAt: now,
    updatedAt: now,
  };

  const users = getAllUsers();
  users.push(newUser);
  setStorage(STORAGE_KEYS.USERS, users);

  return { success: true, user: newUser };
}

export function login(
  email: string,
  password: string
): { success: boolean; error?: string; session?: AuthSession } {
  const user = findUserByEmail(email);

  if (!user) {
    return { success: false, error: 'Invalid email or password.' };
  }

  // For demo accounts, allow plain text password comparison
  const isValidPassword =
    verifyPassword(password, user.password) || user.password === password;

  if (!isValidPassword) {
    return { success: false, error: 'Invalid email or password.' };
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.role === 'patient' ? (user as PatientUser).fullName : (user as HospitalUser).hospitalName,
    avatar: user.role === 'patient' ? (user as PatientUser).avatar : (user as HospitalUser).logo,
  };

  const session: AuthSession = {
    user: authUser,
    token: generateId('token'),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };

  setStorage(STORAGE_KEYS.SESSION, session);
  return { success: true, session };
}

export function logout(): void {
  setStorage(STORAGE_KEYS.SESSION, null);
}

export function getSession(): AuthSession | null {
  const session = getStorage<AuthSession | null>(STORAGE_KEYS.SESSION, null);
  if (!session) return null;

  // Check expiry
  if (new Date(session.expiresAt) < new Date()) {
    logout();
    return null;
  }

  return session;
}

export function getCurrentUser(): AnyUser | undefined {
  const session = getSession();
  if (!session) return undefined;
  return findUserByEmail(session.user.email);
}

export function updateUserProfile(
  userId: string,
  updates: Partial<AnyUser>
): { success: boolean; error?: string } {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'User not found.' };

  users[index] = {
    ...users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  setStorage(STORAGE_KEYS.USERS, users);

  // Update session
  const session = getSession();
  if (session && session.user.id === userId) {
    const updatedUser = users[index];
    session.user.name =
      updatedUser.role === 'patient'
        ? (updatedUser as PatientUser).fullName
        : (updatedUser as HospitalUser).hospitalName;
    setStorage(STORAGE_KEYS.SESSION, session);
  }

  return { success: true };
}

export function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getAllUsers();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return { success: false, error: 'User not found.' };

  const user = users[index];
  const isValid = verifyPassword(currentPassword, user.password) || user.password === currentPassword;

  if (!isValid) {
    return { success: false, error: 'Current password is incorrect.' };
  }

  users[index] = {
    ...user,
    password: hashPassword(newPassword),
    updatedAt: new Date().toISOString(),
  };

  setStorage(STORAGE_KEYS.USERS, users);
  return { success: true };
}
