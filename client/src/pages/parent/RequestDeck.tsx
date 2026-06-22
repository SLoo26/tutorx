import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, Heart, MapPin, MessageCircle, Wallet, X } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { Match, TuitionRequest } from '../../api/types';
import { TutorCardView } from '../../components/TutorCard';
import { Avatar, EmptyState, Pill, Spinner } from '../../components/ui';
import { dayLabel, formatTime, money, regionLabel } from '../../lib/format';

function SwipeCard({ match, onDecide }: { match: Match; onDecide: (d: 'like' | 'pass') => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-12, 12]);
  const likeOpacity = useTransform(x, [20, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -20], [1, 0]);

  return (
    <motion.div
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (info.offset.x > 120) onDecide('like');
        else if (info.offset.x < -120) onDecide('pass');
      }}
      whileTap={{ cursor: 'grabbing' }}
      className="relative cursor-grab"
    >
      <motion.div
        style={{ opacity: likeOpacity }}
        className="pointer-events-none absolute left-5 top-5 z-10 -rotate-12 rounded-lg border-4 border-emerald-500 px-3 py-1 text-xl font-extrabold text-emerald-500"
      >
        LIKE
      </motion.div>
      <motion.div
        style={{ opacity: passOpacity }}
        className="pointer-events-none absolute right-5 top-5 z-10 rotate-12 rounded-lg border-4 border-rose-500 px-3 py-1 text-xl font-extrabold text-rose-500"
      >
        PASS
      </motion.div>
      <TutorCardView tutor={match.tutor!} score={match.score} breakdown={match.score_breakdown} defaultOpenBreakdown />
    </motion.div>
  );
}

export default function RequestDeck() {
  const { id } = useParams();
  const [request, setRequest] = useState<TuitionRequest | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [confirmResult, setConfirmResult] = useState<any | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const res = await api.get<{ request: TuitionRequest; matches: Match[] }>(`/requests/${id}/matches`);
    setRequest(res.request);
    setMatches(res.matches);
    setLoading(false);
  }

  useEffect(() => {
    load().catch(() => setLoading(false));
  }, [id]);

  const withTutor = matches.filter((m) => m.tutor);
  const pending = withTutor.filter((m) => m.parent_decision === 'pending' && m.status !== 'rejected' && !m.has_job);
  const shortlist = withTutor.filter((m) => m.parent_decision === 'like' && !m.has_job);
  const confirmed = withTutor.filter((m) => m.has_job);

  async function decide(matchId: number, decision: 'like' | 'pass') {
    setMatches((prev) => prev.map((m) => (m.match_id === matchId ? { ...m, parent_decision: decision } : m)));
    try {
      await api.post(`/matches/${matchId}/swipe`, { decision });
    } catch {
      load();
    }
  }

  async function confirm(matchId: number) {
    setBusy(true);
    setError('');
    try {
      const res = await api.post(`/matches/${matchId}/confirm`);
      setConfirmResult(res);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not confirm');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Spinner label="Finding your matches…" />;

  return (
    <div className="space-y-8">
      {/* Request summary */}
      {request && (
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl">
                {request.subject} · {request.student_level}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2 text-sm">
                <Pill tone="brand">
                  <Wallet className="h-3.5 w-3.5" /> Budget {money(request.budget_per_hour)}/h
                </Pill>
                <Pill>
                  <MapPin className="h-3.5 w-3.5" /> {regionLabel(request.region)}
                </Pill>
                {request.preferred_day && (
                  <Pill>
                    {dayLabel(request.preferred_day)} {formatTime(request.preferred_time)}
                  </Pill>
                )}
                {request.second_subject && <Pill>+ {request.second_subject}</Pill>}
              </div>
            </div>
            <Link to="/parent" className="btn-ghost">
              All requests
            </Link>
          </div>
        </div>
      )}

      {/* Swipe deck */}
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
          Your matches · priority order
        </h2>
        {pending.length === 0 ? (
          <EmptyState title="You've gone through every match">
            Tutors you liked are in your shortlist below. New verified tutors will show up here automatically.
          </EmptyState>
        ) : (
          <div className="mx-auto max-w-xl">
            <div className="relative">
              <SwipeCard key={pending[0].match_id} match={pending[0]} onDecide={(d) => decide(pending[0].match_id, d)} />
            </div>
            <div className="mt-5 flex items-center justify-center gap-4">
              <button
                onClick={() => decide(pending[0].match_id, 'pass')}
                className="grid h-14 w-14 place-items-center rounded-full bg-white text-rose-500 shadow-card ring-1 ring-rose-100 transition hover:bg-rose-50"
                title="Pass"
              >
                <X className="h-6 w-6" />
              </button>
              <span className="text-xs text-slate-400">{pending.length} left · drag or tap</span>
              <button
                onClick={() => decide(pending[0].match_id, 'like')}
                className="grid h-14 w-14 place-items-center rounded-full bg-white text-emerald-500 shadow-card ring-1 ring-emerald-100 transition hover:bg-emerald-50"
                title="Like"
              >
                <Heart className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Shortlist */}
      {shortlist.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Your shortlist ({shortlist.length})
          </h2>
          {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          <div className="space-y-4">
            {shortlist.map((m) => (
              <TutorCardView
                key={m.match_id}
                tutor={m.tutor!}
                score={m.score}
                breakdown={m.score_breakdown}
                footer={
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-slate-500">
                      {m.chat_enabled ? 'You both liked each other — chat is open.' : 'Liked. You can confirm now or wait to chat.'}
                    </span>
                    <div className="flex gap-2">
                      <Link to={`/chat/${m.match_id}`} className="btn-ghost">
                        <MessageCircle className="h-4 w-4" /> Chat
                      </Link>
                      <button onClick={() => confirm(m.match_id)} disabled={busy} className="btn-primary">
                        <Check className="h-4 w-4" /> Want this tutor
                      </button>
                    </div>
                  </div>
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Confirmed */}
      {confirmed.length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Confirmed</h2>
          <div className="space-y-3">
            {confirmed.map((m) => (
              <div key={m.match_id} className="card flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar initials={m.tutor!.initials} seed={m.tutor!.display_name} />
                  <div>
                    <p className="font-semibold">{m.tutor!.display_name}</p>
                    <p className="text-sm text-emerald-600">Confirmed — contacts unlocked</p>
                  </div>
                </div>
                <Link to="/parent/jobs" className="btn-ghost">
                  View details
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confirm success modal */}
      {confirmResult && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={() => setConfirmResult(null)}>
          <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-center text-xl">Tutor confirmed!</h3>
            <p className="mt-1 text-center text-sm text-slate-500">
              Contact details are now unlocked. Here's your first-month summary.
            </p>
            <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm">
              <Row label="Agreed rate" value={`${money(confirmResult.job.hourly_rate)}/h`} />
              <Row label="First-month value" value={money(confirmResult.job.first_month_value)} />
              <Row label="TutorX fee (30%)" value={money(confirmResult.job.platform_fee)} />
              <Row label="Tutor receives (70%)" value={money(confirmResult.job.tutor_payout)} />
            </div>
            {confirmResult.contacts?.tutor && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm">
                <p className="font-semibold text-emerald-800">{confirmResult.contacts.tutor.name}</p>
                <p className="text-emerald-700">{confirmResult.contacts.tutor.phone}</p>
                <p className="text-emerald-700">{confirmResult.contacts.tutor.email}</p>
              </div>
            )}
            <button onClick={() => setConfirmResult(null)} className="btn-primary mt-5 w-full">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
