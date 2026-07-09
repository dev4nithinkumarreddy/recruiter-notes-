import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Search, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCompanyStore } from '../../store/useCompanyStore';
import { useJobStore } from '../../store/useJobStore';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea } from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';
import type { Company } from '../../types';

export default function CompanyList() {
  const navigate = useNavigate();
  const companies = useCompanyStore(s => s.companies);
  const addCompany = useCompanyStore(s => s.addCompany);
  const jobs = useJobStore(s => s.jobs);
  
  const [search, setSearch] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Company, 'id' | 'createdAt' | 'updatedAt' | 'documents'>>();

  const filtered = companies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const onSubmit = (data: any) => {
    addCompany(data);
    toast.success('Company added successfully');
    reset();
    setModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Companies</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your clients and organizations</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Company</Button>
      </div>

      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 10, color: 'var(--text-muted)' }} />
        <input 
          style={{ width: '100%', height: '36px', padding: '0 12px 0 36px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface)' }}
          placeholder="Search companies by name or industry..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(company => {
            const companyJobs = jobs.filter(j => j.companyId === company.id || j.clientName.toLowerCase() === company.name.toLowerCase());
            
            return (
              <div 
                key={company.id} 
                onClick={() => navigate(`/companies/${company.id}`)}
                style={{ background: 'var(--surface)', padding: '20px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', cursor: 'pointer', transition: 'all var(--transition)' }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Building2 size={24} color="var(--text-secondary)" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{company.name}</h3>
                    <div style={{ fontSize: '0.857rem', color: 'var(--text-secondary)' }}>{company.industry || 'No industry specified'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                  {company.website && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><Globe size={14}/> {company.website}</div>}
                  {company.hrContactName && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><Mail size={14}/> HR: {company.hrContactName}</div>}
                  {company.address && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.857rem', color: 'var(--text-muted)' }}><MapPin size={14}/> {company.address}</div>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                  <span className="badge badge-primary">{companyJobs.length} Jobs</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>View Details &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
          <Building2 size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No companies found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add a company to start managing your clients.</p>
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add First Company</Button>
        </div>
      )}

      {isModalOpen && (
        <Modal open={isModalOpen} onClose={() => setModalOpen(false)} title="Add Company" size="lg" footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmit)}>Save Company</Button>
          </>
        }>
          <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Company Name" required {...register('name', { required: 'Name is required' })} error={errors.name?.message} style={{ gridColumn: '1 / -1' }} />
            <Input label="Industry" {...register('industry')} />
            <Input label="Website" {...register('website')} />
            <Input label="HR Contact Name" {...register('hrContactName')} />
            <Input label="HR Email" type="email" {...register('hrEmail')} />
            <Input label="HR Phone" {...register('hrPhone')} />
            <Input label="Hiring Manager" {...register('hiringManager')} />
            <Input label="Location / Address" {...register('address')} style={{ gridColumn: '1 / -1' }} />
            <Textarea label="Notes" {...register('notes')} style={{ gridColumn: '1 / -1' }} />
          </form>
        </Modal>
      )}
    </div>
  );
}
