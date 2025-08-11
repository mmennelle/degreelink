// src/pages/PlansPage.jsx
import React from 'react';
import PlanBuilder from '../components/PlanBuilder';
import { PlanCodeDisplay } from '../components/PlanCodeLookup';

export default function PlansPage({
  plans, selectedPlanId, setSelectedPlanId,
  onCreatePlan, onClearAccess, onDeletePlan, setPlanLookupModal, userMode
}) {
  const hasAccessiblePlans = plans && plans.length > 0;
  const selectedPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="space-y-4">
      <div className="block lg:hidden">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">Academic Plans</h2>
            <p className="text-gray-600 text-sm">Access to your degree plans</p>
            {selectedPlan && (
              <div className="mt-3">
                <PlanCodeDisplay plan={selectedPlan} compact />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {!hasAccessiblePlans ? (
              <>
                <button onClick={() => setPlanLookupModal(true)} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm">Enter Plan Code</button>
                <button onClick={onCreatePlan} className="px-3 py-2 border rounded-lg text-sm">Create Plan</button>
              </>
            ) : (
              <>
                <button onClick={onClearAccess} className="px-3 py-2 border rounded-lg text-sm">Clear Access</button>
              </>
            )}
          </div>
        </div>
      </div>

      {!hasAccessiblePlans && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-blue-800 mb-1">Plan Access</h4>
          <p className="text-sm text-blue-700 mb-2">
            For your privacy, plans can only be accessed using plan codes.
          </p>
          <div className="flex gap-2">
            <button onClick={() => setPlanLookupModal(true)} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm">Enter Plan Code</button>
            <button onClick={onCreatePlan} className="px-3 py-2 bg-blue-100 rounded-lg text-sm">Create New Plan</button>
          </div>
        </div>
      )}

      <PlanBuilder
        plans={plans}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        userMode={userMode}
      />

      {hasAccessiblePlans && (
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button onClick={onClearAccess} className="px-4 py-2 border rounded-lg">Clear Plan Access</button>
          <button onClick={onDeletePlan} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete Plan</button>
        </div>
      )}
    </div>
  );
}
