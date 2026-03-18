import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "../data/site";
import { apiGet } from "../lib/api";

const AppContext = createContext(null);

const CART_STORAGE_KEY = "rahba_cart_v1";

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
    async function loadCurrentUser() {
      const token = localStorage.getItem("auth_token");

      if (!token) {
        setAuthLoading(false);
        return;
      }

      try {
        const res = await apiGet("/auth/me");
        if (res.ok) {
          setCurrentUser(res.data);
        }
      } catch (err) {
        console.error(err);
        localStorage.removeItem("auth_token");
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    }

    loadCurrentUser();
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
    localStorage.setItem("auth_token", token);
    const res = await apiGet("/auth/me");
    if (res.ok) {
      setCurrentUser(res.data);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("auth_token");
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
  return useContext(AppContext);
}
