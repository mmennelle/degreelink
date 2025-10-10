import React, { useEffect, useMemo, useState } from 'react';

export default function EditPlanModal({ isOpen, onClose, plan, programs = [], onSave }) {
  const [form, setForm] = useState({ plan_name: '', student_email: '', status: 'draft', current_program_id: null });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !plan) return;
    setForm({
      plan_name: plan.plan_name || '',
      student_email: plan.student_email || '',
      status: plan.status || 'draft',
      current_program_id: plan.current_program_id || null,
    });
  }, [isOpen, plan]);

  const programOptions = useMemo(() => programs.map(p => ({ id: p.id, label: `${p.institution} — ${p.name || p.program_name || p.id}` })), [programs]);

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!plan) return;
    setSaving(true);
    try {
      await onSave?.(plan.id, form);
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <div role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-lg sm:rounded-lg shadow-xl">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Plan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
            <input value={form.plan_name} onChange={e=>update('plan_name', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Email</label>
            <input type="email" value={form.student_email} onChange={e=>update('student_email', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e=>update('status', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Program</label>
              <select value={form.current_program_id ?? ''} onChange={e=>update('current_program_id', e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">None</option>
                {programOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          {plan.program_id && (
            <p className="text-xs text-gray-500 dark:text-gray-400">Target Program is fixed at creation for now.</p>
          )}
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300">Cancel</button>
          <button onClick={submit} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}
