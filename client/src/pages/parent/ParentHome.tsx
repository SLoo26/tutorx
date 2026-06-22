import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, PlusCircle, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { TuitionRequest } from '../../api/types';
import { EmptyState, Pill, Spinner } from '../../components/ui';
import { dayLabel, formatTime, money, regionLabel } from '../../lib/format';

export default function ParentHome() {
  const [requests, setRequests] = useState<TuitionRequest[] | null>(null);

  useEffect(() => {
    api
      .get<{ requests: TuitionRequest[] }>('/requests')
      .then((r) => setRequests(r.requests))
      .catch(() => setRequests([]));
  }, []);

  if (!requests) return <Spinner label="Loading your requests…" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">My requests</h1>
          <p className="text-sm text-slate-500">Each request gets its own deck of matched, verified tutors.</p>
        </div>
        <Link to="/parent/new" className="btn-primary">
          <PlusCircle className="h-4 w-4" /> New request
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No requests yet">
          Post what your child needs — level, subject, budget and timing — and we'll match you with verified tutors in
          priority order.
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {requests.map((r) => (
            <Link key={r.id} to={`/parent/requests/${r.id}`} className="card p-5 transition hover:shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg">
                  {r.subject} · {r.student_level}
                </h3>
                <Pill tone={r.status === 'open' ? 'brand' : r.status === 'matched' ? 'emerald' : 'slate'}>
                  {r.status}
                </Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <Pill>{regionLabel(r.region)}</Pill>
                <Pill>{money(r.budget_per_hour)}/h</Pill>
                {r.preferred_day && (
                  <Pill>
                    {dayLabel(r.preferred_day)} {formatTime(r.preferred_time)}
                  </Pill>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-500" /> {r.match_count ?? 0} matches
                </span>
                <span className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 text-rose-400" /> {r.liked_count ?? 0} shortlisted
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
