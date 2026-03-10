/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState, useCallback } from 'react';
import { X, BookOpen, Calendar, CheckCircle, Clock, AlertCircle, Trash2 } from 'lucide-react';
import api from '../services/api';

export default function ViewAllCoursesModal({ isOpen, onClose, plan, onCoursesRemoved }) {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const courses = plan?.courses || [];
  const allIds = courses.map(pc => pc.id).filter(Boolean);
  const allSelected = allIds.length > 0 && allIds.every(id => selectedIds.has(id));
  const someSelected = selectedIds.size > 0;

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Remove ${count} course${count > 1 ? 's' : ''} from this plan? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await api.bulkRemoveCoursesFromPlan(plan.id, [...selectedIds]);
      setSelectedIds(new Set());
      onCoursesRemoved?.();
    } catch (e) {
      alert(`Failed to remove courses: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    setSelectedIds(new Set());
    onClose();
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'planned':
        return <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Planned';
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[85vh] overflow-hidden transition-colors flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-600 px-4 sm:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {courses.length > 0 && (
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                title={allSelected ? 'Deselect all' : 'Select all'}
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Courses in Plan</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {courses.length} {courses.length === 1 ? 'course' : 'courses'} total
                {someSelected && ` · ${selectedIds.size} selected`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {someSelected && (
              <button
                onClick={handleBulkDelete}
                disabled={deleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 rounded-md disabled:opacity-50 transition-colors"
              >
                {deleting ? (
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white" />
                ) : (
                  <Trash2 size={14} />
                )}
                Remove ({selectedIds.size})
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          {courses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No courses in this plan yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((planCourse, index) => {
                const course = planCourse.course;
                if (!course) return null;

                return (
                  <div
                    key={planCourse.id || index}
                    className={`border rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors ${
                      selectedIds.has(planCourse.id)
                        ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                      {/* Checkbox + Course Info */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(planCourse.id)}
                          onChange={() => toggleOne(planCourse.id)}
                          className="w-4 h-4 mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-2">
                          {getStatusIcon(planCourse.status)}
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {course.code}: {course.title}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {course.institution} • {course.credits} credit{course.credits !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>

                        {course.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {course.description}
                          </p>
                        )}

                        {/* Plan Details */}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {planCourse.requirement_category && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                              {planCourse.requirement_category}
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                            {formatStatus(planCourse.status)}
                          </span>
                          {planCourse.semester && planCourse.year && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                              <Calendar className="w-3 h-3 mr-1" />
                              {planCourse.semester} {planCourse.year}
                            </span>
                          )}
                          {planCourse.grade && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                              Grade: {planCourse.grade}
                            </span>
                          )}
                        </div>

                        {planCourse.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">
                            Note: {planCourse.notes}
                          </p>
                        )}

                        {planCourse.constraint_violation && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-red-600 dark:text-red-400">
                            <AlertCircle className="w-3 h-3" />
                            {planCourse.constraint_violation_reason || 'Constraint violation'}
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 px-4 sm:px-6 py-4">
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-md hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
