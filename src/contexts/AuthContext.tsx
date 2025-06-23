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
    fullName: string,
    schoolName?: string,
  ) => Promise<{ error: AuthError | null }>;
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
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully.",
        });
      } else if (event === "PASSWORD_RECOVERY") {
        toast({
          title: "Password reset",
          description: "Check your email for password reset instructions.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    schoolName?: string,
  ) => {
    try {
      // Step 1: Create user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            school_name: schoolName,
            role: "teacher",
          },
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Step 2: If user created successfully, automatically confirm email
      if (data.user) {
        try {
          // Auto-confirm email using service role (if available)
          if (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
            const serviceSupabase = supabase;
            await serviceSupabase.auth.admin.updateUserById(data.user.id, {
              email_confirm: true,
            });
          }

          // Step 3: Attempt immediate sign-in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError) {
            toast({
              title: "Welcome to Catalyst!",
              description: "Your account has been created and you're now signed in.",
            });
          } else {
            toast({
              title: "Account created successfully!",
              description: "You can now sign in with your credentials.",
            });
          }
        } catch (confirmError) {
          // If auto-confirmation fails, still try to sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (!signInError) {
            toast({
              title: "Welcome to Catalyst!",
              description: "Your account has been created and you're now signed in.",
            });
          } else {
            toast({
              title: "Account created!",
              description: "Please check your email to verify your account.",
            });
          }
        }
      }

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "An error occurred",
        description: authError.message,
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      toast({
        title: "An error occurred",
        description: authError.message,
        variant: "destructive",
      });
      return { error: authError };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    schoolName: string,
    autoConfirm: boolean = true,
  ) => {
    try {
      setLoading(true);
      setError(null);

      // First, create the user account
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            school_name: schoolName,
          },
        },
      });

      if (error) throw error;

      // If auto-confirm is enabled and user was created successfully
      if (autoConfirm && data.user && !data.user.email_confirmed_at) {
        try {
          // Wait a moment for the user to be fully created
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Attempt to sign the user in immediately
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (!signInError && signInData.user) {
            console.log("User auto-confirmed and signed in successfully");
            return { data: signInData, error: null, autoConfirmed: true };
          } else {
            console.log(
              "Auto-confirm attempt failed, proceeding with normal flow:",
              signInError?.message,
            );
          }
        } catch (autoConfirmError) {
          console.log(
            "Auto-confirm failed, user will need to verify email:",
            autoConfirmError,
          );
        }
      }

      return { data, error: null, autoConfirmed: false };
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };
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