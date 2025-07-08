import React, { useState } from 'react';
import { Search, FileText, Upload, GraduationCap, Users } from 'lucide-react';
import CourseSearch from './components/CourseSearch';
import PlanBuilder from './components/PlanBuilder';
import CSVUpload from './components/CSVUpload';
import CreatePlanModal from './components/CreatePlanModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [userMode, setUserMode] = useState('student');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tabs = [
    { id: 'search', label: 'Course Search', icon: Search },
    { id: 'plans', label: 'Academic Plans', icon: FileText },
    ...(userMode === 'advisor' ?
    [{ id: 'upload', label: 'CSV Upload', icon: Upload }] : []),
  ];

  const handlePlanCreated = () => {
    // Logic for handling plan creation
    setIsModalOpen(false);
  };

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
        {activeTab === 'search' && <CourseSearch />}
        {activeTab === 'plans' && ( 
          <PlanBuilder
           onCreatePlan={() => setIsModalOpen(true)}
           userMode={userMode}  
          />)}
        {activeTab === 'upload' && <CSVUpload />}
      </main>

      {/* Modal - moved outside of main content for proper z-index */}
      <CreatePlanModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPlanCreated={handlePlanCreated} 
        userMode={userMode} 
      />

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