import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import EarningsPage from "./pages/EarningsPage";
import SettingsPage from "./pages/SettingsPage";
import AddProductPage from "./pages/AddProductPage";
import EditProductPage from "./pages/EditProductPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import { SellerAuthProvider, useSellerAuth } from "./context/SellerAuthContext";

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
        borderRadius: "var(--radius-md)",
        textDecoration: "none",
        fontWeight: 800,
        fontSize: isMobile ? "14px" : "15px",
        transition: "0.2s ease",
        color: active ? "var(--text-on-dark)" : "var(--text-primary)",
        background: active ? "var(--seller-hero-gradient)" : "var(--bg-surface)",
        border: active ? "1px solid transparent" : "1px solid var(--border-soft)",
        boxShadow: active ? "var(--shadow-strong)" : "none",
        minWidth: 0
      }}
    >
      <span style={{ fontSize: "16px", lineHeight: 1 }}>{icon}</span>
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
    </Link>
  );
}

function Sidebar({ isMobile }) {
  const { currentSeller, logoutSeller } = useSellerAuth();

  return (
    <aside
      style={{
        background: "var(--seller-panel-gradient)",
        border: "1px solid var(--border-soft)",
        borderRadius: "var(--radius-xl)",
        padding: isMobile ? "14px" : "18px",
        boxShadow: "var(--shadow-card)"
      }}
    >
      <div
        style={{
          borderRadius: "20px",
          padding: isMobile ? "16px" : "18px",
          background: "var(--seller-hero-gradient)",
          color: "var(--text-on-dark)",
          boxShadow: "var(--shadow-strong)"
        }}
      >
        <div style={{ fontSize: "12px", opacity: 0.92, letterSpacing: "0.4px" }}>RAHBA</div>
        <div style={{ fontSize: isMobile ? "20px" : "22px", fontWeight: 900, marginTop: "4px" }}>Seller Portal</div>
        <div style={{ fontSize: "13px", marginTop: "8px", opacity: 0.95, lineHeight: 1.6 }}>
          إدارة المنتجات، الطلبات، الأرباح وإعدادات المتجر داخل منصة رحبة.
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "14px",
          borderRadius: "18px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-soft)"
        }}
      >
        <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 800 }}>المتجر النشط</div>
        <div style={{ fontSize: isMobile ? "17px" : "18px", fontWeight: 900, color: "var(--text-primary)", marginTop: "4px" }}>
          {currentSeller?.display_name || "Seller Store"}
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "6px" }}>
          {currentSeller?.slug || "Ready to sell on the marketplace"}
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

      <button
        onClick={logoutSeller}
        style={{
          marginTop: "16px",
          width: "100%",
          padding: "12px",
          borderRadius: "var(--radius-md)",
          border: "none",
          background: "var(--btn-primary-bg)",
          color: "var(--btn-primary-text)",
          fontWeight: 800,
          cursor: "pointer"
        }}
      >
        Logout
      </button>
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
        background: "var(--seller-topbar-bg)",
        borderBottom: "1px solid var(--border-soft)"
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
          <div style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: 800 }}>Marketplace Seller Console</div>
          <div style={{ fontSize: isMobile ? "22px" : "24px", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.15 }}>
            Seller Dashboard
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--success-bg)",
              color: "var(--success-text)",
              border: "1px solid var(--success-border)",
              fontSize: "13px",
              fontWeight: 800
            }}
          >
            Store Active
          </div>

          <div
            style={{
              padding: "10px 14px",
              borderRadius: "var(--radius-pill)",
              background: "var(--info-bg)",
              color: "var(--info-text)",
              border: "1px solid var(--info-border)",
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

function ProtectedShell() {
  const isMobile = useIsMobile();
  const { currentSeller, authLoading } = useSellerAuth();

  if (authLoading) {
    return <div style={{ padding: "40px", color: "var(--text-secondary)" }}>Loading...</div>;
  }

  if (!currentSeller) return <Navigate to="/login" replace />;
  if (!currentSeller.id) return <Navigate to="/onboarding" replace />;

  if (currentSeller.kyc_status !== "approved") {
    return (
      <div style={{ padding: "40px", maxWidth: "680px", margin: "0 auto" }}>
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-soft)",
            borderRadius: "20px",
            padding: "24px",
            display: "grid",
            gap: "12px",
            boxShadow: "var(--shadow-soft)"
          }}
        >
          <h1 style={{ margin: 0, color: "var(--text-primary)" }}>Seller profile under review</h1>
          <p style={{ color: "var(--text-secondary)", margin: 0, lineHeight: 1.7 }}>
            Your seller account exists, but access to the full portal requires admin approval.
          </p>
          <p style={{ margin: 0, color: "var(--text-primary)" }}>
            Current KYC status: <strong>{currentSeller.kyc_status || "pending"}</strong>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-app-gradient)",
        color: "var(--text-primary)",
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
        <div style={{ minWidth: 0 }}>
          <Sidebar isMobile={isMobile} />
        </div>

        <main style={{ minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/new" element={<AddProductPage />} />
            <Route path="/products/:id/edit" element={<EditProductPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <SellerAuthProvider>
        <AppRoutes />
      </SellerAuthProvider>
    </BrowserRouter>
  );
}
