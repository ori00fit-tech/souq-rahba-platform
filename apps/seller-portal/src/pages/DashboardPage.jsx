const stats = [
  { label: "Total Sales", value: "24,500 MAD" },
  { label: "Active Products", value: "18" },
  { label: "New Orders", value: "12" },
  { label: "Pending Payout", value: "6,200 MAD" }
];

const recentOrders = [
  { id: "ORD-1001", customer: "Ali", total: "540 MAD", status: "Pending" },
  { id: "ORD-1002", customer: "Sara", total: "120 MAD", status: "Shipped" },
  { id: "ORD-1003", customer: "Youssef", total: "980 MAD", status: "Delivered" }
];

export default function DashboardPage() {
  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
        }}
      >
        <div style={{ fontSize: "14px", color: "#6b7280" }}>Overview</div>
        <h2 style={{ margin: "6px 0 8px", fontSize: "30px" }}>Welcome back</h2>
        <p style={{ margin: 0, color: "#4b5563", lineHeight: 1.6 }}>
          Track your products, orders and earnings from one place.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px"
        }}
      >
        {stats.map((item) => (
          <div
            key={item.label}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "18px",
              padding: "18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
            }}
          >
            <div style={{ fontSize: "13px", color: "#6b7280" }}>{item.label}</div>
            <div style={{ fontSize: "24px", fontWeight: "700", marginTop: "8px" }}>
              {item.value}
            </div>
          </div>
        ))}
      </section>

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
        }}
      >
        <h3 style={{ marginTop: 0 }}>Recent Orders</h3>
        <div style={{ display: "grid", gap: "12px" }}>
          {recentOrders.map((order) => (
            <div
              key={order.id}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
                padding: "14px",
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div style={{ fontWeight: "700" }}>{order.id}</div>
                <div style={{ color: "#6b7280", marginTop: "4px" }}>{order.customer}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: "700" }}>{order.total}</div>
                <div style={{ color: "#2563eb", marginTop: "4px" }}>{order.status}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
