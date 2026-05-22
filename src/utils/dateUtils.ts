export function parseISO(dateStr: string): Date {
  return new Date(dateStr);
}

export function isValid(date: Date): boolean {
  return !isNaN(date.getTime());
}

export function differenceInDays(future: Date, from: Date): number {
  const ms = future.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

export function nextAnniversary(memberSince: string): Date {
  const since = new Date(memberSince);
  const now = new Date();
  const anniversary = new Date(since);
  anniversary.setFullYear(now.getFullYear());
  if (anniversary < now) {
    anniversary.setFullYear(now.getFullYear() + 1);
  }
  return anniversary;
}

export function endOfCalendarYear(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), 11, 31); // Dec 31
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export type PeriodInterval = 1 | 3 | 6;

const MONTH_ABBR = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_LETTER = ['J','F','M','A','M','J','J','A','S','O','N','D'];

export function getCurrentPeriodKey(periodMonths: PeriodInterval): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (periodMonths === 1) return `${year}-M${String(month + 1).padStart(2, '0')}`;
  if (periodMonths === 3) return `${year}-Q${Math.floor(month / 3) + 1}`;
  return month < 6 ? `${year}-H1` : `${year}-H2`;
}

export function getAllPeriodKeys(periodMonths: PeriodInterval): string[] {
  const year = new Date().getFullYear();
  if (periodMonths === 1) return Array.from({ length: 12 }, (_, i) => `${year}-M${String(i + 1).padStart(2, '0')}`);
  if (periodMonths === 3) return [`${year}-Q1`, `${year}-Q2`, `${year}-Q3`, `${year}-Q4`];
  return [`${year}-H1`, `${year}-H2`];
}

export function isPeriodPast(periodKey: string, periodMonths: PeriodInterval): boolean {
  return periodKey < getCurrentPeriodKey(periodMonths);
}

export function getPeriodLabel(periodKey: string): string {
  if (periodKey.includes('-M')) {
    const m = parseInt(periodKey.split('-M')[1]);
    return MONTH_LETTER[m - 1] ?? String(m);
  }
  return periodKey.split('-').slice(1).join('-');
}

export function getPeriodLongLabel(periodKey: string): string {
  if (periodKey.includes('-M')) {
    const m = parseInt(periodKey.split('-M')[1]);
    return MONTH_ABBR[m - 1] ?? String(m);
  }
  return periodKey.split('-').slice(1).join('-');
}

export function getCurrentPeriodEndDate(periodMonths: PeriodInterval): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  if (periodMonths === 1) {
    return new Date(year, month + 1, 0); // last day of current month
  }
  const key = getCurrentPeriodKey(periodMonths);
  if (periodMonths === 3) {
    const q = parseInt(key.replace(/.*Q/, ''));
    // new Date(y, m, 0) = last day of month m-1
    return new Date(year, q * 3, 0); // Q1→Mar31, Q2→Jun30, Q3→Sep30, Q4→Dec31
  }
  const half = parseInt(key.replace(/.*H/, ''));
  return new Date(year, half === 1 ? 6 : 12, 0); // H1→Jun30, H2→Dec31
}
