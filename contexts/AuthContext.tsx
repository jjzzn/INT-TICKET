import React, { createContext, useState, useCallback, useMemo, useEffect } from 'react';
import { AuthUser, Role, Customer, Organizer, SuperAdmin } from '../types';
import { supabase } from '../lib/supabaseClient';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

type RegisterData = (Omit<Customer, 'id' | 'created_at' | 'supabase_user_id'> & { password?: string }) | (Omit<Organizer, 'id'| 'created_at'|'supabase_user_id'|'maps_link'> & { password?: string });

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password?: string) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<void>;
  register: (role: Role, data: any) => Promise<{ error: AuthError | null; needsConfirmation?: boolean }>;
  isAuthModalOpen: boolean;
  openAuthModal: (defaultTab?: 'login' | 'register', defaultRole?: Role) => void;
  closeAuthModal: () => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  authModalRole: Role;
  // FIX: Add setAuthModalRole to the context type
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
        // Set a mock organizer user for demo purposes
        setUser({
          role: Role.ORGANIZER,
          data: {
            id: 1,
            organizer_name: 'Demo Organizer',
            email: 'demo@organizer.com',
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
          }
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
      setUser({
        role: Role.SUPER_ADMIN,
        data: {
          id: 0, // Dummy id, as there's no DB table for admins
          first_name: 'Admin',
          last_name: 'User',
          email: SUPER_ADMIN_EMAIL
        }
      });
      return;
    }

    // Try to fetch from customers first
    let { data: customerData } = await supabase.from('customers').select('*').eq('supabase_user_id', supabaseUser.id).single();
    if (customerData) {
      setUser({ role: Role.CLIENT, data: customerData });
      return;
    }

    // If not a customer, try to fetch from organizers
    let { data: organizerData } = await supabase.from('organizers').select('*').eq('supabase_user_id', supabaseUser.id).single();
    if (organizerData) {
      setUser({ role: Role.ORGANIZER, data: organizerData });
      return;
    }

    // If no profile found, it might be the first login after signup.
    // Try to create a profile from metadata stored during signup.
    const { app_role, ...profileData } = supabaseUser.user_metadata;
    if (app_role && (profileData.first_name || profileData.organizer_name)) {
        let insertError;
        let newProfile;

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
            if(!error) {
                const { data: freshCustomerData } = await supabase.from('customers').select('*').eq('supabase_user_id', supabaseUser.id).single();
                if (freshCustomerData) {
                    newProfile = { role: Role.CLIENT, data: freshCustomerData };
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
            if(!error) {
                const { data: freshOrganizerData } = await supabase.from('organizers').select('*').eq('supabase_user_id', supabaseUser.id).single();
                if(freshOrganizerData) newProfile = { role: Role.ORGANIZER, data: freshOrganizerData };
            }
        }

        if (insertError) {
            console.error("Error creating user profile from metadata:", insertError);
            setUser(null);
        } else if (newProfile) {
            setUser(newProfile);
            // Clean up metadata to prevent re-creation
            const newMetaData = { ...supabaseUser.user_metadata };
            delete newMetaData.app_role;
            // Client fields
            delete newMetaData.first_name;
            delete newMetaData.last_name;
            delete newMetaData.prefix;
            delete newMetaData.country_code;
            delete newMetaData.gender;
            delete newMetaData.birthday;
            delete newMetaData.id_number;
            // Organizer fields
            delete newMetaData.organizer_name;
            delete newMetaData.business_type;
            delete newMetaData.maps_link;
            delete newMetaData.company_name;
            delete newMetaData.tax_id;
            delete newMetaData.billing_address;
            delete newMetaData.contact_person;
            delete newMetaData.invoice_email;
            delete newMetaData.additional_notes;
            // Shared field
            delete newMetaData.phone;
            await supabase.auth.updateUser({ data: newMetaData });
        }
        return;
    }

    console.warn("User is logged in but no profile found in customers or organizers table.");
    setUser(null); // Or handle as a pending state
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
  
  // FIX: Added setAuthModalRole to the context value and dependency array
  const value = useMemo(() => ({ 
    user, 
    login, 
    logout, 
    register,
    isAuthModalOpen,
    openAuthModal,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    authModalRole,
    setAuthModalRole
  }), [user, login, logout, register, isAuthModalOpen, openAuthModal, closeAuthModal, authModalTab, setAuthModalTab, authModalRole, setAuthModalRole]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};