import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import JobList from './pages/Jobs/JobList';
import JobWorkspace from './pages/Jobs/JobWorkspace';
import JobOverview from './pages/Jobs/JobWorkspace/Overview';
import JobDescription from './pages/Jobs/JobWorkspace/Description';
import JobCandidates from './pages/Jobs/JobWorkspace/Candidates';
import JobPipeline from './pages/Jobs/JobWorkspace/Pipeline';
import JobTodoList from './pages/Jobs/JobWorkspace/TodoList';
import JobNotes from './pages/Jobs/JobWorkspace/Notes';
import JobActivity from './pages/Jobs/JobWorkspace/ActivityTimeline';
import Shortlisted from './pages/Jobs/JobWorkspace/Shortlisted';
import AnalyticsTab from './pages/Jobs/JobWorkspace/AnalyticsTab';
import CandidateList from './pages/Candidates/CandidateList';
import CandidateProfile from './pages/Candidates/CandidateProfile';
import CompanyList from './pages/Companies/CompanyList';
import CompanyDetail from './pages/Companies/CompanyDetail';
import ResumeLibrary from './pages/ResumeLibrary';
import AnalyticsPage from './pages/Analytics';
import CalendarPage from './pages/Calendar';
import DailyTracker from './pages/DailyTracker';
import RemindersPage from './pages/Reminders';
import SettingsPage from './pages/Settings';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobWorkspace />}>
          <Route index element={<JobOverview />} />
          <Route path="description" element={<JobDescription />} />
          <Route path="candidates" element={<JobCandidates />} />
          <Route path="shortlisted" element={<Shortlisted />} />
          <Route path="pipeline" element={<JobPipeline />} />
          <Route path="tasks" element={<JobTodoList />} />
          <Route path="notes" element={<JobNotes />} />
          <Route path="activity" element={<JobActivity />} />
          <Route path="analytics" element={<AnalyticsTab />} />
        </Route>

        <Route path="/candidates" element={<CandidateList />} />
        <Route path="/candidates/:id" element={<CandidateProfile />} />
        
        <Route path="/companies" element={<CompanyList />} />
        <Route path="/companies/:id" element={<CompanyDetail />} />
        
        <Route path="/resumes" element={<ResumeLibrary />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/tracker" element={<DailyTracker />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
