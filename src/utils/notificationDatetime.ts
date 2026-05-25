const RIYADH_TZ = 'Asia/Riyadh';

/** Today's date in Riyadh as YYYY-MM-DD for min date on pickers */
export function minScheduleDateLocal(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: RIYADH_TZ }).format(new Date());
}

/** Combine local date + time (interpreted as Asia/Riyadh) → ISO 8601 UTC */
export function localRiyadhToUtcIso(date: string, time: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes] = time.split(':').map(Number);

  const utcGuess = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: RIYADH_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(utcGuess));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const riyadhAsUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );

  const offsetMs = riyadhAsUtc - utcGuess;
  return new Date(utcGuess - offsetMs).toISOString();
}

/** End of a Riyadh calendar day → ISO UTC (23:59:59 Riyadh) */
export function localRiyadhEndOfDayToUtcIso(date: string): string {
  return localRiyadhToUtcIso(date, '23:59');
}

export function isFutureUtc(iso: string): boolean {
  return new Date(iso).getTime() > Date.now();
}

export function formatScheduleDisplay(iso: string, locale: 'ar' | 'en' = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-GB', {
    timeZone: RIYADH_TZ,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function utcIsoToRiyadhDateTime(iso: string): { date: string; time: string } {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: RIYADH_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';

  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = get('hour');
  const minute = get('minute');

  return {
    date: `${year}-${month}-${day}`,
    time: `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`,
  };
}

export const SCHEDULE_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  once: { en: 'Custom date & time', ar: 'تاريخ ووقت مخصص' },
  daily: { en: 'Every day', ar: 'يومياً' },
  every_3_days: { en: 'Every 3 days', ar: 'كل 3 أيام' },
  weekly: { en: 'Weekly', ar: 'أسبوعياً' },
  monthly: { en: 'Monthly', ar: 'شهرياً' },
};

export const SCHEDULE_STATUS_COLORS: Record<string, 'gray' | 'green' | 'blue' | 'red' | 'yellow'> = {
  pending: 'gray',
  active: 'green',
  completed: 'blue',
  cancelled: 'red',
  failed: 'yellow',
};
