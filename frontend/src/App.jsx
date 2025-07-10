import React, { useState } from 'react';
import { Search, FileText, Upload, GraduationCap, Users } from 'lucide-react';
import CourseSearch from './components/CourseSearch';
import PlanBuilder from './components/PlanBuilder';
import CSVUpload from './components/CSVUpload';
import CreatePlanModal from './components/CreatePlanModal';

import api from './services/api';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [userMode, setUserMode] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [programs, setPrograms] = useState([]);

  const tabs = [
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', icon: FileText },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', icon: Upload }] : []),
  ];

  // Load plans and programs for plan selection
  React.useEffect(() => {
    api.getPlans({}).then(res => setPlans(res.plans || []));
    api.getPrograms().then(res => setPrograms(res.programs || []));
  }, []);

  const handlePlanCreated = () => {
    setIsModalOpen(false);
    api.getPlans({}).then(res => setPlans(res.plans || []));
  };

  // Handler for adding a course to a plan from CourseSearch
  const handleAddToPlan = async (course) => {
    if (!selectedPlanId) {
      alert('Please select a plan first.');
      return;
    }
    // Auto-populate requirement category from program requirements
    const plan = plans.find(p => p.id === selectedPlanId);
    const program = programs.find(p => p.id === plan?.program_id);
    let requirementCategory = 'Elective';
    if (program && program.requirements) {
      // Try to match by course code
      const match = program.requirements.find(r => {
        if (r.groups) {
          return r.groups.some(g => g.course_options && g.course_options.some(opt => opt.course_code === course.code));
        }
        return false;
      });
      if (match) requirementCategory = match.category;
    }
    // Default semester/year
    let semester = 'Fall';
    let year = new Date().getFullYear();
    // Default status
    let status = 'planned';
    try {
      await api.addCourseToPlan(selectedPlanId, {
        course_id: course.id,
        semester,
        year,
        status,
        requirement_category: requirementCategory
      });
      alert(`Course added to plan!\nCategory: ${requirementCategory}\nSemester: ${semester} ${year}\nStatus: ${status}`);
    } catch (error) {
      alert('Failed to add course: ' + error.message);
    }
  };

  // Plan selector for Course Search tab
  const renderPlanSelector = () => (
    <div className="mb-4 flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700">Select Plan:</label>
      <select
        value={selectedPlanId || ''}
        onChange={e => setSelectedPlanId(Number(e.target.value))}
        className="px-2 py-1 border rounded"
      >
        <option value="">-- Choose a plan --</option>
        {plans.map(plan => (
          <option key={plan.id} value={plan.id}>{plan.plan_name} ({plan.student_name})</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header. contains basic portal switching for user login. it just needs authentication. */}
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
          <>
            {renderPlanSelector()}
            <CourseSearch
              planId={selectedPlanId}
              onAddToPlan={handleAddToPlan}
            />
          </>
        )}
        {activeTab === 'plans' && (
          <PlanBuilder
            plans={plans}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            onCreatePlan={() => setIsModalOpen(true)}
            userMode={userMode}
          />
        )}
        {activeTab === 'upload' && <CSVUpload />}
      </main>

      {/* Modal - moved outside of main content for proper z-index */}
      <CreatePlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPlanCreated={handlePlanCreated} 
        userMode={userMode} 
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
            <p>It's a Footer!</p>
            <p className="mt-1"></p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;