import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { useMeta } from '../../hooks/useMeta';
import { ErrorText, Field } from '../../components/ui';

export default function NewRequest() {
  const meta = useMeta();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    student_level: 'Sec 4',
    subject: 'A-Math',
    second_subject: '',
    region: 'east',
    postal_code: '',
    budget_per_hour: 50,
    preferred_day: 'wed',
    preferred_time: '17:00',
    lessons_per_week: 1,
    hours_per_lesson: 1.5,
    notes: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ id: number; matchCount: number }>('/requests', {
        student_level: form.student_level,
        subject: form.subject,
        second_subject: form.second_subject || undefined,
        region: form.region,
        postal_code: form.postal_code,
        budget_per_hour: Number(form.budget_per_hour),
        preferred_day: form.preferred_day || undefined,
        preferred_time: form.preferred_time ? `${form.preferred_time}:00` : undefined,
        lessons_per_week: Number(form.lessons_per_week),
        hours_per_lesson: Number(form.hours_per_lesson),
        notes: form.notes || undefined,
      });
      navigate(`/parent/requests/${res.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create request');
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl">New tuition request</h1>
      <p className="mt-1 text-sm text-slate-500">
        We instantly score every verified tutor and rank your matches by fit.
      </p>

      <form onSubmit={submit} className="card mt-6 space-y-5 p-6">
        {error && <ErrorText>{error}</ErrorText>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Student level">
            <select className="input" value={form.student_level} onChange={(e) => set('student_level', e.target.value)}>
              {meta?.levels.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>
          <Field label="Subject">
            <select className="input" value={form.subject} onChange={(e) => set('subject', e.target.value)}>
              {meta?.subjects.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Second subject (optional)" hint="For combined subjects, e.g. A-Math + E-Math.">
          <select className="input" value={form.second_subject} onChange={(e) => set('second_subject', e.target.value)}>
            <option value="">None</option>
            {meta?.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Region">
            <select className="input" value={form.region} onChange={(e) => set('region', e.target.value)}>
              {meta?.regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Postal code" hint="We never store your full address.">
            <input className="input" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="e.g. 520123" required />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Budget ($/hour)">
            <input
              className="input"
              type="number"
              min={5}
              value={form.budget_per_hour}
              onChange={(e) => set('budget_per_hour', e.target.value)}
              required
            />
          </Field>
          <Field label="Preferred day">
            <select className="input" value={form.preferred_day} onChange={(e) => set('preferred_day', e.target.value)}>
              <option value="">Any</option>
              {meta?.days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preferred time">
            <input className="input" type="time" value={form.preferred_time} onChange={(e) => set('preferred_time', e.target.value)} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Lessons per week">
            <input className="input" type="number" min={1} max={7} value={form.lessons_per_week} onChange={(e) => set('lessons_per_week', e.target.value)} />
          </Field>
          <Field label="Hours per lesson">
            <input className="input" type="number" min={0.5} max={8} step={0.5} value={form.hours_per_lesson} onChange={(e) => set('hours_per_lesson', e.target.value)} />
          </Field>
        </div>

        <Field label="Notes (optional)">
          <textarea
            className="input min-h-[90px]"
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            placeholder="Anything the tutor should know — exam date, learning style, etc."
          />
        </Field>

        <button className="btn-primary w-full py-3" disabled={loading}>
          <Sparkles className="h-4 w-4" /> {loading ? 'Matching…' : 'Find my matches'}
        </button>
      </form>
    </div>
  );
}
