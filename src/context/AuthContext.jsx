import { createContext, useState, useEffect } from "react";
import { getToken, clearToken, setToken } from "../components/utils/storage";
import { getProfile } from "../components/services/requests";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on refresh
  useEffect(() => {
    async function fetchUser() {
      if (getToken()) {
        try {
          const profile = await getProfile(); // ✅ backend profile always has role
          setUser(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          clearToken();
          setUser(null);
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const login = (data) => {
    // data = { access, refresh, user: {id, username, email} }
    setToken(data.access);
    if (data.refresh) localStorage.setItem("refresh", data.refresh);
    setUser(data.user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  if (loading) {
    return <p>Loading...</p>; // or a spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
