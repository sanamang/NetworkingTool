import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { login, loginWithOAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="17" height="18" viewBox="0 0 814 1000" fill="currentColor">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 388.7 43 249.9 86.9 166.2c28.8-54.1 82.3-88.7 140.8-88.7 54.1 0 94.8 35.9 143.5 35.9 47.5 0 96.5-37.8 154.3-37.8 23 0 108.4 2.6 168.5 88.6zm-97.4-194.3c25.3-30.1 43.5-72.4 43.5-114.7 0-5.8-.6-11.8-1.9-16.6-41.5 1.3-91.1 27.5-120.8 59.6-23 25-44.5 68.1-44.5 111.1 0 6.5.6 13 1.3 15.2 2.6.7 6.5 1.3 10.4 1.3 38.5 0 86.2-25.2 112-55.9z"/>
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "apple" | null>(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setOauthLoading(provider);
    try {
      await loginWithOAuth(provider);
      // loginWithOAuth redirects the browser to the OAuth provider, so code below won't run.
    } catch (err: any) {
      toast.error(err.message ?? `${provider} sign-in failed`);
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message ?? "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--gradient-subtle)" }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-semibold mb-4 shadow-[var(--shadow-elevated)]"
            style={{ background: "var(--gradient-accent)" }}
          >
            N
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">NetworkOS</h1>
          <p className="text-sm text-muted-foreground mt-1">Your relationship command center</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-7 shadow-[var(--shadow-elevated)]">
          <h2 className="text-lg font-semibold tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-muted-foreground mb-6">Sign in to your account</p>

          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              disabled={oauthLoading !== null}
              onClick={() => handleOAuth("google")}
              className="flex w-full items-center justify-center gap-3 h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-accent/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === "google"
                ? <span className="w-4 h-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                : <GoogleIcon />}
              Continue with Google
            </button>
            <button
              type="button"
              disabled={oauthLoading !== null}
              onClick={() => handleOAuth("apple")}
              className="flex w-full items-center justify-center gap-3 h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-accent/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {oauthLoading === "apple"
                ? <span className="w-4 h-4 rounded-full border-2 border-foreground/30 border-t-foreground animate-spin" />
                : <AppleIcon />}
              Continue with Apple
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-xs text-muted-foreground">or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/50 transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/50 transition"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              className="w-full font-medium"
              disabled={loading}
              style={loading ? {} : { background: "var(--gradient-accent)" }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
