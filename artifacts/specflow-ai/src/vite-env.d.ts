/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_API_SERVER_URL?: string;
  readonly VITE_APP_URL?: string;
  readonly VITE_VERCEL_ENV?: string;
  readonly VITE_VERCEL_URL?: string;
}
