const authService = (function () {
  const API_BASE_URL = "/api/auth";

  async function handleResponse(response) {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Unknown error");
    }
    return response.json();
  }

  async function login(username, password) {
    const res = await fetch(`${API_BASE_URL}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });
    return handleResponse(res);
  }

  async function signup(username, email, password) {
    const res = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, email, password }),
    });
    return handleResponse(res);
  }

  async function logout() {
    const res = await fetch(`${API_BASE_URL}/signout`, {
      method: "POST",
      credentials: "include",
    });
    return handleResponse(res);
  }

  async function checkAuth() {
    const res = await fetch(`${API_BASE_URL}/me`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  }

  return { login, signup, logout, checkAuth };
})();
