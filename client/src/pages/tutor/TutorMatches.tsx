import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Heart, MapPin, MessageCircle, Wallet, X } from 'lucide-react';
import { api } from '../../api/client';
import { ScoreLine } from '../../api/types';
import { ScoreBreakdown } from '../../components/ScoreBreakdown';
import { EmptyState, Pill, Spinner } from '../../components/ui';
import { dayLabel, formatTime, money, regionLabel } from '../../lib/format';

interface TutorMatch {
  match_id: number;
  score: number;
  score_breakdown: ScoreLine[];
  parent_decision: 'pending' | 'like' | 'pass';
  tutor_decision: 'pending' | 'like' | 'pass';
  status: string;
  chat_enabled: boolean;
  student_level: string;
  subject: string;
  second_subject?: string | null;
  region: string;
  budget_per_hour: number;
  preferred_day?: string | null;
  preferred_time?: string | null;
  notes?: string | null;
}

export default function TutorMatches() {
  const [matches, setMatches] = useState<TutorMatch[] | null>(null);

  const load = () =>
    api
      .get<{ matches: TutorMatch[] }>('/tutor/matches')
      .then((r) => setMatches(r.matches))
      .catch(() => setMatches([]));

  useEffect(() => {
    load();
  }, []);

  async function decide(id: number, decision: 'like' | 'pass') {
    setMatches((prev) => (prev ? prev.map((m) => (m.match_id === id ? { ...m, tutor_decision: decision } : m)) : prev));
    await api.post(`/matches/${id}/swipe`, { decision }).catch(load);
  }

  if (!matches) return <Spinner label="Loading your matches…" />;

  const active = matches.filter((m) => m.tutor_decision !== 'pass' && m.status !== 'rejected');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Your matches</h1>
        <p className="text-sm text-slate-500">Requests we matched you to. Parent details stay hidden until they confirm you.</p>
      </div>

      {active.length === 0 ? (
        <EmptyState title="No matches yet">
          Once your profile is <strong>verified</strong> and a parent's request fits your subjects, region, rate and
          timing, it shows up here. Complete your{' '}
          <Link to="/tutor/profile" className="font-semibold text-brand-700 hover:underline">
            profile &amp; verification
          </Link>{' '}
          to start appearing.
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {active.map((m) => (
            <div key={m.match_id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg">
                    {m.subject} · {m.student_level}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    <Pill tone="brand">
                      <Wallet className="h-3.5 w-3.5" /> {money(m.budget_per_hour)}/h
                    </Pill>
                    <Pill>
                      <MapPin className="h-3.5 w-3.5" /> {regionLabel(m.region as any)}
                    </Pill>
                    {m.preferred_day && (
                      <Pill>
                        <Clock className="h-3.5 w-3.5" /> {dayLabel(m.preferred_day as any)} {formatTime(m.preferred_time)}
                      </Pill>
                    )}
                    {m.second_subject && <Pill>+ {m.second_subject}</Pill>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-2xl font-extrabold text-brand-600">{m.score}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">match</span>
                </div>
              </div>

              {m.parent_decision === 'like' && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 py-1 text-sm text-rose-600">
                  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> This parent shortlisted you
                </p>
              )}

              {m.notes && <p className="mt-3 text-sm text-slate-600">“{m.notes}”</p>}

              <div className="mt-4">
                <ScoreBreakdown lines={m.score_breakdown} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                {m.tutor_decision === 'like' ? (
                  <Pill tone="emerald">You're interested</Pill>
                ) : (
                  <button onClick={() => decide(m.match_id, 'like')} className="btn-primary">
                    <Heart className="h-4 w-4" /> I'm interested
                  </button>
                )}
                <button onClick={() => decide(m.match_id, 'pass')} className="btn-ghost text-slate-500">
                  <X className="h-4 w-4" /> Pass
                </button>
                {m.chat_enabled && (
                  <Link to={`/chat/${m.match_id}`} className="btn-ghost">
                    <MessageCircle className="h-4 w-4" /> Chat
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
