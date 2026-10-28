import type {
  PatientUser,
  HospitalUser,
  Doctor,
  Appointment,
  MedicalRecord,
  Prescription,
  Notification,
  Department,
  Facility,
} from '../types';
import { generateId } from '../storage';

// ============================================================
// Demo Seed Data — All fictional, for demonstration purposes
// ============================================================

const now = new Date().toISOString();
const past = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};
const future = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

// ============================================================
// Demo Users
// ============================================================

export const DEMO_PATIENT_EMAIL = 'patient@demo.com';
export const DEMO_PATIENT_PASSWORD = 'Demo@1234';
export const DEMO_HOSPITAL_EMAIL = 'hospital@demo.com';
export const DEMO_HOSPITAL_PASSWORD = 'Demo@1234';

export const seedPatients: PatientUser[] = [
  {
    id: 'patient_demo001',
    email: DEMO_PATIENT_EMAIL,
    password: 'Demo@1234',
    role: 'patient',
    fullName: 'Aarav Sharma',
    phone: '+91 98765 43210',
    dateOfBirth: '1992-05-15',
    gender: 'male',
    address: '42, Green Park Colony',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400001',
    bloodGroup: 'B+',
    createdAt: past(30),
    updatedAt: past(5),
  },
  {
    id: 'patient_demo002',
    email: 'priya@demo.com',
    password: 'Demo@1234',
    role: 'patient',
    fullName: 'Priya Patel',
    phone: '+91 87654 32109',
    dateOfBirth: '1995-08-22',
    gender: 'female',
    address: '18, Lotus Society',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411001',
    bloodGroup: 'O+',
    createdAt: past(20),
    updatedAt: past(3),
  },
  {
    id: 'patient_demo003',
    email: 'rahul@demo.com',
    password: 'Demo@1234',
    role: 'patient',
    fullName: 'Rahul Verma',
    phone: '+91 76543 21098',
    dateOfBirth: '1988-11-10',
    gender: 'male',
    address: '7, Shanti Nagar',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110001',
    bloodGroup: 'A+',
    createdAt: past(45),
    updatedAt: past(10),
  },
];

// ============================================================
// Demo Hospitals
// ============================================================

