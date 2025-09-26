import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { BookOpen, Plus, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import api from '../services/api';
import CourseSearch from './CourseSearch';
import VerticalProgressWithBubbles from './VerticalProgressWithBubbles';
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
  const [progress, setProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
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

  // ======= Synchronized status carousel (drives both bars together) =======
  const VIEWS = ['All Courses', 'Planned', 'In Progress', 'Completed'];
  const [viewIndex, setViewIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragX, setDragX] = useState(0);
  const frameRef = useRef(null);

  // Simple mobile detector
  const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(
      typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
    );
    useEffect(() => {
      if (typeof window === 'undefined') return;
      const mq = window.matchMedia('(max-width: 640px)');
      const handler = e => setIsMobile(e.matches);
      mq.addEventListener?.('change', handler);
      mq.addListener?.(handler);
      return () => {
        mq.removeEventListener?.('change', handler);
        mq.removeListener?.(handler);
      };
    }, []);
    return isMobile;
  };
  
  const isMobile = useIsMobile();

  // Use external programs if provided, otherwise use internal
  const programsList = programs.length > 0 ? programs : internalPrograms;

  // Get program by ID
  const getProgram = useCallback((programId) => {
    if (!programId) return null;
    return programsList.find(p => p.id === programId);
  }, [programsList]);

  // Get the current and target programs
    const getCurrentProgram = useCallback(() => {
      // Prefer the program the backend sends in selectedPlan.current_program
      return selectedPlan?.current_program || getProgram(selectedPlan?.current_program_id);
    }, [selectedPlan, getProgram]);

    const getTargetProgram = useCallback(() => {
      // Prefer selectedPlan.target_program too
      return selectedPlan?.target_program || getProgram(selectedPlan?.program_id);
    }, [selectedPlan, getProgram]);


  // Get institution names for progress bars
  const getInstitutionNames = useCallback(() => {
    const currentProgram = getCurrentProgram();
    const targetProgram = getTargetProgram();

    console.log('Current program:', currentProgram);
    console.log('Target program:', targetProgram);
    console.log('Selected plan:', selectedPlan);
    
    return {
      currentInstitution: currentProgram?.institution || 'Current Program',
      transferInstitution: targetProgram?.institution || 'Transfer Program',
    };
  }, [getCurrentProgram, getTargetProgram]);

  // Build the 4 slides: each slide holds both bars (Current + Transfer) with proper filtering
  const slides = useMemo(() => {
    if (!progress || !selectedPlan) return [];

    const { currentInstitution, transferInstitution } = getInstitutionNames();

    return VIEWS.map(viewName => {
      // Get progress data for current view filter
      const currentData = progress.current || { percent: 0, requirements: [] };
      const transferData = progress.transfer || { percent: 0, requirements: [] };

      return {
        name: viewName,
        current: {
          requirements: currentData.requirements || [],
          percent: currentData.percent || 0,
          institution: currentInstitution,
        },
        transfer: {
          requirements: transferData.requirements || [],
          percent: transferData.percent || 0,
          institution: transferInstitution,
        },
      };
    });
  }, [progress, selectedPlan, getInstitutionNames]);

  const go = useCallback((dirOrIndex) => {
    setViewIndex((i) => {
      if (typeof dirOrIndex === 'number') return Math.max(0, Math.min(dirOrIndex, VIEWS.length - 1));
      const n = VIEWS.length;
      return (i + (dirOrIndex === 'next' ? 1 : -1) + n) % n;
    });
  }, []);

  // Mobile swipe for the whole two-bar frame
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    let startX = 0, startY = 0, dx = 0, dy = 0, tracking = false;

    const onStart = (e) => {
      if (!isMobile) return;
      const t = e.touches?.[0];
      if (!t) return;
      startX = t.clientX; startY = t.clientY; dx = 0; dy = 0;
      tracking = true; setDragging(true); setDragX(0);
    };
    const onMove = (e) => {
      if (!tracking) return;
      const t = e.touches?.[0]; if (!t) return;
      dx = t.clientX - startX; dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) * 1.3) setDragX(dx);
    };
    const onEnd = () => {
      if (!tracking) return;
      tracking = false;
      const width = el.clientWidth || 1;
      const threshold = width * 0.25;
      setDragging(false); setDragX(0);
      if (dx < -threshold) go('next');
      else if (dx > threshold) go('prev');
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove',  onMove,  { passive: true });
    el.addEventListener('touchend',   onEnd);

    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove',  onMove);
      el.removeEventListener('touchend',   onEnd);
    };
  }, [isMobile, go]);

  // Slide track transform (animate unless dragging)
  const trackStyle = (() => {
    const basePct = -(viewIndex * 100);
    const width = frameRef.current ? frameRef.current.clientWidth || 1 : 1;
    const dragPct = dragging ? (dragX / width) * 100 : 0;
    const tx = basePct + dragPct;
    return {
      transform: `translateX(${tx}%)`,
      transition: dragging ? 'none' : 'transform 300ms ease',
      willChange: 'transform',
    };
  })();

  // ======= COMPONENT LIFECYCLE =======

  useEffect(() => {
    if (externalPlans === undefined) {
      loadPlans();
    }
    if (programs.length === 0) {
      loadPrograms();
    }
  }, []);

