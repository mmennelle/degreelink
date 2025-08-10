// AppController.js - Handles all business logic and state management
import { useState, useEffect } from 'react';
import api from '../services/api';

export const useAppController = () => {
  // Core app state
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const currentSession = localStorage.getItem('currentSession');
    return !currentSession;
  });
  
  const [activeTab, setActiveTab] = useState(() => {
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession) {
      const session = JSON.parse(currentSession);
      return session.destination || 'search';
    }
    return 'search';
  });
  
  const [userMode, setUserMode] = useState(() => {
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession) {
      const session = JSON.parse(currentSession);
      return session.userMode || 'student';
    }
    return 'student';
  });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planLookupModal, setPlanLookupModal] = useState(false);
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  // Data states
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0);

  // Load plans and programs - the main data loading logic
  const loadPlansAndPrograms = async () => {
    try {
      const programsRes = await api.getPrograms();
      setPrograms(programsRes.programs || []);
      
      try {
        const sessionStatus = await api.getSessionStatus();
        if (sessionStatus.has_access && sessionStatus.plan_id) {
          try {
            const planData = await api.getPlan(sessionStatus.plan_id);
            setPlans([planData]);
            setSelectedPlanId(planData.id);
          } catch (error) {
            console.log('Session expired or plan not accessible');
            setPlans([]);
            setSelectedPlanId(null);
          }
        } else {
          setPlans([]);
          setSelectedPlanId(null);
        }
      } catch (sessionError) {
        setPlans([]);
        setSelectedPlanId(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setPrograms([]);
      setPlans([]);
    }
  };

  // Handle onboarding completion
  const handleOnboardingComplete = (result) => {
    setShowOnboarding(false);
    setActiveTab(result.destination);
    setUserMode(result.userMode);
    
    if (result.showCreatePlan) {
      setTimeout(() => setIsModalOpen(true), 500);
    }
  };

  // Handle plan creation
  const handlePlanCreated = async () => {
    setIsModalOpen(false);
    
    try {
      const sessionStatus = await api.getSessionStatus();
      if (sessionStatus.has_access) {
        const planData = await api.getPlan(sessionStatus.plan_id);
        setPlans([planData]);
        setSelectedPlanId(planData.id);
        
        // Show plan code to user
        if (planData.plan_code) {
          setTimeout(() => {
            const message = `Plan created successfully!\n\nYour plan code: ${planData.plan_code}\n\nSave this code - you'll need it to access your plan later.`;
            alert(message);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to load created plan:', error);
      await loadPlansAndPrograms();
    }
  };

  // Handle plan found by code
  const handlePlanFoundByCode = (planData) => {
    setActiveTab('plans');
    setPlans([planData]);
    setSelectedPlanId(planData.id);
    setPlanLookupModal(false);
  };

  // Handle adding courses to plan
  const handleAddToPlan = async (courses) => {
    if (!selectedPlanId) {
      alert('Please select a plan first.');
      return;
    }

    try {
      const refreshedPlan = await api.getPlan(selectedPlanId);
      const refreshedProgram = programs.find(p => p.id === refreshedPlan.program_id) 
        || await api.getProgram(refreshedPlan.program_id);

      const coursesArray = Array.isArray(courses) ? courses : [courses];

      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: refreshedPlan,
        program: refreshedProgram
      });

    } catch (error) {
      console.error('Failed to load latest plan or program:', error);
      if (error.message.includes('Access denied')) {
        alert('Your session has expired. Please enter your plan code again.');
        setSelectedPlanId(null);
        setPlans([]);
        setActiveTab('lookup');
      } else {
        alert('Could not load plan data. Please try again.');
      }
    }
  };

  // Handle courses added to plan
  const handleCoursesAdded = async (courseDataArray) => {
    for (const courseData of courseDataArray) {
      await api.addCourseToPlan(selectedPlanId, courseData);
    }
    
    setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
    setPlanRefreshTrigger(prev => prev + 1);
  };

  // Reset to onboarding
  const resetToOnboarding = () => {
    localStorage.removeItem('currentSession');
    api.clearPlanAccess();
    setShowOnboarding(true);
    setActiveTab('search');
    setSelectedPlanId(null);
    setPlans([]);
  };

  // Handle plan selection changes
  const handlePlanSelection = (id) => {
    setSelectedPlanId(id);
    if (id === null) {
      loadPlansAndPrograms();
    }
  };

  // Load session state on mount
  useEffect(() => {
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession && !showOnboarding) {
      const session = JSON.parse(currentSession);
      const sessionAge = Date.now() - (session.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge < maxAge) {
        setActiveTab(session.destination || 'search');
        setUserMode(session.userMode || 'student');
      } else {
        localStorage.removeItem('currentSession');
        setShowOnboarding(true);
      }
    }
  }, [showOnboarding]);

  // Load data when not onboarding
  useEffect(() => {
    if (!showOnboarding) {
      loadPlansAndPrograms();
    }
  }, [showOnboarding]);

  // Return all state and handlers for the view
  return {
    // State
    showOnboarding,
    activeTab,
    userMode,
    isModalOpen,
    planLookupModal,
    addCourseModal,
    plans,
    selectedPlanId,
    programs,
    planRefreshTrigger,

    // Handlers
    setActiveTab,
    setIsModalOpen,
    setPlanLookupModal,
    setAddCourseModal,
    handleOnboardingComplete,
    handlePlanCreated,
    handlePlanFoundByCode,
    handleAddToPlan,
    handleCoursesAdded,
    resetToOnboarding,
    handlePlanSelection,
    loadPlansAndPrograms
  };
};