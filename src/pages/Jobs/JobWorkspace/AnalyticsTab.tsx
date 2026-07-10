import { useCandidateStore } from '../../../store/useCandidateStore';
import { useOutletContext } from 'react-router-dom';
import type { Job } from '../../../types';
import { PIPELINE_STAGES } from '../../../types';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, Filter, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#64748b'];

export default function AnalyticsTab() {
  const { job } = useOutletContext<{ job: Job }>();
  const getCandidatesForJob = useCandidateStore(s => s.getCandidatesForJob);
  const candidates = getCandidatesForJob(job.id);

  const totalCandidates = candidates.length;
  
  // Pipeline metrics
  const shortlisted = candidates.filter(c => c.isShortlisted || ['Shortlisted', 'Interview Round 1', 'Interview Round 2', 'Technical Round', 'HR Round', 'Selected', 'Offer Released', 'Joined'].includes(c.stage)).length;
  const interviewing = candidates.filter(c => c.stage.includes('Interview') || c.stage.includes('Round')).length;
  const joined = candidates.filter(c => c.stage === 'Joined').length;

  // Funnel Data (Grouped stages)
  const funnelData = [
    { name: 'Sourced', count: totalCandidates },
    { name: 'Shortlisted', count: shortlisted },
    { name: 'Interviewing', count: interviewing },
    { name: 'Joined', count: joined },
  ];

  // Stage Distribution
  const stageCounts = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = candidates.filter(c => c.stage === stage).length;
    return acc;
  }, {} as Record<string, number>);
  
  const stageData = Object.entries(stageCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, count]) => ({ name, count }));

  // Source Distribution
  const sourceCounts = candidates.reduce((acc, c) => {
    acc[c.source] = (acc[c.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceData = Object.entries(sourceCounts)
    .map(([name, value]) => ({ name: String(name), value: Number(value) }))
    .sort((a, b) => b.value - a.value);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflowY: 'auto', paddingRight: '4px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Job Analytics</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Total Sourced</span>
            <Users size={18} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{totalCandidates}</div>
        </div>
        
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Shortlisted</span>
            <Filter size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)' }}>{shortlisted}</div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Interviewing</span>
            <Clock size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--warning)' }}>{interviewing}</div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Joined</span>
            <CheckCircle size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{joined}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
        
        {/* Pipeline Funnel */}
        <div className="card" style={{ padding: '20px', minHeight: '300px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Recruitment Funnel</h3>
          {totalCandidates === 0 ? (
            <div style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Source Distribution */}
        <div className="card" style={{ padding: '20px', minHeight: '300px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>Sourcing Channels</h3>
          {sourceData.length === 0 ? (
            <div style={{ display: 'flex', height: '200px', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}
                  itemStyle={{ color: 'var(--text)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
    </div>
  );
}
