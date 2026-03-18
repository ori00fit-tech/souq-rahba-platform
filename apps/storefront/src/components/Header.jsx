import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL } from "../lib/config";

const T = {
  navy: "#16356b",
  blue: "#1d4ed8",
  teal: "#0f766e",
  gold: "#b08d3c",
  sand: "#f5f1e8",
  border: "#ddd5c2",
  white: "#ffffff",
  shadow: "rgba(22,53,107,0.10)"
};

const navIcons = {
  "/": "🏠",
  "/products": "🛍️",
  "/sellers": "🏪",
  "/my-orders": "📦",
  "/auth": "👤",
  "/help": "💬"
};

const navLabels = {
  "/": "الرئيسية",
  "/products": "المنتجات",
  "/sellers": "الباعة",
  "/my-orders": "طلباتي",
  "/auth": "الحساب",
  "/help": "المساعدة"
};

export default function Header() {
  const { cartCount, query, setQuery } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <header style={s.header}>
        <div style={s.colorBar} />

        <div style={s.inner}>
          <div style={s.row}>
            <button onClick={() => setMenuOpen(true)} style={s.iconBtn} aria-label="فتح القائمة">
              <HamburgerIcon />
            </button>

            <Link to="/" style={s.logo}>
              <img src="/brand/logo-icon.png" alt="RAHBA" style={s.logoImg} />
              <div style={s.logoText}>
                <span style={s.logoName}>RAHBA</span>
                <span style={s.logoSub}>Marketplace</span>
              </div>
            </Link>

            <NavLink to="/cart" style={s.cartBtn}>
              <span>🛒</span>
              <span style={s.cartLabel}>السلة</span>
              {cartCount > 0 ? <span style={s.cartBadge}>{cartCount}</span> : null}
            </NavLink>
          </div>

          <div style={{ ...s.searchWrap, ...(searchFocused ? s.searchWrapFocus : {}) }}>
            <SearchIcon color={searchFocused ? T.navy : "#9e9080"} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="ابحث عن منتجات..."
              style={s.searchInput}
            />
          </div>
        </div>
      </header>

      {menuOpen ? (
        <>
          <div onClick={() => setMenuOpen(false)} style={s.overlay} />

          <aside style={s.drawer}>
            <div style={s.drawerHeader}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img src="/brand/logo-icon.png" alt="RAHBA" style={s.drawerLogo} />
                <div>
                  <div style={{ fontWeight: 900 }}>RAHBA</div>
                  <div style={{ fontSize: "11px", opacity: 0.8 }}>Marketplace</div>
                </div>
              </div>

              <button onClick={() => setMenuOpen(false)} style={s.closeBtn} aria-label="إغلاق القائمة">
                ✕
              </button>
            </div>

            <nav style={s.drawerNav}>
              {Object.entries(navLabels).map(([path, label]) => (
                <NavLink key={path} to={path} onClick={() => setMenuOpen(false)} style={s.drawerLink}>
                  <span style={s.drawerIcon}>{navIcons[path]}</span>
                  <span>{label}</span>
                </NavLink>
              ))}

              <a
                href={SELLER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={s.sellerLink}
              >
                🏷️ لوحة البائع ↗
              </a>
            </nav>

            <div style={s.drawerFooter}>
              <NavLink to="/cart" onClick={() => setMenuOpen(false)} style={s.drawerCartBtn}>
                <span>🛒 السلة</span>
                <span style={s.drawerCartBadge}>{cartCount}</span>
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
    <svg width="20" height="16" viewBox="0 0 20 16">
      <rect width="20" height="2.5" rx="1.25" fill="#16356b" />
      <rect y="6.75" width="14" height="2.5" rx="1.25" fill="#16356b" />
      <rect y="13.5" width="20" height="2.5" rx="1.25" fill="#16356b" />
    </svg>
  );
}

function SearchIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
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
    background: T.sand,
    borderBottom: `1px solid ${T.border}`,
    boxShadow: `0 2px 16px ${T.shadow}`
  },
  colorBar: {
    height: "4px",
    background: `linear-gradient(90deg,#16356b,#1d4ed8,#0ea5e9,#0f766e,#16a34a)`
  },
  inner: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "12px 16px",
    display: "grid",
    gap: "12px"
  },
  row: {
    display: "grid",
    gridTemplateColumns: "48px 1fr auto",
    alignItems: "center",
    gap: "12px"
  },
  iconBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    border: `1.5px solid ${T.border}`,
    background: T.white,
    display: "grid",
    placeItems: "center",
    cursor: "pointer"
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    textDecoration: "none",
    justifySelf: "center"
  },
  logoImg: {
    width: "40px",
    height: "40px"
  },
  logoText: {
    display: "grid",
    lineHeight: 1
  },
  logoName: {
    fontSize: "22px",
    fontWeight: 900,
    color: T.navy
  },
  logoSub: {
    fontSize: "11px",
    color: T.teal
  },
  cartBtn: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "10px 14px",
    borderRadius: "14px",
    border: `1.5px solid ${T.border}`,
    background: T.white,
    textDecoration: "none",
    color: T.navy,
    fontWeight: 800,
    position: "relative"
  },
  cartLabel: {
    fontSize: "13px"
  },
  cartBadge: {
    background: T.navy,
    color: "#fff",
    borderRadius: "999px",
    padding: "2px 7px",
    fontSize: "11px",
    minWidth: "20px",
    textAlign: "center"
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "0 14px",
    height: "50px",
    borderRadius: "16px",
    border: `1.5px solid ${T.border}`,
    background: T.white,
    transition: "0.2s ease"
  },
  searchWrapFocus: {
    border: `1.5px solid ${T.blue}`,
    boxShadow: "0 0 0 4px rgba(29,78,216,0.08)"
  },
  searchInput: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "15px",
    color: T.navy
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.32)",
    zIndex: 79
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "320px",
    maxWidth: "88vw",
    height: "100vh",
    background: T.white,
    zIndex: 80,
    boxShadow: "-10px 0 30px rgba(0,0,0,0.12)",
    display: "grid",
    gridTemplateRows: "auto 1fr auto"
  },
  drawerHeader: {
    padding: "18px 16px",
    borderBottom: `1px solid ${T.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  drawerLogo: {
    width: "38px",
    height: "38px"
  },
  closeBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "12px",
    border: `1px solid ${T.border}`,
    background: T.white,
    cursor: "pointer"
  },
  drawerNav: {
    display: "grid",
    gap: "8px",
    padding: "16px"
  },
  drawerLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "14px",
    textDecoration: "none",
    color: T.navy,
    background: "#faf8f3",
    border: `1px solid ${T.border}`,
    fontWeight: 700
  },
  drawerIcon: {
    fontSize: "18px"
  },
  sellerLink: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 14px",
    borderRadius: "14px",
    textDecoration: "none",
    color: "#fff",
    background: `linear-gradient(135deg, ${T.navy}, ${T.teal})`,
    fontWeight: 800
  },
  drawerFooter: {
    padding: "16px",
    borderTop: `1px solid ${T.border}`
  },
  drawerCartBtn: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    textDecoration: "none",
    color: T.navy,
    fontWeight: 800,
    background: "#faf8f3",
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    padding: "12px 14px"
  },
  drawerCartBadge: {
    background: T.navy,
    color: "#fff",
    borderRadius: "999px",
    minWidth: "22px",
    height: "22px",
    display: "grid",
    placeItems: "center",
    fontSize: "11px"
  }
};
