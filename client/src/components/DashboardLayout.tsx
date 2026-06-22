import { NavLink, Outlet } from 'react-router-dom';
import { BadgeCheck, ClipboardList, CreditCard, LayoutDashboard, PlusCircle, Users, UserSquare } from 'lucide-react';
import { Navbar } from './Navbar';
import { useAuth } from '../auth/AuthContext';
import { Role } from '../api/types';

type Item = { to: string; label: string; icon: typeof LayoutDashboard; end?: boolean };

const NAV: Record<Role, Item[]> = {
  parent: [
    { to: '/parent', label: 'My requests', icon: ClipboardList, end: true },
    { to: '/parent/new', label: 'New request', icon: PlusCircle },
    { to: '/parent/jobs', label: 'My tutors', icon: UserSquare },
  ],
  tutor: [
    { to: '/tutor', label: 'Matches', icon: LayoutDashboard, end: true },
    { to: '/tutor/profile', label: 'My profile', icon: UserSquare },
    { to: '/tutor/jobs', label: 'My students', icon: Users },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/verify', label: 'Verify docs', icon: BadgeCheck },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/users', label: 'Users', icon: Users },
  ],
};

function linkClass({ isActive }: { isActive: boolean }) {
  return `flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
  }`;
}

export function DashboardLayout() {
  const { user } = useAuth();
  const items = user ? NAV[user.role] : [];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {/* Mobile nav */}
        <nav className="mb-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  isActive ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600'
                }`
              }
            >
              <it.icon className="h-3.5 w-3.5" />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex gap-6">
          <aside className="hidden w-52 shrink-0 md:block">
            <nav className="sticky top-20 space-y-1">
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} end={it.end} className={linkClass}>
                  <it.icon className="h-4 w-4" />
                  {it.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <main className="min-w-0 flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
