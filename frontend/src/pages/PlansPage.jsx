
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
            <p className="text-gray-600 text-sm">Access an exsisting or create a new plan</p>
            {selectedPlan && (
              <div className="mt-3">
                <PlanCodeDisplay plan={selectedPlan} compact />
              </div>
            )}
          </div>
        </div>
      </div>

      

      <PlanBuilder
        plans={plans}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        userMode={userMode}
        onCreatePlan={onCreatePlan}
      />

      {hasAccessiblePlans && (
        <div className="flex flex-col med:flex-row gap-3 mt-4">
          <button onClick={onClearAccess} className="px-4 py-2 border rounded-lg">Clear Plan Access</button>
        </div>
      )}
    </div>
  );
}
