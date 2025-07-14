import React, { useState } from 'react';
import { Search, FileText, Upload, GraduationCap, Users } from 'lucide-react';
import CourseSearch from './components/CourseSearch';
import PlanBuilder from './components/PlanBuilder';
import CSVUpload from './components/CSVUpload';
import CreatePlanModal from './components/CreatePlanModal';
import AddCourseToPlanModal from './components/AddCourseToPlanModal';
import api from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [userMode, setUserMode] = useState('student');
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

  const tabs = [
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', icon: FileText },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', icon: Upload }] : []),
  ];

  // Load plans and programs for plan selection
  React.useEffect(() => {
    loadPlansAndPrograms();
  }, []);

  const loadPlansAndPrograms = async () => {
    try {
      const [plansRes, programsRes] = await Promise.all([
        api.getPlans({}),
        api.getPrograms()
      ]);
      setPlans(plansRes.plans || []);
      setPrograms(programsRes.programs || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handlePlanCreated = () => {
    setIsModalOpen(false);
    loadPlansAndPrograms();
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
    alert('Could not load plan data. Please try again.');
  }
};


  // Handler for when courses are successfully added
  const handleCoursesAdded = async (courseDataArray) => {
    for (const courseData of courseDataArray) {
      await api.addCourseToPlan(selectedPlanId, courseData);
    }
    
    // Close modal
    setAddCourseModal({ isOpen: false, courses: [], plan: null, program: null });
    
    // Trigger a refresh in PlanBuilder
    setPlanRefreshTrigger(prev => prev + 1);
  };


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <GraduationCap className="text-blue-600 mr-3" size={32} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Course Transfer System</h1>
                <p className="text-sm text-gray-600">Map Your Courses Across Institutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="mr-1" size={16} />
                  <span>{userMode === 'advisor' ? 'Advisor Portal' : 'Student Portal'}</span>
                </div>
                <button
                  onClick={() => setUserMode(userMode === 'student' ? 'advisor' : 'student')}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  {userMode === 'student' ? 'Advisor' : 'Student'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="mr-2" size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' && (
          <CourseSearch
            planId={selectedPlanId}
            setPlanId={setSelectedPlanId}
            onAddToPlan={handleAddToPlan}
            program={selectedPlanId ? programs.find(p => p.id === plans.find(plan => plan.id === selectedPlanId)?.program_id) : null}
          />
        )}
        {activeTab === 'plans' && (
          <PlanBuilder
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
          />
        )}
        {activeTab === 'upload' && <CSVUpload />}
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

      {/* Plan Delete Button above Footer */}
      {activeTab === 'plans' && selectedPlanId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex justify-end">
          <button
            className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 shadow"
            onClick={async () => {
              const plan = plans.find(p => p.id === selectedPlanId);
              if (!plan) return;
              if (!window.confirm(`Delete plan '${plan.plan_name}'? This cannot be undone.`)) return;
              try {
                await api.deletePlan(plan.id);
                setPlans(plans => plans.filter(p => p.id !== plan.id));
                setSelectedPlanId(null);
                alert('Plan deleted successfully.');
              } catch (err) {
                alert('Failed to delete plan: ' + (err?.message || err));
              }
            }}
          >Delete Selected Plan</button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Course Transfer System</p>
            <p className="mt-1">Developed by Mitchell Mennelle under a joint grant between<br></br> Delgado Community College and The University of New Orleans</p>
            <p className="mt-1">© 2025 All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;