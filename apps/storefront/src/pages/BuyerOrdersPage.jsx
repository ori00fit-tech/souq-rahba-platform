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

function getApiErrorMessage(result, fallback = "تعذر تحميل الطلبات") {
  return result?.error?.message || result?.message || fallback;
}

function formatDateTime(value, locale) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(locale);
}

function getStatusMeta(status) {
  switch (String(status || "").toLowerCase()) {
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

export default function BuyerOrdersPage() {
  const navigate = useNavigate();
  const { currentUser, authLoading, currency, language } = useApp();

  const [orders, setOrders] = useState([]);
  const [guestOrders, setGuestOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  const buyerId = useMemo(() => {
    return currentUser?.id || currentUser?.user_id || null;
  }, [currentUser]);

  async function loadAccountOrders() {
    try {
      setLoading(true);
      setMessage("");
      const result = await apiGet("/commerce/orders");

      if (!result?.ok) {
        setMessage(getApiErrorMessage(result, "تعذر تحميل الطلبات"));
        setOrders([]);
        return;
      }

      const items = Array.isArray(result?.data) ? result.data : [];
      setOrders(items);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تحميل الطلبات");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;

    if (!currentUser) {
      setGuestOrders(loadGuestOrders());
      setLoading(false);
      return;
    }

    if (!buyerId) {
      setLoading(false);
      setMessage("تعذر تحديد حساب المشتري");
      return;
    }

    loadAccountOrders();
  }, [authLoading, currentUser, buyerId]);

  function copyText(value) {
    if (!value) return;
    navigator.clipboard?.writeText(value)
      .then(() => {
        setCopyMessage("تم نسخ رقم الطلب");
        setTimeout(() => setCopyMessage(""), 1800);
      })
      .catch((err) => {
        console.error("copy failed", err);
        setCopyMessage("تعذر النسخ");
        setTimeout(() => setCopyMessage(""), 1800);
      });
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
            <div className="ui-chip">RAHBA GUEST ORDERS</div>
            <h1 className="page-title">طلباتك الأخيرة</h1>
            <p className="page-subtitle">
              هذه الطلبات محفوظة محلياً على هذا الجهاز فقط.
            </p>
          </div>

          <div className="ui-card-soft" style={s.infoCard}>
            <strong style={s.infoTitle}>مهم</strong>
            <span style={s.infoText}>
              في وضع الزائر، نحفظ رقم الطلب وبعض المعلومات الأساسية فقط على هذا الجهاز.
              التفاصيل الكاملة للطلب تتطلب تسجيل الدخول أو الرجوع للتواصل عبر رقم الطلب.
            </span>
          </div>

          {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

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
                        {formatDateTime(order.created_at, locale)}
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

        <div style={s.topActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadAccountOrders}
          >
            تحديث الطلبات
          </button>
        </div>

        {message ? <div className="message-box">{message}</div> : null}
        {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

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
                      <div style={s.orderDate}>{formatDateTime(order.created_at, locale)}</div>
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
                      <strong style={s.infoValue}>{Number(order.items_count || 0)}</strong>
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

                    <button
                      type="button"
                      className="btn btn-secondary full-width"
                      onClick={() => copyText(order.order_number || "")}
                    >
                      نسخ رقم الطلب
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
  topActions: {
    display: "flex",
    justifyContent: "flex-start"
  },
  infoCard: {
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  infoTitle: {
    color: "#173b74"
  },
  infoText: {
    color: "#6b7280",
    lineHeight: 1.8
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: 800,
    fontSize: "13px"
  },
  statusPill: {
    minHeight: "34px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: "1px solid transparent",
    fontWeight: 800,
    fontSize: "13px"
  },
  orderBody: {
    display: "grid",
    gap: "10px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  infoLabel: {
    color: "#6b7280",
    fontWeight: 700
  },
  infoValue: {
    color: "#1f2937",
    fontWeight: 800
  },
  priceValue: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  actions: {
    display: "grid",
    gap: "10px"
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
