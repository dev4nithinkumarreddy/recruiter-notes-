import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, TaskStatus, Priority } from '../types';

const generateId = () => `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface TaskStore {
  tasks: Task[];
  addTask: (t: Omit<Task, 'id' | 'createdAt' | 'completedAt' | 'order'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasksForJob: (jobId: string) => Task[];
  setStatus: (id: string, status: TaskStatus) => void;
  setPriority: (id: string, priority: Priority) => void;
  reorderTasks: (jobId: string, orderedIds: string[]) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (data) => {
        const jobTasks = get().tasks.filter(t => t.jobId === data.jobId);
        const now = new Date().toISOString();
        const task: Task = {
          ...data,
          id: generateId(),
          order: jobTasks.length,
          completedAt: '',
          createdAt: now,
        };
        set(s => ({ tasks: [...s.tasks, task] }));
        return task;
      },

      updateTask: (id, updates) => {
        set(s => ({
          tasks: s.tasks.map(t => t.id === id ? { ...t, ...updates } : t),
        }));
      },

      deleteTask: (id) => {
        set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }));
      },

      getTasksForJob: (jobId) =>
        get().tasks.filter(t => t.jobId === jobId).sort((a, b) => a.order - b.order),

      setStatus: (id, status) => {
        const now = new Date().toISOString();
        set(s => ({
          tasks: s.tasks.map(t =>
            t.id === id
              ? { ...t, status, completedAt: status === 'Completed' ? now : '' }
              : t
          ),
        }));
      },

      setPriority: (id, priority) => {
        set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, priority } : t) }));
      },

      reorderTasks: (jobId, orderedIds) => {
        set(s => ({
          tasks: s.tasks.map(t => {
            if (t.jobId !== jobId) return t;
            const idx = orderedIds.indexOf(t.id);
            return idx >= 0 ? { ...t, order: idx } : t;
          }),
        }));
      },
    }),
    { name: 'recruitflow-tasks' }
  )
);
