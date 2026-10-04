import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowLeft, ArrowRight } from 'lucide-react';
import { login } from './adminAuth';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess, onCancel }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!password.trim()) {
      setError('// Passcode required');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const success = await login(password.trim(), rememberMe);
      if (success) {
        setIsLoading(false);
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        setIsLoading(false);
        setError('// Access denied: invalid passcode');
        if (inputRef.current) {
          inputRef.current.select();
        }
      }
    } catch {
      setIsLoading(false);
      setError('// Authentication error: verification failed');
    }
  };

  return (
    <div className="admin-gate-page">
      {/* Top Header Strip */}
      <header className="admin-gate-nav">
        <div className="admin-gate-brand">
          <span>Saad Akhtar</span>
          <span className="admin-gate-tag">/ Studio Management</span>
        </div>
        <div className="admin-gate-status">
          <span className="admin-gate-status-bracket">[</span>
          <span>Access Restricted</span>
          <span className="admin-gate-status-bracket">]</span>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="admin-gate-main">
        <div className="admin-gate-header">
          <span className="admin-gate-eyebrow">Authentication Required</span>
          <h1 className="admin-gate-title">Enter Passcode</h1>
          <p className="admin-gate-desc">
            Provide the master studio password to manage project details, sections, and portfolio content.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-gate-form">
          <div className="admin-gate-field">
            <div className="admin-gate-label-row">
              <label htmlFor="admin-passcode">Master Passcode</label>
              {capsLockActive && <span className="admin-gate-caps">Caps Lock On</span>}
            </div>

            <div className="admin-gate-input-box">
              <input
                ref={inputRef}
                id="admin-passcode"
                type={showPassword ? 'text' : 'password'}
                className="admin-gate-input"
                placeholder="••••••••••••"
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
                className="admin-gate-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                title={showPassword ? 'Hide passcode' : 'Show passcode'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && <div className="admin-gate-error">{error}</div>}
          </div>

          <label className="admin-gate-remember">
            <input
              type="checkbox"
              className="admin-gate-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember this device</span>
          </label>

          <button
            type="submit"
            className="admin-gate-btn"
            disabled={isLoading || !password.trim()}
          >
            <span>{isLoading ? 'Verifying...' : 'Authenticate'}</span>
            <span className="admin-gate-btn-arrow">
              <ArrowRight size={18} />
            </span>
          </button>
        </form>
      </main>

      {/* Bottom Footer Strip */}
      <footer className="admin-gate-footer">
        <button
          type="button"
          className="admin-gate-back-link"
          onClick={() => {
            if (onCancel) onCancel();
            else window.location.href = '/';
          }}
        >
          <ArrowLeft size={14} />
          <span>Return to public website</span>
        </button>
        <span>Saad Akhtar © {new Date().getFullYear()}</span>
      </footer>
    </div>
  );
};

export default AdminLogin;
