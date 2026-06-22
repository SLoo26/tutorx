import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Layers,
  MessagesSquare,
  Handshake,
  UserPlus,
  ShieldCheck,
  Sparkles,
  Wallet,
  ShieldQuestion,
  Lock,
  ArrowRight,
} from 'lucide-react';

type Step = {
  icon: typeof ClipboardList;
  title: string;
  body: string;
};

const parentSteps: Step[] = [
  {
    icon: ClipboardList,
    title: 'Post what you need',
    body: 'Tell us the level and subject, your region (East, West, North, South, Central or North-East), your budget, and the days and times that work. No full address required — just a postal code.',
  },
  {
    icon: Layers,
    title: 'See a priority-ordered deck',
    body: 'Browse a ranked deck of credential-verified tutors. Each card shows a match score plus the "why matched" reasons — subject and level fit, budget, region, availability, grade strength and experience.',
  },
  {
    icon: MessagesSquare,
    title: 'Like, skip and ask',
    body: 'Swipe through at your pace. Chat is limited to fixed greetings and preset questions like "When can you start?" or "What is your rate?" so nobody can swap contacts off-platform too early.',
  },
  {
    icon: Handshake,
    title: 'Want this tutor',
    body: 'When you press "Want this tutor", contact details are revealed for both sides and the engagement begins. Not the right fit after the first class? Request a different tutor any time.',
  },
];

const tutorSteps: Step[] = [
  {
    icon: UserPlus,
    title: 'Build your profile',
    body: 'Sign up and list the subjects and grades you teach, your region, your rate and your weekly availability. The more accurate your profile, the better you rank in matches.',
  },
  {
    icon: ShieldCheck,
    title: 'Verify your credentials',
    body: 'Upload your O-Level, A-Level, Poly or University certificate or transcript. We verify it before you can be matched — this is what makes every tutor on TutorX credible.',
  },
  {
    icon: Sparkles,
    title: 'Appear in matches',
    body: 'Once verified for a subject, you enter the priority-ordered deck automatically. Matching is scored, never random, so a strong, well-matched profile surfaces to the right parents.',
  },
  {
    icon: Wallet,
    title: 'Get hired',
    body: 'When a parent confirms you, the engagement starts. TutorX takes 30% of your first month for that subject only — no recurring cut, ever. After month one, every dollar is yours.',
  },
];

function StepCard({ step, index }: { step: Step; index: number }) {
  const Icon = step.icon;
  return (
    <div className="card flex gap-4 p-5">
      <div className="flex flex-col items-center gap-3">
        <span className="badge bg-brand-50 text-brand-700">Step {index + 1}</span>
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{step.body}</p>
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <header className="max-w-2xl">
        <span className="badge bg-emerald-50 text-emerald-700">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Every tutor credential-verified
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl">How TutorX works</h1>
        <p className="mt-3 text-slate-500">
          TutorX automatically matches Singapore parents with verified tutors — priority-ordered, never
          random. No manual Telegram channels, no 50% agency cut. Here is the flow for both sides.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        {/* Parents / learners */}
        <section aria-labelledby="parents-heading">
          <div className="flex items-center gap-2">
            <h2 id="parents-heading" className="text-xl font-bold text-slate-900">
              For parents &amp; learners
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Find the right verified tutor in four steps.</p>
          <div className="mt-5 space-y-4">
            {parentSteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </section>

        {/* Tutors */}
        <section aria-labelledby="tutors-heading">
          <div className="flex items-center gap-2">
            <h2 id="tutors-heading" className="text-xl font-bold text-slate-900">
              For tutors
            </h2>
          </div>
          <p className="mt-1 text-sm text-slate-500">Get verified, get matched, get hired.</p>
          <div className="mt-5 space-y-4">
            {tutorSteps.map((step, i) => (
              <StepCard key={step.title} step={step} index={i} />
            ))}
          </div>
        </section>
      </div>

      {/* Trust & fairness strip */}
      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Lock className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">Contacts stay private</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Phone, email and exact address stay hidden until you confirm a tutor. We store only a postal
            code, never a full address, and we never collect NRIC. PDPA-aware by design.
          </p>
        </div>
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <ShieldQuestion className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">Guided pre-match chat</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Before you confirm, chat is limited to fixed greetings and preset questions — so neither side
            can move the deal off-platform before there is a real match.
          </p>
        </div>
        <div className="card p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
            <Wallet className="h-5 w-5" aria-hidden="true" />
          </span>
          <h3 className="mt-3 text-base font-semibold text-slate-900">Fair if plans change</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-500">
            Cancel the very first class and the tutor is still paid 70% of it while TutorX keeps 30%. Not
            satisfied? Request a different tutor at no extra fee.
          </p>
        </div>
      </section>

      {/* Call to action */}
      <section className="card mt-12 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Ready to get matched?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Join in minutes — verified tutors and parents both start here. See exactly what TutorX costs
            before you commit.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link to="/register" className="btn-primary">
            Get started
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link to="/rates" className="btn-ghost">
            View rates &amp; fees
          </Link>
        </div>
      </section>
    </div>
  );
}
