import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Role } from '../types';
import RoleSwitcher from './RoleSwitcher';

const Header: React.FC = () => {
  const { user, logout, openAuthModal } = useAuth();

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
    }`;
    
  const getUserDisplayName = () => {
    if (!user) return '';
    try {
      switch (user.current_role) {
        case Role.CLIENT: {
          const name = (user as any).data?.first_name || (user as any).data?.last_name;
          return name || 'User';
        }
        case Role.ORGANIZER: {
          const name = (user as any).data?.organizer_name || (user as any).data?.contact_person;
          return name || 'Organizer';
        }
        case Role.SUPER_ADMIN: {
          const name = (user as any).data?.first_name || 'Admin';
          return name;
        }
        default:
          return 'User';
      }
    } catch {
      return 'User';
    }
  }

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-40 border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center gap-2" aria-label="Go to home">
            <span className="text-2xl font-bold tracking-wider text-text-primary uppercase">INT-TICKET</span>
          </NavLink>

          <nav className="hidden md:flex items-center space-x-8">
            <NavLink to="/" className={navLinkClass} aria-label="Home">HOME</NavLink>
            <NavLink to="/organizers" className={navLinkClass} aria-label="For organizers">ORGANIZER</NavLink>
            {user?.current_role === Role.ORGANIZER && (
              <NavLink to="/create-event" className={navLinkClass} aria-label="Create event">Create Event</NavLink>
            )}
             {user && (
              <NavLink to="/dashboard" className={navLinkClass} aria-label="Dashboard">Dashboard</NavLink>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-right">
                    <span className="text-sm text-text-secondary">
                        Welcome, <span className="font-semibold text-text-primary">{getUserDisplayName()}</span>
                    </span>
                </div>
                <RoleSwitcher />
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-semibold text-text-primary bg-surface border border-border rounded-md hover:bg-border transition-colors"
                  aria-label="Log out"
                >
                  Log Out
                </button>
              </div>
            ) : (
               <div className="flex items-center gap-2">
                 <button
                   onClick={() => openAuthModal('login')}
                   className="px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface rounded-md transition-colors"
                   aria-label="Open login"
                 >
                   Log In
                 </button>
                 <button
                   onClick={() => openAuthModal('register')}
                   className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary rounded-md hover:opacity-90 transition-opacity"
                   aria-label="Buy tickets"
                 >
                   Buy Tickets
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;