import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  BadgeCheck,
  Wallet,
  Lock,
  Sparkles,
  Users,
  GraduationCap,
  ArrowRight,
} from 'lucide-react'

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <header className="max-w-2xl">
        <span className="badge">Our story</span>
        <h1 className="mt-4 text-3xl sm:text-4xl">About TutorX</h1>
        <p className="mt-4 text-slate-500">
          TutorX was built by a Singapore home tutor who got tired of how the
          old model worked. It is a credential-verified, auto-matching
          marketplace that puts credibility, fairness, and privacy first.
        </p>
      </header>

      {/* Founder's story */}
      <section className="mt-12 space-y-5 text-slate-600 leading-relaxed">
        <h2 className="text-xl font-semibold text-slate-900">
          Why I started TutorX
        </h2>
        <p>
          For years I taught one-to-one in homes across Singapore. To get
          students, I went where every tutor goes: agencies and a maze of
          manual Telegram job channels. The same assignment would be blasted to
          hundreds of people, first-come-first-served, with no real check on
          who could actually teach it.
        </p>
        <p>
          The part that stung most was the cut. Most agencies take{' '}
          <span className="font-medium text-slate-900">
            around 50% of your first month
          </span>
          , simply for forwarding a message and acting as a middleman. Parents
          paid more, tutors earned less, and nobody could tell whether the
          person showing up at the door had ever sat the exam they were hired
          to teach.
        </p>
        <p>
          So I built the platform I wished existed. TutorX automates the match,
          verifies the credential before anyone teaches, masks contact details
          until both sides are ready, and charges a single, fair fee with no
          recurring cut. No middleman. No mystery.
        </p>
      </section>

      {/* What we fixed */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">
          What TutorX fixes
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="card">
            <div className="flex items-start gap-3">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  Automated priority matching
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Not random and not first-come-first-served. Matches are
                  scored and ordered on subject and level fit, budget, region,
                  availability, grade strength, and experience.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-3">
              <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  Mandatory credential verification
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Every tutor uploads and verifies a certificate or transcript
                  (O-Level, A-Level, Poly, or University) before they can be
                  matched or teach that subject.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-3">
              <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  Privacy-first contact masking
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Phone, email, and exact address stay hidden until a parent
                  confirms a tutor. We store only the postal code, never the
                  full address, and never collect NRIC. PDPA-aware by design.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start gap-3">
              <Wallet className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  A fair, flat fee
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  TutorX takes 30% of the first month only, per subject. No
                  recurring cut, no middleman. Cheaper than the ~50% agencies
                  charge, and fully automated.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our principles */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-900">Our principles</h2>
        <p className="mt-2 text-slate-500">
          Four ideas guide every decision we make.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <ShieldCheck className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Credibility</h3>
            <p className="mt-1 text-sm text-slate-500">
              No teaching without a verified credential. Trust is earned with
              proof, not promises.
            </p>
          </div>

          <div className="card">
            <Wallet className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Fairness</h3>
            <p className="mt-1 text-sm text-slate-500">
              One transparent fee of 30% of the first month. Tutors keep the
              rest, every month after.
            </p>
          </div>

          <div className="card">
            <Lock className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Privacy</h3>
            <p className="mt-1 text-sm text-slate-500">
              Contact details stay masked until a match is confirmed. Postal
              code only, no NRIC, ever.
            </p>
          </div>

          <div className="card">
            <Sparkles className="h-6 w-6 text-brand-600" />
            <h3 className="mt-3 font-semibold text-slate-900">Simplicity</h3>
            <p className="mt-1 text-sm text-slate-500">
              No Telegram chaos and no middleman. Just a clean, automated match
              that gets it right.
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="mt-14">
        <h2 className="text-xl font-semibold text-slate-900">Who it&apos;s for</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="card">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-brand-600" />
              <h3 className="font-semibold text-slate-900">
                Parents &amp; learners
              </h3>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Get matched to verified tutors ranked by genuine fit, not by who
              replied first. Your details stay private until you say
              &ldquo;Want this tutor.&rdquo; Not happy with your first class?
              Request a different tutor, simply.
            </p>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-brand-600" />
              <h3 className="font-semibold text-slate-900">Tutors</h3>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Verify your credential once, then get matched to assignments that
              actually fit your subjects, level, and region. Pay 30% of the
              first month per subject, and keep everything after that.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="card mt-14 bg-brand-50/60 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">
          A better way to match, for everyone
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Whether you&apos;re looking for a tutor or looking to teach, TutorX
          makes the match credible, fair, and private.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/how-it-works" className="btn-ghost">
            See how it works
          </Link>
        </div>
      </section>
    </div>
  )
}
