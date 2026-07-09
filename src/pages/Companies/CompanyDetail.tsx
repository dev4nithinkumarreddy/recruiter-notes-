import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Globe, Mail, Phone, MapPin, Briefcase } from 'lucide-react';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useJobStore } from '../../store/useJobStore';
import Button from '../../components/ui/Button';

export default function CompanyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const company = useCompanyStore(s => s.getCompany(id!));
  const jobs = useJobStore(s => s.jobs.filter(j => j.companyId === id || j.clientName.toLowerCase() === company?.name.toLowerCase()));

  if (!company) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <h2>Company Not Found</h2>
        <Button onClick={() => navigate('/companies')}>Back to Companies</Button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      {/* Header */}
      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: 'var(--radius-lg)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={40} color="var(--text-secondary)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 4px 0' }}>{company.name}</h1>
              <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                {company.industry || 'No industry specified'}
              </div>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {company.website && (
                  <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--primary)', textDecoration: 'none' }}>
                    <Globe size={14}/> {company.website}
                  </a>
                )}
                {company.address && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><MapPin size={14}/> {company.address}</div>}
              </div>
            </div>
          </div>
          <Button variant="secondary">Edit Company</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Contact Details */}
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>HR Contact</div>
                <div style={{ fontWeight: 500 }}>{company.hrContactName || 'N/A'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>HR Email</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Mail size={14} color="var(--text-secondary)" />
                  {company.hrEmail ? <a href={`mailto:${company.hrEmail}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{company.hrEmail}</a> : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>HR Phone</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
                  <Phone size={14} color="var(--text-secondary)" />
                  {company.hrPhone || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>Hiring Manager</div>
                <div style={{ fontWeight: 500 }}>{company.hiringManager || 'N/A'}</div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {company.notes && (
            <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Notes</h3>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', lineHeight: 1.5, fontSize: '0.9rem' }}>{company.notes}</p>
            </div>
          )}
        </div>

        {/* Associated Jobs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Associated Jobs ({jobs.length})</h3>
              <Button size="sm" onClick={() => navigate('/jobs?new=1')}>Add Job</Button>
            </div>
            
            {jobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {jobs.map(job => (
                  <div key={job.id} onClick={() => navigate(`/jobs/${job.id}`)} style={{ padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all var(--transition)' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{job.title}</div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.857rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12}/> {job.location || 'Remote'}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Briefcase size={12}/> {job.employmentType}</span>
                      </div>
                    </div>
                    <span className={`badge ${job.status === 'Open' ? 'badge-success' : job.status === 'Hold' ? 'badge-warning' : 'badge-muted'}`}>
                      {job.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                No jobs associated with this company yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
