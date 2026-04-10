import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from './PasswordInput';

const ProfilePage = ({ onClose }) => {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const getInitials = (n) => (n || 'U').slice(0, 2).toUpperCase();

  const handleSaveName = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg(''); setError('');
    try {
      // Update name via API (we'll add this endpoint)
      const token = localStorage.getItem('aset_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name })
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      login(token, { ...user, name });
      setMsg('Name updated successfully');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setMsg(''); setError('');
    try {
      const token = localStorage.getItem('aset_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || 'Failed'); }
      setMsg('Password changed successfully');
      setCurrentPassword(''); setNewPassword('');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="profile-page">
      <div className="profile-hero">
        <div className="profile-avatar">
          {getInitials(user?.name || user?.email)}
        </div>
        <div className="profile-hero-copy">
          <div className="profile-name">{user?.name || 'User'}</div>
          <div className="profile-email">{user?.email}</div>
        </div>
      </div>

      {msg && <div className="profile-alert success">{msg}</div>}
      {error && <div className="profile-alert error">{error}</div>}

      <section className="profile-panel">
        <div className="profile-section-header">
          <p className="profile-kicker">Identity</p>
          <h3>Display Name</h3>
        </div>
        <form onSubmit={handleSaveName} className="profile-name-form">
          <input
            className="profile-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
          />
          <button type="submit" disabled={loading} className="profile-btn profile-btn-primary">
            Save
          </button>
        </form>
      </section>

      <section className="profile-panel">
        <div className="profile-section-header">
          <p className="profile-kicker">Security</p>
          <h3>Change Password</h3>
        </div>
        <form onSubmit={handleChangePassword} className="profile-password-form">
          <PasswordInput
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            required
            className="profile-password-input"
            inputClassName="profile-input profile-password-field"
            buttonClassName="profile-password-toggle"
          />
          <PasswordInput
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="New password (min 6 chars)"
            required
            minLength={6}
            className="profile-password-input"
            inputClassName="profile-input profile-password-field"
            buttonClassName="profile-password-toggle"
          />
          <button type="submit" disabled={loading} className="profile-btn profile-btn-primary profile-btn-wide">
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </section>
    </div>
  );
};

export default ProfilePage;
