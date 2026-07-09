import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Job, ColorLabel, JobStatus, Priority } from '../types';

const generateId = () => `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface JobStore {
  jobs: Job[];
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Job;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  getJob: (id: string) => Job | undefined;
  togglePin: (id: string) => void;
  toggleFavorite: (id: string) => void;
  toggleArchive: (id: string) => void;
  cloneJob: (id: string) => Job | undefined;
  setColorLabel: (id: string, color: ColorLabel) => void;
  setStatus: (id: string, status: JobStatus) => void;
  setPriority: (id: string, priority: Priority) => void;
}

export const useJobStore = create<JobStore>()(
  persist(
    (set, get) => ({
      jobs: [],

      addJob: (jobData) => {
        const now = new Date().toISOString();
        const job: Job = {
          ...jobData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ jobs: [job, ...s.jobs] }));
        return job;
      },

      updateJob: (id, updates) => {
        set(s => ({
          jobs: s.jobs.map(j =>
            j.id === id ? { ...j, ...updates, updatedAt: new Date().toISOString() } : j
          ),
        }));
      },

      deleteJob: (id) => {
        set(s => ({ jobs: s.jobs.filter(j => j.id !== id) }));
      },

      getJob: (id) => get().jobs.find(j => j.id === id),

      togglePin: (id) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, isPinned: !j.isPinned } : j),
        }));
      },

      toggleFavorite: (id) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, isFavorite: !j.isFavorite } : j),
        }));
      },

      toggleArchive: (id) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, isArchived: !j.isArchived } : j),
        }));
      },

      cloneJob: (id) => {
        const original = get().jobs.find(j => j.id === id);
        if (!original) return undefined;
        const now = new Date().toISOString();
        const cloned: Job = {
          ...original,
          id: generateId(),
          title: `${original.title} (Copy)`,
          status: 'Open',
          isPinned: false,
          isFavorite: false,
          isArchived: false,
          jdFiles: [],
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ jobs: [cloned, ...s.jobs] }));
        return cloned;
      },

      setColorLabel: (id, color) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, colorLabel: color } : j),
        }));
      },

      setStatus: (id, status) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, status } : j),
        }));
      },

      setPriority: (id, priority) => {
        set(s => ({
          jobs: s.jobs.map(j => j.id === id ? { ...j, priority } : j),
        }));
      },
    }),
    { name: 'recruitflow-jobs' }
  )
);
