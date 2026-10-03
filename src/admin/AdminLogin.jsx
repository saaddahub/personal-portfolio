import React, { useState, useEffect, useRef } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowLeft, KeyRound, Sparkles } from 'lucide-react';
import { login, DEFAULT_PASSWORDS } from './adminAuth';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [shake, setShake] = useState(false);

  const inputRef = useRef(null);

  // Auto focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Monitor CapsLock state
  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin passcode.');
      triggerShake();
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Small debounce for polished feel
      await new Promise((resolve) => setTimeout(resolve, 350));
      const success = await login(password.trim(), rememberMe);

      if (success) {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setIsLoading(false);
        setError('Incorrect passcode. Access denied.');
        triggerShake();
        if (inputRef.current) {
          inputRef.current.select();
        }
      }
    } catch (err) {
      setIsLoading(false);
      setError('Authentication error. Please try again.');
      triggerShake();
    }
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const fillDefaultPasscode = () => {
    setPassword(DEFAULT_PASSWORDS[0]);
    setError('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Dynamic Ambient Background */}
      <div className="admin-login-bg">
        <div className="admin-login-glow-1"></div>
        <div className="admin-login-glow-2"></div>
        <div className="admin-login-grid"></div>
      </div>

      <div className={`admin-login-card ${shake ? 'has-error' : ''}`}>
        {/* Header Icon & Title */}
        <div className="admin-login-header">
          <div className="admin-login-icon-badge">
            <div className="admin-login-shield-ring"></div>
            <Lock size={26} strokeWidth={2.2} />
          </div>

          <div className="admin-login-pill">
            <span className="admin-login-pill-dot"></span>
            Restricted Admin Area
          </div>

          <h2 className="admin-login-title">Saad's Studio</h2>
          <p className="admin-login-subtitle">
            Enter your master passcode to manage projects, sections, and portfolio content.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label className="admin-login-label" htmlFor="admin-pass-input">
              Admin Passcode
            </label>
            <div className="admin-login-input-box">
              <span className="admin-login-input-icon">
                <KeyRound size={17} />
              </span>
              <input
                ref={inputRef}
                id="admin-pass-input"
                type={showPassword ? 'text' : 'password'}
                className="admin-login-input"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                onKeyDown={handleKeyDown}
                onKeyUp={handleKeyDown}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="admin-login-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Caps Lock warning */}
            {capsLockActive && (
              <div className="admin-caps-warning">
                <AlertCircle size={14} />
                <span>Caps Lock is ON</span>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="admin-login-error">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {/* Form Options */}
          <div className="admin-login-options">
            <label className="admin-login-checkbox-label">
              <input
                type="checkbox"
                className="admin-login-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Keep me signed in</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="admin-login-submit-btn"
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? (
              <>
                <span className="admin-login-spinner"></span>
                Verifying...
              </>
            ) : (
              <>
                <ShieldCheck size={18} />
                Unlock Dashboard
              </>
            )}
          </button>
        </form>

        {/* Helpful Default Hint */}
        <div className="admin-login-hint-box">
          <span>Initial default passcode:</span>
          <button
            type="button"
            className="admin-login-hint-code"
            onClick={fillDefaultPasscode}
            title="Click to auto-fill default password"
          >
            saad2026
          </button>
        </div>

        {/* Return link */}
        <div className="admin-login-footer">
          <button
            type="button"
            className="admin-login-back-btn"
            onClick={() => {
              if (onCancel) onCancel();
              else window.location.href = '/';
            }}
          >
            <ArrowLeft size={15} />
            Back to Public Portfolio
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
