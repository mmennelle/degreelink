/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState } from 'react';
import ProgramManagement from './ProgramManagement';
import UploadPage from './UploadPage';

export default function ProgramManagementPage() {
  const [activeSubTab, setActiveSubTab] = useState('programs');

  return (
    <div>
      {/* Sub-tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveSubTab('programs')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeSubTab === 'programs'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            Programs
          </button>
          <button
            onClick={() => setActiveSubTab('upload')}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeSubTab === 'upload'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            CSV Upload
          </button>
        </div>
      </div>

      {/* Content */}
      {activeSubTab === 'programs' && <ProgramManagement />}
      {activeSubTab === 'upload' && <UploadPage />}
    </div>
  );
}
