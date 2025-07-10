import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Target, AlertCircle } from 'lucide-react';

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
      // Use detected category if available, otherwise try to auto-detect
      let suggestedCategory = course.detectedCategory || 'Elective';
      
      if (!course.detectedCategory && program && program.requirements) {
        const match = program.requirements.find(req => {
          if (req.groups) {
            return req.groups.some(g => 
              g.course_options && 
              g.course_options.some(opt => opt.course_code === course.code)
            );
          }
          return false;
        });
        if (match) suggestedCategory = match.category;
      }

      return {
        course,
        requirement_category: suggestedCategory,
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
    }
  }, [isOpen, courses]);

  const updateCourseField = (index, field, value) => {
    const updated = [...courseData];
    updated[index][field] = value;
    
    // If "apply to all" is checked for this field, update all courses
    if (applyToAll[field]) {
      updated.forEach((data, i) => {
        if (i !== index) {
          data[field] = value;
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

          {/* Course Details */}
          <div className="space-y-6">
            {courseData.map((data, index) => (
              <div key={index} className={`border border-gray-200 rounded-lg p-4 ${
                isBulkMode ? 'bg-gray-50' : ''
              }`}>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Requirement Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requirement Category *
                    </label>
                    <select
                      value={data.requirement_category}
                      onChange={(e) => updateCourseField(index, 'requirement_category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={applyToAll.requirement_category && index > 0}
                    >
                      {program?.requirements?.map(req => (
                        <option key={req.category} value={req.category}>
                          {req.category} ({req.credits_required} credits required)
                        </option>
                      ))}
                      <option value="Elective">General Elective</option>
                    </select>
                  </div>

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
            ))}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="text-red-600 mr-2 mt-0.5" size={20} />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">
                    Failed to add some courses:
                  </h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((err, i) => (
                      <li key={i}>
                        {err.course.code}: {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

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
              disabled={loading}
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
  );
};

export default AddCourseToPlanModal;