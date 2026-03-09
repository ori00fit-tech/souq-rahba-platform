import { createContext, useContext, useEffect, useState } from "react";
import { apiGet, apiPost } from "../lib/api";

const SellerAuthContext = createContext(null);

export function SellerAuthProvider({ children }) {
  const [currentSeller, setCurrentSeller] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadSeller() {
      const token = localStorage.getItem("seller_auth_token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await apiGet("/marketplace/me");
        if (res.ok) {
          setCurrentSeller(res.data);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("seller_auth_token");
        setCurrentSeller(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadSeller();
  }, []);

  async function loginSeller(email, password) {
    const result = await apiPost("/auth/login", { email, password });

    if (result.ok) {
      localStorage.setItem("seller_auth_token", result.data.token);
      const me = await apiGet("/marketplace/me");
      if (me.ok) {
        setCurrentSeller(me.data);
      }
    }

    return result;
  }

  function logoutSeller() {
    localStorage.removeItem("seller_auth_token");
    setCurrentSeller(null);
  }

  return (
    <SellerAuthContext.Provider
      value={{
        currentSeller,
        authLoading,
        loginSeller,
        logoutSeller
      }}
    >
      {children}
    </SellerAuthContext.Provider>
  );
}

export function useSellerAuth() {
  return useContext(SellerAuthContext);
}
