import { API_BASE_URL } from "./config";

function getAuthHeaders(extra = {}) {
  const token = localStorage.getItem("seller_auth_token");

  return {
    ...extra,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed: ${response.status}`);
  }

  return data;
}

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: getAuthHeaders()
  });

  return parseResponse(response);
}

export async function apiPost(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function apiPut(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function apiPatch(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers: getAuthHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(payload)
  });

  return parseResponse(response);
}

export async function apiDelete(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });

  return parseResponse(response);
}

export async function apiUploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  });

  return parseResponse(response);
}
