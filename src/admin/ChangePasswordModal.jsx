import React, { useState } from 'react';
import { X } from 'lucide-react';
import { changePassword } from './adminAuth';

const ChangePasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentPassword) {
      setError('// Current password required');
      return;
    }
    if (!newPassword || newPassword.length < 4) {
      setError('// New password must be at least 4 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('// Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setIsLoading(false);
      if (onSuccess) onSuccess('Admin passcode changed successfully');
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError(`// ${err.message || 'Failed to update passcode'}`);
    }
  };

  return (
    <div
      className="admin-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="admin-modal-card">
        <button
          className="admin-modal-close"
          onClick={onClose}
          type="button"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="admin-modal-header">
          <span className="admin-modal-eyebrow">Security Credentials</span>
          <h3 className="admin-modal-title">Change Master Passcode</h3>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-modal-field">
            <label className="admin-modal-label">Current Passcode</label>
            <input
              type="password"
              className="admin-modal-input"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              required
            />
          </div>

          <div className="admin-modal-field">
            <label className="admin-modal-label">New Passcode</label>
            <input
              type="password"
              className="admin-modal-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 4 characters"
              required
            />
          </div>

          <div className="admin-modal-field">
            <label className="admin-modal-label">Confirm New Passcode</label>
            <input
              type="password"
              className="admin-modal-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />
          </div>

          {error && <div className="admin-modal-error">{error}</div>}

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-modal-cancel"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-modal-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Passcode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
