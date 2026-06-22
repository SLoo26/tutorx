import { Navigate, Route, Routes } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { DashboardLayout } from './components/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Rates from './pages/Rates';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';

import ParentHome from './pages/parent/ParentHome';
import NewRequest from './pages/parent/NewRequest';
import RequestDeck from './pages/parent/RequestDeck';
import ParentJobs from './pages/parent/ParentJobs';

import TutorMatches from './pages/tutor/TutorMatches';
import TutorProfile from './pages/tutor/TutorProfile';
import TutorJobs from './pages/tutor/TutorJobs';

import AdminOverview from './pages/admin/AdminOverview';
import AdminVerify from './pages/admin/AdminVerify';
import AdminPayments from './pages/admin/AdminPayments';
import AdminUsers from './pages/admin/AdminUsers';

import Chat from './pages/Chat';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/rates" element={<Rates />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute roles={['parent']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/parent" element={<ParentHome />} />
          <Route path="/parent/new" element={<NewRequest />} />
          <Route path="/parent/requests/:id" element={<RequestDeck />} />
          <Route path="/parent/jobs" element={<ParentJobs />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['tutor']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/tutor" element={<TutorMatches />} />
          <Route path="/tutor/profile" element={<TutorProfile />} />
          <Route path="/tutor/jobs" element={<TutorJobs />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/verify" element={<AdminVerify />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['parent', 'tutor']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/chat/:matchId" element={<Chat />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
