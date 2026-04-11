import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Toggle = ({ value, onChange, label, desc }) => (
  <div className="settings-row">
    <div>
      <div className="settings-row-title">{label}</div>
      <div className="settings-row-desc">{desc}</div>
    </div>
    <button
      type="button"
      className={`settings-toggle ${value ? 'active' : ''}`}
      onClick={() => onChange(!value)}
      aria-pressed={value}
    >
      <span></span>
    </button>
  </div>
);

const SettingsPage = () => {
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

  const aboutItems = [
    ['Version', '2.0.0'],
    ['Database', '1.2M+ peer-reviewed papers'],
    ['Domains', '8 scientific domains'],
    ['Built with', 'AWS App Runner + Turso + Groq'],
  ];

  return (
    <div className="settings-page">
      <div className="settings-shell">
        <div className="settings-hero">
          <div className="settings-eyebrow">Control Room</div>
          <h2>Settings</h2>
          <p>Personalize how ASET saves verification work, manages claim extraction, and sends updates.</p>
        </div>

        {saved && (
          <div className="settings-alert">
            Settings saved successfully.
          </div>
        )}

        <div className="settings-grid">
          <div className="settings-card settings-card-wide">
            <h3>Verification</h3>
            <Toggle
              value={autoSave}
              onChange={setAutoSave}
              label="Auto-save chats"
              desc="Automatically save verification history."
            />
            <div className="settings-row">
              <div>
                <div className="settings-row-title">Max claims per document</div>
                <div className="settings-row-desc">Limit claims extracted from document verification.</div>
              </div>
              <select
                className="settings-select"
                value={maxClaims}
                onChange={event => setMaxClaims(Number(event.target.value))}
              >
                {[10, 15, 20, 25, 30].map(value => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="settings-card">
            <h3>Notifications</h3>
            <Toggle
              value={notifications}
              onChange={setNotifications}
              label="Email notifications"
              desc="Receive product and verification feature updates."
            />
          </div>

          <div className="settings-card">
            <h3>About ASET</h3>
            <div className="settings-about-grid">
              {aboutItems.map(([label, value]) => (
                <div className="settings-about-item" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button type="button" className="settings-save-btn" onClick={handleSave}>
            Save Settings
          </button>
          <button type="button" className="settings-signout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
