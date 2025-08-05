import React, { useState } from 'react';
import { Key, Search, AlertCircle, CheckCircle, Copy, Share2, X, Eye, User, Calendar, GraduationCap } from 'lucide-react';

const PlanCodeLookup = ({ onPlanFound = null, onClose = null, showAsModal = false }) => {
  const [planCode, setPlanCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundPlan, setFoundPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateCode = (code) => {
    return code && code.trim().length === 8 && /^[A-Z0-9]+$/.test(code.trim());
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (value.length <= 8) {
      setPlanCode(value);
      setError('');
    }
  };

  const lookupPlan = async () => {
    if (!validateCode(planCode)) {
      setError('Please enter a valid 8-character plan code');
      return;
    }

    setLoading(true);
    setError('');
    setFoundPlan(null);

    try {
      const response = await fetch(`/api/plans/by-code/${planCode.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Plan not found');
      }

      setFoundPlan(data);
      setShowSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);

      if (onPlanFound) {
        onPlanFound(data);
      }
    } catch (err) {
      setError(err.message || 'Failed to lookup plan');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && validateCode(planCode)) {
      lookupPlan();
    }
  };

  const copyPlanCode = () => {
    if (foundPlan?.plan_code) {
      navigator.clipboard.writeText(foundPlan.plan_code);
      // You could add a toast notification here
    }
  };

  const sharePlan = () => {
    if (foundPlan?.plan_code) {
      const shareData = {
        title: `Academic Plan: ${foundPlan.plan_name}`,
        text: `Check out my academic plan! Use code: ${foundPlan.plan_code}`,
        url: window.location.href
      };
      
      if (navigator.share && navigator.canShare(shareData)) {
        navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`Academic Plan Code: ${foundPlan.plan_code}\nPlan: ${foundPlan.plan_name}\nStudent: ${foundPlan.student_name}`);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
      case 'in_progress':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
      case 'draft':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    }
  };

  const formatStatus = (status) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Access Academic Plan
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Enter your 8-character plan code to view and manage your academic plan
        </p>
      </div>

      {/* Plan Code Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plan Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={planCode}
              onChange={handleCodeChange}
              onKeyDown={handleKeyPress}
              placeholder="XXXXXXXX"
              maxLength={8}
              className="w-full px-4 py-3 text-center text-lg font-mono uppercase border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 tracking-widest"
              style={{ letterSpacing: '0.2em' }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Key className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            8 characters, letters and numbers only
          </p>
        </div>

        <button
          onClick={lookupPlan}
          disabled={!validateCode(planCode) || loading}
          className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Looking up plan...
            </>
          ) : (
            <>
              <Search className="mr-2" size={20} />
              Find My Plan
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-400 mb-1">
                Plan Not Found
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400">
                {error}
              </p>
              <div className="mt-2 text-xs text-red-600 dark:text-red-500">
                <p>• Make sure you've entered all 8 characters</p>
                <p>• Check that the code was copied correctly</p>
                <p>• Contact your advisor if you continue having issues</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccess && foundPlan && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-start">
            <CheckCircle className="text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div className="flex-1">
              <h4 className="font-medium text-green-800 dark:text-green-400 mb-1">
                Plan Found Successfully!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-400">
                Accessing your academic plan...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Found Plan Preview */}
      {foundPlan && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <GraduationCap className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
                <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                  {foundPlan.plan_name}
                </h4>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <User className="mr-2" size={16} />
                  <span>Student: {foundPlan.student_name}</span>
                </div>
                
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="mr-2" size={16} />
                  <span>Created: {formatDate(foundPlan.created_at)}</span>
                </div>

                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(foundPlan.status)}`}>
                    {formatStatus(foundPlan.status)}
                  </span>
                  {foundPlan.courses && foundPlan.courses.length > 0 && (
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      {foundPlan.courses.length} courses planned
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 ml-4">
              <button
                onClick={copyPlanCode}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Copy plan code"
              >
                <Copy size={16} />
              </button>
              <button
                onClick={sharePlan}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title="Share plan"
              >
                <Share2 size={16} />
              </button>
            </div>
          </div>

          {/* Plan Code Display */}
          <div className="bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan Code</p>
                <p className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-widest">
                  {foundPlan.plan_code}
                </p>
              </div>
              <button
                onClick={copyPlanCode}
                className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Progress Preview */}
          {foundPlan.progress && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <h5 className="font-medium text-gray-800 dark:text-gray-200 mb-2">Progress Overview</h5>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Completion</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {foundPlan.progress.completion_percentage?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(foundPlan.progress.completion_percentage || 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>{foundPlan.progress.total_credits_earned || 0} credits earned</span>
                <span>{foundPlan.progress.total_credits_required || 0} total required</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
        <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2 flex items-center">
          <AlertCircle className="mr-2" size={16} />
          About Plan Codes
        </h5>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Plan codes are unique 8-character identifiers for your academic plans</li>
          <li>• Share your code with advisors for easy plan access and collaboration</li>
          <li>• Your plan code never changes, even when you update your plan</li>
          <li>• Keep your code secure - anyone with it can view your plan</li>
        </ul>
      </div>
    </div>
  );

  // Render as modal if requested
  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-md h-[90vh] sm:h-auto overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Find Your Plan</h3>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Render as regular component
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      {content}
    </div>
  );
};

// Component to display plan code in existing plans
const PlanCodeDisplay = ({ plan, showCopyButton = true, compact = false }) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    if (plan?.plan_code) {
      try {
        await navigator.clipboard.writeText(plan.plan_code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (!plan?.plan_code) return null;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Key className="text-gray-400 dark:text-gray-500" size={14} />
        <span className="font-mono text-sm text-gray-600 dark:text-gray-400 tracking-wide">
          {plan.plan_code}
        </span>
        {showCopyButton && (
          <button
            onClick={copyCode}
            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Copy plan code"
          >
            {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
            <Key className="mr-1" size={12} />
            Plan Access Code
          </p>
          <p className="font-mono text-lg font-bold text-gray-900 dark:text-white tracking-widest">
            {plan.plan_code}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Share this code with advisors for easy plan access
          </p>
        </div>
        {showCopyButton && (
          <button
            onClick={copyCode}
            className={`px-3 py-2 text-sm rounded transition-colors ${
              copied 
                ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle className="mr-1" size={14} />
                Copied!
              </>
            ) : (
              <>
                <Copy className="mr-1" size={14} />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default PlanCodeLookup;
export { PlanCodeDisplay };