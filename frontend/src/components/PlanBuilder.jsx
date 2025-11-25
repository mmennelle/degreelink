/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState, useCallback } from 'react';
import api from '../services/api';
import CourseSearch from './CourseSearch';
import AddCourseToPlanModal from './AddCourseToPlanModal';
import ViewAllCoursesModal from './ViewAllCoursesModal';
import { usePlans } from '../hooks/usePlans';
import { usePrograms } from '../hooks/usePrograms';
import { usePlanProgress } from '../hooks/usePlanProgress';
import { PlanHeader } from './PlanHeader';
import { PlanList } from './PlanList';
import { PlanActions } from './PlanActions';
import { DegreeProgressCarousel } from './DegreeProgressCarousel';
import EditPlanModal from './EditPlanModal';
import EditPlanCourseModal from './EditPlanCourseModal';
import { downloadPlanAsHTML, printPlan } from '../utils/planDownload';

const PlanBuilder = ({ 
  onCreatePlan,
  onDeletePlan, 
  userMode = 'student',
  onAddToPlan,
  // IMPORTANT: do NOT default this to [] inline; a new [] each render caused the usePrograms
  // effect dependency to change identity endlessly, spamming /api/programs.
  // Leave undefined when not supplied so the hook runs once.
  programs,
  plans: externalPlans,
  selectedPlanId: externalSelectedPlanId,
  setSelectedPlanId: externalSetSelectedPlanId,
  refreshTrigger = 0
}) => {
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const [viewIndex, setViewIndex] = useState(0);
  // viewIndex controls progress filter across both bars
  const [progressTick, setProgressTick] = useState(0);

  const {
    plans,
    selectedPlanId,
    setSelectedPlanId,
    selectedPlan,
    loading,
    error,
  deletePlan: deletePlanInternal,
  reloadPlan,
  } = usePlans({
    externalPlans,
    externalSelectedPlanId,
    externalSetSelectedPlanId,
    refreshTrigger
  });

  const { programs: programsList } = usePrograms(programs);

  const VIEWS = ['All Courses', 'Planned', 'In Progress', 'Completed'];
  const { progress, progressLoading } = usePlanProgress(selectedPlanId, VIEWS[viewIndex], (refreshTrigger || 0) + progressTick);
  
  // Add course modal state
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [editCourseState, setEditCourseState] = useState({ isOpen: false, planCourse: null });
  const [overlayCloseTick, setOverlayCloseTick] = useState(0);
  const [showViewAllCourses, setShowViewAllCourses] = useState(false);

  const getProgram = useCallback((programId) => programsList.find(p => p.id === programId), [programsList]);
  const getCurrentProgram = useCallback(() => selectedPlan?.current_program || getProgram(selectedPlan?.current_program_id), [selectedPlan, getProgram]);
  const getTargetProgram = useCallback(() => selectedPlan?.target_program || getProgram(selectedPlan?.program_id), [selectedPlan, getProgram]);

  const handleDeletePlan = async (plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.plan_name}"? This action cannot be undone.`)) return;
    try {
      await deletePlanInternal(plan);
      if (selectedPlanId === plan.id) setSelectedPlanId(null);
      alert('Plan deleted successfully.');
    } catch (e) {
      console.error('Failed to delete plan:', e);
      alert(`Failed to delete plan: ${e.message}`);
    }
  };

  const handleCourseSelect = useCallback((courses) => {
    if (onAddToPlan) {
      onAddToPlan(courses);
    } else {
      const coursesArray = Array.isArray(courses) ? courses : [courses];
      const targetProgram = getTargetProgram();
      
      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: selectedPlan,
        program: targetProgram
      });
      // Close any underlying popovers/sheets
      setOverlayCloseTick(t => t + 1);
    }
  }, [onAddToPlan, selectedPlan, getTargetProgram]);

  const handleCoursesAdded = useCallback(async (courseDataArray) => {
    if (!selectedPlan) return;
    const added = [];
    for (const c of courseDataArray) {
      try { added.push(await api.addCourseToPlan(selectedPlan.id, c)); }
      catch (e) { alert(`Failed to add ${c?.course_id ?? 'course'}: ${e.message}`); }
    }
    if (added.length) {
      if (selectedPlanId) reloadPlan(selectedPlanId);
      setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
      setShowCourseSearch(false);
      // Trigger immediate progress refresh
      setProgressTick(t => t + 1);
    }
  }, [selectedPlan, selectedPlanId, reloadPlan]);

  const handleCreatePlan = () => {
    onCreatePlan?.();
  }

  const handleSavePlan = async (planId, updates) => {
    await api.updatePlan(planId, updates);
    if (selectedPlanId) await reloadPlan(selectedPlanId);
    setProgressTick(t => t + 1);
  };

  const handleEditPlanCourse = (planCourse) => {
    // Close other overlays
    setShowCourseSearch(false);
    setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
    setOverlayCloseTick(t => t + 1);
    setEditCourseState({ isOpen: true, planCourse });
  };

  const handleSavePlanCourse = async (planId, planCourseId, updates) => {
    await api.updatePlanCourse(planId, planCourseId, updates);
    if (selectedPlanId) await reloadPlan(selectedPlanId);
    setProgressTick(t => t + 1);
  };

  const handleRemovePlanCourse = async (planId, planCourseId) => {
    await api.removeCourseFromPlan(planId, planCourseId);
    if (selectedPlanId) await reloadPlan(selectedPlanId);
    setProgressTick(t => t + 1);
  };

  const handleDownloadPlan = () => {
    if (!selectedPlan) return;
    const currentProgram = getCurrentProgram();
    const targetProgram = getTargetProgram();
    downloadPlanAsHTML(selectedPlan, currentProgram, targetProgram, progress);
  };

  const handlePrintPlan = () => {
    if (!selectedPlan) return;
    const currentProgram = getCurrentProgram();
    const targetProgram = getTargetProgram();
    printPlan(selectedPlan, currentProgram, targetProgram, progress);
  };

  // Status formatting handled in PlanList now

  if (loading && plans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-[95vw] sm:w-full max-h-[80vh] overflow-y-auto transition-colors mx-auto">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="ml-3 text-gray-900 dark:text-white">Loading plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-[95vw] sm:w-full max-h-[80vh] overflow-y-auto transition-colors mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-2xl sm:text-3xl font-semibold mx-auto text-gray-900 dark:text-white">
            {selectedPlan ? (selectedPlan.plan_name || 'Untitled Plan') : 'Your Academic Plans'}
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!selectedPlan ? (
          <PlanList
            plans={plans}
            onSelect={setSelectedPlanId}
            onCreatePlan={handleCreatePlan}
            onDeletePlan={handleDeletePlan}
          />
        ) : (
          <div>
            <PlanHeader 
              selectedPlan={selectedPlan} 
              onBack={() => setSelectedPlanId(null)} 
              canEdit={true} 
              onEditPlan={() => { 
                // Close other overlays when opening plan edit
                setShowCourseSearch(false);
                setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
                setOverlayCloseTick(t => t + 1);
                setEditPlanOpen(true);
              }}
              onDownload={handleDownloadPlan}
              onPrint={handlePrintPlan}
            />
            <DegreeProgressCarousel
              selectedPlanId={selectedPlanId}
              selectedPlan={selectedPlan}
              progress={progress}
              progressLoading={progressLoading}
              getCurrentProgram={getCurrentProgram}
              getTargetProgram={getTargetProgram}
              handleCourseSelect={handleCourseSelect}
              onEditPlanCourse={handleEditPlanCourse}
              overlayCloseTick={overlayCloseTick}
              views={VIEWS}
              viewIndex={viewIndex}
              setViewIndex={setViewIndex}
            />
            <PlanActions 
              onAddCourse={() => { setOverlayCloseTick(t => t + 1); setShowCourseSearch(true); }}
              onViewAllCourses={() => setShowViewAllCourses(true)}
            />
          </div>
        )}
      </div>

      {/* Course Search Modal */}
      {showCourseSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto transition-colors">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 px-4 sm:px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Course(s) to Plan</h3>
                <button
                  onClick={() => setShowCourseSearch(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <CourseSearch 
                onCourseSelect={handleCourseSelect}
                onMultiSelect={handleCourseSelect}
                planId={selectedPlan?.id}
                onAddToPlan={handleCourseSelect}
                program={getTargetProgram()}
              />
            </div>
          </div>
        </div>
      )}

      {!onAddToPlan && (
        <AddCourseToPlanModal
          isOpen={addCourseModal.isOpen}
          onClose={() => setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null })}
          courses={addCourseModal.courses}
          plan={addCourseModal.plan}
          program={addCourseModal.program}
          onCoursesAdded={handleCoursesAdded}
        />
      )}

      {selectedPlan && (
        <EditPlanModal
          isOpen={editPlanOpen}
          onClose={() => setEditPlanOpen(false)}
          plan={selectedPlan}
          programs={programsList}
          onSave={handleSavePlan}
        />
      )}

      {selectedPlan && (
        <EditPlanCourseModal
          isOpen={editCourseState.isOpen}
          onClose={() => setEditCourseState({ isOpen: false, planCourse: null })}
          plan={selectedPlan}
          planCourse={editCourseState.planCourse}
          program={getTargetProgram()}
          onSave={handleSavePlanCourse}
          onRemove={handleRemovePlanCourse}
        />
      )}

      {/* View All Courses Modal */}
      <ViewAllCoursesModal
        isOpen={showViewAllCourses}
        onClose={() => setShowViewAllCourses(false)}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PlanBuilder;