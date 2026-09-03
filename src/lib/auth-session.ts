import type { AuthResponse } from "@/types/api";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "skillbridge_access_token",
  REFRESH_TOKEN: "skillbridge_refresh_token",
  USER: "skillbridge_user",
} as const;
export const AUTH_CLEARED_EVENT = "skillbridge:auth-cleared";
let revision = 0;
export const getAuthRevision = () => revision;

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
export const getAccessToken = () => read(STORAGE_KEYS.ACCESS_TOKEN);
export const getRefreshToken = () => read(STORAGE_KEYS.REFRESH_TOKEN);

function write(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  if (value) localStorage.setItem(key, value);
  else localStorage.removeItem(key);
}
export const setAccessToken = (token: string | null) => write(STORAGE_KEYS.ACCESS_TOKEN, token);
export const setRefreshToken = (token: string | null) => write(STORAGE_KEYS.REFRESH_TOKEN, token);

export function clearAuth(): void {
  revision++;
  if (typeof window === "undefined") return;
  for (const key of Object.values(STORAGE_KEYS)) {
    try {
      localStorage.removeItem(key);
    } catch {
      /* Storage may be unavailable. */
    }
  }
  window.dispatchEvent(new Event(AUTH_CLEARED_EVENT));
}

export function saveSession(session: AuthResponse): void {
  if (
    !session ||
    typeof session.accessToken !== "string" ||
    !session.accessToken ||
    typeof session.refreshToken !== "string" ||
    !session.refreshToken ||
    !session.user?.id ||
    !session.user.email ||
    !Array.isArray(session.user.roles)
  ) {
    throw new Error("The server returned an invalid session. Please try again.");
  }
  try {
    setAccessToken(session.accessToken);
    setRefreshToken(session.refreshToken);
    write(STORAGE_KEYS.USER, JSON.stringify(session.user));
  } catch {
    clearAuth();
    throw new Error("Allow browser storage for this site to sign in.");
  }
}
