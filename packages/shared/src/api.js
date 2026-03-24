const DEFAULT_API_BASE_URL =
  typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL
    : "";

const DEFAULT_TOKEN_KEY = "auth_token";

function readToken(tokenKey = DEFAULT_TOKEN_KEY) {
  try {
    return localStorage.getItem(tokenKey) || "";
  } catch {
    return "";
  }
}

function buildHeaders(extra = {}, withJson = true, tokenKey = DEFAULT_TOKEN_KEY) {
  const token = readToken(tokenKey);
  return {
    ...(withJson ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function parseResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload?.message ||
      payload?.error ||
      `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.payload = payload;
    throw err;
  }

  return payload;
}

async function request(path, options = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
  const tokenKey = options.tokenKey ?? DEFAULT_TOKEN_KEY;
  const headers = buildHeaders(options.headers || {}, options.withJson !== false, tokenKey);

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

export function apiGet(path, options = {}) {
  return request(path, {
    ...options,
    method: "GET",
  });
}

export function apiPost(path, payload, options = {}) {
  return request(path, {
    ...options,
    method: "POST",
    body: JSON.stringify(payload ?? {}),
  });
}

export function apiPut(path, payload, options = {}) {
  return request(path, {
    ...options,
    method: "PUT",
    body: JSON.stringify(payload ?? {}),
  });
}

export function apiPatch(path, payload, options = {}) {
  return request(path, {
    ...options,
    method: "PATCH",
    body: JSON.stringify(payload ?? {}),
  });
}

export function apiDelete(path, options = {}) {
  return request(path, {
    ...options,
    method: "DELETE",
  });
}

export async function apiUpload(path, formData, options = {}) {
  const baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
  const tokenKey = options.tokenKey ?? DEFAULT_TOKEN_KEY;
  const token = readToken(tokenKey);

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    method: options.method || "POST",
    body: formData,
    headers,
  });

  return parseResponse(response);
}

export const apiUploadFile = apiUpload;
