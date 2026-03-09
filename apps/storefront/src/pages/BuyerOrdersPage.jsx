import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";

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

export default function BuyerOrdersPage() {
  const navigate = useNavigate();
  const { currentUser, authLoading } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (authLoading) return;

        if (!currentUser) {
          navigate("/auth");
          return;
        }

        if (currentUser.role !== "buyer") {
          return;
        }

        const res = await apiGet(`/commerce/orders?buyer_user_id=${currentUser.id}`);
        if (res.ok) {
          setOrders(res.data || []);
        }
      } catch (err) {
        console.error(err);
        alert("تعذر تحميل الطلبات");
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [currentUser, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <section className="container section-space">
        <p>جاري تحميل الطلبات...</p>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="container section-space">
        <p>جاري التحويل إلى تسجيل الدخول...</p>
      </section>
    );
  }

  return (
    <section className="container section-space">
      <div style={{ display: "grid", gap: "20px" }}>
        <div>
          <h1>طلباتي</h1>
          <p style={{ color: "#64748b" }}>تتبع طلباتك الحالية والسابقة</p>
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "14px",
              padding: "20px"
            }}
          >
            لا توجد طلبات بعد.
          </div>
        ) : null}

        <div style={{ display: "grid", gap: "14px" }}>
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                padding: "18px",
                display: "grid",
                gap: "10px"
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

              <div>
                <Link
                  to={`/my-orders/${order.id}`}
                  style={{
                    display: "inline-block",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "#111827",
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
    </section>
  );
}
