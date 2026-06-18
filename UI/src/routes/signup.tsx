import { createFileRoute, redirect, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signup } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) throw redirect({ to: "/" });
  },
  component: SignupPage,
});

const YEAR_OPTIONS = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate Student", "Alumni"];
const JOB_OPTIONS = [
  "Software Engineering", "Product Management", "Data Science / AI",
  "Investment Banking", "Consulting", "Marketing & Growth",
  "Design & UX", "Venture Capital", "Entrepreneurship", "Research & Academia", "Other",
];

const inputClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/50 transition";
const selectClass = "w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring/50 transition appearance-none cursor-pointer";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "", email: "", password: "",
    school: "", program: "", yearOfStudy: "", jobInterest: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      await signup(form);
      navigate({ to: "/" });
    } catch (err: any) {
      setError(err.message ?? "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const ChevronDown = () => (
    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--gradient-subtle)" }}>
      <div className="w-full max-w-md">
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
          <h2 className="text-lg font-semibold tracking-tight mb-1">Create your account</h2>
          <p className="text-sm text-muted-foreground mb-6">Tell us about yourself to get started</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username">
                <input type="text" value={form.username} onChange={set("username")} placeholder="alexyang" required autoComplete="username" className={inputClass} />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" required autoComplete="email" className={inputClass} />
              </Field>
            </div>

            <Field label="Password">
              <input type="password" value={form.password} onChange={set("password")} placeholder="Min. 6 characters" required autoComplete="new-password" className={inputClass} />
            </Field>

            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-1">Academic Info</p>

            <Field label="School / University">
              <input type="text" value={form.school} onChange={set("school")} placeholder="e.g. University of Toronto" required className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Program / Major">
                <input type="text" value={form.program} onChange={set("program")} placeholder="e.g. Computer Science" required className={inputClass} />
              </Field>
              <Field label="Year of Study">
                <div className="relative">
                  <select value={form.yearOfStudy} onChange={set("yearOfStudy")} required className={selectClass}>
                    <option value="" disabled>Select year</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                  <ChevronDown />
                </div>
              </Field>
            </div>

            <Field label="Job Interest">
              <div className="relative">
                <select value={form.jobInterest} onChange={set("jobInterest")} required className={selectClass}>
                  <option value="" disabled>Select career interest</option>
                  {JOB_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                <ChevronDown />
              </div>
            </Field>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              type="submit"
              className="w-full font-medium mt-2"
              disabled={loading}
              style={loading ? {} : { background: "var(--gradient-accent)" }}
            >
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground underline underline-offset-4 hover:text-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
