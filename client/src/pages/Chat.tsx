import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Lock, Mail, Phone, Send, ShieldCheck } from 'lucide-react';
import { api, ApiError } from '../api/client';
import { ChatMessage, Meta, TutorCard } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { useMeta } from '../hooks/useMeta';
import { Avatar, Pill, Spinner } from '../components/ui';

interface MatchDetail {
  match: {
    match_id: number;
    status: string;
    chat_enabled: boolean;
    your_side: 'parent' | 'tutor';
  };
  tutor: TutorCard | null;
  job: any | null;
  contacts: { parent: any; tutor: any } | null;
}

export default function Chat() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const meta = useMeta();
  const [detail, setDetail] = useState<MatchDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [presetAnswers, setPresetAnswers] = useState<Record<string, string>>({});
  const [free, setFree] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await api.get<{ messages: ChatMessage[] }>(`/matches/${matchId}/messages`);
    setMessages(res.messages);
  }

  useEffect(() => {
    (async () => {
      try {
        const d = await api.get<MatchDetail>(`/matches/${matchId}`);
        setDetail(d);
        await loadMessages();
        if (user?.role === 'tutor') {
          const prof = await api.get<{ presetAnswers: Record<string, string> }>('/tutor/profile');
          setPresetAnswers(prof.presetAnswers || {});
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [matchId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(payload: { message_type: string; body: string; question_key?: string }) {
    setNote('');
    try {
      const res = await api.post<{ redacted?: boolean }>(`/matches/${matchId}/messages`, payload);
      if (res.redacted) setNote('Contact details were hidden to keep things on-platform.');
      setFree('');
      await loadMessages();
    } catch (err) {
      setNote(err instanceof ApiError ? err.message : 'Could not send');
    }
  }

  if (loading) return <Spinner label="Opening chat…" />;
  if (!detail) return <p className="text-slate-500">Conversation not found.</p>;

  const confirmed = Boolean(detail.job) || detail.match.status === 'confirmed';
  const other = detail.match.your_side === 'parent' ? detail.contacts?.tutor : detail.contacts?.parent;
  const title = detail.tutor?.display_name ?? 'Conversation';
  const presetQuestions: Meta['presetQuestions'] = meta?.presetQuestions ?? [];
  const greetings = meta?.greetings ?? [];

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-2xl flex-col">
      {/* Header */}
      <div className="card flex items-center gap-3 rounded-b-none p-4">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-slate-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
        {detail.tutor && <Avatar initials={detail.tutor.initials} seed={title} size="sm" />}
        <div className="flex-1">
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-slate-500">
            {confirmed ? 'Confirmed — full chat unlocked' : 'Guided chat · details protected'}
          </p>
        </div>
        {confirmed ? (
          <Pill tone="emerald">
            <ShieldCheck className="h-3.5 w-3.5" /> Unlocked
          </Pill>
        ) : (
          <Pill tone="amber">
            <Lock className="h-3.5 w-3.5" /> Protected
          </Pill>
        )}
      </div>

      {/* Revealed contacts banner */}
      {confirmed && other && (
        <div className="border-x border-slate-100 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">
          <span className="inline-flex flex-wrap items-center gap-3">
            <span className="font-semibold">{other.name}</span>
            <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {other.phone || '—'}</span>
            <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {other.email}</span>
          </span>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto border-x border-slate-100 bg-slate-50 p-4">
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">
            Say hi to break the ice. {confirmed ? '' : 'Until you confirm, only greetings and preset questions can be sent.'}
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  mine ? 'rounded-br-sm bg-brand-600 text-white' : 'rounded-bl-sm bg-white text-slate-700 shadow-sm'
                }`}
              >
                {m.body}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="card space-y-2 rounded-t-none p-3">
        {note && <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-700">{note}</p>}

        {!detail.match.chat_enabled ? (
          <p className="px-1 py-2 text-center text-sm text-slate-400">
            Chat opens once there's mutual interest.
          </p>
        ) : confirmed ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (free.trim()) send({ message_type: 'free', body: free.trim() });
            }}
            className="flex gap-2"
          >
            <input className="input" placeholder="Type a message…" value={free} onChange={(e) => setFree(e.target.value)} />
            <button className="btn-primary px-4">
              <Send className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {greetings.map((g) => (
                <button key={g} onClick={() => send({ message_type: 'greeting', body: g })} className="btn-ghost px-3 py-1.5 text-xs">
                  {g}
                </button>
              ))}
            </div>
            {detail.match.your_side === 'parent' ? (
              <div className="flex flex-wrap gap-1.5">
                {presetQuestions.map((q) => (
                  <button
                    key={q.key}
                    onClick={() => send({ message_type: 'preset_question', body: q.text, question_key: q.key })}
                    className="rounded-full bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100"
                  >
                    {q.text}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {presetQuestions.map((q) => (
                  <button
                    key={q.key}
                    onClick={() =>
                      send({ message_type: 'preset_answer', body: presetAnswers[q.key] || 'Happy to discuss this once we confirm.' })
                    }
                    className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    title={presetAnswers[q.key]}
                  >
                    Reply: {q.text}
                  </button>
                ))}
              </div>
            )}
            <p className="px-1 text-[11px] text-slate-400">
              To protect both sides, contact details are hidden and messages are limited until the parent confirms.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
