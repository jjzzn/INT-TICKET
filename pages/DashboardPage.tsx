import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import OrganizerDashboard from './OrganizerDashboard';
import ClientDashboard from './ClientDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.current_role) {
      case Role.CLIENT:
        return <ClientDashboard />;
      case Role.ORGANIZER:
        return <OrganizerDashboard />;
      case Role.SUPER_ADMIN:
        return <AdminDashboard />;
      default:
        return <div className="text-center p-10">Loading dashboard...</div>;
    }
  };

  if (!user) {
    return <div className="text-center p-10">Please log in to view your dashboard.</div>;
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-text-primary">
        {user.current_role} Dashboard
      </h1>
      {renderDashboard()}
    </div>
  );
};

export default DashboardPage;