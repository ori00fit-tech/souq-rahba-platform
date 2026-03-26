import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { apiGet, apiPatch } from "../lib/api";
import { useSellerAuth } from "../context/SellerAuthContext";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function statusMeta(status) {
  if (status === "delivered") {
    return { label: "تم التسليم", bg: "#ecfdf5", color: "#166534", border: "#bbf7d0" };
  }
  if (status === "shipped") {
    return { label: "تم الشحن", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
  }
  if (status === "confirmed") {
    return { label: "تم التأكيد", bg: "#fef3c7", color: "#92400e", border: "#fde68a" };
  }
  if (status === "cancelled") {
    return { label: "ملغي", bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  }
  return { label: "قيد الانتظار", bg: "#f8fafc", color: "#475569", border: "#cbd5e1" };
}

function paymentMeta(status) {
  if (status === "paid") {
    return { label: "مدفوع", bg: "#ecfdf5", color: "#166534", border: "#bbf7d0" };
  }
  if (status === "cancelled") {
    return { label: "ملغي", bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  }
  return { label: "غير مدفوع", bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" };
}

function formatMoney(value, currency = "MAD") {
  return `${Number(value || 0)} ${currency}`;
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

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_mad || 0), 0);
    const pendingOrders = orders.filter((order) => order.order_status === "pending").length;
    const shippedOrders = orders.filter((order) => order.order_status === "shipped").length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      shippedOrders
    };
  }, [orders]);

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
      <div style={s.hero}>
        <div>
          <div style={s.eyebrow}>Rahba Seller Orders</div>
          <h1 style={s.heroTitle}>الطلبات</h1>
          <p style={s.heroText}>
            راقب الطلبات، حدّث الحالات، وتتبع الدفع والشحن من واجهة أكثر وضوحًا واحترافية.
          </p>
        </div>

        <div style={s.statsGrid}>
          <div style={s.statCard}>
            <span style={s.statLabel}>إجمالي الطلبات</span>
            <strong style={s.statValue}>{stats.totalOrders}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>إجمالي المداخيل</span>
            <strong style={s.statValue}>{formatMoney(stats.totalRevenue)}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>قيد الانتظار</span>
            <strong style={s.statValue}>{stats.pendingOrders}</strong>
          </div>

          <div style={s.statCard}>
            <span style={s.statLabel}>تم الشحن</span>
            <strong style={s.statValue}>{stats.shippedOrders}</strong>
          </div>
        </div>
      </div>

      {message ? <div className="ui-message">{message}</div> : null}

      <div style={s.list}>
        {orders.length === 0 ? (
          <div style={s.emptyCard}>لا توجد طلبات حالياً.</div>
        ) : null}

        {orders.map((order) => {
          const orderStatus = statusMeta(order.order_status);
          const shippingStatus = statusMeta(order.shipping_status);
          const paymentStatus = paymentMeta(order.payment_status);

          return (
            <article key={order.id} style={s.card}>
              <div style={s.header}>
                <div style={s.headerMain}>
                  <div style={s.orderTopLine}>
                    <div style={s.orderNumber}>{order.order_number || "طلب بدون رقم"}</div>
                    <span
                      style={{
                        ...s.mainStatusBadge,
                        background: orderStatus.bg,
                        color: orderStatus.color,
                        border: `1px solid ${orderStatus.border}`
                      }}
                    >
                      {orderStatus.label}
                    </span>
                  </div>

                  <div style={s.subMeta}>
                    <span>تاريخ الإنشاء: {order.created_at || "—"}</span>
                    <span>•</span>
                    <span>{order.items_count ?? 0} منتج</span>
                    <span>•</span>
                    <span>المعرّف: {order.id}</span>
                  </div>
                </div>

                <div style={s.headerSide}>
                  <div style={s.totalPrice}>
                    {formatMoney(order.total_mad, order.currency || "MAD")}
                  </div>
                  <div style={s.smallMuted}>الإجمالي</div>
                </div>
              </div>

              <div style={s.contentGrid}>
                <div style={s.panel}>
                  <div style={s.panelTitle}>معلومات المشتري</div>
                  <div style={s.infoRow}><span style={s.infoKey}>الاسم</span><strong style={s.infoValue}>{order.buyer_name || "اسم غير معروف"}</strong></div>
                  <div style={s.infoRow}><span style={s.infoKey}>الهاتف</span><strong style={s.infoValue}>{order.buyer_phone || "بدون هاتف"}</strong></div>
                  <div style={s.infoRow}><span style={s.infoKey}>المدينة</span><strong style={s.infoValue}>{order.buyer_city || "مدينة غير معروفة"}</strong></div>
                  <div style={s.infoRow}><span style={s.infoKey}>العنوان</span><strong style={s.infoValue}>{order.buyer_address || "بدون عنوان"}</strong></div>
                </div>

                <div style={s.panel}>
                  <div style={s.panelTitle}>الدفع والشحن</div>

                  <div style={s.badgesWrap}>
                    <span
                      style={{
                        ...s.infoBadge,
                        background: paymentStatus.bg,
                        color: paymentStatus.color,
                        border: `1px solid ${paymentStatus.border}`
                      }}
                    >
                      الدفع: {paymentStatus.label}
                    </span>

                    <span
                      style={{
                        ...s.infoBadge,
                        background: shippingStatus.bg,
                        color: shippingStatus.color,
                        border: `1px solid ${shippingStatus.border}`
                      }}
                    >
                      الشحن: {shippingStatus.label}
                    </span>
                  </div>

                  <div style={s.infoRow}><span style={s.infoKey}>طريقة الدفع</span><strong style={s.infoValue}>{order.payment_method || "—"}</strong></div>
                  <div style={s.infoRow}><span style={s.infoKey}>رقم التتبع</span><strong style={s.infoValue}>{order.tracking_number || "لا يوجد بعد"}</strong></div>
                  <div style={s.infoRow}><span style={s.infoKey}>العملة</span><strong style={s.infoValue}>{order.currency || "MAD"}</strong></div>
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
                        background: order.order_status === status ? "#0f172a" : "#fff",
                        color: order.order_status === status ? "#fff" : "#111827",
                        border: order.order_status === status ? "1px solid #0f172a" : "1px solid #e2e8f0"
                      }}
                    >
                      {statusMeta(status).label}
                    </button>
                  ))}
                </div>

                <Link to={`/orders/${order.id}`} style={s.detailsLink}>
                  عرض التفاصيل
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

