import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from '../../lib/motion';
import { format } from 'date-fns';
import { CheckCircle, ChevronRight, ChevronLeft, Calendar, Clock, Hospital, Stethoscope, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers } from '../../services/authService';
import { getDoctorsByHospital, getAvailableSlots } from '../../services/doctorService';
import { bookAppointment } from '../../services/appointmentService';
import type { HospitalUser, Doctor } from '../../types';

const STEPS = ['Hospital', 'Doctor', 'Date & Time', 'Review', 'Confirm'];

export default function BookAppointment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState(0);
  const [selectedHospital, setSelectedHospital] = useState<HospitalUser | null>(null);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchHospital, setSearchHospital] = useState('');
  const [searchDoctor, setSearchDoctor] = useState('');

  const hospitals = useMemo(
    () => getAllUsers().filter((u): u is HospitalUser => u.role === 'hospital'),
    []
  );

  const doctors = useMemo(() => {
    if (!selectedHospital) return [];
    return getDoctorsByHospital(selectedHospital.id).filter(
      (d) => d.isAvailable && (!selectedDept || d.department === selectedDept)
    );
  }, [selectedHospital, selectedDept]);

  const slots = useMemo(() => {
    if (!selectedDoctor || !selectedDate) return [];
    return getAvailableSlots(selectedDoctor.id, selectedDate);
  }, [selectedDoctor, selectedDate]);

  // Pre-fill from URL params
  useEffect(() => {
    const hId = searchParams.get('hospitalId');
    const dId = searchParams.get('doctorId');
    if (hId) {
      const h = hospitals.find((h) => h.id === hId);
      if (h) { setSelectedHospital(h); setStep(1); }
      if (dId) {
        const docs = getDoctorsByHospital(hId);
        const d = docs.find((d) => d.id === dId);
        if (d) { setSelectedDoctor(d); setSelectedDept(d.department); setStep(2); }
      }
    }
  }, [searchParams, hospitals]);

  const filteredHospitals = hospitals.filter((h) =>
    h.hospitalName.toLowerCase().includes(searchHospital.toLowerCase()) ||
    h.city.toLowerCase().includes(searchHospital.toLowerCase())
  );

  const filteredDoctors = doctors.filter((d) =>
    d.fullName.toLowerCase().includes(searchDoctor.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchDoctor.toLowerCase())
  );

  const canProceed = () => {
    if (step === 0) return !!selectedHospital;
    if (step === 1) return !!selectedDoctor;
    if (step === 2) return !!selectedDate && !!selectedSlot;
    if (step === 3) return true;
    return false;
  };

  const handleBook = async () => {
    if (!selectedHospital || !selectedDoctor || !selectedDate || !selectedSlot || !user) return;
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = bookAppointment({
      patientId: user.id,
      patientName: user.name,
      patientPhone: '',
      hospitalId: selectedHospital.id,
      hospitalName: selectedHospital.hospitalName,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.fullName,
      department: selectedDoctor.department,
      date: selectedDate,
      timeSlot: selectedSlot,
      reason,
      consultationFee: selectedDoctor.consultationFee,
    });
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error ?? 'Booking failed');
      return;
    }
    setStep(4);
    toast.success('Appointment booked successfully!');
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 60);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Book an Appointment</h1>
        <p className="page-subtitle">Follow the steps to book your appointment</p>
      </div>

      {/* Stepper */}
      {step < 4 && (
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.slice(0, 4).map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                i === step ? 'bg-blue-600 text-white' :
                i < step ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                'bg-slate-100 dark:bg-slate-700 text-slate-400'
              }`}>
                {i < step ? <CheckCircle size={12} /> : <span>{i + 1}</span>}
                {s}
              </div>
              {i < 3 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 font-heading flex items-center gap-2">
                <Hospital size={18} className="text-blue-600" /> Select Hospital
              </h2>
              <input
                value={searchHospital}
                onChange={(e) => setSearchHospital(e.target.value)}
                placeholder="Search hospitals..."
                className="input-field mb-4"
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {filteredHospitals.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => { setSelectedHospital(h); setSelectedDept(''); setSelectedDoctor(null); }}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${
                      selectedHospital?.id === h.id
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center shrink-0">
                        <Hospital size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{h.hospitalName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{h.city}, {h.state}</p>
                      </div>
                    </div>
                    {selectedHospital?.id === h.id && (
                      <CheckCircle size={16} className="text-blue-600 mt-2" />
                    )}
                  </button>
                ))}
              </div>
              {selectedHospital && (
                <div className="mt-4">
                  <label className="label">Filter by Department (optional)</label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="input-field"
                  >
                    <option value="">All Departments</option>
                    {selectedHospital.departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 font-heading flex items-center gap-2">
                <Stethoscope size={18} className="text-blue-600" /> Select Doctor
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {selectedHospital?.hospitalName}
                {selectedDept && ` Â· ${selectedDept}`}
              </p>
              <input
                value={searchDoctor}
                onChange={(e) => setSearchDoctor(e.target.value)}
                placeholder="Search doctors..."
                className="input-field mb-4"
              />
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-10">
                  <Stethoscope size={32} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm">No doctors available for the selected department.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredDoctors.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDoctor(d)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedDoctor?.id === d.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold shrink-0">
                          {d.fullName.split(' ')[1]?.charAt(0) ?? 'D'}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white text-sm">{d.fullName}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">{d.specialization}</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                        <p>{d.experience} yrs experience Â· {d.qualification}</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">â‚¹{d.consultationFee} consultation fee</p>
                        <p>Works: {d.workingDays.map((w) => w.slice(0, 3)).join(', ')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-4 font-heading flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" /> Select Date & Time
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                {selectedDoctor?.fullName} Â· Works on: {selectedDoctor?.workingDays.map((w) => w.slice(0, 3)).join(', ')}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="label">Appointment Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => { setSelectedDate(e.target.value); setSelectedSlot(''); }}
                    min={today}
                    max={maxDateStr}
                    className="input-field"
                  />
                  {selectedDate && selectedDoctor && (() => {
                    const day = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                    if (!selectedDoctor.workingDays.includes(day)) {
                      return (
                        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                          <AlertCircle size={12} /> Doctor doesn't work on {day}s
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>

                {selectedDate && (
                  <div>
                    <label className="label">Available Time Slots</label>
                    {slots.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4">No slots available for this date.</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {slots.map((s) => (
                          <button
                            key={s.slot}
                            onClick={() => s.isAvailable && setSelectedSlot(s.slot)}
                            disabled={!s.isAvailable}
                            className={`py-2 px-3 rounded-xl text-xs font-medium transition-all border ${
                              selectedSlot === s.slot
                                ? 'bg-blue-600 text-white border-blue-600'
                                : s.isAvailable
                                ? 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400'
                                : 'bg-slate-100 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 cursor-not-allowed line-through'
                            }`}
                          >
                            {s.slot}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="label">Reason for Visit (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Briefly describe your symptoms or reason (demo data only â€” do not enter real medical information)"
                  maxLength={300}
                />
                <p className="text-xs text-slate-400 mt-1">{reason.length}/300</p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div className="card p-6">
              <h2 className="font-semibold text-slate-900 dark:text-white mb-5 font-heading">Review & Confirm</h2>
              <div className="space-y-4">
                {[
                  { label: 'Hospital', value: selectedHospital?.hospitalName, icon: Hospital },
                  { label: 'Doctor', value: `${selectedDoctor?.fullName} (${selectedDoctor?.specialization})`, icon: User },
                  { label: 'Department', value: selectedDoctor?.department, icon: Stethoscope },
                  { label: 'Date', value: selectedDate ? format(new Date(selectedDate), 'PPP') : '', icon: Calendar },
                  { label: 'Time', value: selectedSlot, icon: Clock },
                  { label: 'Consultation Fee', value: `â‚¹${selectedDoctor?.consultationFee}`, icon: CheckCircle },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                      <item.icon size={15} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                ))}
                {reason && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reason for Visit</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{reason}</p>
                  </div>
                )}
              </div>
              <div className="mt-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Demo Application: This appointment is stored locally in your browser only. Not a real medical booking.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-12 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-heading mb-2">
              Appointment Booked!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Your appointment with <strong>{selectedDoctor?.fullName}</strong> on{' '}
              <strong>{selectedDate ? format(new Date(selectedDate), 'PPP') : ''}</strong> at{' '}
              <strong>{selectedSlot}</strong> has been submitted.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
              You'll receive a notification once the hospital confirms your appointment.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => navigate('/patient/appointments')}
                className="btn-primary"
              >
                View My Appointments
              </button>
              <button
                onClick={() => { setStep(0); setSelectedHospital(null); setSelectedDoctor(null); setSelectedDate(''); setSelectedSlot(''); setReason(''); }}
                className="btn-secondary"
              >
                Book Another
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="btn-secondary disabled:opacity-40"
          >
            <ChevronLeft size={16} /> Back
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="btn-primary disabled:opacity-40"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleBook}
              disabled={isLoading}
              className="btn-primary"
            >
              {isLoading ? 'Booking...' : (
                <><CheckCircle size={16} /> Confirm Booking</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

