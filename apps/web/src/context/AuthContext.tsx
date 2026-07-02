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
  /** Email + password sign-in. */
  signInWithPassword: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  /**
   * Email + password sign-up. `needsConfirmation` is true when the project
   * requires email confirmation before the user can sign in (no session yet).
   */
  signUpWithPassword: (
    email: string,
    password: string,
    meta?: { firstName: string; lastName: string }
  ) => Promise<{
    error?: string;
    needsConfirmation?: boolean;
    alreadyExists?: boolean;
  }>;
  /** Sends a password-reset email linking to /auth/reset. */
  resetPassword: (email: string) => Promise<{ error?: string }>;
  /** Sets a new password for the current (recovery) session. */
  updatePassword: (password: string) => Promise<{ error?: string }>;
  /** Updates the signed-in user's name (stored in user_metadata). */
  updateProfile: (meta: {
    firstName: string;
    lastName: string;
  }) => Promise<{ error?: string }>;
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

  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return error ? { error: error.message } : {};
    },
    []
  );

  const signUpWithPassword = useCallback(
    async (
      email: string,
      password: string,
      meta?: { firstName: string; lastName: string }
    ) => {
      const emailRedirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;
      const userData = meta
        ? {
            first_name: meta.firstName,
            last_name: meta.lastName,
            full_name: `${meta.firstName} ${meta.lastName}`.trim(),
          }
        : undefined;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo, data: userData },
      });
      if (error) {
        // Confirmations OFF: an already-registered email surfaces as an error.
        if (/already\s*(registered|exists)|already in use/i.test(error.message)) {
          return { alreadyExists: true };
        }
        return { error: error.message };
      }
      // Confirmations ON: Supabase obfuscates an existing user as a "success"
      // with an empty identities array (anti-enumeration). Treat as existing.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        return { alreadyExists: true };
      }
      // No session => the project requires email confirmation first.
      return { needsConfirmation: !data.session };
    },
    []
  );

  const resetPassword = useCallback(async (email: string) => {
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset`
        : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    return error ? { error: error.message } : {};
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return error ? { error: error.message } : {};
  }, []);

  const updateProfile = useCallback(
    async (meta: { firstName: string; lastName: string }) => {
      const first = meta.firstName.trim();
      const last = meta.lastName.trim();
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: first,
          last_name: last,
          full_name: `${first} ${last}`.trim(),
        },
      });
      return error ? { error: error.message } : {};
    },
    []
  );

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        signInWithEmail,
        verifyOtp,
        signInWithPassword,
        signUpWithPassword,
        resetPassword,
        updatePassword,
        updateProfile,
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
