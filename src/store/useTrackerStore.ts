import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyLog, CalendarEvent } from '../types';

const generateId = () => `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
const genEventId = () => `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface TrackerStore {
  logs: DailyLog[];
  events: CalendarEvent[];
  upsertLog: (date: string, data: Partial<DailyLog>) => void;
  getLog: (date: string) => DailyLog | undefined;
  getLogsForRange: (start: string, end: string) => DailyLog[];
  addEvent: (e: Omit<CalendarEvent, 'id' | 'createdAt'>) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForMonth: (year: number, month: number) => CalendarEvent[];
}

export const useTrackerStore = create<TrackerStore>()(
  persist(
    (set, get) => ({
      logs: [],
      events: [],

      upsertLog: (date, data) => {
        const existing = get().logs.find(l => l.date === date);
        if (existing) {
          set(s => ({
            logs: s.logs.map(l => l.date === date ? { ...l, ...data } : l),
          }));
        } else {
          const log: DailyLog = {
            id: generateId(),
            date,
            candidatesSourced: 0,
            callsMade: 0,
            interviewsScheduled: 0,
            offers: 0,
            closures: 0,
            pendingFollowups: 0,
            notes: '',
            ...data,
          };
          set(s => ({ logs: [log, ...s.logs] }));
        }
      },

      getLog: (date) => get().logs.find(l => l.date === date),

      getLogsForRange: (start, end) =>
        get().logs.filter(l => l.date >= start && l.date <= end),

      addEvent: (data) => {
        const event: CalendarEvent = {
          ...data,
          id: genEventId(),
          createdAt: new Date().toISOString(),
        };
        set(s => ({ events: [event, ...s.events] }));
        return event;
      },

      updateEvent: (id, updates) => {
        set(s => ({
          events: s.events.map(e => e.id === id ? { ...e, ...updates } : e),
        }));
      },

      deleteEvent: (id) => {
        set(s => ({ events: s.events.filter(e => e.id !== id) }));
      },

      getEventsForDate: (date) => get().events.filter(e => e.date === date),

      getEventsForMonth: (year, month) => {
        const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
        return get().events.filter(e => e.date.startsWith(prefix));
      },
    }),
    { name: 'recruitflow-tracker' }
  )
);
