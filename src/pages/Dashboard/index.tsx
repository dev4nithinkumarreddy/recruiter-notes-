import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, CheckCircle, Users, ClipboardCheck, Calendar,
  Award, Activity, Clock, AlertTriangle, Plus, CheckSquare
} from 'lucide-react';
import { useJobStore } from '../../store/useJobStore';
import { useCandidateStore } from '../../store/useCandidateStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useReminderStore } from '../../store/useReminderStore';
import { useActivityStore } from '../../store/useActivityStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { formatDate, formatRelative, isOverdue } from '../../utils/dateUtils';
import Button from '../../components/ui/Button';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const navigate = useNavigate();
  
  // Data stores
  const jobs = useJobStore(s => s.jobs);
  const candidates = useCandidateStore(s => s.candidates);
  const tasks = useTaskStore(s => s.tasks);
  const reminders = useReminderStore(s => s.getActiveReminders());
  const activities = useActivityStore(s => s.getRecentActivities(10));

  // Computed Stats
  const activeJobs = jobs.filter(j => j.status === 'Open').length;
  const closedJobs = jobs.filter(j => j.status === 'Closed').length;
  
  const today = new Date().toISOString().split('T')[0];
  const candidatesToday = candidates.filter(c => c.createdAt.startsWith(today)).length;
  
  const shortlistedCount = candidates.filter(c => c.isShortlisted).length;
  const interviewsCount = candidates.filter(c => c.stage.includes('Interview')).length;
  const offersCount = candidates.filter(c => c.stage === 'Offer Released').length;

  const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.dueDate && isOverdue(t.dueDate));
  const tasksDueToday = tasks.filter(t => t.status !== 'Completed' && t.dueDate?.startsWith(today));

  // Handlers
  const handleTaskToggle = (id: string, currentStatus: string) => {
    useTaskStore.getState().setStatus(id, currentStatus === 'Completed' ? 'Pending' : 'Completed');
  };

  const recruiterName = useSettingsStore(s => s.settings.recruiterName);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Welcome back, {recruiterName || 'Recruiter'}! 👋</h1>
          <p className={styles.subtitle}>Here's what's happening today, {formatDate(new Date().toISOString())}</p>
        </div>
        <div className={styles.quickActions}>
          <Button icon={<Plus size={16} />} onClick={() => navigate('/jobs?new=1')}>
            New Job
          </Button>
          <Button variant="secondary" icon={<Plus size={16} />} onClick={() => navigate('/candidates?new=1')}>
            Add Candidate
          </Button>
        </div>
      </div>

      {/* Insights Row */}
      <div className={styles.insightsRow}>
        {overdueTasks.length > 0 && (
          <div className={`${styles.insightCard} ${styles.urgent}`}>
            <AlertTriangle className={styles.insightIcon} size={24} />
            <div className={styles.insightContent}>
              <div className={styles.insightTitle}>{overdueTasks.length} Overdue Tasks</div>
              <div className={styles.insightDesc}>You have tasks that require immediate attention.</div>
            </div>
          </div>
        )}
        {reminders.length > 0 && (
          <div className={`${styles.insightCard} ${styles.attention}`}>
            <Clock className={styles.insightIcon} size={24} />
            <div className={styles.insightContent}>
              <div className={styles.insightTitle}>{reminders.length} Active Reminders</div>
              <div className={styles.insightDesc}>Check your pending follow-ups for today.</div>
            </div>
          </div>
        )}
        <div className={styles.insightCard}>
          <Users className={styles.insightIcon} size={24} color="var(--primary)" />
          <div className={styles.insightContent}>
            <div className={styles.insightTitle}>{candidatesToday} Candidates Added Today</div>
            <div className={styles.insightDesc}>Keep up the good sourcing work!</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.primary}`}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{activeJobs}</div>
            <div className={styles.statLabel}>Active Jobs</div>
          </div>
          <div className={styles.statIcon}><Briefcase size={20} /></div>
        </div>
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{closedJobs}</div>
            <div className={styles.statLabel}>Closed Jobs</div>
          </div>
          <div className={styles.statIcon}><CheckCircle size={20} /></div>
        </div>
        <div className={`${styles.statCard} ${styles.info}`}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{candidatesToday}</div>
            <div className={styles.statLabel}>Candidates Today</div>
          </div>
          <div className={styles.statIcon}><Users size={20} /></div>
        </div>
        <div className={`${styles.statCard} ${styles.accent}`}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{shortlistedCount}</div>
            <div className={styles.statLabel}>Shortlisted</div>
          </div>
          <div className={styles.statIcon}><ClipboardCheck size={20} /></div>
        </div>
        <div className={`${styles.statCard} ${styles.warning}`}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{interviewsCount}</div>
            <div className={styles.statLabel}>In Interviews</div>
          </div>
          <div className={styles.statIcon}><Calendar size={20} /></div>
        </div>
        <div className={`${styles.statCard} ${styles.success}`}>
          <div className={styles.statContent}>
            <div className={styles.statNumber}>{offersCount}</div>
            <div className={styles.statLabel}>Offers Released</div>
          </div>
          <div className={styles.statIcon}><Award size={20} /></div>
        </div>
      </div>

      <div className={styles.twoCol}>
        {/* Left Column - Activity */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <Activity size={18} />
            Recent Activity
          </h2>
          {activities.length > 0 ? (
            <div className={styles.activityFeed}>
              {activities.map(act => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    <CheckCircle size={14} />
                  </div>
                  <div className={styles.activityContent}>
                    <div className={styles.activityDesc}>{act.description}</div>
                    <div className={styles.activityTime}>{formatRelative(act.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Activity size={32} />
              <p>No recent activity</p>
            </div>
          )}
        </div>

        {/* Right Column - Tasks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <CheckSquare size={18} />
            Tasks Due Today
          </h2>
          {tasksDueToday.length > 0 ? (
            <div className={styles.taskList}>
              {tasksDueToday.map(task => (
                <div key={task.id} className={styles.taskItem}>
                  <input 
                    type="checkbox" 
                    className={styles.taskCheckbox}
                    checked={task.status === 'Completed'}
                    onChange={() => handleTaskToggle(task.id, task.status)}
                  />
                  <div className={styles.taskContent}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    <div className={styles.taskMeta}>
                      <span className={`${styles.priorityBadge} ${styles[`priority-${task.priority}`]}`}>
                        {task.priority}
                      </span>
                      <span>{task.dueDate ? formatDate(task.dueDate) : 'No date'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <CheckSquare size={32} />
              <p>No tasks due today!</p>
              <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>Go to Jobs</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
