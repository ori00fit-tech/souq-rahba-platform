import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "@rahba/shared";

const AdminAuthContext = createContext(null);
const AUTH_TOKEN_KEY = "auth_token";

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

        if (res?.ok && res.data?.role === "admin") {
          if (mounted) {
            setCurrentAdmin(res.data);
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

      if (!result?.ok || !result?.data?.token) {
        setCurrentAdmin(null);
        throw new Error("Admin access required");
      }

      if (result?.data?.user?.role !== "admin") {
        setCurrentAdmin(null);
        throw new Error("Admin access required");
      }

      setStoredAdminToken(result.data.token);

      const me = await apiGet("/auth/me");

      if (me?.ok && me.data?.role === "admin") {
        setCurrentAdmin(me.data);
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
