"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthState = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  /**
   * Sends a magic link email + 6-digit OTP code to the email.
   * Creates the user if they don't already exist (passwordless flow).
   */
  signInWithEmail: (email: string) => Promise<{ error?: string }>;
  /**
   * Verifies the 6-digit OTP code entered by the user.
   * On success, the auth listener will fire with the new session.
   */
  verifyOtp: (email: string, code: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!mounted) return;

      // If we have a cached session, verify it's still valid by hitting the
      // auth server. Catches the case where the user has been deleted
      // server-side but the JWT is still in localStorage.
      if (sessionData.session) {
        const { data: userData, error } = await supabase.auth.getUser();
        if (!mounted) return;
        if (error || !userData.user) {
          await supabase.auth.signOut();
          setSession(null);
        } else {
          setSession(sessionData.session);
        }
      }
      setLoading(false);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = useCallback(async (email: string) => {
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
      },
    });
    return error ? { error: error.message } : {};
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    if (error) return { error: error.message };
    if (!data.session) {
      return {
        error:
          "Code accepted but no session was created. Try signing in again.",
      };
    }
    return {};
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithEmail,
        verifyOtp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
