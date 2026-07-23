import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/Toast';
import MainLayout from './components/layout/MainLayout';
import NotFoundPage from './pages/NotFoundPage';

const LoginPage = lazy(() => import(/* webpackChunkName: "login" */ './pages/LoginPage'));
const DashboardPage = lazy(() => import(/* webpackChunkName: "dashboard" */ './pages/DashboardPage'));
const LeadListPage = lazy(() => import(/* webpackChunkName: "leads" */ './pages/LeadListPage'));
const LeadDetailPage = lazy(() => import(/* webpackChunkName: "lead-detail" */ './pages/LeadDetailPage'));
const AddLeadPage = lazy(() => import(/* webpackChunkName: "add-lead" */ './pages/AddLeadPage'));
const FollowUpsPage = lazy(() => import(/* webpackChunkName: "follow-ups" */ './pages/FollowUpsPage'));
const FailedLeadsPage = lazy(() => import(/* webpackChunkName: "failed-leads" */ './pages/FailedLeadsPage'));
const ReEngagementPage = lazy(() => import(/* webpackChunkName: "re-engagement" */ './pages/ReEngagementPage'));
const CoursesPage = lazy(() => import(/* webpackChunkName: "courses" */ './pages/CoursesPage'));
const IntakesPage = lazy(() => import(/* webpackChunkName: "intakes" */ './pages/IntakesPage'));
const UsersPage = lazy(() => import(/* webpackChunkName: "users" */ './pages/UsersPage'));
const ReportsPage = lazy(() => import(/* webpackChunkName: "reports" */ './pages/ReportsPage'));
const SettingsPage = lazy(() => import(/* webpackChunkName: "settings" */ './pages/SettingsPage'));
const ApplyPage = lazy(() => import(/* webpackChunkName: "apply" */ './pages/ApplyPage'));

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0f172a',
      }}>
        <div style={{ color: '#fff', textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            margin: '0 auto 16px',
            border: '3px solid rgba(255,255,255,0.1)',
            borderLeftColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function RouteSpinner() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60vh',
      color: '#6b7280',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          border: '3px solid rgba(0,0,0,0.1)',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          borderLeftColor: '#4f46e5',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 12px',
        }} />
        <p style={{ fontSize: '0.875rem' }}>Loading...</p>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <Suspense fallback={<RouteSpinner />}>
      <Routes>
        <Route
          path="/login"
          element={loading ? null : (isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />)}
        />
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadListPage />} />
          <Route path="/leads/new" element={<AddLeadPage />} />
          <Route path="/leads/failed" element={<FailedLeadsPage />} />
          <Route path="/leads/re-engage" element={<ReEngagementPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/follow-ups" element={<FollowUpsPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/intakes" element={<IntakesPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
        <Route path="/apply" element={<ApplyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <ToastContainer />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
