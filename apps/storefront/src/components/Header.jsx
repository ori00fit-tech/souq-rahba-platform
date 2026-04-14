import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState, useCallback } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL, ADMIN_PORTAL_URL } from "../lib/config";
import { UI } from "./marketplace/uiTokens";

const publicNavItems = [
  { path: "/", label: "الرئيسية", icon: HomeIcon },
  { path: "/products", label: "المنتجات", icon: GridIcon },
  { path: "/sellers", label: "الباعة", icon: StoreIcon },
  { path: "/help", label: "المساعدة", icon: HelpIcon }
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
      items.splice(3, 0, { path: "/my-orders", label: "طلباتي", icon: OrdersIcon });
    }
    return items;
  }, [isAuthenticated]);

  const accountLabel = useMemo(() => {
    if (!currentUser) return "الحساب";
    return currentUser.full_name || currentUser.email || "حسابي";
  }, [currentUser]);

  const handleLogout = useCallback(async () => {
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
  }, [loggingOut, logoutUser, navigate]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <header style={s.header}>
        {/* Premium accent line */}
        <div style={s.accentLine} />

        <div className="container" style={s.container}>
          {/* Top row: Menu, Logo, Actions */}
          <div style={s.topRow}>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              style={s.iconBtn}
              aria-label="فتح القائمة"
            >
              <MenuIcon />
            </button>

            <Link to="/" style={s.logo}>
              <div style={s.logoMark}>
                <span style={s.logoLetter}>R</span>
              </div>
              <div style={s.logoText}>
                <span style={s.logoName}>RAHBA</span>
                <span style={s.logoTag}>السوق الموثوق</span>
              </div>
            </Link>

            <div style={s.actions}>
              {!authLoading && (
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
              )}

              <NavLink to="/cart" style={s.cartBtn} aria-label="السلة">
                <CartIcon />
                <span style={s.cartLabel}>السلة</span>
                {count > 0 && <span style={s.cartBadge}>{count}</span>}
              </NavLink>
            </div>
          </div>

          {/* Search bar */}
          <div style={{ ...s.searchWrap, ...(searchFocused ? s.searchFocused : {}) }}>
            <SearchIcon color={searchFocused ? UI.colors.accent : UI.colors.textMuted} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder={isProductsPage ? "ابحث في المنتجات..." : "ابحث عن منتج، فئة، أو بائع..."}
              style={s.searchInput}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={s.searchClear}
                aria-label="مسح البحث"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {menuOpen && (
        <>
          <div style={s.overlay} onClick={closeMenu} />
          <aside style={s.drawer}>
            <div style={s.drawerHeader}>
              <div style={s.drawerBrand}>
                <div style={s.drawerLogoMark}>
                  <span style={s.drawerLogoLetter}>R</span>
                </div>
                <div>
                  <div style={s.drawerLogoName}>RAHBA</div>
                  <div style={s.drawerLogoTag}>السوق الموثوق</div>
                </div>
              </div>
              <button type="button" onClick={closeMenu} style={s.closeBtn} aria-label="إغلاق">
                <CloseIcon size={18} />
              </button>
            </div>

            {/* Account Panel */}
            <div style={s.accountPanel}>
              {authLoading ? (
                <div style={s.accountLoading}>جاري التحقق...</div>
              ) : isAuthenticated ? (
                <>
                  <div style={s.accountInfo}>
                    <div style={s.accountAvatar}>
                      {accountLabel.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={s.accountName}>{accountLabel}</div>
                      <div style={s.accountRole}>
                        {isAdmin ? "مدير النظام" : isSeller ? "بائع معتمد" : "مشتري"}
                      </div>
                    </div>
                  </div>
                  <div style={s.accountActions}>
                    <NavLink to="/my-orders" onClick={closeMenu} style={s.accountActionLink}>
                      <OrdersIcon /> طلباتي
                    </NavLink>
                    <button
                      type="button"
                      onClick={handleLogout}
                      style={s.logoutBtn}
                      disabled={loggingOut}
                    >
                      {loggingOut ? "جاري الخروج..." : "تسجيل الخروج"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={s.welcomeText}>مرحباً بك في رحبة</div>
                  <div style={s.welcomeSub}>سجل الدخول لمتابعة طلباتك</div>
                  <NavLink to={authPath} onClick={closeMenu} style={s.loginBtn}>
                    تسجيل الدخول
                  </NavLink>
                </>
              )}
            </div>

            {/* Navigation */}
            <nav style={s.drawerNav}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    style={({ isActive }) => ({
                      ...s.navLink,
                      ...(isActive ? s.navLinkActive : {})
                    })}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              <div style={s.navDivider} />

              {isSeller || isAdmin ? (
                <a href={SELLER_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.portalLink}>
                  <ExternalIcon /> بوابة البائع
                </a>
              ) : (
                <a href={SELLER_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.sellLink}>
                  <StoreIcon /> ابدأ البيع على رحبة
                </a>
              )}

              {isAdmin && (
                <a href={ADMIN_PORTAL_URL} target="_blank" rel="noopener noreferrer" style={s.adminLink}>
                  <SettingsIcon /> لوحة الإدارة
                </a>
              )}
            </nav>

            {/* Drawer Footer */}
            <div style={s.drawerFooter}>
              <NavLink to="/cart" onClick={closeMenu} style={s.drawerCartBtn}>
                <span style={s.drawerCartText}>
                  <CartIcon /> السلة
                </span>
                <span style={s.drawerCartBadge}>{count}</span>
              </NavLink>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

// Icons
function MenuIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
      <path d="M0 1h20M0 7h14M0 13h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeWidth="1.8" />
      <path d="M12 12L16 16" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M6 6h12l-1.5 7H7.5L6 6zM6 6L5 2H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="8" cy="17" r="1.5" fill="currentColor" />
      <circle cx="15" cy="17" r="1.5" fill="currentColor" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="6" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 18c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 7l7-5 7 5v9a1 1 0 01-1 1H3a1 1 0 01-1-1V7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 17V10h4v7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
      <rect x="11" y="11" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 6l1-4h12l1 4M2 6v10a1 1 0 001 1h12a1 1 0 001-1V6M2 6h14" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 17v-6h4v6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 6.5a2.5 2.5 0 013.5 2.3c0 1.2-1.5 1.7-1.5 2.7M9 14v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function OrdersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 6h6M6 9h4M6 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M10 2h6v6M16 2L8 10M14 10v5a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2M3.3 3.3l1.4 1.4M13.3 13.3l1.4 1.4M3.3 14.7l1.4-1.4M13.3 4.7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// Styles
const s = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    background: UI.colors.bgElevated,
    borderBottom: `1px solid ${UI.colors.border}`
  },
  accentLine: {
    height: "2px",
    background: `linear-gradient(90deg, ${UI.colors.accent} 0%, ${UI.colors.teal} 50%, ${UI.colors.primary} 100%)`
  },
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px 16px"
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  iconBtn: {
    width: "44px",
    height: "44px",
    borderRadius: UI.radius.md,
    border: `1px solid ${UI.colors.border}`,
    background: UI.colors.surface,
    color: UI.colors.text,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0,
    textDecoration: "none"
  },
  logoMark: {
    width: "40px",
    height: "40px",
    borderRadius: UI.radius.md,
    background: `linear-gradient(135deg, ${UI.colors.accent} 0%, ${UI.colors.accentHover} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  logoLetter: {
    color: UI.colors.bgDeep,
    fontSize: "20px",
    fontWeight: 800
  },
  logoText: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0
  },
  logoName: {
    color: UI.colors.text,
    fontSize: "20px",
    fontWeight: 700,
    letterSpacing: "0.02em",
    lineHeight: 1
  },
  logoTag: {
    color: UI.colors.accent,
    fontSize: "11px",
    fontWeight: 600,
    marginTop: "2px"
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  accountBtn: {
    width: "44px",
    height: "44px",
    borderRadius: UI.radius.md,
    border: `1px solid ${UI.colors.border}`,
    background: UI.colors.surface,
    color: UI.colors.textSecondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  cartBtn: {
    position: "relative",
    height: "44px",
    padding: "0 14px",
    borderRadius: UI.radius.md,
    border: `1px solid ${UI.colors.border}`,
    background: UI.colors.surface,
    color: UI.colors.text,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 600,
    fontSize: "13px",
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  cartLabel: {
    display: "none",
    "@media (min-width: 400px)": { display: "block" }
  },
  cartBadge: {
    position: "absolute",
    top: "-6px",
    left: "-6px",
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    borderRadius: UI.radius.pill,
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    fontSize: "11px",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.md,
    padding: "0 14px",
    minHeight: "48px",
    transition: "all 0.2s ease"
  },
  searchFocused: {
    borderColor: UI.colors.accent,
    boxShadow: `0 0 0 3px ${UI.colors.accentMuted}`
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    color: UI.colors.text,
    fontSize: "14px",
    "::placeholder": { color: UI.colors.textMuted }
  },
  searchClear: {
    width: "28px",
    height: "28px",
    borderRadius: UI.radius.sm,
    border: "none",
    background: UI.colors.surfaceHover,
    color: UI.colors.textMuted,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: UI.colors.overlay,
    zIndex: 69,
    backdropFilter: "blur(4px)"
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "min(85vw, 340px)",
    background: UI.colors.bg,
    zIndex: 70,
    display: "flex",
    flexDirection: "column",
    borderLeft: `1px solid ${UI.colors.border}`
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    borderBottom: `1px solid ${UI.colors.border}`
  },
  drawerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  drawerLogoMark: {
    width: "40px",
    height: "40px",
    borderRadius: UI.radius.md,
    background: `linear-gradient(135deg, ${UI.colors.accent} 0%, ${UI.colors.accentHover} 100%)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  drawerLogoLetter: {
    color: UI.colors.bgDeep,
    fontSize: "18px",
    fontWeight: 800
  },
  drawerLogoName: {
    color: UI.colors.text,
    fontSize: "18px",
    fontWeight: 700,
    lineHeight: 1
  },
  drawerLogoTag: {
    color: UI.colors.accent,
    fontSize: "11px",
    fontWeight: 600,
    marginTop: "2px"
  },
  closeBtn: {
    width: "40px",
    height: "40px",
    borderRadius: UI.radius.md,
    border: `1px solid ${UI.colors.border}`,
    background: UI.colors.surface,
    color: UI.colors.textSecondary,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  accountPanel: {
    margin: "16px",
    padding: "16px",
    background: UI.colors.surface,
    border: `1px solid ${UI.colors.border}`,
    borderRadius: UI.radius.lg,
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  accountLoading: {
    color: UI.colors.textMuted,
    fontSize: "14px"
  },
  accountInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  accountAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: UI.radius.md,
    background: UI.colors.accentMuted,
    color: UI.colors.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: 700
  },
  accountName: {
    color: UI.colors.text,
    fontSize: "15px",
    fontWeight: 600
  },
  accountRole: {
    color: UI.colors.teal,
    fontSize: "12px",
    fontWeight: 500,
    marginTop: "2px"
  },
  accountActions: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },
  accountActionLink: {
    height: "40px",
    borderRadius: UI.radius.md,
    background: UI.colors.tealMuted,
    border: `1px solid ${UI.colors.teal}30`,
    color: UI.colors.teal,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
  },
  logoutBtn: {
    height: "40px",
    borderRadius: UI.radius.md,
    background: UI.colors.errorBg,
    border: `1px solid ${UI.colors.errorBorder}`,
    color: UI.colors.error,
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer"
  },
  welcomeText: {
    color: UI.colors.text,
    fontSize: "16px",
    fontWeight: 600
  },
  welcomeSub: {
    color: UI.colors.textMuted,
    fontSize: "13px"
  },
  loginBtn: {
    height: "44px",
    borderRadius: UI.radius.md,
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
  },
  drawerNav: {
    flex: 1,
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    overflowY: "auto"
  },
  navLink: {
    height: "48px",
    padding: "0 14px",
    borderRadius: UI.radius.md,
    background: "transparent",
    border: `1px solid transparent`,
    color: UI.colors.textSecondary,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all 0.2s ease"
  },
  navLinkActive: {
    background: UI.colors.surface,
    borderColor: UI.colors.border,
    color: UI.colors.text
  },
  navDivider: {
    height: "1px",
    background: UI.colors.border,
    margin: "8px 0"
  },
  portalLink: {
    height: "48px",
    padding: "0 14px",
    borderRadius: UI.radius.md,
    background: UI.colors.primaryMuted,
    border: `1px solid ${UI.colors.primary}30`,
    color: UI.colors.primaryHover,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
  },
  sellLink: {
    height: "48px",
    padding: "0 14px",
    borderRadius: UI.radius.md,
    background: UI.colors.accentMuted,
    border: `1px solid ${UI.colors.borderAccent}`,
    color: UI.colors.accent,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
  },
  adminLink: {
    height: "48px",
    padding: "0 14px",
    borderRadius: UI.radius.md,
    background: UI.colors.warningBg,
    border: `1px solid ${UI.colors.warningBorder}`,
    color: UI.colors.warning,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "14px",
    fontWeight: 600,
    textDecoration: "none"
  },
  drawerFooter: {
    padding: "16px",
    borderTop: `1px solid ${UI.colors.border}`
  },
  drawerCartBtn: {
    height: "52px",
    borderRadius: UI.radius.md,
    background: UI.colors.accent,
    color: UI.colors.bgDeep,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    fontSize: "15px",
    fontWeight: 600,
    textDecoration: "none"
  },
  drawerCartText: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  drawerCartBadge: {
    minWidth: "28px",
    height: "28px",
    borderRadius: UI.radius.pill,
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 700
  }
};
