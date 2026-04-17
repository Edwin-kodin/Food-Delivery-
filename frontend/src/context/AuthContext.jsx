import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch, getStoredToken, setStoredToken } from "../api/client";

export const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    const token = getStoredToken();
    setStoredToken(null);
    setUser(null);
    if (token) {
      apiFetch("/logout", { method: "POST", token }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setReady(true);
      return;
    }
    apiFetch("/user")
      .then((json) => setUser(json.user))
      .catch(() => {
        setStoredToken(null);
        setUser(null);
      })
      .finally(() => setReady(true));
  }, []);

  const login = async (email, password) => {
    const json = await apiFetch("/login", {
      method: "POST",
      body: { email, password },
      token: "",
    });
    setStoredToken(json.token);
    setUser(json.user);
    return json;
  };

  const register = async (name, email, password) => {
    const json = await apiFetch("/register", {
      method: "POST",
      body: { name, email, password },
      token: "",
    });
    setStoredToken(json.token);
    setUser(json.user);
    return json;
  };

  const value = {
    user,
    ready,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
