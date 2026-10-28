import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, AlertTriangle, Calendar, User, Hospital } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAll } from '../../storage';
import { STORAGE_KEYS } from '../../types';
import type { MedicalRecord } from '../../types';
import { EmptyState } from '../../components/common/EmptyState';

export default function PatientMedicalRecords() {
  const { user } = useAuth();
  const records = useMemo(
    () => getAll<MedicalRecord>(STORAGE_KEYS.MEDICAL_RECORDS).filter((r) => r.patientId === user?.id),
    [user?.id]
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Medical Records</h1>
        <p className="page-subtitle">{records.length} records found</p>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-2xl flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
            Sample Data — Not Valid Medical Documents
          </p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            All records displayed are fictional demo data for project demonstration only. Do not use for any medical purpose.
          </p>
        </div>
      </div>

      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No medical records"
          description="Your medical records from completed visits will appear here."
        />
      ) : (
        <div className="space-y-4">
          {records.map((record, i) => (
            <motion.div
              key={record.id}
              className="card p-6"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white font-heading">
                    {record.diagnosis}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <User size={13} /> {record.doctorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hospital size={13} /> {record.hospitalName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {format(new Date(record.visitDate), 'PPP')}
                    </span>
                  </div>
                </div>
                <span className="badge bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 shrink-0 text-xs">
                  Sample Data
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Symptoms</p>
                  <p className="text-slate-700 dark:text-slate-300">{record.symptoms}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <p className="text-xs text-blue-500 dark:text-blue-400 mb-1 font-medium uppercase tracking-wide">Diagnosis</p>
                  <p className="text-slate-700 dark:text-slate-300">{record.diagnosis}</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <p className="text-xs text-emerald-500 dark:text-emerald-400 mb-1 font-medium uppercase tracking-wide">Treatment</p>
                  <p className="text-slate-700 dark:text-slate-300">{record.treatment}</p>
                </div>
              </div>

              {record.notes && (
                <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                  <p className="text-xs text-slate-500 mb-1">Notes</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{record.notes}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
