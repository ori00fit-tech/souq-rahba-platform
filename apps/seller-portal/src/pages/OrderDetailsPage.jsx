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
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <h2 style={{ margin: 0 }}>Order Details</h2>
          <p style={{ color: "#64748b", marginTop: "6px" }}>
            Order #{order.id}
          </p>
        </div>

        <Link
          to="/orders"
          style={{
            padding: "10px 14px",
            borderRadius: "10px",
            background: "#111827",
            color: "#fff",
            textDecoration: "none",
            fontWeight: "700",
            height: "fit-content"
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
        <div><strong>Buyer:</strong> {order.buyer_user_id || "Guest"}</div>
        <div><strong>Seller:</strong> {order.seller_id}</div>
        <div><strong>Total:</strong> {order.total_mad} {order.currency}</div>
        <div><strong>Payment method:</strong> {order.payment_method}</div>
        <div><strong>Payment status:</strong> {order.payment_status}</div>
        <div><strong>Shipping status:</strong> {order.shipping_status}</div>
        <div>
          <strong>Order status:</strong>{" "}
          <span
            style={{
              display: "inline-block",
              marginInlineStart: "8px",
              padding: "6px 10px",
              borderRadius: "999px",
              fontSize: "13px",
              fontWeight: "700",
              ...badgeStyle(order.order_status)
            }}
          >
            {order.order_status}
          </span>
        </div>
        <div><strong>Created at:</strong> {order.created_at}</div>
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
        <h3 style={{ margin: 0 }}>Items</h3>

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
              <div><strong>{item.title_ar || item.product_id}</strong></div>
              <div style={{ color: "#64748b" }}>Slug: {item.slug || "-"}</div>
              <div>Quantity: {item.quantity}</div>
              <div>Unit price: {item.unit_price_mad} MAD</div>
            </div>
          ))
        ) : (
          <p style={{ margin: 0 }}>No items found.</p>
        )}
      </div>
    </div>
  );
}
