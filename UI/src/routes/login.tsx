import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login, isAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && isAuthenticated()) {
      throw redirect({ to: "/" });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate({ to: "/" });
      } else {
        setError("Password must be at least 6 characters.");
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--gradient-subtle)" }}>
      <div className="w-full max-w-sm">
        {/* Branding */}
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

        {/* Card */}
        <div className="bg-card rounded-2xl border border-border p-7 shadow-[var(--shadow-elevated)]">
          <h2 className="text-lg font-semibold tracking-tight mb-1">Sign in</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter your credentials to access your network
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Email
              </label>
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
              <label className="text-sm font-medium text-foreground block mb-1.5">
                Password
              </label>
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

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

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

        <p className="text-center text-xs text-muted-foreground mt-5">
          Demo: any email address + 6+ character password
        </p>
      </div>
    </div>
  );
}
