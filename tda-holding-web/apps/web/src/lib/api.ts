const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

/**
 * Initialise le cookie CSRF Sanctum SPA avant toute mutation.
 * À appeler une seule fois par session (ex: dans AuthProvider au montage).
 */
export async function initCsrf(): Promise<void> {
  await fetch(`${API_URL}/sanctum/csrf-cookie`, {
    credentials: "include",
  });
}

/**
 * Wrapper fetch configuré pour Sanctum SPA :
 * - credentials: "include" (cookies httpOnly)
 * - X-XSRF-TOKEN extrait du cookie XSRF-TOKEN
 * - Accept: application/json
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const xsrfToken = getCookie("XSRF-TOKEN");

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message ?? "Erreur API");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const token = parts[1]?.split(";").shift();
    // XSRF-TOKEN is URL-encoded by Sanctum, decode it
    return token ? decodeURIComponent(token) : undefined;
  }
  return undefined;
}
