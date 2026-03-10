/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 * 
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { FileUp, X, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import api from '../services/api';

const ImportTranscriptModal = ({ isOpen, onClose, plan, onImported }) => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const dialogRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFile(null);
      setResult(null);
      setError(null);
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') { onClose?.(); return; }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen, onClose]);

  const handleImport = useCallback(async () => {
    if (!file || !plan?.id) return;
    setImporting(true);
    setError(null);
    setResult(null);
    try {
      // Ensure plan code is set for authorization
      if (plan?.plan_code) {
        api.setPlanCode(plan.plan_code);
      }
      const res = await api.importTranscript(plan.id, file);
      setResult(res);
      onImported?.();
    } catch (err) {
      setError(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  }, [file, plan, onImported]);

  const handleClose = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
    onClose?.();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-transcript-title"
        tabIndex={-1}
        className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-lg overflow-y-auto outline-none transition-colors"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
          <div className="flex justify-between items-center">
            <h3 id="import-transcript-title" className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileUp size={20} />
              Import Transcript
            </h3>
            <button
              onClick={handleClose}
              disabled={importing}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          {plan && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Importing into: <span className="font-medium text-gray-700 dark:text-gray-300">{plan.plan_name}</span>
            </p>
          )}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* File picker */}
          {!result && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select transcript file
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.pdf"
                  onChange={(e) => { setFile(e.target.files?.[0] || null); setError(null); }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0
                    file:text-sm file:font-medium
                    file:bg-blue-50 file:text-blue-700
                    dark:file:bg-blue-900/40 dark:file:text-blue-300
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-900/60
                    transition-colors"
                />
                {file && (
                  <p className="mt-2 text-xs text-green-600 dark:text-green-400">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md">
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  <strong>Recommended:</strong> Export your academic record from Workday as a CSV.
                  Navigate to <em>Academics → View My Academic Record</em>, then use the export/download option.
                  Text-based transcript PDFs are also supported.
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-md">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {result && !result.error && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                <CheckCircle size={18} className="text-green-600 dark:text-green-400 flex-shrink-0" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  {result.message}
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total courses found in file: <strong>{result.total_parsed}</strong>
              </div>

              {result.added?.length > 0 && (
                <details open className="text-xs">
                  <summary className="cursor-pointer font-medium text-green-700 dark:text-green-400">
                    <CheckCircle size={12} className="inline mr-1" />
                    {result.added.length} added
                  </summary>
                  <ul className="mt-1 ml-5 space-y-0.5 text-gray-700 dark:text-gray-300">
                    {result.added.map((c, i) => (
                      <li key={i}>{c.code} — {c.title} {c.grade ? `(${c.grade})` : ''}</li>
                    ))}
                  </ul>
                </details>
              )}

              {result.skipped?.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle size={12} className="inline mr-1" />
                    {result.skipped.length} skipped (already in plan)
                  </summary>
                  <ul className="mt-1 ml-5 space-y-0.5 text-gray-600 dark:text-gray-400">
                    {result.skipped.map((c, i) => (
                      <li key={i}>{c.code} — {c.title}</li>
                    ))}
                  </ul>
                </details>
              )}

              {result.not_found?.length > 0 && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium text-gray-600 dark:text-gray-400">
                    <XCircle size={12} className="inline mr-1" />
                    {result.not_found.length} not found in database
                  </summary>
                  <ul className="mt-1 ml-5 space-y-0.5 text-gray-500 dark:text-gray-500">
                    {result.not_found.map((c, i) => (
                      <li key={i}>
                        {c.code} — {c.title}
                        {c.originating && <span className="italic ml-1">(from {c.originating})</span>}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
          {result ? (
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors text-sm"
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={handleClose}
                disabled={importing}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors text-sm"
              >
                {importing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <FileUp size={16} className="mr-1" />
                    Import
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportTranscriptModal;
