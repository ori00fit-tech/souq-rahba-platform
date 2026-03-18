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

  async function loadOrders() {
    try {
      if (!currentSeller) return;
      setLoading(true);
      const res = await apiGet(`/commerce/orders?seller_id=${currentSeller.id}`);
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      alert("تعذر تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading) {
      loadOrders();
    }
  }, [currentSeller, authLoading]);

  if (!authLoading && !currentSeller) {
    return <Navigate to="/login" replace />;
  }

  async function updateStatus(orderId, nextStatus) {
    try {
      const res = await apiPatch(`/commerce/orders/${orderId}/status`, {
        order_status: nextStatus
      });

      if (res?.ok) {
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  order_status: res.data?.order_status || nextStatus,
                  shipping_status: res.data?.shipping_status || order.shipping_status
                }
              : order
          )
        );
      }
    } catch (err) {
      console.error("فشل تحديث الحالة:", err);
      alert("فشل تحديث حالة الطلب");
    }
  }

  if (loading || authLoading) {
    return <div>Loading orders...</div>;
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>الطلبات</h1>
        <p>إدارة الطلبات الخاصة بمتجرك ومتابعة بيانات المشترين</p>
      </div>

      <div style={{ display: "grid", gap: "14px" }}>
        {orders.length === 0 ? (
          <div style={s.emptyCard}>
            لا توجد طلبات حالياً.
          </div>
        ) : null}

        {orders.map((order) => (
          <article key={order.id} style={s.card}>
            <div style={s.topRow}>
              <div>
                <div style={s.orderId}>طلب #{order.id}</div>
                <div style={s.metaText}>
                  تاريخ الإنشاء: {order.created_at}
                </div>
              </div>

              <div style={s.topRight}>
                <div style={s.totalPrice}>
                  {order.total_mad} {order.currency}
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
            </div>

            <div style={s.grid}>
              <div style={s.infoBox}>
                <div style={s.boxTitle}>معلومات المشتري</div>
                <div style={s.infoLine}>{order.buyer_name || "اسم غير معروف"}</div>
                <div style={s.infoLine}>{order.buyer_phone || "بدون هاتف"}</div>
                <div style={s.infoLine}>
                  {order.buyer_city || "مدينة غير معروفة"}
                </div>
                <div style={s.infoLine}>
                  {order.buyer_address || "بدون عنوان"}
                </div>
              </div>

              <div style={s.infoBox}>
                <div style={s.boxTitle}>معلومات الطلب</div>
                <div style={s.infoLine}>طريقة الدفع: {order.payment_method}</div>
                <div style={s.infoLine}>حالة الدفع: {order.payment_status}</div>
                <div style={s.infoLine}>حالة الشحن: {order.shipping_status}</div>
                <div style={s.infoLine}>
                  عدد المنتجات: {order.items_count ?? 0}
                </div>
              </div>
            </div>

            <div style={s.actionsRow}>
              <div style={s.statusButtons}>
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(order.id, status)}
                    style={{
                      ...s.statusBtn,
                      background: order.order_status === status ? "#111827" : "#fff",
                      color: order.order_status === status ? "#fff" : "#111827"
                    }}
                  >
                    {status}
                  </button>
                ))}
              </div>

              <Link to={`/orders/${order.id}`} style={s.detailsLink}>
                عرض التفاصيل
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

const s = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "grid",
    gap: "16px"
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px"
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "start"
  },
  topRight: {
    display: "grid",
    gap: "8px",
    justifyItems: "end"
  },
  orderId: {
    fontWeight: "800",
    fontSize: "17px"
  },
  metaText: {
    color: "#64748b",
    marginTop: "4px",
    fontSize: "14px"
  },
  totalPrice: {
    fontWeight: "900",
    fontSize: "18px",
    color: "#0f172a"
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "12px"
  },
  infoBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    display: "grid",
    gap: "8px"
  },
  boxTitle: {
    fontWeight: "800",
    fontSize: "15px",
    color: "#0f172a"
  },
  infoLine: {
    color: "#475569",
    fontSize: "14px",
    lineHeight: 1.7
  },
  actionsRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  statusButtons: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  statusBtn: {
    padding: "9px 12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    cursor: "pointer",
    fontWeight: "700"
  },
  detailsLink: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#ea580c",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "800"
  }
};
