import React, { useState, useEffect, createContext, useContext } from 'react';
import { ChevronRight, ArrowLeft, GraduationCap, Search, FileText, Eye, Users, Target, Plus, Moon, Sun, Key, Shield, AlertTriangle, EyeOff } from 'lucide-react';

// Import your existing components
import CourseSearch from './components/CourseSearch';
import PlanBuilder from './components/PlanBuilder';
import CSVUpload from './components/CSVUpload';
import CreatePlanModal from './components/CreatePlanModal';
import AddCourseToPlanModal from './components/AddCourseToPlanModal';
import PlanCodeLookup, { PlanCodeDisplay } from './components/PlanCodeLookup';
import api from './services/api';

// Dark Mode Context
const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : true; // Default to dark mode
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

// Privacy Notice Component
const PrivacyNotice = () => {
  const [showNotice, setShowNotice] = useState(() => {
    return !localStorage.getItem('privacyNoticeAcknowledged');
  });

  const acknowledgeNotice = () => {
    localStorage.setItem('privacyNoticeAcknowledged', 'true');
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start">
        <Shield className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
            🔒 Your Privacy Matters
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            Your academic plans are protected by secure codes. Only you and those you share your code with can access your information.
          </p>
          <button
            onClick={acknowledgeNotice}
            className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

const MobileOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    userType: null,
    goal: null
  });

  const questions = [
    {
      id: 'userType',
      title: 'Who are you?',
      subtitle: 'Help us personalize your experience',
      options: [
        {
          value: 'student',
          label: 'Student',
          description: 'I am a current or prospective student',
          icon: <GraduationCap className="w-6 h-6" />,
          color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
        },
        {
          value: 'parent',
          label: 'Parent',
          description: 'I am helping my child with their education',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
        },
        {
          value: 'advisor',
          label: 'Academic Advisor',
          description: 'I am an advisor helping students',
          icon: <Target className="w-6 h-6" />,
          color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300'
        },
        {
          value: 'browsing',
          label: 'Just Browsing',
          description: 'Exploring options and gathering information',
          icon: <Eye className="w-6 h-6" />,
          color: 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
        },
        {
          value: 'returning',
          label: 'I Have a Plan Code',
          description: 'I want to access my existing plan',
          icon: <Key className="w-6 h-6" />,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-300'
        }
      ]
    },
    {
      id: 'goal',
      title: 'What would you like to focus on?',
      subtitle: 'Choose your primary goal today',
      options: [
        {
          value: 'transfer',
          label: 'Course Transfer Research',
          description: 'Find courses that transfer between institutions',
          icon: <Search className="w-6 h-6" />,
          color: 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300'
        },
        {
          value: 'planning',
          label: 'Academic Planning',
          description: 'Create and track academic plans',
          icon: <FileText className="w-6 h-6" />,
          color: 'bg-teal-50 border-teal-200 text-teal-700 dark:bg-teal-900/30 dark:border-teal-700 dark:text-teal-300'
        }
      ]
    }
  ];

  const handleOptionSelect = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // If user selected "returning" (has plan code), skip to lookup
    if (questionId === 'userType' && value === 'returning') {
      handleComplete({ ...newAnswers, goal: 'lookup' });
      return;
    }

    // If this is the last question or user is just browsing, complete onboarding
    if (currentStep === questions.length - 1 || (questionId === 'userType' && value === 'browsing')) {
      handleComplete(newAnswers);
    } else {
      // Move to next question
      setCurrentStep(currentStep + 1);
    }
  };

  const handleComplete = (finalAnswers) => {
    // Determine the destination and user mode based on answers
    let destination = 'search'; // default
    let userMode = 'student'; // default
    let showCreatePlan = false;

    // Set user mode based on user type
    if (finalAnswers.userType === 'advisor') {
      userMode = 'advisor';
    } else {
      userMode = 'student'; // parent, student, and browsing all use student mode
    }

    // Determine destination based on user type and goal
    if (finalAnswers.userType === 'browsing') {
      destination = 'search';
    } else if (finalAnswers.userType === 'returning' || finalAnswers.goal === 'lookup') {
      destination = 'lookup';
    } else if (finalAnswers.goal === 'transfer') {
      destination = 'search';
    } else if (finalAnswers.goal === 'planning') {
      destination = 'plans';
      // Only show create plan for non-browsing users
      if (finalAnswers.userType !== 'browsing') {
        showCreatePlan = true;
      }
    }

    // Save session data including destination and userMode for persistence
    const sessionData = {
      ...finalAnswers,
      destination,
      userMode,
      timestamp: Date.now()
    };
    localStorage.setItem('currentSession', JSON.stringify(sessionData));

    onComplete({
      destination,
      userMode,
      showCreatePlan,
      userProfile: finalAnswers
    });
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Skip second question if user is just browsing or returning
  if (answers.userType === 'browsing' || answers.userType === 'returning') {
    return null; // Component will be unmounted as onComplete was called
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-indigo-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="mr-3 p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center">
              <GraduationCap className="text-blue-600 dark:text-blue-400 mr-2" size={24} />
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">Course Transfer System</h1>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {currentStep + 1} of {questions.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Question */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {currentQuestion.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {currentQuestion.subtitle}
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleOptionSelect(currentQuestion.id, option.value)}
                className={`w-full p-6 border-2 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg active:scale-95 ${option.color} border-opacity-50 hover:border-opacity-100`}
              >
                <div className="flex items-start text-left">
                  <div className="mr-4 mt-1 flex-shrink-0">
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">
                      {option.label}
                    </h3>
                    <p className="text-sm opacity-80">
                      {option.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-2 mt-1 opacity-60" />
                </div>
              </button>
            ))}
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't worry, you can always change your path later
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-4">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Course Transfer System - Helping you navigate your academic journey
          </p>
        </div>
      </div>
    </div>
  );
};

