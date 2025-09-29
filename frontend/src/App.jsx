import React, { useEffect } from 'react';
import { DarkModeProvider } from './hooks/useDarkMode';
import useAppController from './controllers/useAppController';
import AppShell from './views/AppShell';
import AdminModeBadge from './components/AdminModeBadge';

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
      <AdminModeBadge />
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
          {c.activeTab === 'search' && (
            <SearchPage
              selectedPlanId={c.selectedPlanId}
              programs={c.programs}
              plans={c.plans}
              onAddToPlan={c.handleAddToPlan}
              setSelectedPlanId={c.setSelectedPlanId}
            />
          )}

          {c.activeTab === 'plans' && (
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
          )}

          {c.activeTab === 'lookup' && (
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
          )}

          {c.activeTab === 'upload' && <UploadPage />}

          {c.activeTab === 'audit' && (
            <AuditPage
              selectedPlanId={c.selectedPlanId}
              plans={c.plans}
            />
          )}

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
              planId={c.selectedPlanId}
              courses={c.addToPlanModal.courses}
              onClose={() => c.setAddToPlanModal({isOpen:false, courses:[]})}
              onConfirm={async (planId) => {
                if (!planId) return;
                await c.handleAddToPlan(c.addToPlanModal.courses);
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
