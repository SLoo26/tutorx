import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { EmptyState, Pill, Spinner } from '../../components/ui';
import { money, timeAgo } from '../../lib/format';

export default function AdminPayments() {
  const [jobs, setJobs] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => api.get<{ jobs: any[] }>('/admin/jobs').then((r) => setJobs(r.jobs)).catch(() => setJobs([]));

  useEffect(() => {
    load();
  }, []);

  async function markPaid(id: number) {
    setBusy(true);
    try {
      await api.post(`/admin/jobs/${id}/mark-paid`);
      await load();
    } finally {
      setBusy(false);
    }
  }

  if (!jobs) return <Spinner label="Loading payments…" />;

  const collected = jobs.filter((j) => j.payment_status === 'paid').reduce((s, j) => s + j.platform_fee, 0);
  const pending = jobs.filter((j) => j.payment_status === 'unpaid').reduce((s, j) => s + j.platform_fee, 0);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Payments</h1>
        <p className="text-sm text-slate-500">Track first-month fees. Mark a job paid once you've received the fee.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Fees collected</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{money(collected)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Fees pending</p>
          <p className="mt-1 text-2xl font-extrabold text-amber-600">{money(pending)}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-slate-500">Total jobs</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{jobs.length}</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <EmptyState title="No jobs yet">Confirmed engagements and their fees will show up here.</EmptyState>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Parent</th>
                  <th className="px-4 py-3">Tutor</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">1st month</th>
                  <th className="px-4 py-3">Fee (30%)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j.id}>
                    <td className="px-4 py-3 font-medium">{j.parent_name}</td>
                    <td className="px-4 py-3">{j.tutor_name}</td>
                    <td className="px-4 py-3">{j.subject}</td>
                    <td className="px-4 py-3">{money(j.first_month_value)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{money(j.platform_fee)}</td>
                    <td className="px-4 py-3">
                      <Pill tone={j.payment_status === 'paid' ? 'emerald' : 'amber'}>{j.payment_status}</Pill>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {j.payment_status === 'unpaid' && (
                        <button onClick={() => markPaid(j.id)} disabled={busy} className="btn-primary px-3 py-1.5 text-xs">
                          Mark paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