export const seedHospitals: HospitalUser[] = [
  {
    id: 'hospital_demo001',
    email: DEMO_HOSPITAL_EMAIL,
    password: 'Demo@1234',
    role: 'hospital',
    hospitalName: 'Apollo MediCare Hospital',
    contactNumber: '+91 22 6789 0123',
    emergencyContact: '+91 22 6789 9999',
    hospitalType: 'General Hospital',
    licenseNumber: 'MH-HOSP-2015-4521',
    description:
      'Apollo MediCare Hospital is a premier multi-specialty hospital providing world-class healthcare services with state-of-the-art infrastructure. [Demo Hospital — Sample Data]',
    address: '12, Apollo Road, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pinCode: '400053',
    isVerified: false,
    rating: 4.5,
    workingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
      sunday: { isOpen: false, openTime: '10:00', closeTime: '14:00' },
    },
    departments: [
      'General Medicine',
      'Cardiology',
      'Neurology',
      'Orthopedics',
      'Pediatrics',
      'Dermatology',
    ],
    facilities: [
      'Emergency Department',
      'ICU',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Ambulance',
      'Operation Theatre',
      'Parking',
    ],
    createdAt: past(60),
    updatedAt: past(2),
  },
  {
    id: 'hospital_demo002',
    email: 'sunrise@demo.com',
    password: 'Demo@1234',
    role: 'hospital',
    hospitalName: 'Sunrise Children\'s Hospital',
    contactNumber: '+91 20 4567 8901',
    emergencyContact: '+91 20 4567 9999',
    hospitalType: 'Children\'s Hospital',
    licenseNumber: 'MH-HOSP-2018-7832',
    description:
      'Sunrise Children\'s Hospital specializes in comprehensive pediatric care with a team of dedicated pediatricians and child health specialists. [Demo Hospital — Sample Data]',
    address: '56, Sunrise Boulevard, Koregaon Park',
    city: 'Pune',
    state: 'Maharashtra',
    pinCode: '411001',
    isVerified: false,
    rating: 4.7,
    workingHours: {
      monday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      tuesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      wednesday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      thursday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      friday: { isOpen: true, openTime: '09:00', closeTime: '19:00' },
      saturday: { isOpen: true, openTime: '10:00', closeTime: '16:00' },
      sunday: { isOpen: false, openTime: '', closeTime: '' },
    },
    departments: ['Pediatrics', 'Neonatology', 'Pediatric Surgery', 'Pediatric Neurology'],
    facilities: ['Emergency Department', 'ICU', 'Pharmacy', 'Laboratory', 'Ambulance', 'Parking'],
    createdAt: past(45),
    updatedAt: past(5),
  },
  {
    id: 'hospital_demo003',
    email: 'heartcare@demo.com',
    password: 'Demo@1234',
    role: 'hospital',
    hospitalName: 'HeartCare Cardiac Institute',
    contactNumber: '+91 11 3456 7890',
    emergencyContact: '+91 11 3456 9999',
    hospitalType: 'Specialty Hospital',
    licenseNumber: 'DL-HOSP-2020-1234',
    description:
      'HeartCare Cardiac Institute is a leading specialty hospital focused on advanced cardiovascular treatments and cardiac surgeries. [Demo Hospital — Sample Data]',
    address: '89, Cardio Complex, Connaught Place',
    city: 'Delhi',
    state: 'Delhi',
    pinCode: '110001',
    isVerified: false,
    rating: 4.8,
    workingHours: {
      monday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      tuesday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      wednesday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      thursday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      friday: { isOpen: true, openTime: '07:00', closeTime: '21:00' },
      saturday: { isOpen: true, openTime: '08:00', closeTime: '18:00' },
      sunday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
    },
    departments: ['Cardiology', 'Cardiac Surgery', 'Vascular Surgery', 'Electrophysiology'],
    facilities: [
      'Emergency Department',
      'ICU',
      'Cardiac ICU',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Operation Theatre',
      'Ambulance',
    ],
    createdAt: past(90),
    updatedAt: past(1),
  },
  {
    id: 'hospital_demo004',
    email: 'meditrust@demo.com',
    password: 'Demo@1234',
    role: 'hospital',
    hospitalName: 'MediTrust General Hospital',
    contactNumber: '+91 80 2345 6789',
    emergencyContact: '+91 80 2345 9999',
    hospitalType: 'General Hospital',
    licenseNumber: 'KA-HOSP-2012-5678',
    description:
      'MediTrust General Hospital is a trusted multi-specialty medical center serving the Bengaluru community with comprehensive healthcare services. [Demo Hospital — Sample Data]',
    address: '23, Health Park, Jayanagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    pinCode: '560041',
    isVerified: false,
    rating: 4.3,
    workingHours: {
      monday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      tuesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      wednesday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      thursday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      friday: { isOpen: true, openTime: '08:00', closeTime: '20:00' },
      saturday: { isOpen: true, openTime: '09:00', closeTime: '18:00' },
      sunday: { isOpen: false, openTime: '', closeTime: '' },
    },
    departments: [
      'General Medicine',
      'Orthopedics',
      'Gynecology',
      'ENT',
      'Ophthalmology',
      'Dentistry',
    ],
    facilities: [
      'Emergency Department',
      'ICU',
      'Pharmacy',
      'Laboratory',
      'Radiology',
      'Operation Theatre',
      'Ambulance',
      'Parking',
      'Inpatient Services',
    ],
    createdAt: past(75),
    updatedAt: past(4),
  },
];

// ============================================================
// Demo Doctors
// ============================================================

