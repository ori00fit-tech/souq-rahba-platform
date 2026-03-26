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

function statusLabel(status) {
  if (status === "pending") return "قيد الانتظار";
  if (status === "confirmed") return "تم التأكيد";
  if (status === "shipped") return "تم الشحن";
  if (status === "delivered") return "تم التسليم";
  if (status === "cancelled") return "ملغي";
  return status || "—";
}

function paymentLabel(status) {
  if (status === "paid") return "مدفوع";
  if (status === "unpaid") return "غير مدفوع";
  if (status === "cancelled") return "ملغي";
  return status || "—";
}

function infoBadgeStyle(kind) {
  if (kind === "payment_paid") {
    return { background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0" };
  }
  if (kind === "payment_unpaid") {
    return { background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" };
  }
  if (kind === "shipping") {
    return { background: "#eef6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  }
  return { background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1" };
}

export default function OrdersPage() {
  const { currentSeller, authLoading } = useSellerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadOrders() {
    try {
      if (!currentSeller?.id) return;

      setLoading(true);
      setMessage("");

      const res = await apiGet(`/commerce/orders?seller_id=${encodeURIComponent(currentSeller.id)}`);

      if (!res?.ok) {
        setMessage(res?.message || "تعذر تحميل الطلبات");
        setOrders([]);
        return;
      }

      setOrders(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setMessage("تعذر تحميل الطلبات");
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

      if (!res?.ok) {
        setMessage(res?.message || "فشل تحديث حالة الطلب");
        return;
      }

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status: res.data?.order_status || nextStatus,
                shipping_status: res.data?.shipping_status || order.shipping_status,
                payment_status: res.data?.payment_status || order.payment_status,
                tracking_number: res.data?.tracking_number || order.tracking_number
              }
            : order
        )
      );
    } catch (err) {
      console.error("فشل تحديث الحالة:", err);
      setMessage("فشل تحديث حالة الطلب");
    }
  }

  if (loading || authLoading) {
    return <div className="page-shell">جاري تحميل الطلبات...</div>;
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>الطلبات</h1>
        <p>إدارة الطلبات الخاصة بمتجرك ومتابعة بيانات المشترين</p>
      </div>

      {message ? <div className="ui-message">{message}</div> : null}

      <div style={s.list}>
        {orders.length === 0 ? (
          <div style={s.emptyCard}>لا توجد طلبات حالياً.</div>
        ) : null}

        {orders.map((order) => (
          <article key={order.id} style={s.card}>
            <div style={s.header}>
              <div style={s.headerMain}>
                <div style={s.orderNumber}>{order.order_number || `طلب ${order.id}`}</div>
                <div style={s.subMeta}>
                  <span>تاريخ الإنشاء: {order.created_at || "—"}</span>
                  <span>•</span>
                  <span>{order.items_count ?? 0} منتج</span>
                </div>
              </div>

              <div style={s.headerSide}>
                <div style={s.totalPrice}>
                  {Number(order.total_mad || 0)} {order.currency || "MAD"}
                </div>
                <div style={{ ...s.statusBadge, ...badgeStyle(order.order_status) }}>
                  {statusLabel(order.order_status)}
                </div>
              </div>
            </div>

            <div style={s.grid}>
              <div style={s.infoBox}>
                <div style={s.boxTitle}>معلومات المشتري</div>
                <div style={s.infoLine}><strong>الاسم:</strong> {order.buyer_name || "اسم غير معروف"}</div>
                <div style={s.infoLine}><strong>الهاتف:</strong> {order.buyer_phone || "بدون هاتف"}</div>
                <div style={s.infoLine}><strong>المدينة:</strong> {order.buyer_city || "مدينة غير معروفة"}</div>
                <div style={s.infoLine}><strong>العنوان:</strong> {order.buyer_address || "بدون عنوان"}</div>
              </div>

              <div style={s.infoBox}>
                <div style={s.boxTitle}>معلومات الطلب</div>

                <div style={s.badgesWrap}>
                  <span
                    style={{
                      ...s.infoBadge,
                      ...(order.payment_status === "paid"
                        ? infoBadgeStyle("payment_paid")
                        : infoBadgeStyle("payment_unpaid"))
                    }}
                  >
                    الدفع: {paymentLabel(order.payment_status)}
                  </span>

                  <span
                    style={{
                      ...s.infoBadge,
                      ...infoBadgeStyle("shipping")
                    }}
                  >
                    الشحن: {statusLabel(order.shipping_status)}
                  </span>
                </div>

                <div style={s.infoLine}><strong>طريقة الدفع:</strong> {order.payment_method || "—"}</div>
                <div style={s.infoLine}><strong>رقم التتبع:</strong> {order.tracking_number || "—"}</div>
                <div style={s.infoLine}><strong>معرّف الطلب:</strong> {order.id}</div>
              </div>
            </div>

            <div style={s.footer}>
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
                    {statusLabel(status)}
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
  list: {
    display: "grid",
    gap: "14px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "16px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)"
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "start"
  },
  headerMain: {
    display: "grid",
    gap: "6px"
  },
  orderNumber: {
    fontWeight: "900",
    fontSize: "18px",
    color: "#0f172a"
  },
  subMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: "13px"
  },
  headerSide: {
    display: "grid",
    gap: "8px",
    justifyItems: "end"
  },
  totalPrice: {
    fontWeight: "900",
    fontSize: "20px",
    color: "#0f172a"
  },
  statusBadge: {
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
    gap: "10px"
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
  badgesWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  infoBadge: {
    padding: "7px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800"
  },
  footer: {
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
    fontWeight: "700"
  }
};
