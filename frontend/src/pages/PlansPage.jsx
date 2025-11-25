/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */


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
        <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
          <button onClick={onClearAccess} className="px-4 py-2 border rounded-lg bg-indigo-600 text-surface-light dark:bg-surface-dark/90 hover:text-red-500 dark:hover:text-red-500">Logout</button>
          <button onClick={onDeletePlan} className="px-4 py-2 border rounded-lg bg-indigo-600 text-surface-light dark:bg-surface-dark/90 hover:text-red-500 dark:hover:text-red-500">Delete Plan</button>
        </div>
      )}
    </div>
  );
}
