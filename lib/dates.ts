/** Today's date (YYYY-MM-DD) in the given time zone. */
export function todayIn(timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string) {
  return Math.round((Date.parse(toIso + 'T00:00:00Z') - Date.parse(fromIso + 'T00:00:00Z')) / 86400000);
}

export function prettyDate(iso: string) {
  return new Date(iso + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}

export function urgency(due: string | null, today: string, done: boolean) {
  if (done) return { label: 'Completed', tone: 'done' };
  if (!due) return { label: 'No deadline', tone: 'none' };
  const n = daysBetween(today, due);
  if (n < 0) return { label: n === -1 ? 'Overdue by 1 day' : 'Overdue by ' + -n + ' days', tone: 'overdue' };
  if (n === 0) return { label: 'Due today', tone: 'today' };
  if (n === 1) return { label: 'Due tomorrow', tone: 'tomorrow' };
  if (n <= 7) return { label: 'Due in ' + n + ' days', tone: 'week' };
  if (n <= 31) return { label: 'Due this month', tone: 'month' };
  return { label: 'Upcoming', tone: 'later' };
}
