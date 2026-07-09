import { useOutletContext } from 'react-router-dom';
import { 
  Users, CheckCircle, ClipboardCheck, Briefcase, 
  MapPin, DollarSign, Clock, UserCheck
} from 'lucide-react';
import { useCandidateStore } from '../../../store/useCandidateStore';
import { useTaskStore } from '../../../store/useTaskStore';
import { useActivityStore } from '../../../store/useActivityStore';
import { formatRelative } from '../../../utils/dateUtils';
import type { Job } from '../../../types';
import styles from './JobWorkspace.module.css';

export default function Overview() {
  const { job } = useOutletContext<{ job: Job }>();
  
  const candidates = useCandidateStore(s => s.getCandidatesForJob(job.id));
  const tasks = useTaskStore(s => s.getTasksForJob(job.id));
  const activities = useActivityStore(s => s.getActivitiesForJob(job.id)).slice(0, 5);

  const shortlisted = candidates.filter(c => c.isShortlisted).length;
  const inInterview = candidates.filter(c => c.stage.includes('Interview')).length;
  const selected = candidates.filter(c => c.stage === 'Selected' || c.stage === 'Offer Released' || c.stage === 'Joined').length;
  const rejected = candidates.filter(c => c.stage === 'Rejected').length;

  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const taskProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const upcomingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 3);

  return (
    <div className={styles.overviewGrid}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Key Details */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Briefcase size={18} /> Job Details
          </h3>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Employment Type</span>
              <span className={styles.detailValue}>{job.employmentType}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Experience</span>
              <span className={styles.detailValue}>{job.experience || 'Not specified'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><MapPin size={12} style={{display:'inline'}}/> Location</span>
              <span className={styles.detailValue}>{job.location || 'Remote'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><DollarSign size={12} style={{display:'inline'}}/> Salary Range</span>
              <span className={styles.detailValue}>
                {job.salaryMin || 0} - {job.salaryMax || 0} {job.currency}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><Clock size={12} style={{display:'inline'}}/> Notice Period</span>
              <span className={styles.detailValue}>{job.noticePeriod || 'Any'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}><UserCheck size={12} style={{display:'inline'}}/> Hiring Manager</span>
              <span className={styles.detailValue}>{job.hiringManager || 'N/A'}</span>
            </div>
          </div>
          
          {job.skills && job.skills.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <span className={styles.detailLabel} style={{ display: 'block', marginBottom: '8px' }}>Skills Required</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {job.skills.map((s, i) => (
                  <span key={i} className="badge badge-muted">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pipeline Funnel Stats */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <Users size={18} /> Candidate Funnel
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{candidates.length}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary)' }}>{shortlisted}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Shortlisted</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--warning)' }}>{inInterview}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Interviewing</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>{selected}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Selected</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--danger)' }}>{rejected}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rejected</div>
            </div>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Task Progress */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <ClipboardCheck size={18} /> To-Do Progress
          </h3>
          <div className={styles.todoProgress}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.857rem' }}>
              <span>{completedTasks} of {tasks.length} tasks completed</span>
              <span style={{ fontWeight: 600 }}>{taskProgress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${taskProgress}%` }} />
            </div>
          </div>

          {upcomingTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className={styles.detailLabel}>Upcoming Tasks</div>
              {upcomingTasks.map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.857rem' }}>
                  <input type="checkbox" checked={false} readOnly />
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</span>
                  {t.priority === 'Critical' && <span style={{ color: 'var(--danger)', fontSize: '0.7rem', fontWeight: 600 }}>Crit</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>
            <CheckCircle size={18} /> Recent Activity
          </h3>
          {activities.length > 0 ? (
            <div className={styles.timeline}>
              {activities.map(act => (
                <div key={act.id} className={styles.timelineItem}>
                  <div className={styles.timelineDot} />
                  <div className={styles.timelineTime}>{formatRelative(act.createdAt)}</div>
                  <div style={{ fontSize: '0.857rem', color: 'var(--text-primary)' }}>{act.description}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.857rem', padding: '20px 0' }}>
              No recent activity for this job.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
