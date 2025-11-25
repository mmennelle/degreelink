/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState, useEffect } from 'react';
import { Mail, Upload, Trash2, AlertCircle, CheckCircle, UserPlus, Download } from 'lucide-react';
import api from '../services/api';

export default function AppManagementPage() {
  const [advisors, setAdvisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Single email input
  const [singleEmail, setSingleEmail] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  
  // CSV upload
  const [uploadingCSV, setUploadingCSV] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  useEffect(() => {
    loadAdvisors();
  }, []);

  const loadAdvisors = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdvisorWhitelist();
      setAdvisors(data.advisors || []);
    } catch (err) {
      setError(err.message || 'Failed to load advisor whitelist');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingleEmail = async (e) => {
    e.preventDefault();
    if (!singleEmail.trim()) return;

    setAddingEmail(true);
    setError('');
    setSuccess('');
    
    try {
      await api.addAdvisorToWhitelist(singleEmail.trim());
      setSuccess(`Successfully added ${singleEmail} to whitelist`);
      setSingleEmail('');
      loadAdvisors();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to add email');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCSV(true);
    setError('');
    setUploadResult(null);

    try {
      const result = await api.bulkAddAdvisorsToWhitelist(file);
      setUploadResult(result);
      loadAdvisors();
    } catch (err) {
      setError(err.message || 'Failed to upload CSV');
    } finally {
      setUploadingCSV(false);
    }
  };

  const handleRemoveAdvisor = async (advisorId, email) => {
    if (!confirm(`Remove ${email} from the whitelist?`)) return;

    try {
      await api.removeAdvisorFromWhitelist(advisorId);
      setSuccess(`Removed ${email} from whitelist`);
      loadAdvisors();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to remove advisor');
    }
  };

  const downloadTemplate = () => {
    const csv = 'email\nadvisor1@example.edu\nadvisor2@example.edu\nadvisor3@example.edu';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'advisor_whitelist_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">App Management</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage advisor access to the advisor portal
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <div className="flex items-start">
            <CheckCircle className="text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <p className="text-green-800 dark:text-green-300">{success}</p>
          </div>
        </div>
      )}

      {/* Add Single Email */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-4">
          <UserPlus className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Add Single Advisor</h3>
        </div>
        
        <form onSubmit={handleAddSingleEmail} className="flex gap-2">
          <div className="flex-1">
            <input
              type="email"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              placeholder="advisor@university.edu"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              disabled={addingEmail}
            />
          </div>
          <button
            type="submit"
            disabled={addingEmail || !singleEmail.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Mail size={16} />
            {addingEmail ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>

      {/* CSV Upload */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Upload className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Upload (CSV)</h3>
          </div>
          <button
            onClick={downloadTemplate}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <Download size={14} />
            Download Template
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block w-full">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                <p className="text-gray-600 dark:text-gray-400">
                  {uploadingCSV ? 'Uploading...' : 'Click to upload CSV file'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  CSV should have an "email" column
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                disabled={uploadingCSV}
                className="hidden"
              />
            </label>
          </div>

          {uploadResult && (
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Upload Results</h4>
              <div className="text-sm space-y-1">
                <p className="text-green-700 dark:text-green-400">
                  ✓ Added: {uploadResult.total_added} emails
                </p>
                {uploadResult.skipped?.length > 0 && (
                  <p className="text-yellow-700 dark:text-yellow-400">
                    ⚠ Skipped (already exist): {uploadResult.skipped.length}
                  </p>
                )}
                {uploadResult.errors?.length > 0 && (
                  <p className="text-red-700 dark:text-red-400">
                    ✗ Errors: {uploadResult.errors.length}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Advisor List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Whitelisted Advisors ({advisors.length})
          </h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading advisors...
          </div>
        ) : advisors.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No advisors whitelisted yet
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {advisors.map((advisor) => (
              <div
                key={advisor.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Mail className="text-gray-400 dark:text-gray-500" size={16} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {advisor.email}
                      </span>
                      {advisor.is_active && (
                        <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                          Active Session
                        </span>
                      )}
                      {advisor.is_locked && (
                        <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-full">
                          Locked
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Added: {new Date(advisor.added_at).toLocaleDateString()}
                      {advisor.last_login && (
                        <span className="ml-4">
                          Last login: {new Date(advisor.last_login).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveAdvisor(advisor.id, advisor.email)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Remove advisor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2 flex items-center">
          <AlertCircle className="mr-2" size={16} />
          How It Works
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
          <li>• Only whitelisted emails can request access codes for the advisor portal</li>
          <li>• Advisors receive a 6-digit code via email that expires in 15 minutes</li>
          <li>• After 5 failed verification attempts, the account is locked for 30 minutes</li>
          <li>• Sessions last 1 hour before advisors need to re-authenticate</li>
        </ul>
      </div>
    </div>
  );
}
