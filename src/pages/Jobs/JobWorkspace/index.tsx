import { useState } from 'react';
import { useParams, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Pin, Archive, Edit2, Users, Clock, Building2,
  LayoutDashboard, FileText, CheckSquare, ClipboardList, BookOpen, Activity, BarChart
} from 'lucide-react';
import { useJobStore } from '../../../store/useJobStore';
import { useCandidateStore } from '../../../store/useCandidateStore';
import { formatDistanceToNow, parseISO } from 'date-fns';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import { useForm } from 'react-hook-form';
import { toast } from '../../../components/ui/Toast';
import type { Job } from '../../../types';
import styles from './JobWorkspace.module.css';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'candidates', label: 'Candidates', icon: Users },
  { id: 'shortlisted', label: 'Shortlisted', icon: CheckSquare },
  { id: 'pipeline', label: 'Pipeline', icon: ClipboardList },
  { id: 'tasks', label: 'To-Do List', icon: CheckSquare },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart },
];

export default function JobWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const job = useJobStore(s => s.getJob(id!));
  const { togglePin, toggleArchive } = useJobStore();
  const candidatesCount = useCandidateStore(s => s.getCandidatesForJob(id!).length);

  // Extract current tab from URL, default to overview
  const currentPath = location.pathname.split('/').pop();
  const currentTab = currentPath === id ? 'overview' : currentPath;

  if (!job) {
    return (
      <div className={styles.emptyState}>
        <h3>Job Not Found</h3>
        <p>The job you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

  const daysOpen = job.status === 'Closed' 
    ? 'Closed' 
    : formatDistanceToNow(parseISO(job.createdAt));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.titleArea}>
            <button className={styles.backBtn} onClick={() => navigate('/jobs')}>
              <ArrowLeft size={16} /> Back to Jobs
            </button>
            <div className={styles.jobTitle}>
              <div className={`${styles.colorDot} ${styles[job.colorLabel]}`} />
              {job.title}
            </div>
            <div className={styles.clientName}>
              <Building2 size={16} /> {job.clientName}
            </div>
          </div>

          <div className={styles.headerActions}>
            <button 
              className={`${styles.iconBtn} ${job.isPinned ? styles.active : ''}`}
              onClick={() => togglePin(job.id)}
              title="Pin Job"
            >
              <Pin size={18} />
            </button>
            <button 
              className={`${styles.iconBtn} ${job.isArchived ? styles.active : ''}`}
              onClick={() => toggleArchive(job.id)}
              title="Archive Job"
            >
              <Archive size={18} />
            </button>
            <Button variant="secondary" icon={<Edit2 size={16} />} onClick={() => setEditModalOpen(true)}>Edit</Button>
          </div>
        </div>

        <div className={styles.headerMeta}>
          <span className={`badge ${job.status === 'Open' ? 'badge-success' : job.status === 'Hold' ? 'badge-warning' : 'badge-muted'}`}>
            {job.status}
          </span>
          <span className={`badge ${job.priority === 'Critical' || job.priority === 'Urgent' ? 'badge-danger' : job.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>
            {job.priority} Priority
          </span>
          <span className="badge badge-primary">{job.employmentType}</span>
          
          <div style={{ flex: 1 }} />
          
          <div className={styles.metaBadge}>
            <Users size={16} /> <span>{candidatesCount}</span> Candidates
          </div>
          <div className={styles.metaBadge}>
            <Clock size={16} /> {daysOpen}
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${currentTab === tab.id ? styles.active : ''}`}
            onClick={() => navigate(tab.id === 'overview' ? '' : tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.tabContent}>
        <Outlet context={{ job }} />
      </div>

      <EditJobModal 
        job={job}
        open={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
      />
    </div>
  );
}

// ----------------------------------------------------------------------
// Edit Job Modal Component
// ----------------------------------------------------------------------

interface EditJobModalProps {
  job: Job;
  open: boolean;
  onClose: () => void;
}

type JobFormData = Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'jdFiles' | 'isPinned' | 'isFavorite' | 'isArchived' | 'skills'> & { skills: string };

function EditJobModal({ job, open, onClose }: EditJobModalProps) {
  const updateJob = useJobStore(s => s.updateJob);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<JobFormData>({
    defaultValues: {
      ...job,
      skills: job.skills.join(', '),
    }
  });

  const onSubmit = (data: JobFormData) => {
    const skillsArray = data.skills ? data.skills.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    updateJob(job.id, {
      ...data,
      skills: skillsArray,
      salaryMin: Number(data.salaryMin) || 0,
      salaryMax: Number(data.salaryMax) || 0,
      openings: Number(data.openings) || 1,
    });
    
    toast.success('Job updated successfully');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Job" size="lg" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Save Changes</Button>
      </>
    }>
      <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <Input 
            label="Job Title" 
            placeholder="e.g. Senior Frontend Developer" 
            required 
            {...register('title', { required: 'Title is required' })}
            error={errors.title?.message}
          />
        </div>
        
        <Input label="Client / Company Name" required {...register('clientName', { required: 'Required' })} error={errors.clientName?.message} />
        <Input label="Department" {...register('department')} />
        
        <Select label="Employment Type" {...register('employmentType')}>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Freelance">Freelance</option>
          <option value="Internship">Internship</option>
        </Select>
        
        <Input label="Experience Required" placeholder="e.g. 3-5 Years" {...register('experience')} />
        <Input label="Location" placeholder="e.g. Remote, NY" {...register('location')} />
        <Input label="Notice Period" placeholder="e.g. 30 Days" {...register('noticePeriod')} />
        
        <Input label="Salary Min" type="number" {...register('salaryMin')} />
        <Input label="Salary Max" type="number" {...register('salaryMax')} />
        
        <Select label="Status" {...register('status')}>
          <option value="Open">Open</option>
          <option value="Hold">On Hold</option>
          <option value="Closed">Closed</option>
        </Select>
        
        <Select label="Priority" {...register('priority')}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </Select>

        <Input label="Hiring Manager" {...register('hiringManager')} />
        <Input label="Recruiter Name" {...register('recruiterName')} />
        
        <div style={{ gridColumn: '1 / -1' }}>
          <Input label="Skills (comma separated)" placeholder="React, TypeScript, Node.js" {...register('skills')} />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <Textarea label="Job Description" rows={4} {...register('description')} />
        </div>
        
        <div style={{ gridColumn: '1 / -1' }}>
          <Textarea label="Internal Notes" rows={2} {...register('notes')} />
        </div>
      </form>
    </Modal>
  );
}
