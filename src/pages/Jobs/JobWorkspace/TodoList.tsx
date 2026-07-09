import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DndContext, useDroppable, useDraggable, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Plus, Clock, CheckCircle2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useTaskStore } from '../../../store/useTaskStore';
import { formatDate } from '../../../utils/dateUtils';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Input, Select, Textarea } from '../../../components/ui/Input';
import type { Job, Task, TaskStatus } from '../../../types';
import styles from './JobWorkspace.module.css';

const COLUMNS: TaskStatus[] = ['Pending', 'In Progress', 'Completed'];

export default function TodoList() {
  const { job } = useOutletContext<{ job: Job }>();
  
  const tasks = useTaskStore(s => s.getTasksForJob(job.id));
  const { setStatus, deleteTask } = useTaskStore();
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const completedCount = tasks.filter(t => t.status === 'Completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;
    const task = tasks.find(t => t.id === taskId);

    if (task && task.status !== newStatus) {
      setStatus(taskId, newStatus);
    }
  };

  return (
    <div className={styles.todoContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ width: '400px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.857rem', fontWeight: 500 }}>
            <span>Progress ({completedCount}/{tasks.length})</span>
            <span>{progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setAddModalOpen(true)}>Add Task</Button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          {COLUMNS.map(col => (
            <TaskColumn 
              key={col} 
              status={col} 
              tasks={tasks.filter(t => t.status === col)} 
              onDelete={deleteTask}
            />
          ))}
        </div>
      </DndContext>

      {isAddModalOpen && (
        <AddTaskModal jobId={job.id} open={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
      )}
    </div>
  );
}

function TaskColumn({ status, tasks, onDelete }: { status: TaskStatus, tasks: Task[], onDelete: (id: string) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  
  return (
    <div 
      className={styles.kanbanColumn} 
      ref={setNodeRef}
      style={{ 
        flex: 1, 
        minWidth: 0,
        backgroundColor: isOver ? 'var(--surface)' : 'var(--surface-2)' 
      }}
    >
      <div className={styles.kanbanHeader}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {status === 'Completed' && <CheckCircle2 size={16} color="var(--success)" />}
          {status}
        </h3>
        <span className={styles.kanbanCount}>{tasks.length}</span>
      </div>
      <div className={styles.kanbanCards}>
        {tasks.map(t => (
          <TaskCard key={t.id} task={t} onDelete={onDelete} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onDelete }: { task: Task, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task
  });
  
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 1
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={styles.kanbanCard}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <span className={`badge priority-${task.priority}`} style={{ 
          backgroundColor: task.priority === 'Critical' ? 'var(--danger-soft)' : 
                          task.priority === 'High' ? 'var(--warning-soft)' : 
                          task.priority === 'Medium' ? 'var(--info-soft)' : 'var(--surface-3)',
          color: task.priority === 'Critical' ? 'var(--danger)' : 
                 task.priority === 'High' ? 'var(--warning)' : 
                 task.priority === 'Medium' ? 'var(--info)' : 'var(--text-secondary)'
        }}>
          {task.priority}
        </span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <Trash2 size={14} />
        </button>
      </div>
      
      <div style={{ fontWeight: 600, fontSize: '0.929rem', color: 'var(--text-primary)', marginBottom: '4px' }}>
        {task.title}
      </div>
      
      {task.description && (
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </div>
      )}
      
      {task.dueDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <Clock size={12} /> {formatDate(task.dueDate)}
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------------------------

interface AddTaskModalProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
}

function AddTaskModal({ jobId, open, onClose }: AddTaskModalProps) {
  const addTask = useTaskStore(s => s.addTask);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      priority: 'Medium',
      status: 'Pending',
    }
  });

  const onSubmit = (data: any) => {
    addTask({
      jobId,
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      status: data.status,
      dueDate: data.dueDate || '',
      reminderDate: '',
      tags: []
    });
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Add New Task" footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Save Task</Button>
      </>
    }>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Task Title" 
          required 
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message as string}
        />
        <Select label="Priority" {...register('priority')}>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </Select>
        <Input label="Due Date" type="datetime-local" {...register('dueDate')} />
        <Textarea label="Description" {...register('description')} />
      </form>
    </Modal>
  );
}
