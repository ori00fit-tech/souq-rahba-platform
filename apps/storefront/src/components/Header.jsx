import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SELLER_PORTAL_URL } from "../lib/config";

export default function Header() {
  const { cart, query, setQuery, currentUser } = useApp();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid #e2e8f0"
      }}
    >
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#0f172a",
              display: "grid",
              lineHeight: 1
            }}
          >
            <span style={{ fontSize: "26px", fontWeight: "900", letterSpacing: "0.5px" }}>RAHBA</span>
            <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
              Online Marketplace
            </span>
          </Link>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <a
              href={SELLER_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#111827",
                color: "#fff",
                fontWeight: "700"
              }}
            >
              Sell on RAHBA
            </a>

            <NavLink
              to="/auth"
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#f8fafc",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                fontWeight: "700"
              }}
            >
              {currentUser ? "My Account" : "Login"}
            </NavLink>

            <NavLink
              to="/cart"
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: "12px",
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
                fontWeight: "800"
              }}
            >
              Cart ({cart.length})
            </NavLink>
          </div>
        </div>

        <div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories or sellers"
            style={{
              width: "100%",
              padding: "16px 18px",
              borderRadius: "16px",
              border: "1px solid #cbd5e1",
              background: "#fff",
              fontSize: "15px",
              outline: "none"
            }}
          />
        </div>

        <nav
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          {[
            ["/", "Home"],
            ["/products", "Products"],
            ["/sellers", "Sellers"],
            ["/my-orders", "My Orders"],
            ["/help", "Help"]
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              style={{
                textDecoration: "none",
                padding: "10px 14px",
                borderRadius: "999px",
                background: "#f8fafc",
                color: "#0f172a",
                border: "1px solid #e2e8f0",
                fontWeight: "700",
                fontSize: "14px"
              }}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
