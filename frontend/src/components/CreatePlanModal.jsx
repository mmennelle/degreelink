
import React, { useState } from 'react';
import { User, Mail, BookOpen, X } from 'lucide-react';
import api from '../services/api';

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    plan_name: '',
    program_id: 1, 
  });
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Create New Academic Plan</h3>
          <button
            onClick={onClose}
            disabled={creating}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline mr-1" size={16} />
              Student Name *
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
              placeholder="Enter student's full name"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.student_name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.student_name && (
              <p className="mt-1 text-xs text-red-600">{errors.student_name}</p>
            )}
          </div>

          {/* Student Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline mr-1" size={16} />
              Student Email
            </label>
            <input
              type="email"
              value={formData.student_email}
              onChange={(e) => handleInputChange('student_email', e.target.value)}
              placeholder="student@example.com (optional)"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.student_email ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.student_email && (
              <p className="mt-1 text-xs text-red-600">{errors.student_email}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Optional: Used for notifications and plan sharing
            </p>
          </div>

          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <BookOpen className="inline mr-1" size={16} />
              Plan Name *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={formData.plan_name}
                onChange={(e) => handleInputChange('plan_name', e.target.value)}
                placeholder="e.g., Fall 2024 Transfer Plan"
                className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.plan_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <button
                type="button"
                onClick={generatePlanName}
                disabled={!formData.student_name}
                className="px-3 py-2 text-xs bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Auto-generate plan name"
              >
                Auto
              </button>
            </div>
            {errors.plan_name && (
              <p className="mt-1 text-xs text-red-600">{errors.plan_name}</p>
            )}
          </div>

          {/* Program Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Program
            </label>
            <select
              value={formData.program_id}
              onChange={(e) => handleInputChange('program_id', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={1}>Biology Major (BS) - State University</option>
              {/* In a real app, this would be populated from an API call */}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              The degree program this plan is designed for
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !formData.student_name.trim() || !formData.plan_name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
        </form>

        {/* Help Text */}
        <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-800 mb-1">💡 Getting Started</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Create a plan to organize your course transfer strategy</li>
            <li>• Add courses using the course search after creating your plan</li>
            <li>• Track your progress toward degree completion</li>
            <li>• Share your plan with advisors for review and approval</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePlanModal;