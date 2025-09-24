
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import EventPage from './pages/EventPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import DashboardPage from './pages/DashboardPage';
import { useAuth } from './hooks/useAuth';
import { Role } from './types';
import AuthModal from './components/AuthModal';
import ForOrganizersPage from './pages/ForOrganizersPage';
import BuyTicketPage from './pages/BuyTicketPage';
import PerformanceDashboard from './components/PerformanceDashboard';
import { logReactError } from './lib/errorHandler';
import { useWebVitals } from './hooks/usePerformance';

const OrganizerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  if (user.role !== Role.ORGANIZER) {
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/" />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  useWebVitals(); // Initialize web vitals monitoring

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <AuthModal />
      <PerformanceDashboard />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/organizers" element={<ForOrganizersPage />} />
          <Route path="/event/:id" element={<EventPage />} />
          <Route 
            path="/event/:id/buy/:tierId"
            element={
              <ProtectedRoute>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <BuyTicketPage />
                </div>
              </ProtectedRoute>
            }
          />
          <Route 
            path="/create-event" 
            element={
              <OrganizerRoute>
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <CreateEventPage />
                 </div>
              </OrganizerRoute>
            } 
          />
          <Route 
            path="/edit-event/:id" 
            element={
              <OrganizerRoute>
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <EditEventPage />
                 </div>
              </OrganizerRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <DashboardPage />
                 </div>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary onError={logReactError}>
      <AuthProvider>
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;