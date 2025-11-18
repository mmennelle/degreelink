import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DarkModeProvider } from './hooks/useDarkMode';
import useAppController from './controllers/useAppController';
import AppShell from './views/AppShell';

import MobileOnboarding from './components/MobileOnboarding';
import PrivacyNotice from './components/PrivacyNotice';
import CreatePlanModal from './components/CreatePlanModal';
import AddCourseToPlanModal from './components/AddCourseToPlanModal';
import PlanCreatedModal from './components/PlanCreatedModal';

import SearchPage from './pages/SearchPage';
import PlansPage from './pages/PlansPage';
import LookupPage from './pages/LookupPage';
import UploadPage from './pages/UploadPage';
import AuditPage from './pages/AuditPage';
import ProgramManagement from './pages/ProgramManagement';

export default function App() {
  const c = useAppController();

  useEffect(() => {
    console.log('planCreatedModal state changed:', c.planCreatedModal);
  }, [c.planCreatedModal]);


  if (c.showOnboarding) {
    return (
      <>
        <MobileOnboarding onComplete={c.handleOnboardingComplete} />
        <PrivacyNotice />
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
          onToggleUserMode={() => c.setUserMode(c.userMode === 'advisor' ? 'student' : 'advisor')}
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

            <Route path="/upload" element={<UploadPage />} />

            <Route path="/management" element={<ProgramManagement />} />

            <Route path="/audit" element={
              <AuditPage
                selectedPlanId={c.selectedPlanId}
                plans={c.plans}
              />
            } />
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
        </AppShell>
      </DarkModeProvider>
  </div>
  );
}
