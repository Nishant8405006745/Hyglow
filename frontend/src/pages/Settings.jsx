import React, { useContext, useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Globe, Palette, CheckCircle } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';

const Settings = () => {
  const { settings, saveSettings } = useContext(SettingsContext);
  const [saved, setSaved] = useState(false);

  const triggerSaveNotification = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (e) => {
    const nextSettings = { ...settings, [e.target.name]: e.target.value };
    saveSettings(nextSettings);
    triggerSaveNotification();
  };

  const handleNotificationChange = (e) => {
    const nextSettings = {
      ...settings,
      notifications: {
        ...settings.notifications,
        [e.target.name]: e.target.checked
      }
    };
    saveSettings(nextSettings);
    triggerSaveNotification();
  };

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <SettingsIcon size={28} color="var(--primary-color)" />
        <h1 style={{ color: 'var(--text-color)', margin: 0 }}>System Settings</h1>
      </div>
      <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Configure your personal preferences and system-wide application behaviors here. Changes are saved instantly.</p>

      {saved && (
        <div className="fade-in" style={{ padding: '1rem', backgroundColor: '#10b981', color: 'white', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, boxShadow: 'var(--shadow-md)' }}>
          <CheckCircle size={20} /> Preferences successfully updated and applied!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
        
        {/* Appearance Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Palette size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Appearance</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Theme Preference</label>
              <select name="theme" className="form-input" value={settings.theme} onChange={handleChange}>
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            </div>
            <div>
              <label className="form-label">Accent Color</label>
              <select name="accentColor" className="form-input" value={settings.accentColor} onChange={handleChange}>
                <option value="indigo">Hyglow Indigo</option>
                <option value="blue">Ocean Blue</option>
                <option value="emerald">Emerald Green</option>
                <option value="rose">Rose Pink</option>
                <option value="amber">Amber Orange</option>
                <option value="violet">Deep Violet</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Bell size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Notifications</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="email" checked={settings.notifications.email} onChange={handleNotificationChange} /> Receive email alerts for Profile Request approvals
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="weekly" checked={settings.notifications.weekly} onChange={handleNotificationChange} /> Weekly Accounting digest summaries
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" name="push" checked={settings.notifications.push} onChange={handleNotificationChange} /> Web Push notifications on desktop
            </label>
          </div>
        </div>

        {/* Regional Settings */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <Globe size={20} color="var(--primary-color)" />
            <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Regional</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Language</label>
              <select name="language" className="form-input" value={settings.language} onChange={handleChange}>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div>
              <label className="form-label">Timezone</label>
              <select name="timezone" className="form-input" value={settings.timezone} onChange={handleChange}>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">GMT / BST</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
