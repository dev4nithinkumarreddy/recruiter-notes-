import { useState } from 'react';
import { Bell, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { useReminderStore } from '../../store/useReminderStore';
import { formatDate } from '../../utils/dateUtils';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';

export default function RemindersPage() {
  const reminders = useReminderStore(s => s.reminders);
  const completeReminder = useReminderStore(s => s.complete);
  const updateReminder = useReminderStore(s => s.updateReminder);
  const deleteReminder = useReminderStore(s => s.deleteReminder);
  const addReminder = useReminderStore(s => s.addReminder);

  const [filter, setFilter] = useState<'All' | 'Pending' | 'Completed'>('Pending');
  const [isModalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<any>('Follow-up');
  const [dueAt, setDueAt] = useState(new Date().toISOString().slice(0, 16));

  const handleAdd = () => {
    if (!title) return toast.error('Title is required');
    addReminder({ title, type, dueAt });
    toast.success('Reminder added');
    setModalOpen(false);
    setTitle('');
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'Pending') return !r.isCompleted;
    if (filter === 'Completed') return r.isCompleted;
    return true;
  }).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime());

  const handleToggle = (id: string, current: boolean) => {
    updateReminder(id, { isCompleted: !current });
    toast.success(current ? 'Reminder marked as pending' : 'Reminder marked as completed');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Reminders</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your follow-ups, calls, and notifications.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', background: 'var(--surface)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setFilter('Pending')}
            style={{ padding: '6px 12px', border: 'none', background: filter === 'Pending' ? 'var(--surface-2)' : 'none', borderRadius: 'var(--radius-sm)', fontWeight: filter === 'Pending' ? 600 : 500, color: filter === 'Pending' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            Pending
          </button>
          <button 
            onClick={() => setFilter('Completed')}
            style={{ padding: '6px 12px', border: 'none', background: filter === 'Completed' ? 'var(--surface-2)' : 'none', borderRadius: 'var(--radius-sm)', fontWeight: filter === 'Completed' ? 600 : 500, color: filter === 'Completed' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            Completed
          </button>
          <button 
            onClick={() => setFilter('All')}
            style={{ padding: '6px 12px', border: 'none', background: filter === 'All' ? 'var(--surface-2)' : 'none', borderRadius: 'var(--radius-sm)', fontWeight: filter === 'All' ? 600 : 500, color: filter === 'All' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer' }}
          >
            All
          </button>
        </div>
        <Button onClick={() => setModalOpen(true)}>Add Reminder</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredReminders.length > 0 ? filteredReminders.map(reminder => (
          <div key={reminder.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', opacity: reminder.isCompleted ? 0.7 : 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <button 
                onClick={() => handleToggle(reminder.id, reminder.isCompleted)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '2px', padding: 0 }}
              >
                <CheckCircle2 size={24} color={reminder.isCompleted ? 'var(--success)' : 'var(--border)'} />
              </button>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: '4px', textDecoration: reminder.isCompleted ? 'line-through' : 'none' }}>
                  {reminder.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.857rem', color: 'var(--text-muted)' }}>
                  <span className="badge badge-muted">{reminder.type}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12}/> {formatDate(reminder.dueAt)}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => deleteReminder(reminder.id)}
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}
              title="Delete Reminder"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)' }}>
            <Bell size={48} color="var(--border)" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No reminders found</h3>
            <p style={{ color: 'var(--text-muted)' }}>You're all caught up!</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', width: '400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Add Reminder</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.857rem', fontWeight: 500 }}>Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.857rem', fontWeight: 500 }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }}>
                <option>Call</option>
                <option>Follow-up</option>
                <option>Interview</option>
                <option>Other</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.857rem', fontWeight: 500 }}>Date & Time</label>
              <input type="datetime-local" value={dueAt} onChange={e => setDueAt(e.target.value)} style={{ padding: '8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text-primary)' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
