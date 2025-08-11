// src/controllers/useAppController.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../services/api';

export default function useAppController() {
  // Onboarding / session
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const currentSession = localStorage.getItem('currentSession');
    return !currentSession;
  });

  const [activeTab, setActiveTab] = useState(() => {
    const s = localStorage.getItem('currentSession');
    return s ? JSON.parse(s).destination || 'search' : 'search';
  });

  const [userMode, setUserMode] = useState(() => {
    const s = localStorage.getItem('currentSession');
    return s ? JSON.parse(s).userMode || 'student' : 'student';
  });

  // Data & UI state previously in App.jsx
  const [isModalOpen, setIsModalOpen] = useState(false); // CreatePlan
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0);
  const [planLookupModal, setPlanLookupModal] = useState(false);
  const [addToPlanModal, setAddToPlanModal] = useState({isOpen:false, courses:[]});
  const [planCreatedModal, setPlanCreatedModal] = useState({isOpen:false, planData:null});

  const resetToOnboarding = useCallback(() => {
    localStorage.removeItem('currentSession');
    setShowOnboarding(true);
  }, []);

  const loadPlansAndPrograms = useCallback(async () => {
    try {
      const sessionStatus = await api.getSessionStatus();
      if (sessionStatus.has_access) {
        const [planData, prog] = await Promise.all([
          api.getPlan(sessionStatus.plan_id),
          api.getPrograms()
        ]);
        setPlans([planData]);
        setSelectedPlanId(planData.id);
        setPrograms(prog || []);
      } else {
        setPlans([]);
        setSelectedPlanId(null);
        const prog = await api.getPrograms();
        setPrograms(prog || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handlePlanCreated = useCallback(async (maybePlan) => {
    console.log('handlePlanCreated called with:', maybePlan); // DEBUG
    
    try {
      // The plan should already be complete from the API response
      let plan = maybePlan;
      
      console.log('Plan data received:', plan);
      
      if (plan) {
        // Update the plans list and selected plan
        setPlans([plan]);
        setSelectedPlanId(plan.id ?? null);
        
        // Close the create modal first
        setIsModalOpen(false);
        
        // Show the success modal
        console.log('Setting plan created modal to open');
        setPlanCreatedModal({ isOpen: true, planData: plan });
      } else {
        console.log('No plan data provided');
      }
    } catch (e) { 
      console.error('Error in handlePlanCreated:', e); 
    }
  }, []);

  const handleAddToPlan = useCallback(async (courses) => {
    if (!selectedPlanId) { 
      setAddToPlanModal({ isOpen: true, courses });
      return;
    }
    try {
      const updated = await api.addCourses(selectedPlanId, courses);
      setPlans([updated]);
    } catch (e) { console.error(e); }
  }, [selectedPlanId]);

  const clearPlanAccess = useCallback(async () => {
    await api.clearPlanAccess();
    setSelectedPlanId(null);
    setPlans([]);
    setActiveTab('lookup');
  }, []);

  const deleteActivePlan = useCallback(async () => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    await api.deletePlan(plan.id);
    setPlans([]);
    setSelectedPlanId(null);
    setActiveTab('lookup');
  }, [plans, selectedPlanId]);

  const handleOnboardingComplete = useCallback(async ({ destination, userMode }) => {
    localStorage.setItem('currentSession', JSON.stringify({ destination, userMode }));
    setShowOnboarding(false);
    setUserMode(userMode);
    setActiveTab(destination || 'search');
    setPlanRefreshTrigger(x => x + 1);
  }, []);

  // Load plans and programs on mount and when trigger changes
  useEffect(() => { 
    loadPlansAndPrograms(); 
  }, [loadPlansAndPrograms, planRefreshTrigger]);

  // Validate session on mount if not onboarding
  useEffect(() => {
    if (!showOnboarding) {
      (async () => {
        try {
          const s = await api.getSessionStatus();
          if (s?.has_access) {
            setSelectedPlanId(s.plan_id ?? null);
          }
        } catch {
          // Handle error silently or redirect to onboarding if needed
        }
      })();
    }
  }, [showOnboarding]);

  const tabs = useMemo(() => ([
    { id: 'search', label: 'Course Search', shortLabel: 'Search', icon: 'Search' },
    { id: 'plans',  label: 'Academic Plans', shortLabel: 'Plans', icon: 'FileText' },
    { id: 'lookup', label: 'Find Plan', shortLabel: 'Find', icon: 'Key' },
    ...(userMode === 'advisor' ? [{ id: 'upload', label: 'CSV Upload', shortLabel: 'Upload', icon: 'Users' }] : []),
  ]), [userMode]);

  const returnObject = {
    // state exposed to Views
    showOnboarding, 
    activeTab, 
    setActiveTab, 
    userMode, 
    setUserMode,
    tabs, 
    isModalOpen, 
    setIsModalOpen,
    plans, 
    selectedPlanId, 
    setSelectedPlanId, 
    programs,
    planLookupModal, 
    setPlanLookupModal,
    addToPlanModal, 
    setAddToPlanModal,
    planCreatedModal, 
    setPlanCreatedModal,

    // actions
    resetToOnboarding, 
    loadPlansAndPrograms,
    handleOnboardingComplete, 
    handlePlanCreated, 
    handleAddToPlan,
    clearPlanAccess, 
    deleteActivePlan
    };

    console.log('useAppController returning:', returnObject);
    console.log('handlePlanCreated in return object:', returnObject.handlePlanCreated);
    console.log('handlePlanCreated type:', typeof returnObject.handlePlanCreated);

    return returnObject;
}