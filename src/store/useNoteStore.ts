import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Note } from '../types';

const generateId = () => `note_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface NoteStore {
  notes: Note[];
  addNote: (n: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  getNotesForJob: (jobId: string) => Note[];
  getNotesForCandidate: (candidateId: string) => Note[];
  togglePin: (id: string) => void;
}

export const useNoteStore = create<NoteStore>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (data) => {
        const now = new Date().toISOString();
        const note: Note = { ...data, id: generateId(), createdAt: now, updatedAt: now };
        set(s => ({ notes: [note, ...s.notes] }));
        return note;
      },

      updateNote: (id, updates) => {
        set(s => ({
          notes: s.notes.map(n =>
            n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
          ),
        }));
      },

      deleteNote: (id) => {
        set(s => ({ notes: s.notes.filter(n => n.id !== id) }));
      },

      getNotesForJob: (jobId) => get().notes.filter(n => n.jobId === jobId),
      getNotesForCandidate: (candidateId) => get().notes.filter(n => n.candidateId === candidateId),

      togglePin: (id) => {
        set(s => ({
          notes: s.notes.map(n => n.id === id ? { ...n, isPinned: !n.isPinned } : n),
        }));
      },
    }),
    { name: 'recruitflow-notes' }
  )
);
