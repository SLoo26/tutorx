import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Pill, Spinner, VerifiedBadge } from '../../components/ui';
import { regionLabel, timeAgo } from '../../lib/format';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[] | null>(null);

  useEffect(() => {
    api.get<{ users: any[] }>('/admin/users').then((r) => setUsers(r.users)).catch(() => setUsers([]));
  }, []);

  if (!users) return <Spinner label="Loading users…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl">Users</h1>
        <p className="text-sm text-slate-500">{users.length} accounts on the platform.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Region</th>
                <th className="px-4 py-3">Verified</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <Pill tone={u.role === 'admin' ? 'rose' : u.role === 'tutor' ? 'brand' : 'slate'}>{u.role}</Pill>
                  </td>
                  <td className="px-4 py-3">{u.region ? regionLabel(u.region) : '—'}</td>
                  <td className="px-4 py-3">{u.role === 'tutor' ? <VerifiedBadge verified={Boolean(u.is_verified)} /> : '—'}</td>
                  <td className="px-4 py-3 text-slate-400">{timeAgo(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
