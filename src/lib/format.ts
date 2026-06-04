export function formatCurrencyFromRupees(value: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value);
}

export function getCurrentMonthKey(date = new Date()): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Calendar cells use UTC noon so dateKey matches stored expense/income dates. */
export function getMonthCalendarDays(monthKey: string): Date[] {
  const [year, month] = monthKey.split('-').map(Number);
  if (!year || !month) return [];
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return new Date(Date.UTC(year, month - 1, day, 12, 0, 0, 0));
  });
}

export function parseAmountToRupees(value: string): number {
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) {
    return 0;
  }
  return Number(numberValue.toFixed(2));
}

export function formatDateKeyDisplay(dateKey: string): string {
  const [year, month, day] = dateKey.split('-');
  if (!year || !month || !day) return dateKey;
  return `${day}-${month}-${year}`;
}

export function formatDateTimeDisplay(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

