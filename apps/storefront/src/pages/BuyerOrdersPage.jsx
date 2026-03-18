import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";

function badgeStyle(status) {
  if (status === "delivered") {
    return { background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0" };
  }
  if (status === "shipped") {
    return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  }
  if (status === "confirmed") {
    return { background: "#fff7ed", color: "#c2410c", border: "1px solid #fdba74" };
  }
  if (status === "cancelled") {
    return { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" };
  }
  return { background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1" };
}

export default function BuyerOrdersPage() {
  const { currentUser, authLoading } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrders() {
      try {
        if (!currentUser?.id) return;
        setLoading(true);
        const res = await apiGet(`/commerce/orders?buyer_user_id=${currentUser.id}`);
        setOrders(res.data || []);
      } catch (err) {
        console.error(err);
        alert("تعذر تحميل طلباتك");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadOrders();
    }
  }, [currentUser, authLoading]);

  if (!authLoading && !currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || authLoading) {
    return (
      <section className="container section-space" dir="rtl">
        <p>جاري تحميل الطلبات...</p>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>طلباتي</h1>
          <p style={s.muted}>تابع حالة طلباتك وعناوين التوصيل المحفوظة</p>
        </div>

        {orders.length === 0 ? (
          <div style={s.empty}>لا توجد طلبات بعد</div>
        ) : (
          <div style={s.list}>
            {orders.map((order) => (
              <article key={order.id} style={s.card}>
                <div style={s.cardTop}>
                  <div>
                    <div style={s.orderNumber}>{order.order_number || order.id}</div>
                    <div style={s.orderMeta}>تاريخ الإنشاء: {order.created_at}</div>
                  </div>

                  <div
                    style={{
                      ...s.badge,
                      ...badgeStyle(order.order_status)
                    }}
                  >
                    {order.order_status}
                  </div>
                </div>

                <div style={s.infoGrid}>
                  <div><strong>المتجر:</strong> {order.seller_name || order.seller_id}</div>
                  <div><strong>الإجمالي:</strong> {order.total_mad} {order.currency}</div>
                  <div><strong>الهاتف:</strong> {order.buyer_phone || "—"}</div>
                  <div><strong>المدينة:</strong> {order.buyer_city || "—"}</div>
                </div>

                <div style={s.addressBox}>
                  <strong>العنوان:</strong> {order.buyer_address || "غير متوفر"}
                </div>

                <div style={s.actions}>
                  <Link to={`/my-orders/${order.id}`} style={s.linkBtn}>
                    عرض التفاصيل
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const s = {
  page: { display: "grid", gap: "18px" },
  header: { display: "grid", gap: "6px" },
  title: { margin: 0, color: "#1b3a6b" },
  muted: { margin: 0, color: "#6e6357" },
  empty: {
    background: "#fff",
    border: "1px solid #e6dccf",
    borderRadius: "18px",
    padding: "20px"
  },
  list: {
    display: "grid",
    gap: "16px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e6dccf",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "14px",
    boxShadow: "0 10px 28px rgba(27,58,107,0.06)"
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap"
  },
  orderNumber: {
    fontWeight: 800,
    color: "#1b3a6b",
    fontSize: "18px"
  },
  orderMeta: {
    color: "#6e6357",
    marginTop: "6px"
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
    height: "fit-content"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    color: "#221d16"
  },
  addressBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#fffdfa",
    border: "1px solid #f0e7dc"
  },
  actions: {
    display: "flex",
    justifyContent: "flex-start"
  },
  linkBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#1b3a6b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800
  }
};
