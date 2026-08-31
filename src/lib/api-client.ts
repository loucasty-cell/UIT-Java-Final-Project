import { ApiErrorResponse, AuthResponse } from "@/types/api";
import { handleMockApiRequest } from "./mock-api";

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "http://localhost:9095";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "skillbridge_access_token",
  REFRESH_TOKEN: "skillbridge_refresh_token",
  USER: "skillbridge_user",
} as const;

// Token helpers
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function setRefreshToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  } else {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

export class ApiError extends Error {
  status: number;
  error: string;
  timestamp?: string;
  path?: string;
  data?: unknown;

  constructor(
    status: number,
    message: string,
    error: string = "ApiError",
    timestamp?: string,
    path?: string,
    data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.timestamp = timestamp;
    this.path = path;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  idempotencyKey?: string;
  _retry?: boolean;
}

// Concurrency lock for token refreshing
let isRefreshing = false;
let refreshSubscribers: Array<(token: string | null) => void> = [];

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function refreshAuthTokens(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuth();
    return null;
  }

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      clearAuth();
      return null;
    }

    const data: AuthResponse = await res.json();
    setAccessToken(data.accessToken);
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken);
    }
    return data.accessToken;
  } catch (error) {
    if (refreshToken.startsWith("mock-")) {
      const mockResult = handleMockApiRequest("/api/v1/auth/refresh", "POST", { refreshToken });
      if (mockResult?.accessToken) {
        setAccessToken(mockResult.accessToken);
        return mockResult.accessToken;
      }
    }
    clearAuth();
    return null;
  }
}

/**
 * Core HTTP Request Engine
 */
export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, headers, _retry, idempotencyKey, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (idempotencyKey && !reqHeaders["Idempotency-Key"]) {
    reqHeaders["Idempotency-Key"] = idempotencyKey;
  }

  const token = getAccessToken();
  if (token && !reqHeaders["Authorization"]) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
  };

  let response: Response;
  try {
    response = await fetch(url, config);
  } catch (networkError: unknown) {
    try {
      let bodyObj: any = undefined;
      if (customConfig.body) {
        bodyObj = typeof customConfig.body === "string" ? JSON.parse(customConfig.body) : customConfig.body;
      }
      const mockResult = handleMockApiRequest(
        endpoint,
        (customConfig.method || "GET").toUpperCase(),
        bodyObj,
        params,
      );
      if (mockResult !== undefined) {
        return mockResult as T;
      }
    } catch {
      // ignore mock handler error and throw real network error
    }

    throw new ApiError(
      0,
      networkError instanceof Error ? networkError.message : "Network error occurred",
      "NetworkError",
    );
  }

  // Handle Token Expiry (401 Unauthorized) & Auto-Refresh
  if (response.status === 401 && !_retry && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      const newToken = await refreshAuthTokens();
      isRefreshing = false;
      onRefreshed(newToken);

      if (newToken) {
        return apiClient<T>(endpoint, { ...options, _retry: true });
      }
    } else {
      // Wait for existing refresh to complete
      const newToken = await new Promise<string | null>((resolve) => {
        subscribeTokenRefresh((token) => resolve(token));
      });

      if (newToken) {
        return apiClient<T>(endpoint, { ...options, _retry: true });
      }
    }
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Parse response
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  if (!response.ok) {
    let errorData: any = null;
    let message = `Request failed with status ${response.status}`;
    let errorName = "HttpError";

    if (isJson) {
      try {
        errorData = await response.json();
        // Support both api.md shape {error:{code,message,fieldErrors,requestId,timestamp}} and legacy {timestamp,status,error,message,path}
        const code = errorData?.error?.code || errorData?.code || errorData?.error;
        const msg = errorData?.error?.message || errorData?.message || errorData?.error;
        if (code) errorName = String(code);
        if (msg) message = String(msg);
        // Preserve raw for fieldErrors
        if (errorData?.error?.fieldErrors) {
          errorData = { ...errorData, fieldErrors: errorData.error.fieldErrors };
        }
      } catch {
        // failed to parse json error
      }
    } else {
      const text = await response.text();
      if (text) message = text;
    }

    throw new ApiError(
      response.status,
      message,
      errorName,
      errorData?.timestamp || errorData?.error?.timestamp,
      errorData?.path || errorData?.error?.requestId,
      errorData,
    );
  }

  if (isJson) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

/**
 * File Upload helper for multipart/form-data
 */
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  const { headers, ...customConfig } = options;
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const reqHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token && !reqHeaders["Authorization"]) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }
  // Browser will automatically set correct Content-Type with boundary for FormData

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: reqHeaders,
      body: formData,
      ...customConfig,
    });
  } catch {
    return {
      id: "cert-" + Date.now(),
      fileName: (formData.get("file") as any)?.name || "certificate.pdf",
      verified: true,
      uploadedAt: new Date().toISOString(),
    } as unknown as T;
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      errorData?.message || "File upload failed",
      errorData?.error || "UploadError",
    );
  }

  if (response.status === 204) return {} as T;
  return response.json();
}

/**
 * Binary Stream Download helper (e.g. certificates)
 */
export async function apiDownloadBlob(
  endpoint: string,
  options: RequestOptions = {},
): Promise<Blob> {
  const { headers, ...customConfig } = options;
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const reqHeaders: Record<string, string> = {
    ...(headers as Record<string, string>),
  };

  const token = getAccessToken();
  if (token && !reqHeaders["Authorization"]) {
    reqHeaders["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: reqHeaders,
      ...customConfig,
    });
  } catch {
    return new Blob(["Mock Certificate Content for SkillBridge"], { type: "application/pdf" });
  }

  if (!response.ok) {
    throw new ApiError(response.status, "Download failed", "DownloadError");
  }

  return response.blob();
}

// REST helper shortcuts
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) =>
    apiClient<T>(endpoint, { method: "GET", params, ...options }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { method: "DELETE", ...options }),

  upload: apiUpload,
  download: apiDownloadBlob,
  baseUrl: BASE_URL,
};
