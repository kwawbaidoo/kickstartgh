import { useAuthStore } from "@/store/auth-store";

/**
 * Confirmed live 2026-08-15 against the real server (register/login/me/teams all
 * tested directly) — see BACKEND_INTEGRATION_TRACKER.md's Sprint I1 section.
 */
const DEFAULT_BASE_URL = "https://api.kickstartgh.com/api";
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_BASE_URL;
}

export type ApiFieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  status: number;
  errors?: ApiFieldErrors;

  constructor(status: number, message: string, errors?: ApiFieldErrors) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/** Maps the {message, errors} envelope (SRS.md §2.1) onto react-hook-form's setError. */
export function applyApiErrors(
  error: unknown,
  setError: (field: string, error: { message: string }) => void,
  fallbackField = "root"
) {
  if (!(error instanceof ApiError)) {
    setError(fallbackField, { message: "Something went wrong. Please try again." });
    return;
  }
  if (error.errors && Object.keys(error.errors).length > 0) {
    for (const [field, messages] of Object.entries(error.errors)) {
      if (messages[0]) setError(field, { message: messages[0] });
    }
    return;
  }
  setError(fallbackField, { message: error.message });
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
};

/**
 * Every success response is wrapped as `{status, message, data}` — confirmed live
 * 2026-08-15 across register/login/me/teams, not just documented, so this unwrap is
 * safe to do unconditionally. Falls back to the raw payload for the rare endpoint that
 * doesn't use the envelope (e.g. logout's `data` is `null`, which is fine — callers of
 * a `void`-returning apiFetch don't look at the return value anyway).
 *
 * Casing is NOT symmetric, and apiFetch does NOT auto-convert it: request bodies are
 * snake_case (confirmed accepted as-is — matches Sprint I0's frontend types with zero
 * translation), but response `data` payloads are camelCase (confirmed, contradicting
 * Sprint I0's original assumption that this API was snake_case both ways — it isn't).
 * Each store maps its own response fields explicitly at the call site instead of a
 * blanket converter here, because two confirmed domains (report rows/columns,
 * `/me/notifications`) are deliberately camelCase in the frontend too, matching real
 * backend behavior — a generic converter would need to special-case those anyway, so
 * explicit per-domain mapping is more robust than a "convert everything except..." rule.
 */
function unwrapEnvelope(payload: unknown): unknown {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: unknown }).data;
  }
  return payload;
}

/** Shared fetch wrapper: base URL, JSON body/headers, bearer token, error parsing, envelope unwrap. */
export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Content-Type", "application/json");
  requestHeaders.set("Accept", "application/json");

  if (auth) {
    const token = useAuthStore.getState().token;
    if (token) requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${getBaseUrl()}${path}`, {
    ...rest,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.message ?? "Request failed.",
      payload?.errors
    );
  }

  return unwrapEnvelope(payload) as T;
}

/**
 * Multipart POST. Deliberately does NOT set Content-Type — the browser has to add the
 * multipart boundary itself. Same auth, error-envelope and unwrap behaviour as
 * `apiFetch`, so `applyApiErrors` works on failures from here too.
 */
export async function apiPostForm<T>(path: string, formData: FormData): Promise<T> {
  const requestHeaders = new Headers();
  requestHeaders.set("Accept", "application/json");
  const token = useAuthStore.getState().token;
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers: requestHeaders,
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Upload failed.", payload?.errors);
  }

  return unwrapEnvelope(payload) as T;
}

type UploadResponse = { url: string };

/**
 * POST /uploads (multipart/form-data) — SRS.md §8.9's suggested `{ url }` response
 * shape is still unconfirmed against the real server (not covered by the live test
 * that confirmed register/login/me/teams). `dataUrl` is the output of `compressImage`
 * (lib/image.ts); this converts it back to a Blob for the multipart body.
 */
export async function apiUpload(dataUrl: string, filename = "upload.jpg"): Promise<UploadResponse> {
  const blob = await (await fetch(dataUrl)).blob();
  const formData = new FormData();
  formData.append("file", blob, filename);
  return apiPostForm<UploadResponse>("/uploads", formData);
}
