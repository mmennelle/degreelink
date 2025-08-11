// src/pages/SearchPage.jsx
import React from 'react';
import CourseSearch from '../components/CourseSearch';

export default function SearchPage({ selectedPlanId, programs, onAddToPlan, setSelectedPlanId }) {
  const selectedProgram = selectedPlanId
    ? programs.find(p => p.id === (programs.find(pr => pr.id === programs.find(x=>x.id === (programs.find(y=>y.id===selectedPlanId)?.program_id))?.id)?.id))
    : null; // keep logic consistent with your current lookup (clean up later)

  return (
    <div className="space-y-4">
      <div className="block lg:hidden">
        <h2 className="text-xl font-semibold">Find Courses</h2>
        <p className="text-gray-600 text-sm">Search for courses and check transfer equivalencies</p>
      </div>
      <CourseSearch
        planId={selectedPlanId}
        setPlanId={setSelectedPlanId}
        onAddToPlan={onAddToPlan}
        program={selectedProgram}
      />
    </div>
  );
}
