import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/auth/LoginPage';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { SyllabusEditPage } from './pages/SyllabusEditPage';
import { PeriodsPage } from './pages/PeriodsPage';
import { CareersPage } from './pages/CareersPage';
import { CoordinatorsPage } from './pages/CoordinatorsPage';
import { ProfessorsPage } from './pages/ProfessorsPage';
import { SyllabiPage } from './pages/SyllabiPage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">CARGANDO...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const DefaultRedirect = () => {
  const { user } = useAuth();

  // Admin (Coordinator without career) goes to periods
  if (user?.role === 'COORDINATOR' && !user?.career) {
    return <Navigate to="/periods" replace />;
  }

  // Everyone else goes to dashboard
  return <Navigate to="/dashboard" replace />;
};

const DashboardRoute = () => {
  const { user } = useAuth();

  // Admin cannot access dashboard - redirect to periods
  if (user?.role === 'COORDINATOR' && !user?.career) {
    return <Navigate to="/periods" replace />;
  }

  // Everyone else can access dashboard
  return <Dashboard />;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  // Only admin (Coordinator without career) can access admin routes
  if (user?.role === 'COORDINATOR' && !user?.career) {
    return <>{children}</>;
  }

  // Everyone else redirects to dashboard
  return <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'border-3 border-black shadow-neo font-bold rounded-none',
            style: {
              background: '#fff',
              color: '#000',
            },
            success: {
              iconTheme: {
                primary: '#4ade80',
                secondary: '#000',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<DashboardRoute />} />
            <Route path="syllabi" element={<SyllabiPage />} />
            <Route path="periods" element={<AdminRoute><PeriodsPage /></AdminRoute>} />
            <Route path="careers" element={<AdminRoute><CareersPage /></AdminRoute>} />
            <Route path="coordinators" element={<AdminRoute><CoordinatorsPage /></AdminRoute>} />
            <Route path="professors" element={<AdminRoute><ProfessorsPage /></AdminRoute>} />
            <Route path="syllabus/:id/edit" element={<SyllabusEditPage />} />
            <Route index element={<DefaultRedirect />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
