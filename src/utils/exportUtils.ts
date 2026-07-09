import type { Candidate, Job, Company } from '../types';

export const downloadCSV = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const escapeCSV = (str: string | number | undefined | null) => {
  if (str === null || str === undefined) return '';
  const stringValue = String(str);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

export const exportCandidatesToCSV = (candidates: Candidate[], jobs: Job[], companies: Company[]) => {
  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Current Role',
    'Current Company',
    'Experience (Years)',
    'Current Location',
    'Stage',
    'Applied Job',
    'Job Client/Company',
    'Source',
    'Skills',
  ];

  const rows = candidates.map(c => {
    const job = jobs.find(j => j.id === c.jobId);
    const company = companies.find(comp => comp.id === job?.companyId);
    
    return [
      c.fullName,
      c.email,
      c.phone,
      c.currentRole,
      c.currentCompany,
      c.experience,
      c.currentLocation,
      c.stage,
      job?.title || 'Unknown Job',
      company?.name || job?.clientName || '',
      c.source,
      c.skills?.join(', ') || ''
    ].map(escapeCSV).join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  downloadCSV(`candidates_export_${new Date().toISOString().split('T')[0]}.csv`, csvContent);
};
