const TOKEN_KEY = "food_del_token";

/**
 * Empty VITE_API_URL during `npm run dev` uses same-origin `/api` (Vite proxy).
 * In production builds, set VITE_API_URL to your public API base URL.
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw === "" || raw === undefined || raw === null) {
    return "";
  }
  return String(raw).replace(/\/$/, "");
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function errorMessage(data, status) {
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0];
    if (first) return first;
  }
  if (typeof data?.message === "string") return data.message;
  return `Request failed (${status})`;
}

export async function apiFetch(path, options = {}) {
  const { token: tokenOption, ...fetchOptions } = options;
  const base = getApiBase();
  const apiPath = path.startsWith("/") ? path : `/${path}`;
  const url = base ? `${base}/api${apiPath}` : `/api${apiPath}`;
  const headers = { Accept: "application/json", ...fetchOptions.headers };

  if (
    fetchOptions.body &&
    typeof fetchOptions.body === "object" &&
    !(fetchOptions.body instanceof FormData)
  ) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const hasTokenOption = Object.prototype.hasOwnProperty.call(options, "token");
  const token = hasTokenOption ? tokenOption : getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...fetchOptions, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(errorMessage(data, res.status));
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
