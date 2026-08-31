import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearAuth, getAccessToken, getRefreshToken, STORAGE_KEYS } from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import {
  AuthResponse,
  AuthUser,
  LoginRequest,
  RegisterRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
} from "@/types/api";
import { type AppRole, normalizeRoles, hasRole, hasAnyRole } from "@/lib/rbac";

interface AuthContextType {
  user: (UserProfileResponse & { roles?: string[] }) | AuthUser | null;
  isAuthenticated: boolean;
  /** User has USER role (every authenticated user is a learner) */
  isLearner: boolean;
  /** User has MENTOR role (can create offerings, accept requests) */
  isInstructor: boolean;
  /** User has ADMIN role (platform moderation) */
  isAdmin: boolean;
  isLoading: boolean;
  /** Check if user has a specific role */
  checkRole: (role: AppRole) => boolean;
  /** Check if user has any of the specified roles */
  checkAnyRole: (...roles: AppRole[]) => boolean;
  login: (credentials: LoginRequest) => Promise<AuthResponse>;
  register: (data: RegisterRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateUserProfileRequest) => Promise<UserProfileResponse>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(UserProfileResponse & { roles?: string[] }) | AuthUser | null>(
    () => {
      if (typeof window === "undefined") return null;
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    },
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authService.getProfile();
      setUser((prev) => {
        const merged = { ...prev, ...profile };
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
        }
        return merged;
      });
    } catch (err) {
      // If fetching fails, token might be invalid or network down
      // we retain whatever cached user exists or clear if unauthorized
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentProfile();
  }, [fetchCurrentProfile]);

  const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      if (response.user) {
        setUser(response.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
      }
      // Re-fetch detailed profile asynchronously
      fetchCurrentProfile();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      if (response.user) {
        setUser(response.user);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
        }
      }
      fetchCurrentProfile();
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    const refreshToken = getRefreshToken();
    try {
      await authService.logout(refreshToken || undefined);
    } finally {
      clearAuth();
      setUser(null);
    }
  };

  const updateProfile = async (data: UpdateUserProfileRequest): Promise<UserProfileResponse> => {
    const updated = await authService.updateProfile(data);
    setUser((prev) => {
      const merged = { ...prev, ...updated };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(merged));
      }
      return merged;
    });
    return updated;
  };

  // Normalize roles once, reuse for all role checks
  const rawRoles: string[] = useMemo(() => (user as any)?.roles || [], [user]);
  const normalizedRoles = useMemo(() => normalizeRoles(rawRoles), [rawRoles]);

  const isLearner = normalizedRoles.includes("USER") || normalizedRoles.length > 0;
  const isInstructor = normalizedRoles.includes("MENTOR");
  const isAdmin = normalizedRoles.includes("ADMIN");

  const checkRole = useCallback(
    (role: AppRole) => hasRole(rawRoles, role),
    [rawRoles],
  );

  const checkAnyRole = useCallback(
    (...roles: AppRole[]) => hasAnyRole(rawRoles, ...roles),
    [rawRoles],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!getAccessToken() || !!user,
        isLearner,
        isInstructor,
        isAdmin,
        isLoading,
        checkRole,
        checkAnyRole,
        login,
        register,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
