import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@rahba/shared";

const SellerAuthContext = createContext(null);
const AUTH_TOKEN_KEY = "auth_token";

function getStoredSellerToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setStoredSellerToken(token) {
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

export function SellerAuthProvider({ children }) {
  const [currentSeller, setCurrentSeller] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  async function refreshSeller() {
    try {
      const token = getStoredSellerToken();

      if (!token) {
        setCurrentSeller(null);
        return { ok: false, message: "No token" };
      }

      const res = await apiGet("/marketplace/me");

      if (!res?.ok || !res?.data) {
        setStoredSellerToken("");
        setCurrentSeller(null);
        return {
          ok: false,
          message: res?.message || "Failed to load seller"
        };
      }

      if (res?.data?.role && !["seller", "admin"].includes(res.data.role)) {
        setStoredSellerToken("");
        setCurrentSeller(null);
        return {
          ok: false,
          message: "Unauthorized seller account"
        };
      }

      setCurrentSeller(res.data);
      return { ok: true, data: res.data };
    } catch (err) {
      console.error("refreshSeller failed:", err);
      setStoredSellerToken("");
      setCurrentSeller(null);
      return {
        ok: false,
        message: err?.message || "Failed to load seller"
      };
    }
  }

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        setAuthLoading(true);

        const token = getStoredSellerToken();
        if (!token) {
          if (mounted) {
            setCurrentSeller(null);
          }
          return;
        }

        const result = await refreshSeller();

        if (!result?.ok && mounted) {
          setCurrentSeller(null);
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  async function loginSeller(email, password) {
    try {
      setAuthLoading(true);

      const result = await apiPost("/auth/login", {
        email,
        password
      });

      if (!result?.ok || !result?.data?.token) {
        setCurrentSeller(null);
        return result;
      }

      if (result?.data?.user?.role && !["seller", "admin"].includes(result.data.user.role)) {
        setCurrentSeller(null);
        return {
          ok: false,
          message: "هذا الحساب ليس حساب بائع"
        };
      }

      setStoredSellerToken(result.data.token);

      const me = await refreshSeller();

      if (!me?.ok) {
        setStoredSellerToken("");
        setCurrentSeller(null);
        return {
          ok: false,
          message: "تم تسجيل الدخول لكن تعذر تحميل ملف البائع"
        };
      }

      return result;
    } catch (err) {
      console.error("loginSeller failed:", err);
      setStoredSellerToken("");
      setCurrentSeller(null);

      return {
        ok: false,
        message: err?.message || "فشل تسجيل الدخول"
      };
    } finally {
      setAuthLoading(false);
    }
  }

  function logoutSeller() {
    setStoredSellerToken("");
    setCurrentSeller(null);
  }

  const value = useMemo(
    () => ({
      currentSeller,
      authLoading,
      isAuthenticated: !!currentSeller,
      refreshSeller,
      loginSeller,
      logoutSeller
    }),
    [currentSeller, authLoading]
  );

  return (
    <SellerAuthContext.Provider value={value}>
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  const context = useContext(SellerAuthContext);

  if (!context) {
    throw new Error("useSellerAuth must be used within SellerAuthProvider");
  }

  return context;
}
