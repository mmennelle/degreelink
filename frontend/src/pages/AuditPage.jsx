// src/pages/AuditPage.jsx
import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function AuditPage({ selectedPlanId, plans }) {
  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Determine plan from props if planId not provided directly
  const planId = selectedPlanId || (plans && plans.length > 0 ? plans[0].id : null);
  const plan = plans?.find?.(p => p.id === planId);
  useEffect(() => {
    if (!planId) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await api.getPlanAudit(planId);
        setAudit(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [planId]);

  const handleDownload = async () => {
    if (!planId) return;
    try {
      const blob = await api.downloadPlanAudit(planId, 'csv');
  const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
  const baseName = (plan && (plan.plan_name || plan.name)) || `plan_${planId}`;
  a.download = `${baseName}_degree_audit.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert('Download failed: ' + e.message);
    }
  };

  if (!planId) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold">Select a plan to view the degree audit</h2>
        <p className="text-gray-600 text-sm">Once you have an active plan, the degree audit summary will appear here.</p>
      </div>
    );
  }

  if (loading) {
    return <p>Loading degree audit...</p>;
  }

  if (error) {
    return <p className="text-red-600">Error: {error}</p>;
  }

  if (!audit) {
    return null;
  }

  const { progress, unmet_requirements } = audit;
  const { requirement_progress = [], total_credits_earned, total_credits_required, completion_percentage, requirements_completion_percentage } = progress || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Degree Audit Summary</h2>
        <p className="text-gray-600 text-sm">Overview of your academic progress based on the selected plan.</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-medium mb-2">Overall Progress</h3>
        <p className="text-sm">Total Credits Earned: {total_credits_earned} / {total_credits_required}</p>
        <p className="text-sm">Completion Percentage: {completion_percentage ? completion_percentage.toFixed(1) : 0}%</p>
        <p className="text-sm">Requirements Completion: {requirements_completion_percentage ? requirements_completion_percentage.toFixed(1) : 0}%</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow">
        <h3 className="text-lg font-medium mb-2">Requirement Breakdown</h3>
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Category</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Required</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Completed</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Remaining</th>
                    <th className="px-3 py-3 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {requirement_progress.map((r) => (
                    <tr key={r.id || r.category} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                      <td className="px-3 py-3 whitespace-nowrap font-medium">{r.category}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.credits_required}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.credits_completed}</td>
                      <td className="px-3 py-3 whitespace-nowrap">{r.credits_remaining}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {r.is_complete ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Complete</span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">In Progress</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {unmet_requirements && unmet_requirements.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl shadow">
          <h3 className="text-lg font-medium mb-2">Unmet Requirements</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            {unmet_requirements.map((req, index) => (
              <li key={index}>{req.category}: {req.credits_needed} credits remaining</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          className="px-4 py-2 border rounded-lg bg-indigo-600 text-white dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          Download CSV
        </button>
      </div>
    </div>
  );
}