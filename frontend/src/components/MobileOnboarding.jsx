import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ArrowLeft, GraduationCap, Search, FileText, Eye, Users, Target, Key } from 'lucide-react';

const MobileOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    userType: null,
    goal: null
  });
  const completedRef = useRef(false);

  // Force dark mode for onboarding screen
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Cleanup: restore dark mode based on localStorage when component unmounts
      const saved = localStorage.getItem('darkMode');
      const shouldBeDark = saved ? JSON.parse(saved) : true;
      if (!shouldBeDark) {
        document.documentElement.classList.remove('dark');
      }
    };
  }, []);

  const questions = [
    {
      id: 'userType',
      title: 'Welcome to Degree Link!',
      subtitle: 'Which Option Below Suits you Best?',
      options: [
        {
          value: 'student',
          label: 'Student',
          description: 'I am a current or prospective student',
          icon: <GraduationCap className="w-6 h-6" />,
          color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300'
        },
        {
          value: 'advisor',
          label: 'Academic Advisor',
          description: 'I am an advisor helping students',
          icon: <Target className="w-6 h-6" />,
          color: 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-700 dark:text-purple-300'
        },
        {
          value: 'parent',
          label: 'Parent',
          description: 'I am helping my child with their education',
          icon: <Users className="w-6 h-6" />,
          color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300'
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
    if (completedRef.current) return;
    completedRef.current = true;
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
              <div className="flex flex-col">
                <span className="font-semibold tracking-tight">Degree Link</span>
                <span className="text-xs text-gray-600 dark:text-gray-400">Your Path. Your Progress. Your Degree</span>
              </div>
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

export default MobileOnboarding;