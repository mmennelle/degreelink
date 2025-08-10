// Fixed AppView.jsx - Modals component that only shows one modal at a time
import React from 'react';
import { Search, FileText, Key, Users, GraduationCap, Moon, Sun, EyeOff, Shield } from 'lucide-react';
import { useDarkMode } from '../contexts/DarkMode';

// Import your existing components
import CourseSearch from '../components/CourseSearch';
import PlanBuilder from '../components/PlanBuilder';
import CSVUpload from '../components/CSVUpload';
import CreatePlanModal from '../components/CreatePlanModal';
import AddCourseToPlanModal from '../components/AddCourseToPlanModal';
import PlanCodeLookup, { PlanCodeDisplay } from '../components/PlanCodeLookup';

// Component wrappers for mobile optimization
const MobileCourseSearch = (props) => (
  <div className="space-y-4">
    <div className="block lg:hidden">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Find Courses</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Search for courses and check transfer equivalencies</p>
    </div>
    <CourseSearch {...props} />
  </div>
);

const MobilePlanBuilder = (props) => {
  const hasAccessiblePlans = props.plans && props.plans.length > 0;
  
  return (
    <div className="space-y-4">
      <div className="block lg:hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Academic Plans</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Manage your degree plans</p>
            
            {props.selectedPlanId && props.plans && (
              <div className="mt-3">
                <PlanCodeDisplay 
                  plan={props.plans.find(p => p.id === props.selectedPlanId)} 
                  compact={true}
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {!hasAccessiblePlans ? (
              <>
                <button
                  onClick={() => props.setPlanLookupModal(true)}
                  className="px-3 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 text-sm flex items-center"
                >
                  <Key className="mr-1" size={16} />
                  Find Plan
                </button>
                <button
                  onClick={props.onCreatePlan}
                  className="px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 text-sm flex items-center"
                >
                  Create
                </button>
              </>
            ) : (
              <button
                onClick={props.onClearAccess}
                className="px-3 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 text-sm flex items-center"
              >
                <EyeOff className="mr-1" size={16} />
                Clear Access
              </button>
            )}
          </div>
        </div>
      </div>
      
      <PlanBuilder {...props} />
    </div>
  );
};

const MobileCSVUpload = (props) => (
  <div className="space-y-4">
    <div className="block lg:hidden">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">CSV Upload</h2>
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Bulk import course data and equivalencies</p>
    </div>
    <CSVUpload {...props} />
  </div>
);

// Main app layout component
export const AppLayout = ({
  userMode,
  tabs,
  activeTab,
  onTabChange,
  onToggleDarkMode,
  onPlanLookup,
  onResetToHome,
  isDarkMode
}) => (
  <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
    {/* Header */}
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6">
          <div className="flex items-center min-w-0 flex-1">
            <GraduationCap className="text-blue-600 dark:text-blue-400 mr-2 sm:mr-3 flex-shrink-0" size={24} />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white truncate">
                Course Transfer System
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                Map Your Courses Across Institutions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={onPlanLookup}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-md hover:bg-green-200 dark:hover:bg-green-800/50 transition-colors flex items-center"
              title="Find plan by code"
            >
              <Key className="mr-1" size={14} />
              <span className="hidden sm:inline">Find Plan</span>
              <span className="sm:hidden">🔍</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <Users className="mr-1" size={16} />
                <span className="hidden sm:inline">
                  {userMode === 'advisor' ? 'Advisor Portal' : 'Student Portal'}
                </span>
                <span className="sm:hidden">
                  {userMode === 'advisor' ? 'Advisor' : 'Student'}
                </span>
              </div>
              <span className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md">
                {userMode === 'advisor' ? 'Advisor Mode' : 'Student Mode'}
              </span>
            </div>
            
            <button
              onClick={onResetToHome}
              className="px-2 sm:px-3 py-1 text-xs sm:text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title="Go back to homepage"
            >
              <span className="hidden sm:inline">Home</span>
              <span className="sm:hidden">🏠</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    {/* Navigation */}
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 sm:top-20 lg:top-24 z-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center px-3 py-3 sm:py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="mr-1 sm:mr-2" size={16} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  </div>
);

// Main content area component
export const AppContent = ({
  activeTab,
  searchProps,
  planBuilderProps,
  lookupProps,
  uploadProps
}) => (
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
    {activeTab === 'search' && <MobileCourseSearch {...searchProps} />}
    {activeTab === 'plans' && <MobilePlanBuilder {...planBuilderProps} />}
    {activeTab === 'lookup' && (
      <div className="space-y-4">
        <div className="block lg:hidden">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Find Plan</h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Access your plan using your plan code</p>
        </div>
        <PlanCodeLookup {...lookupProps} />
      </div>
    )}
    {activeTab === 'upload' && <MobileCSVUpload {...uploadProps} />}
  </main>
);

// FIXED: Modals component that only shows one modal at a time
export const AppModals = ({
  createPlanModal,
  addCourseModal,
  planLookupModal
}) => {
  // Determine which modal should be shown (priority order)
  // 1. Plan Lookup Modal (highest priority)
  // 2. Add Course Modal
  // 3. Create Plan Modal (lowest priority)
  
  if (planLookupModal.isOpen) {
    return <PlanCodeLookup {...planLookupModal} />;
  }
  
  if (addCourseModal.isOpen) {
    return <AddCourseToPlanModal {...addCourseModal} />;
  }
  
  if (createPlanModal.isOpen) {
    return <CreatePlanModal {...createPlanModal} />;
  }
  
  // No modals open
  return null;
};

// Footer component
export const AppFooter = () => (
  <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-16 transition-colors">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-center items-center mb-2">
          <Shield className="mr-2" size={16} />
          <p className="font-medium">Course Transfer System</p>
        </div>
        <p className="mt-1 text-xs sm:text-sm">
          Developed by Mitchell Mennelle under a joint grant between
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          Delgado Community College and The University of New Orleans
        </p>
        <p className="mt-1 text-xs">© 2025 All rights reserved</p>
      </div>
    </div>
  </footer>
);