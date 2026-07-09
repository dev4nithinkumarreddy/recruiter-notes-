import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Download, Eye, Trash2 } from 'lucide-react';
import { useCandidateStore } from '../../store/useCandidateStore';
import { getFile, deleteFile } from '../../utils/db';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';

export default function ResumeLibrary() {
  const navigate = useNavigate();
  const candidates = useCandidateStore(s => s.candidates);
  const removeResume = useCandidateStore(s => s.removeResume);
  const [search, setSearch] = useState('');

  const handleDownload = async (dbKey: string, fileName: string) => {
    try {
      const data = await getFile(dbKey);
      if (data) {
        const link = document.createElement('a');
        link.href = data as string;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Download started');
      } else {
        toast.error('File not found in local database');
      }
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (candidateId: string, resumeId: string, dbKey: string) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await deleteFile(dbKey);
      removeResume(candidateId, resumeId);
      toast.success('Resume deleted successfully');
    } catch (err) {
      toast.error('Failed to delete resume');
    }
  };

  // Extract all resumes from all candidates
  const allResumes = candidates.flatMap(c => 
    c.resumes?.map(r => ({ ...r, candidate: c })) || []
  ).filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) || 
    r.candidate.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Resume Library</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and search through all uploaded candidate resumes.</p>
        </div>
        <div className="page-header-actions">
          <Button onClick={() => navigate('/candidates')}>Go to Candidates to Upload</Button>
        </div>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
        <input 
          style={{ width: '100%', height: '36px', padding: '0 12px 0 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
          placeholder="Search by file name or candidate name..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {allResumes.length > 0 ? (
        <div className="table-responsive" style={{ flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>File Name</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Candidate</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Upload Date</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Size</th>
                <th style={{ padding: '12px 16px', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allResumes.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileText size={16} color="var(--primary)" />
                    <span style={{ fontWeight: 500 }}>{r.name}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 500 }} onClick={() => navigate(`/candidates/${r.candidate.id}`)}>
                      {r.candidate.fullName}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {new Date(r.uploadedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {(r.size / 1024).toFixed(1)} KB
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button onClick={() => navigate(`/candidates/${r.candidate.id}`)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="View Profile">
                        <Eye size={16}/>
                      </button>
                      <button onClick={() => handleDownload(r.dbKey, r.name)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Download">
                        <Download size={16}/>
                      </button>
                      <button onClick={() => handleDelete(r.candidate.id, r.id, r.dbKey)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }} title="Delete">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <FileText size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No resumes found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Upload resumes directly from the candidate profile page.</p>
        </div>
      )}
    </div>
  );
}
