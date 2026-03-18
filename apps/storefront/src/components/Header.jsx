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
  const { cartCount = 0, query, setQuery } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <>
      <header style={s.header}>
        <div style={s.colorBar} />

        <div style={s.inner}>
          <div style={s.row}>
            <button type="button" onClick={() => setMenuOpen(true)} style={s.iconBtn}>
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

              <button type="button" onClick={() => setMenuOpen(false)} style={s.closeBtn}>
                ✕
              </button>
            </div>

            <nav style={s.drawerNav}>
              {Object.entries(navLabels).map(([path, label]) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  style={s.drawerLink}
                >
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
    <svg width="20" height="16" viewBox="0 0 20 16" aria-hidden="true">
      <rect width="20" height="2.5" rx="1.25" fill="#16356b" />
      <rect y="6.75" width="14" height="2.5" rx="1.25" fill="#16356b" />
      <rect y="13.5" width="20" height="2.5" rx="1.25" fill="#16356b" />
    </svg>
  );
}

function SearchIcon({ color }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="7.5" cy="7.5" r="5.5" stroke={color} strokeWidth="1.8" fill="none" />
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
    background: "linear-gradient(90deg,#16356b,#1d4ed8,#0ea5e9,#0f766e,#16a34a)"
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
    height: "52px",
    borderRadius: "16px",
    background: T.white,
    border: `1.5px solid ${T.border}`,
    transition: "0.2s ease"
  },
  searchWrapFocus: {
    border: `1.5px solid ${T.blue}`,
    boxShadow: "0 0 0 4px rgba(29,78,216,0.08)"
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: "15px",
    color: "#1f2937"
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.34)",
    zIndex: 69
  },
  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "320px",
    maxWidth: "88vw",
    height: "100vh",
    background: "#fffefb",
    borderLeft: `1px solid ${T.border}`,
    zIndex: 70,
    display: "grid",
    gridTemplateRows: "auto 1fr auto",
    boxShadow: "-10px 0 30px rgba(0,0,0,0.12)"
  },
  drawerHeader: {
    padding: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottom: `1px solid ${T.border}`
  },
  drawerLogo: {
    width: "36px",
    height: "36px"
  },
  closeBtn: {
    width: "40px",
    height: "40px",
    border: `1px solid ${T.border}`,
    background: "#fff",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "18px"
  },
  drawerNav: {
    display: "grid",
    gap: "10px",
    padding: "16px"
  },
  drawerLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "14px",
    textDecoration: "none",
    color: "#1f2937",
    background: "#fff",
    border: `1px solid ${T.border}`,
    fontWeight: 700
  },
  drawerIcon: {
    width: "24px",
    textAlign: "center"
  },
  sellerLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px",
    borderRadius: "14px",
    textDecoration: "none",
    color: "#fff",
    background: "linear-gradient(135deg,#16356b,#0f766e)",
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
    padding: "14px",
    borderRadius: "14px",
    textDecoration: "none",
    background: "#16356b",
    color: "#fff",
    fontWeight: 800
  },
  drawerCartBadge: {
    minWidth: "24px",
    height: "24px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    background: "#fff",
    color: "#16356b",
    fontSize: "12px",
    fontWeight: 900
  }
};
