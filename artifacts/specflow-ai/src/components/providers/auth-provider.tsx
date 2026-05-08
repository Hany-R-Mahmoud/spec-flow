"use client";

import * as React from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import {
  clearStoredSession,
  fetchCurrentSupabaseUser,
  getAuthDisplayName,
  isSessionExpired,
  readStoredSession,
  refreshSupabaseSession,
  signInWithPassword,
  signOutSupabaseSession,
  signUpWithPassword,
  storeSession,
  type SupabaseSession,
  type SupabaseUser,
} from "@/lib/supabase-auth";

type AuthStatus = "loading" | "authenticated" | "anonymous";

type AuthContextValue = {
  status: AuthStatus;
  session: SupabaseSession | null;
  user: SupabaseUser | null;
  displayName: string;
  error: string | null;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { email: string; password: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
  reloadSession: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

async function validateSession(
  session: SupabaseSession,
): Promise<SupabaseSession> {
  if (!isSessionExpired(session)) {
    const user = await fetchCurrentSupabaseUser(session.access_token);
    return { ...session, user };
  }

  const refreshed = await refreshSupabaseSession(session.refresh_token);
  const user = await fetchCurrentSupabaseUser(refreshed.access_token);
  return { ...refreshed, user };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<AuthStatus>("loading");
  const [session, setSession] = React.useState<SupabaseSession | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const applySession = React.useCallback((nextSession: SupabaseSession | null) => {
    setSession(nextSession);
    storeSession(nextSession);
    setStatus(nextSession ? "authenticated" : "anonymous");
    setError(null);
  }, []);

  const reloadSession = React.useCallback(async () => {
    const storedSession = readStoredSession();
    if (!storedSession) {
      applySession(null);
      return;
    }

    try {
      const nextSession = await validateSession(storedSession);
      applySession(nextSession);
    } catch (reloadError) {
      clearStoredSession();
      setSession(null);
      setStatus("anonymous");
      setError(
        reloadError instanceof Error
          ? reloadError.message
          : "Could not restore your Supabase session.",
      );
    }
  }, [applySession]);

  React.useEffect(() => {
    void reloadSession();
  }, [reloadSession]);

  React.useEffect(() => {
    setAuthTokenGetter(() => session?.access_token ?? null);
    return () => setAuthTokenGetter(null);
  }, [session?.access_token]);

  React.useEffect(() => {
    if (!session) {
      return undefined;
    }

    const refreshLeadTime = 60_000;
    const delay = Math.max(session.expires_at * 1000 - Date.now() - refreshLeadTime, 15_000);

    const timeout = window.setTimeout(() => {
      void (async () => {
        try {
          const refreshed = await refreshSupabaseSession(session.refresh_token);
          const user = await fetchCurrentSupabaseUser(refreshed.access_token);
          applySession({ ...refreshed, user });
        } catch (refreshError) {
          clearStoredSession();
          setSession(null);
          setStatus("anonymous");
          setError(
            refreshError instanceof Error
              ? refreshError.message
              : "Your session expired. Please sign in again.",
          );
        }
      })();
    }, delay);

    return () => window.clearTimeout(timeout);
  }, [applySession, session]);

  const signIn = React.useCallback(
    async (input: { email: string; password: string }) => {
      const nextSession = await signInWithPassword(input);
      const user = await fetchCurrentSupabaseUser(nextSession.access_token);
      applySession({ ...nextSession, user });
    },
    [applySession],
  );

  const signUp = React.useCallback(
    async (input: { email: string; password: string }) => {
      const nextSession = await signUpWithPassword(input);
      if (!nextSession) {
        setStatus("anonymous");
        return false;
      }

      const user = await fetchCurrentSupabaseUser(nextSession.access_token);
      applySession({ ...nextSession, user });
      return true;
    },
    [applySession],
  );

  const signOut = React.useCallback(async () => {
    if (session) {
      try {
        await signOutSupabaseSession(session.access_token);
      } catch {
        // Local sign-out should still succeed even if Supabase rejects the request.
      }
    }

    clearStoredSession();
    setSession(null);
    setStatus("anonymous");
    setError(null);
  }, [session]);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      displayName: getAuthDisplayName(session?.user ?? null),
      error,
      signIn,
      signUp,
      signOut,
      reloadSession,
    }),
    [error, reloadSession, session, signIn, signOut, signUp, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
