import { FormEvent, useEffect, useState } from 'react';
import { BadgeCheck, FileText, Plus, Trash2, Upload } from 'lucide-react';
import { api, ApiError } from '../../api/client';
import { Slot, Subject } from '../../api/types';
import { useMeta } from '../../hooks/useMeta';
import { Field, Pill, Spinner, VerifiedBadge } from '../../components/ui';
import { DOC_TYPE_LABEL, dayLabel, formatTime } from '../../lib/format';

const DOC_TYPES = ['o_level_cert', 'a_level_cert', 'poly_cert', 'degree_cert', 'transcript', 'resume', 'other'];

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  postal_code: string;
  region: string;
  headline: string;
  bio: string;
  highest_education: string;
  institution: string;
  years_experience: number;
  rate_min: number;
  rate_max: number;
  teaching_style: string;
  is_verified: boolean | number;
}

export default function TutorProfile() {
  const meta = useMeta();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [presetAnswers, setPresetAnswers] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState('');

  const [newSubject, setNewSubject] = useState({ subject: 'A-Math', level: 'Sec 3-4', grade: 'A1' });
  const [docType, setDocType] = useState('o_level_cert');
  const [file, setFile] = useState<File | null>(null);

  async function load() {
    const res = await api.get<any>('/tutor/profile');
    setProfile({ ...res.profile, is_verified: res.profile.is_verified });
    setSubjects(res.subjects);
    setSlots(res.availability.map((a: any) => ({ day_of_week: a.day_of_week, start_time: a.start_time, end_time: a.end_time })));
    setDocuments(res.documents);
    setPresetAnswers(res.presetAnswers || {});
  }

  useEffect(() => {
    load();
  }, []);

  function showFlash(msg: string) {
    setFlash(msg);
    setTimeout(() => setFlash(''), 2500);
  }

  const set = (k: keyof ProfileData, v: string | number) => setProfile((p) => (p ? { ...p, [k]: v } : p));

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    try {
      await api.put('/tutor/profile', {
        name: profile.name,
        phone: profile.phone,
        postal_code: profile.postal_code,
        region: profile.region || undefined,
        headline: profile.headline,
        bio: profile.bio,
        highest_education: profile.highest_education,
        institution: profile.institution,
        years_experience: Number(profile.years_experience),
        rate_min: Number(profile.rate_min),
        rate_max: Number(profile.rate_max),
        teaching_style: profile.teaching_style,
      });
      showFlash('Profile saved.');
    } catch (err) {
      showFlash(err instanceof ApiError ? err.message : 'Save failed');
    }
  }

  async function addSubject() {
    await api.post('/tutor/subjects', newSubject);
    await load();
    showFlash('Subject added — pending verification.');
  }
  async function removeSubject(id?: number) {
    if (!id) return;
    await api.del(`/tutor/subjects/${id}`);
    await load();
  }

  async function saveAvailability() {
    await api.put('/tutor/availability', { slots });
    showFlash('Availability saved.');
  }

  async function uploadDoc(e: FormEvent) {
    e.preventDefault();
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    form.append('doc_type', docType);
    try {
      await api.upload('/tutor/documents', form);
      setFile(null);
      await load();
      showFlash('Uploaded — our admin will verify it shortly.');
    } catch (err) {
      showFlash(err instanceof ApiError ? err.message : 'Upload failed');
    }
  }

  async function savePresets() {
    await api.put('/tutor/preset-answers', { answers: presetAnswers });
    showFlash('Saved answers updated.');
  }

  if (!profile) return <Spinner label="Loading your profile…" />;
  const verified = Boolean(profile.is_verified);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl">My profile</h1>
        {flash && <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700">{flash}</span>}
      </div>

      {/* Verification status */}
      <div className={`card p-5 ${verified ? 'border-emerald-200' : 'border-amber-200'}`}>
        <div className="flex items-center gap-3">
          <span className={`grid h-10 w-10 place-items-center rounded-xl ${verified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            <BadgeCheck className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold">{verified ? 'You are verified' : 'Verification pending'}</p>
            <p className="text-sm text-slate-500">
              {verified
                ? 'You appear in parent matches. Keep your subjects and availability up to date.'
                : 'Upload a certificate or transcript below. You only appear in matches once an admin verifies you.'}
            </p>
          </div>
        </div>
      </div>

      {/* About */}
      <form onSubmit={saveProfile} className="card space-y-4 p-5">
        <h2 className="text-lg">About you</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <input className="input" value={profile.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Headline" hint="One line parents see first.">
            <input className="input" value={profile.headline ?? ''} onChange={(e) => set('headline', e.target.value)} />
          </Field>
        </div>
        <Field label="Bio">
          <textarea className="input min-h-[90px]" value={profile.bio ?? ''} onChange={(e) => set('bio', e.target.value)} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Highest education">
            <select className="input" value={profile.highest_education} onChange={(e) => set('highest_education', e.target.value)}>
              {meta?.education.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Institution">
            <input className="input" value={profile.institution ?? ''} onChange={(e) => set('institution', e.target.value)} />
          </Field>
          <Field label="Years experience">
            <input className="input" type="number" min={0} value={profile.years_experience} onChange={(e) => set('years_experience', e.target.value)} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Region">
            <select className="input" value={profile.region ?? ''} onChange={(e) => set('region', e.target.value)}>
              <option value="">Select…</option>
              {meta?.regions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Postal code">
            <input className="input" value={profile.postal_code ?? ''} onChange={(e) => set('postal_code', e.target.value)} />
          </Field>
          <Field label="Rate min ($/h)">
            <input className="input" type="number" value={profile.rate_min} onChange={(e) => set('rate_min', e.target.value)} />
          </Field>
          <Field label="Rate max ($/h)">
            <input className="input" type="number" value={profile.rate_max} onChange={(e) => set('rate_max', e.target.value)} />
          </Field>
        </div>
        <Field label="Phone" hint="Hidden from parents until a job is confirmed.">
          <input className="input" value={profile.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Teaching style">
          <input className="input" value={profile.teaching_style ?? ''} onChange={(e) => set('teaching_style', e.target.value)} />
        </Field>
        <button className="btn-primary">Save profile</button>
      </form>

      {/* Subjects */}
      <div className="card space-y-4 p-5">
        <h2 className="text-lg">Subjects you teach</h2>
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <span key={s.id} className={`badge ${s.is_verified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'} gap-2`}>
              {s.subject} · {s.level}{s.grade ? ` · ${s.grade}` : ''}
              {s.is_verified ? <BadgeCheck className="h-3.5 w-3.5" /> : null}
              <button onClick={() => removeSubject(s.id)} className="text-slate-400 hover:text-rose-500">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {subjects.length === 0 && <p className="text-sm text-slate-400">No subjects yet.</p>}
        </div>
        <div className="grid gap-2 sm:grid-cols-4">
          <select className="input" value={newSubject.subject} onChange={(e) => setNewSubject((n) => ({ ...n, subject: e.target.value }))}>
            {meta?.subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="input" value={newSubject.level} onChange={(e) => setNewSubject((n) => ({ ...n, level: e.target.value }))}>
            {['Primary', 'Sec 1-2', 'Sec 3-4', 'JC'].map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
          <input className="input" placeholder="Grade e.g. A1" value={newSubject.grade} onChange={(e) => setNewSubject((n) => ({ ...n, grade: e.target.value }))} />
          <button onClick={addSubject} className="btn-ghost">
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
        <p className="text-xs text-slate-400">New subjects are marked verified once your matching credential is approved.</p>
      </div>

      {/* Availability */}
      <div className="card space-y-4 p-5">
        <h2 className="text-lg">Weekly availability</h2>
        {slots.map((s, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-2">
            <select
              className="input col-span-4"
              value={s.day_of_week}
              onChange={(e) => setSlots((arr) => arr.map((x, idx) => (idx === i ? { ...x, day_of_week: e.target.value as any } : x)))}
            >
              {meta?.days.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
            <input
              type="time"
              className="input col-span-3"
              value={formatTime(s.start_time)}
              onChange={(e) => setSlots((arr) => arr.map((x, idx) => (idx === i ? { ...x, start_time: e.target.value } : x)))}
            />
            <input
              type="time"
              className="input col-span-3"
              value={formatTime(s.end_time)}
              onChange={(e) => setSlots((arr) => arr.map((x, idx) => (idx === i ? { ...x, end_time: e.target.value } : x)))}
            />
            <button onClick={() => setSlots((arr) => arr.filter((_, idx) => idx !== i))} className="col-span-2 text-slate-400 hover:text-rose-500">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        <div className="flex gap-2">
          <button onClick={() => setSlots((arr) => [...arr, { day_of_week: 'wed', start_time: '17:00', end_time: '19:00' }])} className="btn-ghost">
            <Plus className="h-4 w-4" /> Add slot
          </button>
          <button onClick={saveAvailability} className="btn-primary">
            Save availability
          </button>
        </div>
      </div>

      {/* Credentials */}
      <div className="card space-y-4 p-5">
        <h2 className="text-lg">Credentials</h2>
        <div className="space-y-2">
          {documents.map((d) => (
            <div key={d.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5">
              <span className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-slate-400" />
                {DOC_TYPE_LABEL[d.doc_type] ?? d.doc_type}
                <span className="text-slate-400">· {d.original_name}</span>
              </span>
              <VerifiedBadge verified={d.status === 'verified'} />
            </div>
          ))}
          {documents.length === 0 && <p className="text-sm text-slate-400">No documents uploaded yet.</p>}
        </div>
        <form onSubmit={uploadDoc} className="grid gap-2 sm:grid-cols-3">
          <select className="input" value={docType} onChange={(e) => setDocType(e.target.value)}>
            {DOC_TYPES.map((d) => (
              <option key={d} value={d}>
                {DOC_TYPE_LABEL[d]}
              </option>
            ))}
          </select>
          <input className="input" type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <button className="btn-primary" disabled={!file}>
            <Upload className="h-4 w-4" /> Upload
          </button>
        </form>
      </div>

      {/* Preset answers */}
      <div className="card space-y-4 p-5">
        <h2 className="text-lg">Saved chat answers</h2>
        <p className="text-sm text-slate-500">
          When a parent asks a preset question before confirming, you can reply instantly with these — no need to type or
          share contacts.
        </p>
        {meta?.presetQuestions.map((q) => (
          <Field key={q.key} label={q.text}>
            <input
              className="input"
              value={presetAnswers[q.key] ?? ''}
              onChange={(e) => setPresetAnswers((a) => ({ ...a, [q.key]: e.target.value }))}
            />
          </Field>
        ))}
        <button onClick={savePresets} className="btn-primary">
          Save answers
        </button>
      </div>
    </div>
  );
}
