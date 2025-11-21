// src/controllers/useAppController.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from "lucide-react";
import api from '../services/api';

export default function useAppController() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Onboarding / session
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const currentSession = localStorage.getItem('currentSession');
    return !currentSession;
  });

  const [activeTab, setActiveTab] = useState(() => {
    // Get initial tab from URL path or localStorage
    const path = window.location.pathname.slice(1) || 'search';
    const validTabs = ['search', 'plans', 'lookup', 'upload', 'management', 'app-management', 'audit'];
    if (validTabs.includes(path)) return path;
    
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

  // Wrapped setActiveTab that also navigates
  const setActiveTabWithNav = useCallback((tab) => {
    setActiveTab(tab);
    navigate('/' + tab);
  }, [navigate]);

  const resetToOnboarding = useCallback(() => {
    localStorage.removeItem('currentSession');
    setShowOnboarding(true);
    navigate('/search', { replace: true });
  }, [navigate]);

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
    // Always open the modal so users can assign requirement category
    // Ensure courses is always an array
    const coursesArray = Array.isArray(courses) ? courses : [courses];
    setAddToPlanModal({ isOpen: true, courses: coursesArray });
  }, []);

  const clearPlanAccess = useCallback(async () => {
    await api.clearPlanAccess();
    setSelectedPlanId(null);
    setPlans([]);
    setActiveTab('lookup');
    navigate('/lookup');
  }, [navigate]);

  const deleteActivePlan = useCallback(async () => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    await api.deletePlan(plan.id);
    setPlans([]);
    setSelectedPlanId(null);
    setActiveTab('lookup');
    navigate('/lookup');
  }, [plans, selectedPlanId, navigate]);

  const handleOnboardingComplete = useCallback(async ({ destination, userMode }) => {
    localStorage.setItem('currentSession', JSON.stringify({ destination, userMode }));
    setShowOnboarding(false);
    setUserMode(userMode);
    const tab = destination || 'search';
    setActiveTab(tab);
    navigate('/' + tab, { replace: true });
    setPlanRefreshTrigger(x => x + 1);
  }, [navigate]);

  // Load plans and programs on mount and when trigger changes
  useEffect(() => { 
    loadPlansAndPrograms(); 
  }, [loadPlansAndPrograms, planRefreshTrigger]);

  // Sync URL changes to activeTab state (when user clicks back/forward)
  useEffect(() => {
    const path = location.pathname.slice(1) || 'search';
    if (path !== activeTab) {
      setActiveTab(path);
      // Update localStorage with current destination
      const session = localStorage.getItem('currentSession');
      if (session) {
        const parsed = JSON.parse(session);
        localStorage.setItem('currentSession', JSON.stringify({ ...parsed, destination: path }));
      }
    }
  }, [location.pathname, activeTab]);

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
    // Include upload and management tabs only for advisors and always include audit tab
    ...(userMode === 'advisor' ? [{ id: 'upload', label: 'CSV Upload', shortLabel: 'Upload', icon: 'FileText' }] : []),
    ...(userMode === 'advisor' ? [{ id: 'management', label: 'Program Management', shortLabel: 'Manage', icon: 'Settings' }] : []),
    ...(userMode === 'advisor' ? [{ id: 'app-management', label: 'App Management', shortLabel: 'App Admin', icon: 'Settings' }] : []),
    ...(userMode === 'advisor' ? [{ id: 'audit', label: 'Degree Audit', shortLabel: 'Audit', icon: 'Shield' }] : [])
    //{ id: 'audit', label: 'Degree Audit', shortLabel: 'Audit', icon: 'Shield' }
  ]), [userMode]);

  // Make sure your return object in useAppController includes:
const returnObject = {
  // existing state
  showOnboarding, 
  activeTab, 
  setActiveTab: setActiveTabWithNav, 
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