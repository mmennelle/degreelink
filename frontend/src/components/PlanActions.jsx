/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React from 'react';
import { Plus, List } from 'lucide-react';

export function PlanActions({ onAddCourse, onViewAllCourses }) {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
      <button
        onClick={onAddCourse}
        className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-green-800 dark:hover:bg-green-800 flex items-center justify-center transition-colors text-sm"
      >
        <Plus className="mr-1" size={16} />
        Add Course
      </button>
      {onViewAllCourses && (
        <button
          onClick={onViewAllCourses}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-green-800 dark:hover:bg-green-800 flex items-center justify-center transition-colors text-sm"
        >
          <List className="mr-1" size={16} />
          View All Courses
        </button>
      )}
    </div>
  );
}