const defaultSlots = [
  { id: 's1', startTime: '09:00', endTime: '09:30', isAvailable: true },
  { id: 's2', startTime: '09:30', endTime: '10:00', isAvailable: true },
  { id: 's3', startTime: '10:00', endTime: '10:30', isAvailable: true },
  { id: 's4', startTime: '10:30', endTime: '11:00', isAvailable: true },
  { id: 's5', startTime: '11:00', endTime: '11:30', isAvailable: true },
  { id: 's6', startTime: '11:30', endTime: '12:00', isAvailable: true },
  { id: 's7', startTime: '14:00', endTime: '14:30', isAvailable: true },
  { id: 's8', startTime: '14:30', endTime: '15:00', isAvailable: true },
  { id: 's9', startTime: '15:00', endTime: '15:30', isAvailable: true },
  { id: 's10', startTime: '15:30', endTime: '16:00', isAvailable: true },
  { id: 's11', startTime: '16:00', endTime: '16:30', isAvailable: true },
  { id: 's12', startTime: '16:30', endTime: '17:00', isAvailable: true },
];

export const seedDoctors: Doctor[] = [
  {
    id: 'doctor_demo001',
    hospitalId: 'hospital_demo001',
    fullName: 'Dr. Rajesh Kapoor',
    specialization: 'Cardiologist',
    department: 'Cardiology',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    experience: 15,
    consultationFee: 800,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Rajesh Kapoor is a senior cardiologist with 15 years of experience in interventional cardiology and heart failure management. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.kapoor@apollo.demo',
    phone: '+91 98765 11111',
    createdAt: past(50),
    updatedAt: past(10),
  },
  {
    id: 'doctor_demo002',
    hospitalId: 'hospital_demo001',
    fullName: 'Dr. Sunita Mehta',
    specialization: 'Neurologist',
    department: 'Neurology',
    qualification: 'MBBS, MD (Neurology), DM (Neuroscience)',
    experience: 12,
    consultationFee: 900,
    workingDays: ['monday', 'wednesday', 'friday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Sunita Mehta specializes in treating neurological disorders including epilepsy, Parkinson\'s disease, and stroke management. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.mehta@apollo.demo',
    phone: '+91 98765 22222',
    createdAt: past(48),
    updatedAt: past(8),
  },
  {
    id: 'doctor_demo003',
    hospitalId: 'hospital_demo001',
    fullName: 'Dr. Amit Singh',
    specialization: 'Orthopedic Surgeon',
    department: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics)',
    experience: 10,
    consultationFee: 700,
    workingDays: ['tuesday', 'thursday', 'saturday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Amit Singh is an orthopedic surgeon specializing in joint replacement, sports injuries, and spine care. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.singh@apollo.demo',
    phone: '+91 98765 33333',
    createdAt: past(40),
    updatedAt: past(7),
  },
  {
    id: 'doctor_demo004',
    hospitalId: 'hospital_demo001',
    fullName: 'Dr. Kavitha Rao',
    specialization: 'Pediatrician',
    department: 'Pediatrics',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    experience: 8,
    consultationFee: 600,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Kavitha Rao is a dedicated pediatrician providing comprehensive child health care from newborns to adolescents. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.rao@apollo.demo',
    phone: '+91 98765 44444',
    createdAt: past(35),
    updatedAt: past(6),
  },
  {
    id: 'doctor_demo005',
    hospitalId: 'hospital_demo002',
    fullName: 'Dr. Meera Joshi',
    specialization: 'Pediatric Neurologist',
    department: 'Pediatric Neurology',
    qualification: 'MBBS, MD (Pediatrics), DM (Pediatric Neurology)',
    experience: 9,
    consultationFee: 750,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Meera Joshi specializes in diagnosing and treating neurological conditions in children including epilepsy, autism, and developmental delays. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.joshi@sunrise.demo',
    phone: '+91 87654 55555',
    createdAt: past(30),
    updatedAt: past(5),
  },
  {
    id: 'doctor_demo006',
    hospitalId: 'hospital_demo003',
    fullName: 'Dr. Sanjay Gupta',
    specialization: 'Cardiac Surgeon',
    department: 'Cardiac Surgery',
    qualification: 'MBBS, MS (General Surgery), MCh (Cardiothoracic Surgery)',
    experience: 20,
    consultationFee: 1500,
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Sanjay Gupta is an eminent cardiac surgeon with two decades of experience in open-heart surgery and minimally invasive cardiac procedures. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.gupta@heartcare.demo',
    phone: '+91 76543 66666',
    createdAt: past(70),
    updatedAt: past(3),
  },
  {
    id: 'doctor_demo007',
    hospitalId: 'hospital_demo004',
    fullName: 'Dr. Ananya Reddy',
    specialization: 'Gynecologist',
    department: 'Gynecology',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    experience: 11,
    consultationFee: 650,
    workingDays: ['monday', 'wednesday', 'thursday', 'friday', 'saturday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Ananya Reddy is a compassionate gynecologist specializing in maternal healthcare, high-risk pregnancies, and minimally invasive gynecological surgeries. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.reddy@meditrust.demo',
    phone: '+91 65432 77777',
    createdAt: past(55),
    updatedAt: past(9),
  },
  {
    id: 'doctor_demo008',
    hospitalId: 'hospital_demo004',
    fullName: 'Dr. Vikram Nair',
    specialization: 'ENT Specialist',
    department: 'ENT',
    qualification: 'MBBS, MS (ENT)',
    experience: 7,
    consultationFee: 550,
    workingDays: ['tuesday', 'thursday', 'saturday'],
    timeSlots: defaultSlots,
    biography:
      'Dr. Vikram Nair is an experienced ENT specialist treating conditions related to ear, nose, throat, and head & neck disorders. [Demo Profile — Sample Data]',
    isAvailable: true,
    email: 'dr.nair@meditrust.demo',
    phone: '+91 54321 88888',
    createdAt: past(42),
    updatedAt: past(11),
  },
];

// ============================================================
// Demo Appointments
// ============================================================

export const seedAppointments: Appointment[] = [
  {
    id: 'appt_demo001',
    patientId: 'patient_demo001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98765 43210',
    hospitalId: 'hospital_demo001',
    hospitalName: 'Apollo MediCare Hospital',
    doctorId: 'doctor_demo001',
    doctorName: 'Dr. Rajesh Kapoor',
    department: 'Cardiology',
    date: future(3),
    timeSlot: '10:00',
    reason: 'Routine cardiac checkup and ECG review [Demo — Sample Data]',
    status: 'confirmed',
    consultationFee: 800,
    createdAt: past(2),
    updatedAt: past(1),
  },
  {
    id: 'appt_demo002',
    patientId: 'patient_demo001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98765 43210',
    hospitalId: 'hospital_demo001',
    hospitalName: 'Apollo MediCare Hospital',
    doctorId: 'doctor_demo004',
    doctorName: 'Dr. Kavitha Rao',
    department: 'Pediatrics',
    date: past(10).split('T')[0],
    timeSlot: '11:00',
    reason: 'General health check [Demo — Sample Data]',
    status: 'completed',
    consultationFee: 600,
    createdAt: past(15),
    updatedAt: past(10),
    completedAt: past(10),
  },
  {
    id: 'appt_demo003',
    patientId: 'patient_demo001',
    patientName: 'Aarav Sharma',
    patientPhone: '+91 98765 43210',
    hospitalId: 'hospital_demo003',
    hospitalName: 'HeartCare Cardiac Institute',
    doctorId: 'doctor_demo006',
    doctorName: 'Dr. Sanjay Gupta',
    department: 'Cardiac Surgery',
    date: past(20).split('T')[0],
    timeSlot: '09:30',
    reason: 'Second opinion consultation [Demo — Sample Data]',
    status: 'cancelled',
    consultationFee: 1500,
    createdAt: past(25),
    updatedAt: past(22),
    cancelledAt: past(22),
    cancelReason: 'Schedule conflict [Demo]',
  },
  {
    id: 'appt_demo004',
    patientId: 'patient_demo002',
    patientName: 'Priya Patel',
    patientPhone: '+91 87654 32109',
    hospitalId: 'hospital_demo001',
    hospitalName: 'Apollo MediCare Hospital',
    doctorId: 'doctor_demo002',
    doctorName: 'Dr. Sunita Mehta',
    department: 'Neurology',
    date: future(5),
    timeSlot: '14:00',
    reason: 'Recurring migraine evaluation [Demo — Sample Data]',
    status: 'pending',
    consultationFee: 900,
    createdAt: past(1),
    updatedAt: past(1),
  },
  {
    id: 'appt_demo005',
    patientId: 'patient_demo003',
    patientName: 'Rahul Verma',
    patientPhone: '+91 76543 21098',
    hospitalId: 'hospital_demo003',
    hospitalName: 'HeartCare Cardiac Institute',
    doctorId: 'doctor_demo006',
    doctorName: 'Dr. Sanjay Gupta',
    department: 'Cardiac Surgery',
    date: future(7),
    timeSlot: '10:30',
    reason: 'Pre-surgical consultation [Demo — Sample Data]',
    status: 'confirmed',
    consultationFee: 1500,
    createdAt: past(3),
    updatedAt: past(2),
  },
];

// ============================================================
// Demo Medical Records
// ============================================================

export const seedMedicalRecords: MedicalRecord[] = [
  {
    id: 'record_demo001',
    patientId: 'patient_demo001',
    patientName: 'Aarav Sharma',
    hospitalId: 'hospital_demo001',
    hospitalName: 'Apollo MediCare Hospital',
    doctorId: 'doctor_demo004',
    doctorName: 'Dr. Kavitha Rao',
    appointmentId: 'appt_demo002',
    visitDate: past(10).split('T')[0],
    symptoms: 'Mild fatigue, occasional headaches [Sample Data]',
    diagnosis: 'General fatigue — lifestyle-related [Sample Data]',
    treatment: 'Advised adequate rest, hydration, and iron-rich diet [Sample Data]',
    notes: 'Follow-up in 4 weeks if symptoms persist [Sample Data]',
    createdAt: past(10),
    updatedAt: past(10),
  },
];

// ============================================================
// Demo Prescriptions
// ============================================================

export const seedPrescriptions: Prescription[] = [
  {
    id: 'rx_demo001',
    patientId: 'patient_demo001',
    patientName: 'Aarav Sharma',
    hospitalId: 'hospital_demo001',
    hospitalName: 'Apollo MediCare Hospital',
    doctorId: 'doctor_demo004',
    doctorName: 'Dr. Kavitha Rao',
    appointmentId: 'appt_demo002',
    medicalRecordId: 'record_demo001',
    medications: [
      {
        name: 'Iron Supplement (Ferrous Sulphate)',
        dosage: '150mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take with meals to reduce stomach upset [Sample Data]',
      },
      {
        name: 'Vitamin B Complex',
        dosage: '1 tablet',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take after breakfast [Sample Data]',
      },
    ],
    instructions:
      'Increase water intake. Rest adequately. Avoid excessive caffeine. [Sample Data — Not a Valid Medical Document]',
    issueDate: past(10).split('T')[0],
    validUntil: future(20),
    diagnosis: 'General fatigue — lifestyle-related [Sample Data]',
    createdAt: past(10),
  },
];

// ============================================================
// Demo Notifications
// ============================================================

export const seedNotificationsForPatient: Notification[] = [
  {
    id: 'notif_p001',
    userId: 'patient_demo001',
    userRole: 'patient',
    type: 'appointment_confirmed',
    title: 'Appointment Confirmed',
    message:
      'Your appointment with Dr. Rajesh Kapoor on ' +
      future(3) +
      ' at 10:00 AM has been confirmed.',
    isRead: false,
    createdAt: past(1),
    relatedId: 'appt_demo001',
  },
  {
    id: 'notif_p002',
    userId: 'patient_demo001',
    userRole: 'patient',
    type: 'appointment_completed',
    title: 'Visit Completed',
    message: 'Your visit with Dr. Kavitha Rao has been marked as completed. A prescription has been added.',
    isRead: true,
    createdAt: past(10),
    relatedId: 'appt_demo002',
  },
  {
    id: 'notif_p003',
    userId: 'patient_demo001',
    userRole: 'patient',
    type: 'prescription_added',
    title: 'New Prescription Available',
    message: 'Dr. Kavitha Rao has added a new prescription for your recent visit. [Sample Data]',
    isRead: false,
    createdAt: past(10),
    relatedId: 'rx_demo001',
  },
];

export const seedNotificationsForHospital: Notification[] = [
  {
    id: 'notif_h001',
    userId: 'hospital_demo001',
    userRole: 'hospital',
    type: 'appointment_booked',
    title: 'New Appointment Request',
    message: 'Aarav Sharma has booked an appointment with Dr. Rajesh Kapoor on ' + future(3) + '.',
    isRead: false,
    createdAt: past(2),
    relatedId: 'appt_demo001',
  },
  {
    id: 'notif_h002',
    userId: 'hospital_demo001',
    userRole: 'hospital',
    type: 'appointment_booked',
    title: 'New Appointment Request',
    message: 'Priya Patel has booked an appointment with Dr. Sunita Mehta on ' + future(5) + '.',
    isRead: true,
    createdAt: past(1),
    relatedId: 'appt_demo004',
  },
];

// ============================================================
// Demo Departments
// ============================================================

export const seedDepartments: Department[] = [
  {
    id: 'dept_demo001',
    hospitalId: 'hospital_demo001',
    name: 'Cardiology',
    description: 'Comprehensive heart care and cardiovascular disease management [Sample Data]',
    headDoctor: 'Dr. Rajesh Kapoor',
    isActive: true,
    floor: '3rd Floor',
    roomNumbers: '301-320',
    createdAt: past(55),
  },
  {
    id: 'dept_demo002',
    hospitalId: 'hospital_demo001',
    name: 'Neurology',
    description: 'Diagnosis and treatment of nervous system disorders [Sample Data]',
    headDoctor: 'Dr. Sunita Mehta',
    isActive: true,
    floor: '4th Floor',
    roomNumbers: '401-415',
    createdAt: past(55),
  },
  {
    id: 'dept_demo003',
    hospitalId: 'hospital_demo001',
    name: 'Orthopedics',
    description: 'Bone, joint, and musculoskeletal care [Sample Data]',
    headDoctor: 'Dr. Amit Singh',
    isActive: true,
    floor: '2nd Floor',
    roomNumbers: '201-215',
    createdAt: past(55),
  },
  {
    id: 'dept_demo004',
    hospitalId: 'hospital_demo001',
    name: 'Pediatrics',
    description: 'Child health and development care [Sample Data]',
    headDoctor: 'Dr. Kavitha Rao',
    isActive: true,
    floor: '5th Floor',
    roomNumbers: '501-520',
    createdAt: past(55),
  },
];

// ============================================================
// Demo Facilities
// ============================================================

export const seedFacilities: Facility[] = [
  {
    id: 'fac_demo001',
    hospitalId: 'hospital_demo001',
    name: 'Emergency Department',
    description: '24/7 emergency care and trauma services [Sample Data]',
    isAvailable: true,
    floor: 'Ground Floor',
    operatingHours: '24 hours, 7 days a week',
    createdAt: past(60),
  },
  {
    id: 'fac_demo002',
    hospitalId: 'hospital_demo001',
    name: 'ICU',
    description: 'Intensive care for critically ill patients [Sample Data]',
    isAvailable: true,
    floor: '6th Floor',
    operatingHours: '24 hours, 7 days a week',
    createdAt: past(60),
  },
  {
    id: 'fac_demo003',
    hospitalId: 'hospital_demo001',
    name: 'Pharmacy',
    description: 'In-house pharmacy with 24/7 availability [Sample Data]',
    isAvailable: true,
    floor: 'Ground Floor',
    operatingHours: '24 hours',
    createdAt: past(60),
  },
];

export { now };
