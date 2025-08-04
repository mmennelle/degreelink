import React, { useState, useEffect } from 'react';
import { User, Mail, BookOpen, X } from 'lucide-react';
import api from '../services/api';

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated, userMode = 'student' }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    plan_name: '',
    program_id: 1, 
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(prev => ({ ...prev, student_name: '', plan_name: '' }));
    }
  }, [userMode, isOpen]);

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
    
    if (formData.student_email && !isValidEmail(formData.student_email)) {
      newErrors.student_email = 'Please enter a valid email address';
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
      await api.createPlan(formData);
      
      setFormData({
        student_name: '',
        student_email: '',
        plan_name: '',
        program_id: 1,
      });
      
      onPlanCreated();
      onClose();
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-md h-[90vh] sm:h-auto overflow-y-auto transition-colors">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
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
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                  errors.plan_name ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              />
              <button
                type="button"
                onClick={generatePlanName}
                disabled={!formData.student_name}
                className="px-3 py-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Auto-generate plan name"
              >
                Auto
              </button>
            </div>
            {errors.plan_name && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.plan_name}</p>
            )}
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Program
            </label>
            <select
              value={formData.program_id}
              onChange={(e) => handleInputChange('program_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
            >
              <option value={1}>Biology Major (BS) - UNO</option>
              {/* This will need to be populated by the api */}
            </select>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The degree program this plan is designed for
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
              disabled={creating || !formData.student_name.trim() || !formData.plan_name.trim()}
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
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">💡 Getting Started</h4>
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