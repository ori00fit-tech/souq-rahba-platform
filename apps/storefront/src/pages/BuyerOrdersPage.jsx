import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

function loadGuestOrders() {
  try {
    const raw = localStorage.getItem("guest_orders");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read guest orders", error);
    return [];
  }
}

export default function BuyerOrdersPage() {
  const navigate = useNavigate();
  const { currentUser, authLoading, currency, language } = useApp();

  const [orders, setOrders] = useState([]);
  const [guestOrders, setGuestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  const buyerId = useMemo(() => {
    return currentUser?.id || currentUser?.user_id || null;
  }, [currentUser]);

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setGuestOrders(loadGuestOrders());
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        setMessage("");

        const result = await apiGet(`/commerce/orders?buyer_user_id=${encodeURIComponent(buyerId)}`);

        if (!result?.ok) {
          setMessage(result?.message || "تعذر تحميل الطلبات");
          setOrders([]);
          return;
        }

        setOrders(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل الطلبات");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    if (buyerId) {
      loadOrders();
    } else {
      setLoading(false);
      setMessage("تعذر تحديد حساب المشتري");
    }
  }, [authLoading, currentUser, buyerId]);

  function copyText(value) {
    navigator.clipboard?.writeText(value).catch((err) => {
      console.error("copy failed", err);
    });
  }

  function getStatusMeta(status) {
    switch (status) {
      case "pending":
        return { label: "قيد الانتظار", bg: "#fff7ed", color: "#9a4f18", border: "#fed7aa" };
      case "confirmed":
        return { label: "تم التأكيد", bg: "#ecfeff", color: "#155e75", border: "#a5f3fc" };
      case "processing":
        return { label: "قيد المعالجة", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
      case "shipped":
        return { label: "تم الشحن", bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" };
      case "delivered":
        return { label: "تم التسليم", bg: "#ecfdf5", color: "#166534", border: "#bbf7d0" };
      case "cancelled":
        return { label: "ملغي", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
      default:
        return { label: status || "غير معروف", bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
    }
  }

  if (loading) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA ORDERS</div>
            <h1 className="page-title">طلباتي</h1>
            <p className="page-subtitle">جاري تحميل الطلبات...</p>
          </div>
          <div className="loading-state">جاري تحميل الطلبات...</div>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA ORDERS</div>
            <h1 className="page-title">طلباتك الأخيرة</h1>
            <p className="page-subtitle">
              هذه الطلبات محفوظة محلياً على هذا الجهاز فقط.
            </p>
          </div>

          {guestOrders.length === 0 ? (
            <div className="empty-state" style={s.emptyCard}>
              <div style={s.emptyIcon}>📦</div>
              <h3 style={s.emptyTitle}>لا توجد طلبات محفوظة على هذا الجهاز</h3>
              <p style={s.emptyText}>
                عند إتمام طلب كزائر، سيتم حفظه هنا تلقائياً لتتمكن من الرجوع إليه لاحقاً.
              </p>

              <Link to="/products" className="btn btn-primary full-width">
                تصفح المنتجات
              </Link>
            </div>
          ) : (
            <div style={s.list}>
              {guestOrders.map((order, idx) => (
                <article key={`${order.order_number}-${idx}`} className="ui-card" style={s.orderCard}>
                  <div style={s.orderHead}>
                    <div style={s.orderTopInfo}>
                      <div style={s.orderNumber}>{order.order_number || "—"}</div>
                      <div style={s.orderDate}>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString(locale)
                          : "—"}
                      </div>
                    </div>

                    <div style={s.guestPill}>طلب زائر</div>
                  </div>

                  <div style={s.orderBody}>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>البائع</span>
                      <strong style={s.infoValue}>{order.seller || "RAHBA"}</strong>
                    </div>

                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>الهاتف</span>
                      <strong style={s.infoValue}>{order.phone || "—"}</strong>
                    </div>

                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>الإجمالي</span>
                      <strong style={s.priceValue}>
                        {formatMoney(Number(order.total_mad || 0), currency, locale)}
                      </strong>
                    </div>
                  </div>

                  <div style={s.actions}>
                    <button
                      type="button"
                      className="btn btn-primary full-width"
                      onClick={() => copyText(order.order_number || "")}
                    >
                      نسخ رقم الطلب
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA ORDERS</div>
          <h1 className="page-title">طلباتي</h1>
          <p className="page-subtitle">
            تتبع حالة طلباتك، واطلع على التفاصيل وأرقام التتبع إن وجدت.
          </p>
        </div>

        {message ? <div className="message-box">{message}</div> : null}

        {orders.length === 0 ? (
          <div className="empty-state" style={s.emptyCard}>
            <div style={s.emptyIcon}>📦</div>
            <h3 style={s.emptyTitle}>لا توجد طلبات بعد</h3>
            <p style={s.emptyText}>
              بعد إتمام أول عملية شراء من حسابك، ستظهر طلباتك هنا.
            </p>

            <Link to="/products" className="btn btn-primary full-width">
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div style={s.list}>
            {orders.map((order) => {
              const status = getStatusMeta(order.order_status);

              return (
                <article key={order.id} className="ui-card" style={s.orderCard}>
                  <div style={s.orderHead}>
                    <div style={s.orderTopInfo}>
                      <div style={s.orderNumber}>{order.order_number || "—"}</div>
                      <div style={s.orderDate}>{order.created_at || "—"}</div>
                    </div>

                    <div
                      style={{
                        ...s.statusPill,
                        background: status.bg,
                        color: status.color,
                        borderColor: status.border
                      }}
                    >
                      {status.label}
                    </div>
                  </div>

                  <div style={s.orderBody}>
                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>البائع</span>
                      <strong style={s.infoValue}>{order.seller_name || "RAHBA"}</strong>
                    </div>

                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>عدد المنتجات</span>
                      <strong style={s.infoValue}>{order.items_count || 0}</strong>
                    </div>

                    <div style={s.infoRow}>
                      <span style={s.infoLabel}>الإجمالي</span>
                      <strong style={s.priceValue}>
                        {formatMoney(Number(order.total_mad || 0), order.currency || currency, locale)}
                      </strong>
                    </div>
                  </div>

                  <div style={s.actions}>
                    <button
                      type="button"
                      className="btn btn-primary full-width"
                      onClick={() => navigate(`/my-orders/${order.id}`)}
                    >
                      عرض التفاصيل
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

const s = {
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "10px"
  },
  list: {
    display: "grid",
    gap: "12px"
  },
  orderCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  orderHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap"
  },
  orderTopInfo: {
    display: "grid",
    gap: "6px"
  },
  orderNumber: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  orderDate: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  guestPill: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#173b74",
    border: "1px solid #d3e4f8",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 900
  },
  statusPill: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    border: "1px solid",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 900
  },
  orderBody: {
    display: "grid",
    gap: "10px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center"
  },
  infoLabel: {
    color: "#7a6f63",
    fontSize: "14px",
    fontWeight: 700
  },
  infoValue: {
    color: "#1f2937",
    fontWeight: 900
  },
  priceValue: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  actions: {
    display: "grid",
    gap: "8px"
  },
  emptyCard: {
    display: "grid",
    gap: "12px"
  },
  emptyIcon: {
    fontSize: "40px"
  },
  emptyTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900
  },
  emptyText: {
    margin: 0,
    color: "#7a6f63",
    lineHeight: 1.8
  }
};
