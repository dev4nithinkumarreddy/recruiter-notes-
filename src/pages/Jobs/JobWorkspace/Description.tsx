import { useOutletContext } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { Job } from '../../../types';

export default function JobDescription() {
  const { job } = useOutletContext<{ job: Job }>();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>Job Description</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.857rem' }}>Detailed requirements and description for this role.</p>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: '400px', flex: 1, overflowY: 'auto' }}>
        {job.description ? (
          <div 
            style={{ 
              whiteSpace: 'pre-wrap', 
              color: 'var(--text-primary)',
              lineHeight: '1.6',
              fontSize: '0.95rem'
            }}
          >
            {job.description}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            <FileText size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.1rem', marginBottom: '8px', color: 'var(--text-primary)' }}>No description provided</h3>
            <p style={{ textAlign: 'center', maxWidth: '400px' }}>
              You haven't added a description for this job yet. Click the Edit button in the top right corner to add one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
