import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Mail, BookOpen, X } from 'lucide-react';
import api from '../services/api';

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated, userMode = 'student' }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    advisor_email: '',
    plan_name: '',
    current_program_id: '',
    program_id: '', 
  });

  // Add state for programs
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Add state for viewport height to handle iOS keyboard
  const [viewportHeight, setViewportHeight] = useState(() => 
    typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 800
  );

  const dialogRef = useRef(null);
  const restoreFocusRef = useRef(null);

  const focusFirst = useCallback(() => {
    const root = dialogRef.current;
    if (!root) return;
    const tabbables = root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    (tabbables[0] || root).focus();
  }, []);

  // Fetch programs when modal opens
  const fetchPrograms = async () => {
    setLoadingPrograms(true);
    try {
      const response = await api.getPrograms(); // This needs to be implemented in your api service
      const programsList = response.programs || [];
      setPrograms(programsList);
      
      // Set default program_id to the first program if available
      if (programsList.length > 0 && !formData.program_id) {
        setFormData(prev => ({ ...prev, program_id: programsList[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoadingPrograms(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement;
    const t = setTimeout(focusFirst, 0);

    // Fetch programs when modal opens
    fetchPrograms();

    // Handle viewport changes for iOS keyboard
    const handleViewportChange = () => {
      const newHeight = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(newHeight);
    };

    window.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);

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
      window.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, [isOpen, focusFirst, onClose]);

  useEffect(() => {
    if (!isOpen && restoreFocusRef.current instanceof HTMLElement) {
      restoreFocusRef.current.focus();
    }
  }, [isOpen]);

  const onBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ 
        ...prev, 
        student_name: '', 
        plan_name: '', 
        student_email: '',
        current_program_id: programs.length > 0 ? programs[0].id : '',
        program_id: programs.length > 0 ? programs[0].id : ''
      }));
    }
  }, [userMode, isOpen, programs]);

  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student_name.trim()) {
      newErrors.student_name = 'Student name is required';
    }
    
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = 'Plan name is required';
    }

    if (!formData.program_id) {
      newErrors.program_id = 'Please select a program';
    }
    
    if (formData.student_email && !isValidEmail(formData.student_email)) {
      newErrors.student_email = 'Please enter a valid email address';
    }
    
    if (formData.advisor_email && !isValidEmail(formData.advisor_email)) {
      newErrors.advisor_email = 'Please enter a valid advisor email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCreating(true);
    setErrors({});

    try {
      // (Debug logging removed after token issue resolution)
      const createdPlan = await api.createPlan(formData);
      console.debug('createdPlan', createdPlan);

      const plan = createdPlan?.plan ?? createdPlan;
      console.log('About to call onPlanCreated with:', plan);
      console.log('onPlanCreated function exists?', typeof onPlanCreated);
      
      // Reset form data
      setFormData({
        student_name: '',
        student_email: '',
        advisor_email: '',
        plan_name: '',
        current_program_id: programs.length > 0 ? programs[0].id : '',
        program_id: programs.length > 0 ? programs[0].id : '',
      });
      
      onPlanCreated?.(plan);
      
      // Close the modal after a brief delay to allow the success modal to open
      setTimeout(() => {
        onClose();
      }, 100);
      
    } catch (error) {
      console.error('Failed to create plan:', error);
      setErrors({ 
        submit: error.message || 'Failed to create plan. Please try again.' 
      });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const generatePlanName = () => {
    const currentDate = new Date();
    const semester = currentDate.getMonth() >= 8 ? 'Fall' : 
                    currentDate.getMonth() >= 5 ? 'Summer' : 
                    currentDate.getMonth() >= 1 ? 'Spring' : 'Spring';
    const year = currentDate.getMonth() >= 8 ? currentDate.getFullYear() + 1 : currentDate.getFullYear();
    
    const studentFirstName = formData.student_name.split(' ')[0];
    const baseName = studentFirstName ? `${studentFirstName}'s ${semester} ${year} Plan` : `${semester} ${year} Transfer Plan`;
    
    setFormData(prev => ({ ...prev, plan_name: baseName }));
  };

  if (!isOpen) return null;

  const modalMaxHeight = Math.min(viewportHeight * 0.9, 800);

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onMouseDown={onBackdrop}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-plan-title"
        aria-describedby="create-plan-description"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-md overflow-y-auto outline-none transition-colors"
        style={{ 
          maxHeight: `${modalMaxHeight}px`,
          height: 'auto'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create New Academic Plan</h3>
            <button
              onClick={onClose}
              disabled={creating}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 sm:p-6 space-y-5">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline mr-1" size={16} />
              {userMode === 'advisor' ? "Student Name *" : "Your Name *"}
            </label>
            <input
              type="text"
              required
              value={formData.student_name}
              onChange={(e) => handleInputChange('student_name', e.target.value)}
              onBlur={() => {
                if (formData.student_name && !formData.plan_name) {
                  generatePlanName();
                }
              }}
              placeholder={userMode === 'advisor' ? "Enter Student's Full Name" : "Enter Your Name"}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                errors.student_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.student_name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.student_name}</p>
            )}
          </div>

          {/* Student Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline mr-1" size={16} />
              {userMode === 'advisor' ? "Student Email" : "Your Email"}
            </label>
            <input
              type="email"
              value={formData.student_email}
              onChange={(e) => handleInputChange('student_email', e.target.value)}
              placeholder={userMode === 'advisor' ? "student@example.com (optional)" : "your@example.com (optional)"}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                errors.student_email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.student_email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.student_email}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Used for notifications and plan sharing
            </p>
          </div>

          {/* Advisor Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline mr-1" size={16} />
              Advisor Email
            </label>
            <input
              type="email"
              value={formData.advisor_email || ''}
              onChange={(e) => handleInputChange('advisor_email', e.target.value)}
              placeholder="advisor@school.edu(optional)"
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                errors.advisor_email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.advisor_email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.advisor_email}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Link this plan to your advisor for guidance
            </p>
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <BookOpen className="inline mr-1" size={16} />
              Plan Name *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.plan_name}
                onChange={(e) => handleInputChange('plan_name', e.target.value)}
                placeholder="e.g., Fall 2025 Transfer Plan"
                className={`flex-1 px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                  errors.plan_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={generatePlanName}
                disabled={!formData.student_name}
                className="px-3 py-3 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Auto-generate plan name"
              >
                Auto
              </button>
            </div>
            {errors.plan_name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.plan_name}</p>
            )}
          </div>

          {/* Current Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Program
            </label>
            <select
              value={formData.current_program_id}
              onChange={(e) => handleInputChange('current_program_id', parseInt(e.target.value))}
              disabled={loadingPrograms || programs.length === 0}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.current_program_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {loadingPrograms ? (
                <option value="">Loading programs...</option>
              ) : programs.length === 0 ? (
                <option value="">No programs available</option>
              ) : (
                <>
                  <option value="">Select current program (optional)</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.degree_type})
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.current_program_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.current_program_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The program you're currently enrolled in (if applicable)
            </p>
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transfer Target Program *
            </label>
            <select
              value={formData.program_id}
              onChange={(e) => handleInputChange('program_id', parseInt(e.target.value))}
              disabled={loadingPrograms || programs.length === 0}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.program_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {loadingPrograms ? (
                <option value="">Loading programs...</option>
              ) : programs.length === 0 ? (
                <option value="">No programs available</option>
              ) : (
                <>
                  <option value="">Select a program</option>
                  {programs.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.degree_type})
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.program_id && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.program_id}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The program you want to transfer into or complete
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={creating || !formData.student_name.trim() || !formData.plan_name.trim() || !formData.program_id || loadingPrograms}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Plan'
              )}
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="p-4 sm:p-6 pt-0">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">Getting Started</h4>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• Create a plan to organize your course transfer strategy</li>
              <li>• Add courses using the course search after creating your plan</li>
              <li>• Track your progress toward degree completion</li>
              <li>• Share your plan with advisors for review and approval</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;