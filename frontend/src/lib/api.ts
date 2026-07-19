/**
 * REST API client for the Tinubu Support Bauchi 2027 backend.
 *
 * Base URL is configured via VITE_API_URL (default: http://localhost:8080).
 * All requests attach the JWT stored in localStorage as `tsb_token` when present.
 * Responses follow the envelope: { success, data } or { success:false, message, errors }.
 */

const RAW_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8080";
export const API_BASE = RAW_BASE.replace(/\/$/, "");
const API_ROOT = `${API_BASE}/api`;

const TOKEN_KEY = "tsb_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem(TOKEN_KEY, token);
    else window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export class ApiError extends Error {
  status: number;
  errors?: { field?: string; message: string }[];
  constructor(message: string, status: number, errors?: { field?: string; message: string }[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

type Query = Record<string, string | number | boolean | undefined | null>;

function buildUrl(path: string, query?: Query): string {
  const url = new URL(`${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

async function parseEnvelope<T>(res: Response): Promise<T> {
  // PDF or non-JSON downloads: return the raw response body as a Blob under `data`.
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) throw new ApiError(`Request failed (${res.status})`, res.status);
    // The caller decides — for JSON endpoints we parse below.
    return (await res.blob()) as unknown as T;
  }
  const body = await res.json().catch(() => null);
  if (!res.ok || (body && body.success === false)) {
    const message = body?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, body?.errors);
  }
  return (body?.data ?? body) as T;
}

interface RequestOptions {
  query?: Query;
  body?: unknown;
  formData?: FormData;
  auth?: boolean;
  signal?: AbortSignal;
  raw?: boolean; // return the Response (for downloads)
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token && opts.auth !== false) headers["Authorization"] = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (opts.formData) {
    body = opts.formData;
  } else if (opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.body);
  }

  const res = await fetch(buildUrl(path, opts.query), {
    method,
    headers,
    body,
    signal: opts.signal,
    credentials: "include",
  });

  if (opts.raw) return res as unknown as T;
  return parseEnvelope<T>(res);
}

export const http = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T>(path: string, opts?: RequestOptions) => request<T>("POST", path, opts),
  put: <T>(path: string, opts?: RequestOptions) => request<T>("PUT", path, opts),
  del: <T>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
};

/* -------------------------------------------------------------------------- */
/* Typed convenience wrappers per API section                                 */
/* -------------------------------------------------------------------------- */

export type Role =
  | "super_admin"
  | "admin"
  | "membership_officer"
  | "corporate_officer"
  | "editor"
  | "member"
  | "corporate_user";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  roles?: Role[];
  created_at?: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export const authApi = {
  register: (payload: { name: string; email: string; phone?: string; password: string; role?: Role }) =>
    http.post<LoginResponse>("/auth/register", { body: payload, auth: false }),
  login: (payload: { email: string; password: string }) =>
    http.post<LoginResponse>("/auth/login", { body: payload, auth: false }),
  logout: () => http.post<{ ok: true }>("/auth/logout"),
  me: () => http.get<AuthUser>("/auth/me"),
  updateMe: (payload: { name?: string; phone?: string; password?: string }) =>
    http.put<AuthUser>("/auth/me", { body: payload }),
  forgotPassword: (email: string) =>
    http.post<{ ok: true }>("/auth/forgot-password", { body: { email }, auth: false }),
  resetPassword: (token: string, password: string) =>
    http.post<{ ok: true }>("/auth/reset-password", { body: { token, password }, auth: false }),
};

/* --- Members ------------------------------------------------------------- */
export const membersApi = {
  register: (form: FormData) => http.post<any>("/members/register", { formData: form, auth: false }),
  profile: () => http.get<any>("/members/profile"),
  updateProfile: (form: FormData) => http.put<any>("/members/profile", { formData: form }),
  cardUrl: () => `${API_ROOT}/members/card`,
  downloadCard: () => http.get<Blob>("/members/card", { raw: false }),
  verify: (membershipNumber: string) =>
    http.get<any>(`/members/verify/${encodeURIComponent(membershipNumber)}`, { auth: false }),
};

/* --- Corporate ----------------------------------------------------------- */
export const corporateApi = {
  register: (form: FormData) => http.post<any>("/corporate/register", { formData: form, auth: false }),
  profile: () => http.get<any>("/corporate/profile"),
  updateProfile: (form: FormData) => http.put<any>("/corporate/profile", { formData: form }),
  certificateUrl: () => `${API_ROOT}/corporate/certificate`,
};

/* --- Blog ---------------------------------------------------------------- */
export interface BlogListResponse {
  posts?: any[];
  items?: any[];
  data?: any[];
  meta?: { total?: number; page?: number; limit?: number };
}
export const blogApi = {
  list: (query?: Query) => http.get<BlogListResponse | any[]>("/blog", { auth: false, query }),
  categories: () => http.get<any[]>("/blog/categories", { auth: false }),
  bySlug: (slug: string) => http.get<any>(`/blog/${encodeURIComponent(slug)}`, { auth: false }),
  adminList: () => http.get<any[]>("/blog/admin/list"),
  create: (form: FormData) => http.post<any>("/blog", { formData: form }),
  createCategory: (payload: { name: string; slug?: string }) =>
    http.post<any>("/blog/categories", { body: payload }),
  update: (id: string, form: FormData) => http.put<any>(`/blog/${id}`, { formData: form }),
  delete: (id: string) => http.del<any>(`/blog/${id}`),
};

/* --- Events -------------------------------------------------------------- */
export const eventsApi = {
  list: (query?: Query) => http.get<any>("/events", { auth: false, query }),
  bySlug: (slug: string) => http.get<any>(`/events/${encodeURIComponent(slug)}`, { auth: false }),
  adminList: () => http.get<any[]>("/events/admin/list"),
  create: (form: FormData) => http.post<any>("/events", { formData: form }),
  update: (id: string, form: FormData) => http.put<any>(`/events/${id}`, { formData: form }),
  delete: (id: string) => http.del<any>(`/events/${id}`),
};

/* --- Leadership ---------------------------------------------------------- */
export const leadershipApi = {
  list: () => http.get<any[]>("/leadership", { auth: false }),
  adminList: () => http.get<any[]>("/leadership/admin/list"),
  create: (form: FormData) => http.post<any>("/leadership", { formData: form }),
  update: (id: string, form: FormData) => http.put<any>(`/leadership/${id}`, { formData: form }),
  delete: (id: string) => http.del<any>(`/leadership/${id}`),
};

/* --- Contact ------------------------------------------------------------- */
export const contactApi = {
  send: (payload: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    http.post<any>("/contact", { body: payload, auth: false }),
};

/* --- Newsletter ---------------------------------------------------------- */
export const newsletterApi = {
  subscribe: (email: string) => http.post<any>("/newsletter/subscribe", { body: { email }, auth: false }),
  unsubscribe: (token: string) => http.get<any>("/newsletter/unsubscribe", { query: { token }, auth: false }),
};

/* --- Notifications ------------------------------------------------------- */
export const notificationsApi = {
  list: (query?: Query) => http.get<any>("/notifications", { query }),
  readAll: () => http.put<any>("/notifications/read-all"),
  read: (id: string) => http.put<any>(`/notifications/${id}/read`),
  delete: (id: string) => http.del<any>(`/notifications/${id}`),
};

/* --- Admin --------------------------------------------------------------- */
export const adminApi = {
  dashboard: () => http.get<any>("/admin/dashboard"),
  members: (query?: Query) => http.get<any>("/admin/members", { query }),
  member: (id: string) => http.get<any>(`/admin/members/${id}`),
  approveMember: (id: string) => http.put<any>(`/admin/members/${id}/approve`),
  rejectMember: (id: string) => http.put<any>(`/admin/members/${id}/reject`),
  suspendMember: (id: string) => http.put<any>(`/admin/members/${id}/suspend`),
  corporates: (query?: Query) => http.get<any>("/admin/corporates", { query }),
  corporate: (id: string) => http.get<any>(`/admin/corporates/${id}`),
  approveCorporate: (id: string) => http.put<any>(`/admin/corporates/${id}/approve`),
  rejectCorporate: (id: string) => http.put<any>(`/admin/corporates/${id}/reject`),
  messages: (query?: Query) => http.get<any>("/admin/messages", { query }),
  updateMessage: (id: string, payload: { is_read?: boolean }) =>
    http.put<any>(`/admin/messages/${id}`, { body: payload }),
  deleteMessage: (id: string) => http.del<any>(`/admin/messages/${id}`),
  subscribers: (query?: Query) => http.get<any>("/admin/subscribers", { query }),
  deleteSubscriber: (id: string) => http.del<any>(`/admin/subscribers/${id}`),
  users: (query?: Query) => http.get<any>("/admin/users", { query }),
  updateUser: (id: string, payload: Record<string, unknown>) =>
    http.put<any>(`/admin/users/${id}`, { body: payload }),
  createNotification: (payload: Record<string, unknown>) =>
    http.post<any>("/admin/notifications", { body: payload }),
  logs: (query?: Query) => http.get<any>("/admin/logs", { query }),
};

/** Extract a list from responses shaped as either `T[]` or `{items|data|posts: T[]}` */
export function toList<T = any>(res: any): T[] {
  if (Array.isArray(res)) return res as T[];
  if (Array.isArray(res?.items)) return res.items;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.posts)) return res.posts;
  if (Array.isArray(res?.events)) return res.events;
  if (Array.isArray(res?.results)) return res.results;
  return [];
}
