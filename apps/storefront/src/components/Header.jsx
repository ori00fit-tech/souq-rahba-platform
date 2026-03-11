import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL } from "../lib/config";

const T = {
  navy: "#16356b",
  blue: "#1d4ed8",
  teal: "#0f766e",
  sand: "#f5f1e8",
  sandSoft: "#f8f4eb",
  border: "#ddd5c2",
  white: "#ffffff",
  text: "#2d2418",
  shadow: "rgba(22, 53, 107, 0.10)",
};

const navItems = [
  { to: "/", label: "الرئيسية", icon: "🏠" },
  { to: "/products", label: "المنتجات", icon: "🛍️" },
  { to: "/sellers", label: "الباعة", icon: "🏪" },
  { to: "/my-orders", label: "طلباتي", icon: "📦" },
  { to: "/auth", label: "الحساب", icon: "👤" },
  { to: "/help", label: "المساعدة", icon: "💬" },
];

export default function Header() {
  const { cart, query, setQuery } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.colorBar} />

        <div style={styles.inner}>
          <div style={styles.topRow}>
            <Link to="/" style={styles.brand}>
              <img
                src="/brand/logo-icon.png"
                alt="RAHBA"
                style={styles.logo}
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
              <div style={styles.brandText}>
                <span style={styles.brandName}>RAHBA</span>
                <span style={styles.brandSub}>Online Marketplace</span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              style={styles.menuButton}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>

          <div style={styles.searchRow}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن منتجات، فئات، بائعين..."
              style={styles.searchInput}
              dir="rtl"
            />

            <NavLink to="/cart" style={styles.cartButton}>
              🛒
              <span style={styles.cartBadge}>{cart.length}</span>
            </NavLink>
          </div>
        </div>
      </header>

      {menuOpen && (
        <>
          <div style={styles.overlay} onClick={() => setMenuOpen(false)} />

          <aside style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <span style={{ fontWeight: 900 }}>RAHBA</span>
              <button onClick={() => setMenuOpen(false)} style={styles.closeButton}>
                ✕
              </button>
            </div>

            <nav style={styles.drawerNav}>
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMenuOpen(false)}
                  style={styles.drawerLink}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}

              <a
                href={SELLER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.sellerLink}
              >
                لوحة البائع ↗
              </a>
            </nav>
          </aside>
        </>
      )}
    </>
  );
}

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 60,
    background: T.sand,
    borderBottom: `1px solid ${T.border}`,
  },

  colorBar: {
    height: "6px",
    background:
      "repeating-linear-gradient(90deg,#1d4ed8 0 32px,#d4af37 32px 64px,#0ea5e9 64px 96px,#16a34a 96px 128px)",
  },

  inner: {
    padding: "12px 16px",
    display: "grid",
    gap: "12px",
  },

  topRow: {
    display: "grid",
    gridTemplateColumns: "1fr 48px",
    alignItems: "center",
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    justifyContent: "center",
    textDecoration: "none",
  },

  logo: {
    width: "40px",
    height: "40px",
  },

  brandText: {
    display: "grid",
    lineHeight: 1,
  },

  brandName: {
    fontWeight: 900,
    fontSize: "22px",
    color: T.navy,
  },

  brandSub: {
    fontSize: "11px",
    color: T.teal,
  },

  menuButton: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    border: `1px solid ${T.border}`,
    background: T.white,
    cursor: "pointer",
  },

  searchRow: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
  },

  searchInput: {
    height: "46px",
    borderRadius: "22px",
    border: `1px solid ${T.border}`,
    padding: "0 14px",
    fontSize: "14px",
  },

  cartButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "0 12px",
    borderRadius: "18px",
    border: `1px solid ${T.border}`,
    background: T.white,
    textDecoration: "none",
    color: T.navy,
  },

  cartBadge: {
    background: T.navy,
    color: "#fff",
    borderRadius: "999px",
    fontSize: "10px",
    padding: "2px 6px",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.35)",
  },

  drawer: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    width: "74%",
    maxWidth: "290px",
    background: T.sandSoft,
    padding: "16px",
    display: "grid",
    gap: "12px",
  },

  drawerHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  closeButton: {
    border: "none",
    background: "none",
    fontSize: "18px",
    cursor: "pointer",
  },

  drawerNav: {
    display: "grid",
    gap: "8px",
  },

  drawerLink: {
    display: "flex",
    gap: "10px",
    padding: "10px",
    textDecoration: "none",
    borderRadius: "10px",
    background: "#fff",
    border: `1px solid ${T.border}`,
    color: T.navy,
  },

  sellerLink: {
    padding: "10px",
    borderRadius: "10px",
    background: "#edf4ff",
    textDecoration: "none",
    color: T.blue,
    fontWeight: 700,
  },
};
