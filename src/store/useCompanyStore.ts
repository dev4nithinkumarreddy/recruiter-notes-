import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Company, FileRef } from '../types';

const generateId = () => `comp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

interface CompanyStore {
  companies: Company[];
  addCompany: (c: Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'documents'>) => Company;
  updateCompany: (id: string, updates: Partial<Company>) => void;
  deleteCompany: (id: string) => void;
  getCompany: (id: string) => Company | undefined;
  toggleFavorite: (id: string) => void;
  addDocument: (id: string, file: FileRef) => void;
  removeDocument: (id: string, fileId: string) => void;
}

export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set, get) => ({
      companies: [],

      addCompany: (data) => {
        const now = new Date().toISOString();
        const company: Company = {
          ...data,
          id: generateId(),
          documents: [],
          createdAt: now,
          updatedAt: now,
        };
        set(s => ({ companies: [company, ...s.companies] }));
        return company;
      },

      updateCompany: (id, updates) => {
        set(s => ({
          companies: s.companies.map(c =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
          ),
        }));
      },

      deleteCompany: (id) => {
        set(s => ({ companies: s.companies.filter(c => c.id !== id) }));
      },

      getCompany: (id) => get().companies.find(c => c.id === id),

      toggleFavorite: (id) => {
        set(s => ({
          companies: s.companies.map(c =>
            c.id === id ? { ...c, isFavorite: !c.isFavorite } : c
          ),
        }));
      },

      addDocument: (id, file) => {
        set(s => ({
          companies: s.companies.map(c =>
            c.id === id ? { ...c, documents: [...c.documents, file] } : c
          ),
        }));
      },

      removeDocument: (id, fileId) => {
        set(s => ({
          companies: s.companies.map(c =>
            c.id === id ? { ...c, documents: c.documents.filter(d => d.id !== fileId) } : c
          ),
        }));
      },
    }),
    { name: 'recruitflow-companies' }
  )
);
