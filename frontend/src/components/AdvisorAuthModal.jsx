import React, { useState, useEffect } from 'react';
import { X, Mail, Key, AlertCircle, CheckCircle, LogIn, Settings, LogOut } from 'lucide-react';
import api from '../services/api';

export default function AdvisorAuthModal({ isOpen, onClose, onSuccess, isAuthenticated, advisorEmail }) {
  const [step, setStep] = useState(isAuthenticated ? 'authenticated' : 'email');
  const [email, setEmail] = useState(advisorEmail || '');
  const [code, setCode] = useState('');
  const [totp, setTotp] = useState('');
  const [totpQr, setTotpQr] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [hasTotp, setHasTotp] = useState(false);
  const [showRegenerateQr, setShowRegenerateQr] = useState(false);
  const [useTotp, setUseTotp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Reset modal state when authentication status changes
  useEffect(() => {
    if (isOpen) {
      setStep(isAuthenticated ? 'authenticated' : 'email');
      setEmail(advisorEmail || '');
      setCode('');
      setTotp('');
      setTotpQr('');
      setTotpSecret('');
      setHasTotp(false);
      setShowRegenerateQr(false);
      setUseTotp(false);
      setError('');
      setSuccess('');
      setAttemptsRemaining(5);
    }
  }, [isOpen, isAuthenticated, advisorEmail]);

  if (!isOpen) return null;

  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.requestAdvisorCode(email.trim());
      
      // Check if user already has TOTP set up
      const userHasTotp = response.has_totp || false;
      setHasTotp(userHasTotp);
      
      // Store TOTP info only if provided (first time setup)
      if (response.totp_qr && response.totp_secret) {
        setTotpQr(response.totp_qr);
        setTotpSecret(response.totp_secret);
      }
      
      // Default to TOTP tab if user already has it set up
      if (userHasTotp) {
        setUseTotp(true);
      }
      
      // Development mode: Show code in alert
      if (response.dev_mode && response.dev_code) {
        alert(`🔐 DEVELOPMENT MODE\n\nYour access code is: ${response.dev_code}\n\nThis alert only appears in development. In production, the code will be sent to your email.`);
      }
      
      setSuccess('Access code sent to your email! Check your inbox.');
      setStep('code');
    } catch (err) {
      setError(err.message || 'Failed to send access code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim() && !totp.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await api.verifyAdvisorCode(email.trim(), code.trim(), totp.trim());
      setSuccess('Authentication successful!');
      
      // Call success callback with advisor info
      setTimeout(() => {
        onSuccess({ 
          email: response.email,
          token: response.session_token,
          expiresAt: response.expires_at
        });
        onClose();
      }, 1000);
    } catch (err) {
      const message = err.message || 'Invalid or expired code';
      setError(message);
      
      // Extract attempts remaining from error if available
      if (message.includes('attempts_remaining')) {
        const match = message.match(/(\d+)/);
        if (match) {
          setAttemptsRemaining(parseInt(match[1]));
        }
      }
      
      // Clear code on error
      setCode('');
      setTotp('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logoutAdvisor();
      onSuccess(null); // Clear advisor auth
      
      // Reset the modal state for next use
      setStep('email');
      setCode('');
      setError('');
      setSuccess('');
      setAttemptsRemaining(5);
      
      onClose();
    } catch (err) {
      setError(err.message || 'Logout failed');
    }
  };

  const handleReset = () => {
    setStep('email');
    setCode('');
    setError('');
    setSuccess('');
    setAttemptsRemaining(5);
  };

  const handleRegenerateTotp = async () => {
    if (!email || (!code && !totp)) {
      setError('Please enter a valid code or TOTP first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.regenerateAdvisorTotp(email, code, totp);
      setTotpQr(response.totp_qr);
      setTotpSecret(response.totp_secret);
      setShowRegenerateQr(true);
      setSuccess('New TOTP secret generated! Scan the QR code with your authenticator app.');
    } catch (err) {
      setError(err.message || 'Failed to regenerate TOTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="text-blue-600 dark:text-blue-400" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Advisor Portal Access
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Already Authenticated */}
          {step === 'authenticated' && (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
                <div className="flex items-start">
                  <CheckCircle className="text-green-600 dark:text-green-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-green-800 dark:text-green-300">
                      Authenticated as Advisor
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      {advisorEmail}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}

          {/* Email Entry Step */}
          {step === 'email' && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Enter your whitelisted advisor email to receive an access code.
                </p>

                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="advisor@university.edu"
                    className="w-full px-4 py-3 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                    disabled={loading}
                    required
                  />
                  <Mail className="absolute right-3 top-3.5 text-gray-400" size={20} />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertCircle className="text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
              >
                <Mail size={16} />
                {loading ? 'Sending...' : 'Send Access Code'}
              </button>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Your email must be whitelisted by an administrator to receive an access code.
                </p>
              </div>
            </form>
          )}

          {/* Code Entry Step */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {/* Toggle between TOTP and email code */}
              <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setUseTotp(false)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    !useTotp
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Email Code
                </button>
                <button
                  type="button"
                  onClick={() => setUseTotp(true)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    useTotp
                      ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                >
                  Authenticator App
                </button>
              </div>

              {!useTotp ? (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    Enter the 6-digit code sent to <strong>{email}</strong>
                  </p>

                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Access Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 pr-10 text-center text-2xl tracking-widest font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                      disabled={loading}
                      autoFocus
                    />
                    <Key className="absolute right-3 top-3.5 text-gray-400" size={20} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Code expires in 15 minutes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      TOTP Code from Authenticator App
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={totp}
                        onChange={(e) => setTotp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full px-4 py-3 pr-10 text-center text-2xl tracking-widest font-mono border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                        disabled={loading}
                        autoFocus
                      />
                      <Key className="absolute right-3 top-3.5 text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Show QR code only if: first time setup OR user clicked regenerate */}
                  {(totpQr && (!hasTotp || showRegenerateQr)) && (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                        {showRegenerateQr ? 'New TOTP secret generated!' : 'First time setup:'} Scan this QR code with Google Authenticator, Authy, or any TOTP app:
                      </p>
                      <div className="flex justify-center mb-3">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpQr)}`} 
                          alt="TOTP QR Code"
                          className="border-4 border-white dark:border-gray-700 rounded-lg"
                        />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        <p className="font-medium mb-1">Manual entry secret:</p>
                        <code className="block bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 break-all">
                          {totpSecret}
                        </code>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-3">
                  <div className="flex items-start">
                    <AlertCircle className="text-red-600 dark:text-red-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-sm">
                      <p className="text-red-800 dark:text-red-300">{error}</p>
                      {attemptsRemaining < 5 && attemptsRemaining > 0 && (
                        <p className="text-red-700 dark:text-red-400 mt-1">
                          {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {success && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
                  <div className="flex items-start">
                    <CheckCircle className="text-green-600 dark:text-green-400 mr-2 mt-0.5 flex-shrink-0" size={16} />
                    <p className="text-sm text-green-800 dark:text-green-300">{success}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <button
                  type="submit"
                  disabled={loading || (!useTotp && code.length !== 6) || (useTotp && totp.length !== 6)}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
                >
                  <LogIn size={16} />
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>

                {/* Show regenerate button only if user already has TOTP and hasn't clicked regenerate yet */}
                {hasTotp && !showRegenerateQr && (
                  <button
                    type="button"
                    onClick={handleRegenerateTotp}
                    disabled={loading}
                    className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors border border-blue-200 dark:border-blue-700"
                  >
                    Regenerate TOTP Secret
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Use a different email
                </button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Didn't receive the code? Check your spam folder or request a new one.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
