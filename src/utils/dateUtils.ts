export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0];
}

export function isDateInRange(
  date: string,
  startDate?: string,
  endDate?: string
): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  if (startDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    if (d < start) return false;
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    if (d > end) return false;
  }

  return true;
}

export function getDaysBetween(start: string, end: string): number {
  const startDate = new Date(start);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getOverdueDays(expectedDate: string, actualDate?: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedDate);
  expected.setHours(0, 0, 0, 0);
  const actual = actualDate ? new Date(actualDate) : today;
  actual.setHours(0, 0, 0, 0);

  if (actual <= expected) return 0;
  return Math.ceil((actual.getTime() - expected.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(expectedDate: string, actualReturnDate?: string): boolean {
  if (actualReturnDate) return false;
  return getOverdueDays(expectedDate) > 0;
}

export function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

export function isDueSoon(expectedDate: string, days: number = 3): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(expectedDate);
  expected.setHours(0, 0, 0, 0);
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + days);

  return expected >= today && expected <= dueDate;
}
