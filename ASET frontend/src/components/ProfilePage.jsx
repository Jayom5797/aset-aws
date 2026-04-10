import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
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
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #00ffaa, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#000' }}>
          {getInitials(user?.name || user?.email)}
        </div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>{user?.name || 'User'}</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>{user?.email}</div>
        </div>
      </div>

      {msg && <div style={{ background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.3)', color: '#00ffaa', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 14 }}>{msg}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 14 }}>{error}</div>}

      {/* Update Name */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: '#fff', marginBottom: 16, fontSize: 16 }}>Display Name</h3>
        <form onSubmit={handleSaveName} style={{ display: 'flex', gap: 10 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
            style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '10px 14px', color: '#fff', fontSize: 14, outline: 'none' }} />
          <button type="submit" disabled={loading} style={{ background: 'rgba(0,255,170,0.15)', border: '1px solid rgba(0,255,170,0.4)', color: '#00ffaa', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Save
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ color: '#fff', marginBottom: 16, fontSize: 16 }}>Change Password</h3>
        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <PasswordInput value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" required />
          <PasswordInput value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password (min 6 chars)" required minLength={6} />
          <button type="submit" disabled={loading} style={{ background: 'rgba(0,255,170,0.15)', border: '1px solid rgba(0,255,170,0.4)', color: '#00ffaa', borderRadius: 10, padding: '10px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {loading ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
