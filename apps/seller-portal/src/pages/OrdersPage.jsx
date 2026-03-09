import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiGet, apiPatch } from "../lib/api";
import { useSellerAuth } from "../context/SellerAuthContext";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function badgeStyle(status) {
  if (status === "delivered") return { background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0" };
  if (status === "shipped") return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  if (status === "confirmed") return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
  if (status === "cancelled") return { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
  return { background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1" };
}

export default function OrdersPage() {
  const { currentSeller, authLoading } = useSellerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (!currentSeller) return;
        setLoading(true);
        const res = await apiGet(`/commerce/orders?seller_id=${currentSeller.id}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Could not load orders");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadOrders();
    }
  }, [currentSeller, authLoading]);

  if (!authLoading && !currentSeller) {
    return <Navigate to="/login" replace />;
  }

  async function updateStatus(orderId, orderStatus) {
    try {
      const res = await apiPatch(`/commerce/orders/${orderId}/status`, {
        order_status: orderStatus
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, order_status: orderStatus } : order
          )
        );
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update order status");
    }
  }

  if (loading || authLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div>
        <h2 style={{ marginBottom: "6px" }}>Seller Orders</h2>
        <p style={{ color: "#64748b", margin: 0 }}>Manage orders for your store</p>
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        {orders.length === 0 ? (
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "20px" }}>
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
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: "700", fontSize: "16px" }}>Order #{order.id}</div>
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

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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

              <Link
                to={`/orders/${order.id}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: "10px",
                  background: "#ea580c",
                  color: "#fff",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
