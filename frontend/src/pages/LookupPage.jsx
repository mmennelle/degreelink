/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React from 'react';
import PlanCodeLookup from '../components/PlanCodeLookup';

export default function LookupPage({ onSuccess, onCreatePlan, onOpenPlan }) {
  return (
    <div className="max-w-xl mx-auto">
      <PlanCodeLookup onSuccess={onSuccess} onCreatePlan={onCreatePlan} onOpenPlan={onOpenPlan} />
    </div>
  );
}