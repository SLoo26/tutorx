import { useEffect, useState } from 'react';
import { Mail, MapPin, Phone, Star } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { Job } from '../api/types';
import { Avatar, EmptyState, Pill, Spinner } from './ui';
import { money, regionLabel } from '../lib/format';

export function JobsList({ title, subtitle }: { title: string; subtitle: string }) {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [cancelFor, setCancelFor] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [reviewFor, setReviewFor] = useState<number | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const load = () =>
    api
      .get<{ jobs: Job[] }>('/jobs')
      .then((r) => setJobs(r.jobs))
      .catch(() => setJobs([]));

  useEffect(() => {
    load();
  }, []);

  async function cancel(jobId: number) {
    setBusy(true);
    setError('');
    try {
      await api.post(`/jobs/${jobId}/cancel`, { reason: reason || undefined });
      setCancelFor(null);
      setReason('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not cancel');
    } finally {
      setBusy(false);
    }
  }

  async function review(jobId: number) {
    setBusy(true);
    setError('');
    try {
      await api.post(`/jobs/${jobId}/review`, { rating, comment: comment || undefined });
      setReviewFor(null);
      setComment('');
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not submit review');
    } finally {
      setBusy(false);
    }
  }

  if (!jobs) return <Spinner label="Loading…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">{title}</h1>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {jobs.length === 0 ? (
        <EmptyState title="Nothing here yet">Confirmed engagements will appear here with full contact details.</EmptyState>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const c = job.counterparty;
            const statusTone = job.status === 'active' ? 'emerald' : job.status === 'cancelled' ? 'rose' : 'slate';
            return (
              <div key={job.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar initials={c.name.slice(0, 2).toUpperCase()} seed={c.name} />
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-sm text-slate-500 capitalize">
                        {c.role} · {job.subject}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Pill tone={statusTone}>{job.status}</Pill>
                    <Pill tone={job.payment_status === 'paid' ? 'emerald' : 'amber'}>{job.payment_status}</Pill>
                  </div>
                </div>

                {/* Revealed contact */}
                <div className="mt-4 grid gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
                  <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {c.phone || '—'}</span>
                  <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {c.email}</span>
                  <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {regionLabel(c.region)} · {c.postal_code || '—'}</span>
                </div>

                {/* Money */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                  <Stat label="Rate" value={`${money(job.hourly_rate)}/h`} />
                  <Stat label="First month" value={money(job.first_month_value)} />
                  <Stat label="TutorX fee" value={money(job.platform_fee)} />
                  <Stat label={job.your_side === 'tutor' ? 'You receive' : 'Tutor gets'} value={money(job.tutor_payout)} />
                </div>

                {/* Actions */}
                {job.status === 'active' && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                    {job.your_side === 'parent' && !job.reviewed && (
                      <button onClick={() => setReviewFor(job.id)} className="btn-ghost">
                        <Star className="h-4 w-4" /> Leave a review
                      </button>
                    )}
                    <button onClick={() => setCancelFor(job.id)} className="btn-ghost text-rose-600">
                      Cancel engagement
                    </button>
                  </div>
                )}

                {/* Cancel inline */}
                {cancelFor === job.id && (
                  <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm">
                    <p className="font-medium text-rose-800">Cancel this engagement?</p>
                    <p className="mt-1 text-rose-600">
                      Per our terms, if the first class is cancelled the tutor is still paid 70% of that first class and
                      TutorX keeps 30%.
                    </p>
                    <textarea
                      className="input mt-2"
                      placeholder="Reason (optional)"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => cancel(job.id)} disabled={busy} className="btn-danger">
                        Confirm cancellation
                      </button>
                      <button onClick={() => setCancelFor(null)} className="btn-ghost">
                        Keep it
                      </button>
                    </div>
                  </div>
                )}

                {/* Review inline */}
                {reviewFor === job.id && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 text-sm">
                    <p className="font-medium">Rate {c.name}</p>
                    <div className="mt-2 flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} onClick={() => setRating(n)}>
                          <Star className={`h-6 w-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      className="input mt-2"
                      placeholder="Share how the lessons went (optional)"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => review(job.id)} disabled={busy} className="btn-primary">
                        Submit review
                      </button>
                      <button onClick={() => setReviewFor(null)} className="btn-ghost">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-slate-800">{value}</p>
    </div>
  );
}
