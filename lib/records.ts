/** Shared helpers for planned-vs-actual maths. */
export type BlockRecord = {
  status: 'done' | 'partial' | 'skipped';
  actual_minutes: number | null;
  actual_note: string | null;
  skip_reason: string | null;
  next_action: string | null;
  rescheduled_to: string | null;
};
export type Block = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  title: string;
  area_id: string | null;
  priority: string;
  notes: string | null;
  record: BlockRecord | null;
};

export function toMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + (m || 0);
}

export function plannedMinutes(b: Block) {
  return Math.max(0, toMinutes(b.end_time) - toMinutes(b.start_time));
}

/** Actual minutes only count what the user recorded. Nothing is assumed for unrecorded blocks. */
export function actualMinutes(b: Block) {
  const r = b.record;
  if (!r || r.status === 'skipped') return 0;
  if (r.actual_minutes != null) return r.actual_minutes;
  return r.status === 'done' ? plannedMinutes(b) : 0;
}

export function normaliseBlocks(rows: any[]): Block[] {
  return (rows || []).map((b) => {
    const rec = Array.isArray(b.block_records) ? b.block_records[0] : b.block_records;
    return { ...b, record: rec || null };
  });
}

export function fmtMinutes(m: number) {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return r + 'm';
  return r ? `${h}h ${r}m` : `${h}h`;
}

export function clock(t: string) {
  const [h, m] = t.split(':').map(Number);
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${String(m || 0).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}
