import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access");
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

let isRefreshing = false;
let queue = [];

const subscribe = (cb) => queue.push(cb);
const flush = (token) => {
  queue.forEach((cb) => cb(token));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error;
    if (!response) return Promise.reject(error);
    if (response.status !== 401 || config.__isRetryRequest) {
      return Promise.reject(error);
    }

    const refresh = localStorage.getItem("refresh");
    if (!refresh) return Promise.reject(error);

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
      return Promise.reject(e);
    }
  }
);

export default api;
