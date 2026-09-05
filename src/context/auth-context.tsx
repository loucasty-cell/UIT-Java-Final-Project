import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ApiError, refreshAuthTokens } from "@/lib/api-client";
import {
  AUTH_CLEARED_EVENT,
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getAuthRevision,
  saveSession,
  STORAGE_KEYS,
} from "@/lib/auth-session";
import { authService } from "@/services/auth.service";
import type {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/types/api";
import { type AppRole, normalizeRoles, hasRole, hasAnyRole } from "@/lib/rbac";

type SessionUser = UserProfileResponse | AuthUser;
interface AuthContextType {
  user: SessionUser | null;
  isAuthenticated: boolean;
  isLearner: boolean;
  isInstructor: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  sessionError: string | null;
  checkRole: (role: AppRole) => boolean;
  checkAnyRole: (...roles: AppRole[]) => boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateUserProfileRequest, version: number) => Promise<UserProfileResponse>;
  refreshProfile: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  // Match SSR and first client render. Cached user JSON is not proof of login.
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const operation = useRef(0);

  const fetchCurrentProfile = useCallback(async () => {
    const current = ++operation.current;
    setSessionError(null);
    if (!getAccessToken() && !getRefreshToken()) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      if (!getAccessToken()) await refreshAuthTokens();
      if (!getAccessToken()) return;
      const profile = await authService.getProfile();
      if (current !== operation.current) return;
      if (!profile?.id || !profile.email || !Array.isArray(profile.roles))
        throw new Error("The server returned an invalid profile.");
      setUser(profile);
    } catch (error) {
      if (current !== operation.current) return;
      setUser(null);
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) clearAuth();
      else
        setSessionError(error instanceof Error ? error.message : "Unable to restore your session.");
    } finally {
      if (current === operation.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const reset = () => {
      operation.current++;
      setUser(null);
      setSessionError(null);
      setIsLoading(false);
      queryClient.clear();
    };
    const sync = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key === STORAGE_KEYS.ACCESS_TOKEN ||
        event.key === STORAGE_KEYS.REFRESH_TOKEN
      ) {
        // Logout in another tab invalidates in-flight responses in this tab too.
        if (!getAccessToken() && !getRefreshToken()) clearAuth();
        else void fetchCurrentProfile();
      }
    };
    window.addEventListener(AUTH_CLEARED_EVENT, reset);
    window.addEventListener("storage", sync);
    void fetchCurrentProfile();
    return () => {
      operation.current++;
      window.removeEventListener(AUTH_CLEARED_EVENT, reset);
      window.removeEventListener("storage", sync);
    };
  }, [fetchCurrentProfile, queryClient]);

  const authenticate = async (request: () => Promise<AuthResponse>) => {
    clearAuth();
    const current = ++operation.current;
    const revision = getAuthRevision();
    const response = await request();
    if (current !== operation.current || revision !== getAuthRevision())
      throw new Error("Sign-in was cancelled. Please try again.");
    saveSession(response);
    setUser(response.user);
    setSessionError(null);
    setIsLoading(false);
    return response;
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    clearAuth();
    // Revoke the original family even if its access token expired.
    await authService.logout(refreshToken || undefined);
  };

  const updateProfile = async (data: UpdateUserProfileRequest, version: number) => {
    const current = operation.current;
    const profile = await authService.updateProfile(data, version);
    if (current === operation.current && getAccessToken()) setUser(profile);
    return profile;
  };
  const roles = useMemo(() => user?.roles || [], [user]);
  const normalizedRoles = useMemo(() => normalizeRoles(roles), [roles]);
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        sessionError,
        isLearner: normalizedRoles.includes("USER"),
        isInstructor: normalizedRoles.includes("MENTOR"),
        isAdmin: normalizedRoles.includes("ADMIN"),
        checkRole: (role) => hasRole(roles, role),
        checkAnyRole: (...required) => hasAnyRole(roles, ...required),
        login: (credentials) => authenticate(() => authService.login(credentials)),
        register: (data) => authenticate(() => authService.register(data)),
        logout,
        updateProfile,
        refreshProfile: fetchCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
