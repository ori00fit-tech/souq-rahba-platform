const API_BASE_URL = "https://souq-rahba-api.ori00fit.workers.dev";

export async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}