// Mobile-friendly CourseSearch component wrapper
const MobileCourseSearch = (props) => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Find Courses</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Search for courses and check transfer equivalencies</p>
      </div>
      <CourseSearch {...props} />
    </div>
  );
};

// Secure Mobile PlanBuilder with privacy controls
const SecureMobilePlanBuilder = (props) => {
  const { isDarkMode } = useDarkMode();
  
  // Check if user has any plans accessible
  const hasAccessiblePlans = props.plans && props.plans.length > 0;
  
  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Academic Plans</h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">Secure access to your degree plans</p>
            
            {/* Show plan code if a plan is selected */}
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
            {/* Security-conscious plan access */}
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
                  <Plus className="mr-1" size={16} />
                  Create
                </button>
              </>
            ) : (
              <button
                onClick={async () => {
                  if (confirm('Clear secure access to your plan?\n\nYou\'ll need to enter your plan code again to access it.')) {
                    await api.clearPlanAccess();
                    props.setSelectedPlanId(null);
                    // Refresh to clear plans list
                    if (props.loadPlansAndPrograms) {
                      props.loadPlansAndPrograms();
                    }
                  }
                }}
                className="px-3 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 text-sm flex items-center"
                title="Clear plan access for security"
              >
                <EyeOff className="mr-1" size={16} />
                Clear Access
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Security notice for no accessible plans */}
      {!hasAccessiblePlans && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <Shield className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                Secure Plan Access
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
                For your privacy, plans can only be accessed using secure plan codes.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => props.setPlanLookupModal(true)}
                  className="px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  Enter Plan Code
                </button>
                <button
                  onClick={props.onCreatePlan}
                  className="px-3 py-2 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                >
                  Create New Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <PlanBuilder {...props} />
    </div>
  );
};

// Mobile-friendly CSVUpload component wrapper
const MobileCSVUpload = (props) => {
  const { isDarkMode } = useDarkMode();
  
  return (
    <div className="space-y-4">
      {/* Mobile Header */}
      <div className="block lg:hidden">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">CSV Upload</h2>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Bulk import course data and equivalencies</p>
      </div>
      <CSVUpload {...props} />
    </div>
  );
};

