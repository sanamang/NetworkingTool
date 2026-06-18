import { supabase } from "./supabase";
import type { User } from "@supabase/supabase-js";

export interface SignupProfile {
  username: string;
  email: string;
  password: string;
  school: string;
  program: string;
  yearOfStudy: string;
  jobInterest: string;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signup(profile: SignupProfile) {
  const { data, error } = await supabase.auth.signUp({
    email: profile.email,
    password: profile.password,
    options: {
      data: {
        full_name: profile.username,
        username: profile.username,
        school: profile.school,
        program: profile.program,
        year_of_study: profile.yearOfStudy,
        job_interest: profile.jobInterest,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export function displayName(user: User | null): string {
  if (!user) return "";
  const meta = user.user_metadata;
  return meta?.username || meta?.full_name || user.email?.split("@")[0] || "";
}

export function userInitials(user: User | null): string {
  const name = displayName(user);
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
