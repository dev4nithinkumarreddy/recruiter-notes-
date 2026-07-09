import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase, Linkedin, Clock, Calendar, FileText, CheckCircle, Upload, Sparkles } from 'lucide-react';
import { useCandidateStore } from '../../store/useCandidateStore';
import { useJobStore } from '../../store/useJobStore';
import { useActivityStore } from '../../store/useActivityStore';
import { formatDate, formatRelative } from '../../utils/dateUtils';
import { saveFile, getFile } from '../../utils/db';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import AiMessageModal from '../../components/candidates/AiMessageModal';

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const candidate = useCandidateStore(s => s.getCandidate(id!));
  const updateCandidate = useCandidateStore(s => s.updateCandidate);
  const job = useJobStore(s => s.getJob(candidate?.jobId || ''));
  const activities = useActivityStore(s => s.activities.filter(a => a.candidateId === id));

  const [activeTab, setActiveTab] = useState<'overview' | 'resume' | 'timeline'>('overview');
  const [resumeData, setResumeData] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'resume' && candidate?.resumes?.[0]?.dbKey) {
      getFile(candidate.resumes[0].dbKey).then(data => {
        if (data) setResumeData(data as string);
      }).catch(err => {
        console.error('Failed to load resume:', err);
        toast.error('Failed to load resume document');
      });
    }
  }, [activeTab, candidate?.resumes]);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !candidate) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File is too large (max 10MB)');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result as string;
        const dbKey = `resume_${candidate.id}_${Date.now()}`;
        
        await saveFile(dbKey, base64Data);
        
        updateCandidate(candidate.id, {
          resumes: [{
            id: dbKey,
            name: file.name,
            type: file.type || 'application/pdf',
            size: file.size,
            uploadedAt: new Date().toISOString(),
            dbKey: dbKey
          }]
        });
        
        toast.success('Resume uploaded successfully!');
        setResumeData(base64Data);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save resume');
    }
  };

  if (!candidate) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <h2>Candidate Not Found</h2>
        <Button onClick={() => navigate('/candidates')}>Back to Candidates</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '24px' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <div className="page-header">
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary-soft)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 600, flexShrink: 0 }}>
              {candidate.fullName.charAt(0)}
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 4px 0' }}>{candidate.fullName}</h1>
              <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {candidate.currentRole} at {candidate.currentCompany}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {candidate.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><Mail size={14}/> {candidate.email}</div>}
                {candidate.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><Phone size={14}/> {candidate.phone}</div>}
                {candidate.currentLocation && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><MapPin size={14}/> {candidate.currentLocation}</div>}
                {candidate.linkedin && (
                  <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--primary)', textDecoration: 'none' }}>
                    <Linkedin size={14}/> LinkedIn Profile
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="page-header-actions" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="secondary" icon={<Sparkles size={16} />} onClick={() => setIsAiModalOpen(true)}>
                Draft Message
              </Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className={`badge ${candidate.stage === 'Rejected' || candidate.stage === 'Dropped' ? 'badge-danger' : candidate.stage === 'Joined' || candidate.stage === 'Selected' ? 'badge-success' : 'badge-primary'}`} style={{ fontSize: '0.9rem', padding: '6px 12px' }}>
                {candidate.stage}
              </span>
            </div>
            {job && (
              <div style={{ fontSize: '0.857rem', color: 'var(--text-secondary)' }}>
                Applied for: <span style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job.id}`)}>{job.title}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        {(['overview', 'resume', 'timeline'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 500,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Briefcase size={18}/> Experience & Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Total Experience</div>
                    <div style={{ fontWeight: 500 }}>{candidate.experience} Years</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Notice Period</div>
                    <div style={{ fontWeight: 500 }}>{candidate.noticePeriod || 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Current CTC</div>
                    <div style={{ fontWeight: 500 }}>{candidate.currentCTC ? `${candidate.currentCTC} LPA` : 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Expected CTC</div>
                    <div style={{ fontWeight: 500 }}>{candidate.expectedCTC ? `${candidate.expectedCTC} LPA` : 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Preferred Location</div>
                    <div style={{ fontWeight: 500 }}>{candidate.preferredLocation || 'Not specified'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Source</div>
                    <div style={{ fontWeight: 500 }}><span className="badge badge-muted">{candidate.source}</span></div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Skills</h3>
                {candidate.skills && candidate.skills.length > 0 ? (
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {candidate.skills.map((s, i) => (
                      <span key={i} className="badge badge-primary">{s}</span>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No skills recorded.</div>
                )}
              </div>

              {candidate.notes && (
                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Recruiter Notes</h3>
                  <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.5 }}>{candidate.notes}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Stage History</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '16px' }}>
                  <div style={{ position: 'absolute', left: 3, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
                  {candidate.stageHistory.map((h, i) => (
                    <div key={i} style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', left: -18, top: 4, width: 10, height: 10, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--primary)' }} />
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{h.stage}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(h.timestamp)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'resume' && (
          <div style={{ height: '100%', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            {candidate.resumes && candidate.resumes.length > 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{candidate.resumes[0].name}</h3>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx" 
                      id="resume-reupload" 
                      style={{ display: 'none' }} 
                      onChange={handleResumeUpload}
                    />
                    <Button variant="secondary" icon={<Upload size={16} />} onClick={() => document.getElementById('resume-reupload')?.click()}>
                      Upload New Resume
                    </Button>
                  </div>
                </div>
                
                {resumeData ? (
                  <iframe 
                    src={resumeData} 
                    style={{ width: '100%', height: '100%', flex: 1, border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }} 
                    title="Resume Viewer"
                  />
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                    Loading resume...
                  </div>
                )}
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', padding: '48px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', textAlign: 'center', margin: 'auto 0' }}>
                <FileText size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Resume Uploaded</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0 auto 24px' }}>Upload a PDF resume to view it here directly.</p>
                
                <input 
                  type="file" 
                  accept=".pdf,.doc,.docx" 
                  id="resume-upload" 
                  style={{ display: 'none' }} 
                  onChange={handleResumeUpload}
                />
                <Button icon={<Upload size={16} />} onClick={() => document.getElementById('resume-upload')?.click()}>
                  Upload Resume
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Candidate Timeline</h3>
            {activities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', paddingLeft: '24px' }}>
                <div style={{ position: 'absolute', left: 7, top: 8, bottom: 8, width: 2, background: 'var(--border)' }} />
                {activities.map(act => (
                  <div key={act.id} style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: -24, top: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--surface)', border: '2px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle size={10} color="var(--text-muted)" />
                    </div>
                    <div style={{ fontSize: '0.857rem', color: 'var(--text-primary)' }}>{act.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{formatRelative(act.createdAt)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No activities logged for this candidate yet.</p>
            )}
          </div>
        )}
      </div>

      <AiMessageModal 
        candidate={candidate}
        job={job}
        open={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
