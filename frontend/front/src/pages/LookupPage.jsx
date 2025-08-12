// src/pages/LookupPage.jsx
import React from 'react';
import PlanCodeLookup from '../components/PlanCodeLookup';

export default function LookupPage({ onSuccess, onCreatePlan }) {
  return (
    <div className="max-w-xl mx-auto">
      <PlanCodeLookup onSuccess={onSuccess} onCreatePlan={onCreatePlan} />
    </div>
  );
}
