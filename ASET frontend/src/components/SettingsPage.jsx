import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = ({ onClose }) => {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [maxClaims, setMaxClaims] = useState(20);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    localStorage.setItem('aset_settings', JSON.stringify({ notifications, autoSave, maxClaims }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange, label, desc }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>{desc}</div>
      </div>
      <button onClick={() => onChange(!value)} style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: value ? '#00ffaa' : 'rgba(255,255,255,0.15)',
        position: 'relative', transition: 'background 0.2s'
      }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#000', position: 'absolute', top: 3, left: value ? 23 : 3, transition: 'left 0.2s' }} />
      </button>
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', maxWidth: 600, margin: '0 auto', width: '100%' }}>
      <h2 style={{ color: '#fff', marginBottom: 32, fontSize: 22 }}>Settings</h2>

      {saved && <div style={{ background: 'rgba(0,255,170,0.1)', border: '1px solid rgba(0,255,170,0.3)', color: '#00ffaa', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 14 }}>Settings saved</div>}

      {/* Verification Settings */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Verification</h3>
        <Toggle value={autoSave} onChange={setAutoSave} label="Auto-save chats" desc="Automatically save verification history" />
        <div style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 500 }}>Max claims per document</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>Limit claims extracted from Mode 3</div>
            </div>
            <select value={maxClaims} onChange={e => setMaxClaims(Number(e.target.value))}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 8, padding: '6px 12px', fontSize: 14 }}>
              {[10, 15, 20, 25, 30].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Notifications</h3>
        <Toggle value={notifications} onChange={setNotifications} label="Email notifications" desc="Receive updates about ASET features" />
      </div>

      {/* About */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
        <h3 style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>About ASET</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[['Version', '2.0.0'], ['Database', '1.2M+ peer-reviewed papers'], ['Domains', '8 scientific domains'], ['Built with', 'AWS App Runner + Turso + Groq']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{k}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSave} style={{ width: '100%', background: 'rgba(0,255,170,0.15)', border: '1px solid rgba(0,255,170,0.4)', color: '#00ffaa', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
        Save Settings
      </button>

      <button onClick={logout} style={{ width: '100%', marginTop: 12, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: 12, padding: '12px', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
        Sign Out
      </button>
    </div>
  );
};

export default SettingsPage;
