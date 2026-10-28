import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Hospital, Star, Calendar,
  Building2, CheckCircle, User, ExternalLink, AlertTriangle, ArrowLeft, Stethoscope
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { getAllUsers } from '../../services/authService';
import { getDoctorsByHospital } from '../../services/doctorService';
import type { HospitalUser, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Overview', 'Doctors', 'Facilities', 'Contact'];

export default function HospitalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('Overview');
  const navigate = useNavigate();
  const { isAuthenticated, isPatient } = useAuth();

  const hospital = useMemo(() => {
    const users = getAllUsers();
    return users.find((u) => u.id === id && u.role === 'hospital') as HospitalUser | undefined;
  }, [id]);

  const doctors = useMemo(() => {
    if (!id) return [];
    return getDoctorsByHospital(id);
  }, [id]);

  if (!hospital) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <div className="text-center">
            <Hospital size={48} className="text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Hospital not found</h2>
            <Link to="/hospitals" className="btn-primary mt-4">Back to Hospitals</Link>
          </div>
        </div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${hospital.address}, ${hospital.city}, ${hospital.state} ${hospital.pinCode}`
  )}`;

  const workingDays = Object.entries(hospital.workingHours)
    .filter(([, s]) => s.isOpen)
    .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PublicNavbar />

      {/* Cover */}
      <div className="relative pt-16 bg-gradient-to-br from-blue-600 via-blue-700 to-teal-700 h-56 md:h-72 flex items-end">
        <div className="absolute inset-0 flex items-center justify-center">
          <Hospital size={80} className="text-white/20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-0">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10 pb-16">
        {/* Hospital Card */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center shrink-0">
              <Hospital size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
                      {hospital.hospitalName}
                    </h1>
                    <span className="badge bg-amber-100 text-amber-700 text-xs">Demo Hospital</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <span className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                      {hospital.hospitalType}
                    </span>
                    <span className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} size={12} className={j < Math.floor(hospital.rating ?? 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                      ))}
                      <span>{hospital.rating?.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm py-2">
                    <MapPin size={14} /> Directions
                  </a>
                  {isAuthenticated && isPatient ? (
                    <Link to={`/patient/book?hospitalId=${hospital.id}`} className="btn-primary text-sm py-2">
                      <Calendar size={14} /> Book Appointment
                    </Link>
                  ) : (
                    <Link to="/login" className="btn-primary text-sm py-2">
                      <Calendar size={14} /> Book Appointment
                    </Link>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} className="text-blue-500" />
                  {hospital.address}, {hospital.city}, {hospital.state}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone size={14} className="text-green-500" />
                  <a href={`tel:${hospital.contactNumber}`} className="hover:text-blue-600">{hospital.contactNumber}</a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-2xl p-1 mb-6 border border-slate-100 dark:border-slate-700 w-fit">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === 'Overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white font-heading mb-3">About</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {hospital.description}
                  </p>
                  <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      This is a demo hospital profile. Not a real healthcare facility.
                    </p>
                  </div>
                </div>

                <div className="card p-6">
                  <h2 className="text-base font-semibold text-slate-900 dark:text-white font-heading mb-4">
                    Departments ({hospital.departments.length})
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {hospital.departments.map((dept) => (
                      <div key={dept} className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                        <Stethoscope size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-300">{dept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Quick Info */}
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-4">Quick Info</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <User size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Doctors</p>
                        <p className="font-medium text-slate-900 dark:text-white">{doctors.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                        <Building2 size={14} className="text-teal-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Departments</p>
                        <p className="font-medium text-slate-900 dark:text-white">{hospital.departments.length}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                        <Shield size={14} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Emergency</p>
                        <p className="font-medium text-slate-900 dark:text-white">{hospital.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                    <Clock size={15} className="text-blue-600" /> Working Hours
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    {Object.entries(hospital.workingHours).map(([day, sch]) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="capitalize text-slate-600 dark:text-slate-400">{day}</span>
                        {sch.isOpen ? (
                          <span className="text-slate-900 dark:text-white font-medium">
                            {sch.openTime} – {sch.closeTime}
                          </span>
                        ) : (
                          <span className="text-red-500">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map */}
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                    <MapPin size={15} className="text-blue-600" /> Location
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                    {hospital.address}, {hospital.city}, {hospital.state} – {hospital.pinCode}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700"
                  >
                    <ExternalLink size={14} />
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Doctors' && (
            <div>
              {doctors.length === 0 ? (
                <div className="card p-10 text-center">
                  <Stethoscope size={40} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-600 dark:text-slate-400">No doctors listed for this hospital yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {doctors.map((doctor) => (
                    <DoctorCard key={doctor.id} doctor={doctor} hospitalId={hospital.id} isPatient={isPatient} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'Facilities' && (
            <div className="card p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {hospital.facilities.map((fac) => (
                  <div key={fac} className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">{fac}</span>
                  </div>
                ))}
                {hospital.facilities.length === 0 && (
                  <p className="text-sm text-slate-500 col-span-4">No facilities listed.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Contact' && (
            <div className="max-w-lg">
              <div className="card p-6 space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Hospital Email</p>
                  <p className="font-medium text-slate-900 dark:text-white">{hospital.email}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Contact Number</p>
                  <a href={`tel:${hospital.contactNumber}`} className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700">
                    {hospital.contactNumber}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Emergency Contact</p>
                  <a href={`tel:${hospital.emergencyContact}`} className="font-medium text-red-600 dark:text-red-400 hover:text-red-700">
                    {hospital.emergencyContact}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Full Address</p>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {hospital.address}, {hospital.city}, {hospital.state} – {hospital.pinCode}
                  </p>
                </div>
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full justify-center">
                  <MapPin size={15} /> Open in Google Maps
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function DoctorCard({ doctor, hospitalId, isPatient }: { doctor: Doctor; hospitalId: string; isPatient: boolean }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {doctor.fullName.charAt(4) || 'D'}
        </div>
        <div>
          <p className="font-semibold text-slate-900 dark:text-white text-sm">{doctor.fullName}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400">{doctor.specialization}</p>
        </div>
      </div>
      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
        <p>{doctor.qualification}</p>
        <p>{doctor.experience} years experience</p>
        <p className="font-medium text-slate-900 dark:text-white">₹{doctor.consultationFee} consultation</p>
      </div>
      <div className="flex items-center justify-between">
        <span className={`badge text-xs ${doctor.isAvailable ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
          {doctor.isAvailable ? 'Available' : 'Unavailable'}
        </span>
        {isPatient && doctor.isAvailable && (
          <Link
            to={`/patient/book?hospitalId=${hospitalId}&doctorId=${doctor.id}`}
            className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1"
          >
            Book <ArrowLeft size={12} className="rotate-180" />
          </Link>
        )}
      </div>
    </div>
  );
}
