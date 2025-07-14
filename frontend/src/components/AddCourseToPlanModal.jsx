import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Target, AlertCircle, CheckCircle, Info } from 'lucide-react';

const AddCourseToPlanModal = ({ 
  isOpen, 
  onClose, 
  courses = [], // array of courses to add (supports single or multiple)
  plan,
  program,
  onCoursesAdded 
}) => {
  // Initialize form data for each course
  const initializeCourseData = () => {
  return courses.map(course => {
    let suggestedCategory = course.detectedCategory || 'Elective';
    let suggestedGroup = null;

    if (program && program.requirements) {
      // First, find matching category by group membership
      const match = program.requirements.find(req => {
        if (req.groups) {
          const groupMatch = req.groups.find(g =>
            g.course_options?.some(opt => opt.course_code === course.code)
          );
          if (groupMatch) {
            suggestedGroup = groupMatch;
            suggestedCategory = req.category;  // ✅ Always override category if matched
            return true;
          }
        }
        return false;
      });
    }

    return {
      course,
      requirement_category: suggestedCategory,
      requirement_group_id: suggestedGroup?.id || null,
      semester: 'Fall',
      year: new Date().getFullYear(),
      status: 'planned',
      grade: '',
      notes: ''
    };
  });
};


  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [planCourses, setPlanCourses] = useState([]);
  const [requirementStatus, setRequirementStatus] = useState({});
  
  // Global settings for bulk operations
  const [applyToAll, setApplyToAll] = useState({
    semester: false,
    year: false,
    status: false,
    requirement_category: false
  });

  useEffect(() => {
    if (isOpen && courses.length > 0) {
      setCourseData(initializeCourseData());
      setErrors([]);
      // Reset apply to all when modal opens
      setApplyToAll({
        semester: false,
        year: false,
        status: false,
        requirement_category: false
      });
      
      // Load current plan courses to check constraints
      if (plan && plan.courses) {
        setPlanCourses(plan.courses);
        calculateRequirementStatus(plan.courses);
      }
    }
  }, [isOpen, courses, plan]);

  const calculateRequirementStatus = (currentCourses) => {
    if (!program || !program.requirements) return;

    const status = {};
    
    program.requirements.forEach(req => {
      const categoryStatus = {
        category: req.category,
        type: req.requirement_type,
        totalRequired: req.credits_required,
        totalCompleted: 0,
        groups: {}
      };

      // Get courses in this requirement category
      const categoryCourses = currentCourses.filter(c => 
        c.requirement_category === req.category
      );

      // Calculate total credits completed
      categoryStatus.totalCompleted = categoryCourses.reduce((sum, c) => 
        sum + (c.credits || c.course.credits || 0), 0
      );

      // Handle grouped requirements
      if (req.requirement_type === 'grouped' && req.groups) {
        req.groups.forEach(group => {
          // Find courses that match this specific group
          const groupCourses = categoryCourses.filter(planCourse => {
            return group.course_options?.some(opt => 
              opt.course_code === planCourse.course.code
            );
          });

          categoryStatus.groups[group.id] = {
            name: group.group_name,
            coursesRequired: group.courses_required,
            coursesCompleted: groupCourses.length,
            creditsRequired: group.credits_required,
            creditsCompleted: groupCourses.reduce((sum, c) => 
              sum + (c.credits || c.course.credits || 0), 0
            ),
            isFull: false
          };

          // Check if group is full
          if (group.courses_required) {
            categoryStatus.groups[group.id].isFull = 
              groupCourses.length >= group.courses_required;
          } else if (group.credits_required) {
            categoryStatus.groups[group.id].isFull = 
              categoryStatus.groups[group.id].creditsCompleted >= group.credits_required;
          }
        });
      }

      status[req.category] = categoryStatus;
    });

    setRequirementStatus(status);
  };

  const getAvailableGroups = (courseIndex) => {
    const data = courseData[courseIndex];
    if (!data || !program || !program.requirements) return [];

    const requirement = program.requirements.find(req => 
      req.category === data.requirement_category
    );

    if (!requirement || requirement.requirement_type !== 'grouped') return [];

    // Filter groups that:
    // 1. Include this course as an option
    // 2. Are not already full
    return requirement.groups.filter(group => {
      // Check if course is an option in this group
      const isOption = group.course_options?.some(opt => 
        opt.course_code === data.course.code
      );
      if (!isOption) return false;

      // Check if group is full
      const groupStatus = requirementStatus[requirement.category]?.groups[group.id];
      if (!groupStatus) return true; // If no status, assume not full

      return !groupStatus.isFull;
    });
  };

  const validateCourseAssignment = (courseIndex) => {
    const data = courseData[courseIndex];
    const requirement = program?.requirements?.find(req => 
      req.category === data.requirement_category
    );

    if (!requirement) return { valid: true };

    const categoryStatus = requirementStatus[data.requirement_category];
    if (!categoryStatus) return { valid: true };

    // Check if category is already full
    if (categoryStatus.totalCompleted >= categoryStatus.totalRequired) {
      return {
        valid: false,
        error: `${data.requirement_category} requirement already has ${categoryStatus.totalCompleted} of ${categoryStatus.totalRequired} required credits`
      };
    }

    // For grouped requirements, check specific group constraints
    if (requirement.requirement_type === 'grouped' && data.requirement_group_id) {
      const groupStatus = categoryStatus.groups[data.requirement_group_id];
      if (groupStatus && groupStatus.isFull) {
        return {
          valid: false,
          error: `${groupStatus.name} group already has the required ${
            groupStatus.coursesRequired ? 
            `${groupStatus.coursesRequired} course(s)` : 
            `${groupStatus.creditsRequired} credits`
          }`
        };
      }
    }

    return { valid: true };
  };

  const updateCourseField = (index, field, value) => {
    const updated = [...courseData];
    updated[index][field] = value;
    
    // If changing requirement category, reset group selection
    if (field === 'requirement_category') {
      updated[index].requirement_group_id = null;
      
      // Auto-select group if only one available
      const availableGroups = getAvailableGroups(index);
      if (availableGroups.length === 1) {
        updated[index].requirement_group_id = availableGroups[0].id;
      }
    }
    
    // If "apply to all" is checked for this field, update all courses
    if (applyToAll[field]) {
      updated.forEach((data, i) => {
        if (i !== index) {
          data[field] = value;
          if (field === 'requirement_category') {
            data.requirement_group_id = null;
          }
        }
      });
    }
    
    setCourseData(updated);
  };

  const toggleApplyToAll = (field) => {
    const newApplyToAll = { ...applyToAll, [field]: !applyToAll[field] };
    setApplyToAll(newApplyToAll);
    
    // If turning on, apply the first course's value to all
    if (!applyToAll[field] && courseData.length > 0) {
      const value = courseData[0][field];
      const updated = courseData.map(data => ({ ...data, [field]: value }));
      setCourseData(updated);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors([]);
    const newErrors = [];
    const addedCourses = [];

    // Validate all course assignments before submitting
    for (let i = 0; i < courseData.length; i++) {
      const validation = validateCourseAssignment(i);
      if (!validation.valid) {
        newErrors.push({
          course: courseData[i].course,
          error: validation.error
        });
      }
    }
    // If there are validation errors, show them and stop submission
    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Proceed with adding courses
    for (const data of courseData) {
      try {
        await onCoursesAdded([{
          course_id: data.course.id,
          semester: data.semester,
          year: parseInt(data.year),
          status: data.status,
          requirement_category: data.requirement_category,
          grade: data.grade || undefined,
          notes: data.notes || undefined
        }]);
        addedCourses.push(data.course);
      } catch (error) {
        newErrors.push({
          course: data.course,
          error: error.message || 'Failed to add course'
        });
      }
    }

    setLoading(false);

    if (newErrors.length > 0) {
      setErrors(newErrors);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isBulkMode = courses.length > 1;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              Add {isBulkMode ? `${courses.length} Courses` : 'Course'} to Plan
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
          {plan && (
            <p className="text-sm text-gray-600 mt-1">
              Plan: {plan.plan_name} • {plan.student_name}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Bulk Options */}
          {isBulkMode && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                <Target className="mr-2" size={16} />
                Bulk Settings
              </h4>
              <div className="space-y-2 text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.requirement_category}
                    onChange={() => toggleApplyToAll('requirement_category')}
                    className="mr-2"
                  />
                  Apply same requirement category to all courses
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.semester}
                    onChange={() => toggleApplyToAll('semester')}
                    className="mr-2"
                  />
                  Apply same semester to all courses
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.year}
                    onChange={() => toggleApplyToAll('year')}
                    className="mr-2"
                  />
                  Apply same year to all courses
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.status}
                    onChange={() => toggleApplyToAll('status')}
                    className="mr-2"
                  />
                  Apply same status to all courses
                </label>
              </div>
            </div>
          )}

         <div className="space-y-6">
  {courseData.map((data, index) => {
    const requirement = program?.requirements?.find(req => 
      req.category === data.requirement_category
    );
    const validation = validateCourseAssignment(index);

    return (
      <div key={index} className={`border rounded-lg p-4 ${isBulkMode ? 'bg-gray-50' : ''} ${!validation.valid ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}>
        
        {/* Course Info */}
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 flex items-center">
            <BookOpen className="mr-2" size={16} />
            {data.course.code}: {data.course.title}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {data.course.credits} credits • {data.course.institution}
            {data.course.department && ` • ${data.course.department}`}
          </p>
          {data.course.description && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2">
              {data.course.description}
            </p>
          )}
        </div>

        {/* Validation Warnings */}
        {validation.warnings && validation.warnings.length > 0 && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-300 rounded text-yellow-800 text-sm">
            <div className="flex items-center mb-1 font-medium">
              <AlertCircle className="mr-1" size={16} />
              Warning
            </div>
            <ul className="list-disc pl-4">
              {validation.warnings.map((warn, idx) => (
                <li key={idx}>{warn}</li>
              ))}
            </ul>
          </div>
        )}

        {!validation.valid && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 rounded-md">
            <p className="text-sm text-red-700 flex items-start">
              <AlertCircle className="mr-1 mt-0.5 flex-shrink-0" size={16} />
              {validation.error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirement Category
            </label>
            <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
              {data.requirement_category || 'N/A'}
            </p>
          </div>

          {/* Group (read-only, if grouped) */}
          {requirement?.requirement_type === 'grouped' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specific Group
              </label>
              <p className="px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700">
                {(() => {
                  const group = requirement?.groups?.find(g => g.id === data.requirement_group_id);
                  return group ? group.group_name : 'N/A';
                })()}
              </p>
              {data.requirement_group_id && (
                <p className="text-xs text-gray-600 mt-1">
                  {(() => {
                    const group = requirement?.groups?.find(g => g.id === data.requirement_group_id);
                    const status = requirementStatus[data.requirement_category]?.groups[group?.id];
                    if (!group) return null;
                    return group.courses_required ?
                      `This group requires ${group.courses_required} courses. Currently has ${status?.coursesCompleted || 0}.` :
                      `This group requires ${group.credits_required} credits. Currently has ${status?.creditsCompleted || 0}.`;
                  })()}
                </p>
              )}
            </div>
          )}

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={data.status}
              onChange={(e) => updateCourseField(index, 'status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={applyToAll.status && index > 0}
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester *
            </label>
            <select
              value={data.semester}
              onChange={(e) => updateCourseField(index, 'semester', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={applyToAll.semester && index > 0}
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Year *
            </label>
            <input
              type="number"
              value={data.year}
              onChange={(e) => updateCourseField(index, 'year', e.target.value)}
              min="2020"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={applyToAll.year && index > 0}
            />
          </div>

          {/* Grade (if completed) */}
          {data.status === 'completed' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade
              </label>
              <input
                type="text"
                value={data.grade}
                onChange={(e) => updateCourseField(index, 'grade', e.target.value)}
                placeholder="e.g., A, B+, C"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => updateCourseField(index, 'notes', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any additional notes about this course..."
          />
        </div>
      </div>
    );
  })}
</div>

{/* Errors */}
{errors.length > 0 && (
  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
    <div className="flex items-start">
      <AlertCircle className="text-red-600 mr-2 mt-0.5" size={20} />
      <div>
        <h4 className="font-medium text-red-800 mb-1">
          Cannot add some courses:
        </h4>
        <ul className="text-sm text-red-700 space-y-1">
          {errors.map((err, i) => (
            <li key={i}>
              <strong>{err.course.code}:</strong> {err.error}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
)}

{/* Footer */}
<div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
  <div className="text-sm text-gray-600">
    {isBulkMode && (
      <span className="flex items-center">
        <Calendar className="mr-1" size={16} />
        Adding {courses.length} courses to your plan
      </span>
    )}
  </div>
  <div className="flex gap-3">
    <button
      onClick={onClose}
      disabled={loading}
      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
    >
      Cancel
    </button>
    <button
      onClick={handleSubmit}
      disabled={loading || courseData.some((_, i) => !validateCourseAssignment(i).valid)}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Adding...
        </>
      ) : (
        `Add ${isBulkMode ? 'All Courses' : 'Course'}`
      )}
    </button>
  </div>
</div>

      </div>
    </div>
  </div>
  );
};

export default AddCourseToPlanModal;