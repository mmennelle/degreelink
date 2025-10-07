import React from 'react';
import { ChevronLeft, Pencil } from 'lucide-react';

export function PlanHeader({ selectedPlan, onBack, canEdit = false, onEditPlan }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
      >
        <ChevronLeft className="mr-1" size={16} />
        Back to Plans
      </button>
      <div className="flex items-center gap-2">
        {canEdit && (
          <button
            onClick={onEditPlan}
            className="hidden sm:inline-flex items-center text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Edit plan settings"
          >
            <Pencil size={14} className="mr-1" /> Edit Plan
          </button>
        )}
        {selectedPlan?.plan_code && (
          <button
            onClick={() => {
              if (navigator?.clipboard) {
                navigator.clipboard.writeText(selectedPlan.plan_code).then(() => alert('Plan code copied'));
              }
            }}
            className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Click to copy plan code"
          >
            {selectedPlan.plan_code}
          </button>
        )}
      </div>
    </div>
  );
}
