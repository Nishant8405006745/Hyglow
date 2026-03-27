import React, { createContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

const defaultSettings = {
  theme: 'system', // 'system', 'light', 'dark'
  accentColor: 'indigo', // 'indigo', 'blue', 'emerald'
  notifications: {
    email: true,
    weekly: true,
    push: false
  },
  language: 'en-US',
  timezone: 'America/New_York'
};

const accentPalette = {
  indigo: { main: '#4f46e5', hover: '#4338ca' },
  blue: { main: '#3b82f6', hover: '#2563eb' },
  emerald: { main: '#10b981', hover: '#059669' },
  rose: { main: '#f43f5e', hover: '#e11d48' },
  amber: { main: '#f59e0b', hover: '#d97706' },
  violet: { main: '#8b5cf6', hover: '#7c3aed' }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hyglow_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  // Apply actual visual DOM changes when settings swap
  useEffect(() => {
    // 1. Accent Colors
    const colorObj = accentPalette[settings.accentColor] || accentPalette.indigo;
    document.documentElement.style.setProperty('--primary-color', colorObj.main);
    document.documentElement.style.setProperty('--primary-hover', colorObj.hover);

    // 2. Dark/Light Mode Theme Binding
    if (settings.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (settings.theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [settings.theme, settings.accentColor]);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('hyglow_settings', JSON.stringify(newSettings));
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
