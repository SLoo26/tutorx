import { useEffect, useState } from 'react';
import { Check, Eye, X } from 'lucide-react';
import { api, getToken } from '../../api/client';
import { EmptyState, Pill, Spinner, VerifiedBadge } from '../../components/ui';
import { DOC_TYPE_LABEL, timeAgo } from '../../lib/format';

export default function AdminVerify() {
  const [documents, setDocuments] = useState<any[] | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [busy, setBusy] = useState(false);

  const load = () =>
    api
      .get<{ documents: any[] }>(`/admin/documents${filter === 'pending' ? '?status=pending' : ''}`)
      .then((r) => setDocuments(r.documents))
      .catch(() => setDocuments([]));

  useEffect(() => {
    setDocuments(null);
    load();
  }, [filter]);

  async function review(id: number, status: 'verified' | 'rejected') {
    setBusy(true);
    try {
      await api.post(`/admin/documents/${id}/verify`, { status, note: notes[id] || undefined });
      await load();
    } finally {
      setBusy(false);
    }
  }

  async function viewFile(id: number) {
    const res = await fetch(`/api/admin/documents/${id}/file`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) {
      alert('File not available (demo records use placeholder files).');
      return;
    }
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), '_blank');
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl">Verify credentials</h1>
          <p className="text-sm text-slate-500">Approve a document to verify the tutor and unlock their subjects.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm">
          {(['pending', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-3 py-1.5 font-medium capitalize ${filter === f ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {!documents ? (
        <Spinner label="Loading documents…" />
      ) : documents.length === 0 ? (
        <EmptyState title="Nothing to review">All caught up — no documents in this view.</EmptyState>
      ) : (
        <div className="space-y-4">
          {documents.map((d) => (
            <div key={d.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{d.tutor_name}</p>
                  <p className="text-sm text-slate-500">{d.tutor_email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Pill tone="brand">{DOC_TYPE_LABEL[d.doc_type] ?? d.doc_type}</Pill>
                    <span className="text-sm text-slate-400">{d.original_name}</span>
                    <span className="text-xs text-slate-400">· {timeAgo(d.created_at)}</span>
                  </div>
                </div>
                <VerifiedBadge verified={d.status === 'verified'} />
              </div>

              {d.status === 'pending' ? (
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                  <input
                    className="input"
                    placeholder="Reviewer note (optional)"
                    value={notes[d.id] ?? ''}
                    onChange={(e) => setNotes((n) => ({ ...n, [d.id]: e.target.value }))}
                  />
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => viewFile(d.id)} className="btn-ghost">
                      <Eye className="h-4 w-4" /> View file
                    </button>
                    <button onClick={() => review(d.id, 'verified')} disabled={busy} className="btn-primary">
                      <Check className="h-4 w-4" /> Verify
                    </button>
                    <button onClick={() => review(d.id, 'rejected')} disabled={busy} className="btn-ghost text-rose-600">
                      <X className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 text-sm capitalize text-slate-500">
                  {d.status}
                  {d.reviewer_note ? ` · ${d.reviewer_note}` : ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
