import { useSettingsStore } from '../../store/useSettingsStore';
import { Input } from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from '../../components/ui/Toast';
import { useForm } from 'react-hook-form';

export default function SettingsPage() {
  const { settings, updateSettings, toggleTheme } = useSettingsStore();

  const { register, handleSubmit } = useForm({
    values: settings,
  });

  const onSubmit = (data: any) => {
    updateSettings(data);
    toast.success('Settings saved successfully');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const stores = [
      'recruitflow-settings', 'recruitflow-jobs', 'recruitflow-candidates', 
      'recruitflow-companies', 'recruitflow-tasks', 'recruitflow-notes', 
      'recruitflow-reminders', 'recruitflow-tracker', 'recruitflow-activities'
    ];
    const data: Record<string, any> = {};
    stores.forEach(s => {
      const val = localStorage.getItem(s);
      if (val) data[s] = JSON.parse(val);
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recruitflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your workspace preferences and profile.</p>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Appearance</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 500 }}>Theme</div>
            <div style={{ fontSize: '0.857rem', color: 'var(--text-secondary)' }}>Toggle between light and dark mode.</div>
          </div>
          <Button variant="secondary" onClick={toggleTheme}>
            Current: {settings.theme}
          </Button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Profile Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Name" {...register('recruiterName')} />
          <Input label="Email" type="email" {...register('recruiterEmail')} />
          <Input label="Company / Agency" {...register('recruiterCompany')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="submit">Save Profile</Button>
          </div>
        </form>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>AI Integration</h2>
        <p style={{ fontSize: '0.857rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Enter your Groq API key to enable lightning-fast AI features like automated resume extraction. Your key is stored securely in your browser's local storage.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Groq API Key" type="password" placeholder="gsk_..." {...register('groqKey')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Button type="submit">Save Key</Button>
          </div>
        </form>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>Data Management</h2>
        <p style={{ fontSize: '0.857rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Export all your workspace data as a JSON file for backup purposes, or load demo data to test the application.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="secondary" onClick={handleExportData}>Export All Data (JSON)</Button>
          <Button variant="ghost" onClick={async () => {
            const { loadDemoData } = await import('../../utils/seedData');
            loadDemoData();
            toast.success('Demo data loaded! Refreshing...');
            setTimeout(() => window.location.href = '/', 1000);
          }}>Load Demo Data</Button>
        </div>
      </div>

      <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--danger)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)', marginBottom: '16px' }}>Danger Zone</h2>
        <p style={{ fontSize: '0.857rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Wiping your data will delete all jobs, candidates, notes, and settings stored in this browser.
        </p>
        <Button variant="danger" onClick={handleClearData}>Clear All Data</Button>
      </div>
    </div>
  );
}
