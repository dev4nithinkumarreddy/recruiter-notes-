import type { Job, Candidate, Company } from '../types';

export interface SearchResult {
  type: 'job' | 'candidate' | 'company';
  id: string;
  title: string;
  subtitle: string;
  url: string;
}

function normalize(str: string): string {
  return str.toLowerCase().trim();
}

function matches(field: string, query: string): boolean {
  return normalize(field).includes(normalize(query));
}

export function searchAll(
  query: string,
  jobs: Job[],
  candidates: Candidate[],
  companies: Company[]
): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.trim();
  const results: SearchResult[] = [];

  jobs.forEach(job => {
    if (
      matches(job.title, q) ||
      matches(job.clientName, q) ||
      matches(job.department, q) ||
      matches(job.location, q) ||
      job.skills.some(s => matches(s, q)) ||
      matches(job.notes, q)
    ) {
      results.push({
        type: 'job',
        id: job.id,
        title: job.title,
        subtitle: `${job.clientName} · ${job.status}`,
        url: `/jobs/${job.id}`,
      });
    }
  });

  candidates.forEach(c => {
    if (
      matches(c.fullName, q) ||
      matches(c.email, q) ||
      matches(c.phone, q) ||
      matches(c.currentCompany, q) ||
      matches(c.currentRole, q) ||
      matches(c.notes, q) ||
      c.skills.some(s => matches(s, q)) ||
      c.tags.some(t => matches(t, q))
    ) {
      results.push({
        type: 'candidate',
        id: c.id,
        title: c.fullName,
        subtitle: `${c.currentRole} at ${c.currentCompany}`,
        url: `/candidates/${c.id}`,
      });
    }
  });

  companies.forEach(co => {
    if (
      matches(co.name, q) ||
      matches(co.industry, q) ||
      matches(co.hrContactName, q) ||
      matches(co.hrEmail, q) ||
      matches(co.notes, q)
    ) {
      results.push({
        type: 'company',
        id: co.id,
        title: co.name,
        subtitle: co.industry,
        url: `/companies/${co.id}`,
      });
    }
  });

  return results.slice(0, 20);
}
