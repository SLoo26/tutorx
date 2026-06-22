import { useEffect, useState } from 'react';
import { BadgeCheck, Briefcase, ClipboardList, FileClock, Sparkles, Users, Wallet } from 'lucide-react';
import { api } from '../../api/client';
import { Spinner } from '../../components/ui';
import { money } from '../../lib/format';

interface Metrics {
  total_users: number;
  tutors: number;
  verified_tutors: number;
  open_requests: number;
  total_matches: number;
  total_jobs: number;
  collected_revenue: number;
  pending_documents: number;
  fee_rate: number;
}

export default function AdminOverview() {
  const [m, setM] = useState<Metrics | null>(null);

  useEffect(() => {
    api.get<{ metrics: Metrics }>('/admin/metrics').then((r) => setM(r.metrics)).catch(() => undefined);
  }, []);

  if (!m) return <Spinner label="Loading metrics…" />;

  const cards = [
    { label: 'Total users', value: m.total_users, icon: Users, tone: 'bg-brand-50 text-brand-600' },
    { label: 'Tutors', value: m.tutors, icon: Users, tone: 'bg-sky-50 text-sky-600' },
    { label: 'Verified tutors', value: m.verified_tutors, icon: BadgeCheck, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Open requests', value: m.open_requests, icon: ClipboardList, tone: 'bg-violet-50 text-violet-600' },
    { label: 'Matches', value: m.total_matches, icon: Sparkles, tone: 'bg-amber-50 text-amber-600' },
    { label: 'Confirmed jobs', value: m.total_jobs, icon: Briefcase, tone: 'bg-teal-50 text-teal-600' },
    { label: 'Revenue collected', value: money(m.collected_revenue), icon: Wallet, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Docs to review', value: m.pending_documents, icon: FileClock, tone: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl">Admin overview</h1>
        <p className="text-sm text-slate-500">
          Platform fee is {Math.round(m.fee_rate * 100)}% of the first month per confirmed subject.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${c.tone}`}>
              <c.icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold text-slate-900">{c.value}</p>
            <p className="text-sm text-slate-500">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
