import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../../lib/motion';
import { Search, Stethoscope, Star, ArrowRight, Filter } from 'lucide-react';
import { getAllDoctors } from '../../services/doctorService';
import { getAllUsers } from '../../services/authService';
import type { Doctor, HospitalUser } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

const SPECIALIZATIONS = [
  'All', 'Cardiologist', 'Neurologist', 'Orthopedic Surgeon', 'Pediatrician',
  'Dermatologist', 'ENT Specialist', 'Gynecologist', 'Cardiac Surgeon', 'General Physician',
];

export default function PatientDoctors() {
  const [search, setSearch] = useState('');
  const [specFilter, setSpecFilter] = useState('All');

  const doctors = useMemo(() => getAllDoctors(), []);
  const hospitals = useMemo(
    () => Object.fromEntries(
      getAllUsers().filter((u): u is HospitalUser => u.role === 'hospital').map((h) => [h.id, h])
    ),
    []
  );

  const filtered = useMemo(() => {
    return doctors.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch = !q || d.fullName.toLowerCase().includes(q) || d.specialization.toLowerCase().includes(q) || d.department.toLowerCase().includes(q);
      const matchSpec = specFilter === 'All' || d.specialization === specFilter;
      return matchSearch && matchSpec;
    });
  }, [doctors, search, specFilter]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Find Doctors</h1>
        <p className="page-subtitle">Browse doctors from all hospitals</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search doctors by name, specialization..." className="input-field pl-9 text-sm" />
        </div>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((s) => (
            <button
              key={s}
              onClick={() => setSpecFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${specFilter === s ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{filtered.length} doctors found</p>

      {filtered.length === 0 ? (
        <EmptyState icon={Stethoscope} title="No doctors found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((doc, i) => {
            const hospital = hospitals[doc.hospitalId];
            return (
              <motion.div key={doc.id} className="card p-5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {doc.fullName.split(' ')[1]?.charAt(0) ?? 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{doc.fullName}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{doc.specialization}</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <p>ðŸ¥ {hospital?.hospitalName ?? 'Hospital'}</p>
                  <p>ðŸ“‹ {doc.qualification}</p>
                  <p>â­ {doc.experience} years experience</p>
                  <p className="font-medium text-slate-900 dark:text-white">â‚¹{doc.consultationFee} consultation</p>
                  <p>ðŸ—“ {doc.workingDays.map((d) => d.slice(0, 3)).join(', ')}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`badge text-xs ${doc.isAvailable ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600'}`}>
                    {doc.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                  {doc.isAvailable && (
                    <Link
                      to={`/patient/book?hospitalId=${doc.hospitalId}&doctorId=${doc.id}`}
                      className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:text-blue-700"
                    >
                      Book <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

