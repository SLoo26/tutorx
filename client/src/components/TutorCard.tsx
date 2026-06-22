import { ReactNode, useState } from 'react';
import { ChevronDown, Clock, GraduationCap, MapPin, Sparkles, Wallet } from 'lucide-react';
import { ScoreLine, TutorCard as TutorCardType } from '../api/types';
import { Avatar, Pill, Stars, VerifiedBadge } from './ui';
import { ScoreBreakdown } from './ScoreBreakdown';
import { dayLabel, eduLabel, formatTime, money, regionLabel } from '../lib/format';

export function ScoreBadge({ score }: { score: number }) {
  const tone = score >= 80 ? 'text-emerald-600 bg-emerald-50' : score >= 60 ? 'text-brand-700 bg-brand-50' : 'text-amber-700 bg-amber-50';
  return (
    <div className={`flex flex-col items-center rounded-2xl px-3 py-1.5 ${tone}`}>
      <span className="text-xl font-extrabold leading-none">{score}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">match</span>
    </div>
  );
}

interface Props {
  tutor: TutorCardType;
  score?: number;
  breakdown?: ScoreLine[];
  footer?: ReactNode;
  defaultOpenBreakdown?: boolean;
}

export function TutorCardView({ tutor, score, breakdown, footer, defaultOpenBreakdown }: Props) {
  const [open, setOpen] = useState(Boolean(defaultOpenBreakdown));

  return (
    <div className="card overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <Avatar initials={tutor.initials} seed={tutor.display_name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-lg">{tutor.display_name}</h3>
              <VerifiedBadge verified={tutor.is_verified} />
            </div>
            {tutor.headline && <p className="mt-0.5 text-sm text-slate-500">{tutor.headline}</p>}
            <div className="mt-1">
              <Stars value={tutor.rating.average} count={tutor.rating.count} />
            </div>
          </div>
          {score !== undefined && <ScoreBadge score={score} />}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-slate-400" />
            <span className="truncate">
              {eduLabel(tutor.highest_education)}
              {tutor.institution ? ` · ${tutor.institution}` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            {regionLabel(tutor.region)}
          </div>
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-slate-400" />
            {money(tutor.rate_min)}–{money(tutor.rate_max)}/h
          </div>
        </div>

        {tutor.subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tutor.subjects.map((s, i) => (
              <Pill key={i} tone={s.is_verified ? 'emerald' : 'slate'}>
                {s.subject} · {s.level}
                {s.grade ? ` · ${s.grade}` : ''}
              </Pill>
            ))}
          </div>
        )}

        {tutor.availability.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
            <Clock className="h-3.5 w-3.5 text-slate-400" />
            {tutor.availability.map((a, i) => (
              <span key={i} className="rounded-md bg-slate-50 px-2 py-0.5">
                {dayLabel(a.day_of_week)} {formatTime(a.start_time)}–{formatTime(a.end_time)}
              </span>
            ))}
          </div>
        )}

        {tutor.bio && <p className="mt-3 text-sm leading-relaxed text-slate-600">{tutor.bio}</p>}

        {breakdown && breakdown.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-brand-500" /> Why this match
              </span>
              <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="mt-3">
                <ScoreBreakdown lines={breakdown} />
              </div>
            )}
          </div>
        )}
      </div>
      {footer && <div className="border-t border-slate-100 bg-slate-50/50 p-4">{footer}</div>}
    </div>
  );
}
