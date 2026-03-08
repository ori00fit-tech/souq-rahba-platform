import { Link } from "react-router-dom";

const stats = [
  {
    title: "Total Sales",
    value: "24,500 MAD",
    note: "+12.4% this month"
  },
  {
    title: "Orders",
    value: "128",
    note: "18 new today"
  },
  {
    title: "Active Products",
    value: "18",
    note: "3 low stock"
  },
  {
    title: "Pending Payout",
    value: "6,200 MAD",
    note: "Next payout in 2 days"
  }
];

const recentOrders = [
  { id: "ORD-1001", customer: "Ali", total: "540 MAD", status: "Pending" },
  { id: "ORD-1002", customer: "Sara", total: "120 MAD", status: "Shipped" },
  { id: "ORD-1003", customer: "Youssef", total: "980 MAD", status: "Delivered" },
  { id: "ORD-1004", customer: "Meryem", total: "310 MAD", status: "Pending" }
];

const lowStockProducts = [
  { name: "Ice Box", stock: 5 },
  { name: "Fishing Hooks Pack", stock: 4 },
  { name: "Fresh Shrimp Box", stock: 2 }
];

const quickActions = [
  { label: "Add Product", to: "/products" },
  { label: "View Orders", to: "/orders" },
  { label: "Check Earnings", to: "/earnings" },
  { label: "Store Settings", to: "/settings" }
];

function cardStyle() {
  return {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "22px",
    padding: "20px",
    boxShadow: "0 14px 34px rgba(15, 23, 42, 0.06)"
  };
}

function getStatusStyle(status) {
  if (status === "Delivered") {
    return {
      background: "#ecfdf5",
      color: "#166534",
      border: "1px solid #bbf7d0"
    };
  }

  if (status === "Shipped") {
    return {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe"
    };
  }

  return {
    background: "#fff7ed",
    color: "#9a3412",
    border: "1px solid #fed7aa"
  };
}

export default function DashboardPage() {
  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <section
        style={{
          ...cardStyle(),
          background:
            "linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(255,255,255,1) 45%, rgba(249,250,251,1) 100%)"
        }}
      >
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#92400e" }}>
          Seller Overview
        </div>
        <h2 style={{ margin: "8px 0 10px", fontSize: "30px", color: "#0f172a" }}>
          Welcome back, Talidi Store
        </h2>
        <p style={{ margin: 0, color: "#475569", lineHeight: 1.7, maxWidth: "720px" }}>
          Monitor store performance, manage orders, follow stock levels and keep your
          marketplace operations under control from one dashboard.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "14px"
        }}
      >
        {stats.map((item) => (
          <div key={item.title} style={cardStyle()}>
            <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 700 }}>
              {item.title}
            </div>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                marginTop: "8px"
              }}
            >
              {item.value}
            </div>
            <div style={{ marginTop: "8px", fontSize: "13px", color: "#475569" }}>
              {item.note}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px"
        }}
      >
        {quickActions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            style={{
              ...cardStyle(),
              textDecoration: "none",
              color: "#0f172a",
              fontWeight: 800,
              display: "block"
            }}
          >
            <div style={{ fontSize: "15px" }}>{action.label}</div>
            <div style={{ marginTop: "8px", fontSize: "13px", color: "#64748b" }}>
              Open section
            </div>
          </Link>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
          gap: "18px"
        }}
      >
        <div style={cardStyle()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              marginBottom: "14px",
              flexWrap: "wrap"
            }}
          >
            <h3 style={{ margin: 0, fontSize: "20px", color: "#0f172a" }}>Recent Orders</h3>
            <Link
              to="/orders"
              style={{
                textDecoration: "none",
                color: "#ea580c",
                fontWeight: 700,
                fontSize: "14px"
              }}
            >
              View all
            </Link>
          </div>

          <div style={{ display: "grid", gap: "12px" }}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  flexWrap: "wrap",
                  background: "#fcfcfd"
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{order.id}</div>
                  <div style={{ color: "#64748b", marginTop: "4px", fontSize: "14px" }}>
                    Customer: {order.customer}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, color: "#0f172a" }}>{order.total}</div>
                  <div
                    style={{
                      display: "inline-block",
                      marginTop: "6px",
                      padding: "6px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      ...getStatusStyle(order.status)
                    }}
                  >
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <div style={cardStyle()}>
            <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#0f172a" }}>
              Low Stock Alerts
            </h3>
            <div style={{ display: "grid", gap: "10px" }}>
              {lowStockProducts.map((product) => (
                <div
                  key={product.name}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "12px",
                    background: "#fff7ed"
                  }}
                >
                  <div style={{ fontWeight: 700, color: "#7c2d12" }}>{product.name}</div>
                  <div style={{ marginTop: "4px", color: "#9a3412", fontSize: "14px" }}>
                    Remaining stock: {product.stock}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={cardStyle()}>
            <h3 style={{ marginTop: 0, marginBottom: "14px", color: "#0f172a" }}>
              Performance Summary
            </h3>
            <div style={{ display: "grid", gap: "12px" }}>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontWeight: 700
                }}
              >
                Conversion rate improved this week
              </div>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  background: "#ecfdf5",
                  color: "#166534",
                  fontWeight: 700
                }}
              >
                Most orders came from featured products
              </div>
              <div
                style={{
                  padding: "12px",
                  borderRadius: "14px",
                  background: "#fff7ed",
                  color: "#9a3412",
                  fontWeight: 700
                }}
              >
                Restock 3 items before weekend demand
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
