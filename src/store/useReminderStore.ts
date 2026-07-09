import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reminder } from '../types';

const generateId = () => `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface ReminderStore {
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, 'id' | 'createdAt' | 'isDismissed' | 'isCompleted'>) => Reminder;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  dismiss: (id: string) => void;
  complete: (id: string) => void;
  getActiveReminders: () => Reminder[];
  getDueReminders: () => Reminder[];
}

export const useReminderStore = create<ReminderStore>()(
  persist(
    (set, get) => ({
      reminders: [],

      addReminder: (data) => {
        const now = new Date().toISOString();
        const reminder: Reminder = {
          ...data,
          id: generateId(),
          isDismissed: false,
          isCompleted: false,
          createdAt: now,
        };
        set(s => ({ reminders: [reminder, ...s.reminders] }));
        return reminder;
      },

      updateReminder: (id, updates) => {
        set(s => ({
          reminders: s.reminders.map(r => r.id === id ? { ...r, ...updates } : r),
        }));
      },

      deleteReminder: (id) => {
        set(s => ({ reminders: s.reminders.filter(r => r.id !== id) }));
      },

      dismiss: (id) => {
        set(s => ({
          reminders: s.reminders.map(r => r.id === id ? { ...r, isDismissed: true } : r),
        }));
      },

      complete: (id) => {
        set(s => ({
          reminders: s.reminders.map(r => r.id === id ? { ...r, isCompleted: true } : r),
        }));
      },

      getActiveReminders: () =>
        get().reminders.filter(r => !r.isCompleted && !r.isDismissed),

      getDueReminders: () => {
        const now = new Date();
        return get().reminders.filter(
          r => !r.isCompleted && !r.isDismissed && new Date(r.dueAt) <= now
        );
      },
    }),
    { name: 'recruitflow-reminders' }
  )
);
