export const LANDING_PATH = "/";
export const LOGIN_PATH = "/login";
export const APP_ROOT = "/app";

function joinAppPath(path: string): string {
  if (!path || path === "/") {
    return APP_ROOT;
  }

  return `${APP_ROOT}${path.startsWith("/") ? path : `/${path}`}`;
}

export function appPath(path = "/"): string {
  return joinAppPath(path);
}

