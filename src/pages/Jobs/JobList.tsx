import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Plus, Search, LayoutGrid, List, Pin, Archive, 
  MoreVertical, Copy, Building2, Users, Clock, Briefcase
} from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useJobStore } from '../../store/useJobStore';
import { useCandidateStore } from '../../store/useCandidateStore';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Textarea, Select } from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';
import type { Job, Priority, JobStatus, ColorLabel } from '../../types';
import styles from './JobList.module.css';

const COLORS: ColorLabel[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'black'];

export default function JobList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isNewJob = searchParams.get('new') === '1';

  const jobs = useJobStore(s => s.jobs);
  const { togglePin, toggleArchive, cloneJob } = useJobStore();
  const candidates = useCandidateStore(s => s.candidates);

  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | JobStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | Priority>('All');
  const [showArchived, setShowArchived] = useState(false);

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    let filtered = jobs.filter(j => j.isArchived === showArchived);
    if (statusFilter !== 'All') filtered = filtered.filter(j => j.status === statusFilter);
    if (priorityFilter !== 'All') filtered = filtered.filter(j => j.priority === priorityFilter);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(j => 
        j.title.toLowerCase().includes(q) || 
        j.clientName.toLowerCase().includes(q)
      );
    }
    // Sort: Pinned first, then by date desc
    return filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs, search, statusFilter, priorityFilter, showArchived]);

  const handleClone = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newJob = cloneJob(id);
    if (newJob) {
      toast.success('Job duplicated successfully');
    }
  };

  const closeNewModal = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h1 className={styles.title}>Jobs</h1>
          <span className={styles.countBadge}>{filteredJobs.length} Jobs</span>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => navigate('?new=1')}>
          New Job
        </Button>
      </div>

      <div className={styles.filtersBar}>
        <div className={styles.filtersLeft}>
          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input 
              className={styles.searchInput} 
              placeholder="Search jobs or clients..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select 
            className={styles.filterSelect}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
          >
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="Hold">Hold</option>
            <option value="Closed">Closed</option>
          </select>
          <select 
            className={styles.filterSelect}
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value as any)}
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
            <option value="Critical">Critical</option>
          </select>
          <label className={styles.toggleLabel}>
            <input 
              type="checkbox" 
              checked={showArchived}
              onChange={e => setShowArchived(e.target.checked)}
            />
            Show Archived
          </label>
        </div>
        <div className={styles.filtersRight}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewBtn} ${view === 'grid' ? styles.active : ''}`}
              onClick={() => setView('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              className={`${styles.viewBtn} ${view === 'list' ? styles.active : ''}`}
              onClick={() => setView('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {filteredJobs.length > 0 ? (
        <div className={styles[view]}>
          {filteredJobs.map(job => {
            const count = candidates.filter(c => c.jobId === job.id).length;
            const daysOpen = job.status === 'Closed' 
              ? 'Closed' 
              : formatDistanceToNow(parseISO(job.createdAt));

            return (
              <div key={job.id} className={styles.card} onClick={() => navigate(`/jobs/${job.id}`)}>
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleWrap}>
                    <div className={`${styles.colorDot} ${styles[job.colorLabel]}`} />
                    <div>
                      <div className={styles.cardTitle}>
                        {job.title}
                        {job.isPinned && <Pin size={12} style={{marginLeft: 6, color: 'var(--text-muted)'}} />}
                      </div>
                      <div className={styles.cardClient}>
                        <Building2 size={12} /> {job.clientName}
                      </div>
                    </div>
                  </div>
                  <div className={styles.actions}>
                    <button 
                      className={`${styles.actionBtn} ${job.isPinned ? styles.active : ''}`}
                      onClick={(e) => { e.stopPropagation(); togglePin(job.id); }}
                      title="Pin Job"
                    >
                      <Pin size={16} />
                    </button>
                    <button 
                      className={styles.actionBtn}
                      onClick={(e) => handleClone(e, job.id)}
                      title="Duplicate Job"
                    >
                      <Copy size={16} />
                    </button>
                    <button 
                      className={`${styles.actionBtn} ${job.isArchived ? styles.active : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleArchive(job.id); }}
                      title="Archive Job"
                    >
                      <Archive size={16} />
                    </button>
                  </div>
                </div>

                <div className={styles.cardBadges}>
                  <span className={`badge ${job.status === 'Open' ? 'badge-success' : job.status === 'Hold' ? 'badge-warning' : 'badge-muted'}`}>
                    {job.status}
                  </span>
                  <span className={`badge ${job.priority === 'Critical' || job.priority === 'Urgent' ? 'badge-danger' : job.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>
                    {job.priority} Priority
                  </span>
                  <span className="badge badge-primary">{job.employmentType}</span>
                </div>

                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <Users size={14} /> <span>{count}</span> Cands
                  </div>
                  <div className={styles.metaItem}>
                    <Briefcase size={14} /> <span>{job.openings}</span> Openings
                  </div>
                  <div className={styles.metaItem}>
                    <Clock size={14} /> {daysOpen}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <Briefcase size={48} color="var(--border)" />
          <h3>No jobs found</h3>
          <p>Create a new job opening to start managing candidates and tracking your hiring pipeline.</p>
          <Button icon={<Plus size={16} />} onClick={() => navigate('?new=1')}>
            Create First Job
          </Button>
        </div>
      )}

      {/* Add Job Modal */}
      <AddJobModal open={isNewJob} onClose={closeNewModal} />
    </div>
  );
}

// ----------------------------------------------------------------------
// Add Job Modal Component
// ----------------------------------------------------------------------

interface AddJobModalProps {
  open: boolean;
  onClose: () => void;
}

type JobFormData = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'jdFiles' | 'isPinned' | 'isFavorite' | 'isArchived' | 'skills'> & { skills: string };

function AddJobModal({ open, onClose }: AddJobModalProps) {
  const addJob = useJobStore(s => s.addJob);
  const navigate = useNavigate();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      status: 'Open',
      priority: 'Medium',
      employmentType: 'Full-time',
      openings: 1,
      colorLabel: 'blue',
      currency: 'INR',
    }
  });

  const onSubmit = (data: JobFormData) => {
    const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    const newJob = addJob({
      ...data,
      skills: skillsArray,
      salaryMin: Number(data.salaryMin) || 0,
      salaryMax: Number(data.salaryMax) || 0,
      openings: Number(data.openings) || 1,
      jdFiles: [],
      isPinned: false,
      isFavorite: false,
      isArchived: false,
    });
    
    toast.success('Job created successfully');
    reset();
    onClose();
    navigate(`/jobs/${newJob.id}`); // auto navigate to new workspace
  };

  return (
    <Modal open={open} onClose={onClose} title="Create New Job" size="lg" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Create Job Workspace</Button>
      </>
    }>
      <form className={styles.formGrid}>
        <Input 
          label="Job Title" 
          placeholder="e.g. Senior Frontend Developer" 
          required 
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message}
          className={styles.fullWidth}
        />
        
        <Input 
          label="Client / Company Name" 
          placeholder="e.g. TechCorp Inc." 
          required 
          {...register('clientName', { required: 'Client name is required' })}
          error={errors.clientName?.message}
        />
        
        <Input 
          label="Department" 
          placeholder="e.g. Engineering" 
          {...register('department')}
        />

        <Select label="Employment Type" {...register('employmentType')}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
          <option value="Internship">Internship</option>
        </Select>

        <Select label="Priority" {...register('priority')}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
          <option value="Critical">Critical</option>
        </Select>

        <Input 
          label="Experience Required" 
          placeholder="e.g. 3-5 Years" 
          {...register('experience')}
        />

        <Input 
          label="Location" 
          placeholder="e.g. Remote, Bangalore" 
          {...register('location')}
        />

        <Input 
          label="Skills Required (comma separated)" 
          placeholder="e.g. React, TypeScript, Node.js" 
          className={styles.fullWidth}
          {...register('skills')}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <Input label="Min Salary" type="number" placeholder="Min" {...register('salaryMin')} />
          <Input label="Max Salary" type="number" placeholder="Max" {...register('salaryMax')} />
          <Select label="Currency" {...register('currency')} style={{ width: '80px' }}>
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </Select>
        </div>

        <Input 
          label="Number of Openings" 
          type="number" 
          min="1"
          {...register('openings')}
        />

        <Input 
          label="Notice Period" 
          placeholder="e.g. 30 Days" 
          {...register('noticePeriod')}
        />

        <Input 
          label="Hiring Manager" 
          placeholder="Manager Name" 
          {...register('hiringManager')}
        />

        <div className={styles.fullWidth}>
          <label className="text-sm font-medium text-secondary">Color Label</label>
          <Controller
            name="colorLabel"
            control={control}
            render={({ field }) => (
              <div className={styles.colorPicker}>
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    className={`${styles.colorBtn} ${styles[c]} ${field.value === c ? styles.selected : ''}`}
                    onClick={() => field.onChange(c)}
                  />
                ))}
              </div>
            )}
          />
        </div>

        <Textarea 
          label="Job Description Summary" 
          placeholder="Brief description of the role..."
          className={styles.fullWidth}
          {...register('description')}
        />
      </form>
    </Modal>
  );
}
