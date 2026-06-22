import { Link, NavLink, useNavigate } from 'react-router-dom';
import { GraduationCap, LogOut } from 'lucide-react';
import { homePathForRole, useAuth } from '../auth/AuthContext';

const publicLinks = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/rates', label: 'Rates' },
  { to: '/about', label: 'About' },
];

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </span>
          Tutor<span className="text-brand-600">X</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          {publicLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) => (isActive ? 'text-brand-700' : 'hover:text-slate-900')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link to={homePathForRole(user.role)} className="btn-ghost">
                Dashboard
              </Link>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="btn-ghost"
                title="Log out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">
                Log in
              </Link>
              <Link to="/register" className="btn-primary">
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