useEffect(() => {
  let alive = true;
  async function loadProgress() {
    if (!selectedPlanId) { 
      setProgress(null); 
      return; 
    }
    
    setProgressLoading(true);
    try {
      // Get progress with current view filter
      const currentView = VIEWS[viewIndex];
      
      const progressData = await api.getPlanProgress(selectedPlanId, currentView);
      
      if (alive) {
        //  Ensure we have the expected structure
        setProgress({
          current: progressData.current || { percent: 0, requirements: [] },
          transfer: progressData.transfer || { percent: 0, requirements: [] }
        });
        
        //  Debug logging to see what we're getting
        console.log('Progress loaded for view:', currentView, progressData);
      }

    } catch (e) {
      console.error('Progress loading failed:', e);
      if (alive) {
        setProgress({
          current: { percent: 0, requirements: [] },
          transfer: { percent: 0, requirements: [] },
        });
      }
    } finally {
      if (alive) setProgressLoading(false);
    }
  }
  
  loadProgress();
  return () => { alive = false; };
}, [selectedPlanId, selectedPlan, viewIndex, refreshTrigger]); //  Add refreshTrigger dependency

  useEffect(() => {
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
        setInternalPlans([]);
        setInternalSelectedPlanId(null);
      }
    } catch (error) {
      console.error('Failed to check session status:', error);
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
      
      if (externalPlans && externalSetSelectedPlanId) {
        if (selectedPlanId === plan.id) {
          externalSetSelectedPlanId(null);
        }
      } else {
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
    }
  }, [onAddToPlan, selectedPlan, getTargetProgram]);

  const handleCoursesAdded = useCallback(async (courseDataArray) => {
    if (!selectedPlan) return;
    
    const addedCourses = [];
    for (const courseData of courseDataArray) {
      try {
        const result = await api.addCourseToPlan(selectedPlan.id, courseData);
        addedCourses.push(result);
      } catch (e) {
        console.error('addCourseToPlan failed:', e);
        alert(`Failed to add ${courseData?.course_id ?? 'course'}: ${e.message}`);
      }
    }
    
    if (addedCourses.length > 0) {
      await loadPlanDetails(selectedPlan.id);
      setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
      setShowCourseSearch(false);
      console.log(`Successfully added ${addedCourses.length} ${addedCourses.length === 1 ? 'course' : 'courses'} to your plan`);
    }
  }, [selectedPlan, loadPlanDetails]);

  const handleCreatePlan = () => {
    onCreatePlan?.();
  }

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

            {/* Enhanced Degree Progress with Carousel */}
            <div className="mt-4 px-2 sm:px-3 lg:px-4 py-3 sm:py-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-800/60 w-full max-w-full overflow-x-hidden">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Degree Progress</h2>
                {progressLoading && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">Loading…</span>
                )}
              </div>

              {!selectedPlanId ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Create or select a plan to see progress.
                </div>
              ) : !progress ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No progress data available.
                </div>
              ) : (
                // Synchronized two-bar carousel with proper institution mapping
                <div className="flex flex-col items-center gap-2">
                  {/* Header controls */}
                  <div className="flex items-center gap-2">
                    {!isMobile && (
                      <button
                        onClick={() => go('prev')}
                        aria-label="Previous view"
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <ChevronLeft size={18}/>
                      </button>
                    )}
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      {VIEWS[viewIndex]}
                    </div>
                    {!isMobile && (
                      <button
                        onClick={() => go('next')}
                        aria-label="Next view"
                        className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                      >
                        <ChevronRight size={18}/>
                      </button>
                    )}
                  </div>

                  {/* Frame */}
                  <div ref={frameRef} className="relative w-full">
                    <div className="overflow-hidden">
                      {/* Track */}
                      <div className="flex" style={trackStyle}>
                        {slides.map((slide) => (
                          <div key={slide.name} className="basis-full shrink-0">
                            <div className="flex items-start justify-center gap-3 sm:gap-6 lg:gap-8 w-full max-w-full px-1 sm:px-0">
                              <VerticalProgressWithBubbles
                                
                                title={slide.current.institution}
                                percent={slide.current.percent}
                                requirements={slide.current.requirements}
                                color="blue"
                                program={getCurrentProgram()}
                                plan={selectedPlan}
                                onAddCourse={handleCourseSelect}
                                currentView={VIEWS[viewIndex]}
                              />
                              <VerticalProgressWithBubbles
                                
                                title={slide.transfer.institution}
                                percent={slide.transfer.percent}
                                requirements={slide.transfer.requirements}
                                color="violet"
                                program={getTargetProgram()}
                                plan={selectedPlan}
                                onAddCourse={handleCourseSelect}
                                currentView={VIEWS[viewIndex]}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex items-center gap-1">
                    {VIEWS.map((v, i) => (
                      <button
                        key={v}
                        aria-label={`Go to ${v}`}
                        onClick={() => setViewIndex(i)}
                        className={`h-1.5 rounded-full transition-all ${i === viewIndex ? 'w-4 bg-gray-700 dark:bg-gray-200' : 'w-2 bg-gray-300 dark:bg-gray-600'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
              <button
                onClick={() => setShowCourseSearch(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-green-800 dark:hover:bg-green-800 flex items-center justify-center transition-colors text-sm"
              >
                <Plus className="mr-1" size={16} />
                Add Course
              </button>
            </div>
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
    </div>
  );
};

export default PlanBuilder;