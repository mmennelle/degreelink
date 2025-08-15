import React from 'react';
import PlanCodeLookup from '../components/PlanCodeLookup';

export default function LookupPage({ onSuccess, onCreatePlan, onOpenPlan }) {
  return (
    <div className="max-w-xl mx-auto">
      <PlanCodeLookup onSuccess={onSuccess} onCreatePlan={onCreatePlan} onOpenPlan={onOpenPlan} />
    </div>
  );
}