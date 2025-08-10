import React, { useState } from 'react';
import { CheckCircle, Copy, Check, Shield, X, Key } from 'lucide-react';

const PlanCreatedModal = ({ isOpen, onClose, planData }) => {
  const [copied, setCopied] = useState(false);

  const copyPlanCode = async () => {
    try {
      await navigator.clipboard.writeText(planData.plan_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = planData.plan_code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch (fallbackErr) {
        console.error('Copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  if (!isOpen || !planData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 dark:text-green-400 mr-3" size={24} />
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Plan Created Successfully!
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 p-1 hover:bg-green-100 dark:hover:bg-green-800/50 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Your academic plan "<strong>{planData.plan_name}</strong>" has been created successfully!
          </p>

          {/* Plan Code Section */}
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Key className="text-blue-600 dark:text-blue-400 mr-2" size={18} />
              <h4 className="font-medium text-blue-800 dark:text-blue-300">Your Secure Plan Code</h4>
            </div>
            
            <div className="bg-white dark:bg-gray-700 rounded-md p-3 border border-blue-200 dark:border-blue-600">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xl font-bold text-gray-900 dark:text-white tracking-widest">
                  {planData.plan_code}
                </span>
                <button
                  onClick={copyPlanCode}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                    copied 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' 
                      : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="mr-1" size={16} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1" size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <div className="flex items-start">
              <Shield className="text-amber-600 dark:text-amber-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                  Some Tips.
                </h4>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1">
                  <li>• copy code to clipboard and then save it somewhere safe</li>
                  <li>• This code provides full access to your plan</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Success message with copy reminder */}
          {copied && (
            <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <p className="text-sm text-green-700 dark:text-green-400 flex items-center">
                <Check className="mr-2" size={16} />
                Plan code copied to clipboard! Make sure to save it securely.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors font-medium"
          >
            Got it, Continue to Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanCreatedModal;