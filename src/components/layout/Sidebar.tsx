import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  LayoutDashboard, Briefcase, Users, Building2, FileText,
  BarChart3, Calendar, ClipboardList, Bell, Settings,
  ChevronLeft, ChevronRight, Zap, X,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useReminderStore } from '../../store/useReminderStore';
import styles from './Sidebar.module.css';

const NAV = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Jobs', to: '/jobs', icon: Briefcase },
  { label: 'Candidates', to: '/candidates', icon: Users },
  { label: 'Companies', to: '/companies', icon: Building2 },
  { label: 'Resume Library', to: '/resumes', icon: FileText },
  { label: 'Analytics', to: '/analytics', icon: BarChart3 },
  { label: 'Calendar', to: '/calendar', icon: Calendar },
  { label: 'Daily Tracker', to: '/tracker', icon: ClipboardList },
  { label: 'Reminders', to: '/reminders', icon: Bell },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const { settings, toggleSidebar } = useSettingsStore();
  const collapsed = mobileOpen ? false : settings.sidebarCollapsed;
  const activeReminders = useReminderStore(s => s.getDueReminders()).length;
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (mobileOpen && onClose) {
      onClose();
    }
  }, [location.pathname]);

  return (
    <>
      {mobileOpen && (
        <div className={styles.mobileOverlay} onClick={onClose} />
      )}
      <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}>
        {/* Brand */}
        <div className={styles.brand}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }} onClick={() => navigate('/')}>
            <div className={styles.brandIcon}>
              <Zap size={18} strokeWidth={2.5} />
            </div>
            {!collapsed && <span className={styles.brandName}>RecruitFlow</span>}
          </div>
          {mobileOpen && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {NAV.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <span className={styles.navIcon}>
                <Icon size={18} />
                {label === 'Reminders' && activeReminders > 0 && (
                  <span className={styles.badge}>{activeReminders}</span>
                )}
              </span>
              {!collapsed && <span className={styles.navLabel}>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className={styles.bottom}>
          {(settings.recruiterName || settings.recruiterCompany) && (
            <div className={styles.userProfile}>
              <div className={styles.avatar}>
                {settings.recruiterName ? settings.recruiterName.charAt(0).toUpperCase() : 'R'}
              </div>
              {!collapsed && (
                <div className={styles.userInfo}>
                  <div className={styles.userName}>{settings.recruiterName || 'Recruiter'}</div>
                  <div className={styles.userCompany}>{settings.recruiterCompany || 'RecruitFlow Workspace'}</div>
                </div>
              )}
            </div>
          )}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            title={collapsed ? 'Settings' : undefined}
          >
            <span className={styles.navIcon}><Settings size={18} /></span>
            {!collapsed && <span className={styles.navLabel}>Settings</span>}
          </NavLink>

          <button className={`${styles.collapseBtn} ${styles.desktopOnly}`} onClick={toggleSidebar}>
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </aside>
    </>
  );
}
