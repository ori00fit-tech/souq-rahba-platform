import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL } from "../lib/config";

export default function Header() {
  const { cart, query, setQuery } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 60,
          background: "#f5f1e8",
          borderBottom: "1px solid #e5dccb"
        }}
      >
        <div
          style={{
            height: "10px",
            background:
              "repeating-linear-gradient(90deg, #1d4ed8 0 28px, #eab308 28px 56px, #ea580c 56px 84px, #16a34a 84px 112px)"
          }}
        />

        <div
          className="container"
          style={{
            display: "grid",
            gap: "14px",
            paddingTop: "14px",
            paddingBottom: "14px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "52px 1fr auto",
              alignItems: "center",
              gap: "12px"
            }}
          >
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              style={menuButton}
              aria-label="Open menu"
              title="Open menu"
            >
              ☰
            </button>

            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#16356b",
                justifySelf: "center",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                minWidth: 0
              }}
            >
              <img
                src="/brand/logo-icon.png"
                alt="RAHBA"
                style={{
                  width: "44px",
                  height: "44px",
                  objectFit: "contain",
                  borderRadius: "12px",
                  background: "transparent",
                  flexShrink: 0
                }}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div style={{ display: "grid", lineHeight: 1, minWidth: 0 }}>
                <span
                  style={{
                    fontSize: "24px",
                    fontWeight: "900",
                    letterSpacing: "0.5px",
                    color: "#16356b"
                  }}
                >
                  RAHBA
                </span>
                <span
                  style={{
                    fontSize: "12px",
                    color: "#0f766e",
                    marginTop: "4px",
                    fontWeight: "700"
                  }}
                >
                  Online Marketplace
                </span>
              </div>
            </Link>

            <NavLink
              to="/cart"
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 14px",
                borderRadius: "16px",
                border: "1px solid #d8ccb7",
                background: "#fff",
                color: "#16356b",
                fontWeight: "800",
                position: "relative",
                boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)"
              }}
              aria-label="Cart"
              title="Cart"
            >
              <span style={{ fontSize: "20px", lineHeight: 1 }}>🛒</span>
              <span style={{ fontSize: "14px" }}>Cart</span>

              <span
                style={{
                  minWidth: "22px",
                  height: "22px",
                  borderRadius: "999px",
                  background: "#16356b",
                  color: "#fff",
                  fontSize: "12px",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: "800",
                  padding: "0 6px"
                }}
              >
                {cart.length}
              </span>
            </NavLink>
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن منتجات، فئات، بائعين..."
            style={{
              width: "100%",
              padding: "16px 18px",
              borderRadius: "20px",
              border: "1px solid #e5dccb",
              background: "#fff",
              fontSize: "15px",
              outline: "none",
              boxShadow: "0 4px 14px rgba(15, 23, 42, 0.05)"
            }}
          />
        </div>
      </header>

      {menuOpen ? (
        <>
          <div
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15, 23, 42, 0.38)",
              zIndex: 70
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              bottom: 0,
              width: "82%",
              maxWidth: "320px",
              background: "#f8f4eb",
              zIndex: 80,
              boxShadow: "18px 0 48px rgba(15, 23, 42, 0.22)",
              display: "grid",
              gridTemplateRows: "auto 1fr auto"
            }}
          >
            <div
              style={{
                padding: "18px 16px",
                borderBottom: "1px solid #e5dccb",
                background: "linear-gradient(135deg, #16356b 0%, #1d4ed8 100%)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <img
                  src="/brand/logo-icon.png"
                  alt="RAHBA"
                  style={{
                    width: "38px",
                    height: "38px",
                    objectFit: "contain",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.12)",
                    padding: "4px"
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div style={{ display: "grid", lineHeight: 1 }}>
                  <span style={{ fontWeight: "900", fontSize: "20px" }}>RAHBA</span>
                  <span style={{ fontSize: "12px", opacity: 0.9, marginTop: "4px" }}>
                    Online Marketplace
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                style={closeButton}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "14px", display: "grid", gap: "10px", alignContent: "start" }}>
              <NavItem to="/" label="الرئيسية" onClick={() => setMenuOpen(false)} />
              <NavItem to="/products" label="المنتجات" onClick={() => setMenuOpen(false)} />
              <NavItem to="/sellers" label="الباعة" onClick={() => setMenuOpen(false)} />
              <NavItem to="/my-orders" label="طلباتي" onClick={() => setMenuOpen(false)} />
              <NavItem to="/auth" label="الحساب" onClick={() => setMenuOpen(false)} />
              <NavItem to="/help" label="المساعدة" onClick={() => setMenuOpen(false)} />

              <a
                href={SELLER_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                style={{
                  ...drawerLink,
                  background: "#eaf4ff",
                  color: "#16356b",
                  border: "1px solid #bfd6f6"
                }}
              >
                لوحة البائع
              </a>
            </div>

            <div
              style={{
                padding: "14px",
                borderTop: "1px solid #e5dccb",
                display: "grid",
                gap: "10px"
              }}
            >
              <NavLink
                to="/cart"
                onClick={() => setMenuOpen(false)}
                style={{
                  textDecoration: "none",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: "#16356b",
                  color: "#fff",
                  fontWeight: "800"
                }}
              >
                <span>🛒 السلة</span>
                <span
                  style={{
                    minWidth: "24px",
                    height: "24px",
                    borderRadius: "999px",
                    background: "#fff",
                    color: "#16356b",
                    display: "grid",
                    placeItems: "center",
                    fontSize: "12px",
                    fontWeight: "900",
                    padding: "0 6px"
                  }}
                >
                  {cart.length}
                </span>
              </NavLink>
            </div>
          </aside>
        </>
      ) : null}
    </>
  );
}

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={drawerLink}
    >
      {label}
    </NavLink>
  );
}

const menuButton = {
  width: "52px",
  height: "52px",
  borderRadius: "18px",
  border: "1px solid #d8ccb7",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: "24px",
  color: "#16356b",
  boxShadow: "0 4px 12px rgba(15, 23, 42, 0.05)"
};

const closeButton = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.12)",
  color: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: "18px"
};

const drawerLink = {
  textDecoration: "none",
  padding: "14px 16px",
  borderRadius: "14px",
  color: "#16356b",
  background: "#fff",
  border: "1px solid #e5dccb",
  fontWeight: "800",
  boxShadow: "0 3px 10px rgba(15, 23, 42, 0.03)"
};
