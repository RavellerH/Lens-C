// Co-locating the provider and its hook is the standard Context idiom; fast
// refresh just can't preserve state across edits to this file.
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_SETTINGS, type AppSettings } from '../../types/settings';
import { clearAllLocal, readLocal, writeLocal } from '../../utils/storage';

const SETTINGS_KEY = 'settings';

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetAppData: () => void;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => readLocal(SETTINGS_KEY, DEFAULT_SETTINGS));

  const updateSettings = (patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeLocal(SETTINGS_KEY, next);
      return next;
    });
  };

  const resetAppData = () => {
    clearAllLocal();
    setSettings(DEFAULT_SETTINGS);
  };

  const value = useMemo<SettingsContextValue>(() => ({ settings, updateSettings, resetAppData }), [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
