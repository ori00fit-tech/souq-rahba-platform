import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL, ADMIN_PORTAL_URL } from "../lib/config";

const T = {
  navy: "#173b74",
  blue: "#1d5fa8",
  teal: "#0f8b84",
  tealSoft: "#eaf8f6",
  sand: "#f5f1e8",
  cream: "#fcfaf6",
  white: "#ffffff",
  border: "#ddd2c2",
  borderSoft: "#ebe2d7",
  text: "#1f2937",
  muted: "#7b6f63",
  shadow: "0 12px 30px rgba(23,59,116,0.08)"
};

const publicNavItems = [
  { path: "/", label: "الرئيسية", icon: "⌂" },
  { path: "/products", label: "المنتجات", icon: "◫" },
  { path: "/sellers", label: "الباعة", icon: "▣" },
  { path: "/help", label: "المساعدة", icon: "?" }
];

function sanitizeRedirectPath(pathname, search = "") {
  const path = `${pathname || "/"}${search || ""}`;
  if (!path.startsWith("/")) return "/";
  if (path.startsWith("/auth")) return "/";
  return path;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    query,
    setQuery,
    currentUser,
    authLoading,
    isAuthenticated,
    isSeller,
    isAdmin,
    logoutUser
  } = useApp();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const count = useMemo(() => {
    if (typeof cartCount === "number") return cartCount;
    if (Array.isArray(cart)) {
      return cart.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0);
    }
    return 0;
  }, [cart, cartCount]);

  const isProductsPage = location.pathname === "/products";

  const redirectPath = useMemo(
    () => sanitizeRedirectPath(location.pathname, location.search),
    [location.pathname, location.search]
  );

  const authPath = useMemo(
    () => `/auth?redirect=${encodeURIComponent(redirectPath)}`,
    [redirectPath]
  );

  const navItems = useMemo(() => {
    const items = [...publicNavItems];

    if (isAuthenticated) {
      items.splice(3, 0, { path: "/my-orders", label: "طلباتي", icon: "◌" });
    }

    return items;
  }, [isAuthenticated]);

  const accountLabel = useMemo(() => {
    if (!currentUser) return "الحساب";
    return currentUser.full_name || currentUser.email || "حسابي";
  }, [currentUser]);

  async function handleLogout() {
    if (loggingOut) return;

    try {
      setLoggingOut(true);
      await logoutUser();
      setMenuOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout failed", err);
      setMenuOpen(false);
      navigate("/", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      <header style={s.header} className="sticky-top-mobile">
        <div style={s.topGradient} />

        <div className="container" style={s.container}>
          <div style={s.topRow}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              style={s.iconBtn}
              aria-label="فتح القائمة"
            >
              <HamburgerIcon />
            </button>

            <Link to="/" style={s.logo}>
              <div style={s.logoMark}>
                <img src="/brand/logo-icon.png" alt="RAHBA" style={s.logoImg} />
              </div>

              <div style={s.logoTextWrap}>
                <span style={s.logoName}>RAHBA</span>
                <span style={s.logoSub}>Marketplace</span>
              </div>
            </Link>

            <div style={s.topActions}>
              {!authLoading ? (
                isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => navigate("/my-orders")}
                    style={s.accountBtn}
                    aria-label="حسابي"
                    title={accountLabel}
                  >
                    <span style={s.accountIcon}>◎</span>
                  </button>
                ) : (
                  <NavLink to={authPath} style={s.accountBtn} aria-label="تسجيل الدخول">
                    <span style={s.accountIcon}>◎</span>
                  </NavLink>
                )
              ) : null}

              <NavLink to="/cart" style={s.cartBtn} aria-label="السلة">
                <span style={s.cartIcon}>🛒</span>
                <span style={s.cartText}>السلة</span>
                {count > 0 ? <span style={s.cartBadge}>{count}</span> : null}
              </NavLink>
            </div>
          </div>

          <div
            style={{
              ...s.searchWrap,
              ...(searchFocused ? s.searchWrapFocused : {})
            }}
          >
            <SearchIcon color={searchFocused ? T.navy : "#9b8f82"} />

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={
                isProductsPage
                  ? "ابحث داخل المنتجات..."
                  : "ابحث عن منتج، فئة، أو بائع..."
              }
              style={s.searchInput}
            />
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <div style={s.overlay} onClick={() => setMenuOpen(false)} />

          <aside style={s.drawer}>
            <div style={s.drawerHeader}>
              <div style={s.drawerBrand}>
                <div style={s.drawerLogoWrap}>
                  <img src="/brand/logo-icon.png" alt="RAHBA" style={s.drawerLogo} />
                </div>

                <div>
                  <div style={s.drawerTitle}>RAHBA</div>
                  <div style={s.drawerSubtitle}>Marketplace</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                style={s.closeBtn}
                aria-label="إغلاق القائمة"
              >
                ✕
              </button>
            </div>

            <div style={s.accountPanel}>
              {authLoading ? (
                <div style={s.accountLoading}>جاري التحقق من الجلسة...</div>
              ) : isAuthenticated ? (
                <>
                  <div style={s.accountName}>{accountLabel}</div>
                  <div style={s.accountRole}>
                    {isAdmin ? "مدير" : isSeller ? "بائع" : "مشتري"}
                  </div>

                  <div style={s.accountActions}>
                    <NavLink
                      to="/my-orders"
                      onClick={() => setMenuOpen(false)}
                      style={s.accountActionLink}
                    >
                      طلباتي
                    </NavLink>

                    <button
                      type="button"
                      onClick={handleLogout}
                      style={s.accountActionBtn}
                      disabled={loggingOut}
                    >
                      {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={s.accountName}>مرحباً بك في رحبة</div>
                  <div style={s.accountRole}>سجل الدخول لمتابعة طلباتك بسهولة</div>

                  <NavLink
                    to={authPath}
                    onClick={() => setMenuOpen(false)}
                    style={s.accountLoginBtn}
                  >
                    تسجيل الدخول
                  </NavLink>
                </>
              )}
            </div>

            <nav style={s.drawerNav}>
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  style={({ isActive }) => ({
                    ...s.drawerLink,
                    ...(isActive ? s.drawerLinkActive : {})
                  })}
                >
                  <span style={s.drawerIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}

              {isSeller || isAdmin ? (
                <a
                  href={SELLER_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.sellerPortalLink}
                >
                  <span style={s.drawerIcon}>↗</span>
                  <span>بوابة البائع</span>
                </a>
              ) : (
                <a
                  href={SELLER_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.sellerPortalLink}
                >
                  <span style={s.drawerIcon}>↗</span>
                  <span>ابدأ البيع</span>
                </a>
              )}

              {isAdmin ? (
                <a
                  href={ADMIN_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.adminPortalLink}
                >
                  <span style={s.drawerIcon}>↗</span>
                  <span>لوحة الإدارة</span>
                </a>
              ) : null}
            </nav>

            <div style={s.drawerFooter}>
              <NavLink
                to="/cart"
                onClick={() => setMenuOpen(false)}
                style={s.drawerCart}
              >
                <span>الانتقال إلى السلة</span>
                <span style={s.drawerCartBadge}>{count}</span>
              </NavLink>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="16" viewBox="0 0 20 16" fill="none" aria-hidden="true">
      <rect width="20" height="2.5" rx="1.25" fill="#173b74" />
      <rect y="6.75" width="14" height="2.5" rx="1.25" fill="#173b74" />
      <rect y="13.5" width="20" height="2.5" rx="1.25" fill="#173b74" />
    </svg>
  );
}

function SearchIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeWidth="1.8" />
      <path d="M12 12L16 16" stroke={color} strokeWidth="1.8" />
    </svg>
  );
}

const s = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    background: "rgba(245,241,232,0.92)",
    backdropFilter: "blur(14px)",
    borderBottom: `1px solid ${T.borderSoft}`,
    boxShadow: T.shadow
  },
  topGradient: {
    height: "4px",
    background: "linear-gradient(90deg, #173b74 0%, #1d5fa8 38%, #0f8b84 72%, #22c5a5 100%)"
  },
  container: {
    display: "grid",
    gap: "12px",
    paddingTop: "12px",
    paddingBottom: "12px"
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "48px 1fr auto",
    gap: "12px",
    alignItems: "center"
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  iconBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.white,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(23,59,116,0.04)"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0
  },
  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    background: T.white,
    border: `1px solid ${T.border}`,
    display: "grid",
    placeItems: "center",
    flexShrink: 0
  },
  logoImg: {
    width: "28px",
    height: "28px",
    objectFit: "contain"
  },
  logoTextWrap: {
    display: "grid",
    lineHeight: 1,
    minWidth: 0
  },
  logoName: {
    color: T.navy,
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: "0.02em"
  },
  logoSub: {
    marginTop: "4px",
    color: T.teal,
    fontSize: "11px",
    fontWeight: 700
  },
  accountBtn: {
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.white,
    display: "grid",
    placeItems: "center",
    color: T.navy,
    boxShadow: "0 6px 16px rgba(23,59,116,0.04)",
    textDecoration: "none"
  },
  accountIcon: {
    fontSize: "18px",
    fontWeight: 900
  },
  cartBtn: {
    position: "relative",
    minWidth: "84px",
    height: "48px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.white,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "0 12px",
    fontWeight: 900,
    color: T.navy,
    boxShadow: "0 6px 16px rgba(23,59,116,0.04)",
    textDecoration: "none"
  },
  cartIcon: {
    fontSize: "16px"
  },
  cartText: {
    fontSize: "13px"
  },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    left: "-4px",
    minWidth: "22px",
    height: "22px",
    padding: "0 6px",
    borderRadius: "999px",
    background: T.navy,
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: "11px",
    fontWeight: 900,
    border: "2px solid #fff"
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "0 14px",
    minHeight: "52px",
    boxShadow: "0 8px 18px rgba(23,59,116,0.04)"
  },
  searchWrapFocused: {
    border: "1px solid #8fb1d7",
    boxShadow: "0 0 0 4px rgba(30,95,168,0.10)"
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: T.text,
    fontSize: "15px"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.36)",
    zIndex: 69
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(88vw, 360px)",
    background: T.cream,
    zIndex: 70,
    boxShadow: "-18px 0 48px rgba(15,23,42,0.16)",
    display: "grid",
    gridTemplateRows: "auto auto 1fr auto",
    padding: "18px 16px 16px"
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px"
  },
  drawerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  drawerLogoWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    border: `1px solid ${T.border}`,
    background: T.white,
    display: "grid",
    placeItems: "center"
  },
  drawerLogo: {
    width: "28px",
    height: "28px",
    objectFit: "contain"
  },
  drawerTitle: {
    color: T.navy,
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: 1
  },
  drawerSubtitle: {
    color: T.teal,
    fontWeight: 700,
    fontSize: "11px",
    marginTop: "4px"
  },
  closeBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: `1px solid ${T.border}`,
    background: T.white,
    color: T.navy,
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 900
  },
  accountPanel: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "14px",
    display: "grid",
    gap: "8px",
    marginBottom: "14px",
    boxShadow: "0 6px 16px rgba(23,59,116,0.04)"
  },
  accountLoading: {
    color: T.muted,
    fontWeight: 700,
    fontSize: "14px"
  },
  accountName: {
    color: T.navy,
    fontWeight: 900,
    fontSize: "16px",
    lineHeight: 1.5
  },
  accountRole: {
    color: T.muted,
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: 1.7
  },
  accountActions: {
    display: "grid",
    gap: "8px",
    marginTop: "4px"
  },
  accountActionLink: {
    minHeight: "42px",
    borderRadius: "14px",
    background: T.tealSoft,
    color: T.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    textDecoration: "none",
    border: "1px solid #cfece8"
  },
  accountActionBtn: {
    minHeight: "42px",
    borderRadius: "14px",
    background: "#fef2f2",
    color: "#b91c1c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    border: "1px solid #fecaca",
    cursor: "pointer"
  },
  accountLoginBtn: {
    minHeight: "42px",
    borderRadius: "14px",
    background: T.navy,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    textDecoration: "none",
    marginTop: "4px"
  },
  drawerNav: {
    display: "grid",
    gap: "8px",
    alignContent: "start"
  },
  drawerLink: {
    minHeight: "48px",
    borderRadius: "16px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: T.text,
    textDecoration: "none",
    border: `1px solid ${T.borderSoft}`,
    background: T.white,
    fontWeight: 800
  },
  drawerLinkActive: {
    background: "#eef5ff",
    color: T.navy,
    border: "1px solid #cfe0f6"
  },
  drawerIcon: {
    width: "22px",
    textAlign: "center",
    color: T.blue,
    fontWeight: 900
  },
  sellerPortalLink: {
    minHeight: "48px",
    borderRadius: "16px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: T.navy,
    textDecoration: "none",
    border: "1px solid #cfece8",
    background: T.tealSoft,
    fontWeight: 900
  },
  adminPortalLink: {
    minHeight: "48px",
    borderRadius: "16px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#7c2d12",
    textDecoration: "none",
    border: "1px solid #fed7aa",
    background: "#fff7ed",
    fontWeight: 900
  },
  drawerFooter: {
    marginTop: "14px"
  },
  drawerCart: {
    minHeight: "50px",
    borderRadius: "16px",
    background: T.navy,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    textDecoration: "none",
    fontWeight: 900
  },
  drawerCartBadge: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.18)",
    display: "grid",
    placeItems: "center",
    fontSize: "12px"
  }
};
