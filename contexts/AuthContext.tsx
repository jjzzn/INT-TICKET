import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AuthUser, Role, Customer, Organizer, SuperAdmin, UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

type RegisterData = (Omit<Customer, 'id' | 'created_at' | 'supabase_user_id'> & { password?: string }) | (Omit<Organizer, 'id'| 'created_at'|'supabase_user_id'|'maps_link'> & { password?: string });

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password?: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  register: (role: Role, data: any) => Promise<{ error: AuthError | null; needsConfirmation?: boolean }>;
  switchRole: (newRole: Role) => Promise<void>;
  addRole: (role: Role, data: any) => Promise<{ error: Error | null }>;
  isAuthModalOpen: boolean;
  openAuthModal: (defaultTab?: 'login' | 'register', defaultRole?: Role) => void;
  closeAuthModal: () => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  authModalRole: Role;
  setAuthModalRole: (role: Role) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authModalRole, setAuthModalRole] = useState<Role>(Role.CLIENT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase not configured, using mock authentication');
        // Set a mock user with both roles for demo purposes
        const mockCustomer: Customer = {
          id: 1,
          first_name: 'Demo',
          last_name: 'User',
          email: 'demo@user.com',
          phone: '+1234567890',
          prefix: 'Mr.',
          gender: 'Male',
          birthday: '1990-01-01',
          id_number: '1234567890123',
          country_code: 'TH',
          created_at: new Date().toISOString(),
          supabase_user_id: 'mock-user-id'
        };
        const mockOrganizer: Organizer = {
          id: 1,
          organizer_name: 'Demo Organizer',
          email: 'demo@user.com',
          phone: '+1234567890',
          business_type: 'Event Management',
          company_name: 'Demo Events Co.',
          tax_id: '123456789',
          billing_address: '123 Demo Street',
          contact_person: 'Demo Person',
          invoice_email: 'invoice@demo.com',
          created_at: new Date().toISOString(),
          supabase_user_id: 'mock-user-id',
          maps_link: null,
          additional_notes: null
        };
        
        const savedRole = localStorage.getItem('preferred_role') as Role || Role.CLIENT;
        setUser({
          current_role: savedRole,
          profile: {
            customer: mockCustomer,
            organizer: mockOrganizer,
            available_roles: [Role.CLIENT, Role.ORGANIZER]
          },
          data: savedRole === Role.CLIENT ? mockCustomer : mockOrganizer
        });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    getInitialSession();
    
    // Only set up auth listener if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session && session.user) {
            await fetchUserProfile(session.user);
          } else {
            setUser(null);
          }
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    // Special case for Super Admin (configured via env)
    const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL as string | undefined;
    if (!SUPER_ADMIN_EMAIL) {
      console.warn('[Auth] VITE_SUPER_ADMIN_EMAIL is not set. Super Admin fallback is disabled.');
    }
    if (SUPER_ADMIN_EMAIL && supabaseUser.email === SUPER_ADMIN_EMAIL) {
      const adminData: SuperAdmin = {
        id: 0,
        first_name: 'Admin',
        last_name: 'User',
        email: SUPER_ADMIN_EMAIL
      };
      setUser({
        current_role: Role.SUPER_ADMIN,
        profile: {
          super_admin: adminData,
          available_roles: [Role.SUPER_ADMIN]
        },
        data: adminData
      });
      return;
    }

    // Fetch all available profiles for this user
    const { data: customerData } = await supabase.from('customers').select('*').eq('supabase_user_id', supabaseUser.id).single();
    const { data: organizerData } = await supabase.from('organizers').select('*').eq('supabase_user_id', supabaseUser.id).single();
    
    const availableRoles: Role[] = [];
    const profile: UserProfile = { available_roles: [] };
    
    if (customerData) {
      availableRoles.push(Role.CLIENT);
      profile.customer = customerData;
    }
    if (organizerData) {
      availableRoles.push(Role.ORGANIZER);
      profile.organizer = organizerData;
    }
    
    profile.available_roles = availableRoles;
    
    if (availableRoles.length === 0) {

      // If no profile found, try to create from metadata
      const { app_role, ...profileData } = supabaseUser.user_metadata;
      if (app_role && (profileData.first_name || profileData.organizer_name)) {
        let insertError;

        if (app_role === Role.CLIENT) {
          const { error } = await supabase.from('customers').insert({
            first_name: profileData.first_name,
            last_name: profileData.last_name,
            email: supabaseUser.email,
            supabase_user_id: supabaseUser.id,
            prefix: profileData.prefix,
            country_code: profileData.country_code,
            gender: profileData.gender,
            birthday: profileData.birthday,
            id_number: profileData.id_number,
            phone: profileData.phone,
          });
          insertError = error;
          if (!error) {
            const { data: freshCustomerData } = await supabase.from('customers').select('*').eq('supabase_user_id', supabaseUser.id).single();
            if (freshCustomerData) {
              profile.customer = freshCustomerData;
              availableRoles.push(Role.CLIENT);
            }
          }
        } else if (app_role === Role.ORGANIZER) {
          const { error } = await supabase.from('organizers').insert({
            organizer_name: profileData.organizer_name,
            email: supabaseUser.email,
            supabase_user_id: supabaseUser.id,
            phone: profileData.phone,
            business_type: profileData.business_type,
            maps_link: profileData.maps_link || null,
            company_name: profileData.company_name,
            tax_id: profileData.tax_id,
            billing_address: profileData.billing_address,
            contact_person: profileData.contact_person,
            invoice_email: profileData.invoice_email,
            additional_notes: profileData.additional_notes || null
          });
          insertError = error;
          if (!error) {
            const { data: freshOrganizerData } = await supabase.from('organizers').select('*').eq('supabase_user_id', supabaseUser.id).single();
            if (freshOrganizerData) {
              profile.organizer = freshOrganizerData;
              availableRoles.push(Role.ORGANIZER);
            }
          }
        }

        if (insertError) {
          console.error("Error creating user profile from metadata:", insertError);
          setUser(null);
          return;
        }
        
        profile.available_roles = availableRoles;
      }
      
      if (availableRoles.length === 0) {
        console.warn("User is logged in but no profile found in customers or organizers table.");
        setUser(null);
        return;
      }
    }
    
    // Determine current role from localStorage or default to first available
    const savedRole = localStorage.getItem('preferred_role') as Role;
    const currentRole = savedRole && availableRoles.includes(savedRole) ? savedRole : availableRoles[0];
    
    const currentData = currentRole === Role.CLIENT ? profile.customer : 
                       currentRole === Role.ORGANIZER ? profile.organizer : 
                       profile.super_admin;
    
    if (currentData) {
      setUser({
        current_role: currentRole,
        profile,
        data: currentData
      });
    } else {
      setUser(null);
    }
  }, []);

  const openAuthModal = useCallback((defaultTab: 'login' | 'register' = 'login', defaultRole: Role = Role.CLIENT) => {
    setAuthModalTab(defaultTab);
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const login = useCallback(async (email: string, password?: string) => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      // Mock login - always successful in demo mode
      console.warn('Mock login - Supabase not configured');
      // User is already set in useEffect, just close modal
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password: password || '' });
    // The modal will close automatically via useEffect in AuthModal upon successful login.
    return { error };
  }, []);
  
  const register = useCallback(async (role: Role, data: any): Promise<{ error: AuthError | null, needsConfirmation?: boolean }> => {
    const { email, password, ...profileData } = data;
    
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      // Mock registration - always successful in demo mode
      console.warn('Mock registration - Supabase not configured');
      return { error: null, needsConfirmation: false };
    }
    
    // Pass profile data in options.data to be stored in auth.users.raw_user_meta_data
    // The profile will be created on the first login via fetchUserProfile
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...profileData,
          app_role: role, // Use a custom key to avoid conflicts
        }
      }
    });

    if (signUpError) {
      return { error: signUpError };
    }
    
    // The onAuthStateChange listener will handle profile creation.
    // We just inform the caller if confirmation is needed or not.
    const needsConfirmation = !!(signUpData.user && !signUpData.session);
    return { error: null, needsConfirmation };
  }, []);

  const logout = useCallback(async () => {
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      // Mock logout - just clear the user
      console.warn('Mock logout - Supabase not configured');
      setUser(null);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error.message);
      alert(`Logout failed: ${error.message}`);
    } else {
      // The onAuthStateChange listener will also set the user to null,
      // but we do it here to guarantee an immediate UI update.
      setUser(null);
    }
  }, []);
  
  const switchRole = useCallback(async (newRole: Role) => {
    if (!user || !user.profile.available_roles.includes(newRole)) {
      console.error('Cannot switch to unavailable role');
      return;
    }
    
    const newData = newRole === Role.CLIENT ? user.profile.customer : 
                   newRole === Role.ORGANIZER ? user.profile.organizer : 
                   user.profile.super_admin;
    
    if (newData) {
      setUser({
        current_role: newRole,
        profile: user.profile,
        data: newData
      });
      localStorage.setItem('preferred_role', newRole);
    }
  }, [user]);
  
  const addRole = useCallback(async (role: Role, data: any): Promise<{ error: Error | null }> => {
    if (!user) {
      return { error: new Error('User not logged in') };
    }
    
    // Check if Supabase is properly configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Mock mode - simulating role addition');
      
      // Mock mode: simulate adding role
      if (role === Role.CLIENT && !user.profile.customer) {
        const mockCustomer: Customer = {
          id: Math.floor(Math.random() * 10000),
          ...data,
          email: 'demo@user.com',
          created_at: new Date().toISOString(),
          supabase_user_id: 'mock-user-id'
        };
        
        const updatedProfile = {
          ...user.profile,
          customer: mockCustomer,
          available_roles: [...user.profile.available_roles, Role.CLIENT]
        };
        
        setUser({
          current_role: Role.CLIENT,
          profile: updatedProfile,
          data: mockCustomer
        });
        localStorage.setItem('preferred_role', Role.CLIENT);
        return { error: null };
      } else if (role === Role.ORGANIZER && !user.profile.organizer) {
        const mockOrganizer: Organizer = {
          id: Math.floor(Math.random() * 10000),
          ...data,
          email: 'demo@user.com',
          created_at: new Date().toISOString(),
          supabase_user_id: 'mock-user-id',
          maps_link: null,
          additional_notes: null
        };
        
        const updatedProfile = {
          ...user.profile,
          organizer: mockOrganizer,
          available_roles: [...user.profile.available_roles, Role.ORGANIZER]
        };
        
        setUser({
          current_role: Role.ORGANIZER,
          profile: updatedProfile,
          data: mockOrganizer
        });
        localStorage.setItem('preferred_role', Role.ORGANIZER);
        return { error: null };
      }
      
      return { error: new Error('Role already exists') };
    }
    
    // Get current Supabase user
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (!supabaseUser) {
      return { error: new Error('No authenticated user') };
    }
    
    try {
      if (role === Role.CLIENT && !user.profile.customer) {
        const { error } = await supabase.from('customers').insert({
          ...data,
          email: supabaseUser.email,
          supabase_user_id: supabaseUser.id
        });
        
        if (error) throw error;
        
        // Fetch the newly created profile
        const { data: newCustomer } = await supabase.from('customers').select('*').eq('supabase_user_id', supabaseUser.id).single();
        if (newCustomer) {
          const updatedProfile = {
            ...user.profile,
            customer: newCustomer,
            available_roles: [...user.profile.available_roles, Role.CLIENT]
          };
          setUser({
            current_role: Role.CLIENT,
            profile: updatedProfile,
            data: newCustomer
          });
          localStorage.setItem('preferred_role', Role.CLIENT);
        }
      } else if (role === Role.ORGANIZER && !user.profile.organizer) {
        const { error } = await supabase.from('organizers').insert({
          ...data,
          email: supabaseUser.email,
          supabase_user_id: supabaseUser.id
        });
        
        if (error) throw error;
        
        // Fetch the newly created profile
        const { data: newOrganizer } = await supabase.from('organizers').select('*').eq('supabase_user_id', supabaseUser.id).single();
        if (newOrganizer) {
          const updatedProfile = {
            ...user.profile,
            organizer: newOrganizer,
            available_roles: [...user.profile.available_roles, Role.ORGANIZER]
          };
          setUser({
            current_role: Role.ORGANIZER,
            profile: updatedProfile,
            data: newOrganizer
          });
          localStorage.setItem('preferred_role', Role.ORGANIZER);
        }
      }
      
      return { error: null };
    } catch (error) {
      console.error('Error adding role:', error);
      return { error: error as Error };
    }
  }, [user]);

  const value = useMemo(() => ({ 
    user, 
    login, 
    logout, 
    register,
    switchRole,
    addRole,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    authModalRole,
    setAuthModalRole
  }), [user, login, logout, register, switchRole, addRole, isAuthModalOpen, openAuthModal, closeAuthModal, authModalTab, setAuthModalTab, authModalRole, setAuthModalRole]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};