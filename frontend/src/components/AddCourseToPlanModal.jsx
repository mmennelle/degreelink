import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Calendar, Target, AlertCircle, CheckCircle, Info, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

// Updated AddCourseToPlanModal with mobile optimization and dark mode
const AddCourseToPlanModal = ({ 
  isOpen, 
  onClose, 
  courses = [], 
  plan,
  program,
  onCoursesAdded 
}) => {
  const initializeCourseData = () => {
    return courses.map(course => {
      let suggestedCategory = course.detectedCategory || 'Free Electives';
      let suggestedGroup = null;

      if (program && program.requirements) {
        const match = program.requirements.find(req => {
          if (req.groups) {
            const groupMatch = req.groups.find(g =>
              g.course_options?.some(opt => opt.course_code === course.code)
            );
            if (groupMatch) {
              suggestedGroup = groupMatch;
              suggestedCategory = req.category;
              return true;
            }
          }
          return false;
        });
      }

      if (['Elective', 'General Elective', 'Free Elective'].includes(suggestedCategory)) {
        suggestedCategory = 'Free Electives';
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

  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const [courseData, setCourseData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [planCourses, setPlanCourses] = useState([]);
  const [requirementStatus, setRequirementStatus] = useState({});
  const [constraintWarnings, setConstraintWarnings] = useState({});
  const [showConstraintWarning, setShowConstraintWarning] = useState(null);
  const [expandedCourses, setExpandedCourses] = useState(() => {
    // Expand first course by default, collapse others on mobile
    return courses.reduce((acc, _, index) => {
      acc[index] = index === 0;
      return acc;
    }, {});
  });
  // Close when clicking the backdrop (outside the dialog)
    const onBackdrop = useCallback((e) => {
      if (e.target === e.currentTarget) onClose?.();
    }, [onClose]);

  // Global settings for bulk operations
  const [applyToAll, setApplyToAll] = useState({
    semester: false,
    year: false,
    status: false,
    requirement_category: false
  });

  const focusFirst = useCallback(() => {
  const root = dialogRef.current;
  if (!root) return;
  const tabbables = root.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  (tabbables[0] || root).focus();
}, []);

useEffect(() => {
  if (!isOpen) return;

  // Save the opener to restore focus later
  restoreFocusRef.current = document.activeElement;

  // Defer focussing to after render
  const t = setTimeout(focusFirst, 0);

  // Key handling for Esc and Tab cycle
  const onKeyDown = (e) => {
    if (!dialogRef.current) return;

    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose?.();
      return;
    }

    if (e.key === 'Tab') {
      const tabbables = dialogRef.current.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (tabbables.length === 0) {
        e.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = tabbables[0];
      const last = tabbables[tabbables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  document.addEventListener('keydown', onKeyDown, true);
  return () => {
    clearTimeout(t);
    document.removeEventListener('keydown', onKeyDown, true);
  };
}, [isOpen, focusFirst, onClose]);

  useEffect(() => {
    if (!isOpen && restoreFocusRef.current instanceof HTMLElement) {
      restoreFocusRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && courses.length > 0) {
      setCourseData(initializeCourseData());
      setErrors([]);
      setApplyToAll({
        semester: false,
        year: false,
        status: false,
        requirement_category: false
      });
      
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

      const categoryCourses = currentCourses.filter(c => 
        c.requirement_category === req.category
      );

      categoryStatus.totalCompleted = categoryCourses.reduce((sum, c) => 
        sum + (c.credits || c.course.credits || 0), 0
      );

      if (req.requirement_type === 'grouped' && req.groups) {
        req.groups.forEach(group => {
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

  const validateCourseAssignment = (courseIndex) => {
    const data = courseData[courseIndex];
    const requirement = program?.requirements?.find(req => 
      req.category === data.requirement_category
    );

    if (!requirement) return { valid: true };

    const categoryStatus = requirementStatus[data.requirement_category];
    if (!categoryStatus) return { valid: true };

    if (categoryStatus.totalCompleted >= categoryStatus.totalRequired) {
      return {
        valid: false,
        error: `${data.requirement_category} requirement already has ${categoryStatus.totalCompleted} of ${categoryStatus.totalRequired} required credits`
      };
    }

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
    
    if (field === 'requirement_category') {
      updated[index].requirement_group_id = null;
    }
    
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

    // Validate basic requirements
    for (let i = 0; i < courseData.length; i++) {
      const validation = validateCourseAssignment(i);
      if (!validation.valid) {
        newErrors.push({
          course: courseData[i].course,
          error: validation.error
        });
      }
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    // Check for constraint violations
    const warnings = {};
    for (let i = 0; i < courseData.length; i++) {
      const data = courseData[i];
      if (plan?.plan_code) {
        try {
          const response = await fetch(`/api/plans/by-code/${plan.plan_code}/validate-course-constraints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              course_id: data.course.id,
              requirement_category: data.requirement_category,
              requirement_group_id: data.requirement_group_id
            })
          });
          if (response.ok) {
            const result = await response.json();
            if (result.violates) {
              warnings[i] = result.violations;
            }
          }
        } catch (error) {
          console.error('Failed to validate constraints:', error);
        }
      }
    }

    // If there are constraint warnings, show them
    if (Object.keys(warnings).length > 0) {
      setConstraintWarnings(warnings);
      setShowConstraintWarning(0); // Show warning for first course
      setLoading(false);
      return;
    }

    // Proceed with adding courses
    await addCoursesToPlan(courseData);
  };

  const addCoursesToPlan = async (courses, overrideConstraints = false) => {
    const newErrors = [];
    
    for (let i = 0; i < courses.length; i++) {
      const data = courses[i];
      // Prepare course data with constraint violation info if overriding
      const courseToAdd = {
        course_id: data.course.id,
        semester: data.semester,
        year: Number(data.year),
        status: data.status,
        requirement_category: data.requirement_category,
        requirement_group_id: data.requirement_group_id || undefined,
        credits: data.course?.credits ?? undefined,
        grade: data.grade || undefined,
        notes: data.notes || undefined
      };

      // If overriding constraints, mark the course as a constraint violation
      if (overrideConstraints && constraintWarnings[i]) {
        courseToAdd.constraint_violation = true;
        courseToAdd.constraint_violation_reason = constraintWarnings[i].map(v => v.description).join('; ');
      }

      try {
        await onCoursesAdded([courseToAdd]);
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
      setConstraintWarnings({});
      setShowConstraintWarning(null);
      onClose();
    }
  };

  const handleConstraintOverride = () => {
    setLoading(true);
    setShowConstraintWarning(null);
    addCoursesToPlan(courseData, true);
  };

  const handleConstraintCancel = () => {
    setConstraintWarnings({});
    setShowConstraintWarning(null);
    setLoading(false);
  };

  const toggleCourseExpansion = (index) => {
    setExpandedCourses(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isOpen) return null;

  const isBulkMode = courses.length > 1;

  return (
    <div
    className="fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
    onMouseDown={onBackdrop}
  >
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-course-title"
      aria-describedby="add-course-description"
      tabIndex={-1}
      className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-md h-[90vh] sm:h-auto overflow-y-auto outline-none transition-colors"
    >
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h3 id="add-course-title" className="text-lg font-semibold text-gray-900 dark:text-white">
              Add {isBulkMode ? `${courses.length} Courses` : 'Course'} to Plan
            </h3>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {plan && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Plan: {plan.plan_name} • {plan.student_name}
            </p>
          )}
        </div>

        {/* Body */}
        <div id="add-course-description" className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Bulk Options */}
          {isBulkMode && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                <Target className="mr-2" size={16} />
                Bulk Settings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.requirement_category}
                    onChange={() => toggleApplyToAll('requirement_category')}
                    className="mr-2 rounded"
                  />
                  <span className="text-blue-700 dark:text-blue-300">Apply same requirement to all</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.semester}
                    onChange={() => toggleApplyToAll('semester')}
                    className="mr-2 rounded"
                  />
                  <span className="text-blue-700 dark:text-blue-300">Apply same semester to all</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.year}
                    onChange={() => toggleApplyToAll('year')}
                    className="mr-2 rounded"
                  />
                  <span className="text-blue-700 dark:text-blue-300">Apply same year to all</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={applyToAll.status}
                    onChange={() => toggleApplyToAll('status')}
                    className="mr-2 rounded"
                  />
                  <span className="text-blue-700 dark:text-blue-300">Apply same status to all</span>
                </label>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {courseData.map((data, index) => {
              const requirement = program?.requirements?.find(req => 
                req.category === data.requirement_category
              );
              const validation = validateCourseAssignment(index);
              const isExpanded = expandedCourses[index];

              return (
                <div key={index} className={`border rounded-lg ${!validation.valid ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'}`}>
                  
                  {/* Course Header - Always Visible */}
                  <div 
                    className="p-4 cursor-pointer"
                    onClick={() => toggleCourseExpansion(index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white flex items-center">
                          <BookOpen className="mr-2 flex-shrink-0" size={16} />
                          <span className="truncate">{data.course.code}: {data.course.title}</span>
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {data.course.credits} credits • {data.course.institution}
                          {data.course.department && ` • ${data.course.department}`}
                        </p>
                        {isBulkMode && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Course {index + 1} of {courses.length}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center ml-4">
                        {!validation.valid && (
                          <AlertCircle className="text-red-500 mr-2" size={16} />
                        )}
                        {isExpanded ? 
                          <ChevronUp className="text-gray-400" size={20} /> : 
                          <ChevronDown className="text-gray-400" size={20} />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Course Details - Collapsible */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-200 dark:border-gray-600">
                      {/* Validation Errors */}
                      {!validation.valid && (
                        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
                          <p className="text-sm text-red-700 dark:text-red-400 flex items-start">
                            <AlertCircle className="mr-1 mt-0.5 flex-shrink-0" size={16} />
                            {validation.error}
                          </p>
                        </div>
                      )}

                      {/* Course Description */}
                      {data.course.description && (
                        <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-md">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {data.course.description}
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Category (read-only) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Requirement Category
                          </label>
                          <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {data.requirement_category || 'N/A'}
                          </div>
                        </div>

                        {/* Group (read-only, if grouped) */}
                        {requirement?.requirement_type === 'grouped' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Specific Group
                            </label>
                            <div className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {(() => {
                                const group = requirement?.groups?.find(g => g.id === data.requirement_group_id);
                                return group ? group.group_name : 'N/A';
                              })()}
                            </div>
                          </div>
                        )}

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Status *
                          </label>
                          <select
                            value={data.status}
                            onChange={(e) => updateCourseField(index, 'status', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={applyToAll.status && index > 0}
                          >
                            <option value="planned">Planned</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </div>

                        {/* Semester */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Semester *
                          </label>
                          <select
                            value={data.semester}
                            onChange={(e) => updateCourseField(index, 'semester', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={applyToAll.semester && index > 0}
                          >
                            <option value="Fall">Fall</option>
                            <option value="Spring">Spring</option>
                            <option value="Summer">Summer</option>
                          </select>
                        </div>

                        {/* Year */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Year *
                          </label>
                          <input
                            type="number"
                            value={data.year}
                            onChange={(e) => updateCourseField(index, 'year', e.target.value)}
                            min="2020"
                            max="2030"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            disabled={applyToAll.year && index > 0}
                          />
                        </div>

                        {/* Grade (if completed) */}
                        {data.status === 'completed' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Grade
                            </label>
                            <input
                              type="text"
                              value={data.grade}
                              onChange={(e) => updateCourseField(index, 'grade', e.target.value)}
                              placeholder="e.g., A, B+, C"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          value={data.notes}
                          onChange={(e) => updateCourseField(index, 'notes', e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="Any additional notes about this course..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-medium text-red-800 dark:text-red-400 mb-1">
                    Cannot add some courses:
                  </h4>
                  <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
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
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="text-sm text-gray-600 dark:text-gray-400 order-2 sm:order-1">
              {isBulkMode && (
                <span className="flex items-center">
                  <Calendar className="mr-1" size={16} />
                  Adding {courses.length} courses to your plan
                </span>
              )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || courseData.some((_, i) => !validateCourseAssignment(i).valid)}
                className="flex-1 sm:flex-none px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 flex items-center justify-center transition-colors"
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

      {/* Constraint Warning Modal */}
      {showConstraintWarning !== null && constraintWarnings[showConstraintWarning] && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="text-orange-500 flex-shrink-0 mt-1" size={24} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Constraint Violation Warning
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  The course <strong>{courseData[showConstraintWarning]?.course?.code}</strong> violates the following constraint(s):
                </p>
                <div className="space-y-2 mb-4">
                  {constraintWarnings[showConstraintWarning].map((violation, idx) => (
                    <div key={idx} className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded p-2">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                        {violation.description}
                      </p>
                      {violation.reason && (
                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                          {violation.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded p-3 mb-4">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> If you continue, this course will be added to your plan but will <strong>NOT count toward your requirement credits</strong> until the constraint is satisfied.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleConstraintCancel}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConstraintOverride}
                className="px-4 py-2 bg-orange-600 dark:bg-orange-700 text-white rounded-md hover:bg-orange-700 dark:hover:bg-orange-800 transition-colors"
              >
                Add Anyway (Won't Count Credits)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCourseToPlanModal;