import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Candidate, PipelineStage, StageEvent, SharedEvent, FileRef } from '../types';

const generateId = () => `cand_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface CandidateStore {
  candidates: Candidate[];
  addCandidate: (c: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt' | 'stageHistory' | 'sharedHistory' | 'resumes'>) => Candidate;
  updateCandidate: (id: string, updates: Partial<Candidate>) => void;
  deleteCandidate: (id: string) => void;
  getCandidate: (id: string) => Candidate | undefined;
  getCandidatesForJob: (jobId: string) => Candidate[];
  moveStage: (id: string, stage: PipelineStage, note?: string) => void;
  addResume: (id: string, file: FileRef) => void;
  removeResume: (id: string, fileId: string) => void;
  addSharedEvent: (id: string, event: Omit<SharedEvent, 'id'>) => void;
  updateSharedEvent: (candidateId: string, eventId: string, updates: Partial<SharedEvent>) => void;
  toggleShortlisted: (id: string) => void;
  duplicateToJob: (candidateId: string, newJobId: string) => Candidate | undefined;
  addTag: (id: string, tag: string) => void;
  removeTag: (id: string, tag: string) => void;
}

export const useCandidateStore = create<CandidateStore>()(
  persist(
    (set, get) => ({
      candidates: [],

      addCandidate: (data) => {
        const now = new Date().toISOString();
        const candidate: Candidate = {
          ...data,
          id: generateId(),
          stageHistory: [{ stage: data.stage, timestamp: now }],
          sharedHistory: [],
          resumes: [],
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ candidates: [candidate, ...s.candidates] }));
        return candidate;
      },

      updateCandidate: (id, updates) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCandidate: (id) => {
        set(s => ({ candidates: s.candidates.filter(c => c.id !== id) }));
      },

      getCandidate: (id) => get().candidates.find(c => c.id === id),

      getCandidatesForJob: (jobId) => get().candidates.filter(c => c.jobId === jobId),

      moveStage: (id, stage, note) => {
        const now = new Date().toISOString();
        const event: StageEvent = { stage, timestamp: now, note };
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id
              ? {
                  ...c,
                  stage,
                  isShortlisted: stage === 'Shortlisted' ? true : c.isShortlisted,
                  isShared: stage === 'Client Shared' ? true : c.isShared,
                  stageHistory: [...c.stageHistory, event],
                  updatedAt: now,
                }
              : c
          ),
        }));
      },

      addResume: (id, file) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id ? { ...c, resumes: [...c.resumes, file] } : c
          ),
        }));
      },

      removeResume: (id, fileId) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id ? { ...c, resumes: c.resumes.filter(r => r.id !== fileId) } : c
          ),
        }));
      },

      addSharedEvent: (id, event) => {
        const sharedEvent: SharedEvent = { ...event, id: generateId() };
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id
              ? { ...c, sharedHistory: [...c.sharedHistory, sharedEvent], isShared: true }
              : c
          ),
        }));
      },

      updateSharedEvent: (candidateId, eventId, updates) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === candidateId
              ? {
                  ...c,
                  sharedHistory: c.sharedHistory.map(e =>
                    e.id === eventId ? { ...e, ...updates } : e
                  ),
                }
              : c
          ),
        }));
      },

      toggleShortlisted: (id) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id ? { ...c, isShortlisted: !c.isShortlisted } : c
          ),
        }));
      },

      duplicateToJob: (candidateId, newJobId) => {
        const original = get().candidates.find(c => c.id === candidateId);
        if (!original) return undefined;
        const now = new Date().toISOString();
        const dup: Candidate = {
          ...original,
          id: generateId(),
          jobId: newJobId,
          stage: 'Collected',
          stageHistory: [{ stage: 'Collected', timestamp: now }],
          sharedHistory: [],
          isShortlisted: false,
          isShared: false,
          aiScore: undefined,
          aiSummary: undefined,
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ candidates: [...s.candidates, dup] }));
        return dup;
      },

      addTag: (id, tag) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id && !c.tags.includes(tag)
              ? { ...c, tags: [...c.tags, tag] }
              : c
          ),
        }));
      },

      removeTag: (id, tag) => {
        set(s => ({
          candidates: s.candidates.map(c =>
            c.id === id ? { ...c, tags: c.tags.filter(t => t !== tag) } : c
          ),
        }));
      },
    }),
    { name: 'recruitflow-candidates' }
  )
);
