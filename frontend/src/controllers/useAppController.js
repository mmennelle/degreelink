/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

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
    const validTabs = ['search', 'plans', 'lookup', 'management', 'advisor-center', 'app-settings'];
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
        if (planData.plan_code) api.setPlanCode(planData.plan_code);
        setPrograms(prog || []);
      } else {
        // If we have a plan loaded with a plan_code, refresh it by code
        // Use functional update to access current state without dependency
        setPlans(currentPlans => {
          setSelectedPlanId(currentSelectedId => {
            const currentPlan = currentPlans.find(p => p.id === currentSelectedId);
            if (currentPlan?.plan_code) {
              // Refresh plan asynchronously
              api.getPlanByCode(currentPlan.plan_code)
                .then(refreshedPlan => {
                  if (refreshedPlan) {
                    setPlans([refreshedPlan]);
                    setSelectedPlanId(refreshedPlan.id);
                    if (refreshedPlan.plan_code) api.setPlanCode(refreshedPlan.plan_code);
                  }
                })
                .catch(e => console.error('Failed to refresh plan by code:', e));
            }
            return currentSelectedId; // Don't change selectedPlanId synchronously
          });
          return currentPlans; // Don't change plans synchronously
        });
        const prog = await api.getPrograms({ include_all: userMode === 'advisor' });
        setPrograms(prog || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, [userMode]);

  // Set a loaded plan directly (used by advisor center and plan code lookup)
  const setLoadedPlan = useCallback(async (planData) => {
    if (planData && planData.id) {
      setPlans([planData]);
      setSelectedPlanId(planData.id);
      // Store plan code so ID-based API calls can authenticate
      if (planData.plan_code) api.setPlanCode(planData.plan_code);
      // Also load programs if needed
      const prog = await api.getPrograms({ include_all: userMode === 'advisor' });
      setPrograms(prog || []);
    }
  }, [userMode]);



    const handlePlanCreated = async (newPlan) => {
      setIsModalOpen(false);

      if (newPlan) {
        setPlans([newPlan]);
        setSelectedPlanId(newPlan.id);
        // Store plan code so subsequent ID-based API calls can authenticate
        if (newPlan.plan_code) api.setPlanCode(newPlan.plan_code);
        // Trigger a refresh so progress bars + plan details re-fetch from API
        // (the plan object here may be stale if transcript import added courses)
        setPlanRefreshTrigger(x => x + 1);
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
    api.setPlanCode(null);
    setSelectedPlanId(null);
    setPlans([]);
    setActiveTab('lookup');
    navigate('/lookup');
  }, [navigate]);

  const deleteActivePlan = useCallback(async () => {
    const plan = plans.find(p => p.id === selectedPlanId);
    if (!plan) return;
    await api.deletePlan(plan.id);
    api.setPlanCode(null);
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
    // Advisor-only tabs (advisors are also admins)
    ...(userMode === 'advisor' ? [{ id: 'advisor-center', label: 'Advisor Center', shortLabel: 'Advisor', icon: 'Shield' }] : []),
    ...(userMode === 'advisor' ? [{ id: 'management', label: 'Program Settings', shortLabel: 'Programs', icon: 'Settings' }] : []),
    ...(userMode === 'advisor' ? [{ id: 'app-settings', label: 'App Settings', shortLabel: 'Settings', icon: 'Settings' }] : [])
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
  setLoadedPlan,  // New function to set a loaded plan directly
  handleOnboardingComplete, 
  handlePlanCreated, 
  handleAddToPlan,
  clearPlanAccess, 
  deleteActivePlan
};

return returnObject;
}