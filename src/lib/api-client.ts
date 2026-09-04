import type { AuthResponse } from "@/types/api";
import {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  getAuthRevision,
  saveSession,
} from "./auth-session";
export {
  clearAuth,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  STORAGE_KEYS,
} from "./auth-session";

const BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  (import.meta.env.DEV && typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:9095");

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public error = "ApiError",
    public timestamp?: string,
    public path?: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  idempotencyKey?: string;
  _retry?: boolean;
  timeoutMs?: number;
}

async function fetchWithTimeout(url: string, config: RequestInit, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const abort = () => controller.abort();
  config.signal?.addEventListener("abort", abort, { once: true });
  if (config.signal?.aborted) controller.abort();
  try {
    return await fetch(url, { ...config, signal: controller.signal });
  } catch (error) {
    throw new ApiError(
      0,
      controller.signal.aborted
        ? "The request timed out or was cancelled. Please try again."
        : "Cannot connect to the server. Check your connection and try again.",
      "NetworkError",
      undefined,
      undefined,
      error,
    );
  } finally {
    clearTimeout(timeout);
    config.signal?.removeEventListener("abort", abort);
  }
}

async function responseError(response: Response): Promise<ApiError> {
  // Spring uses application/problem+json for validation and auth failures.
  const data = await response.json().catch(() => null);
  return new ApiError(
    response.status,
    data?.error?.message ||
      data?.detail ||
      data?.message ||
      "Request failed (" + response.status + ").",
    data?.error?.code || data?.code || "HttpError",
    data?.timestamp,
    data?.path,
    data?.error?.fieldErrors ? { ...data, fieldErrors: data.error.fieldErrors } : data,
  );
}

let refreshInFlight: { token: string; revision: number; promise: Promise<string | null> } | null =
  null;
export function refreshAuthTokens(): Promise<string | null> {
  const token = getRefreshToken();
  const revision = getAuthRevision();
  if (!token) {
    clearAuth();
    return Promise.resolve(null);
  }
  if (refreshInFlight?.token === token && refreshInFlight.revision === revision)
    return refreshInFlight.promise;
  const promise = (async () => {
    const response = await fetchWithTimeout(BASE_URL + "/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: token }),
    });
    // Logout or a different login invalidates any in-flight refresh response.
    if (revision !== getAuthRevision() || token !== getRefreshToken()) return null;
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        clearAuth();
        return null;
      }
      throw await responseError(response);
    }
    const session: AuthResponse = await response.json();
    if (revision !== getAuthRevision() || token !== getRefreshToken()) return null;
    try {
      saveSession(session);
    } catch (error) {
      clearAuth();
      throw error;
    }
    return session.accessToken;
  })();
  refreshInFlight = { token, revision, promise };
  void promise
    .finally(() => {
      if (refreshInFlight?.promise === promise) refreshInFlight = null;
    })
    .catch(() => {});
  return promise;
}

async function request(endpoint: string, options: RequestOptions): Promise<Response> {
  const { params, headers, _retry, idempotencyKey, timeoutMs, ...config } = options;
  const url = new URL(endpoint, BASE_URL);
  if (params)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "")
        url.searchParams.set(key, String(value));
    });
  // Public auth calls never receive a stale bearer token or an automatic retry.
  const isAuth = url.pathname.startsWith("/api/v1/auth/");
  const reqHeaders = new Headers(headers);
  if (!(config.body instanceof FormData) && !reqHeaders.has("Content-Type"))
    reqHeaders.set("Content-Type", "application/json");
  if (idempotencyKey) reqHeaders.set("Idempotency-Key", idempotencyKey);
  const token = getAccessToken();
  const revision = getAuthRevision();
  if (!isAuth && token && !reqHeaders.has("Authorization"))
    reqHeaders.set("Authorization", "Bearer " + token);
  const response = await fetchWithTimeout(
    url.toString(),
    { ...config, headers: reqHeaders },
    timeoutMs,
  );
  if (!isAuth && response.status === 401 && revision === getAuthRevision()) {
    if (!_retry && getRefreshToken()) {
      const newToken = await refreshAuthTokens();
      if (newToken) {
        const retryHeaders = new Headers(headers);
        retryHeaders.set("Authorization", "Bearer " + newToken);
        return request(endpoint, { ...options, headers: retryHeaders, _retry: true });
      }
    }
    if (revision === getAuthRevision()) clearAuth();
  }
  if (!response.ok) throw await responseError(response);
  return response;
}

export async function apiClient<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const response = await request(endpoint, options);
  if (response.status === 204) return undefined as T;
  return response.headers.get("content-type")?.includes("json")
    ? response.json()
    : (response.text() as Promise<T>);
}
export async function apiUpload<T>(
  endpoint: string,
  formData: FormData,
  options: Omit<RequestOptions, "body"> = {},
): Promise<T> {
  return apiClient<T>(endpoint, { method: "POST", ...options, body: formData });
}
export async function apiDownloadBlob(
  endpoint: string,
  options: RequestOptions = {},
): Promise<Blob> {
  return (await request(endpoint, { method: "GET", ...options })).blob();
}
export const api = {
  get: <T>(endpoint: string, params?: object, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "GET",
      params: params as RequestOptions["params"],
      ...options,
    }),
  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    }),
  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    }),
  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
      ...options,
    }),
  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { method: "DELETE", ...options }),
  upload: apiUpload,
  download: apiDownloadBlob,
  baseUrl: BASE_URL,
};
