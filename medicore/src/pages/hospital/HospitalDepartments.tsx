import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Building2, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { getAll, setStorage, generateId } from '../../storage';
import { STORAGE_KEYS } from '../../types';
import type { Department } from '../../types';
import { Modal, ConfirmDialog } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';

const PRESET_DEPARTMENTS = ['General Medicine','Cardiology','Neurology','Orthopedics','Pediatrics','Dermatology','ENT','Ophthalmology','Dentistry','Gynecology','Oncology','Psychiatry','Radiology','Gastroenterology'];

export default function HospitalDepartments() {
  const { user } = useAuth();
  const [refresh, setRefresh] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Department | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', headDoctor: '', floor: '', roomNumbers: '' });

  const departments = useMemo(() => getAll<Department>(STORAGE_KEYS.DEPARTMENTS).filter((d) => d.hospitalId === user?.id), [user?.id, refresh]);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', headDoctor: '', floor: '', roomNumbers: '' }); setIsModalOpen(true); };
  const openEdit = (d: Department) => { setEditing(d); setForm({ name: d.name, description: d.description ?? '', headDoctor: d.headDoctor ?? '', floor: d.floor ?? '', roomNumbers: d.roomNumbers ?? '' }); setIsModalOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error('Department name required'); return; }
    const all = getAll<Department>(STORAGE_KEYS.DEPARTMENTS);
    if (editing) {
      const idx = all.findIndex((d) => d.id === editing.id);
      if (idx !== -1) { all[idx] = { ...all[idx], ...form }; setStorage(STORAGE_KEYS.DEPARTMENTS, all); toast.success('Updated'); }
    } else {
      const newDept: Department = { id: generateId('dept'), hospitalId: user!.id, ...form, isActive: true, createdAt: new Date().toISOString() };
      all.push(newDept); setStorage(STORAGE_KEYS.DEPARTMENTS, all); toast.success('Department added');
    }
    setRefresh((r) => r + 1); setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    setStorage(STORAGE_KEYS.DEPARTMENTS, getAll<Department>(STORAGE_KEYS.DEPARTMENTS).filter((d) => d.id !== deleteId));
    toast.success('Deleted'); setRefresh((r) => r + 1); setDeleteId(null);
  };

  const toggleActive = (d: Department) => {
    const all = getAll<Department>(STORAGE_KEYS.DEPARTMENTS);
    const idx = all.findIndex((x) => x.id === d.id);
    if (idx !== -1) { all[idx].isActive = !d.isActive; setStorage(STORAGE_KEYS.DEPARTMENTS, all); setRefresh((r) => r + 1); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div><h1 className="page-title">Departments</h1><p className="page-subtitle">{departments.length} departments</p></div>
        <button onClick={openAdd} className="btn-primary"><Plus size={16} /> Add Department</button>
      </div>

      {departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" description="Add departments to organize your hospital services." action={<button onClick={openAdd} className="btn-primary">Add Department</button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept, i) => (
            <motion.div key={dept.id} className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white font-heading">{dept.name}</h3>
                  {dept.headDoctor && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Head: {dept.headDoctor}</p>}
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(dept)} className={`p-1 rounded-lg transition-colors ${dept.isActive ? 'text-emerald-500' : 'text-slate-400'}`} title="Toggle">
                    {dept.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"><Edit2 size={13} /></button>
                  <button onClick={() => setDeleteId(dept.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><Trash2 size={13} /></button>
                </div>
              </div>
              {dept.description && <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">{dept.description}</p>}
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                {dept.floor && <span>Floor: {dept.floor}</span>}
                {dept.roomNumbers && <span>Rooms: {dept.roomNumbers}</span>}
                <span className={`ml-auto badge ${dept.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{dept.isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'} size="sm">
        <div className="p-6 space-y-4">
          <div>
            <label className="label">Department Name *</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-field" list="dept-presets" />
            <datalist id="dept-presets">{PRESET_DEPARTMENTS.map((d) => <option key={d} value={d} />)}</datalist>
          </div>
          <div><label className="label">Description</label><textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={2} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Head Doctor</label><input value={form.headDoctor} onChange={(e) => setForm((f) => ({ ...f, headDoctor: e.target.value }))} className="input-field" /></div>
            <div><label className="label">Floor</label><input value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3"><button onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button onClick={handleSave} className="btn-primary">Save</button></div>
        </div>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Department" message="Remove this department?" confirmLabel="Delete" variant="danger" />
    </div>
  );
}
