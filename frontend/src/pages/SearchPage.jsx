/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

// src/pages/SearchPage.jsx
import React, { useMemo, useState } from 'react';
import { Search, ArrowRightLeft } from 'lucide-react';
import CourseSearch from '../components/CourseSearch';
import ArticulationLookup from '../components/ArticulationLookup';

export default function SearchPage({ selectedPlanId, programs, onAddToPlan, setSelectedPlanId, plans = [] }) {
  const [subTab, setSubTab] = useState('courses'); // 'courses' | 'ccn'

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

      {/* Sub-tab toggle */}
      <div className="flex gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-2">
        <button
          onClick={() => setSubTab('courses')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            subTab === 'courses'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Search size={16} />
          Course Search
        </button>
        <button
          onClick={() => setSubTab('ccn')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            subTab === 'ccn'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <ArrowRightLeft size={16} />
          CCN
        </button>
      </div>

      {subTab === 'courses' ? (
        <CourseSearch
          planId={selectedPlanId}
          setPlanId={setSelectedPlanId}
          onAddToPlan={onAddToPlan}
          program={selectedProgram}
        />
      ) : (
        <div className="max-w-5xl mx-auto">
          <ArticulationLookup />
        </div>
      )}
    </div>
  );
}
