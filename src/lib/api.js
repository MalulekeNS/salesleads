const API_BASE_URL = "http://localhost:8081";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
}
