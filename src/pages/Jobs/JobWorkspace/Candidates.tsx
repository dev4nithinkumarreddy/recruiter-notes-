import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, MoreVertical, Eye, FileText, CheckCircle, XCircle, ArrowRight, Users } from 'lucide-react';
import { useCandidateStore } from '../../../store/useCandidateStore';
import { useActivityStore } from '../../../store/useActivityStore';
import { formatDate } from '../../../utils/dateUtils';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Input, Textarea, Select } from '../../../components/ui/Input';
import { useForm } from 'react-hook-form';
import { toast } from '../../../components/ui/Toast';
import { saveFile } from '../../../utils/db';
import { useSettingsStore } from '../../../store/useSettingsStore';
import { extractTextFromPDF } from '../../../utils/pdfParser';
import { extractDetailsFromResume } from '../../../utils/groqApi';
import type { Job, Candidate, PipelineStage } from '../../../types';
import { PIPELINE_STAGES } from '../../../types';
import styles from './JobWorkspace.module.css';

export default function Candidates() {
  const { job } = useOutletContext<{ job: Job }>();
  const navigate = useNavigate();
  
  const candidates = useCandidateStore(s => s.getCandidatesForJob(job.id));
  const { addCandidate, moveStage, toggleShortlisted } = useCandidateStore();
  const logActivity = useActivityStore(s => s.log);

  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState<PipelineStage | 'All'>('All');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // Filter candidates
  const filtered = candidates.filter(c => {
    if (stageFilter !== 'All' && c.stage !== stageFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        c.fullName.toLowerCase().includes(q) ||
        c.currentRole.toLowerCase().includes(q) ||
        c.currentCompany.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleShortlist = (c: Candidate) => {
    toggleShortlisted(c.id);
    logActivity({
      jobId: job.id,
      candidateId: c.id,
      type: 'candidate_shortlisted',
      description: `${c.fullName} was ${!c.isShortlisted ? 'shortlisted' : 'removed from shortlist'}.`
    });
    toast.success(`${c.fullName} ${!c.isShortlisted ? 'shortlisted' : 'un-shortlisted'}`);
  };

  const handleReject = (c: Candidate) => {
    moveStage(c.id, 'Rejected', 'Rejected from list view');
    logActivity({
      jobId: job.id,
      candidateId: c.id,
      type: 'stage_changed',
      description: `${c.fullName} was rejected.`
    });
    toast.info(`${c.fullName} marked as rejected`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={16} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-muted)' }} />
            <input 
              style={{ width: '100%', height: '36px', padding: '0 12px 0 34px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
              placeholder="Search candidates..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            style={{ height: '36px', padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value as any)}
          >
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        
        <Button icon={<Plus size={16} />} onClick={() => setAddModalOpen(true)}>
          Add Candidate
        </Button>
      </div>

      {filtered.length > 0 ? (
        <div className={styles.tableContainer} style={{ flex: 1, overflowY: 'auto' }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Current Role</th>
                <th>Experience</th>
                <th>Source</th>
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
                    <div>{c.currentRole || 'Role not specified'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.currentCompany ? `at ${c.currentCompany}` : ''}
                    </div>
                  </td>
                  <td>{c.experience} Yrs</td>
                  <td><span className="badge badge-muted">{c.source}</span></td>
                  <td>
                    <select
                      value={c.stage}
                      onChange={(e) => {
                        moveStage(c.id, e.target.value as PipelineStage, `Moved to ${e.target.value} from list`);
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '4px' }}>
                      <button className={styles.iconBtn} onClick={() => handleShortlist(c)} title="Toggle Shortlist">
                        <CheckCircle size={14} color={c.isShortlisted ? 'var(--success)' : 'currentColor'} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => navigate(`/candidates/${c.id}`)} title="View Profile">
                        <Eye size={14} />
                      </button>
                      <button className={styles.iconBtn} onClick={() => handleReject(c)} title="Reject">
                        <XCircle size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Users size={48} color="var(--border)" />
          <h3>No candidates found</h3>
          <p>You haven't added any candidates matching your filters yet.</p>
          <Button icon={<Plus size={16} />} onClick={() => setAddModalOpen(true)}>Add First Candidate</Button>
        </div>
      )}

      {/* Add Candidate Modal */}
      {isAddModalOpen && (
        <AddCandidateModal 
          jobId={job.id} 
          open={isAddModalOpen} 
          onClose={() => setAddModalOpen(false)} 
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------
// Add Candidate Modal Component
// ----------------------------------------------------------------------

interface AddCandidateModalProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

type CandidateFormData = {
  fullName: string;
  experience: number;
  notes: string;
  source: string;
  resume?: FileList;
};

function AddCandidateModal({ jobId, open, onClose }: AddCandidateModalProps) {
  const addCandidate = useCandidateStore(s => s.addCandidate);
  const logActivity = useActivityStore(s => s.log);
  const groqKey = useSettingsStore(s => s.settings.groqKey);

  const [isExtracting, setIsExtracting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CandidateFormData>();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.type !== 'application/pdf') return;

    if (!groqKey) {
      toast.info('Groq API Key not set. AI extraction skipped.');
      return;
    }

    try {
      setIsExtracting(true);
      toast.info('Extracting resume details with AI...');
      
      const text = await extractTextFromPDF(file);
      const details = await extractDetailsFromResume(text, groqKey);
      
      if (details.fullName) setValue('fullName', details.fullName);
      if (details.experience !== undefined) setValue('experience', details.experience);
      if (details.notes) setValue('notes', details.notes);
      
      // Assuming we'll add other fields to CandidateFormData in the future or we could log them
      if (details.skills && details.skills.length > 0) {
        setValue('notes', (details.notes || '') + '\n\nSkills: ' + details.skills.join(', '));
      }
      
      toast.success('Resume details extracted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to extract details from resume.');
    } finally {
      setIsExtracting(false);
    }
  };

  const onSubmit = async (data: CandidateFormData) => {
    const newCand = addCandidate({
      jobId,
      fullName: data.fullName,
      experience: Number(data.experience) || 0,
      notes: data.notes || '',
      email: '',
      phone: '',
      linkedin: '',
      currentRole: '',
      currentCompany: '',
      noticePeriod: '',
      currentCTC: 0,
      expectedCTC: 0,
      currentLocation: '',
      preferredLocation: '',
      source: (data.source as any) || 'Other',
      stage: 'Collected',
      skills: [],
      tags: [],
      interviewFeedback: '',
      isShortlisted: false,
      isShared: false,
    });
    
    const file = data.resume?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning('Candidate added, but resume was too large (max 10MB).');
      } else {
        try {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const base64Data = event.target?.result as string;
            const dbKey = `resume_${newCand.id}_${Date.now()}`;
            
            await saveFile(dbKey, base64Data);
            
            useCandidateStore.getState().addResume(newCand.id, {
              id: dbKey,
              name: file.name,
              type: file.type || 'application/pdf',
              size: file.size,
              uploadedAt: new Date().toISOString(),
              dbKey: dbKey
            });
          };
          reader.readAsDataURL(file);
        } catch (err) {
          console.error('Failed to save resume:', err);
          toast.warning('Candidate added, but resume failed to upload.');
        }
      }
    }

    logActivity({
      jobId,
      candidateId: newCand.id,
      type: 'candidate_added',
      description: `Added candidate ${newCand.fullName}`
    });

    toast.success('Candidate added successfully');
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Candidate" size="md" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Save Candidate</Button>
      </>
    }>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Full Name" 
          required 
          {...register('fullName', { required: 'Name is required' })}
          error={errors.fullName?.message}
          placeholder="e.g. Jane Doe"
        />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label style={{ fontSize: '0.857rem', fontWeight: 500, color: 'var(--text-primary)' }}>Resume</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              {...(() => {
                const { onChange, ...rest } = register('resume');
                return {
                  ...rest,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    onChange(e);
                    handleFileUpload(e);
                  }
                };
              })()}
              style={{ 
                padding: '8px', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border)', 
                background: 'var(--surface-2)',
                fontSize: '0.857rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                flex: 1
              }} 
            />
            {isExtracting && <span style={{ fontSize: '0.857rem', color: 'var(--primary)' }}>Extracting...</span>}
          </div>
        </div>

        <Input 
          label="Experience (Years)" 
          type="number" 
          step="0.5" 
          {...register('experience')} 
          placeholder="e.g. 3.5"
        />

        <Select label="Source" {...register('source')}>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Naukri">Naukri</option>
          <option value="Indeed">Indeed</option>
          <option value="Referral">Referral</option>
          <option value="Internal">Internal Database</option>
          <option value="Walk-in">Walk-in</option>
          <option value="Other">Other</option>
        </Select>
        
        <Textarea 
          label="Recruiter Notes" 
          {...register('notes')} 
          placeholder="Add any preliminary feedback or notes here..."
          rows={4}
        />
      </form>
    </Modal>
  );
}
