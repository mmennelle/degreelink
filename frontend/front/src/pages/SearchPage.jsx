// src/pages/SearchPage.jsx
import React, { useMemo } from 'react';
import CourseSearch from '../components/CourseSearch';

export default function SearchPage({ selectedPlanId, programs, onAddToPlan, setSelectedPlanId, plans = [] }) {
  // make sure programs is an array (handles API returning a map/object)
  const programsArr = Array.isArray(programs) ? programs : Object.values(programs || {});

  // derive the program for the selected plan, if possible
  const selectedProgram = useMemo(() => {
    if (!selectedPlanId || !Array.isArray(plans)) return null;
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return null;
   return programsArr.find(pr => pr.id === plan.program_id) || null;
  }, [selectedPlanId, plans, programsArr]);

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
