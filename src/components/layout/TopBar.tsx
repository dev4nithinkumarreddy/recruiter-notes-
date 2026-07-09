import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Plus, X, Briefcase, Users, Building2, Menu } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useJobStore } from '../../store/useJobStore';
import { useCandidateStore } from '../../store/useCandidateStore';
import { useCompanyStore } from '../../store/useCompanyStore';
import { searchAll, type SearchResult } from '../../utils/searchUtils';
import styles from './TopBar.module.css';

const ICONS = {
  job: Briefcase,
  candidate: Users,
  company: Building2,
};

interface TopBarProps {
  onMenuClick?: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const { settings, toggleTheme } = useSettingsStore();
  const jobs = useJobStore(s => s.jobs);
  const candidates = useCandidateStore(s => s.candidates);
  const companies = useCompanyStore(s => s.companies);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 1) {
      const r = searchAll(query, jobs, candidates, companies);
      setResults(r);
      setOpen(r.length > 0);
    } else {
      setResults([]);
      setOpen(false);
    }
  }, [query, jobs, candidates, companies]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleSelect = (result: SearchResult) => {
    navigate(result.url);
    setQuery('');
    setOpen(false);
  };

  return (
    <header className={styles.topbar}>
      {/* Mobile Menu Toggle */}
      {onMenuClick && (
        <button className={`${styles.iconBtn} ${styles.mobileOnly}`} onClick={onMenuClick} title="Menu">
          <Menu size={20} />
        </button>
      )}

      {/* Search */}
      <div className={styles.searchWrap} ref={wrapRef}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Search jobs, candidates, companies... (⌘K)"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setOpen(true)}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => { setQuery(''); setOpen(false); }}>
              <X size={14} />
            </button>
          )}
        </div>

        {open && (
          <div className={styles.searchDropdown}>
            {results.map(r => {
              const Icon = ICONS[r.type];
              return (
                <button key={r.id} className={styles.searchItem} onClick={() => handleSelect(r)}>
                  <span className={`${styles.searchItemIcon} ${styles[r.type]}`}>
                    <Icon size={14} />
                  </span>
                  <span className={styles.searchItemText}>
                    <span className={styles.searchItemTitle}>{r.title}</span>
                    <span className={styles.searchItemSub}>{r.subtitle}</span>
                  </span>
                  <span className={styles.searchItemType}>{r.type}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.iconBtn} onClick={toggleTheme} title="Toggle theme">
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className={styles.addBtn}
          onClick={() => navigate('/jobs?new=1')}
          title="Quick Add"
        >
          <Plus size={16} />
          <span className={styles.desktopOnly}>Quick Add</span>
        </button>
      </div>
    </header>
  );
}
