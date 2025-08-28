import api from "./api";

export async function loginUser(credentials) {
  const res = await api.post("/login/", credentials);
  return res.data;
}

export async function registerUser(credentials) {
  const res = await api.post("/register/", credentials);
  return res.data;
}
