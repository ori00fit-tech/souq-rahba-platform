import { Link, NavLink, useLocation } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL } from "../lib/config";

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

const navItems = [
  { path: "/", label: "الرئيسية", icon: "⌂" },
  { path: "/products", label: "المنتجات", icon: "◫" },
  { path: "/sellers", label: "الباعة", icon: "▣" },
  { path: "/my-orders", label: "طلباتي", icon: "◌" },
  { path: "/auth", label: "الحساب", icon: "◎" },
  { path: "/help", label: "المساعدة", icon: "?" }
];

export default function Header() {
  const location = useLocation();
  const { cart, cartCount, query, setQuery } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const count = useMemo(() => {
    if (typeof cartCount === "number") return cartCount;
    if (Array.isArray(cart)) {
      return cart.reduce((sum, item) => sum + Number(item.qty || item.quantity || 1), 0);
    }
    return 0;
  }, [cart, cartCount]);

  const isProductsPage = location.pathname === "/products";

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

            <NavLink to="/cart" style={s.cartBtn} aria-label="السلة">
              <span style={s.cartIcon}>🛒</span>
              <span style={s.cartText}>السلة</span>
              {count > 0 ? <span style={s.cartBadge}>{count}</span> : null}
            </NavLink>
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

              <a
                href={SELLER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={s.sellerPortalLink}
              >
                <span style={s.drawerIcon}>↗</span>
                <span>لوحة البائع</span>
              </a>
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
    boxShadow: "0 6px 16px rgba(23,59,116,0.04)"
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
    fontSize: "15px",
    color: T.text,
    padding: "14px 0"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.32)",
    zIndex: 80
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "86%",
    maxWidth: "360px",
    background: T.cream,
    zIndex: 90,
    padding: "18px 16px 16px",
    boxShadow: "-10px 0 40px rgba(15,23,42,0.18)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    gap: "18px"
  },
  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px"
  },
  drawerBrand: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  drawerLogoWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    background: T.white,
    border: `1px solid ${T.border}`,
    display: "grid",
    placeItems: "center"
  },
  drawerLogo: {
    width: "30px",
    height: "30px",
    objectFit: "contain"
  },
  drawerTitle: {
    color: T.navy,
    fontWeight: 900,
    fontSize: "18px"
  },
  drawerSubtitle: {
    color: T.teal,
    fontSize: "12px",
    fontWeight: 700
  },
  closeBtn: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    border: `1px solid ${T.border}`,
    background: T.white,
    cursor: "pointer",
    color: T.text,
    fontWeight: 900
  },
  drawerNav: {
    display: "grid",
    gap: "10px",
    alignContent: "start"
  },
  drawerLink: {
    minHeight: "50px",
    borderRadius: "16px",
    padding: "0 14px",
    background: T.white,
    border: `1px solid ${T.border}`,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: T.text,
    fontWeight: 800
  },
  drawerLinkActive: {
    color: T.navy,
    border: "1px solid #bfd5ea",
    background: "#f8fbff"
  },
  drawerIcon: {
    width: "28px",
    textAlign: "center",
    color: T.navy,
    fontWeight: 900
  },
  sellerPortalLink: {
    minHeight: "50px",
    borderRadius: "16px",
    padding: "0 14px",
    background: T.tealSoft,
    border: "1px solid #c9ece7",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    color: T.teal,
    fontWeight: 900
  },
  drawerFooter: {
    paddingTop: "8px"
  },
  drawerCart: {
    minHeight: "54px",
    borderRadius: "18px",
    padding: "0 16px",
    background: "linear-gradient(135deg, #173b74 0%, #1d5c97 55%, #0f8b84 100%)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 900,
    boxShadow: "0 14px 24px rgba(23,59,116,0.14)"
  },
  drawerCartBadge: {
    minWidth: "28px",
    height: "28px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.18)",
    display: "grid",
    placeItems: "center",
    fontSize: "12px",
    fontWeight: 900
  }
};
