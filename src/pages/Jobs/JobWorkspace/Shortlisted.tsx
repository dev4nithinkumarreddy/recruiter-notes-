import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useCandidateStore } from '../../../store/useCandidateStore';
import { useActivityStore } from '../../../store/useActivityStore';
import { PIPELINE_STAGES } from '../../../types';
import type { Job, PipelineStage } from '../../../types';
import { toast } from '../../../components/ui/Toast';
import { Search, Mail, Calendar as CalendarIcon, XCircle } from 'lucide-react';
import { Input } from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import styles from './JobWorkspace.module.css';

export default function Shortlisted() {
  const { job } = useOutletContext<{ job: Job }>();
  const getCandidatesForJob = useCandidateStore(s => s.getCandidatesForJob);
  const moveStage = useCandidateStore(s => s.moveStage);
  const updateCandidate = useCandidateStore(s => s.updateCandidate);
  const logActivity = useActivityStore(s => s.log);

  const [search, setSearch] = useState('');

  const candidates = getCandidatesForJob(job.id);

  const advancedStages = [
    'Shortlisted', 'Interview Round 1', 'Interview Round 2', 
    'Technical Round', 'HR Round', 'Selected', 'Offer Released', 'Joined'
  ];

  const shortlistedCandidates = candidates.filter(c => 
    c.isShortlisted || advancedStages.includes(c.stage)
  );

  const filtered = shortlistedCandidates.filter(c => 
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.currentRole.toLowerCase().includes(search.toLowerCase())
  );

  const handleUnshortlist = (id: string, name: string) => {
    updateCandidate(id, { isShortlisted: false });
    toast.info(`${name} removed from shortlisted view (if stage is also reverted)`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Shortlisted Candidates</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {filtered.length} candidates in advanced stages
          </p>
        </div>

        <div style={{ width: '300px' }}>
          <Input 
            icon={<Search size={18} />} 
            placeholder="Search shortlisted..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No shortlisted candidates found. Try updating candidate stages to "Shortlisted".
          </div>
        ) : (
          <div className={styles.tableContainer} style={{ flex: 1, overflowY: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Current Role</th>
                  <th>Experience</th>
                  <th>Stage</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{c.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.email}</div>
                    </td>
                    <td>
                      <div>{c.currentRole || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.currentCompany ? `at ${c.currentCompany}` : ''}</div>
                    </td>
                    <td>{c.experience} Yrs</td>
                    <td>
                      <select
                        value={c.stage}
                        onChange={(e) => {
                          moveStage(c.id, e.target.value as PipelineStage, `Moved to ${e.target.value} from shortlisted view`);
                          logActivity({
                            jobId: job.id,
                            candidateId: c.id,
                            type: 'stage_changed',
                            description: `${c.fullName} moved to ${e.target.value}.`
                          });
                          toast.success(`Stage updated to ${e.target.value}`);
                        }}
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border)',
                          background: c.stage === 'Rejected' || c.stage === 'Dropped' ? 'var(--danger-soft)' 
                                    : c.stage === 'Joined' || c.stage === 'Selected' ? 'var(--success-soft)' 
                                    : 'var(--primary-soft)',
                          color: c.stage === 'Rejected' || c.stage === 'Dropped' ? 'var(--danger)' 
                                    : c.stage === 'Joined' || c.stage === 'Selected' ? 'var(--success)' 
                                    : 'var(--primary)',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          outline: 'none'
                        }}
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <Button variant="secondary" size="sm" icon={<Mail size={14} />} onClick={() => window.open(`mailto:${c.email}`)} title="Email" />
                        <Button variant="secondary" size="sm" icon={<CalendarIcon size={14} />} title="Schedule" />
                        <Button variant="danger" size="sm" icon={<XCircle size={14} />} onClick={() => handleUnshortlist(c.id, c.fullName)} title="Remove isShortlisted flag" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
