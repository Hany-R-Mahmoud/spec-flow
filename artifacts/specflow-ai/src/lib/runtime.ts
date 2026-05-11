const TRAILING_SLASHES = /\/+$/;

export const apiServerUrl = normalizeBaseUrl(
  import.meta.env.VITE_API_SERVER_URL ?? null,
);

export const appUrl = normalizeBaseUrl(import.meta.env.VITE_APP_URL ?? null);

function normalizeBaseUrl(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed.replace(TRAILING_SLASHES, "");
}

export function resolveApiUrl(pathname: string): string {
  if (!apiServerUrl) {
    return pathname;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${apiServerUrl}${normalizedPath}`;
}

export function isPreviewDeployment(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (import.meta.env.VITE_VERCEL_ENV) {
    return import.meta.env.VITE_VERCEL_ENV === "preview";
  }

  return window.location.hostname.endsWith(".vercel.app");
}

export function getCanonicalUrl(pathname: string): string {
  if (typeof window === "undefined") {
    return appUrl ?? pathname;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalizedPath, window.location.origin).toString();
}
