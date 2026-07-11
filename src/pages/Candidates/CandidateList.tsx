import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, ExternalLink, Eye, Phone, Mail, Building2, Briefcase, Star } from 'lucide-react';
import { useCandidateStore } from '../../store/useCandidateStore';
import { useJobStore } from '../../store/useJobStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import Button from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { exportCandidatesToCSV } from '../../utils/exportUtils';
import { PIPELINE_STAGES } from '../../types';

export default function CandidateList() {
  const navigate = useNavigate();
  const candidates = useCandidateStore(s => s.candidates);
  const updateCandidate = useCandidateStore(s => s.updateCandidate);
  const jobs = useJobStore(s => s.jobs);
  const companies = useCompanyStore(s => s.companies);
  
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [jobFilter, setJobFilter] = useState('All');

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      if (stageFilter !== 'All' && c.stage !== stageFilter) return false;
      if (jobFilter !== 'All' && c.jobId !== jobFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.currentRole.toLowerCase().includes(q) ||
          c.currentCompany.toLowerCase().includes(q) ||
          c.skills.some(s => s.toLowerCase().includes(q))
        );
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [candidates, search, stageFilter, jobFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Global Candidate Database</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View and search all candidates across all jobs ({candidates.length} total)</p>
        </div>
        <div className="page-header-actions">
          <Button variant="secondary" onClick={() => exportCandidatesToCSV(filteredCandidates, jobs, companies)}>
            Export to CSV
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <div style={{ flex: '1 1 200px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
          <input 
            style={{ width: '100%', height: '36px', padding: '0 12px 0 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)' }}
            placeholder="Search by name, email, role, company or skills..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '16px', flex: '1 1 auto', flexWrap: 'wrap', minWidth: 0 }}>
          <select 
            style={{ flex: 1, minWidth: '140px', maxWidth: '100%', height: '36px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
          >
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select 
            style={{ flex: 1, minWidth: '140px', maxWidth: '100%', height: '36px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            value={jobFilter}
            onChange={e => setJobFilter(e.target.value)}
          >
            <option value="All">All Jobs</option>
            {jobs.map(j => <option key={j.id} value={j.id}>{j.title} ({j.clientName})</option>)}
          </select>
        </div>
      </div>

      {filteredCandidates.length > 0 ? (
        <div className="table-responsive" style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Candidate</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Current Role</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Applied Job</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Review</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Stage</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.map(c => {
                const job = jobs.find(j => j.id === c.jobId);
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.fullName}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {c.email && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Mail size={12}/> {c.email}</span>}
                        {c.phone && <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Phone size={12}/> {c.phone}</span>}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{c.currentRole || 'Role not specified'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.currentCompany ? `${c.currentCompany} • ` : ''}{c.experience} yrs
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {job ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: `var(--${job.colorLabel})` }} />
                          <span style={{ fontSize: '0.857rem', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>
                            {job.title}
                          </span>
                        </div>
                      ) : <span style={{ color: 'var(--text-muted)' }}>Unknown Job</span>}
                    </td>
                    <td style={{ padding: '16px', verticalAlign: 'top' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              size={14} 
                              onClick={() => updateCandidate(c.id, { rating: star })}
                              fill={c.rating && c.rating >= star ? 'var(--warning)' : 'transparent'}
                              color={c.rating && c.rating >= star ? 'var(--warning)' : 'var(--border)'}
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                            />
                          ))}
                        </div>
                        <input 
                          type="text" 
                          placeholder="Quick note..." 
                          defaultValue={c.notes || ''}
                          onBlur={(e) => updateCandidate(c.id, { notes: e.target.value })}
                          style={{
                            width: '100%',
                            minWidth: '120px',
                            padding: '4px 8px',
                            fontSize: '0.75rem',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--surface-2)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <select
                        value={c.stage}
                        onChange={(e) => {
                          const { moveStage } = useCandidateStore.getState();
                          moveStage(c.id, e.target.value as any, `Moved to ${e.target.value} from global list`);
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
                    <td style={{ padding: '16px' }}>
                      <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => navigate(`/candidates/${c.id}`)}>
                        View Profile
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <Users size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No candidates found</h3>
          <p style={{ color: 'var(--text-muted)' }}>Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}
