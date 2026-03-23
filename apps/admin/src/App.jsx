import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SellersPage from "./pages/SellersPage";
import { AdminAuthProvider, useAdminAuth } from "./context/AdminAuthContext";

function ProtectedShell() {
  const { currentAdmin, authLoading, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  if (authLoading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (!currentAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        color: "#0f172a",
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <header
        style={{
          background: "#fff",
          borderBottom: "1px solid #e2e8f0"
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap"
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 700 }}>
              Souq Rahba
            </div>
            <div style={{ fontSize: "24px", fontWeight: 800 }}>
              Admin Portal
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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
              {currentAdmin.email}
            </div>

            <button
              onClick={() => {
                logoutAdmin();
                navigate("/login", { replace: true });
              }}
              style={{
                padding: "10px 14px",
                borderRadius: "10px",
                border: "none",
                background: "#111827",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "18px 16px 28px",
          display: "grid",
          gridTemplateColumns: "260px minmax(0,1fr)",
          gap: "18px"
        }}
      >
        <aside
          style={{
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "20px",
            padding: "18px",
            display: "grid",
            gap: "10px",
            height: "fit-content"
          }}
        >
          <Link to="/" style={navLink}>
            Seller Moderation
          </Link>
        </aside>

        <main style={{ minWidth: 0 }}>
          <Routes>
            <Route path="/" element={<SellersPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}


function GuestOnlyRoute({ children }) {
  const { currentAdmin, authLoading } = useAdminAuth();

  if (authLoading) {
    return <div style={{ padding: "40px" }}>Loading...</div>;
  }

  if (currentAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestOnlyRoute>
            <LoginPage />
          </GuestOnlyRoute>
        }
      />
      <Route path="/*" element={<ProtectedShell />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  );
}

const navLink = {
  display: "block",
  padding: "12px 14px",
  borderRadius: "12px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  color: "#0f172a",
  textDecoration: "none",
  fontWeight: "700"
};
