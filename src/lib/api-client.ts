import { useAuthStore } from "@/store/auth-store";

/**
 * Per postman_collection.json's `base_url` variable. SRS.md/API_CONTRACT.md say
 * `/api/v1` — unconfirmed against the real server (INTEGRATION_PLAN.md §4, open
 * question 2). Override with NEXT_PUBLIC_API_BASE_URL once that's settled.
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
 * Shared fetch wrapper: base URL, JSON body/headers, bearer token, and error-envelope
 * parsing. No request/response casing conversion needed — entity fields are
 * snake_case on both sides since Sprint I0 (SPRINT_I0_PROMPT.md).
 */
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

  return payload as T;
}

type UploadResponse = { url: string };

/**
 * POST /uploads (multipart/form-data) — SRS.md §8.9's suggested `{ url }` response is
 * assumed, unconfirmed against the real server. `dataUrl` is the output of
 * `compressImage` (lib/image.ts); this converts it back to a Blob for the multipart body.
 */
export async function apiUpload(dataUrl: string, filename = "upload.jpg"): Promise<UploadResponse> {
  const blob = await (await fetch(dataUrl)).blob();
  const formData = new FormData();
  formData.append("file", blob, filename);

  const requestHeaders = new Headers();
  requestHeaders.set("Accept", "application/json");
  const token = useAuthStore.getState().token;
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${getBaseUrl()}/uploads`, {
    method: "POST",
    headers: requestHeaders,
    body: formData,
  });

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiError(response.status, payload?.message ?? "Upload failed.", payload?.errors);
  }

  return payload as UploadResponse;
}
