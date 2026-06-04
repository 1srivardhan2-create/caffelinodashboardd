import { createBrowserRouter, Navigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import PartnerOnboarding from './pages/PartnerOnboarding';
import VerificationPending from './pages/VerificationPending';
import DashboardLayout from './components/DashboardLayout';
import DashboardHome from './pages/dashboard/Home';
import Earnings from './pages/dashboard/Earnings';
import MenuManagement from './pages/dashboard/MenuManagement';
import Profile from './pages/dashboard/Profile';
import Albums from './pages/dashboard/Albums';
import AdminApproval from './pages/dashboard/AdminApproval';
import UserHome from './pages/user/UserHome';
import CafeDetails from './pages/user/CafeDetails';

// Events
import EventsLogin from './pages/events/EventsLogin';
import EventsLayout from './components/events/EventsLayout';
import EventsDashboard from './pages/events/EventsDashboard';
import CreateEvent from './pages/events/CreateEvent';
import ManageEvents from './pages/events/ManageEvents';
import EventsEarnings from './pages/events/EventsEarnings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, cafe, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!cafe || cafe.status !== 'approved') {
    return <Navigate to="/verification-pending" replace />;
  }

  return <>{children}</>;
}

// ✅ Smart root redirect: authenticated → dashboard, else → login
function SmartRedirect() {
  const { isAuthenticated, cafe, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isAuthenticated && cafe && cafe.status === 'approved') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SmartRedirect />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/partner-onboarding',
    element: <PartnerOnboarding />
  },
  {
    path: '/verification-pending',
    element: <VerificationPending />
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <DashboardHome />
        </DashboardLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard/earnings',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Earnings />
        </DashboardLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard/menu',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <MenuManagement />
        </DashboardLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard/profile',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard/albums',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Albums />
        </DashboardLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/dashboard/admin',
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <AdminApproval />
        </DashboardLayout>
      </ProtectedRoute>
    )
  },
  {
    path: '/app',
    element: <UserHome />
  },
  {
    path: '/app/cafe/:id',
    element: <CafeDetails />
  },
  {
    path: '/events/login',
    element: <EventsLogin />
  },
  {
    path: '/events/dashboard',
    element: (
      <EventsLayout>
        <EventsDashboard />
      </EventsLayout>
    )
  },
  {
    path: '/events/earnings',
    element: (
      <EventsLayout>
        <EventsEarnings />
      </EventsLayout>
    )
  },
  {
    path: '/events/create',
    element: (
      <EventsLayout>
        <CreateEvent />
      </EventsLayout>
    )
  },
  {
    path: '/events/manage',
    element: (
      <EventsLayout>
        <ManageEvents />
      </EventsLayout>
    )
  }
]);