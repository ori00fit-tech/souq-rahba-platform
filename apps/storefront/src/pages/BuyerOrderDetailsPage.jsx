import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
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

export default function BuyerOrderDetailsPage() {
  const { id } = useParams();
  const { currentUser, authLoading } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true);
        const res = await apiGet(`/commerce/orders/${id}`);
        setOrder(res.data || null);
      } catch (err) {
        console.error(err);
        alert("تعذر تحميل تفاصيل الطلب");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && currentUser) {
      loadOrder();
    }
  }, [id, currentUser, authLoading]);

  if (!authLoading && !currentUser) {
    return <Navigate to="/auth" replace />;
  }

  if (loading || authLoading) {
    return (
      <section className="container section-space" dir="rtl">
        <p>جاري تحميل تفاصيل الطلب...</p>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="container section-space" dir="rtl">
        <p>الطلب غير موجود</p>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.top}>
          <div>
            <h1 style={s.title}>تفاصيل الطلب</h1>
            <p style={s.muted}>{order.order_number || order.id}</p>
          </div>

          <Link to="/my-orders" style={s.backBtn}>
            رجوع إلى طلباتي
          </Link>
        </div>

        <div style={s.card}>
          <div style={s.row}>
            <span>حالة الطلب</span>
            <span style={{ ...s.badge, ...badgeStyle(order.order_status) }}>
              {order.order_status}
            </span>
          </div>

          <div style={s.infoGrid}>
            <div><strong>المتجر:</strong> {order.seller_name || order.seller_id}</div>
            <div><strong>الإجمالي:</strong> {order.total_mad} {order.currency}</div>
            <div><strong>طريقة الدفع:</strong> {order.payment_method}</div>
            <div><strong>حالة الدفع:</strong> {order.payment_status}</div>
            <div><strong>حالة الشحن:</strong> {order.shipping_status}</div>
            <div><strong>تاريخ الإنشاء:</strong> {order.created_at}</div>
          </div>
        </div>

        <div style={s.card}>
          <h2 style={s.sectionTitle}>بيانات التوصيل</h2>
          <div style={s.infoGrid}>
            <div><strong>الاسم:</strong> {order.buyer_name || "—"}</div>
            <div><strong>الهاتف:</strong> {order.buyer_phone || "—"}</div>
            <div><strong>المدينة:</strong> {order.buyer_city || "—"}</div>
            <div><strong>رقم التتبع:</strong> {order.tracking_number || "—"}</div>
          </div>

          <div style={s.addressBox}>
            <strong>العنوان:</strong> {order.buyer_address || "غير متوفر"}
          </div>

          {order.notes ? (
            <div style={s.addressBox}>
              <strong>ملاحظات:</strong> {order.notes}
            </div>
          ) : null}
        </div>

        <div style={s.card}>
          <h2 style={s.sectionTitle}>المنتجات</h2>

          <div style={s.itemsList}>
            {(order.items || []).map((item) => (
              <div key={item.id} style={s.itemCard}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title_ar} style={s.itemImage} />
                ) : (
                  <div style={s.noImage}>No image</div>
                )}

                <div style={s.itemBody}>
                  <div style={s.itemTitle}>{item.title_ar || item.product_id}</div>
                  <div style={s.itemMeta}>الكمية: {item.quantity}</div>
                  <div style={s.itemMeta}>السعر الفردي: {item.unit_price_mad} MAD</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  page: { display: "grid", gap: "18px" },
  top: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  title: { margin: 0, color: "#1b3a6b" },
  muted: { margin: "6px 0 0", color: "#6e6357" },
  backBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#1b3a6b",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800
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
  sectionTitle: {
    margin: 0,
    color: "#1b3a6b"
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 800
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px"
  },
  addressBox: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "#fffdfa",
    border: "1px solid #f0e7dc"
  },
  itemsList: {
    display: "grid",
    gap: "12px"
  },
  itemCard: {
    border: "1px solid #eee4d8",
    borderRadius: "16px",
    padding: "12px",
    display: "grid",
    gridTemplateColumns: "90px 1fr",
    gap: "12px",
    alignItems: "center"
  },
  itemImage: {
    width: "90px",
    height: "90px",
    objectFit: "cover",
    borderRadius: "12px",
    border: "1px solid #e6dccf"
  },
  noImage: {
    width: "90px",
    height: "90px",
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: "#f8fafc",
    color: "#94a3b8",
    border: "1px solid #e6dccf"
  },
  itemBody: {
    display: "grid",
    gap: "6px"
  },
  itemTitle: {
    fontWeight: 800,
    color: "#221d16"
  },
  itemMeta: {
    color: "#6e6357"
  }
};
