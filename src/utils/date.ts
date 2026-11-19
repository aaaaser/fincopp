export function formatTanggalHeader(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTanggalSingkat(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatWaktuSingkat(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export type ReportPeriodPreset = 'TODAY' | 'WEEK' | 'MONTH' | 'YEAR' | 'CUSTOM';

export function isDateInRange(
  dateStr: string,
  preset: ReportPeriodPreset,
  customStart?: string,
  customEnd?: string,
  referenceDateStr = '2026-11-18'
): boolean {
  const dateOnly = dateStr.slice(0, 10);
  if (preset === 'CUSTOM') {
    if (customStart && dateOnly < customStart) return false;
    if (customEnd && dateOnly > customEnd) return false;
    return true;
  }

  const ref = new Date(`${referenceDateStr}T00:00:00`);
  const target = new Date(`${dateOnly}T00:00:00`);
  if (Number.isNaN(target.getTime())) return true;

  if (preset === 'TODAY') {
    return dateOnly === referenceDateStr;
  }

  if (preset === 'WEEK') {
    const start = new Date(ref);
    start.setDate(ref.getDate() - 6);
    return target >= start && target <= ref;
  }

  if (preset === 'MONTH') {
    return (
      target.getFullYear() === ref.getFullYear() && target.getMonth() === ref.getMonth()
    );
  }

  if (preset === 'YEAR') {
    return target.getFullYear() === ref.getFullYear();
  }

  return true;
}
