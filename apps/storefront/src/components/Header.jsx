import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const NAV_ITEMS = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/sellers", label: "الباعة" },
  { to: "/help", label: "المساعدة" }
];

function getInitials(name) {
  const raw = String(name || "").trim();
  if (!raw) return "ر";
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    cartCount,
    logout,
    authLoading
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setAccountOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isLoggedIn = Boolean(currentUser);
  const displayName =
    currentUser?.full_name ||
    currentUser?.name ||
    currentUser?.email ||
    "حسابي";

  const accountLabel = useMemo(() => {
    if (authLoading) return "جاري التحقق...";
    if (!currentUser) return "تسجيل الدخول";
    return displayName;
  }, [authLoading, currentUser, displayName]);

  function handleLogout() {
    try {
      logout?.();
    } catch (error) {
      console.error("logout failed", error);
    } finally {
      setAccountOpen(false);
      setMobileOpen(false);
      navigate("/");
    }
  }

  return (
    <header style={s.wrap}>
      <div style={s.backdrop} />
      <div className="container" style={s.container}>
        <div style={s.bar}>
          <div style={s.leftZone}>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              style={s.mobileMenuBtn}
              aria-label="فتح القائمة"
              aria-expanded={mobileOpen}
            >
              <span style={s.mobileMenuIcon}>☰</span>
            </button>

            <Link to="/" style={s.brand} aria-label="RAHBA">
              <div style={s.brandMark}>ر</div>
              <div style={s.brandTextWrap}>
                <span style={s.brandTitle}>RAHBA</span>
                <span style={s.brandSubtitle}>Marketplace</span>
              </div>
            </Link>
          </div>

          <nav style={s.desktopNav} aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  ...s.navLink,
                  ...(isActive ? s.navLinkActive : {})
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div style={s.rightZone}>
            <Link to="/cart" style={s.cartBtn} aria-label="السلة">
              <span style={s.cartIcon}>🛒</span>
              <span style={s.cartText}>السلة</span>
              <span style={s.cartCount}>{Number(cartCount || 0)}</span>
            </Link>

            <div style={s.accountWrap}>
              <button
                type="button"
                style={s.accountBtn}
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                aria-label="الحساب"
              >
                <div style={s.avatar}>
                  {isLoggedIn ? getInitials(displayName) : "👤"}
                </div>

                <div style={s.accountMeta}>
                  <span style={s.accountEyebrow}>
                    {isLoggedIn ? "حسابي" : "الدخول"}
                  </span>
                  <span style={s.accountName}>{accountLabel}</span>
                </div>

                <span style={s.accountChevron}>▾</span>
              </button>

              {accountOpen ? (
                <div style={s.accountDropdown}>
                  {isLoggedIn ? (
                    <>
                      <div style={s.accountCardTop}>
                        <div style={s.accountCardAvatar}>
                          {getInitials(displayName)}
                        </div>
                        <div style={s.accountCardText}>
                          <strong style={s.accountCardName}>{displayName}</strong>
                          <span style={s.accountCardHint}>
                            دخول سريع إلى الحساب والطلبات
                          </span>
                        </div>
                      </div>

                      <div style={s.dropdownList}>
                        <Link to="/my-orders" style={s.dropdownLink}>
                          <span>📦</span>
                          <span>حسابي وطلباتي</span>
                        </Link>

                        <Link to="/cart" style={s.dropdownLink}>
                          <span>🛒</span>
                          <span>السلة</span>
                        </Link>

                        <Link to="/support" style={s.dropdownLink}>
                          <span>💬</span>
                          <span>الدعم</span>
                        </Link>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        style={s.logoutBtn}
                      >
                        تسجيل الخروج
                      </button>
                    </>
                  ) : (
                    <>
                      <div style={s.accountCardTop}>
                        <div style={s.accountCardAvatar}>👤</div>
                        <div style={s.accountCardText}>
                          <strong style={s.accountCardName}>مرحباً بك</strong>
                          <span style={s.accountCardHint}>
                            سجّل الدخول للوصول إلى الحساب والطلبات
                          </span>
                        </div>
                      </div>

                      <div style={s.dropdownList}>
                        <Link to="/auth" style={s.dropdownLink}>
                          <span>🔐</span>
                          <span>تسجيل الدخول / إنشاء حساب</span>
                        </Link>

                        <Link to="/cart" style={s.dropdownLink}>
                          <span>🛒</span>
                          <span>السلة</span>
                        </Link>

                        <Link to="/track/sample" style={s.dropdownLink}>
                          <span>📍</span>
                          <span>تتبع طلب كزائر</span>
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {mobileOpen ? (
          <div style={s.mobilePanel}>
            <nav style={s.mobileNav} aria-label="القائمة المحمولة">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    ...s.mobileNavLink,
                    ...(isActive ? s.mobileNavLinkActive : {})
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div style={s.mobileQuickActions}>
              <Link to="/cart" style={s.mobileActionPrimary}>
                السلة ({Number(cartCount || 0)})
              </Link>

              {isLoggedIn ? (
                <Link to="/my-orders" style={s.mobileActionSecondary}>
                  حسابي وطلباتي
                </Link>
              ) : (
                <Link to="/auth" style={s.mobileActionSecondary}>
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

const s = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    backdropFilter: "blur(14px)"
  },

  backdrop: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,253,250,0.92) 100%)",
    borderBottom: "1px solid rgba(223,231,243,0.95)"
  },

  container: {
    position: "relative",
    zIndex: 1,
    paddingTop: "10px",
    paddingBottom: "10px"
  },

  bar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap"
  },

  leftZone: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none"
  },

  brandMark: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background:
      "linear-gradient(135deg, rgba(23,59,116,1) 0%, rgba(20,184,166,0.92) 100%)",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "20px",
    boxShadow: "0 12px 24px rgba(23,59,116,0.18)"
  },

  brandTextWrap: {
    display: "grid",
    gap: "1px"
  },

  brandTitle: {
    color: "#173b74",
    fontWeight: 900,
    letterSpacing: "0.06em",
    fontSize: "15px"
  },

  brandSubtitle: {
    color: "#6b7280",
    fontSize: "11px",
    fontWeight: 700
  },

  desktopNav: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },

  navLink: {
    textDecoration: "none",
    color: "#475569",
    fontWeight: 800,
    fontSize: "14px",
    minHeight: "40px",
    padding: "0 14px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid transparent"
  },

  navLinkActive: {
    color: "#173b74",
    background: "#eef6ff",
    border: "1px solid #d5e5fb"
  },

  rightZone: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginInlineStart: "auto"
  },

  cartBtn: {
    textDecoration: "none",
    minHeight: "44px",
    padding: "0 12px",
    borderRadius: "14px",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #e4ddd2",
    background: "#ffffff",
    color: "#173b74",
    fontWeight: 800,
    boxShadow: "0 8px 18px rgba(15,23,42,0.04)"
  },

  cartIcon: {
    fontSize: "16px"
  },

  cartText: {
    fontSize: "14px"
  },

  cartCount: {
    minWidth: "24px",
    height: "24px",
    padding: "0 6px",
    borderRadius: "999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#173b74",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 900
  },

  accountWrap: {
    position: "relative"
  },

  accountBtn: {
    border: "1px solid #e4ddd2",
    background: "#ffffff",
    minHeight: "48px",
    borderRadius: "16px",
    padding: "8px 10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(15,23,42,0.04)"
  },

  avatar: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "#eef6ff",
    color: "#173b74",
    fontWeight: 900,
    fontSize: "13px",
    flexShrink: 0
  },

  accountMeta: {
    display: "grid",
    gap: "1px",
    textAlign: "right"
  },

  accountEyebrow: {
    color: "#7a6f63",
    fontSize: "11px",
    fontWeight: 700
  },

  accountName: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "13px",
    maxWidth: "150px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  accountChevron: {
    color: "#64748b",
    fontSize: "12px"
  },

  accountDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    minWidth: "270px",
    maxWidth: "92vw",
    borderRadius: "20px",
    border: "1px solid #e7ddcf",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    boxShadow: "0 18px 38px rgba(15,23,42,0.10)",
    padding: "14px",
    display: "grid",
    gap: "12px"
  },

  accountCardTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  accountCardAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "#eef6ff",
    color: "#173b74",
    fontWeight: 900
  },

  accountCardText: {
    display: "grid",
    gap: "2px"
  },

  accountCardName: {
    color: "#173b74",
    fontSize: "14px"
  },

  accountCardHint: {
    color: "#6b7280",
    fontSize: "12px",
    lineHeight: 1.6
  },

  dropdownList: {
    display: "grid",
    gap: "8px"
  },

  dropdownLink: {
    textDecoration: "none",
    minHeight: "44px",
    borderRadius: "14px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#ffffff",
    border: "1px solid #ede5d8",
    color: "#334155",
    fontWeight: 800
  },

  logoutBtn: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#b91c1c",
    minHeight: "44px",
    borderRadius: "14px",
    fontWeight: 900,
    cursor: "pointer"
  },

  mobileMenuBtn: {
    display: "none",
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: "1px solid #e4ddd2",
    background: "#ffffff",
    color: "#173b74",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },

  mobileMenuIcon: {
    fontSize: "18px",
    fontWeight: 900
  },

  mobilePanel: {
    marginTop: "12px",
    display: "grid",
    gap: "12px",
    border: "1px solid #e7ddcf",
    borderRadius: "20px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    padding: "14px",
    boxShadow: "0 18px 38px rgba(15,23,42,0.08)"
  },

  mobileNav: {
    display: "grid",
    gap: "8px"
  },

  mobileNavLink: {
    textDecoration: "none",
    minHeight: "46px",
    borderRadius: "14px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    background: "#ffffff",
    border: "1px solid #ede5d8",
    color: "#334155",
    fontWeight: 800
  },

  mobileNavLinkActive: {
    background: "#eef6ff",
    border: "1px solid #d5e5fb",
    color: "#173b74"
  },

  mobileQuickActions: {
    display: "grid",
    gap: "8px"
  },

  mobileActionPrimary: {
    textDecoration: "none",
    minHeight: "46px",
    borderRadius: "14px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#173b74",
    color: "#ffffff",
    fontWeight: 900
  },

  mobileActionSecondary: {
    textDecoration: "none",
    minHeight: "46px",
    borderRadius: "14px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "1px solid #ede5d8",
    color: "#173b74",
    fontWeight: 900
  }
};

if (typeof window !== "undefined") {
  const styleId = "rahba-header-responsive";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @media (max-width: 980px) {
        .app-shell header nav {
          display: none;
        }
      }

      @media (max-width: 980px) {
        [style*="display: none"][aria-label="فتح القائمة"] {
          display: inline-flex !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}
