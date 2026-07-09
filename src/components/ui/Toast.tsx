import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

// Singleton toast state
let listeners: ((toasts: ToastData[]) => void)[] = [];
let toasts: ToastData[] = [];

function notify() {
  listeners.forEach(l => l([...toasts]));
}

export const toast = {
  success: (message: string, duration = 3500) => addToast('success', message, duration),
  error:   (message: string, duration = 4500) => addToast('error', message, duration),
  warning: (message: string, duration = 4000) => addToast('warning', message, duration),
  info:    (message: string, duration = 3500) => addToast('info', message, duration),
};

function addToast(type: ToastType, message: string, duration: number) {
  const id = `toast_${Date.now()}`;
  toasts = [{ id, type, message, duration }, ...toasts].slice(0, 5);
  notify();
  setTimeout(() => removeToast(id), duration);
}

function removeToast(id: string) {
  toasts = toasts.filter(t => t.id !== id);
  notify();
}

const ICONS: Record<ToastType, ReactNode> = {
  success: <CheckCircle size={16} />,
  error:   <XCircle size={16} />,
  warning: <AlertCircle size={16} />,
  info:    <Info size={16} />,
};

export function ToastContainer() {
  const [list, setList] = useState<ToastData[]>([]);

  useEffect(() => {
    listeners.push(setList);
    return () => { listeners = listeners.filter(l => l !== setList); };
  }, []);

  return createPortal(
    <div className={styles.container} aria-live="polite">
      {list.map(t => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>{ICONS[t.type]}</span>
          <span className={styles.message}>{t.message}</span>
          <button className={styles.close} onClick={() => removeToast(t.id)}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>,
    document.body
  );
}
