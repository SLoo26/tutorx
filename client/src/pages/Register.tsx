import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { useMeta } from '../hooks/useMeta';
import { ErrorText, Field } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const meta = useMeta();

  const [role, setRole] = useState<'parent' | 'tutor'>('parent');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', postal_code: '', region: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        role,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        postal_code: form.postal_code || undefined,
        region: form.region || undefined,
      });
      navigate(role === 'tutor' ? '/tutor/profile' : '/parent', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-7">
        <h1 className="text-2xl">Create your account</h1>
        <p className="mt-1 text-sm text-slate-500">Join TutorX in under a minute.</p>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {([
            { key: 'parent', label: 'I need a tutor', icon: Users },
            { key: 'tutor', label: 'I am a tutor', icon: GraduationCap },
          ] as const).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRole(opt.key)}
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                role === opt.key ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              <opt.icon className="h-4 w-4" />
              {opt.label}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {error && <ErrorText>{error}</ErrorText>}
          <Field label="Full name">
            <input className="input" value={form.name} onChange={(e) => set('name', e.target.value)} required />
          </Field>
          <Field label="Email">
            <input className="input" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required />
          </Field>
          <Field label="Password" hint="At least 6 characters.">
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              required
              minLength={6}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Region">
              <select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
                <option value="">Select…</option>
                {meta?.regions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Postal code">
              <input className="input" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="e.g. 520123" />
            </Field>
          </div>
          <Field label="Phone" hint="Kept private until a match is confirmed.">
            <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="e.g. 9123 4567" />
          </Field>

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
