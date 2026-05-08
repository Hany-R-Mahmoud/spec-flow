import * as React from "react";
import { useLocation } from "wouter";
import { AlertCircle, CheckCircle2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { signIn, error, status } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);

    void (async () => {
      try {
        await signIn({ email, password });
        setLocation("/");
      } catch (submitError) {
        setLocalError(
          submitError instanceof Error
            ? submitError.message
            : "Could not sign in.",
        );
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                SpecFlow AI
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">
                Sign in
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your credentials to continue.
              </p>
            </div>

            <Card className="border-border/70 shadow-sm">
              <CardHeader className="space-y-1">
                <CardTitle className="text-base">Welcome back</CardTitle>
                <CardDescription>Enter the email and password for your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>

                  {(localError || error) && (
                    <div className="flex items-start gap-2 rounded-md border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-3 py-2 text-sm text-[var(--color-danger)]">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>{localError ?? error}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={isSubmitting || status === "loading"}>
                      <LogIn className="h-4 w-4" />
                      Sign in
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="rounded-lg border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Access required</p>
              <p className="mt-1">
                Ask your workspace admin for an account if you do not have credentials yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
