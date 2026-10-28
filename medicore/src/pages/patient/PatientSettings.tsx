import { motion } from 'framer-motion';
import { Moon, Sun, Monitor, Trash2, AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../context/ThemeContext';
import { resetAllDemoData } from '../../storage/initStorage';
import { useState } from 'react';
import { ConfirmDialog } from '../../components/common/Modal';

export default function PatientSettings() {
  const { theme, setTheme } = useTheme();
  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = () => {
    resetAllDemoData();
    toast.success('Demo data reset to defaults. Please refresh the page.');
    setResetConfirm(false);
    setTimeout(() => window.location.reload(), 1500);
  };

  const THEMES = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your preferences</p>
      </div>

      <div className="space-y-5">
        {/* Theme */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-4">Appearance</h3>
          <div className="flex gap-3">
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={`flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                  theme === t.value
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                }`}
              >
                <t.icon size={20} className={theme === t.value ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'} />
                <span className={`text-sm font-medium ${theme === t.value ? 'text-blue-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Demo Data */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-2">Demo Data</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Reset all demo data back to the default sample content. Your account will not be deleted, but all appointments, records, and changes will be reverted.
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-100 dark:border-amber-800 flex items-start gap-2 mb-4">
            <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              This will overwrite all current demo data with the original seed data. This action cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setResetConfirm(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm font-medium"
          >
            <RefreshCw size={15} /> Reset Demo Data
          </button>
        </div>

        {/* About */}
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 dark:text-white font-heading mb-3">About MediCore</h3>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <p>Version: 1.0.0 (Demo)</p>
            <p>Type: College Final Year Project</p>
            <p>Stack: React + TypeScript + Tailwind CSS</p>
            <p>Storage: Browser localStorage only</p>
            <p className="text-xs text-slate-400 mt-3">
              All data in MediCore is stored locally in your browser. No data is transmitted to any external server except via the AI assistant endpoint. All hospitals, doctors, patients, and appointments are fictional sample data.
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Demo Data"
        message="This will reset all sample data to defaults. The page will refresh automatically. Continue?"
        confirmLabel="Reset Data"
        variant="warning"
      />
    </div>
  );
}
