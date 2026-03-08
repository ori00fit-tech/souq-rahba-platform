const orders = [
  { id: "ORD-1001", customer: "Ali", total: "540 MAD", status: "Pending" },
  { id: "ORD-1002", customer: "Sara", total: "120 MAD", status: "Shipped" },
  { id: "ORD-1003", customer: "Youssef", total: "980 MAD", status: "Delivered" }
];

export default function OrdersPage() {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)"
      }}
    >
      <h2 style={{ marginTop: 0 }}>Orders</h2>
      <div style={{ color: "#6b7280", marginBottom: "16px" }}>
        Latest orders from your store
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "16px",
              padding: "16px",
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
    </div>
  );
}
