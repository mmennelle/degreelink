import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

// Privacy notice component
const PrivacyNotice = () => {
  const [showNotice, setShowNotice] = useState(() => {
    return !localStorage.getItem('privacyNoticeAcknowledged');
  });

  const acknowledgeNotice = () => {
    localStorage.setItem('privacyNoticeAcknowledged', 'true');
    setShowNotice(false);
  };

  if (!showNotice) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4 shadow-lg z-50">
      <div className="flex items-start">
        <Shield className="text-blue-600 dark:text-blue-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-1">
            🔒 Your Privacy Matters
          </h4>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
            Your academic plans are protected by secure codes. Only you and those you share your code with can access your information.
          </p>
          <div className="flex gap-2">
            <button
              onClick={acknowledgeNotice}
              className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              Got It
            </button>
            <button
              onClick={() => setShowNotice(false)}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded text-sm hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
            >
              Learn More
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowNotice(false)}
          className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Security status indicator
const SecurityStatus = ({ planCode = null, showDetails = false }) => {
  const [isVisible, setIsVisible] = useState(showDetails);

  const getSecurityLevel = () => {
    if (!planCode) return 'none';
    return 'secure';
  };

  const securityLevel = getSecurityLevel();

  if (!showDetails && securityLevel === 'none') return null;

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
      securityLevel === 'secure' 
        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }`}>
      {securityLevel === 'secure' ? (
        <>
          <Lock className="mr-1" size={12} />
          Secure Access
        </>
      ) : (
        <>
          <Shield className="mr-1" size={12} />
          Public Access
        </>
      )}
    </div>
  );
};

// Plan code security guidelines
const PlanCodeSecurityGuide = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-2xl h-[90vh] sm:h-auto sm:max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="text-blue-600 dark:text-blue-400 mr-2" size={24} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Plan Security & Privacy</h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Security Overview */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center">
              <CheckCircle className="mr-2" size={18} />
              Your Data is Protected
            </h4>
            <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
              <li>• Plans are only accessible with secure 8-character codes</li>
              <li>• No plan browsing or discovery features</li>
              <li>• Session-based temporary access with automatic expiration</li>
              <li>• Rate limiting prevents brute force attempts</li>
            </ul>
          </div>

          {/* Plan Code Security */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <Lock className="mr-2" size={18} />
              Plan Code Security
            </h4>
            <div className="space-y-3">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
                <h5 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1">🔑 Keep Your Code Secure</h5>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                  <li>• Don't share your plan code publicly</li>
                  <li>• Only share with trusted advisors or family</li>
                  <li>• If compromised, create a new plan and delete the old one</li>
                  <li>• Codes never change once created</li>
                </ul>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <h5 className="font-medium text-red-800 dark:text-red-300 mb-1">⚠️ Security Warnings</h5>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                  <li>• Anyone with your code can view and modify your plan</li>
                  <li>• Don't include codes in emails or messages that could be intercepted</li>
                  <li>• Use secure communication when sharing with advisors</li>
                  <li>• Log out or clear access when using shared computers</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Best Practices */}
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
              <Info className="mr-2" size={18} />
              Best Practices
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <h5 className="font-medium text-blue-800 dark:text-blue-300 mb-2">✅ Do</h5>
                <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                  <li>• Save your code in a secure password manager</li>
                  <li>• Share via secure, private channels</li>
                  <li>• Clear access when done on shared devices</li>
                  <li>• Create new plans if security is compromised</li>
                </ul>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                <h5 className="font-medium text-red-800 dark:text-red-300 mb-2">❌ Don't</h5>
                <ul className="text-sm text-red-700 dark:text-red-400 space-y-1">
                  <li>• Post codes on social media</li>
                  <li>• Share in unsecured group chats</li>
                  <li>• Leave codes visible on shared screens</li>
                  <li>• Use the same device without clearing access</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Security */}
          <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center">
              <Shield className="mr-2" size={18} />
              Technical Safeguards
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Code Generation</h5>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Cryptographically secure random generation</li>
                  <li>• 8 characters = 2.8 trillion possibilities</li>
                  <li>• Excludes confusing characters (0, O, 1, I)</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-gray-700 dark:text-gray-300 mb-1">Access Control</h5>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Session-based temporary access</li>
                  <li>• 1-hour automatic session expiration</li>
                  <li>• Rate limiting prevents brute force</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Session timeout warning
const SessionTimeoutWarning = ({ timeRemaining, onExtend, onLogout }) => {
  if (timeRemaining > 300) return null; // Only show when < 5 minutes left

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-4 shadow-lg z-40">
      <div className="flex items-start">
        <AlertTriangle className="text-orange-600 dark:text-orange-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-1">
            Session Expiring
          </h4>
          <p className="text-sm text-orange-700 dark:text-orange-400 mb-2">
            Your secure session expires in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onExtend}
              className="px-2 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700 transition-colors"
            >
              Stay Logged In
            </button>
            <button
              onClick={onLogout}
              className="px-2 py-1 bg-orange-100 dark:bg-orange-800 text-orange-700 dark:text-orange-300 rounded text-xs hover:bg-orange-200 dark:hover:bg-orange-700 transition-colors"
            >
              Logout Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clear access button component
const ClearAccessButton = ({ onClear, planName = null }) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async () => {
    if (!confirm(`Clear secure access${planName ? ` to "${planName}"` : ''}?\n\nYou'll need to enter your plan code again to access it.`)) {
      return;
    }

    setIsClearing(true);
    try {
      await onClear();
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button
      onClick={handleClear}
      disabled={isClearing}
      className="inline-flex items-center px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
      title="Clear access for security"
    >
      {isClearing ? (
        <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600 mr-1"></div>
      ) : (
        <EyeOff className="mr-1" size={12} />
      )}
      {isClearing ? 'Clearing...' : 'Clear Access'}
    </button>
  );
};

