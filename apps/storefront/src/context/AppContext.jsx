import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../data/site";
import { apiGet } from "@rahba/shared";

const AppContext = createContext(null);

const CART_STORAGE_KEY = "rahba_cart_v1";
const AUTH_TOKEN_KEY = "auth_token";

function getAuthToken() {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch {
    return "";
  }
}

function setAuthToken(token) {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (err) {
    console.error("Failed to store auth token", err);
  }
}

function clearAuthToken() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (err) {
    console.error("Failed to clear auth token", err);
  }
}

function normalizeCartItem(product) {
  return {
    id: product.id,
    slug: product.slug || "",
    name: product.name || product.title_ar || "",
    title_ar: product.title_ar || product.name || "",
    price: Number(product.price ?? product.price_mad ?? 0),
    price_mad: Number(product.price_mad ?? product.price ?? 0),
    seller_id: product.seller_id || null,
    seller: product.seller || product.seller_name || "RAHBA",
    city: product.city || "",
    rating: Number(product.rating || product.rating_avg || 0),
    reviews: Number(product.reviews || product.reviews_count || 0),
    stock: Number(product.stock || 0),
    badge: product.badge || product.status || "",
    description: product.description || product.description_ar || "",
    image_url: product.image_url || "",
    qty: Number(product.qty || product.quantity || 1),
    quantity: Number(product.quantity || product.qty || 1)
  };
}

export function AppProvider({ children }) {
  const [language, setLanguage] = useState("ar");
  const [currency, setCurrency] = useState("MAD");
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const t = translations[language];
  const dir = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setCart(parsed.map(normalizeCartItem));
      }
    } catch (err) {
      console.error("Failed to load cart from storage", err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
      console.error("Failed to save cart to storage", err);
    }
  }, [cart]);

  useEffect(() => {
    let cancelled = false;

    async function loadCurrentUser() {
      const token = getAuthToken();

      if (!token) {
        if (!cancelled) {
          setCurrentUser(null);
          setAuthLoading(false);
        }
        return;
      }

      try {
        const res = await apiGet("/auth/me");
        if (!cancelled) {
          setCurrentUser(res?.ok ? res.data : null);
        }
      } catch (err) {
        console.error("Failed to load current user", err);
        clearAuthToken();
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false);
        }
      }
    }

    loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const addToCart = (product) => {
    const normalized = normalizeCartItem(product);

    setCart((current) => {
      const existing = current.find((item) => item.id === normalized.id);

      if (existing) {
        return current.map((item) => {
          if (item.id !== normalized.id) return item;
          const nextQty = Number(item.qty || item.quantity || 1) + 1;
          return {
            ...item,
            qty: nextQty,
            quantity: nextQty
          };
        });
      }

      return [
        ...current,
        {
          ...normalized,
          qty: 1,
          quantity: 1
        }
      ];
    });
  };

  const removeFromCart = (productId) =>
    setCart((current) => current.filter((item) => item.id !== productId));

  const updateQty = (productId, qty) =>
    setCart((current) =>
      current.map((item) => {
        if (item.id !== productId) return item;
        const nextQty = Math.max(1, Number(qty || 1));
        return {
          ...item,
          qty: nextQty,
          quantity: nextQty
        };
      })
    );

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear cart storage", err);
    }
  };

  const loginUser = async (token) => {
    setAuthToken(token);

    try {
      const res = await apiGet("/auth/me");
      if (res?.ok) {
        setCurrentUser(res.data);
        return res.data;
      }

      clearAuthToken();
      setCurrentUser(null);
      throw new Error("Failed to load authenticated user");
    } catch (err) {
      clearAuthToken();
      setCurrentUser(null);
      throw err;
    }
  };

  const logoutUser = () => {
    clearAuthToken();
    setCurrentUser(null);
  };

  const total = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + Number(item.price ?? item.price_mad ?? 0) * Number(item.qty || item.quantity || 1),
        0
      ),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0),
    [cart]
  );

  const value = {
    t,
    dir,
    language,
    setLanguage,
    currency,
    setCurrency,
    cart,
    cartItems: cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    total,
    query,
    setQuery,
    currentUser,
    authLoading,
    loginUser,
    logoutUser
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
