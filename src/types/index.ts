// ============================================================
// RecruitFlow – All TypeScript Types
// ============================================================

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent' | 'Critical';
export type ColorLabel = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'black' | 'purple';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship';
export type JobStatus = 'Open' | 'Hold' | 'Closed';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type CandidateSource = 'LinkedIn' | 'Naukri' | 'Indeed' | 'Referral' | 'Internal' | 'Walk-in' | 'Other';
export type ReminderType = 'Call' | 'Follow-up' | 'Share Resume' | 'Interview' | 'Joining' | 'Salary' | 'Other';
export type EventType = 'interview' | 'followup' | 'joining' | 'offer_expiry' | 'meeting' | 'reminder';

export type PipelineStage =
  | 'Collected'
  | 'Contacted'
  | 'Screening'
  | 'Shortlisted'
  | 'Client Shared'
  | 'Interview Round 1'
  | 'Interview Round 2'
  | 'Technical Round'
  | 'HR Round'
  | 'Selected'
  | 'Offer Released'
  | 'Joined'
  | 'Rejected'
  | 'Dropped';

export const PIPELINE_STAGES: PipelineStage[] = [
  'Collected', 'Contacted', 'Screening', 'Shortlisted',
  'Client Shared', 'Interview Round 1', 'Interview Round 2',
  'Technical Round', 'HR Round', 'Selected', 'Offer Released',
  'Joined', 'Rejected', 'Dropped',
];

export interface FileRef {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  dbKey: string; // IndexedDB key
}

export interface StageEvent {
  stage: PipelineStage;
  timestamp: string;
  note?: string;
}

export interface SharedEvent {
  id: string;
  sharedDate: string;
  sharedTo: string;
  emailSent: boolean;
  feedback?: string;
  clientResponse?: string;
  reminderDate?: string;
}

// ── Job ──────────────────────────────────────────────────────
export interface Job {
  id: string;
  title: string;
  clientName: string;
  companyId?: string;
  department: string;
  employmentType: EmploymentType;
  experience: string;
  skills: string[];
  location: string;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  noticePeriod: string;
  priority: Priority;
  colorLabel: ColorLabel;
  hiringManager: string;
  recruiterName: string;
  openings: number;
  status: JobStatus;
  jdFiles: FileRef[];
  externalLink: string;
  description: string;
  notes: string;
  isPinned: boolean;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Candidate ─────────────────────────────────────────────────
export interface Candidate {
  id: string;
  jobId: string;
  fullName: string;
  phone: string;
  email: string;
  linkedin: string;
  currentCompany: string;
  currentRole: string;
  experience: number;
  currentCTC: number;
  expectedCTC: number;
  noticePeriod: string;
  currentLocation: string;
  preferredLocation: string;
  skills: string[];
  source: CandidateSource;
  stage: PipelineStage;
  stageHistory: StageEvent[];
  resumes: FileRef[];
  notes: string;
  tags: string[];
  rating?: number;
  aiScore?: number;
  aiSummary?: string;
  isShortlisted: boolean;
  isShared: boolean;
  sharedHistory: SharedEvent[];
  interviewFeedback: string;
  createdAt: string;
  updatedAt: string;
}

// ── Company ───────────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  logo?: string;
  industry: string;
  website: string;
  hrContactName: string;
  hrEmail: string;
  hrPhone: string;
  hiringManager: string;
  address: string;
  notes: string;
  documents: FileRef[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Task ──────────────────────────────────────────────────────
export interface Task {
  id: string;
  jobId: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  reminderDate: string;
  status: TaskStatus;
  tags: string[];
  order: number;
  createdAt: string;
  completedAt: string;
}

// ── Note ──────────────────────────────────────────────────────
export interface Note {
  id: string;
  jobId?: string;
  candidateId?: string;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Reminder ─────────────────────────────────────────────────
export interface Reminder {
  id: string;
  title: string;
  type: ReminderType;
  relatedJobId?: string;
  relatedCandidateId?: string;
  dueAt: string;
  isDismissed: boolean;
  isCompleted: boolean;
  createdAt: string;
}

// ── Activity ─────────────────────────────────────────────────
export interface Activity {
  id: string;
  jobId?: string;
  candidateId?: string;
  companyId?: string;
  type: string;
  description: string;
  metadata?: Record<string, string>;
  createdAt: string;
}

// ── Daily Log ─────────────────────────────────────────────────
export interface DailyLog {
  id: string;
  date: string;
  candidatesSourced: number;
  callsMade: number;
  interviewsScheduled: number;
  offers: number;
  closures: number;
  pendingFollowups: number;
  notes: string;
}

// ── Calendar Event ────────────────────────────────────────────
export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  date: string;
  time?: string;
  relatedJobId?: string;
  relatedCandidateId?: string;
  notes?: string;
  color?: string;
  createdAt: string;
}

// ── Settings ──────────────────────────────────────────────────
export interface Settings {
  theme: 'light' | 'dark';
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone: string;
  recruiterCompany: string;
  groqKey: string;
  sidebarCollapsed: boolean;
  defaultPipelineView: 'kanban' | 'list';
}
