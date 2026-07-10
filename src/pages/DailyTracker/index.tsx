import { useState, useEffect } from 'react';
import { Target, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useTrackerStore } from '../../store/useTrackerStore';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';

export default function DailyTracker() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const log = useTrackerStore(s => s.getLog(date));
  const saveLog = useTrackerStore(s => s.upsertLog);

  const [formData, setFormData] = useState({
    candidatesSourced: log?.candidatesSourced || 0,
    callsMade: log?.callsMade || 0,
    interviewsScheduled: log?.interviewsScheduled || 0,
    offers: log?.offers || 0,
    closures: log?.closures || 0,
    pendingFollowups: log?.pendingFollowups || 0,
    notes: log?.notes || ''
  });

  // Update local state when log changes from store
  useEffect(() => {
    if (log) {
      setFormData({
        candidatesSourced: log.candidatesSourced,
        callsMade: log.callsMade,
        interviewsScheduled: log.interviewsScheduled,
        offers: log.offers,
        closures: log.closures,
        pendingFollowups: log.pendingFollowups,
        notes: log.notes
      });
    } else {
      setFormData({
        candidatesSourced: 0,
        callsMade: 0,
        interviewsScheduled: 0,
        offers: 0,
        closures: 0,
        pendingFollowups: 0,
        notes: ''
      });
    }
  }, [log]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'notes' ? value : Number(value)
    }));
  };

  const handleSave = () => {
    saveLog(date, formData);
    toast.success('Daily tracker saved successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Daily Tracker</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log your daily recruitment metrics and KPIs.</p>
        </div>
        <div>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Target size={18} color="var(--primary)" /> Metrics for {new Date(date).toLocaleDateString()}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          <Input 
            label="Candidates Sourced" 
            type="number" 
            name="candidatesSourced" 
            value={formData.candidatesSourced} 
            onChange={handleChange} 
          />
          <Input 
            label="Calls Made" 
            type="number" 
            name="callsMade" 
            value={formData.callsMade} 
            onChange={handleChange} 
          />
          <Input 
            label="Interviews Scheduled" 
            type="number" 
            name="interviewsScheduled" 
            value={formData.interviewsScheduled} 
            onChange={handleChange} 
          />
          <Input 
            label="Offers Released" 
            type="number" 
            name="offers" 
            value={formData.offers} 
            onChange={handleChange} 
          />
          <Input 
            label="Closures / Joinees" 
            type="number" 
            name="closures" 
            value={formData.closures} 
            onChange={handleChange} 
          />
          <Input 
            label="Pending Follow-ups" 
            type="number" 
            name="pendingFollowups" 
            value={formData.pendingFollowups} 
            onChange={handleChange} 
          />
        </div>

        <Textarea 
          label="Daily Notes / Blockers" 
          name="notes" 
          value={formData.notes} 
          onChange={handleChange} 
          style={{ minHeight: '100px', marginBottom: '24px' }}
        />

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button icon={<CheckCircle size={16} />} onClick={handleSave}>Save Daily Log</Button>
        </div>
      </div>
    </div>
  );
}
