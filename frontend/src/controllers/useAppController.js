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

  useEffect(() => { loadPlansAndPrograms(); }, [loadPlansAndPrograms, planRefreshTrigger]);

  useEffect(() => {
    // validate/refresh session on mount if not onboarding
    if (!showOnboarding) {
      (async () => {
        try {
          const s = await api.getSessionStatus();
          if (s?.has_access) {
          setSelectedPlanId(s.plan_id ?? null);
        }
        } catch {
         // localStorage.removeItem('currentSession');
         // setShowOnboarding(true);
        }
      })();
    }
  }, [showOnboarding]);

  const handleOnboardingComplete = useCallback(async ({ destination, userMode }) => {
    // whatever you already do in MobileOnboarding
  localStorage.setItem('currentSession', JSON.stringify({ destination, userMode }));
    setShowOnboarding(false);           // hide onboarding immediately
    setUserMode(userMode);
    setActiveTab(destination || 'search');
    setPlanRefreshTrigger(x => x + 1);
  }, []);

  const handlePlanCreated = useCallback(async () => {
    setIsModalOpen(false);
    try {
      const s = await api.getSessionStatus();
      if (s.has_access) {
        const planData = await api.getPlan(s.plan_id);
        setPlans([planData]);
        setSelectedPlanId(planData.id);
        if (planData.plan_code) {
          setPlanCreatedModal({ isOpen: true, planData });
        }
      }
    } catch (e) { console.error(e); }
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

  const tabs = useMemo(() => ([
    { id: 'search', label: 'Course Search', shortLabel: 'Search', icon: 'Search' },
    { id: 'plans',  label: 'Academic Plans', shortLabel: 'Plans', icon: 'FileText' },
    { id: 'lookup', label: 'Find Plan', shortLabel: 'Find', icon: 'Key' },
    ...(userMode === 'advisor' ? [{ id: 'upload', label: 'CSV Upload', shortLabel: 'Upload', icon: 'Users' }] : []),
  ]), [userMode]);

  return {
    // state exposed to Views
    showOnboarding, activeTab, setActiveTab, userMode, setUserMode,
    tabs, isModalOpen, setIsModalOpen,
    plans, selectedPlanId, setSelectedPlanId, programs,
    planLookupModal, setPlanLookupModal,
    addToPlanModal, setAddToPlanModal,
    planCreatedModal, setPlanCreatedModal,

    // actions
    resetToOnboarding, loadPlansAndPrograms,
    handleOnboardingComplete, handlePlanCreated, handleAddToPlan,
    clearPlanAccess, deleteActivePlan
  };
}
