const STORAGE_KEY = "specflow-auth-session";

export type SupabaseUser = {
  id: string;
  email: string | null;
  role?: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
};

export type SupabaseSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  user: SupabaseUser;
};

type SupabaseAuthResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  user?: SupabaseUser;
  session?: SupabaseSession | null;
  message?: string;
  error_description?: string;
  error?: string;
};

type SupabaseConfig = {
  url: string;
  key: string;
};

function getSupabaseConfig(): SupabaseConfig {
  const url = import.meta.env.SUPABASE_URL as string | undefined;
  const key = import.meta.env.SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env. Set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    key,
  };
}

function getAuthBaseUrl(): string {
  return `${getSupabaseConfig().url}/auth/v1`;
}

function getHeaders(accessToken?: string | null): HeadersInit {
  const headers: HeadersInit = {
    apikey: getSupabaseConfig().key,
    "content-type": "application/json",
    accept: "application/json",
  };

  if (accessToken) {
    return {
      ...headers,
      authorization: `Bearer ${accessToken}`,
    };
  }

  return headers;
}

async function parseResponseError(response: Response): Promise<string> {
  const text = await response.text();

  if (!text) {
    return `Supabase auth request failed (${response.status})`;
  }

  try {
    const data = JSON.parse(text) as SupabaseAuthResponse;
    return (
      data.message ??
      data.error_description ??
      data.error ??
      `Supabase auth request failed (${response.status})`
    );
  } catch {
    return text;
  }
}

async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const response = await fetch(`${getAuthBaseUrl()}${path}`, {
    ...init,
    headers: {
      ...getHeaders(accessToken),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseResponseError(response));
  }

  return (await response.json()) as T;
}

function normalizeSession(
  response: SupabaseAuthResponse,
): SupabaseSession | null {
  if (response.session) {
    return response.session;
  }

  if (!response.access_token || !response.refresh_token || !response.user) {
    return null;
  }

  return {
    access_token: response.access_token,
    refresh_token: response.refresh_token,
    expires_in: response.expires_in ?? 3600,
    expires_at:
      Math.floor(Date.now() / 1000) + (response.expires_in ?? 3600),
    token_type: response.token_type ?? "bearer",
    user: response.user,
  };
}

export function readStoredSession(): SupabaseSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SupabaseSession;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function storeSession(session: SupabaseSession | null): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!session) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  storeSession(null);
}

export async function signInWithPassword(input: {
  email: string;
  password: string;
}): Promise<SupabaseSession> {
  const response = await requestJson<SupabaseAuthResponse>(
    "/token?grant_type=password",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  const session = normalizeSession(response);
  if (!session) {
    throw new Error("Supabase did not return a session.");
  }

  return session;
}

export async function signUpWithPassword(input: {
  email: string;
  password: string;
}): Promise<SupabaseSession | null> {
  const response = await requestJson<SupabaseAuthResponse>("/signup", {
    method: "POST",
    body: JSON.stringify(input),
  });

  return normalizeSession(response);
}

export async function refreshSupabaseSession(
  refreshToken: string,
): Promise<SupabaseSession> {
  const response = await requestJson<SupabaseAuthResponse>(
    "/token?grant_type=refresh_token",
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    },
  );

  const session = normalizeSession(response);
  if (!session) {
    throw new Error("Supabase did not return a refreshed session.");
  }

  return session;
}

export async function fetchCurrentSupabaseUser(
  accessToken: string,
): Promise<SupabaseUser> {
  return requestJson<SupabaseUser>("/user", { method: "GET" }, accessToken);
}

export async function signOutSupabaseSession(
  accessToken: string,
): Promise<void> {
  await requestJson("/logout", { method: "POST" }, accessToken);
}

export function isSessionExpired(session: SupabaseSession): boolean {
  return Date.now() >= session.expires_at * 1000 - 60_000;
}

export function getAuthDisplayName(user: SupabaseUser | null): string {
  if (!user) {
    return "Guest";
  }

  const metadataName = user.user_metadata?.["full_name"] ?? user.user_metadata?.["name"];
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  return user.email ?? "Member";
}

export function getAuthInitials(user: SupabaseUser | null): string {
  const name = getAuthDisplayName(user);
  const parts = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) {
    return "U";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}
