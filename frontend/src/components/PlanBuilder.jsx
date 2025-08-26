import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import api from '../services/api';
import CourseSearch from './CourseSearch';
// Remove the old ProgressTracker for this simplified mobile design
// import ProgressTracker from './ProgressTracker';
import AddCourseToPlanModal from './AddCourseToPlanModal';

const PlanBuilder = ({ 
  onCreatePlan,
  onDeletePlan, 
  userMode = 'student',
  onAddToPlan,
  programs = [],
  plans: externalPlans,
  selectedPlanId: externalSelectedPlanId,
  setSelectedPlanId: externalSetSelectedPlanId,
  refreshTrigger = 0
}) => {
  // Use external state if provided, otherwise use internal state
  const [internalPlans, setInternalPlans] = useState([]);
  const [internalSelectedPlanId, setInternalSelectedPlanId] = useState(null);
  
  const plans = externalPlans !== undefined ? externalPlans : internalPlans;
  const selectedPlanId = externalSelectedPlanId !== undefined ? externalSelectedPlanId : internalSelectedPlanId;
  const setSelectedPlanId = externalSetSelectedPlanId || setInternalSelectedPlanId;
  
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const [internalPrograms, setInternalPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Add course modal state
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  // Override for the user's current institution. If null, it will be detected automatically.
  const [currentInstitutionOverride, setCurrentInstitutionOverride] = useState(null);

  // Toggle display of the courses list in the plan detail view.
  const [showCourses, setShowCourses] = useState(false);

  // Use external programs if provided, otherwise use internal
  const programsList = programs.length > 0 ? programs : internalPrograms;

  useEffect(() => {
    if (externalPlans === undefined) {
      loadPlans();
    }
    if (programs.length === 0) {
      loadPrograms();
    }
  }, []); // Empty dependency array for initial load only

  useEffect(() => {
    // When selectedPlanId changes or refreshTrigger updates, load the plan details
    if (selectedPlanId && plans.length > 0) {
      const plan = plans.find(p => p.id === selectedPlanId);
      if (plan) {
        loadPlanDetails(selectedPlanId);
      }
    } else {
      setSelectedPlan(null);
    }
  }, [selectedPlanId, plans, refreshTrigger]);

  const loadPrograms = async () => {
    try {
      const response = await api.getPrograms();
      setInternalPrograms(response.programs || []);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const loadPlans = async () => {
  setLoading(true);
  setError(null);
  
  try {
    // With the new security model, we can't browse all plans
    // Plans are only accessible via session after using a plan code
    const sessionStatus = await api.getSessionStatus();
    
    if (sessionStatus.has_access && sessionStatus.plan_id) {
      try {
        const planData = await api.getPlan(sessionStatus.plan_id);
        setInternalPlans([planData]);
        if (!internalSelectedPlanId) {
          setInternalSelectedPlanId(planData.id);
        }
      } catch (error) {
        console.log('Session expired or plan not accessible');
        setInternalPlans([]);
        setInternalSelectedPlanId(null);
      }
    } else {
      // No session access - user needs to enter a plan code
      setInternalPlans([]);
      setInternalSelectedPlanId(null);
    }
  } catch (error) {
    console.error('Failed to check session status:', error);
    // If session checking fails, assume no access
    setInternalPlans([]);
    setInternalSelectedPlanId(null);
    setError('Unable to access plans. Use a plan code to access your plan.');
  } finally {
    setLoading(false);
  }
};

  const loadPlanDetails = async (planId) => {
    setLoading(true);
    setError(null);
    
    try {
      const planData = await api.getPlan(planId);
      setSelectedPlan(planData);
    } catch (error) {
      console.error('Failed to load plan details:', error);
      setError('Failed to load plan details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!confirm(`Are you sure you want to delete "${plan.plan_name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await api.deletePlan(plan.id);
      
      // Update plans list
      if (externalPlans && externalSetSelectedPlanId) {
        // If using external state, clear selection and let parent refresh
        if (selectedPlanId === plan.id) {
          externalSetSelectedPlanId(null);
        }
        // Parent will handle refreshing the plans list
      } else {
        // Update internal state
        setInternalPlans(prevPlans => prevPlans.filter(p => p.id !== plan.id));
        if (internalSelectedPlanId === plan.id) {
          setInternalSelectedPlanId(null);
          setSelectedPlan(null);
        }
      }
      
      alert('Plan deleted successfully.');
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert(`Failed to delete plan: ${error.message}`);
    }
  };

  const handleCourseSelect = (courses) => {
    // Use external handler if provided, otherwise use internal modal
    if (onAddToPlan) {
      onAddToPlan(courses);
    } else {
      const coursesArray = Array.isArray(courses) ? courses : [courses];
      const program = programsList.find(p => p.id === selectedPlan?.program_id);
      
      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: selectedPlan,
        program: program
      });
    }
  };

  const handleCoursesAdded = async (courseDataArray) => {
    if (!selectedPlan) return;
    
    for (const courseData of courseDataArray) {
      await api.addCourseToPlan(selectedPlan.id, courseData);
    }
    
    // Refresh plan details
    await loadPlanDetails(selectedPlan.id);
    setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
    setShowCourseSearch(false);
  };

  const handleCreatePlan = () => {
    
      onCreatePlan?.();
    
      // Use the internal modal
      
    }
  

  const updateCourseStatus = async (planCourseId, newStatus) => {
    if (!selectedPlan) return;
    
    try {
      await api.updatePlanCourse(selectedPlan.id, planCourseId, {
        status: newStatus
      });
      
      // Refresh plan details
      await loadPlanDetails(selectedPlan.id);
    } catch (error) {
      console.error('Failed to update course status:', error);
      alert(`Failed to update course status: ${error.message}`);
    }
  };

  const updateCourseRequirement = async (planCourseId, newRequirement) => {
    if (!selectedPlan) return;
    
    try {
      await api.updatePlanCourse(selectedPlan.id, planCourseId, {
        requirement_category: newRequirement
      });
      
      // Refresh plan details
      await loadPlanDetails(selectedPlan.id);
    } catch (error) {
      console.error('Failed to update course requirement:', error);
      alert(`Failed to update course requirement: ${error.message}`);
    }
  };

  const removeCourseFromPlan = async (planCourseId) => {
    if (!selectedPlan || !confirm('Are you sure you want to remove this course from the plan?')) return;
    
    try {
      await api.removeCourseFromPlan(selectedPlan.id, planCourseId);
      await loadPlanDetails(selectedPlan.id);
    } catch (error) {
      console.error('Failed to remove course:', error);
      alert(`Failed to remove course: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'planned':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const groupCoursesByRequirement = (courses) => {
    const grouped = {};
    courses.forEach(course => {
      const category = course.requirement_category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
    });
    return grouped;
  };

  const getProgram = () => {
    if (!selectedPlan) return null;
    return programsList.find(p => p.id === selectedPlan.program_id);
  };

  // Determine progress percentages for the current program and transfer program.
  // "Current" progress counts credits from the student's home institution only.
  // "Transfer" progress counts credits from the target institution and any courses with an equivalency to the target.
  const getVerticalProgressData = (plan) => {
    if (!plan || !plan.progress || !plan.courses) return { current: 0, transfer: 0 };
    const progress = plan.progress;
    const totalRequired = progress.total_credits_required || 0;
    if (totalRequired <= 0) return { current: 0, transfer: 0 };
    // Identify the target institution from the selected program
    const targetInstitution = getProgram()?.institution;
    // Build a set of course codes that have transfer equivalencies to the target institution
    const eqToTarget = new Set();
    if (progress.transfer_analysis && progress.transfer_analysis.transfer_courses) {
      progress.transfer_analysis.transfer_courses.forEach(eq => {
        if (eq.to_institution === targetInstitution) {
          // eq.from_course contains the course code of the original course
          eqToTarget.add(eq.from_course);
        }
      });
    }
    // Sum credits by institution for completed courses
    const completedCourses = plan.courses.filter(pc => pc.status === 'completed');
    const creditsByInstitution = {};
    completedCourses.forEach(pc => {
      const inst = pc.course?.institution;
      const credits = pc.credits || (pc.course?.credits ?? 0);
      if (!inst) return;
      creditsByInstitution[inst] = (creditsByInstitution[inst] || 0) + credits;
    });
    // Determine the current (home) institution.
    // If the user provided an override, use it; otherwise, use the non-target with the most credits.
    let currentInstitution = currentInstitutionOverride || null;
    if (!currentInstitution) {
      let maxCredits = 0;
      Object.entries(creditsByInstitution).forEach(([inst, creds]) => {
        if (inst !== targetInstitution && creds > maxCredits) {
          currentInstitution = inst;
          maxCredits = creds;
        }
      });
    }
    let currentCredits = 0;
    let transferCredits = 0;
    // Distribute credits: courses at current institution always count toward current; courses at target count toward transfer;
    // courses with equivalency to target count toward transfer in addition to current if applicable.
    completedCourses.forEach(pc => {
      const inst = pc.course?.institution;
      const code = pc.course?.code;
      const credits = pc.credits || (pc.course?.credits ?? 0);
      if (!inst || credits <= 0) return;
      if (inst === targetInstitution) {
        // Course is from the target institution; counts only toward transfer
        transferCredits += credits;
      } else {
        // Course is from another institution
        if (inst === currentInstitution) {
          // Count toward current progress
          currentCredits += credits;
        }
        // If there is an equivalency to the target institution, also count toward transfer
        if (eqToTarget.has(code)) {
          transferCredits += credits;
        }
      }
    });
    const currentPercentage = Math.min((currentCredits / totalRequired) * 100, 100);
    const transferPercentage = Math.min((transferCredits / totalRequired) * 100, 100);
    return { current: currentPercentage, transfer: transferPercentage };
  };

  // Utility to select a gradient based on completion percentage (similar to ProgressTracker)
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'from-green-500 to-emerald-500';
    if (percentage >= 75) return 'from-blue-500 to-green-500';
    if (percentage >= 50) return 'from-yellow-500 to-blue-500';
    if (percentage >= 25) return 'from-orange-500 to-yellow-500';
    return 'from-red-500 to-orange-500';
  };

  // Component for a vertical progress bar that fills from the bottom up. Sized larger for easier mobile viewing.
  const VerticalProgressBar = ({ percentage, label }) => {
    const colorClass = getProgressColor(percentage);
    // Clamp percentage between 0 and 100 for styling
    const clamped = Math.max(0, Math.min(percentage, 100));
    return (
      <div className="flex flex-col items-center">
        <div className="relative h-64 w-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <div
            className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${colorClass}`}
            style={{ height: `${clamped}%` }}
          />
        </div>
        <div className="mt-2 text-center">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {label}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{clamped.toFixed(1)}%</p>
        </div>
      </div>
    );
  };

  // Debug early return conditions
  if (loading && plans.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="ml-3 text-gray-900 dark:text-white">Loading plans...</span>
        </div>
      </div>
    );
  }

  // Always render something
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Main Plan Builder */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <h2 className="text-2xl sm:text-3xl font-semibold mx-auto text-gray-900 dark:text-white">
            Academic Plans
          </h2>


          
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Always show something in the content area */}
        {!selectedPlan ? (
          /* Plans List View */
          <div className="space-y-3">
            {(!plans || plans.length === 0) ? (
              <div className="text-center py-8 sm:py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Plans Found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first academic plan to get started!</p>
                <button
                  onClick={handleCreatePlan}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 flex items-center justify-center mx-auto transition-colors"
                >
                  <Plus className="mr-1" size={16} />
                  Create Plan
                </button>
              </div>
            ) : (
              plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="border border-gray-200 dark:border-gray-600 rounded-md p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                  onClick={() => setSelectedPlanId(plan.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-600 dark:text-blue-400 mb-1">{plan.plan_name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{plan.student_name}</p>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded ${getStatusColor(plan.status)}`}>
                          {formatStatus(plan.status)}
                        </span>
                        <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
                        {plan.courses && (
                          <span>{plan.courses.length} courses</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlan(plan);
                        }}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete plan"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <ChevronRight className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={20} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Plan Details View */
          <div>
            {/* Top row: back button and copyable plan code */}
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setSelectedPlanId(null)}
                className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                <ChevronLeft className="mr-1" size={16} />
                Back to Plans
              </button>
              {selectedPlan.plan_code && (
                <button
                  onClick={() => {
                    if (navigator && navigator.clipboard) {
                      navigator.clipboard.writeText(selectedPlan.plan_code).then(() => {
                        alert('Plan code copied to clipboard');
                      }).catch(() => {
                        alert('Failed to copy plan code');
                      });
                    }
                  }}
                  className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Click to copy plan code"
                >
                  {selectedPlan.plan_code}
                </button>
              )}
            </div>
            {/* Basic information and current institution selector */}
            <div className="mb-4 space-y-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {selectedPlan.plan_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {selectedPlan.student_name}
                </p>
              </div>
              {/* Current institution selection */}
              {(() => {
                // Build list of unique institutions from the plan's courses, excluding the target (it may still be selectable if user wants)
                const courseInstitutions = Array.from(new Set((selectedPlan.courses || []).map(pc => pc.course?.institution).filter(Boolean)));
                if (courseInstitutions.length === 0) return null
              })()}
            </div>
            {/* Centered vertical progress bars */}
            <div className="flex justify-center gap-12 my-6">
              {(() => {
                const { current, transfer } = getVerticalProgressData(selectedPlan);
                return (
                  <>
                    <VerticalProgressBar percentage={current} label="Current Progress" />
                    <VerticalProgressBar percentage={transfer} label="Transfer Progress" />
                  </>
                );
              })()}
            </div>
            {/* Plan control buttons below progress bars */}
            <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
              <button
                onClick={() => setShowCourseSearch(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-green-800 dark:hover:bg-green-800 flex items-center justify-center transition-colors text-sm"
              >
                <Plus className="mr-1" size={16} />
                Add Course
              </button>
              <button
                onClick={() => setShowCourses(prev => !prev)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white dark:text-gray-200 rounded-md hover:bg-green-800 dark:hover:bg-green-800 flex items-center justify-center transition-colors text-sm"
              >
                {showCourses ? 'Hide Courses' : 'View Courses'}
              </button>
            </div>
            {/* Conditionally render courses list when requested */}
            {showCourses && (
              <CoursesByRequirementCollapsible
                selectedPlan={selectedPlan}
                groupCoursesByRequirement={groupCoursesByRequirement}
                updateCourseStatus={updateCourseStatus}
                updateCourseRequirement={updateCourseRequirement}
                removeCourseFromPlan={removeCourseFromPlan}
                getStatusColor={getStatusColor}
                getProgram={getProgram}
                setShowCourseSearch={setShowCourseSearch}
              />
            )}
          </div>
        )}
      </div>

      {/* Remove ProgressTracker from main view since vertical bars replace it */}
      {/* selectedPlan && <ProgressTracker plan={selectedPlan} /> */}

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
                program={getProgram()}
              />
            </div>
          </div>
        </div>
      )}

      
      
      {/* Internal Add Course Modal - only show if external handler not provided */}
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
    </div>
  );
};


export default PlanBuilder;

// Collapsible Courses by Requirement Section
function CoursesByRequirementCollapsible({
  selectedPlan,
  groupCoursesByRequirement,
  updateCourseStatus,
  updateCourseRequirement,
  removeCourseFromPlan,
  getStatusColor,
  getProgram,
  setShowCourseSearch
}) {
  // Per-category open/close
  const [openCategories, setOpenCategories] = React.useState(() => {
    if (!selectedPlan?.courses) return {};
    const grouped = groupCoursesByRequirement(selectedPlan.courses);
    const open = {};
    Object.keys(grouped).forEach(cat => { open[cat] = true; });
    return open;
  });

  // Collapse/expand all categories
  const allOpen = Object.values(openCategories).every(Boolean);
  const allClosed = Object.values(openCategories).every(v => !v);
  const toggleAll = () => {
    setOpenCategories(prev => {
      const next = { ...prev };
      const shouldOpen = !allOpen;
      Object.keys(next).forEach(cat => { next[cat] = shouldOpen; });
      return next;
    });
  };

  React.useEffect(() => {
    if (!selectedPlan?.courses) return;
    const grouped = groupCoursesByRequirement(selectedPlan.courses);
    setOpenCategories(prev => {
      const next = { ...prev };
      Object.keys(grouped).forEach(cat => {
        if (!(cat in next)) next[cat] = true;
      });
      Object.keys(next).forEach(cat => {
        if (!(cat in grouped)) delete next[cat];
      });
      return next;
    });
  }, [selectedPlan?.courses]);

  if (selectedPlan.courses && selectedPlan.courses.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 bg-gray-50 dark:bg-gray-700 rounded-md">
        <p className="text-gray-500 dark:text-gray-400 mb-3">No courses added yet.</p>
        <button
          onClick={() => setShowCourseSearch(true)}
          className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 text-sm transition-colors"
        >
          Add Your First Course
        </button>
      </div>
    );
  }

  const grouped = groupCoursesByRequirement(selectedPlan.courses || []);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div
        className="flex items-center gap-2 cursor-pointer select-none mb-2"
        onClick={toggleAll}
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') toggleAll();
        }}
        aria-expanded={allOpen}
      >
        <span className={`transition-transform text-gray-600 dark:text-gray-400 ${allOpen ? 'rotate-90' : ''}`}>▶</span>
        <h4 className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
          <Target className="mr-2" size={18} />
          Courses by Requirement
        </h4>
      </div>
      <div className="space-y-3 sm:space-y-4">
        {Object.entries(grouped).map(([category, courses]) => {
          // Determine if more courses/credits are needed for this category
          let needsMore = false;
          const req = getProgram()?.requirements?.find(r => r.category === category);
          if (req) {
            const totalCredits = courses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0);
            if ((req.credits && totalCredits < req.credits) || (req.courses && courses.length < req.courses)) {
              needsMore = true;
            }
          }
          return (
            <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg transition-colors">
              <div
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-3 sm:px-4 py-3 cursor-pointer select-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-t-lg transition-colors gap-2 sm:gap-0"
                onClick={() => setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }))}
                aria-expanded={openCategories[category]}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setOpenCategories(prev => ({ ...prev, [category]: !prev[category] }));
                  }
                }}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className={`transition-transform text-gray-600 dark:text-gray-400 ${openCategories[category] ? 'rotate-90' : ''}`}>▶</span>
                  <h5 className="font-medium text-gray-800 dark:text-gray-200">{category}</h5>
                  {needsMore && (
                    <button
                      className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 focus:outline-none transition-colors"
                      title={`Add more courses to ${category}`}
                      onClick={e => {
                        e.stopPropagation();
                        setShowCourseSearch(true);
                        // Optionally, you could set a filter state here for the course search modal
                        // e.g. setCourseSearchFilter(category)
                      }}
                    >
                      + Add
                    </button>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {courses.length} course{courses.length !== 1 ? 's' : ''} • {' '}
                  {courses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0)} credits
                </span>
              </div>
              {openCategories[category] && (
                <div className="space-y-2 p-3 sm:p-4 pt-2">
                  {courses.map((planCourse) => (
                    <div key={planCourse.id} className="bg-gray-50 dark:bg-gray-600 rounded-md p-3 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-3 lg:gap-4">
                        <div className="flex-1">
                          <h6 className="font-medium text-gray-900 dark:text-white mb-1">
                            {planCourse.course.code}: {planCourse.course.title}
                          </h6>
                          <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                            <span>🏫 {planCourse.course.institution}</span>
                            <span>📚 {planCourse.credits || planCourse.course.credits} credits</span>
                            {planCourse.semester && planCourse.year && (
                              <span>📅 {planCourse.semester} {planCourse.year}</span>
                            )}
                            {planCourse.grade && (
                              <span>🎯 Grade: {planCourse.grade}</span>
                            )}
                          </div>
                          {planCourse.notes && (
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">📝 {planCourse.notes}</p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                          <select
                            value={planCourse.status}
                            onChange={(e) => updateCourseStatus(planCourse.id, e.target.value)}
                            className={`px-2 py-1 text-xs rounded border ${getStatusColor(planCourse.status)} bg-white dark:bg-gray-700`}
                          >
                            <option value="planned">Planned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          <select
                            value={planCourse.requirement_category || ''}
                            onChange={(e) => updateCourseRequirement(planCourse.id, e.target.value)}
                            className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {getProgram()?.requirements?.map(req => (
                              <option key={req.category} value={req.category}>{req.category}</option>
                            ))}
                            <option value="Free Elective">Free Elective</option>
                          </select>
                          <button
                            onClick={() => removeCourseFromPlan(planCourse.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-xs sm:text-sm px-2 py-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}