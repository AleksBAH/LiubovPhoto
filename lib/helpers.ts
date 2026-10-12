import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

export function getProgressPercent(sessionDate: string | Date, deadlineDate: string | Date): number {
  const session = typeof sessionDate === 'string' ? parseISO(sessionDate) : sessionDate;
  const deadline = typeof deadlineDate === 'string' ? parseISO(deadlineDate) : deadlineDate;
  const now = new Date();
  const total = differenceInDays(deadline, session);
  if (total <= 0) return 100;
  const elapsed = differenceInDays(now, session);
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

export function getProgressColor(percent: number): string {
  if (percent <= 50) return '#4CAF82';
  if (percent <= 75) return '#F5A623';
  return '#E05252';
}

export function getDaysRemaining(deadlineDate: string | Date): number {
  const deadline = typeof deadlineDate === 'string' ? parseISO(deadlineDate) : deadlineDate;
  return Math.max(0, differenceInDays(deadline, new Date()));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy', { locale: ru });
  } catch {
    return '';
  }
}

export function formatCurrency(amount: number | null | undefined): string {
  return `$${(amount ?? 0).toLocaleString('en-NZ', { minimumFractionDigits: 0 })}`;
}

export function translateCategory(category: string | null | undefined): string {
  switch (category) {
    case 'Newborn':
      return 'Новорождённые';
    case 'Maternity':
      return 'Беременность';
    case 'Smash Cake':
      return 'Смэш торт';
    default:
      return category ?? '';
  }
}
