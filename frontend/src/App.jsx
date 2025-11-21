import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { DarkModeProvider } from './hooks/useDarkMode';
import useAppController from './controllers/useAppController';
import AppShell from './views/AppShell';
import api from './services/api';

import MobileOnboarding from './components/MobileOnboarding';
import PrivacyNotice from './components/PrivacyNotice';
import CreatePlanModal from './components/CreatePlanModal';
import AddCourseToPlanModal from './components/AddCourseToPlanModal';
import PlanCreatedModal from './components/PlanCreatedModal';
import AdvisorAuthModal from './components/AdvisorAuthModal';

import SearchPage from './pages/SearchPage';
import PlansPage from './pages/PlansPage';
import LookupPage from './pages/LookupPage';
import UploadPage from './pages/UploadPage';
import AuditPage from './pages/AuditPage';
import ProgramManagement from './pages/ProgramManagement';
import AppManagementPage from './pages/AppManagementPage';

export default function App() {
  const c = useAppController();
  const navigate = useNavigate();
  const [showAdvisorAuth, setShowAdvisorAuth] = useState(false);
  const [advisorAuth, setAdvisorAuth] = useState(null);
  const [pendingOnboardingData, setPendingOnboardingData] = useState(null);

  useEffect(() => {
    console.log('planCreatedModal state changed:', c.planCreatedModal);
  }, [c.planCreatedModal]);

  // Check for existing advisor session on mount
  useEffect(() => {
    const checkAdvisorSession = async () => {
      try {
        const response = await api.verifyAdvisorSession();
        if (response.valid) {
          setAdvisorAuth({
            email: response.email,
            expiresAt: response.expires_at
          });
          c.setUserMode('advisor');
        }
      } catch (err) {
        // No valid session, stay in student mode
        setAdvisorAuth(null);
      }
    };

    checkAdvisorSession();
  }, []);

  const handleAdvisorAuthSuccess = (authData) => {
    if (authData) {
      setAdvisorAuth(authData);
      c.setUserMode('advisor');
      
      // If there's pending onboarding data, complete it now
      if (pendingOnboardingData) {
        const { destination, userMode, showCreatePlan, userProfile } = pendingOnboardingData;
        c.handleOnboardingComplete({
          destination,
          userMode: 'advisor', // Override with advisor mode
          showCreatePlan,
          userProfile
        });
        setPendingOnboardingData(null);
        setShowAdvisorAuth(false);
      }
    } else {
      // Logout
      setAdvisorAuth(null);
      c.setUserMode('student');
      
      // Clear pending onboarding data on logout
      if (pendingOnboardingData) {
        setPendingOnboardingData(null);
        setShowAdvisorAuth(false);
      }
      
      // Redirect to search if on an advisor-only route
      const currentPath = window.location.pathname;
      const advisorOnlyPaths = ['/upload', '/management', '/app-management', '/audit'];
      if (advisorOnlyPaths.some(path => currentPath.startsWith(path))) {
        navigate('/search');
      }
    }
  };

  const handleOpenAdvisorSettings = () => {
    setShowAdvisorAuth(true);
  };

  const handleAdvisorSelectedFromOnboarding = (answers) => {
    // Store the onboarding data and open advisor auth
    setPendingOnboardingData({
      destination: 'search',
      userMode: 'advisor',
      showCreatePlan: false,
      userProfile: answers
    });
    setShowAdvisorAuth(true);
  };


  if (c.showOnboarding) {
    return (
      <>
        <MobileOnboarding 
          onComplete={c.handleOnboardingComplete}
          onAdvisorSelected={handleAdvisorSelectedFromOnboarding}
        />
        <PrivacyNotice />
        {/* Show advisor auth modal over onboarding if advisor was selected */}
        <AdvisorAuthModal
          isOpen={showAdvisorAuth}
          onClose={() => {
            setShowAdvisorAuth(false);
            setPendingOnboardingData(null);
            // Keep onboarding open, don't reset - user can select a different option
          }}
          onSuccess={handleAdvisorAuthSuccess}
          isAuthenticated={!!advisorAuth}
          advisorEmail={advisorAuth?.email}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-surface-light dark:bg-surface-dark transition-colors duration-300">
      <DarkModeProvider>
        <AppShell
          activeTab={c.activeTab}
          setActiveTab={c.setActiveTab}
          tabs={c.tabs}
          userMode={c.userMode}
          onFindPlan={() => c.setPlanLookupModal(true)}
          onOpenAdvisorSettings={handleOpenAdvisorSettings}
          onGoHome={c.resetToOnboarding}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/search" replace />} />
            
            <Route path="/search" element={
              <SearchPage
                selectedPlanId={c.selectedPlanId}
                programs={c.programs}
                plans={c.plans}
                onAddToPlan={c.handleAddToPlan}
                setSelectedPlanId={c.setSelectedPlanId}
              />
            } />

            <Route path="/plans" element={
              <PlansPage
                plans={c.plans}
                selectedPlanId={c.selectedPlanId}
                setSelectedPlanId={c.setSelectedPlanId}   
                onCreatePlan={() => c.setIsModalOpen(true)}
                onClearAccess={c.clearPlanAccess}
                onDeletePlan={async () => {
                  if (!window.confirm('Permanently delete plan? This cannot be undone.')) return;
                  await c.deleteActivePlan();
                }}
                setPlanLookupModal={c.setPlanLookupModal}
                userMode={c.userMode}
              />
            } />

            <Route path="/lookup" element={
              <LookupPage
                onSuccess={() => {
                  // keep whatever you do on success; do NOT auto-switch tabs
                }}
                onOpenPlan={(planId) => {
                  if (!planId) return;
                  c.setSelectedPlanId(planId);
                  c.setActiveTab('plans');
                  c.loadPlansAndPrograms?.();
                }}
              />
            } />

            {/* Advisor-only routes */}
            {c.userMode === 'advisor' && (
              <>
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/management" element={<ProgramManagement />} />
                <Route path="/app-management" element={<AppManagementPage />} />
                <Route path="/audit" element={
                  <AuditPage
                    selectedPlanId={c.selectedPlanId}
                    plans={c.plans}
                  />
                } />
              </>
            )}

            {/* Public audit route for students */}
            {c.userMode === 'student' && (
              <Route path="/audit" element={
                <AuditPage
                  selectedPlanId={c.selectedPlanId}
                  plans={c.plans}
                />
              } />
            )}
          </Routes>

          {/* Modals */}
          {c.isModalOpen && (
            <CreatePlanModal
              isOpen={c.isModalOpen}
              onClose={() => c.setIsModalOpen(false)}
              onPlanCreated={c.handlePlanCreated}
              userMode={c.userMode}
            />
          )}
          {c.planLookupModal && (
            <AddCourseToPlanModal
              // if you have a dedicated PlanLookup modal, swap this component
              isOpen={c.planLookupModal}
              onClose={() => c.setPlanLookupModal(false)}
              planId={c.selectedPlanId}
              // you may keep this as a no-op; this modal stub keeps parity
              courses={c.addToPlanModal.courses}
              onConfirm={async (planId) => {
                if (!planId) return;
                // example: switch selected plan after lookup
                c.setSelectedPlanId(planId);
                c.setPlanLookupModal(false);
                c.setActiveTab('plans');
              }}
            />
          )}

          {c.addToPlanModal.isOpen && (
            <AddCourseToPlanModal
              isOpen={c.addToPlanModal.isOpen}
              courses={c.addToPlanModal.courses}
              plan={Array.isArray(c.plans) ? c.plans.find(p => p.id === c.selectedPlanId) : null}
              program={(() => {
                const selectedPlan = Array.isArray(c.plans) ? c.plans.find(p => p.id === c.selectedPlanId) : null;
                return Array.isArray(c.programs) && selectedPlan ? c.programs.find(prog => prog.id === selectedPlan.program_id) : null;
              })()}
              onClose={() => c.setAddToPlanModal({isOpen:false, courses:[]})}
              onCoursesAdded={async (courseDataArray) => {
                // Reload the plan after courses are added
                await c.loadPlansAndPrograms();
                c.setAddToPlanModal({isOpen:false, courses:[]});
              }}
            />
          )}
          
          {c.planCreatedModal.isOpen && (
            <PlanCreatedModal
              isOpen={c.planCreatedModal.isOpen}
              planData={c.planCreatedModal.planData}
              onClose={() => c.setPlanCreatedModal({isOpen: false, planData: null})}
            />
          )}

          {/* Advisor Auth Modal */}
          <AdvisorAuthModal
            isOpen={showAdvisorAuth}
            onClose={() => setShowAdvisorAuth(false)}
            onSuccess={handleAdvisorAuthSuccess}
            isAuthenticated={!!advisorAuth}
            advisorEmail={advisorAuth?.email}
          />
        </AppShell>
      </DarkModeProvider>
  </div>
  );
}