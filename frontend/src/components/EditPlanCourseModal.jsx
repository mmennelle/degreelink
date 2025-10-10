import React, { useEffect, useMemo, useState } from 'react';

export default function EditPlanCourseModal({ isOpen, onClose, plan, planCourse, program, onSave, onRemove }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !planCourse) return;
    setForm({
      status: planCourse.status || 'planned',
      semester: planCourse.semester || 'Fall',
      year: planCourse.year || new Date().getFullYear(),
      grade: planCourse.grade || '',
      credits: planCourse.credits || planCourse.course?.credits || 0,
      requirement_category: planCourse.requirement_category || '',
      requirement_group_id: planCourse.requirement_group_id || null,
      notes: planCourse.notes || '',
    });
  }, [isOpen, planCourse]);

  const requirement = useMemo(() => program?.requirements?.find(r => r.category === form?.requirement_category), [program, form?.requirement_category]);

  const update = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!plan || !planCourse || !form) return;
    setSaving(true);
    try {
      await onSave?.(plan.id, planCourse.id, {
        ...form,
        year: Number(form.year) || null,
        credits: Number(form.credits) || 0,
        requirement_group_id: form.requirement_group_id || null,
      });
      onClose?.();
    } finally {
      setSaving(false);
    }
  };

  const removeCourse = async () => {
    if (!plan || !planCourse) return;
    if (!confirm('Remove this course from the plan?')) return;
    setSaving(true);
    try {
      await onRemove?.(plan.id, planCourse.id);
      onClose?.();
    } finally { setSaving(false); }
  };

  if (!isOpen || !planCourse || !form) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onMouseDown={(e)=>{ if(e.target===e.currentTarget) onClose?.(); }}>
      <div role="dialog" aria-modal="true" className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-lg sm:rounded-lg shadow-xl">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Course in Plan</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded p-3">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{planCourse.course?.code}: {planCourse.course?.title}</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">{planCourse.course?.institution} • {planCourse.course?.credits} credits</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={e=>update('status', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Semester</label>
              <select value={form.semester} onChange={e=>update('semester', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option>Fall</option>
                <option>Spring</option>
                <option>Summer</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
              <input type="number" value={form.year} onChange={e=>update('year', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            {form.status === 'completed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grade</label>
                <input value={form.grade} onChange={e=>update('grade', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" placeholder="A, B+, C-" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Credits</label>
              <input type="number" value={form.credits} onChange={e=>update('credits', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirement Category</label>
            <input value={form.requirement_category} onChange={e=>update('requirement_category', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" list="req-categories" />
            <datalist id="req-categories">
              {(program?.requirements || []).map(r => (<option key={r.id || r.category} value={r.category} />))}
            </datalist>
          </div>

          {requirement?.requirement_type === 'grouped' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirement Group</label>
              <select value={form.requirement_group_id ?? ''} onChange={e=>update('requirement_group_id', e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">None</option>
                {(requirement.groups || []).map(g => (
                  <option key={g.id} value={g.id}>{g.group_name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea rows={3} value={form.notes} onChange={e=>update('notes', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
          <button onClick={removeCourse} disabled={saving} className="px-4 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30">Remove from Plan</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">Cancel</button>
            <button onClick={submit} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
