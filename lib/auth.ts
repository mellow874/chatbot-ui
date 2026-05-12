/**
 * Authentication utilities for QLA Chatbot
 */

const AUTH_KEY = "qla_authenticated";
const SESSION_KEY = "qla_session_token";

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) === "true";
}

export function authenticate(token: string): void {
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(SESSION_KEY, token);
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(SESSION_KEY);
  // Redirect to login
  window.location.href = "/login";
}

export function getSessionToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SESSION_KEY);
}