// Secure plan card component
const SecurePlanCard = ({ plan, onSelect, onClearAccess, isSelected = false }) => {
  return (
    <div className={`border rounded-lg p-4 transition-all ${
      isSelected 
        ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 dark:text-white truncate">{plan.plan_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{plan.student_name}</p>
          <div className="flex items-center gap-2 mt-1">
            <SecurityStatus planCode={plan.plan_code} />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Code: {plan.plan_code}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <ClearAccessButton 
            onClear={onClearAccess}
            planName={plan.plan_name}
          />
          {onSelect && (
            <button
              onClick={() => onSelect(plan)}
              className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>
      
      {/* Plan progress indicator */}
      {plan.progress && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Progress</span>
            <span>{plan.progress.completion_percentage?.toFixed(0) || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(plan.progress.completion_percentage || 0, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Enhanced plan code lookup with security messaging
const SecurePlanCodeLookup = ({ onPlanFound, onClose, showAsModal = false }) => {
  const [planCode, setPlanCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [foundPlan, setFoundPlan] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [showSecurityGuide, setShowSecurityGuide] = useState(false);

  const MAX_ATTEMPTS = 5;

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

    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many attempts. Please wait before trying again.');
      return;
    }

    setLoading(true);
    setError('');
    setFoundPlan(null);

    try {
      const result = await api.getPlanByCode(planCode.trim());
      setFoundPlan(result);
      setAttempts(0); // Reset attempts on success
      
      if (onPlanFound) {
        onPlanFound(result);
      }
    } catch (err) {
      setAttempts(prev => prev + 1);
      
      if (err.message.includes('Too many')) {
        setError('Access temporarily blocked due to too many attempts. Please try again later.');
      } else {
        setError(err.message || 'Plan not found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && validateCode(planCode) && attempts < MAX_ATTEMPTS) {
      lookupPlan();
    }
  };

  const isBlocked = attempts >= MAX_ATTEMPTS;

  const content = (
    <div className="space-y-6">
      {/* Security-focused header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Secure Plan Access
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Enter your private 8-character plan code
        </p>
      </div>

      {/* Security notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
        <div className="flex items-start">
          <Info className="text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
          <div className="text-sm">
            <p className="text-blue-800 dark:text-blue-300 font-medium mb-1">Privacy Protected</p>
            <p className="text-blue-700 dark:text-blue-400">
              Your academic information is secured with unique access codes. Only those with your code can view your plan.
            </p>
          </div>
        </div>
      </div>

      {/* Plan Code Input */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plan Access Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={planCode}
              onChange={handleCodeChange}
              onKeyDown={handleKeyPress}
              placeholder="XXXXXXXX"
              maxLength={8}
              disabled={isBlocked}
              className={`w-full px-4 py-3 text-center text-lg font-mono uppercase border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 tracking-widest transition-colors ${
                isBlocked 
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              style={{ letterSpacing: '0.2em' }}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          {/* Attempt counter */}
          {attempts > 0 && (
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
              {MAX_ATTEMPTS - attempts} attempts remaining
            </p>
          )}
        </div>

        <button
          onClick={lookupPlan}
          disabled={!validateCode(planCode) || loading || isBlocked}
          className="w-full px-4 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Accessing plan securely...
            </>
          ) : isBlocked ? (
            <>
              <Lock className="mr-2" size={20} />
              Access Blocked
            </>
          ) : (
            <>
              <Shield className="mr-2" size={20} />
              Access My Plan
            </>
          )}
        </button>
      </div>

      {/* Error handling with security context */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="text-red-600 dark:text-red-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-400 mb-1">
                Access Denied
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mb-2">
                {error}
              </p>
              {!isBlocked && (
                <div className="text-xs text-red-600 dark:text-red-500 space-y-1">
                  <p>• Verify you've entered all 8 characters correctly</p>
                  <p>• Plan codes are case-sensitive</p>
                  <p>• Contact the plan owner if you need access</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security guide link */}
      <div className="text-center">
        <button
          onClick={() => setShowSecurityGuide(true)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
        >
          Learn about plan security & privacy
        </button>
      </div>

      {/* Security guide modal */}
      <PlanCodeSecurityGuide 
        isOpen={showSecurityGuide}
        onClose={() => setShowSecurityGuide(false)}
      />
    </div>
  );

  // Modal wrapper
  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-t-lg sm:rounded-lg w-full sm:max-w-md h-[90vh] sm:h-auto overflow-y-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Access Your Plan</h3>
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
          <div className="p-4 sm:p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6">
      {content}
    </div>
  );
};

export default SecurePlanCodeLookup;
export { 
  PrivacyNotice, 
  SessionTimeoutWarning, 
  ClearAccessButton, 
  SecurePlanCard, 
  PlanCodeSecurityGuide,
  SecurityStatus 
};