import { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { Select, Textarea } from '../ui/Input';
import { toast } from '../ui/Toast';
import { generateMessageDraft } from '../../utils/groqApi';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Copy, Loader2, Sparkles } from 'lucide-react';
import type { Candidate, Job } from '../../types';

interface AiMessageModalProps {
  candidate: Candidate;
  job?: Job;
  open: boolean;
  onClose: () => void;
}

export default function AiMessageModal({ candidate, job, open, onClose }: AiMessageModalProps) {
  const [type, setType] = useState<'email' | 'whatsapp'>('email');
  const [tone, setTone] = useState<'Professional' | 'Friendly' | 'Urgent'>('Professional');
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const groqKey = useSettingsStore(s => s.settings.groqKey);
  const recruiterName = useSettingsStore(s => s.settings.recruiterName) || 'Recruiter';

  const handleGenerate = async () => {
    if (!groqKey) {
      toast.error('Please configure your Groq API Key in Settings first.');
      return;
    }

    setIsGenerating(true);
    setDraft('');
    try {
      const result = await generateMessageDraft(
        candidate.fullName,
        candidate.stage,
        job?.title || 'an open position',
        recruiterName,
        type,
        tone,
        groqKey
      );
      setDraft(result);
      toast.success('Draft generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!draft) return;
    navigator.clipboard.writeText(draft);
    toast.success('Copied to clipboard!');
  };

  return (
    <Modal open={open} onClose={onClose} title="AI Message Drafter" size="md">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '0.857rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Use AI to quickly generate a highly personalized message for {candidate.fullName}.
        </p>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <Select label="Message Type" value={type} onChange={(e) => setType(e.target.value as 'email' | 'whatsapp')}>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
            </Select>
          </div>
          <div style={{ flex: 1 }}>
            <Select label="Tone" value={tone} onChange={(e) => setTone(e.target.value as any)}>
              <option value="Professional">Professional</option>
              <option value="Friendly">Friendly</option>
              <option value="Urgent">Urgent</option>
            </Select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Button onClick={handleGenerate} disabled={isGenerating} icon={isGenerating ? <Loader2 className="spin" size={16}/> : <Sparkles size={16}/>}>
            {isGenerating ? 'Generating...' : 'Generate Draft'}
          </Button>
        </div>

        {draft && (
          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.857rem', fontWeight: 500, color: 'var(--text-primary)' }}>Generated Draft</label>
            <div style={{ position: 'relative' }}>
              <Textarea 
                value={draft} 
                onChange={(e) => setDraft(e.target.value)}
                style={{ height: '200px', fontSize: '0.9rem', lineHeight: '1.5' }} 
              />
              <button 
                onClick={handleCopy}
                style={{ 
                  position: 'absolute', right: '12px', top: '12px', 
                  background: 'var(--surface)', border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', padding: '6px', 
                  cursor: 'pointer', color: 'var(--text-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                title="Copy to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
