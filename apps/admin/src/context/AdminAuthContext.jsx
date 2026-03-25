import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

const AdminAuthContext = createContext(null);
const AUTH_TOKEN_KEY = "admin_auth_token";

function getStoredAdminToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setStoredAdminToken(token) {
  try {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentAdmin() {
      const token = getStoredAdminToken();

      if (!token) {
        if (mounted) {
          setCurrentAdmin(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const res = await apiGet("/auth/me");
        const user = res?.data?.user;

        if (res?.ok && user?.role === "admin") {
          if (mounted) {
            setCurrentAdmin(user);
          }
        } else {
          setStoredAdminToken("");
          if (mounted) {
            setCurrentAdmin(null);
          }
        }
      } catch (err) {
        console.error("loadCurrentAdmin failed:", err);
        setStoredAdminToken("");
        if (mounted) {
          setCurrentAdmin(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    loadCurrentAdmin();

    return () => {
      mounted = false;
    };
  }, []);

  async function loginAdmin(email, password) {
    try {
      setAuthLoading(true);

      const result = await apiPost("/auth/login", { email, password });
      const token = result?.data?.token;
      const user = result?.data?.user;

      if (!result?.ok || !token || !user) {
        setCurrentAdmin(null);
        throw new Error(result?.error?.message || "Admin access required");
      }

      if (user.role !== "admin") {
        setCurrentAdmin(null);
        throw new Error("Admin access required");
      }

      setStoredAdminToken(token);

      const me = await apiGet("/auth/me");
      const meUser = me?.data?.user;

      if (me?.ok && meUser?.role === "admin") {
        setCurrentAdmin(meUser);
        return result;
      }

      setStoredAdminToken("");
      setCurrentAdmin(null);
      throw new Error("Admin access required");
    } catch (err) {
      setStoredAdminToken("");
      setCurrentAdmin(null);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }

  function logoutAdmin() {
    setStoredAdminToken("");
    setCurrentAdmin(null);
  }

  return (
    <AdminAuthContext.Provider
      value={{
        currentAdmin,
        authLoading,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }

  return context;
}
