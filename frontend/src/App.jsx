// App.jsx - Clean entry point that orchestrates MVC components
import React from 'react';
import { Search, FileText, Key, Users, EyeOff } from 'lucide-react';
import { DarkModeProvider, useDarkMode } from './contexts/DarkMode';
import { useAppController } from './controllers/AppController';
import { AppLayout, AppContent, AppModals, AppFooter } from './views/AppView';
import MobileOnboarding from './components/MobileOnboarding';
import PrivacyNotice from './components/PrivacyNotice';
import api from './services/api';

const App = () => {
  // All business logic is handled by the controller
  const controller = useAppController();

  if (controller.showOnboarding) {
    return (
      <DarkModeProvider>
        <MobileOnboarding onComplete={controller.handleOnboardingComplete} />
        <PrivacyNotice />
      </DarkModeProvider>
    );
  }

  return (
    <DarkModeProvider>
      <MainApp />
      <PrivacyNotice />
    </DarkModeProvider>
  );
};

// Main app content component that uses the controller
const MainApp = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const controller = useAppController();

  // Define tabs based on user mode
  const tabs = [
    { id: 'search', label: 'Course Search', shortLabel: 'Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', shortLabel: 'Plans', icon: FileText },
    { id: 'lookup', label: 'Find Plan', shortLabel: 'Find', icon: Key },
    ...(controller.userMode === 'advisor' ? 
      [{ id: 'upload', label: 'CSV Upload', shortLabel: 'Upload', icon: Users }] : []),
  ];

  // Helper to handle plan access clearing
  const handleClearAccess = async () => {
    if (confirm('Clear access to your plan?\n\nYou\'ll need to enter your plan code again to access it.')) {
      await api.clearPlanAccess();
      controller.handlePlanSelection(null);
      controller.loadPlansAndPrograms();
    }
  };

  // Props for each view component
  const searchProps = {
    planId: controller.selectedPlanId,
    setPlanId: controller.handlePlanSelection,
    onAddToPlan: controller.handleAddToPlan,
    program: controller.selectedPlanId ? 
      controller.programs.find(p => p.id === controller.plans.find(plan => plan.id === controller.selectedPlanId)?.program_id) : 
      null
  };

  const planBuilderProps = {
    plans: controller.plans,
    selectedPlanId: controller.selectedPlanId,
    setSelectedPlanId: controller.handlePlanSelection,
    onCreatePlan: () => controller.setIsModalOpen(true),
    userMode: controller.userMode,
    onAddToPlan: controller.handleAddToPlan,
    programs: controller.programs,
    refreshTrigger: controller.planRefreshTrigger,
    setPlanLookupModal: controller.setPlanLookupModal,
    loadPlansAndPrograms: controller.loadPlansAndPrograms,
    onClearAccess: handleClearAccess
  };

  const lookupProps = {
    onPlanFound: controller.handlePlanFoundByCode
  };

  const createPlanModalProps = {
    isOpen: controller.isModalOpen,
    onClose: () => controller.setIsModalOpen(false),
    onPlanCreated: controller.handlePlanCreated,
    userMode: controller.userMode
  };

  const addCourseModalProps = {
    isOpen: controller.addCourseModal.isOpen,
    onClose: () => controller.setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null }),
    courses: controller.addCourseModal.courses,
    plan: controller.addCourseModal.plan,
    program: controller.addCourseModal.program,
    onCoursesAdded: controller.handleCoursesAdded
  };

  const planLookupModalProps = {
    isOpen: controller.planLookupModal,
    showAsModal: true,
    onClose: () => controller.setPlanLookupModal(false),
    onPlanFound: controller.handlePlanFoundByCode
  };

  return (
    <div>
      <AppLayout
        userMode={controller.userMode}
        tabs={tabs}
        activeTab={controller.activeTab}
        onTabChange={controller.setActiveTab}
        onToggleDarkMode={toggleDarkMode}
        onPlanLookup={() => controller.setPlanLookupModal(true)}
        onResetToHome={controller.resetToOnboarding}
        isDarkMode={isDarkMode}
      />

      <AppContent
        activeTab={controller.activeTab}
        searchProps={searchProps}
        planBuilderProps={planBuilderProps}
        lookupProps={lookupProps}
        uploadProps={{}}
      />

      {/* Plan management buttons */}
      {controller.activeTab === 'plans' && controller.selectedPlanId && (
        <PlanManagementButtons
          plans={controller.plans}
          selectedPlanId={controller.selectedPlanId}
          onClearAccess={handleClearAccess}
          onPlanDeleted={() => {
            controller.handlePlanSelection(null);
            controller.setActiveTab('lookup');
          }}
        />
      )}

      <AppModals
        createPlanModal={createPlanModalProps}
        addCourseModal={addCourseModalProps}
        planLookupModal={planLookupModalProps}
      />

      <AppFooter />
    </div>
  );
};

// Separate component for plan management buttons
const PlanManagementButtons = ({ plans, selectedPlanId, onClearAccess, onPlanDeleted }) => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-4">
    <button
      className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 shadow transition-colors font-medium flex items-center justify-center"
      onClick={onClearAccess}
    >
      <EyeOff className="mr-2" size={16} />
      Clear Plan Access
    </button>
    
    <button
      className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 shadow transition-colors font-medium"
      onClick={async () => {
        const plan = plans.find(p => p.id === selectedPlanId);
        if (!plan) return;
        
        const confirmMessage = `⚠️ PERMANENTLY DELETE PLAN?\n\nPlan: "${plan.plan_name}"\nCode: ${plan.plan_code}\n\nThis action CANNOT be undone!\nAll course data will be lost forever.`;
        
        if (!window.confirm(confirmMessage)) return;
        
        try {
          await api.deletePlan(plan.id);
          alert('Plan permanently deleted. All data has been removed.');
          onPlanDeleted();
        } catch (err) {
          if (err.message.includes('Access denied')) {
            alert('Session expired. Plan deletion requires current access.');
            onPlanDeleted();
          } else {
            alert('Failed to delete plan: ' + (err?.message || err));
          }
        }
      }}
    >
      Permanently Delete Plan
    </button>
  </div>
);

export default App;