import { ReactNode } from 'react';
import { BadgeCheck, Loader2, Star } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500',
  'bg-violet-500', 'bg-fuchsia-500', 'bg-indigo-500', 'bg-teal-500',
];

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/** Image-free initials avatar (tutors don't upload photos). */
export function Avatar({ initials, seed, size = 'md' }: { initials: string; seed: string; size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-9 w-9 text-xs' : 'h-12 w-12 text-base';
  return (
    <div className={`${dims} ${colorFor(seed)} flex items-center justify-center rounded-2xl font-bold text-white shadow-sm`}>
      {initials || '?'}
    </div>
  );
}

export function VerifiedBadge({ verified }: { verified: boolean }) {
  return verified ? (
    <span className="badge bg-emerald-50 text-emerald-700">
      <BadgeCheck className="h-3.5 w-3.5" /> Verified
    </span>
  ) : (
    <span className="badge bg-amber-50 text-amber-700">Pending review</span>
  );
}

export function Pill({ children, tone = 'slate' }: { children: ReactNode; tone?: 'slate' | 'brand' | 'emerald' | 'amber' | 'rose' }) {
  const tones: Record<string, string> = {
    slate: 'bg-slate-100 text-slate-700',
    brand: 'bg-brand-50 text-brand-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function Stars({ value, count }: { value: number; count: number }) {
  if (!count) return <span className="text-xs text-slate-400">New tutor</span>;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
      {value.toFixed(1)} <span className="text-slate-400">({count})</span>
    </span>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-2 px-6 py-12 text-center">
      <h3 className="text-lg">{title}</h3>
      {children && <p className="max-w-sm text-sm text-slate-500">{children}</p>}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null;
  return <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{children}</p>;
}
