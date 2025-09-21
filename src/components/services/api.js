import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

let isRefreshing = false;
let queue = [];

const subscribe = (cb) => queue.push(cb);
const flush = (token) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

// Add request interceptor to attach Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (!response) return Promise.reject(error);

    // Don't retry if it's already a retry request or not a 401 error
    if (response.status !== 401 || config.__isRetryRequest) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh) {
      localStorage.removeItem("access");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Check if we're already refreshing the token
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribe((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(api({ ...config, __isRetryRequest: true }));
        });
      });
    }

    isRefreshing = true;
    try {
      const r = await axios.post(
        `${process.env.REACT_APP_API_URL}/token/refresh/`,
        { refresh }
      );
      const newAccess = r.data.access;
      localStorage.setItem("access", newAccess);
      isRefreshing = false;
      flush(newAccess);
      config.headers.Authorization = `Bearer ${newAccess}`;
      return api({ ...config, __isRetryRequest: true });
    } catch (e) {
      isRefreshing = false;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");

      // Only show toast and redirect if it's not a login request
      if (
        !config.url.includes("/login/") &&
        !config.url.includes("/token/refresh/")
      ) {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }

      return Promise.reject(e);
    }
  }
);

export default api;
