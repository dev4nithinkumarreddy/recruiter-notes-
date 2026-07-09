import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useCandidateStore } from '../../store/useCandidateStore';
import { useJobStore } from '../../store/useJobStore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function AnalyticsPage() {
  const candidates = useCandidateStore(s => s.candidates);
  const jobs = useJobStore(s => s.jobs);

  // Compute Source Data
  const sourceData = useMemo(() => {
    const counts = candidates.reduce((acc, c) => {
      acc[c.source] = (acc[c.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [candidates]);

  // Compute Funnel/Stage Data
  const stageData = useMemo(() => {
    // simplified funnel
    let sourced = candidates.length;
    let interviewing = candidates.filter(c => c.stage.includes('Interview') || c.stage === 'Technical Round' || c.stage === 'HR Round').length;
    let selected = candidates.filter(c => c.stage === 'Selected' || c.stage === 'Offer Released' || c.stage === 'Joined').length;
    let joined = candidates.filter(c => c.stage === 'Joined').length;

    return [
      { name: 'Sourced', value: sourced },
      { name: 'Interviewing', value: interviewing },
      { name: 'Selected', value: selected },
      { name: 'Joined', value: joined }
    ];
  }, [candidates]);

  // Compute Job Status
  const jobData = useMemo(() => {
    let open = jobs.filter(j => j.status === 'Open').length;
    let closed = jobs.filter(j => j.status === 'Closed').length;
    let hold = jobs.filter(j => j.status === 'Hold').length;

    return [
      { name: 'Open', value: open },
      { name: 'Closed', value: closed },
      { name: 'On Hold', value: hold }
    ];
  }, [jobs]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%', overflowY: 'auto', paddingBottom: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>Analytics & Reports</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Visualize your hiring performance.</p>
      </div>

      <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Recruitment Funnel */}
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Recruitment Funnel</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={stageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tick={{fill: 'var(--text-secondary)', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis tick={{fill: 'var(--text-secondary)', fontSize: 12}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'var(--surface-2)'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)'}} />
                <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Sources */}
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Candidate Sources</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: 'var(--shadow-md)'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
            {sourceData.map((entry, i) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.857rem', color: 'var(--text-secondary)' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: COLORS[i % COLORS.length] }} />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        {/* Job Status Overview */}
        <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Job Status Overview</h3>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', height: '200px' }}>
            {jobData.map(d => (
              <div key={d.name} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: d.name === 'Open' ? 'var(--success)' : d.name === 'Closed' ? 'var(--text-muted)' : 'var(--warning)', lineHeight: 1 }}>
                  {d.value}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '8px' }}>
                  {d.name} Jobs
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
