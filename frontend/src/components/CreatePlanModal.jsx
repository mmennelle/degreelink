/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Mail, BookOpen, X, FileUp, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import api from '../services/api';

const CreatePlanModal = ({ isOpen, onClose, onPlanCreated, userMode = 'student' }) => {
  const [formData, setFormData] = useState({
    student_name: '',
    student_email: '',
    advisor_email: '',
    plan_name: '',
    current_program_id: '',
    program_id: '', 
    current_institution: '',
    target_institution: '',
  });

  // Add state for programs
  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(false);

  // Derive distinct institution list and filtered programs from the full list
  const institutions = [...new Set(programs.map(p => p.institution).filter(Boolean))].sort();
  const currentPrograms = formData.current_institution
    ? programs.filter(p => p.institution === formData.current_institution)
    : programs;
  const targetPrograms = formData.target_institution
    ? programs.filter(p => p.institution === formData.target_institution)
    : programs;

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
        current_institution: '',
        target_institution: '',
        current_program_id: '',
        program_id: ''
      }));
      setTranscriptEnabled(false);
      setTranscriptFile(null);
      setImportResult(null);
    }
  }, [userMode, isOpen]);

  const [creating, setCreating] = useState(false);
  const [errors, setErrors] = useState({});

  // Transcript upload state
  const [transcriptEnabled, setTranscriptEnabled] = useState(false);
  const [transcriptFile, setTranscriptFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student_name.trim()) {
      newErrors.student_name = 'Student name is required';
    }

    if (!formData.student_email || !formData.student_email.trim()) {
      newErrors.student_email = 'Email is required';
    } else if (!isValidEmail(formData.student_email)) {
      newErrors.student_email = 'Please enter a valid email address';
    }
    
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = 'Plan name is required';
    }

    if (!formData.current_institution) {
      newErrors.current_institution = 'Please select your current institution';
    }

    if (!formData.target_institution) {
      newErrors.target_institution = 'Please select the transfer target institution';
    }

    if (!formData.program_id) {
      newErrors.program_id = 'Please select a target program';
    }
    
    if (formData.advisor_email && !isValidEmail(formData.advisor_email)) {
      newErrors.advisor_email = 'Please enter a valid advisor email address';
    }

    // Build a summary of missing required fields for the submit error banner
    const missingFields = [];
    if (newErrors.student_name) missingFields.push('Name');
    if (newErrors.student_email) missingFields.push('Email');
    if (newErrors.plan_name) missingFields.push('Plan Name');
    if (newErrors.current_institution) missingFields.push('Current Institution');
    if (newErrors.target_institution) missingFields.push('Target Institution');
    if (newErrors.program_id) missingFields.push('Target Program');
    if (missingFields.length > 0) {
      newErrors.submit = `Please fill in the required fields: ${missingFields.join(', ')}`;
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
      const createdPlan = await api.createPlan(formData);
      const plan = createdPlan?.plan ?? createdPlan;

      // Set the plan code so subsequent requests include the X-Plan-Code header
      if (plan?.plan_code) {
        api.setPlanCode(plan.plan_code);
      }

      // If transcript file was selected, import it into the new plan
      let transcriptResult = null;
      if (transcriptEnabled && transcriptFile && plan?.id) {
        setImporting(true);
        try {
          transcriptResult = await api.importTranscript(plan.id, transcriptFile);
          setImportResult(transcriptResult);
        } catch (importErr) {
          console.error('Transcript import failed:', importErr);
          setImportResult({ error: importErr.message || 'Transcript import failed' });
        } finally {
          setImporting(false);
        }
      }

      // Reset form data
      setFormData({
        student_name: '',
        student_email: '',
        advisor_email: '',
        plan_name: '',
        current_institution: '',
        target_institution: '',
        current_program_id: '',
        program_id: '',
      });
      setTranscriptFile(null);
      setTranscriptEnabled(false);

      onPlanCreated?.(plan);

      // If we got a transcript result, keep modal open briefly to show it
      if (transcriptResult && !transcriptResult.error) {
        // Auto-close after 3 seconds so user can see the summary
        setTimeout(() => {
          setImportResult(null);
          onClose();
        }, 3000);
      } else {
        setTimeout(() => {
          setImportResult(null);
          onClose();
        }, 100);
      }

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
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      // Clear dependent program selection when institution changes
      if (field === 'current_institution') next.current_program_id = '';
      if (field === 'target_institution') next.program_id = '';
      return next;
    });
    
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
            <label htmlFor="student-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <User className="inline mr-1" size={16} aria-hidden="true" />
              {userMode === 'advisor' ? "Student Name *" : "Your Name *"}
            </label>
            <input
              id="student-name"
              type="text"
              required
              aria-required="true"
              aria-invalid={errors.student_name ? "true" : "false"}
              aria-describedby={errors.student_name ? "student-name-error" : "student-name-desc"}
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
              <p id="student-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.student_name}</p>
            )}
          </div>

          {/* Student Email */}
          <div>
            <label htmlFor="student-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline mr-1" size={16} aria-hidden="true" />
              {userMode === 'advisor' ? "Student Email *" : "Your Email *"}
            </label>
            <input
              id="student-email"
              type="email"
              required
              aria-required="true"
              aria-invalid={errors.student_email ? "true" : "false"}
              aria-describedby={errors.student_email ? "student-email-error" : "student-email-desc"}
              value={formData.student_email}
              onChange={(e) => handleInputChange('student_email', e.target.value)}
              placeholder={userMode === 'advisor' ? "student@example.com" : "your@example.com"}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                errors.student_email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.student_email && (
              <p id="student-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.student_email}</p>
            )}
            <p id="student-email-desc" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Used for notifications and plan sharing
            </p>
          </div>

          {/* Advisor Email */}
          <div>
            <label htmlFor="advisor-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="inline mr-1" size={16} aria-hidden="true" />
              Advisor Email
            </label>
            <input
              id="advisor-email"
              type="email"
              aria-invalid={errors.advisor_email ? "true" : "false"}
              aria-describedby={errors.advisor_email ? "advisor-email-error" : "advisor-email-desc"}
              value={formData.advisor_email || ''}
              onChange={(e) => handleInputChange('advisor_email', e.target.value)}
              placeholder="advisor@school.edu(optional)"
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors ${
                errors.advisor_email ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            />
            {errors.advisor_email && (
              <p id="advisor-email-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.advisor_email}</p>
            )}
            <p id="advisor-email-desc" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Optional: Link this plan to your advisor for guidance
            </p>
          </div>

          {/* Plan Name */}
          <div>
            <label htmlFor="plan-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <BookOpen className="inline mr-1" size={16} aria-hidden="true" />
              Plan Name *
            </label>
            <div className="flex gap-2">
              <input
                id="plan-name"
                type="text"
                required
                aria-required="true"
                aria-invalid={errors.plan_name ? "true" : "false"}
                aria-describedby={errors.plan_name ? "plan-name-error" : undefined}
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
                aria-label="Auto-generate plan name"
                className="px-3 py-3 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Auto-generate plan name"
              >
                Auto
              </button>
            </div>
            {errors.plan_name && (
              <p id="plan-name-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.plan_name}</p>
            )}
          </div>

          {/* Current Institution Selection */}
          <div>
            <label htmlFor="current-institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Institution *
            </label>
            <select
              id="current-institution"
              required
              aria-required="true"
              aria-invalid={errors.current_institution ? "true" : "false"}
              aria-describedby={errors.current_institution ? "current-institution-error" : undefined}
              value={formData.current_institution}
              onChange={(e) => handleInputChange('current_institution', e.target.value)}
              disabled={loadingPrograms}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.current_institution ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Select your current institution</option>
              {institutions.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
            {errors.current_institution && (
              <p id="current-institution-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.current_institution}</p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Select your current school to filter programs
            </p>
          </div>

          {/* Current Program Selection */}
          <div>
            <label htmlFor="current-program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Program
            </label>
            <select
              id="current-program"
              aria-invalid={errors.current_program_id ? "true" : "false"}
              aria-describedby={errors.current_program_id ? "current-program-error" : "current-program-desc"}
              value={formData.current_program_id}
              onChange={(e) => handleInputChange('current_program_id', parseInt(e.target.value))}
              disabled={loadingPrograms || currentPrograms.length === 0}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.current_program_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {loadingPrograms ? (
                <option value="">Loading programs...</option>
              ) : currentPrograms.length === 0 ? (
                <option value="">No programs available</option>
              ) : (
                <>
                  <option value="">Select current program (optional)</option>
                  {currentPrograms.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.degree_type})
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.current_program_id && (
              <p id="current-program-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.current_program_id}</p>
            )}
            <p id="current-program-desc" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The program you're currently enrolled in (if applicable)
            </p>
          </div>

          {/* Target Institution Selection */}
          <div>
            <label htmlFor="target-institution" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transfer Target Institution *
            </label>
            <select
              id="target-institution"
              required
              aria-required="true"
              aria-invalid={errors.target_institution ? "true" : "false"}
              aria-describedby={errors.target_institution ? "target-institution-error" : undefined}
              value={formData.target_institution}
              onChange={(e) => handleInputChange('target_institution', e.target.value)}
              disabled={loadingPrograms}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.target_institution ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <option value="">Select target institution</option>
              {institutions.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>
            {errors.target_institution && (
              <p id="target-institution-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.target_institution}</p>
            )}
          </div>

          {/* Program Selection */}
          <div>
            <label htmlFor="target-program" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Transfer Target Program *
            </label>
            <select
              id="target-program"
              aria-required="true"
              aria-invalid={errors.program_id ? "true" : "false"}
              aria-describedby={errors.program_id ? "target-program-error" : "target-program-desc"}
              value={formData.program_id}
              onChange={(e) => handleInputChange('program_id', parseInt(e.target.value))}
              disabled={loadingPrograms || targetPrograms.length === 0}
              className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.program_id ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {loadingPrograms ? (
                <option value="">Loading programs...</option>
              ) : targetPrograms.length === 0 ? (
                <option value="">No programs available</option>
              ) : (
                <>
                  <option value="">Select a program</option>
                  {targetPrograms.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.name} ({program.degree_type})
                    </option>
                  ))}
                </>
              )}
            </select>
            {errors.program_id && (
              <p id="target-program-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">{errors.program_id}</p>
            )}
            <p id="target-program-desc" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The program you want to transfer into or complete
            </p>
          </div>

          {/* Transcript Upload (Optional) */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={transcriptEnabled}
                onChange={(e) => {
                  setTranscriptEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setTranscriptFile(null);
                    setImportResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
              />
              <FileUp size={16} className="text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Import courses from transcript
              </span>
            </label>

            {transcriptEnabled && (
              <div className="mt-3 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.pdf"
                  onChange={(e) => setTranscriptFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-blue-900/40 dark:file:text-blue-300
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60
                    transition-colors"
                />
                {transcriptFile && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Selected: {transcriptFile.name} ({(transcriptFile.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Upload a Workday "View My Academic Record" CSV export or a text-based transcript PDF.
                  Courses will be matched against the database and added to your plan.
                </p>
              </div>
            )}
          </div>

          {/* Transcript Import Progress */}
          {importing && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">Importing courses from transcript...</span>
            </div>
          )}

          {/* Transcript Import Results */}
          {importResult && !importResult.error && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {importResult.message}
                </span>
              </div>
              {importResult.added?.length > 0 && (
                <details className="text-xs text-green-700 dark:text-green-400">
                  <summary className="cursor-pointer font-medium">
                    {importResult.added.length} course(s) added
                  </summary>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {importResult.added.map((c, i) => (
                      <li key={i}>{c.code} — {c.title} ({c.grade})</li>
                    ))}
                  </ul>
                </details>
              )}
              {importResult.skipped?.length > 0 && (
                <details className="text-xs text-yellow-700 dark:text-yellow-400">
                  <summary className="cursor-pointer font-medium flex items-center gap-1">
                    <AlertTriangle size={12} /> {importResult.skipped.length} skipped (already in plan)
                  </summary>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {importResult.skipped.map((c, i) => (
                      <li key={i}>{c.code} — {c.title}</li>
                    ))}
                  </ul>
                </details>
              )}
              {importResult.not_found?.length > 0 && (
                <details className="text-xs text-gray-600 dark:text-gray-400">
                  <summary className="cursor-pointer font-medium flex items-center gap-1">
                    <XCircle size={12} /> {importResult.not_found.length} not found in database
                  </summary>
                  <ul className="mt-1 ml-4 space-y-0.5">
                    {importResult.not_found.map((c, i) => (
                      <li key={i}>{c.code} — {c.title}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
          {importResult?.error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">Transcript import failed: {importResult.error}</p>
            </div>
          )}

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
              disabled={creating || importing || !formData.student_name.trim() || !formData.plan_name.trim() || !formData.program_id || loadingPrograms}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {creating || importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {importing ? 'Importing transcript...' : 'Creating...'}
                </>
              ) : (
                transcriptEnabled && transcriptFile ? 'Create Plan & Import' : 'Create Plan'
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