import { Link, NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function Header() {
  const { cart, query, setQuery, language, setLanguage, currency, setCurrency } = useApp();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
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
            gridTemplateColumns: "44px 1fr 44px",
            alignItems: "center",
            gap: "10px"
          }}
        >
          <button
            type="button"
            style={iconButton}
            aria-label="Menu"
            title="Menu"
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
              gap: "12px"
            }}
          >
            <img
              src="/brand/logo-icon.png"
              alt="RAHBA"
              style={{
                width: "42px",
                height: "42px",
                objectFit: "contain",
                borderRadius: "10px",
                background: "transparent"
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <div style={{ display: "grid", lineHeight: 1 }}>
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
              ...iconButton,
              textDecoration: "none",
              position: "relative"
            }}
            aria-label="Cart"
            title="Cart"
          >
            🛒
            {cart.length > 0 ? (
              <span
                style={{
                  position: "absolute",
                  top: "-6px",
                  right: "-4px",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "999px",
                  background: "#16356b",
                  color: "#fff",
                  fontSize: "11px",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: "800",
                  padding: "0 4px"
                }}
              >
                {cart.length}
              </span>
            ) : null}
          </NavLink>
        </div>

        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن منتجات، فئات، بائعين..."
          style={{
            width: "100%",
            padding: "16px 18px",
            borderRadius: "18px",
            border: "1px solid #e5dccb",
            background: "#fff",
            fontSize: "15px",
            outline: "none",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
          }}
        />

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={pillSelect}>
            <option value="ar">AR</option>
            <option value="fr">FR</option>
            <option value="en">EN</option>
          </select>

          <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={pillSelect}>
            <option value="MAD">MAD</option>
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>

          <NavLink to="/cart" style={pillLink}>
            السلة ({cart.length})
          </NavLink>
        </div>
      </div>
    </header>
  );
}

const iconButton = {
  width: "44px",
  height: "44px",
  borderRadius: "14px",
  border: "1px solid #e5dccb",
  background: "#fff",
  display: "grid",
  placeItems: "center",
  fontSize: "22px",
  color: "#16356b"
};

const pillSelect = {
  padding: "12px 16px",
  borderRadius: "999px",
  border: "1px solid #e5dccb",
  background: "#fff",
  color: "#111827",
  fontWeight: "700"
};

const pillLink = {
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: "999px",
  border: "1px solid #e5dccb",
  background: "#fff",
  color: "#111827",
  fontWeight: "700"
};
