/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function EditPlanModal({ isOpen, onClose, plan, programs = [], onSave, userMode }) {
  const [form, setForm] = useState({ plan_name: '', student_email: '', status: 'draft', current_program_id: null });
  const [catalogYearForm, setCatalogYearForm] = useState({ semester: '', year: '' });
  const [programVersions, setProgramVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [updatingCatalogYear, setUpdatingCatalogYear] = useState(false);
  const [catalogYearMessage, setCatalogYearMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const isAdmin = userMode === 'advisor';

  useEffect(() => {
    if (!isOpen || !plan) return;
    setForm({
      plan_name: plan.plan_name || '',
      student_email: plan.student_email || '',
      status: plan.status || 'draft',
      current_program_id: plan.current_program_id || null,
    });
    setCatalogYearForm({
      semester: plan.program_version_semester || '',
      year: plan.program_version_year || ''
    });
    setCatalogYearMessage(null);
    
    // Load available program versions if admin
    if (isAdmin && plan.program_id) {
      loadProgramVersions(plan.program_id);
    }
  }, [isOpen, plan, isAdmin]);

  const loadProgramVersions = async (programId) => {
    setLoadingVersions(true);
    try {
      const response = await api.getProgramVersions(programId);
      setProgramVersions(response.versions || []);
    } catch (error) {
      console.error('Failed to load program versions:', error);
      setProgramVersions([]);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleCatalogYearUpdate = async () => {
    if (!plan || !catalogYearForm.semester || !catalogYearForm.year) {
      setCatalogYearMessage({ type: 'error', text: 'Please select a semester and year' });
      return;
    }
    
    setUpdatingCatalogYear(true);
    setCatalogYearMessage(null);
    
    try {
      await api.updateCatalogYearByCode(plan.plan_code, catalogYearForm.semester, parseInt(catalogYearForm.year));
      setCatalogYearMessage({ 
        type: 'success', 
        text: `Catalog year updated to ${catalogYearForm.semester} ${catalogYearForm.year}` 
      });
      
      // Refresh the plan data
      setTimeout(() => {
        onClose?.();
        window.location.reload(); // Simple refresh to get updated data
      }, 1500);
    } catch (error) {
      setCatalogYearMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update catalog year' 
      });
    } finally {
      setUpdatingCatalogYear(false);
    }
  };

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
      <div role="dialog" aria-modal="true" aria-labelledby="edit-plan-title" className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-lg sm:rounded-lg shadow-xl">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 id="edit-plan-title" className="text-lg font-semibold text-gray-900 dark:text-white">Edit Plan</h2>
          <button onClick={onClose} aria-label="Close dialog" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <label htmlFor="edit-plan-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan Name</label>
            <input id="edit-plan-name" value={form.plan_name} onChange={e=>update('plan_name', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div>
            <label htmlFor="edit-student-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student Email</label>
            <input id="edit-student-email" type="email" value={form.student_email} onChange={e=>update('student_email', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select id="edit-status" value={form.status} onChange={e=>update('status', e.target.value)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label htmlFor="edit-current-program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Program</label>
              <select id="edit-current-program" value={form.current_program_id ?? ''} onChange={e=>update('current_program_id', e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
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
          
          {/* Catalog Year Management - Admin Only */}
          {isAdmin && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-3">
                <Calendar size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Catalog Year Lock</h3>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                Students follow requirements from their starting catalog year. Update this if the student stops for a semester or requests a catalog change.
              </p>
              
              {loadingVersions ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">Loading available versions...</div>
              ) : programVersions.length > 0 ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="catalog-semester" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Semester
                      </label>
                      <select
                        id="catalog-semester"
                        value={catalogYearForm.semester}
                        onChange={(e) => setCatalogYearForm({ ...catalogYearForm, semester: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select...</option>
                        {[...new Set(programVersions.map(v => v.semester))].map(sem => (
                          <option key={sem} value={sem}>{sem}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="catalog-year" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Year
                      </label>
                      <select
                        id="catalog-year"
                        value={catalogYearForm.year}
                        onChange={(e) => setCatalogYearForm({ ...catalogYearForm, year: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select...</option>
                        {[...new Set(programVersions.map(v => v.year))].sort((a, b) => b - a).map(yr => (
                          <option key={yr} value={yr}>{yr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCatalogYearUpdate}
                    disabled={updatingCatalogYear || !catalogYearForm.semester || !catalogYearForm.year}
                    className="w-full px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updatingCatalogYear ? 'Updating...' : 'Update Catalog Year'}
                  </button>
                  
                  {catalogYearMessage && (
                    <div className={`flex items-start gap-2 p-2 rounded text-xs ${
                      catalogYearMessage.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
                        : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                    }`}>
                      <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                      <span>{catalogYearMessage.text}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  No program versions available for this program.
                </div>
              )}
            </div>
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
