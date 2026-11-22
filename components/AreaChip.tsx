import type { Area } from '@/lib/app-data';

export default function AreaChip({ area }: { area?: Area | null }) {
  if (!area) return null;
  return (
    <span className="chip" style={{ background: area.color + '22', color: 'var(--ink)', border: `1px solid ${area.color}55` }}>
      {area.name}
    </span>
  );
}

export function AreaSelect({ areas, id, name = 'area_id', label = 'Life area', defaultValue }: { areas: Area[]; id: string; name?: string; label?: string; defaultValue?: string }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} name={name} className="select" defaultValue={defaultValue ?? areas[0]?.id ?? ''}>
        <option value="">None</option>
        {areas.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
