import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { AppSettings } from '@/shared/types';

interface SettingsState {
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;
  resetSettings: () => void;
  addRecentProject: (_: string) => void;
}

const defaultSettings: AppSettings = { autoSave: true, theme: 'system', aiModelsSettings: {} };

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      resetSettings: () => set({ settings: defaultSettings }),
      addRecentProject: () => {},
    }),
    { name: 'framefab-settings' }
  )
);
