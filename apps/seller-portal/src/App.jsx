import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import EarningsPage from "./pages/EarningsPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
        <aside style={{ width: "240px", padding: "24px", borderRight: "1px solid #ddd" }}>
          <h2>Seller Portal</h2>
          <nav style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "24px" }}>
            <Link to="/">Dashboard</Link>
            <Link to="/products">Products</Link>
            <Link to="/orders">Orders</Link>
            <Link to="/earnings">Earnings</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        </aside>

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
