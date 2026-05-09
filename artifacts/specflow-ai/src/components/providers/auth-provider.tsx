"use client";

import * as React from "react";
import { useAuth as useClerkAuth, useOrganization, useUser } from "@clerk/react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

type AuthStatus = "loading" | "authenticated" | "anonymous";
type WorkspaceType = "personal" | "organization";

type AuthContextValue = {
  status: AuthStatus;
  isSignedIn: boolean;
  isTokenReady: boolean;
  sessionId: string | null;
  workspaceId: string | null;
  workspaceName: string;
  workspaceType: WorkspaceType;
  orgId: string | null;
  orgRole: string | null;
  canManageWorkspace: boolean;
  displayName: string;
  email: string;
};

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

function getDisplayName(
  user: ReturnType<typeof useUser>["user"],
): string {
  if (!user) {
    return "Guest";
  }

  if (user.fullName?.trim()) {
    return user.fullName.trim();
  }

  if (user.username?.trim()) {
    return user.username.trim();
  }

  const email = user.primaryEmailAddress?.emailAddress;
  return email ?? "Member";
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payload.padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = atob(padded);
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function getTokenActivationDelayMs(token: string): number {
  const payload = parseJwtPayload(token);
  const notBefore = payload?.nbf;
  if (typeof notBefore !== "number") {
    return 0;
  }

  const now = Math.floor(Date.now() / 1000);
  if (notBefore <= now) {
    return 0;
  }

  return Math.max((notBefore - now) * 1000 + 250, 0);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken, sessionId, orgId, orgRole } = useClerkAuth();
  const { isLoaded: isOrganizationLoaded, organization } = useOrganization();
  const { user } = useUser();
  const [isTokenReady, setIsTokenReady] = React.useState(false);

  React.useEffect(() => {
    if (!isLoaded || !isSignedIn || !isOrganizationLoaded) {
      setAuthTokenGetter(null);
      setIsTokenReady(false);
      return;
    }

    let cancelled = false;
    let activationTimer: number | null = null;

    setIsTokenReady(false);

    void (async () => {
      const token = await getToken();
      if (cancelled) {
        return;
      }

      if (!token?.trim()) {
        setAuthTokenGetter(null);
        setIsTokenReady(false);
        return;
      }

      const activate = () => {
        if (cancelled) {
          return;
        }

        setAuthTokenGetter(() => token);
        setIsTokenReady(true);
      };

      const delay = getTokenActivationDelayMs(token);
      if (delay > 0) {
        activationTimer = window.setTimeout(activate, delay);
        return;
      }

      activate();
    })();

    return () => {
      cancelled = true;
      if (activationTimer !== null) {
        window.clearTimeout(activationTimer);
      }
      setAuthTokenGetter(null);
      setIsTokenReady(false);
    };
  }, [getToken, isLoaded, isOrganizationLoaded, isSignedIn, orgId, orgRole, sessionId]);

  const status: AuthStatus = !isLoaded ? "loading" : isSignedIn ? "authenticated" : "anonymous";

  const displayName = getDisplayName(user);
  const workspaceType: WorkspaceType = orgId ? "organization" : "personal";
  const workspaceName =
    organization?.name?.trim() ||
    user?.fullName?.trim() ||
    user?.username?.trim() ||
    "Personal Account";
  const workspaceId = orgId ? `org:${orgId}` : user?.id ? `personal:${user.id}` : null;
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const canManageWorkspace = workspaceType === "personal" || orgRole === "org:admin";

  const value = React.useMemo<AuthContextValue>(
    () => ({
      status,
      isSignedIn: Boolean(isSignedIn),
      isTokenReady,
      sessionId: sessionId ?? null,
      workspaceId,
      workspaceName,
      workspaceType,
      orgId: orgId ?? null,
      orgRole: orgRole ?? null,
      canManageWorkspace,
      displayName,
      email,
    }),
    [
      canManageWorkspace,
      displayName,
      email,
      isSignedIn,
      isTokenReady,
      orgId,
      orgRole,
      sessionId,
      status,
      workspaceId,
      workspaceName,
      workspaceType,
    ],
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