const s = {
  hero: {
    background: "linear-gradient(135deg, #0f172a 0%, #16356b 45%, #0f766e 100%)",
    borderRadius: "22px",
    padding: "22px",
    color: "#fff",
    display: "grid",
    gap: "18px",
    marginBottom: "18px",
    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.18)"
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.85
  },
  heroTitle: {
    margin: "4px 0 8px",
    fontSize: "30px",
    fontWeight: "900",
    lineHeight: 1.15
  },
  heroText: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.9,
    maxWidth: "760px",
    color: "rgba(255,255,255,0.9)"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },
  statCard: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  statLabel: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.82)",
    fontWeight: "700"
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#fff"
  },
  list: {
    display: "grid",
    gap: "16px"
  },
  emptyCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "20px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gap: "16px",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    flexWrap: "wrap",
    alignItems: "start"
  },
  headerMain: {
    display: "grid",
    gap: "8px"
  },
  orderTopLine: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    alignItems: "center"
  },
  orderNumber: {
    fontWeight: "900",
    fontSize: "19px",
    color: "#0f172a"
  },
  mainStatusBadge: {
    padding: "7px 11px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800"
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
    gap: "4px",
    justifyItems: "end"
  },
  totalPrice: {
    fontWeight: "900",
    fontSize: "22px",
    color: "#0f172a"
  },
  smallMuted: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700"
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px"
  },
  panel: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  panelTitle: {
    fontWeight: "900",
    fontSize: "15px",
    color: "#0f172a"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    borderBottom: "1px dashed #e2e8f0",
    paddingBottom: "8px"
  },
  infoKey: {
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "700"
  },
  infoValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "800",
    textAlign: "left"
  },
  badgesWrap: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "4px"
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
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px"
  },
  detailsLink: {
    padding: "11px 15px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "800",
    boxShadow: "0 10px 24px rgba(249,115,22,0.22)"
  }
};
