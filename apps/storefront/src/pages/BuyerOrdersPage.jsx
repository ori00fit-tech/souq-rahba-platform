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

function shippingText(order) {
  if (order.order_status === "delivered") return "تم التسليم";
  if (order.order_status === "shipped") return "في الطريق إليك";
  if (order.order_status === "confirmed") return "تم تأكيد الطلب";
  if (order.order_status === "cancelled") return "تم إلغاء الطلب";
  return "قيد المعالجة";
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
        <div style={s.loadingCard}>جاري تحميل الطلبات...</div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.header}>
          <h1 style={s.title}>طلباتي</h1>
          <p style={s.muted}>تابع حالة طلباتك ومعلومات التوصيل بشكل واضح ومنظم</p>
        </div>

        {orders.length === 0 ? (
          <div style={s.empty}>
            <div style={s.emptyTitle}>لا توجد طلبات بعد</div>
            <p style={s.emptyText}>بعد إتمام أول طلب، ستظهر جميع تفاصيله هنا.</p>
            <Link to="/products" style={s.primaryBtn}>
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div style={s.list}>
            {orders.map((order) => (
              <article key={order.id} style={s.card}>
                <div style={s.cardTop}>
                  <div style={s.orderMain}>
                    <div style={s.orderNumber}>{order.order_number || order.id}</div>
                    <div style={s.orderMeta}>تاريخ الإنشاء: {order.created_at}</div>
                  </div>

                  <div style={{ ...s.badge, ...badgeStyle(order.order_status) }}>
                    {order.order_status}
                  </div>
                </div>

                <div style={s.progressBox}>
                  <div style={s.progressTitle}>{shippingText(order)}</div>
                  <div style={s.progressSub}>
                    {order.tracking_number
                      ? `رقم التتبع: ${order.tracking_number}`
                      : "سيظهر رقم التتبع هنا عندما يتم شحن الطلب"}
                  </div>
                </div>

                <div style={s.infoGrid}>
                  <div style={s.infoItem}>
                    <span style={s.infoLabel}>المتجر</span>
                    <strong style={s.infoValue}>{order.seller_name || order.seller_id}</strong>
                  </div>

                  <div style={s.infoItem}>
                    <span style={s.infoLabel}>الإجمالي</span>
                    <strong style={s.infoValue}>{order.total_mad} {order.currency}</strong>
                  </div>

                  <div style={s.infoItem}>
                    <span style={s.infoLabel}>الهاتف</span>
                    <strong style={s.infoValue}>{order.buyer_phone || "—"}</strong>
                  </div>

                  <div style={s.infoItem}>
                    <span style={s.infoLabel}>المدينة</span>
                    <strong style={s.infoValue}>{order.buyer_city || "—"}</strong>
                  </div>
                </div>

                <div style={s.addressBox}>
                  <div style={s.addressTitle}>عنوان التوصيل</div>
                  <div style={s.addressText}>{order.buyer_address || "غير متوفر"}</div>
                </div>

                <div style={s.actions}>
                  <Link to={`/my-orders/${order.id}`} style={s.primaryBtn}>
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
  muted: { margin: 0, color: "#6e6357", lineHeight: 1.8 },
  loadingCard: {
    background: "#fff",
    border: "1px solid #e6dccf",
    borderRadius: "18px",
    padding: "20px"
  },
  empty: {
    background: "#fff",
    border: "1px solid #e6dccf",
    borderRadius: "18px",
    padding: "24px",
    display: "grid",
    gap: "12px",
    justifyItems: "start",
    boxShadow: "0 10px 28px rgba(27,58,107,0.06)"
  },
  emptyTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#1b3a6b"
  },
  emptyText: {
    margin: 0,
    color: "#6e6357"
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
    flexWrap: "wrap",
    alignItems: "center"
  },
  orderMain: {
    display: "grid",
    gap: "6px"
  },
  orderNumber: {
    fontWeight: 900,
    color: "#1b3a6b",
    fontSize: "18px"
  },
  orderMeta: {
    color: "#6e6357",
    fontSize: "14px"
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800,
    height: "fit-content"
  },
  progressBox: {
    padding: "14px",
    borderRadius: "16px",
    background: "#fffdfa",
    border: "1px solid #f0e7dc",
    display: "grid",
    gap: "6px"
  },
  progressTitle: {
    fontWeight: 800,
    color: "#1b3a6b"
  },
  progressSub: {
    color: "#6e6357",
    fontSize: "14px"
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "12px"
  },
  infoItem: {
    background: "#fff",
    border: "1px solid #f0e7dc",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "6px"
  },
  infoLabel: {
    color: "#6e6357",
    fontSize: "13px"
  },
  infoValue: {
    color: "#221d16"
  },
  addressBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#fffdfa",
    border: "1px solid #f0e7dc",
    display: "grid",
    gap: "6px"
  },
  addressTitle: {
    fontWeight: 800,
    color: "#1b3a6b"
  },
  addressText: {
    color: "#221d16",
    lineHeight: 1.8
  },
  actions: {
    display: "flex",
    justifyContent: "flex-start"
  },
  primaryBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#1b3a6b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800
  }
};
