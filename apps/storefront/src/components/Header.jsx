import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL, ADMIN_PORTAL_URL } from "../lib/config";

const T = {
  bg: "rgba(250,246,238,0.88)",
  surface: "#ffffff",
  surfaceSoft: "#f8f3ea",
  border: "#e8ddce",
  borderStrong: "#d7c8b4",
  navy: "#0d2c54",
  navySoft: "#173b74",
  teal: "#0abfb8",
  tealSoft: "#eafbf7",
  blueSoft: "#eef6ff",
  orangeSoft: "#fff7ed",
  text: "#111827",
  textSoft: "#6b7280",
  textMuted: "#8b7f72",
  dangerBg: "#fef2f2",
  dangerBorder: "#fecaca",
  dangerText: "#b91c1c",
  shadow: "0 18px 42px rgba(11,15,26,0.10)",
  shadowSoft: "0 8px 24px rgba(11,15,26,0.06)",
};

const publicNavItems = [
  { path: "/", label: "الرئيسية", icon: <HomeIcon /> },
  { path: "/products", label: "المنتجات", icon: <GridIcon /> },
  { path: "/sellers", label: "الباعة", icon: <StoreIcon /> },
  { path: "/help", label: "المساعدة", icon: <HelpIcon /> },
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
    logoutUser,
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
      items.splice(3, 0, {
        path: "/my-orders",
        label: "طلباتي",
        icon: <OrdersIcon />,
      });
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
                    <UserIcon />
                  </button>
                ) : (
                  <NavLink to={authPath} style={s.accountBtn} aria-label="تسجيل الدخول">
                    <UserIcon />
                  </NavLink>
                )
              ) : null}

              <NavLink to="/cart" style={s.cartBtn} aria-label="السلة">
                <span style={s.cartIconWrap}>
                  <CartIcon />
                </span>
                <span style={s.cartText}>السلة</span>
                {count > 0 ? <span style={s.cartBadge}>{count}</span> : null}
              </NavLink>
            </div>
          </div>

          <div
            style={{
              ...s.searchWrap,
              ...(searchFocused ? s.searchWrapFocused : {}),
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

            <div style={s.searchHint}>
              <span style={s.searchHintDot} />
              <span>{isProductsPage ? "بحث مباشر" : "بحث ذكي"}</span>
            </div>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <div style={s.overlay} onClick={() => setMenuOpen(false)} />

          <aside style={s.drawer}>
            <div style={s.drawerHandle} />

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
                  <div style={s.accountTop}>
                    <div style={s.accountAvatar}>
                      {String(accountLabel).trim().charAt(0).toUpperCase() || "R"}
                    </div>

                    <div style={s.accountMeta}>
                      <div style={s.accountName}>{accountLabel}</div>
                      <div style={s.accountRole}>
                        {isAdmin ? "مدير" : isSeller ? "بائع" : "مشتري"}
                      </div>
                    </div>
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
                  <div style={s.accountTop}>
                    <div style={s.accountAvatarGhost}>R</div>

                    <div style={s.accountMeta}>
                      <div style={s.accountName}>مرحباً بك في رحبة</div>
                      <div style={s.accountRole}>
                        سجل الدخول لمتابعة طلباتك والوصول إلى تجربة أسرع
                      </div>
                    </div>
                  </div>

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
                    ...(isActive ? s.drawerLinkActive : {}),
                  })}
                >
                  <span style={s.drawerIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <a
                href={SELLER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={s.sellerPortalLink}
              >
                <span style={s.drawerIcon}>
                  <ArrowUpRightIcon />
                </span>
                <span>{isSeller || isAdmin ? "بوابة البائع" : "ابدأ البيع"}</span>
              </a>

              {isAdmin ? (
                <a
                  href={ADMIN_PORTAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={s.adminPortalLink}
                >
                  <span style={s.drawerIcon}>
                    <ArrowUpRightIcon />
                  </span>
                  <span>لوحة الإدارة</span>
                </a>
              ) : null}
            </nav>

            <div style={s.utilityPanel}>
              <div style={s.utilityTitle}>مزايا رحبة</div>
              <div style={s.utilityBadges}>
                <span style={s.utilityBadge}>متعدد الباعة</span>
                <span style={s.utilityBadge}>دفع آمن</span>
                <span style={s.utilityBadge}>تجربة مغربية حديثة</span>
              </div>
            </div>

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
      <rect width="20" height="2.5" rx="1.25" fill="#0D2C54" />
      <rect y="6.75" width="14" height="2.5" rx="1.25" fill="#0D2C54" />
      <rect y="13.5" width="20" height="2.5" rx="1.25" fill="#0D2C54" />
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

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="#0D2C54" strokeWidth="1.8" />
      <path
        d="M5 20c1.6-3.2 4.3-4.8 7-4.8s5.4 1.6 7 4.8"
        stroke="#0D2C54"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 4h2l2 10h10l2-7H7"
        stroke="#0D2C54"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="19" r="1.5" fill="#0D2C54" />
      <circle cx="17" cy="19" r="1.5" fill="#0D2C54" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 10.5L12 4l8 6.5V20H4v-9.5Z"
        stroke="#173b74"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="#173b74" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="#173b74" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="#173b74" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="#173b74" strokeWidth="1.8" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 9h14l-1.2 10H6.2L5 9Z"
        stroke="#173b74"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 9V6.8A1.8 1.8 0 0 1 8.8 5h6.4A1.8 1.8 0 0 1 17 6.8V9"
        stroke="#173b74"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#173b74" strokeWidth="1.8" />
      <path
        d="M9.8 9.4a2.55 2.55 0 1 1 4.1 2.04c-.9.68-1.55 1.2-1.55 2.31"
        stroke="#173b74"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17.2" r="1" fill="#173b74" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="2" stroke="#173b74" strokeWidth="1.8" />
      <path d="M8 9h8M8 13h8M8 17h5" stroke="#173b74" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 17 17 7" stroke="#173b74" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M9 7h8v8" stroke="#173b74" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const s = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    background: T.bg,
    backdropFilter: "blur(16px)",
    borderBottom: `1px solid ${T.border}`,
    boxShadow: T.shadowSoft,
  },
  topGradient: {
    height: "4px",
    background:
      "linear-gradient(90deg, #0d2c54 0%, #173b74 35%, #0abfb8 72%, #3ba5f5 100%)",
  },
  container: {
    display: "grid",
    gap: "12px",
    paddingTop: "12px",
    paddingBottom: "12px",
  },
  topRow: {
    display: "grid",
    gridTemplateColumns: "48px 1fr auto",
    gap: "12px",
    alignItems: "center",
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  iconBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.surface,
    display: "grid",
    placeItems: "center",
    cursor: "pointer",
    boxShadow: T.shadowSoft,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: 0,
  },
  logoMark: {
    width: "44px",
    height: "44px",
    borderRadius: "15px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    boxShadow: "0 8px 18px rgba(11,15,26,0.05)",
  },
  logoImg: {
    width: "28px",
    height: "28px",
    objectFit: "contain",
  },
  logoTextWrap: {
    display: "grid",
    lineHeight: 1,
    minWidth: 0,
  },
  logoName: {
    color: T.navy,
    fontSize: "22px",
    fontWeight: 900,
    letterSpacing: "0.02em",
  },
  logoSub: {
    marginTop: "5px",
    color: T.teal,
    fontSize: "11px",
    fontWeight: 800,
  },
  accountBtn: {
    position: "relative",
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.surface,
    display: "grid",
    placeItems: "center",
    color: T.navy,
    boxShadow: T.shadowSoft,
    textDecoration: "none",
  },
  cartBtn: {
    position: "relative",
    minWidth: "90px",
    height: "48px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.surface,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "0 12px",
    fontWeight: 900,
    color: T.navy,
    boxShadow: T.shadowSoft,
    textDecoration: "none",
  },
  cartIconWrap: {
    display: "grid",
    placeItems: "center",
  },
  cartText: {
    fontSize: "13px",
    whiteSpace: "nowrap",
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
    border: "2px solid #fff",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "0 14px",
    minHeight: "54px",
    boxShadow: "0 10px 24px rgba(11,15,26,0.04)",
  },
  searchWrapFocused: {
    border: "1px solid #9ec7ea",
    boxShadow: "0 0 0 4px rgba(59,165,245,0.10)",
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: T.text,
    fontSize: "15px",
  },
  searchHint: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: T.textMuted,
    fontSize: "11px",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  searchHintDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "linear-gradient(135deg, #0abfb8 0%, #3ba5f5 100%)",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.42)",
    zIndex: 69,
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(88vw, 380px)",
    background: "#fbf7f0",
    zIndex: 70,
    boxShadow: "-20px 0 52px rgba(11,15,26,0.18)",
    display: "grid",
    gridTemplateRows: "auto auto 1fr auto auto",
    padding: "14px 16px 16px",
    overflowY: "auto",
  },
  drawerHandle: {
    width: "56px",
    height: "6px",
    borderRadius: "999px",
    background: "#ddd5c8",
    margin: "4px auto 10px",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "14px",
  },
  drawerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  drawerLogoWrap: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    background: T.surface,
    display: "grid",
    placeItems: "center",
    boxShadow: T.shadowSoft,
  },
  drawerLogo: {
    width: "28px",
    height: "28px",
    objectFit: "contain",
  },
  drawerTitle: {
    color: T.navy,
    fontWeight: 900,
    fontSize: "20px",
    lineHeight: 1,
  },
  drawerSubtitle: {
    color: T.teal,
    fontWeight: 800,
    fontSize: "11px",
    marginTop: "4px",
  },
  closeBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: `1px solid ${T.border}`,
    background: T.surface,
    color: T.navy,
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: 900,
  },
  accountPanel: {
    background: T.surface,
    border: `1px solid ${T.border}`,
    borderRadius: "20px",
    padding: "14px",
    display: "grid",
    gap: "12px",
    marginBottom: "14px",
    boxShadow: T.shadowSoft,
  },
  accountLoading: {
    color: T.textSoft,
    fontWeight: 700,
    fontSize: "14px",
  },
  accountTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  accountAvatar: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #0d2c54 0%, #173b74 100%)",
    color: "#fff",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "16px",
    flexShrink: 0,
  },
  accountAvatarGhost: {
    width: "46px",
    height: "46px",
    borderRadius: "16px",
    background: T.blueSoft,
    color: T.navy,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "16px",
    flexShrink: 0,
    border: `1px solid #dbeafe`,
  },
  accountMeta: {
    display: "grid",
    gap: "3px",
    minWidth: 0,
  },
  accountName: {
    color: T.navy,
    fontWeight: 900,
    fontSize: "16px",
    lineHeight: 1.5,
  },
  accountRole: {
    color: T.textSoft,
    fontWeight: 700,
    fontSize: "13px",
    lineHeight: 1.7,
  },
  accountActions: {
    display: "grid",
    gap: "8px",
    marginTop: "2px",
  },
  accountActionLink: {
    minHeight: "44px",
    borderRadius: "14px",
    background: T.tealSoft,
    color: T.navy,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    textDecoration: "none",
    border: "1px solid #cdeee8",
  },
  accountActionBtn: {
    minHeight: "44px",
    borderRadius: "14px",
    background: T.dangerBg,
    color: T.dangerText,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    border: `1px solid ${T.dangerBorder}`,
    cursor: "pointer",
  },
  accountLoginBtn: {
    minHeight: "44px",
    borderRadius: "14px",
    background: T.navy,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    textDecoration: "none",
    marginTop: "2px",
  },
  drawerNav: {
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  drawerLink: {
    minHeight: "50px",
    borderRadius: "16px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: T.text,
    textDecoration: "none",
    border: `1px solid ${T.border}`,
    background: T.surface,
    fontWeight: 800,
  },
  drawerLinkActive: {
    background: T.blueSoft,
    color: T.navy,
    border: "1px solid #d9eafe",
  },
  drawerIcon: {
    width: "22px",
    height: "22px",
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  },
  sellerPortalLink: {
    minHeight: "50px",
    borderRadius: "16px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: T.navy,
    textDecoration: "none",
    border: "1px solid #cdeee8",
    background: T.tealSoft,
    fontWeight: 900,
  },
  adminPortalLink: {
    minHeight: "50px",
    borderRadius: "16px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: "#9a3412",
    textDecoration: "none",
    border: "1px solid #fed7aa",
    background: T.orangeSoft,
    fontWeight: 900,
  },
  utilityPanel: {
    marginTop: "14px",
    background: "linear-gradient(135deg, #fff 0%, #f8f3ea 100%)",
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "14px",
    display: "grid",
    gap: "10px",
  },
  utilityTitle: {
    color: T.navy,
    fontSize: "14px",
    fontWeight: 900,
  },
  utilityBadges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  utilityBadge: {
    minHeight: "32px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "#ffffff",
    border: `1px solid ${T.border}`,
    color: T.navySoft,
    fontSize: "12px",
    fontWeight: 800,
    display: "inline-flex",
    alignItems: "center",
  },
  drawerFooter: {
    marginTop: "14px",
  },
  drawerCart: {
    minHeight: "52px",
    borderRadius: "16px",
    background: T.navy,
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 14px",
    textDecoration: "none",
    fontWeight: 900,
    boxShadow: T.shadow,
  },
  drawerCartBadge: {
    minWidth: "30px",
    height: "30px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.16)",
    display: "grid",
    placeItems: "center",
    fontSize: "12px",
  },
};
