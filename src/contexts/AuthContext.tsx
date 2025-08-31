import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    schoolName: string,
    fullName: string,
    role?: string
  ) => Promise<{ data: any; error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any invalid sessions on startup
    const clearInvalidSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error && error.message.includes('Invalid Refresh Token')) {
          try {
            await supabase.auth.signOut();
          } catch (signOutError) {
            console.warn('Sign out during invalid session cleanup failed:', signOutError);
          }
          localStorage.clear(); // Clear any stale data
          console.log('Cleared invalid session');
        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Session check error:', error);
        // If there's any error, clear everything
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.warn('Sign out during session check error failed:', signOutError);
        }
        localStorage.clear();
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    clearInvalidSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session);

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else if (event === "SIGNED_OUT") {
        // Clear all local data on sign out
        localStorage.removeItem('catalyst-classes');
        localStorage.removeItem('catalyst-grades');
        localStorage.removeItem('catalyst-attendance');
        localStorage.removeItem('catalyst-lesson-plans');
        localStorage.removeItem('catalyst-assessments');

        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Password reset",
          description: "Check your email for password reset instructions.",
        });
      } else if (event === "TOKEN_REFRESHED") {
        console.log('Token refreshed successfully');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    schoolName: string,
    fullName: string,
    role: string = 'teacher'
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school_name: schoolName,
            role: role,
          },
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { data: null, error };
      }

      if (data.user && !data.user.email_confirmed_at) {
        toast({
          title: "Check your email",
          description: "Please check your email for a confirmation link.",
        });
      }

      return { data, error: null };
    } catch (error: any) {
      const authError = error as AuthError;
      toast({
        title: "An error occurred",
        description: authError.message,
        variant: "destructive",
      });
      return { data: null, error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      // Clear any existing invalid session before signing in
      try {
        await supabase.auth.signOut();
      } catch (signOutError) {
        // Ignore sign out errors, we just want to clear any bad state
        console.log('Pre-signin cleanup:', signOutError);
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific refresh token errors
        if (error.message.includes('Invalid Refresh Token')) {
          localStorage.clear();
          toast({
            title: "Session expired",
            description: "Please try signing in again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Sign in failed",
            description: error.message,
            variant: "destructive",
          });
        }
        return { error };
      }

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;

      // Handle refresh token errors
      if (authError.message.includes('Invalid Refresh Token')) {
        localStorage.clear();
        toast({
          title: "Session expired",
          description: "Please try signing in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "An error occurred",
          description: authError.message,
          variant: "destructive",
        });
      }
      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);

      const { error } = await supabase.auth.signOut();

      // Always clear local state and storage, even if signOut fails
      setSession(null);
      setUser(null);

      // Clear all application data
      localStorage.removeItem('catalyst-classes');
      localStorage.removeItem('catalyst-grades');
      localStorage.removeItem('catalyst-attendance');
      localStorage.removeItem('catalyst-lesson-plans');
      localStorage.removeItem('catalyst-assessments');

      // Clear any Supabase auth data
      localStorage.removeItem('sb-mkheppdwmzylmiiaxelq-auth-token');

      if (error && !error.message.includes('Invalid Refresh Token')) {
        console.error('Sign out error:', error);
        toast({
          title: "Sign out completed",
          description: "You have been signed out (with cleanup).",
        });
      }
    } catch (error) {
      console.error("Sign out error:", error);
      // Force cleanup even on error
      setSession(null);
      setUser(null);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password reset sent",
        description: "Check your email for password reset instructions.",
      });

      return { error: null };
    } catch (error: any) {
      const authError = error as AuthError;
      toast({
        title: "An error occurred",
        description: authError.message,
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
