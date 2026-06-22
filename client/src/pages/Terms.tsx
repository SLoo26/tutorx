import { Link } from 'react-router-dom'
import {
  FileText,
  Users,
  ShieldCheck,
  BadgeCheck,
  Wallet,
  RefreshCcw,
  MessageSquareOff,
  HeartHandshake,
  Scale,
  RotateCw,
} from 'lucide-react'

export default function Terms() {
  const sections = [
    {
      icon: FileText,
      title: '1. Overview & parties',
      body: (
        <>
          <p>
            These Terms govern your use of TutorX, a Singapore credential-verified tutor
            auto-matching marketplace operated as a startup product ("TutorX", "we", "us").
            They form an agreement between TutorX and you, whether you use the platform as a
            parent / student ("Parent") or as a tutor ("Tutor").
          </p>
          <p>
            TutorX is a <strong>matching platform only</strong>. We connect Parents and Tutors
            and provide tools to manage that match. We are <strong>not the employer</strong> of
            any Tutor, are not a party to the tuition arrangement, and do not supervise lessons.
            The teaching relationship is directly between the Parent and the Tutor.
          </p>
        </>
      ),
    },
    {
      icon: Users,
      title: '2. Accounts & eligibility',
      body: (
        <>
          <p>
            To use TutorX you must register an account and provide accurate information. You are
            responsible for activity under your account and for keeping your login secure.
          </p>
          <p>
            We collect only what we need to match you. For Parents, that includes a{' '}
            <strong>postal code</strong> (never a full address) and tuition preferences. We do
            not collect NRIC. You must be legally able to enter into this agreement, or have a
            parent or guardian do so on your behalf.
          </p>
        </>
      ),
    },
    {
      icon: ShieldCheck,
      title: '3. Tutor credential verification',
      body: (
        <>
          <p>
            Tutors <strong>must upload and have a credential verified</strong> (O-Level, A-Level,
            Poly, or University certificate or transcript) before they can be matched to or teach
            a given subject. Verification is per subject and is the core of TutorX's credibility.
          </p>
          <p>
            Submitting forged, altered, or misleading credentials is{' '}
            <strong>misrepresentation</strong> and will result in removal from the platform and
            cancellation of any active matches, without refund of fees owed to TutorX.
          </p>
        </>
      ),
    },
    {
      icon: BadgeCheck,
      title: '4. Matching & confirmation',
      body: (
        <>
          <p>
            Matching is automatic and <strong>priority-ordered</strong>, not random. Tutors are
            scored on subject and level fit, budget, Singapore region (East / West / North /
            South / Central / North-East), availability by day and time, grade strength, and
            experience.
          </p>
          <p>
            A job is <strong>confirmed</strong> only when the Parent presses{' '}
            <strong>"Want this tutor"</strong>. At that moment, and not before, the two parties'
            contact details are revealed to each other so lessons can be arranged.
          </p>
        </>
      ),
    },
    {
      icon: Wallet,
      title: '5. Fees',
      body: (
        <>
          <p>
            TutorX keeps <strong>30% of the first month only</strong>, charged per subject. The
            Tutor keeps the remaining 70% of that first month.
          </p>
          <p>
            After the first month, TutorX takes <strong>0%</strong> — there is no recurring cut
            and no middleman. See our{' '}
            <Link to="/rates" className="text-brand-600 underline underline-offset-2">
              rates page
            </Link>{' '}
            for a full breakdown.
          </p>
        </>
      ),
    },
    {
      icon: RefreshCcw,
      title: '6. Cancellation & refunds',
      body: (
        <>
          <p>
            If the Parent cancels the <strong>very first class</strong>, the Tutor is still paid{' '}
            <strong>70% of that first class</strong> and TutorX keeps the remaining 30%. This
            protects Tutors for time set aside and travel.
          </p>
          <p>
            A Parent who is not satisfied may <strong>request a replacement tutor</strong> through
            the platform, and we will re-run matching to find a better fit.
          </p>
        </>
      ),
    },
    {
      icon: MessageSquareOff,
      title: '7. Off-platform contact',
      body: (
        <>
          <p>
            Sharing or soliciting contact details before a match is confirmed — in order to take
            the arrangement off-platform and avoid fees — is <strong>prohibited</strong> and may
            result in suspension.
          </p>
          <p>
            To support this, pre-confirmation chat is restricted to fixed greetings and preset
            questions (for example "When can you start?", "What is your rate?", "Can you teach
            both subjects?"). Free-text contact exchange is only available after confirmation.
          </p>
        </>
      ),
    },
    {
      icon: HeartHandshake,
      title: '8. Conduct & safety',
      body: (
        <>
          <p>
            All users must behave respectfully, lawfully, and honestly. Harassment,
            discrimination, fraud, and any conduct that endangers a student are not tolerated.
          </p>
          <p>
            Tutors are responsible for delivering lessons professionally and for complying with
            applicable Singapore laws. We may suspend or remove any account that breaches these
            Terms or puts others at risk.
          </p>
        </>
      ),
    },
    {
      icon: Scale,
      title: '9. Limitation of liability',
      body: (
        <>
          <p>
            TutorX provides the matching platform "as is". Because we are not a party to the
            tuition arrangement, we are not liable for the conduct, quality, results, or
            availability of any Tutor or Parent.
          </p>
          <p>
            To the fullest extent permitted by law, our total liability to you is limited to the
            fees you have paid to TutorX in connection with the relevant match.
          </p>
        </>
      ),
    },
    {
      icon: RotateCw,
      title: '10. Changes to terms',
      body: (
        <>
          <p>
            We may update these Terms as the product evolves. If we make material changes, we will
            update the "last updated" date below and, where appropriate, notify you in-app.
          </p>
          <p>
            Continuing to use TutorX after an update means you accept the revised Terms. If you do
            not agree, please stop using the platform and{' '}
            <Link to="/about" className="text-brand-600 underline underline-offset-2">
              reach out to us
            </Link>
            .
          </p>
        </>
      ),
    },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <header className="mb-10">
        <h1 className="text-3xl sm:text-4xl">Terms &amp; Conditions</h1>
        <p className="mt-3 text-slate-500">
          The plain-language rules for using TutorX — how matching, fees, verification, and
          cancellations work. Please read these before creating an account or accepting a match.
        </p>
        <p className="mt-4 text-sm italic text-slate-400">
          Note: TutorX is an early-stage startup and this is a working draft. It is provided for
          information only and is not legal advice.
        </p>
      </header>

      <div className="space-y-5">
        {sections.map((section) => {
          const Icon = section.icon
          return (
            <section key={section.title} className="card rounded-2xl p-6 sm:p-7">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="text-lg font-semibold text-slate-800 sm:text-xl">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                {section.body}
              </div>
            </section>
          )
        })}
      </div>

      <footer className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center">
        <p className="text-sm text-slate-400">Last updated: 23 June 2026</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/privacy" className="btn-ghost">
            Privacy Policy
          </Link>
          <Link to="/register" className="btn-primary">
            Create an account
          </Link>
        </div>
      </footer>
    </div>
  )
}
