import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";

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
        const res = await apiGet(`/commerce/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
        alert("تعذر تحميل تفاصيل الطلب");
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
    <section className="page-shell" dir="rtl">
      <div style={s.topRow}>
        <div>
          <h1 style={s.title}>تفاصيل الطلب</h1>
          <p style={s.subTitle}>طلب #{order.id}</p>
        </div>

        <Link to="/orders" style={s.backBtn}>
          الرجوع إلى الطلبات
        </Link>
      </div>

      <div style={s.grid}>
        <div style={s.card}>
          <h3 style={s.cardTitle}>معلومات الطلب</h3>
          <div style={s.infoLine}><strong>البائع:</strong> {order.seller_name || order.seller_id}</div>
          <div style={s.infoLine}><strong>الإجمالي:</strong> {order.total_mad} {order.currency}</div>
          <div style={s.infoLine}><strong>طريقة الدفع:</strong> {order.payment_method}</div>
          <div style={s.infoLine}><strong>حالة الدفع:</strong> {order.payment_status}</div>
          <div style={s.infoLine}><strong>حالة الشحن:</strong> {order.shipping_status}</div>
          <div style={s.infoLine}><strong>تاريخ الإنشاء:</strong> {order.created_at}</div>

          <div style={{ marginTop: "10px" }}>
            <strong>حالة الطلب:</strong>{" "}
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
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>معلومات المشتري</h3>
          <div style={s.infoLine}><strong>الاسم:</strong> {order.buyer_name || "غير معروف"}</div>
          <div style={s.infoLine}><strong>الهاتف:</strong> {order.buyer_phone || "بدون هاتف"}</div>
          <div style={s.infoLine}><strong>المدينة:</strong> {order.buyer_city || "غير معروفة"}</div>
          <div style={s.infoLine}><strong>العنوان:</strong> {order.buyer_address || "بدون عنوان"}</div>
          <div style={s.infoLine}><strong>Buyer ID:</strong> {order.buyer_user_id || "-"}</div>
        </div>
      </div>

      <div style={s.card}>
        <h3 style={s.cardTitle}>المنتجات</h3>

        {order.items?.length ? (
          <div style={s.itemsGrid}>
            {order.items.map((item) => (
              <div key={item.id} style={s.itemCard}>
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title_ar || item.product_id}
                    style={s.itemImage}
                  />
                ) : (
                  <div style={s.noImage}>No image</div>
                )}

                <div style={s.itemBody}>
                  <div style={s.itemTitle}>{item.title_ar || item.product_id}</div>
                  <div style={s.itemMeta}>Slug: {item.slug || "-"}</div>
                  <div style={s.itemMeta}>الكمية: {item.quantity}</div>
                  <div style={s.itemPrice}>سعر الوحدة: {item.unit_price_mad} MAD</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ margin: 0 }}>لا توجد منتجات داخل هذا الطلب.</p>
        )}
      </div>
    </section>
  );
}

const s = {
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  title: {
    margin: 0
  },
  subTitle: {
    margin: "6px 0 0",
    color: "#64748b"
  },
  backBtn: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#111827",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "700",
    height: "fit-content"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    display: "grid",
    gap: "12px"
  },
  cardTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "800"
  },
  infoLine: {
    color: "#334155",
    lineHeight: 1.8
  },
  itemsGrid: {
    display: "grid",
    gap: "12px"
  },
  itemCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    gap: "12px",
    alignItems: "start"
  },
  itemImage: {
    width: "100%",
    height: "110px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #e2e8f0"
  },
  noImage: {
    width: "100%",
    height: "110px",
    borderRadius: "10px",
    background: "#f8fafc",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    border: "1px solid #e2e8f0"
  },
  itemBody: {
    display: "grid",
    gap: "6px"
  },
  itemTitle: {
    fontWeight: "800",
    color: "#0f172a"
  },
  itemMeta: {
    color: "#64748b",
    fontSize: "14px"
  },
  itemPrice: {
    color: "#111827",
    fontWeight: "700"
  }
};
