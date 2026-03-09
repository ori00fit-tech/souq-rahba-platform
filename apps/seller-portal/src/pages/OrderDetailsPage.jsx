import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const API = "https://souq-rahba-api.ori00fit.workers.dev";

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

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`${API}/commerce/orders/${id}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Failed to load order");
        }

        setOrder(data.data);
      } catch (err) {
        console.error(err);
        alert("Could not load order details");
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id]);

  if (loading) {
    return <div>Loading order details...</div>;
  }

  if (!order) {
    return <div>Order not found.</div>;
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap"
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Order Details</h2>
          <p style={{ color: "#64748b", margin: "6px 0 0" }}>
            Order #{order.id}
          </p>
        </div>

        <Link
          to="/orders"
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            textDecoration: "none",
            color: "#111827",
            fontWeight: "700"
          }}
        >
          Back to Orders
        </Link>
      </div>

      <div
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
            <div style={{ color: "#64748b" }}>Buyer</div>
            <div style={{ fontWeight: "700" }}>{order.buyer_user_id || "Guest"}</div>
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

        <div style={{ color: "#64748b" }}>
          Payment: {order.payment_method} · Payment status: {order.payment_status}
        </div>

        <div style={{ color: "#64748b" }}>
          Shipping: {order.shipping_status}
        </div>

        <div style={{ color: "#64748b" }}>
          Created: {order.created_at}
        </div>

        <div style={{ fontWeight: "800", fontSize: "18px" }}>
          Total: {order.total_mad} {order.currency}
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "18px",
          display: "grid",
          gap: "12px"
        }}
      >
        <h3 style={{ margin: 0 }}>Order Items</h3>

        {order.items?.length ? (
          order.items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "14px",
                display: "grid",
                gap: "6px"
              }}
            >
              <div style={{ fontWeight: "700" }}>{item.title_ar || item.product_id}</div>
              <div style={{ color: "#64748b" }}>Slug: {item.slug || "-"}</div>
              <div>Quantity: {item.quantity}</div>
              <div>Unit price: {item.unit_price_mad} MAD</div>
              <div style={{ fontWeight: "700" }}>
                Line total: {item.quantity * item.unit_price_mad} MAD
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: "#64748b" }}>No items found.</div>
        )}
      </div>
    </div>
  );
}
