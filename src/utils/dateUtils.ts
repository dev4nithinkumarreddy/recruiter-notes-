import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function formatDate(isoString: string): string {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    if (isToday(date)) return `Today ${format(date, 'h:mm a')}`;
    if (isYesterday(date)) return `Yesterday ${format(date, 'h:mm a')}`;
    return format(date, 'MMM d, yyyy');
  } catch {
    return isoString;
  }
}

export function formatRelative(isoString: string): string {
  if (!isoString) return '';
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return isoString;
  }
}

export function formatShort(isoString: string): string {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), 'MMM d');
  } catch {
    return isoString;
  }
}

export function formatDateInput(isoString: string): string {
  if (!isoString) return '';
  try {
    return format(parseISO(isoString), 'yyyy-MM-dd');
  } catch {
    return '';
  }
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function isOverdue(isoString: string): boolean {
  if (!isoString) return false;
  try {
    return parseISO(isoString) < new Date();
  } catch {
    return false;
  }
}

export function getDayLabel(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMM d, yyyy');
}
