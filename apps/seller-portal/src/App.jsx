import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import EarningsPage from "./pages/EarningsPage";
import SettingsPage from "./pages/SettingsPage";
import AddProductPage from "./pages/AddProductPage";

function useIsMobile() {
  const getValue = () => (typeof window !== "undefined" ? window.innerWidth <= 768 : false);
  const [isMobile, setIsMobile] = useState(getValue());

  useEffect(() => {
    const onResize = () => setIsMobile(getValue());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return isMobile;
}

function NavItem({ to, label, icon, isMobile }) {
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <Link
      to={to}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "center" : "flex-start",
        gap: "10px",
        padding: isMobile ? "12px 10px" : "12px 14px",
        borderRadius: "14px",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: isMobile ? "14px" : "15px",
        transition: "0.2s ease",
        color: active ? "#ffffff" : "#334155",
        background: active
          ? "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)"
          : "#f8fafc",
        border: active ? "none" : "1px solid #e2e8f0",
        boxShadow: active ? "0 10px 24px rgba(15, 23, 42, 0.22)" : "none",
        minWidth: 0
      }}
    >
      <span style={{ fontSize: "16px", lineHeight: 1 }}>{icon}</span>
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
    </Link>
  );
}

function Sidebar({ isMobile }) {
  return (
    <aside
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        border: "1px solid #e2e8f0",
        borderRadius: "24px",
        padding: isMobile ? "14px" : "18px",
        boxShadow: "0 14px 34px rgba(15, 23, 42, 0.06)"
      }}
    >
      <div
        style={{
          borderRadius: "20px",
          padding: isMobile ? "16px" : "18px",
          background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
          color: "#ffffff",
          boxShadow: "0 14px 30px rgba(234, 88, 12, 0.25)"
        }}
      >
        <div style={{ fontSize: "12px", opacity: 0.92, letterSpacing: "0.4px" }}>
          Souq Rahba
        </div>
        <div style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: 800, marginTop: "4px" }}>
          Seller Portal
        </div>
        <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.95, lineHeight: 1.5 }}>
          Manage catalog, orders, earnings and store settings.
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          borderRadius: "18px",
          background: "#fff7ed",
          border: "1px solid #fed7aa"
        }}
      >
        <div style={{ fontSize: "12px", color: "#9a3412", fontWeight: 700 }}>
          Active Store
        </div>
        <div style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: 800, color: "#7c2d12", marginTop: "4px" }}>
          Talidi Store
        </div>
        <div style={{ fontSize: "13px", color: "#9a3412", marginTop: "6px" }}>
          Ready to sell on the marketplace
        </div>
      </div>

      <nav
        style={{
          display: "grid",
          gap: "10px",
          marginTop: "18px",
          gridTemplateColumns: isMobile ? "repeat(2, minmax(0, 1fr))" : "1fr"
        }}
      >
        <NavItem to="/" label="Dashboard" icon="📊" isMobile={isMobile} />
        <NavItem to="/products" label="Products" icon="📦" isMobile={isMobile} />
        <NavItem to="/orders" label="Orders" icon="🧾" isMobile={isMobile} />
        <NavItem to="/earnings" label="Earnings" icon="💰" isMobile={isMobile} />
        <NavItem to="/settings" label="Settings" icon="⚙️" isMobile={isMobile} />
      </nav>
    </aside>
  );
}

function Topbar({ isMobile }) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        backdropFilter: "blur(10px)",
        background: "rgba(255,255,255,0.92)",
        borderBottom: "1px solid #e2e8f0"
      }}
    >
      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: isMobile ? "12px 14px" : "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: 700 }}>
            Marketplace Seller Console
          </div>
          <div
            style={{
              fontSize: isMobile ? "22px" : "24px",
              fontWeight: 800,
              color: "#0f172a",
              lineHeight: 1.15
            }}
          >
            Seller Dashboard
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap"
          }}
        >
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              background: "#ecfdf5",
              color: "#166534",
              border: "1px solid #bbf7d0",
              fontSize: "13px",
              fontWeight: 800
            }}
          >
            Store Active
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "999px",
              background: "#eff6ff",
              color: "#1d4ed8",
              border: "1px solid #bfdbfe",
              fontSize: "13px",
              fontWeight: 800
            }}
          >
            Seller Mode
          </div>
        </div>
      </div>
    </header>
  );
}

function Layout() {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(245,158,11,0.10), transparent 28%), linear-gradient(180deg, #fffefc 0%, #f8fafc 100%)",
        color: "#0f172a",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        overflowX: "hidden"
      }}
    >
      <Topbar isMobile={isMobile} />

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: isMobile ? "14px" : "18px 16px 28px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "290px minmax(0, 1fr)",
          gap: "18px"
        }}
      >
        <div style={{ minWidth: 0, order: isMobile ? 1 : 1 }}>
          <Sidebar isMobile={isMobile} />
        </div>

        <main style={{ minWidth: 0, order: isMobile ? 2 : 2 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
