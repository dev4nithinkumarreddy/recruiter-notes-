import { useMemo } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, useDroppable, useDraggable, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCandidateStore } from '../../../store/useCandidateStore';
import { useActivityStore } from '../../../store/useActivityStore';
import { formatDistanceToNow, parseISO } from 'date-fns';
import type { Job, Candidate, PipelineStage } from '../../../types';
import { PIPELINE_STAGES } from '../../../types';
import styles from './JobWorkspace.module.css';
import { Clock } from 'lucide-react';

const STAGE_COLORS: Record<PipelineStage, string> = {
  'Collected': '#6366f1',
  'Contacted': '#3b82f6',
  'Screening': '#06b6d4',
  'Shortlisted': '#10b981',
  'Client Shared': '#8b5cf6',
  'Interview Round 1': '#f59e0b',
  'Interview Round 2': '#f97316',
  'Technical Round': '#ef4444',
  'HR Round': '#ec4899',
  'Selected': '#22c55e',
  'Offer Released': '#059669',
  'Joined': '#0f766e',
  'Rejected': '#ef4444',
  'Dropped': '#94a3b8'
};

export default function Pipeline() {
  const { job } = useOutletContext<{ job: Job }>();
  
  const candidates = useCandidateStore(s => s.getCandidatesForJob(job.id));
  const moveStage = useCandidateStore(s => s.moveStage);
  const logActivity = useActivityStore(s => s.log);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const candidateId = active.id as string;
    const newStage = over.id as PipelineStage;
    const candidate = candidates.find(c => c.id === candidateId);

    if (candidate && candidate.stage !== newStage) {
      moveStage(candidateId, newStage, `Moved via Kanban`);
      logActivity({
        jobId: job.id,
        candidateId,
        type: 'stage_changed',
        description: `${candidate.fullName} moved to ${newStage}`
      });
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className={styles.kanbanBoard}>
        {PIPELINE_STAGES.map(stage => (
          <KanbanColumn 
            key={stage} 
            stage={stage} 
            candidates={candidates.filter(c => c.stage === stage)} 
          />
        ))}
      </div>
    </DndContext>
  );
}

function KanbanColumn({ stage, candidates }: { stage: PipelineStage, candidates: Candidate[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  
  return (
    <div 
      className={styles.kanbanColumn} 
      ref={setNodeRef}
      style={{ 
        opacity: isOver ? 0.9 : 1,
        boxShadow: isOver ? `0 0 0 2px ${STAGE_COLORS[stage]} inset` : 'none'
      }}
    >
      <div className={styles.kanbanHeader} style={{ borderTopColor: STAGE_COLORS[stage] }}>
        <h3>{stage}</h3>
        <span className={styles.kanbanCount}>{candidates.length}</span>
      </div>
      <div className={styles.kanbanCards}>
        {candidates.map(c => (
          <KanbanCard key={c.id} candidate={c} />
        ))}
      </div>
    </div>
  );
}

function KanbanCard({ candidate }: { candidate: Candidate }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
    data: candidate
  });
  
  const navigate = useNavigate();

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1
  };

  // Get time in current stage
  const lastEvent = candidate.stageHistory[candidate.stageHistory.length - 1];
  const timeInStage = lastEvent ? formatDistanceToNow(parseISO(lastEvent.timestamp)) : '';

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={styles.kanbanCard}
      onDoubleClick={() => navigate(`/candidates/${candidate.id}`)}
    >
      <div style={{ fontWeight: 600, fontSize: '0.929rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {candidate.fullName}
      </div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
        {candidate.currentRole} @ {candidate.currentCompany}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="badge badge-muted" style={{ fontSize: '0.65rem' }}>
          {candidate.source}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Clock size={10} /> {timeInStage}
        </div>
      </div>
    </div>
  );
}
