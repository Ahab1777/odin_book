const API_URL = import.meta.env.VITE_API_URL as string | undefined;

if (!API_URL) {
  // Fail fast in development if the base URL is missing
  // (Vite will inline env vars at build time).
  console.warn("VITE_API_URL is not defined; API requests will fail.");
}

function getJwtToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("jwtToken");
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(
  path: string,
  method: HttpMethod = "GET",
  options: RequestOptions = {},
): Promise<T> {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  //Correct slashes
  const url =
    API_URL.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`);

const headers = new Headers({
  "Content-Type": "application/json",
  ...(options.headers instanceof Headers ? {} : options.headers),
});

const token = getJwtToken();
if (token) {
  headers.set("Authorization", `Bearer ${token}`);
}

  const init: RequestInit = {
    ...options,
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  };

  const response = await fetch(url, init);

  let data: unknown;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON responses fall back to plain text
      data = text;
    }
  }

  if (!response.ok) {
    type ErrorBody = { message?: unknown };

    let message: string;

    if (data && typeof data === "object") {
      const body = data as ErrorBody;
      if (typeof body.message === "string") {
        message = body.message;
      } else {
        message = response.statusText || "Request failed";
      }
    } else {
      message = response.statusText || "Request failed";
    }

    const error = new Error(message) as Error & {
      status?: number;
      data?: unknown;
    };
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

// Convenience wrappers
export const api = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, "GET", options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "POST", { ...options, body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "PUT", { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "PATCH", { ...options, body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, "DELETE", options),
};
