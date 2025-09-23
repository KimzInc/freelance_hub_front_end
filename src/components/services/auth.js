import api from "./api";

export async function loginUser(credentials) {
  const res = await api.post("/login/", credentials);
  return res.data;
}

export async function registerUser(credentials) {
  const res = await api.post("/register/", credentials);
  return res.data;
}

export async function verifyEmail(token) {
  const res = await api.get(`/verify-email/${token}/`);
  return res.data;
}

export async function resendVerificationEmail(email) {
  const res = await api.post("/resend-verification/", { email });
  return res.data;
}
