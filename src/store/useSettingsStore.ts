import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';

interface SettingsStore {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const defaultSettings: Settings = {
  theme: 'light',
  recruiterName: '',
  recruiterEmail: '',
  recruiterPhone: '',
  recruiterCompany: '',
  groqKey: '',
  sidebarCollapsed: false,
  defaultPipelineView: 'kanban',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,

      updateSettings: (updates) => {
        set(s => ({ settings: { ...s.settings, ...updates } }));
        // Apply theme to document
        const theme = updates.theme ?? get().settings.theme;
        document.documentElement.setAttribute('data-theme', theme);
      },

      toggleTheme: () => {
        const current = get().settings.theme;
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        set(s => ({ settings: { ...s.settings, theme: next } }));
      },

      toggleSidebar: () => {
        set(s => ({
          settings: { ...s.settings, sidebarCollapsed: !s.settings.sidebarCollapsed },
        }));
      },
    }),
    {
      name: 'recruitflow-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.setAttribute('data-theme', state.settings.theme);
        }
      },
    }
  )
);
