import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row">
          <div>
            <p className="text-lg font-extrabold">
              Tutor<span className="text-brand-600">X</span>
            </p>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Singapore's credential-verified tutor matching marketplace. No middleman, lower fees.
            </p>
          </div>
          <div className="flex gap-12 text-sm">
            <div className="space-y-2">
              <p className="font-semibold text-slate-700">Product</p>
              <Link to="/how-it-works" className="block text-slate-500 hover:text-slate-900">How it works</Link>
              <Link to="/rates" className="block text-slate-500 hover:text-slate-900">Rates</Link>
              <Link to="/register" className="block text-slate-500 hover:text-slate-900">Become a tutor</Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-slate-700">Legal</p>
              <Link to="/terms" className="block text-slate-500 hover:text-slate-900">Terms</Link>
              <Link to="/privacy" className="block text-slate-500 hover:text-slate-900">Privacy (PDPA)</Link>
              <Link to="/about" className="block text-slate-500 hover:text-slate-900">About</Link>
            </div>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-400">
          © {new Date().getFullYear()} TutorX. A startup project. This is not legal advice — final terms to be
          reviewed before launch.
        </p>
      </div>
    </footer>
  );
}
