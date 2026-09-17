import { api, setAuthToken } from "./client";

export async function login(identifier, password) {
  const data = await api.post("/auth/login", { identifier, password }, { auth: false });
  setAuthToken(data.token);
  return data; // { token, role, user }
}

export function logout() {
  setAuthToken(null);
}

export function fetchMe() {
  return api.get("/auth/me");
}

export function changePassword(newPassword) {
  return api.post("/auth/change-password", { newPassword });
}
