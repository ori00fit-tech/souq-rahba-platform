import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadCurrentAdmin() {
      const token = localStorage.getItem("admin_auth_token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await apiGet("/auth/me");

        if (res.ok && res.data?.role === "admin") {
          setCurrentAdmin(res.data);
        } else {
          localStorage.removeItem("admin_auth_token");
          setCurrentAdmin(null);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("admin_auth_token");
        setCurrentAdmin(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadCurrentAdmin();
  }, []);

  async function loginAdmin(email, password) {
    const result = await apiPost("/auth/login", { email, password });

    if (!result.ok || result.data?.user?.role !== "admin") {
      throw new Error("Admin access required");
    }

    localStorage.setItem("admin_auth_token", result.data.token);

    const me = await apiGet("/auth/me");

    if (me.ok && me.data?.role === "admin") {
      setCurrentAdmin(me.data);
    } else {
      localStorage.removeItem("admin_auth_token");
      throw new Error("Admin access required");
    }

    return result;
  }

  function logoutAdmin() {
    localStorage.removeItem("admin_auth_token");
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
  return useContext(AdminAuthContext);
}
