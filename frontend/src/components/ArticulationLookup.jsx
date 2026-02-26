/**
 * Degree Link - Course Equivalency and Transfer Planning System
 * Copyright (c) 2025 University of New Orleans - Computer Science Department
 * Author: Mitchell Mennelle
 *
 * This file is part of Degree Link.
 * Licensed under the MIT License. See LICENSE file in the project root.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, ArrowRightLeft, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const EQUIV_TYPE_LABELS = {
  articulation: 'Direct Equivalent',
  subject_area: 'Subject Area Credit',
};

const EQUIV_TYPE_COLORS = {
  articulation: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  subject_area: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function InstitutionGrid({ crossInstitution, highlightKey }) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_SHOW = 12;
  const sorted = [...crossInstitution].sort((a, b) =>
    a.institution_key.localeCompare(b.institution_key)
  );
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_SHOW);

  if (!crossInstitution.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        No cross-institution data loaded yet. Upload the articulation matrix CSV to populate.
      </p>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {visible.map((item) => {
          const isHighlight = item.institution_key === highlightKey;
          const typeColor = EQUIV_TYPE_COLORS[item.equivalency_type] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
          return (
            <div
              key={`${item.institution_key}-${item.course_code}`}
              className={`p-3 rounded-lg border ${
                isHighlight
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate">
                    {item.institution_key}
                  </p>
                  <p className="font-mono font-bold text-sm text-gray-900 dark:text-white">
                    {item.course_code === `${item.course_code.split(' ')[0]} ***`
                      ? <span className="text-yellow-600 dark:text-yellow-400">{item.course_code}</span>
                      : item.course_code}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {item.institution_name}
                  </p>
                </div>
                <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${typeColor}`}>
                  {item.equivalency_type === 'subject_area' ? 'Subject' : `${item.credits} cr`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length > INITIAL_SHOW && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="mt-3 flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          {expanded ? 'Show fewer' : `Show ${sorted.length - INITIAL_SHOW} more institutions`}
        </button>
      )}
    </div>
  );
}

function ValidationBadge({ validation }) {
  if (!validation) return null;
  if (validation.consistent) {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
        <CheckCircle size={12} />
        Consistent with BoR matrix
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
      <AlertCircle size={12} />
      {validation.mismatches.length} mapping conflict{validation.mismatches.length !== 1 ? 's' : ''}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ArticulationLookup() {
  const [institutions, setInstitutions] = useState([]);
  const [instLoading, setInstLoading] = useState(true);

  // Form state — lookup by local course
  const [searchMode, setSearchMode] = useState('local'); // 'local' | 'ccn'
  const [courseCode, setCourseCode] = useState('');
  const [institution, setInstitution] = useState('');
  const [ccnInput, setCcnInput] = useState('');

  // Results state
  const [results, setResults] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  // Admin validation panel
  const [validation, setValidation]       = useState(null);
  const [validating, setValidating]       = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  // ---- Load institutions list on mount ----
  useEffect(() => {
    api.getArticulationInstitutions()
      .then(data => {
        setInstitutions(data.institutions || []);
      })
      .catch(() => {
        // Not fatal — user can still type the institution name
      })
      .finally(() => setInstLoading(false));
  }, []);

  // ---- Lookup handler ----
  const handleLookup = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setResults(null);

    if (searchMode === 'local' && (!courseCode.trim() || !institution.trim())) {
      setError('Please enter both a course code and select an institution.');
      return;
    }
    if (searchMode === 'ccn' && !ccnInput.trim()) {
      setError('Please enter a CCN code.');
      return;
    }

    setLoading(true);
    try {
      const params = searchMode === 'ccn'
        ? { ccn: ccnInput.trim().toUpperCase() }
        : { course_code: courseCode.trim().toUpperCase(), institution: institution.trim() };

      const data = await api.lookupArticulation(params);
      setResults(data);
    } catch (err) {
      setError(err.message || 'Lookup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchMode, courseCode, institution, ccnInput]);

  // ---- Validation handler (advisor) ----
  const handleValidate = useCallback(async () => {
    setValidating(true);
    try {
      const data = await api.validateArticulation();
      setValidation(data);
      setShowValidation(true);
    } catch (err) {
      setError(err.message || 'Validation failed.');
    } finally {
      setValidating(false);
    }
  }, []);

  // ---- Resolved institution key for highlight ----
  const resolvedInstKey = institutions.find(
    i => i.name.toLowerCase() === institution.toLowerCase() || i.key.toLowerCase() === institution.toLowerCase()
  )?.key || '';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-1">
          <ArrowRightLeft size={20} className="text-indigo-500" />
          Louisiana Articulation Lookup
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Look up a course's Common Course Number (CCN) and see how it transfers to all
          Louisiana public institutions via the Board of Regents articulation matrix.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setSearchMode('local'); setResults(null); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchMode === 'local'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            By Local Course
          </button>
          <button
            onClick={() => { setSearchMode('ccn'); setResults(null); setError(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              searchMode === 'ccn'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            By CCN
          </button>
        </div>

        <form onSubmit={handleLookup} className="space-y-4">
          {searchMode === 'local' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={e => setCourseCode(e.target.value)}
                  placeholder="e.g. ACCT 205"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Institution
                </label>
                {instLoading ? (
                  <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-md animate-pulse" />
                ) : (
                  <select
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select institution…</option>
                    {institutions.map(inst => (
                      <option key={inst.key} value={inst.name}>{inst.key} — {inst.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Common Course Number (CCN)
              </label>
              <input
                type="text"
                value={ccnInput}
                onChange={e => setCcnInput(e.target.value)}
                placeholder="e.g. CACC 2113"
                className="w-full sm:w-72 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Format: C + 3-letter subject + 4-digit code (e.g. CMAT 1103, CBIO 1013)
              </p>
            </div>
          )}

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={15} /> {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg font-medium transition-colors"
          >
            <Search size={16} />
            {loading ? 'Looking up…' : 'Look Up'}
          </button>
        </form>
      </div>

      {/* Results */}
      {results && (
        <div className="space-y-4">
          {results.message && !results.results?.length && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <Info size={18} />
              <p className="text-sm">{results.message}</p>
            </div>
          )}

          {(results.results || []).map((result, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">

              {/* CCN Header */}
              <div className="bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-100 dark:border-indigo-800 px-6 py-4">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div>
                    <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-0.5">
                      Common Course Number (Louisiana Board of Regents)
                    </p>
                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                      {result.ccn.code}
                    </p>
                    <p className="text-base text-gray-700 dark:text-gray-300 mt-0.5">
                      {result.ccn.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {result.ccn.credits} credit hour{result.ccn.credits !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ValidationBadge validation={result.validation} />
                </div>

                {/* Mismatch warnings */}
                {result.validation && !result.validation.consistent && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2 flex items-center gap-1">
                      <AlertCircle size={14} /> Mapping Conflicts Detected
                    </p>
                    <ul className="space-y-1">
                      {result.validation.mismatches.map((m, i) => (
                        <li key={i} className="text-xs text-red-600 dark:text-red-400">
                          Equivalency #{m.equiv_id}: <strong>{m.from_course}</strong> ↔ <strong>{m.to_course}</strong>
                          {m.to_course_ccn && <> — target maps to <strong>{m.to_course_ccn}</strong> instead</>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Cross-institution grid */}
              <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Equivalents at All Louisiana Institutions
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    ({result.cross_institution.length} mapped)
                  </span>
                </h3>
                <InstitutionGrid
                  crossInstitution={result.cross_institution}
                  highlightKey={resolvedInstKey}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Advisor: Full DB Validation Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Equivalency Consistency Check
          </h3>
          <button
            onClick={handleValidate}
            disabled={validating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors disabled:opacity-60"
          >
            <CheckCircle size={14} />
            {validating ? 'Checking…' : 'Check All Equivalencies'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Cross-references every manual equivalency in the database against the CCN mapping to detect potential mismatches.
        </p>

        {showValidation && validation && (
          <div className="mt-4 space-y-3">
            {/* Summary row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Checked', value: validation.summary.total_manual, color: 'text-gray-900 dark:text-white' },
                { label: 'Consistent',    value: validation.summary.consistent,   color: 'text-green-600 dark:text-green-400' },
                { label: 'Mismatches',    value: validation.summary.mismatches,   color: validation.summary.mismatches > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400' },
                { label: 'No CCN Data',   value: validation.summary.no_ccn_data,  color: 'text-yellow-600 dark:text-yellow-400' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Mismatches list */}
            {validation.mismatches.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">
                  Potential Mis-mapped Equivalencies
                </p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {validation.mismatches.map(m => (
                    <div key={m.equiv_id} className="text-xs p-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                      <p className="font-semibold">Equiv #{m.equiv_id}: {m.from_course} ({m.from_institution}) ↔ {m.to_course} ({m.to_institution})</p>
                      <p className="text-red-500 mt-0.5">
                        From maps to CCN: <strong>{(m.from_ccns || []).join(', ') || '—'}</strong>{' '}
                        | To maps to CCN: <strong>{(m.to_ccns || []).join(', ') || '—'}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {validation.summary.mismatches === 0 && (
              <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1.5">
                <CheckCircle size={14} />
                All manual equivalencies are consistent with the CCN mapping.
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
