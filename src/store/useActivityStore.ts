import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Activity } from '../types';

const generateId = () => `act_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface ActivityStore {
  activities: Activity[];
  log: (activity: Omit<Activity, 'id' | 'createdAt'>) => void;
  getActivitiesForJob: (jobId: string) => Activity[];
  getActivitiesForCandidate: (candidateId: string) => Activity[];
  getRecentActivities: (limit?: number) => Activity[];
  clearOld: () => void;
}

export const useActivityStore = create<ActivityStore>()(
  persist(
    (set, get) => ({
      activities: [],

      log: (data) => {
        const activity: Activity = {
          ...data,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set(s => ({
          // Keep max 500 activities
          activities: [activity, ...s.activities].slice(0, 500),
        }));
      },

      getActivitiesForJob: (jobId) =>
        get().activities.filter(a => a.jobId === jobId),

      getActivitiesForCandidate: (candidateId) =>
        get().activities.filter(a => a.candidateId === candidateId),

      getRecentActivities: (limit = 20) =>
        get().activities.slice(0, limit),

      clearOld: () => {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 90);
        set(s => ({
          activities: s.activities.filter(a => new Date(a.createdAt) > cutoff),
        }));
      },
    }),
    { name: 'recruitflow-activities' }
  )
);
