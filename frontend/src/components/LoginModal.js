import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiX, FiMail, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose }) => {
  const [loginType, setLoginType] = useState('admin'); // 'admin' or 'client'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { adminLogin, clientLogin, googleLogin, phoneLogin, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [showOTP, setShowOTP] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (loginType === 'admin') {
        await adminLogin(email, password);
        navigate('/admin');
      } else {
        await clientLogin(email, password);
      }
      onClose();
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await googleLogin();
      if (loginType === 'admin') {
        navigate('/admin');
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await phoneLogin(phoneNumber);
      setConfirmationResult(result);
      setShowOTP(true);
    } catch (err) {
      setError(err.message || 'Phone login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setError('');
    setLoading(true);

    try {
      await verifyOTP(confirmationResult, otpCode);
      onClose();
      setPhoneNumber('');
      setOtpCode('');
      setShowOTP(false);
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center frosted-glass-dark">
        <motion.div
          className="frosted-glass max-w-md w-full mx-4 p-8 border border-white/10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-display text-headline-lg text-primary uppercase">Authenticate</h2>
            <button
              onClick={onClose}
              className="text-outline hover:text-primary transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>

          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => {
                setLoginType('admin');
                setError('');
              }}
              className={`flex-1 py-2 px-4 font-label text-label-caps uppercase transition-all ${
                loginType === 'admin'
                  ? 'bg-accent-red text-white'
                  : 'liquid-glass text-on-surface-variant hover:text-primary'
              }`}
            >
              Admin Login
            </button>
            <button
              onClick={() => {
                setLoginType('client');
                setError('');
              }}
              className={`flex-1 py-2 px-4 font-label text-label-caps uppercase transition-all ${
                loginType === 'client'
                  ? 'bg-accent-red text-white'
                  : 'liquid-glass text-on-surface-variant hover:text-primary'
              }`}
            >
              Client Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 border border-accent-red/50 text-accent-red font-mono text-sm">
              {error}
            </div>
          )}

          {!showOTP ? (
            <>
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block font-label text-label-caps text-on-surface-variant mb-1 uppercase">
                    Email
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-0 top-4 text-outline" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="ghost-input pl-8"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label text-label-caps text-on-surface-variant mb-1 uppercase">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-0 top-4 text-outline" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="ghost-input pl-8"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-background py-3 px-4 font-label text-label-caps uppercase hover:bg-accent-red hover:text-white disabled:opacity-50 transition-all"
                >
                  {loading ? 'Authenticating...' : 'Login with Email'}
                </button>
              </form>

              <div className="my-4 text-center font-mono text-mono-technical text-outline">OR</div>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full liquid-glass text-primary py-3 px-4 font-label text-label-caps uppercase hover:bg-white/10 disabled:opacity-50 mb-3 transition-all"
              >
                {loading ? 'Logging in...' : 'Login with Google'}
              </button>

              {loginType === 'client' && (
                <>
                  <div className="my-4 text-center text-gray-500">OR</div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
                        placeholder="+1234567890"
                      />
                    </div>
                    <button
                      onClick={handlePhoneLogin}
                      disabled={loading || !phoneNumber}
                      className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-orange-500"
                  placeholder="Enter 6-digit OTP"
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={loading || !otpCode}
                className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                onClick={() => {
                  setShowOTP(false);
                  setOtpCode('');
                }}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Back
              </button>
            </div>
          )}

          <div id="recaptcha-container"></div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LoginModal;


