import { ScoreLine } from '../api/types';

export function ScoreBreakdown({ lines }: { lines: ScoreLine[] }) {
  return (
    <div className="space-y-2.5">
      {lines.map((l) => {
        const pct = l.max ? Math.round((l.points / l.max) * 100) : 0;
        return (
          <div key={l.key}>
            <div className="flex items-baseline justify-between gap-3 text-xs">
              <span className="font-medium text-slate-600">{l.label}</span>
              <span className="truncate text-right text-slate-400">{l.note}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${pct >= 75 ? 'bg-emerald-500' : pct >= 45 ? 'bg-brand-500' : 'bg-amber-400'}`}
                style={{ width: `${Math.max(4, pct)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
