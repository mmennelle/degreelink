// src/controllers/useAppController.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import { Check } from "lucide-react";
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
          // Advisors should see all program versions; students get only current requirements
          api.getPrograms({ include_all: userMode === 'advisor' })
        ]);
        setPlans([planData]);
        setSelectedPlanId(planData.id);
        setPrograms(prog || []);
      } else {
        setPlans([]);
        setSelectedPlanId(null);
        const prog = await api.getPrograms({ include_all: userMode === 'advisor' });
        setPrograms(prog || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userMode]);



    const handlePlanCreated = async (newPlan) => {
      setIsModalOpen(false);

      if (newPlan) {
        setPlans([newPlan]);
        setSelectedPlanId(newPlan.id);
        // open copy-code modal immediately if available
        if (newPlan.plan_code) {
          setPlanCreatedModal({ isOpen: true, planData: newPlan });
        }
        return;
      }

      // fallback: existing session-based reload
      try {
        const sessionStatus = await api.getSessionStatus();
        if (sessionStatus.has_access) {
          const planData = await api.getPlan(sessionStatus.plan_id);
          setPlans([planData]);
          setSelectedPlanId(planData.id);
          if (planData.plan_code) {
            setPlanCreatedModal({ isOpen: true, planData: planData });
          }
        } else {
          await loadPlansAndPrograms();
        }
      } catch (e) {
        console.error('Failed to load created plan:', e);
        await loadPlansAndPrograms();
      }
    };



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

  //const Check = () =>{ return <Check />};
  const tabs = useMemo(() => ([
    { id: 'search', label: 'Course Search', shortLabel: 'Search', icon: 'Search' },
    { id: 'plans',  label: 'Academic Plans', shortLabel: 'Plans', icon: 'FileText' },
    { id: 'lookup', label: 'Find Plan', shortLabel: 'Find', icon: 'Key' },
    // Include upload tab only for advisors and always include audit tab
    ...(userMode === 'advisor' ? [{ id: 'upload', label: 'CSV Upload', shortLabel: 'Upload', icon: 'Users' }] : []),
    ...(userMode === 'advisor' ? [{ id: 'audit', label: 'Degree Audit', shortLabel: 'Audit', icon: 'Shield' }] : [])
    //{ id: 'audit', label: 'Degree Audit', shortLabel: 'Audit', icon: 'Shield' }
  ]), [userMode]);

  // Make sure your return object in useAppController includes:
const returnObject = {
  // existing state
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
  
  // ADD THIS LINE if it's missing:
  //pendingCreatedPlan, // <- Make sure this is here

  // actions
  resetToOnboarding, 
  loadPlansAndPrograms,
  handleOnboardingComplete, 
  handlePlanCreated, 
  handleAddToPlan,
  clearPlanAccess, 
  deleteActivePlan
};

console.log('RETURN: useAppController returning:', returnObject);
console.log('RETURN: handlePlanCreated in return object:', returnObject.handlePlanCreated);
console.log('RETURN: planCreatedModal in return object:', returnObject.planCreatedModal);

return returnObject;
}