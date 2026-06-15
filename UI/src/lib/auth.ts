const AUTH_KEY = "networkos_auth";
const USER_KEY = "networkos_user_email";
const PROFILE_KEY = "networkos_profile";

export interface UserProfile {
  username: string;
  email: string;
  school: string;
  program: string;
  yearOfStudy: string;
  jobInterest: string;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function login(email: string, password: string): boolean {
  if (!email || password.length < 6) return false;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(USER_KEY, email);
  return true;
}

export function signup(profile: UserProfile & { password: string }): boolean {
  if (!profile.email || profile.password.length < 6) return false;
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(USER_KEY, profile.email);
  const { password: _, ...safeProfile } = profile;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(safeProfile));
  return true;
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export function getUserEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_KEY) ?? "";
}

export function getProfile(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getUserDisplayName(): string {
  const profile = getProfile();
  if (profile?.username) return profile.username;
  const email = getUserEmail();
  if (!email) return "";
  return email.split("@")[0];
}

export function getUserInitials(): string {
  const profile = getProfile();
  if (profile?.username) {
    const parts = profile.username.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return profile.username.slice(0, 2).toUpperCase();
  }
  const email = getUserEmail();
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
