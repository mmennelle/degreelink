// components/PrivacyNotice.jsx - Simple privacy agreement component
import React, { useState } from 'react';
import { Shield } from 'lucide-react';

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
            Your academic plans are protected by unique codes. Only you and those you share your code with can access your information.
          </p>
          <button
            onClick={acknowledgeNotice}
            className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyNotice;