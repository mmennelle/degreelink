import React, { useState } from 'react';
import AdvisorCenter from '../components/AdvisorCenter';
import AuditPage from './AuditPage';

export default function AdvisorCenterPage({ onOpenPlan, selectedPlanId, plans }) {
  const [activeSubTab, setActiveSubTab] = useState('students');

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeSubTab === 'students'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Student Plans
          </button>
          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeSubTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Degree Audit
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSubTab === 'students' && <AdvisorCenter onOpenPlan={onOpenPlan} />}
      {activeSubTab === 'audit' && <AuditPage selectedPlanId={selectedPlanId} plans={plans} />}
    </div>
  );
}
