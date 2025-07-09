import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import api from '../services/api';
import CourseSearch from './CourseSearch';
import ProgressTracker from './ProgressTracker';
import CreatePlanModal from './CreatePlanModal';

const PlanBuilder = ({ onCreatePlan, userMode = 'student' }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [showCourseSearch, setShowCourseSearch] = useState(false);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPlans();
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const response = await api.getPrograms();
      setPrograms(response.programs || []);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  };

  const loadPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.getPlans({});
      setPlans(response.plans || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
      setError('Failed to load plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlanDetails = async (planId) => {
    setLoading(true);
    setError(null);
    
    try {
      const planData = await api.getPlan(planId);
      setSelectedPlan(planData);
    } catch (error) {
      console.error('Failed to load plan details:', error);
      setError('Failed to load plan details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  
  const handleCourseSelect = async (course) => {
    if (!selectedPlan) return;

    
    const program = programs.find(p => p.id === selectedPlan.program_id);
    if (!program) {
      alert('Program information not found');
      return;
    }

    
    showRequirementSelectionModal(course, program.requirements || []);
  };

  const showRequirementSelectionModal = (course, requirements) => {
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-4">Add Course to Plan</h3>
        <div class="mb-4">
          <h4 class="font-medium">${course.code}: ${course.title}</h4>
          <p class="text-sm text-gray-600">${course.credits} credits • ${course.institution}</p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Which requirement does this course satisfy?
          </label>
          <select id="requirement-select" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Select a requirement category...</option>
            ${requirements.map(req => 
              `<option value="${req.category}">${req.category} (${req.credits_required} credits required)</option>`
            ).join('')}
            <option value="Elective">General Elective</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Semester & Year
          </label>
          <div class="grid grid-cols-2 gap-2">
            <select id="semester-select" class="px-3 py-2 border border-gray-300 rounded-md">
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
            <input type="number" id="year-input" value="2024" min="2020" max="2030" 
                   class="px-3 py-2 border border-gray-300 rounded-md">
          </div>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select id="status-select" class="w-full px-3 py-2 border border-gray-300 rounded-md">
            <option value="planned">Planned</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div class="flex justify-end gap-3">
          <button id="cancel-btn" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>
          <button id="add-btn" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Course
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    
    const requirementSelect = modal.querySelector('#requirement-select');
    const semesterSelect = modal.querySelector('#semester-select');
    const yearInput = modal.querySelector('#year-input');
    const statusSelect = modal.querySelector('#status-select');
    const cancelBtn = modal.querySelector('#cancel-btn');
    const addBtn = modal.querySelector('#add-btn');

    cancelBtn.onclick = () => {
      document.body.removeChild(modal);
      setShowCourseSearch(false);
    };

    addBtn.onclick = async () => {
      const requirementCategory = requirementSelect.value;
      const semester = semesterSelect.value;
      const year = parseInt(yearInput.value);
      const status = statusSelect.value;

      if (!requirementCategory) {
        alert('Please select a requirement category');
        return;
      }

      try {
        await api.addCourseToPlan(selectedPlan.id, {
          course_id: course.id,
          semester: semester,
          year: year,
          status: status,
          requirement_category: requirementCategory
        });
        
        
        await loadPlanDetails(selectedPlan.id);
        document.body.removeChild(modal);
        setShowCourseSearch(false);
      } catch (error) {
        console.error('Failed to add course to plan:', error);
        alert(`Failed to add course to plan: ${error.message}`);
      }
    };
  };

  const handlePlanCreated = () => {
    setShowCreatePlan(false);
    loadPlans(); 
  };

  // Handle both internal and external plan creation triggers
  const handleCreatePlan = () => {
    if (onCreatePlan) {
      // Use the external modal from App.jsx
      onCreatePlan();
    } else {
      // Use the internal modal
      setShowCreatePlan(true);
    }
  };

  const updateCourseStatus = async (planCourseId, newStatus) => {
    if (!selectedPlan) return;
    
    try {
      await api.updatePlanCourse(selectedPlan.id, planCourseId, {
        status: newStatus
      });
      
      
      await loadPlanDetails(selectedPlan.id);
    } catch (error) {
      console.error('Failed to update course status:', error);
      alert(`Failed to update course status: ${error.message}`);
    }
  };

  const updateCourseRequirement = async (planCourseId, newRequirement) => {
    if (!selectedPlan) return;
    
    try {
      await api.updatePlanCourse(selectedPlan.id, planCourseId, {
        requirement_category: newRequirement
      });
      
      
      await loadPlanDetails(selectedPlan.id);
    } catch (error) {
      console.error('Failed to update course requirement:', error);
      alert(`Failed to update course requirement: ${error.message}`);
    }
  };

  const removeCourseFromPlan = async (planCourseId) => {
    if (!selectedPlan || !confirm('Are you sure you want to remove this course from the plan?')) return;
    
    try {
      await api.removeCourseFromPlan(selectedPlan.id, planCourseId);
      await loadPlanDetails(selectedPlan.id);
    } catch (error) {
      console.error('Failed to remove course:', error);
      alert(`Failed to remove course: ${error.message}`);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planned':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  
  const groupCoursesByRequirement = (courses) => {
    const grouped = {};
    courses.forEach(course => {
      const category = course.requirement_category || 'Uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(course);
    });
    return grouped;
  };

  const getProgram = () => {
    if (!selectedPlan) return null;
    return programs.find(p => p.id === selectedPlan.program_id);
  };

  if (loading && !selectedPlan && plans.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3">Loading plans...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Plan Builder */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold flex items-center">
            <BookOpen className="mr-2" size={20} />
            Academic Plans
          </h2>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {!selectedPlan ? (
          /* Plans List View */
          <div className="space-y-3">
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
                <p className="text-gray-500 mb-4">Create your first academic plan to get started!</p>
                <button
                  onClick={handleCreatePlan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto"
                >
                  <Plus className="mr-1" size={16} />
                  Create Plan
                </button>
              </div>
            ) : (
              plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="border border-gray-200 rounded-md p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => loadPlanDetails(plan.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-600 mb-1">{plan.plan_name}</h3>
                      <p className="text-sm text-gray-600">{plan.student_name}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded ${getStatusColor(plan.status)}`}>
                          {formatStatus(plan.status)}
                        </span>
                        <span>Created: {new Date(plan.created_at).toLocaleDateString()}</span>
                        {plan.courses && (
                          <span>{plan.courses.length} courses</span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Plan Details View */
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="flex items-center text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                >
                  <ChevronLeft className="mr-1" size={16} />
                  Back to Plans
                </button>
                <h3 className="text-lg font-semibold">{selectedPlan.plan_name}</h3>
                <p className="text-sm text-gray-600">{selectedPlan.student_name}</p>
                {selectedPlan.student_email && (
                  <p className="text-xs text-gray-500">{selectedPlan.student_email}</p>
                )}
                {getProgram() && (
                  <p className="text-xs text-blue-600 mt-1">
                    Target: {getProgram().name} ({getProgram().degree_type}) - {getProgram().institution}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowCourseSearch(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
              >
                <Plus className="mr-1" size={16} />
                Add Course
              </button>
            </div>

            {/* Courses by Requirement Category */}
            <div className="space-y-6">
              <h4 className="font-medium text-gray-800 flex items-center">
                <Target className="mr-2" size={18} />
                Courses by Requirement
              </h4>
              
              {selectedPlan.courses && selectedPlan.courses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-md">
                  <p className="text-gray-500 mb-3">No courses added yet.</p>
                  <button
                    onClick={() => setShowCourseSearch(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add Your First Course
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(groupCoursesByRequirement(selectedPlan.courses || [])).map(([category, courses]) => (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-medium text-gray-800">{category}</h5>
                        <span className="text-sm text-gray-500">
                          {courses.length} course{courses.length !== 1 ? 's' : ''} • {' '}
                          {courses.reduce((sum, c) => sum + (c.credits || c.course.credits || 0), 0)} credits
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        {courses.map((planCourse) => (
                          <div key={planCourse.id} className="bg-gray-50 rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">
                                  {planCourse.course.code}: {planCourse.course.title}
                                </h6>
                                <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
                                  <span>🏫 {planCourse.course.institution}</span>
                                  <span>📚 {planCourse.credits || planCourse.course.credits} credits</span>
                                  {planCourse.semester && planCourse.year && (
                                    <span>📅 {planCourse.semester} {planCourse.year}</span>
                                  )}
                                  {planCourse.grade && (
                                    <span>🎯 Grade: {planCourse.grade}</span>
                                  )}
                                </div>
                                {planCourse.notes && (
                                  <p className="text-sm text-gray-500 mt-2">📝 {planCourse.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-4">
                                <select
                                  value={planCourse.status}
                                  onChange={(e) => updateCourseStatus(planCourse.id, e.target.value)}
                                  className={`px-2 py-1 text-xs rounded border ${getStatusColor(planCourse.status)}`}
                                >
                                  <option value="planned">Planned</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                </select>
                                <select
                                  value={planCourse.requirement_category || ''}
                                  onChange={(e) => updateCourseRequirement(planCourse.id, e.target.value)}
                                  className="px-2 py-1 text-xs rounded border border-gray-300"
                                >
                                  {getProgram()?.requirements?.map(req => (
                                    <option key={req.category} value={req.category}>{req.category}</option>
                                  ))}
                                  <option value="Elective">General Elective</option>
                                </select>
                                <button
                                  onClick={() => removeCourseFromPlan(planCourse.id)}
                                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Progress Tracker - Only show when a plan is selected */}
      {selectedPlan && <ProgressTracker plan={selectedPlan} />}

      {/* Course Search Modal */}
      {showCourseSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Add Course to Plan</h3>
                <button
                  onClick={() => setShowCourseSearch(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6">
              <CourseSearch onCourseSelect={handleCourseSelect} />
            </div>
          </div>
        </div>
      )}

      {/* Internal Create Plan Modal - only show if external modal not provided */}
      {!onCreatePlan && (
        <CreatePlanModal
          isOpen={showCreatePlan}
          onClose={() => setShowCreatePlan(false)}
          onPlanCreated={handlePlanCreated}
          userMode={userMode}
        />
      )}
    </div>
  );
};

export default PlanBuilder;