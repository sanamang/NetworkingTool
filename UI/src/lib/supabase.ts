import { createClient } from "@supabase/supabase-js";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "";
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? "";

if (!url || !key) {
  console.error(
    "[NetworkOS] Missing env vars: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set. " +
    "Add them to Vercel → Project → Settings → Environment Variables and redeploy."
  );
}

// Use placeholder values so createClient doesn't throw at module init when env vars are missing.
// API calls will still fail until real values are deployed.
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder-key"
);

// ── lightweight avatar helpers (not stored in DB) ───────────────────────────
const COLORS = [
  "oklch(0.7 0.12 30)",  "oklch(0.65 0.14 200)", "oklch(0.6 0.15 280)",
  "oklch(0.7 0.13 140)", "oklch(0.68 0.14 70)",  "oklch(0.62 0.16 340)",
  "oklch(0.66 0.13 250)","oklch(0.72 0.11 110)",
];

export function avatarColor(id: string) {
  const hash = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return COLORS[hash % COLORS.length];
}

export function initials(first: string, last: string) {
  return ((first[0] ?? "") + (last[0] ?? "")).toUpperCase();
}

export function daysSince(iso: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
