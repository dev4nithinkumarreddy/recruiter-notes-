import { useJobStore } from '../store/useJobStore';
import { useCandidateStore } from '../store/useCandidateStore';
import { useCompanyStore } from '../store/useCompanyStore';

export const loadDemoData = () => {
  const { addJob } = useJobStore.getState();
  const { addCandidate } = useCandidateStore.getState();
  const { addCompany } = useCompanyStore.getState();

  // 1. Create a Company
  const company = addCompany({
    name: 'TechCorp Solutions',
    industry: 'Software Development',
    website: 'https://techcorp.example.com',
    hrContactName: 'Sarah Jenkins',
    hrEmail: 'sarah@techcorp.example.com',
    hrPhone: '+1-555-0198',
    hiringManager: 'David Chen',
    address: 'San Francisco, CA',
    notes: 'Key client. They prefer candidates with startup experience.',
    isFavorite: true,
  });

  // 2. Create a Job
  const job = addJob({
    title: 'Senior Frontend Engineer (React)',
    clientName: company.name,
    companyId: company.id,
    department: 'Engineering',
    employmentType: 'Full-time',
    experience: '5-8',
    skills: ['React', 'TypeScript', 'Zustand', 'CSS Modules'],
    location: 'Remote (US)',
    salaryMin: 120000,
    salaryMax: 160000,
    currency: 'USD',
    noticePeriod: '30 Days',
    priority: 'High',
    colorLabel: 'blue',
    hiringManager: 'David Chen',
    recruiterName: 'Alex HR',
    openings: 2,
    status: 'Open',
    jdFiles: [],
    externalLink: 'https://techcorp.example.com/careers',
    description: 'Looking for a senior frontend engineer to lead our core product rewrite...',
    notes: 'Urgent requirement. Interview process is 3 rounds.',
    isPinned: true,
    isFavorite: false,
    isArchived: false,
  });

  // 3. Create Candidates for this Job
  addCandidate({
    jobId: job.id,
    fullName: 'Alice Walker',
    phone: '+1-555-1111',
    email: 'alice.w@example.com',
    linkedin: 'https://linkedin.com/in/alicewalker',
    currentCompany: 'Webify Inc',
    currentRole: 'Frontend Developer',
    experience: 6,
    currentCTC: 110000,
    expectedCTC: 140000,
    noticePeriod: '30 Days',
    currentLocation: 'Austin, TX',
    preferredLocation: 'Remote',
    skills: ['React', 'TypeScript', 'Redux', 'Next.js'],
    source: 'LinkedIn',
    stage: 'Screening',
    notes: 'Solid react background. Looking for fully remote.',
    tags: ['Strong JS', 'Available soon'],
    isShortlisted: false,
    isShared: false,
    interviewFeedback: '',
  });

  addCandidate({
    jobId: job.id,
    fullName: 'Bob Smith',
    phone: '+1-555-2222',
    email: 'bob.smith@example.com',
    linkedin: 'https://linkedin.com/in/bobsmith',
    currentCompany: 'Enterprise Systems',
    currentRole: 'UI Engineer',
    experience: 8,
    currentCTC: 130000,
    expectedCTC: 155000,
    noticePeriod: '60 Days',
    currentLocation: 'Seattle, WA',
    preferredLocation: 'Remote',
    skills: ['React', 'Vue', 'CSS Architecture'],
    source: 'Naukri',
    stage: 'Technical Round',
    notes: 'Cleared initial screening easily. Deep knowledge of CSS and rendering performance.',
    tags: ['CSS Expert'],
    isShortlisted: true,
    isShared: true,
    interviewFeedback: '',
  });

  addCandidate({
    jobId: job.id,
    fullName: 'Charlie Davis',
    phone: '+1-555-3333',
    email: 'charlie.d@example.com',
    linkedin: '',
    currentCompany: 'Startup Hub',
    currentRole: 'Fullstack Dev',
    experience: 4,
    currentCTC: 90000,
    expectedCTC: 120000,
    noticePeriod: 'Immediate',
    currentLocation: 'New York, NY',
    preferredLocation: 'Remote',
    skills: ['React', 'Node.js', 'PostgreSQL'],
    source: 'Referral',
    stage: 'Rejected',
    notes: 'Failed technical round. Not enough experience with complex state management.',
    tags: ['Needs more exp'],
    isShortlisted: false,
    isShared: false,
    interviewFeedback: 'Struggled with Zustand concepts.',
  });

  return { company, job };
};
