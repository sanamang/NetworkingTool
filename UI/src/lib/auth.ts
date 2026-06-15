const AUTH_KEY = "networkos_auth";
const USER_KEY = "networkos_user_email";

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

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getUserEmail(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USER_KEY) ?? "";
}

export function getUserInitials(): string {
  const email = getUserEmail();
  if (!email) return "?";
  const name = email.split("@")[0];
  const parts = name.split(/[._-]/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
