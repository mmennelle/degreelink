/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React from 'react';
import { BookOpen, Plus, ChevronRight } from 'lucide-react';

function getStatusColor(status) {
  switch (status) {
    case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
    case 'in_progress': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
    case 'planned': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
    default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
  }
}

function formatStatus(status) {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function PlanList({ plans, onSelect, onCreatePlan, onDeletePlan }) {
  if (!plans || plans.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Plans Found</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first academic plan to get started!</p>
        <button
          onClick={onCreatePlan}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center mx-auto transition-colors"
        >
          <Plus className="mr-1" size={16} />
          Create Plan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map(plan => (
        <button
          key={plan.id}
          onClick={() => onSelect(plan.id)}
          className="w-full text-left border border-gray-200 dark:border-gray-600 rounded-md p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
            <div className="flex-1">
              <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-1">{plan.plan_name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{plan.student_name}</p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className={`px-2 py-1 rounded ${getStatusColor(plan.status)}`}>{formatStatus(plan.status)}</span>
                <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
                {plan.courses && <span>{plan.courses.length} courses</span>}
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onDeletePlan(plan); }}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                aria-label={`Delete plan ${plan.plan_name}`}
                title="Delete plan"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <ChevronRight className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={20} aria-hidden="true" />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
