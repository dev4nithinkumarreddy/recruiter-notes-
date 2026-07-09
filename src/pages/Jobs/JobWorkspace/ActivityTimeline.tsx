import { useOutletContext } from 'react-router-dom';
import { useActivityStore } from '../../../store/useActivityStore';
import { formatDate } from '../../../utils/dateUtils';
import type { Job } from '../../../types';
import styles from './JobWorkspace.module.css';

export default function ActivityTimeline() {
  const { job } = useOutletContext<{ job: Job }>();
  
  const activities = useActivityStore(s => s.getActivitiesForJob(job.id));

  // Group activities by date
  const grouped = activities.reduce((acc, act) => {
    const dateStr = act.createdAt.split('T')[0];
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(act);
    return acc;
  }, {} as Record<string, typeof activities>);

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      
      {sortedDates.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {sortedDates.map(date => (
            <div key={date}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', position: 'relative', zIndex: 1, backgroundColor: 'var(--bg)', display: 'inline-block', paddingRight: '12px' }}>
                {formatDate(date)}
              </h4>
              <div className={styles.timeline}>
                {grouped[date].map(act => (
                  <div key={act.id} className={styles.timelineItem}>
                    <div className={styles.timelineDot} />
                    <div className={styles.timelineTime}>
                      {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className={styles.timelineContent}>
                      {act.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3 style={{ marginTop: 0 }}>No Activity Yet</h3>
          <p>Activity logs will appear here when you add candidates, move stages, or update job details.</p>
        </div>
      )}
    </div>
  );
}
