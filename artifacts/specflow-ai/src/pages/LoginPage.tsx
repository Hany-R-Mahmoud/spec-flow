import { SignIn } from "@clerk/react";
import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { appPath } from "@/lib/routes";

function AuthFallback() {
  return (
    <div className="flex h-[520px] w-full items-center justify-center rounded-2xl border border-border bg-card/60">
      <div className="h-10 w-10 animate-pulse rounded-full border border-border bg-background" />
    </div>
  );
}

export function LoginPage() {
  return (
    <AuthPageShell>
      <SignIn routing="path" path="/login" fallbackRedirectUrl={appPath()} fallback={<AuthFallback />} />
    </AuthPageShell>
  );
}

export default LoginPage;
