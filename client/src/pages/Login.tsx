import { FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { homePathForRole, useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { ErrorText, Field } from '../components/ui';

const demos = [
  { label: 'Parent', email: 'parent@tutorx.sg', password: 'password123' },
  { label: 'Tutor', email: 'nurul@tutorx.sg', password: 'password123' },
  { label: 'Admin', email: 'admin@tutorx.sg', password: 'admin12345' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      navigate(location.state?.from || homePathForRole(user.role), { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card p-7">
        <h1 className="text-2xl">Welcome back</h1>
        <p className="mt-1 text-sm text-slate-500">Log in to see your matches.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <ErrorText>{error}</ErrorText>}
          <Field label="Email">
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          New here?{' '}
          <Link to="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <div className="card mt-4 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Demo accounts</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {demos.map((d) => (
            <button
              key={d.label}
              onClick={() => {
                setEmail(d.email);
                setPassword(d.password);
              }}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
