import { createContext, useState, useEffect } from "react";
import { getToken, clearToken } from "../components/utils/storage";
import { getProfile } from "../components/services/requests";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      if (getToken()) {
        try {
          const profile = await getProfile(); // fetch from backend
          setUser(profile); // example: { username, email }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          clearToken(); // invalid/expired token → logout
          setUser(null);
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const login = (user, token) => {
    localStorage.setItem("access", token);
    setUser(user);
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  if (loading) {
    return <p>Loading...</p>; // optional: splash screen/spinner
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
