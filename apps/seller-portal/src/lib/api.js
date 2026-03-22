import { API_BASE_URL } from "./config";

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem("seller_auth_token");

  return {
    Accept: "application/json",
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || `Request failed: ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: getAuthHeaders(options.headers || {})
  });

  return parseResponse(response);
}

export async function apiGet(path, headers = {}) {
  return request(path, {
    method: "GET",
    headers
  });
}

export async function apiPost(path, payload = {}, headers = {}) {
  return request(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

export async function apiPut(path, payload = {}, headers = {}) {
  return request(path, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

export async function apiPatch(path, payload = {}, headers = {}) {
  return request(path, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...headers
    },
    body: JSON.stringify(payload)
  });
}

export async function apiDelete(path, headers = {}) {
  return request(path, {
    method: "DELETE",
    headers
  });
}

export async function apiUploadFile(file, extraFields = {}) {
  const formData = new FormData();
  formData.append("file", file);

  Object.entries(extraFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  });

  return parseResponse(response);
}

export function getApiBaseUrl() {
  return API_BASE_URL;
}
