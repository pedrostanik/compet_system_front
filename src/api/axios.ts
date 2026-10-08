import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { Session } from '@/types';

// The access token lives only in memory: it is gone on reload and restored from the
// httpOnly refresh cookie, which JavaScript cannot read. Never store it in localStorage.
let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

interface SessionEvents {
  onSession: (session: Session) => void;
  onSessionExpired: () => void;
  onPasswordChangeRequired: () => void;
}

let events: SessionEvents = {
  onSession: () => {},
  onSessionExpired: () => {},
  onPasswordChangeRequired: () => {},
};

/** Called by AuthProvider, so the API layer can update the logged-in user. */
export function setSessionEvents(handlers: SessionEvents) {
  events = handlers;
}

const baseURL = import.meta.env.VITE_API_URL;

// withCredentials: send the refresh cookie (needed in dev, where web and API use different ports).
const api = axios.create({ baseURL, withCredentials: true });

// Plain client for /api/auth/refresh, without the interceptors below (no refresh loops).
const authClient = axios.create({ baseURL, withCredentials: true });

let refreshing: Promise<Session | null> | null = null;

/** Gets a new access token from the refresh cookie. Parallel callers share one request. */
export function refreshSession(): Promise<Session | null> {
  if (!refreshing) {
    refreshing = authClient
      .post<Session>('/api/auth/refresh')
      .then(r => {
        accessToken = r.data.accessToken;
        events.onSession(r.data);
        return r.data;
      })
      .catch(() => {
        accessToken = null;
        return null;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

api.interceptors.request.use(config => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isAuthCall = original?.url?.startsWith('/api/auth/');

    // Access token expired (15 min): refresh once and replay the request, invisibly to the user.
    if (status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      const session = await refreshSession();
      if (session) {
        return api(original);
      }
      events.onSessionExpired();
    }

    const code = (error.response?.data as { code?: string } | undefined)?.code;
    if (status === 403 && code === 'PASSWORD_CHANGE_REQUIRED') {
      events.onPasswordChangeRequired();
    }
    return Promise.reject(error);
  }
);

export default api;
