import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from '../../lib/motion';
import {
  Search, MapPin, Phone, Clock, Hospital, Star, ArrowRight,
  SlidersHorizontal, X, Filter
} from 'lucide-react';
import { PublicNavbar } from '../../components/layout/PublicNavbar';
import { getAllUsers } from '../../services/authService';
import type { HospitalUser } from '../../types';

const ALL_DEPARTMENTS = [
  'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
  'Pediatrics', 'Dermatology', 'ENT', 'Ophthalmology', 'Dentistry',
  'Gynecology', 'Psychiatry', 'Oncology',
];

const ALL_TYPES = [
  'General Hospital', 'Specialty Hospital', 'Teaching Hospital',
  "Children's Hospital", 'Clinic', 'Diagnostic Center',
];

export default function HospitalsPage() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const hospitals = useMemo(() => {
    return getAllUsers().filter((u): u is HospitalUser => u.role === 'hospital') as HospitalUser[];
  }, []);

  const cities = useMemo(() => [...new Set(hospitals.map((h) => h.city))].sort(), [hospitals]);

  const filtered = useMemo(() => {
    return hospitals.filter((h) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        h.hospitalName.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.departments.some((d) => d.toLowerCase().includes(q));
      const matchCity = !cityFilter || h.city === cityFilter;
      const matchDept = !deptFilter || h.departments.includes(deptFilter);
      const matchType = !typeFilter || h.hospitalType === typeFilter;
      return matchSearch && matchCity && matchDept && matchType;
    });
  }, [hospitals, search, cityFilter, deptFilter, typeFilter]);

  const clearFilters = () => {
    setSearch('');
    setCityFilter('');
    setDeptFilter('');
    setTypeFilter('');
  };

  const hasFilters = search || cityFilter || deptFilter || typeFilter;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <PublicNavbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-teal-600 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-white font-heading mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Find a Hospital
          </motion.h1>
          <p className="text-blue-100 mb-8">
            Browse demo hospitals, view departments, and book appointments.
            <span className="block text-xs mt-1 text-blue-200">All hospitals are sample data - Demo Project</span>
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals, departments, cities..."
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-red-400" />}
          </button>

          {showFilters && (
            <>
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="input-field w-auto py-2 text-sm"
              >
                <option value="">All Cities</option>
                {cities.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="input-field w-auto py-2 text-sm"
              >
                <option value="">All Departments</option>
                {ALL_DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field w-auto py-2 text-sm"
              >
                <option value="">All Types</option>
                {ALL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </>
          )}

          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 font-medium">
              <X size={14} /> Clear All
            </button>
          )}

          <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} hospital{filtered.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Hospital size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">No hospitals found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your search or filters</p>
            <button onClick={clearFilters} className="btn-primary mt-4">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((hospital, i) => (
              <motion.div
                key={hospital.id}
                className="card-hover overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                {/* Cover */}
                <div className="h-32 bg-gradient-to-br from-blue-500 to-teal-600 relative flex items-center justify-center">
                  <Hospital size={40} className="text-white/30" />
                  <div className="absolute top-3 left-3">
                    <span className="badge bg-white/20 text-white text-xs border border-white/20">
                      {hospital.hospitalType}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className="badge bg-amber-100 text-amber-700 text-xs">
                      Demo
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-1">
                    {hospital.hospitalName}
                  </h3>

                  <div className="space-y-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="shrink-0" />
                      <span className="truncate">{hospital.address}, {hospital.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="shrink-0" />
                      <a href={`tel:${hospital.contactNumber}`} className="hover:text-blue-600 transition-colors">
                        {hospital.contactNumber}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="shrink-0" />
                      <span>
                        {hospital.workingHours.monday.isOpen
                          ? `${hospital.workingHours.monday.openTime} - ${hospital.workingHours.monday.closeTime}`
                          : 'Closed Mondays'}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {hospital.departments.slice(0, 3).map((d) => (
                      <span key={d} className="badge bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs">
                        {d}
                      </span>
                    ))}
                    {hospital.departments.length > 3 && (
                      <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                        +{hospital.departments.length - 3}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          size={12}
                          className={j < Math.floor(hospital.rating ?? 4) ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-600'}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-1">{hospital.rating?.toFixed(1)}</span>
                    </div>
                    <Link
                      to={`/hospitals/${hospital.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700"
                    >
                      View Details
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-600">
        All hospitals shown are fictional sample data for demonstration purposes only.
      </div>
    </div>
  );
}

