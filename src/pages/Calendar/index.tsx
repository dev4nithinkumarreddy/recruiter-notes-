import { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Briefcase, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTaskStore } from '../../store/useTaskStore';
import { useCandidateStore } from '../../store/useCandidateStore';
import { useReminderStore } from '../../store/useReminderStore';
import { useJobStore } from '../../store/useJobStore';
import Button from '../../components/ui/Button';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const tasks = useTaskStore(s => s.tasks);
  const candidates = useCandidateStore(s => s.candidates);
  const jobs = useJobStore(s => s.jobs);
  const reminders = useReminderStore(s => s.reminders);

  // For this simple calendar view, we'll just extract upcoming events in a list format
  // mapped by day.
  const todayStr = currentDate.toISOString().split('T')[0];

  const getEventsForDate = (dateStr: string) => {
    const events: { id: string; type: string; title: string; time: string; status: string }[] = [];
    
    // Add tasks due on this date
    tasks.filter(t => t.dueDate?.startsWith(dateStr)).forEach(t => {
      events.push({ id: t.id, type: 'Task', title: t.title, time: t.dueDate?.split('T')[1]?.substring(0, 5) || 'All Day', status: t.status });
    });
    
    // Add reminders
    reminders.filter(r => r.dueAt?.startsWith(dateStr)).forEach(r => {
      events.push({ id: r.id, type: 'Reminder', title: r.title, time: r.dueAt?.split('T')[1]?.substring(0, 5) || 'All Day', status: r.isCompleted ? 'Completed' : 'Pending' });
    });

    // Add candidate stage history if it happened on this day
    candidates.forEach(c => {
      c.stageHistory.filter(h => h.timestamp.startsWith(dateStr)).forEach(h => {
        events.push({ id: `${c.id}-${h.stage}`, type: 'Candidate Stage', title: `${c.fullName} moved to ${h.stage}`, time: h.timestamp.split('T')[1].substring(0, 5), status: 'Done' });
      });
    });

    return events.sort((a, b) => a.time.localeCompare(b.time));
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Calendar</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View your tasks, interviews, and reminders.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Button variant="ghost" icon={<ChevronLeft size={20} />} onClick={prevMonth} />
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, margin: '0 10px', minWidth: '150px', textAlign: 'center' }}>{monthName}</h2>
          <Button variant="ghost" icon={<ChevronRight size={20} />} onClick={nextMonth} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
        {/* Simple Grid Calendar */}
        <div style={{ flex: 2, background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ textAlign: 'center', fontSize: '0.857rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{day}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', flex: 1 }}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', opacity: 0.5 }}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const events = getEventsForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div key={day} style={{ 
                  background: 'var(--surface-2)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '8px',
                  border: isToday ? '2px solid var(--primary)' : '1px solid transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ fontSize: '0.857rem', fontWeight: isToday ? 700 : 500, color: isToday ? 'var(--primary)' : 'var(--text-primary)' }}>{day}</div>
                  {events.slice(0, 3).map((e, idx) => (
                    <div key={idx} style={{ 
                      fontSize: '0.7rem', 
                      background: e.type === 'Task' ? 'var(--info-soft)' : e.type === 'Reminder' ? 'var(--warning-soft)' : 'var(--surface)',
                      color: e.type === 'Task' ? 'var(--info)' : e.type === 'Reminder' ? 'var(--warning)' : 'var(--text-secondary)',
                      padding: '2px 4px', 
                      borderRadius: '4px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {e.title}
                    </div>
                  ))}
                  {events.length > 3 && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{events.length - 3} more</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Agenda Sidebar */}
        <div style={{ flex: 1, background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarIcon size={18} /> Today's Agenda
          </h3>
          
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {getEventsForDate(todayStr).length > 0 ? getEventsForDate(todayStr).map((event, idx) => (
              <div key={idx} style={{ padding: '12px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${event.type === 'Task' ? 'var(--info)' : event.type === 'Reminder' ? 'var(--warning)' : 'var(--success)'}` }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{event.time}</span>
                  <span>{event.type}</span>
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{event.title}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '48px' }}>
                <CalendarIcon size={48} color="var(--border)" style={{ marginBottom: '16px', margin: '0 auto' }} />
                <p>No events scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
