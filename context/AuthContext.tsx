import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { AuthState, UserProfile } from '../types';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (!isSupabaseConfigured()) {
        console.warn("Supabase is not configured. Using mock auth state.");
        // Mock user check for demo purposes if no env vars
        const mockUser = localStorage.getItem('mock_user');
        if (mockUser) setUser(JSON.parse(mockUser));
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch additional profile data if needed
        setUser({
          id: session.user.id,
          email: session.user.email!,
          questionnaire_completed: session.user.user_metadata?.questionnaire_completed || false,
          preferences: session.user.user_metadata?.preferences
        });
      }
      setLoading(false);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            questionnaire_completed: session.user.user_metadata?.questionnaire_completed || false,
            preferences: session.user.user_metadata?.preferences
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      });

      return () => subscription.unsubscribe();
    };

    initAuth();
  }, []);

  const signIn = async (email: string) => {
    if (!isSupabaseConfigured()) {
      const mockUser = { id: '123', email, questionnaire_completed: false };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return;
    }
    // For this demo, we assume Magic Link or similar, but the UI handles Password.
    // This is just a placeholder action.
  };

  const signOut = async () => {
    if (!isSupabaseConfigured()) {
      localStorage.removeItem('mock_user');
      setUser(null);
      return;
    }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};