// Updated App component with security and plan code features
const App = () => {
  const [showOnboarding, setShowOnboarding] = useState(() => {
    // Check if there's an active session - if so, skip onboarding
    const currentSession = localStorage.getItem('currentSession');
    return !currentSession; // Show onboarding only if no session exists
  });
  
  const [activeTab, setActiveTab] = useState(() => {
    // Restore active tab from session
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession) {
      const session = JSON.parse(currentSession);
      return session.destination || 'search';
    }
    return 'search';
  });
  
  const [userMode, setUserMode] = useState(() => {
    // Restore user mode from session
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession) {
      const session = JSON.parse(currentSession);
      return session.userMode || 'student';
    }
    return 'student';
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [planRefreshTrigger, setPlanRefreshTrigger] = useState(0);
  
  // Add course modal state
  const [addCourseModal, setAddCourseModal] = useState({
    isOpen: false,
    courses: [],
    plan: null,
    program: null
  });

  // Plan code lookup state
  const [planLookupModal, setPlanLookupModal] = useState(false);

  // Load plans and programs for plan selection (now security-aware)
  useEffect(() => {
    if (!showOnboarding) {
      loadPlansAndPrograms();
    }
  }, [showOnboarding]);

  const loadPlansAndPrograms = async () => {
    try {
      const [plansRes, programsRes] = await Promise.all([
        api.getPlans({}), // This will now return empty for security
        api.getPrograms()
      ]);
      
      // Only load programs, not plans for security
      setPrograms(programsRes.programs || []);
      
      // Check if we have session access to any plan
      const sessionStatus = await api.getSessionStatus();
      if (sessionStatus.has_access && sessionStatus.plan_id) {
        try {
          const planData = await api.getPlan(sessionStatus.plan_id);
          setPlans([planData]);
          setSelectedPlanId(planData.id);
        } catch (error) {
          console.log('Session expired or plan not accessible');
          setPlans([]);
          setSelectedPlanId(null);
        }
      } else {
        setPlans([]);
        setSelectedPlanId(null);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      setPrograms([]);
      setPlans([]);
    }
  };

  const handleOnboardingComplete = (result) => {
    setShowOnboarding(false);
    setActiveTab(result.destination);
    setUserMode(result.userMode);
    
    // If user wants to plan degree, show create plan modal after a brief delay
    if (result.showCreatePlan) {
      setTimeout(() => setIsModalOpen(true), 500);
    }
  };

  // Load session state on app mount
  useEffect(() => {
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession && !showOnboarding) {
      const session = JSON.parse(currentSession);
      // Check if session is not too old (optional - 24 hours)
      const sessionAge = Date.now() - (session.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (sessionAge < maxAge) {
        setActiveTab(session.destination || 'search');
        setUserMode(session.userMode || 'student');
      } else {
        // Session expired, clear it and show onboarding
        localStorage.removeItem('currentSession');
        setShowOnboarding(true);
      }
    }
  }, [showOnboarding]);

  const handlePlanCreated = async () => {
    setIsModalOpen(false);
    
    try {
      // The create plan response now includes the full plan with code
      // We should already have access to the created plan
      const sessionStatus = await api.getSessionStatus();
      if (sessionStatus.has_access) {
        const planData = await api.getPlan(sessionStatus.plan_id);
        setPlans([planData]);
        setSelectedPlanId(planData.id);
        
        // Show the plan code to the user with security emphasis
        if (planData.plan_code) {
          setTimeout(() => {
            const message = `Plan created successfully!\n\nYour secure plan code: ${planData.plan_code}\n\n🔒 IMPORTANT SECURITY NOTICE:\n• Save this code securely (password manager recommended)\n• This code provides full access to your plan\n• Only share with trusted advisors\n• Keep it private and secure`;
            alert(message);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Failed to load created plan:', error);
      // Fallback to manual reload
      await loadPlansAndPrograms();
    }
  };

  const handlePlanFoundByCode = (planData) => {
    // Switch to plans tab and load the found plan
    setActiveTab('plans');
    
    // Replace the entire plans list with just this plan for security
    setPlans([planData]);
    
    // Select the found plan
    setSelectedPlanId(planData.id);
    
    // Close any open modals
    setPlanLookupModal(false);
    
    // Show success message with security reminder
    alert(`Plan "${planData.plan_name}" loaded successfully!\n\n🔒 Security reminder: Your plan is now accessible for 1 hour. Clear access when done on shared devices.`);
  };

  // Unified handler for adding courses to plan
  const handleAddToPlan = async (courses) => {
    if (!selectedPlanId) {
      alert('Please select a plan first.');
      return;
    }

    try {
      // Refresh the selected plan before opening the modal
      const refreshedPlan = await api.getPlan(selectedPlanId);
      
      // Get matching program based on refreshed plan's program_id
      const refreshedProgram = programs.find(p => p.id === refreshedPlan.program_id) 
        || await api.getProgram(refreshedPlan.program_id);

      // Ensure courses is an array
      const coursesArray = Array.isArray(courses) ? courses : [courses];

      setAddCourseModal({
        isOpen: true,
        courses: coursesArray,
        plan: refreshedPlan,
        program: refreshedProgram
      });

    } catch (error) {
      console.error('Failed to load latest plan or program:', error);
      if (error.message.includes('Access denied')) {
        alert('Your session has expired. Please enter your plan code again.');
        setSelectedPlanId(null);
        setPlans([]);
        setActiveTab('lookup');
      } else {
        alert('Could not load plan data. Please try again.');
      }
    }
  };

  const handleCoursesAdded = async (courseDataArray) => {
    for (const courseData of courseDataArray) {
      await api.addCourseToPlan(selectedPlanId, courseData);
    }
    
    // Close modal
    setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
    
    // Trigger a refresh in PlanBuilder
    setPlanRefreshTrigger(prev => prev + 1);
  };

  // Reset to onboarding (go back to homepage)
  const resetToOnboarding = () => {
    // Clear all session data for security
    localStorage.removeItem('currentSession');
    api.clearPlanAccess(); // Clear server-side session
    setShowOnboarding(true);
    setActiveTab('search');
    setSelectedPlanId(null);
    setPlans([]);
  };

  if (showOnboarding) {
    return (
      <DarkModeProvider>
        <MobileOnboarding onComplete={handleOnboardingComplete} />
        <PrivacyNotice />
      </DarkModeProvider>
    );
  }

  const tabs = [
    { id: 'search', label: 'Course Search', shortLabel: 'Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', shortLabel: 'Plans', icon: FileText },
    { id: 'lookup', label: 'Find Plan', shortLabel: 'Find', icon: Key },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', shortLabel: 'Upload', icon: Users }] : []),
  ];

  return (
    <DarkModeProvider>
      <AppContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userMode={userMode}
        tabs={tabs}
        resetOnboarding={resetToOnboarding}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handlePlanCreated={handlePlanCreated}
        plans={plans}
        selectedPlanId={selectedPlanId}
        setSelectedPlanId={setSelectedPlanId}
        programs={programs}
        planRefreshTrigger={planRefreshTrigger}
        handleAddToPlan={handleAddToPlan}
        addCourseModal={addCourseModal}
        setAddCourseModal={setAddCourseModal}
        handleCoursesAdded={handleCoursesAdded}
        loadPlansAndPrograms={loadPlansAndPrograms}
        planLookupModal={planLookupModal}
        setPlanLookupModal={setPlanLookupModal}
        handlePlanFoundByCode={handlePlanFoundByCode}
      />
      <PrivacyNotice />
    </DarkModeProvider>
  );
};

const AppContent = ({
  activeTab, setActiveTab, userMode, tabs, resetOnboarding,
  isModalOpen, setIsModalOpen, handlePlanCreated, plans, selectedPlanId,
  setSelectedPlanId, programs, planRefreshTrigger, handleAddToPlan,
  addCourseModal, setAddCourseModal, handleCoursesAdded, loadPlansAndPrograms,
  planLookupModal, setPlanLookupModal, handlePlanFoundByCode
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Mobile-optimized Header */}
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
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Quick Plan Lookup Button */}
              <button
                onClick={() => setPlanLookupModal(true)}
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
                onClick={resetOnboarding}
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

      {/* Mobile-optimized Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 sm:top-20 lg:top-24 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 sm:space-x-4 lg:space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {activeTab === 'search' && (
          <MobileCourseSearch
            planId={selectedPlanId}
            setPlanId={setSelectedPlanId}
            onAddToPlan={handleAddToPlan}
            program={selectedPlanId ? programs.find(p => p.id === plans.find(plan => plan.id === selectedPlanId)?.program_id) : null}
          />
        )}
        {activeTab === 'plans' && (
          <SecureMobilePlanBuilder
            plans={plans}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={(id) => {
              setSelectedPlanId(id);
              // If plan was deleted (id is null), refresh plans
              if (id === null) {
                loadPlansAndPrograms();
              }
            }}
            onCreatePlan={() => setIsModalOpen(true)}
            userMode={userMode}
            onAddToPlan={handleAddToPlan}
            programs={programs}
            refreshTrigger={planRefreshTrigger}
            setPlanLookupModal={setPlanLookupModal}
            loadPlansAndPrograms={loadPlansAndPrograms}
          />
        )}
        {activeTab === 'lookup' && (
          <div className="space-y-4">
            <div className="block lg:hidden">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Find Plan</h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">Access your plan using your secure plan code</p>
            </div>
            <PlanCodeLookup onPlanFound={handlePlanFoundByCode} />
          </div>
        )}
        {activeTab === 'upload' && <MobileCSVUpload />}
      </main>

      {/* Create Plan Modal */}
      <CreatePlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPlanCreated={handlePlanCreated} 
        userMode={userMode} 
      />
      
      {/* Add Course Modal */}
      <AddCourseToPlanModal
        isOpen={addCourseModal.isOpen}
        onClose={() => setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null })}
        courses={addCourseModal.courses}
        plan={addCourseModal.plan}
        program={addCourseModal.program}
        onCoursesAdded={handleCoursesAdded}
      />

      {/* Plan Code Lookup Modal */}
      {planLookupModal && (
        <PlanCodeLookup 
          showAsModal={true}
          onClose={() => setPlanLookupModal(false)}
          onPlanFound={handlePlanFoundByCode}
        />
      )}

      {/* Plan Delete Button above Footer - Mobile optimized with security */}
      {activeTab === 'plans' && selectedPlanId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8 flex flex-col sm:flex-row justify-center sm:justify-end gap-4">
          {/* Clear Access Button */}
          <button
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg hover:bg-yellow-200 dark:hover:bg-yellow-900/50 shadow transition-colors font-medium flex items-center justify-center"
            onClick={async () => {
              if (confirm('Clear secure access to your plan?\n\nYou\'ll need to enter your plan code again to access it.')) {
                await api.clearPlanAccess();
                setSelectedPlanId(null);
                setPlans([]);
                setActiveTab('lookup');
              }
            }}
          >
            <EyeOff className="mr-2" size={16} />
            Clear Plan Access
          </button>
          
          {/* Delete Plan Button */}
          <button
            className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 shadow transition-colors font-medium"
            onClick={async () => {
              const plan = plans.find(p => p.id === selectedPlanId);
              if (!plan) return;
              
              const confirmMessage = `⚠️ PERMANENTLY DELETE PLAN?\n\nPlan: "${plan.plan_name}"\nCode: ${plan.plan_code}\n\nThis action CANNOT be undone!\nAll course data will be lost forever.`;
              
              if (!window.confirm(confirmMessage)) return;
              
              try {
                await api.deletePlan(plan.id);
                setPlans([]);
                setSelectedPlanId(null);
                setActiveTab('lookup');
                alert('Plan permanently deleted. All data has been securely removed.');
              } catch (err) {
                if (err.message.includes('Access denied')) {
                  alert('Session expired. Plan deletion requires current access.');
                  setActiveTab('lookup');
                } else {
                  alert('Failed to delete plan: ' + (err?.message || err));
                }
              }
            }}
          >
            Permanently Delete Plan
          </button>
        </div>
      )}

      {/* Footer with Security Notice */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-8 sm:mt-16 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <div className="flex justify-center items-center mb-2">
              <Shield className="mr-2" size={16} />
              <p className="font-medium">Course Transfer System - Privacy Protected</p>
            </div>
            <p className="mt-1 text-xs sm:text-sm">
              Developed by Mitchell Mennelle under a joint grant between
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> </span>
              Delgado Community College and The University of New Orleans
            </p>
            <p className="mt-1 text-xs">© 2025 All rights reserved • Student privacy protected by secure plan codes</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;