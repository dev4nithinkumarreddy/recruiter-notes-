import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Pin, Trash2, Edit2 } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { useNoteStore } from '../../../store/useNoteStore';
import { formatDate } from '../../../utils/dateUtils';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import { Input, Textarea } from '../../../components/ui/Input';
import type { Job, Note } from '../../../types';
import styles from './JobWorkspace.module.css';

const NOTE_COLORS = [
  { id: 'yellow', value: '#fef08a' },
  { id: 'blue', value: '#bfdbfe' },
  { id: 'green', value: '#bbf7d0' },
  { id: 'pink', value: '#fbcfe8' },
  { id: 'purple', value: '#e9d5ff' },
  { id: 'gray', value: '#f1f5f9' },
];

export default function Notes() {
  const { job } = useOutletContext<{ job: Job }>();
  
  const notes = useNoteStore(s => s.getNotesForJob(job.id));
  const { deleteNote, togglePin } = useNoteStore();
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Sort notes: pinned first, then by updated date
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setModalOpen(true);
  };

  const handleClose = () => {
    setEditingNote(null);
    setModalOpen(false);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
        <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Add Note</Button>
      </div>

      {sortedNotes.length > 0 ? (
        <div className={styles.noteGrid}>
          {sortedNotes.map(note => (
            <div 
              key={note.id} 
              className={styles.noteCard}
              style={{ backgroundColor: note.color || '#fef08a' }}
            >
              <div className={styles.noteHeader}>
                <div className={styles.noteTitle}>{note.title}</div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => togglePin(note.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.isPinned ? '#000' : 'rgba(0,0,0,0.3)' }}
                    title={note.isPinned ? "Unpin" : "Pin"}
                  >
                    <Pin size={16} />
                  </button>
                  <button 
                    onClick={() => handleEdit(note)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)' }}
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,0,0,0.4)' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className={styles.noteContent}>{note.content}</div>
              <div style={{ marginTop: 'auto', fontSize: '0.7rem', color: 'rgba(0,0,0,0.5)', paddingTop: '10px' }}>
                {formatDate(note.updatedAt)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <h3 style={{ marginTop: 0 }}>No Notes Yet</h3>
          <p>Add sticky notes for interview feedback, reminders, or general observations.</p>
          <Button icon={<Plus size={16} />} onClick={() => setModalOpen(true)}>Create Note</Button>
        </div>
      )}

      {isModalOpen && (
        <NoteModal 
          jobId={job.id} 
          open={isModalOpen} 
          onClose={handleClose} 
          existingNote={editingNote} 
        />
      )}
    </div>
  );
}

// ----------------------------------------------------------------------

interface NoteModalProps {
  jobId: string;
  open: boolean;
  onClose: () => void;
  existingNote?: Note | null;
}

function NoteModal({ jobId, open, onClose, existingNote }: NoteModalProps) {
  const { addNote, updateNote } = useNoteStore();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      title: existingNote?.title || '',
      content: existingNote?.content || '',
      color: existingNote?.color || '#fef08a',
    }
  });

  const onSubmit = (data: any) => {
    if (existingNote) {
      updateNote(existingNote.id, {
        title: data.title,
        content: data.content,
        color: data.color
      });
    } else {
      addNote({
        jobId,
        title: data.title,
        content: data.content,
        color: data.color,
        isPinned: false,
        tags: []
      });
    }
    reset();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={existingNote ? "Edit Note" : "Add Note"} footer={
      <>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit(onSubmit)}>Save Note</Button>
      </>
    }>
      <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input 
          label="Title" 
          placeholder="e.g. Hiring Manager Feedback"
          required 
          {...register('title', { required: 'Title is required' })}
          error={errors.title?.message as string}
        />
        <Textarea 
          label="Content" 
          placeholder="Write your notes here..."
          required
          {...register('content', { required: 'Content is required' })}
          error={errors.content?.message as string}
          style={{ minHeight: '150px' }}
        />
        
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
            Note Color
          </label>
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <div style={{ display: 'flex', gap: '8px' }}>
                {NOTE_COLORS.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: c.value,
                      border: field.value === c.value ? '2px solid var(--text-primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      boxShadow: field.value === c.value ? '0 0 0 2px var(--surface)' : 'none'
                    }}
                    onClick={() => field.onChange(c.value)}
                  />
                ))}
              </div>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
