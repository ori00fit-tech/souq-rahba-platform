import { useEffect, useState } from "react";

const API = "https://souq-rahba-api.ori00fit.workers.dev";
const SELLER_ID = "s1";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function badgeStyle(status) {
  if (status === "delivered") {
    return {
      background: "#ecfdf5",
      color: "#166534",
      border: "1px solid #bbf7d0"
    };
  }

  if (status === "shipped") {
    return {
      background: "#eff6ff",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe"
    };
  }

  if (status === "confirmed") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a"
    };
  }

  if (status === "cancelled") {
    return {
      background: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fecaca"
    };
  }

  return {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #cbd5e1"
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      setLoading(true);

      const res = await fetch(`${API}/commerce/orders?seller_id=${SELLER_ID}`);
      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to load orders");
      }

      setOrders(data.data || []);
    } catch (err) {
      console.error(err);
      alert("Could not load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function updateStatus(orderId, orderStatus) {
    try {
      const res = await fetch(`${API}/commerce/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          order_status: orderStatus
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, order_status: orderStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  }

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div>
        <h2 style={{ marginBottom: "6px" }}>Seller Orders</h2>
        <p style={{ color: "#64748b", margin: 0 }}>
          Manage orders for your store
        </p>
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        {orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "20px"
            }}
          >
            No orders found.
          </div>
        ) : null}

        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "18px",
              display: "grid",
              gap: "12px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <div>
                <div style={{ fontWeight: "700", fontSize: "16px" }}>
                  Order #{order.id}
                </div>
                <div style={{ color: "#64748b", marginTop: "4px" }}>
                  Total: {order.total_mad} {order.currency}
                </div>
              </div>

              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "700",
                  ...badgeStyle(order.order_status)
                }}
              >
                {order.order_status}
              </div>
            </div>

            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Payment: {order.payment_method} · Payment status: {order.payment_status}
            </div>

            <div style={{ color: "#64748b", fontSize: "14px" }}>
              Shipping: {order.shipping_status} · Created: {order.created_at}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center"
              }}
            >
              <span style={{ fontWeight: "700" }}>Change status:</span>

              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(order.id, status)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "10px",
                    border: "1px solid #e2e8f0",
                    background: order.order_status === status ? "#111827" : "#fff",
                    color: order.order_status === status ? "#fff" : "#111827",
                    cursor: "pointer",
                    fontWeight: "700"
                  }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
