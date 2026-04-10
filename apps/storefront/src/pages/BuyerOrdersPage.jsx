import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import { UI } from "../components/marketplace/uiTokens";

function loadGuestOrders() {
  try {
    const raw = localStorage.getItem("guest_orders");
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        order_id: item.order_id || null,
        order_number: item.order_number || "",
        seller: item.seller || "RAHBA",
        phone: item.phone || "",
        total_mad: Number(item.total_mad || 0),
        created_at: item.created_at || null
      }))
      .filter((item) => item.order_number)
      .sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
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

function normalizeAccountOrder(order) {
  return {
    id: order?.id || "",
    order_number: order?.order_number || "—",
    created_at: order?.created_at || null,
    order_status: order?.order_status || "",
    seller_name: order?.seller_name || "RAHBA",
    items_count: Number(order?.items_count || 0),
    total_mad: Number(order?.total_mad || 0),
    currency: order?.currency || "MAD"
  };
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

  const copyTimerRef = useRef(null);
  const requestIdRef = useRef(0);

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  const buyerId = useMemo(() => {
    return currentUser?.id || currentUser?.user_id || null;
  }, [currentUser]);

  async function loadAccountOrders() {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setMessage("");

      const result = await apiGet("/commerce/orders");

      if (requestId !== requestIdRef.current) return;

      if (!result?.ok) {
        setMessage(getApiErrorMessage(result, "تعذر تحميل الطلبات"));
        setOrders([]);
        return;
      }

      const items = Array.isArray(result?.data) ? result.data : [];
      const normalized = items.map(normalizeAccountOrder);

      setOrders(normalized);
    } catch (err) {
      console.error(err);
      if (requestId !== requestIdRef.current) return;
      setMessage("حدث خطأ أثناء تحميل الطلبات");
      setOrders([]);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
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

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  function copyText(value) {
    if (!value) return;

    navigator.clipboard?.writeText(value)
      .then(() => {
        setCopyMessage("تم نسخ رقم الطلب");
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopyMessage(""), 1800);
      })
      .catch((err) => {
        console.error("copy failed", err);
        setCopyMessage("تعذر النسخ");
        if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
        copyTimerRef.current = setTimeout(() => setCopyMessage(""), 1800);
      });
  }

  if (loading) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={s.stack}>
          <SectionShell style={s.heroShell}>
            <div className="ui-chip">RAHBA ORDERS</div>
            <SectionHead
              title="طلباتي"
              subtitle="جاري تحميل الطلبات..."
            />
          </SectionShell>

          <SectionShell>
            <div className="loading-state">جاري تحميل الطلبات...</div>
          </SectionShell>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={s.stack}>
          <SectionShell style={s.heroShell}>
            <div className="ui-chip">RAHBA GUEST ORDERS</div>
            <SectionHead
              title="طلباتك الأخيرة"
              subtitle="هذه الطلبات محفوظة محلياً على هذا الجهاز فقط."
            />
          </SectionShell>

          <SectionShell>
            <div className="ui-card-soft" style={s.infoCard}>
              <strong style={s.infoTitle}>مهم</strong>
              <span style={s.infoText}>
                في وضع الزائر، نحفظ رقم الطلب وبعض المعلومات الأساسية فقط على هذا الجهاز.
                التفاصيل الكاملة للطلب تتطلب تسجيل الدخول أو الرجوع للتواصل عبر رقم الطلب.
              </span>
            </div>
          </SectionShell>

          {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

          {guestOrders.length === 0 ? (
            <SectionShell>
              <div style={s.emptyCard}>
                <div style={s.emptyIcon}>📦</div>
                <h3 style={s.emptyTitle}>لا توجد طلبات محفوظة على هذا الجهاز</h3>
                <p style={s.emptyText}>
                  عند إتمام طلب كزائر، سيتم حفظه هنا تلقائياً لتتمكن من الرجوع إليه لاحقاً.
                </p>

                <Link to="/products" className="btn btn-primary full-width">
                  تصفح المنتجات
                </Link>
              </div>
            </SectionShell>
          ) : (
            <SectionShell>
              <SectionHead
                chip="GUEST ORDERS"
                title="طلبات الزائر"
                subtitle="هذه السجلات مرتبطة بهذا المتصفح وهذا الجهاز فقط."
              />

              <div style={s.list}>
                {guestOrders.map((order, idx) => (
                  <article key={`${order.order_number}-${idx}`} className="ui-card-soft" style={s.orderCard}>
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
            </SectionShell>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.stack}>
        <SectionShell style={s.heroShell}>
          <div className="ui-chip">RAHBA ORDERS</div>
          <SectionHead
            title="طلباتي"
            subtitle="تتبع حالة طلباتك، واطلع على التفاصيل وأرقام التتبع إن وجدت."
          />
        </SectionShell>

        <div style={s.topActions}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadAccountOrders}
            disabled={loading}
          >
            {loading ? "جاري التحديث..." : "تحديث الطلبات"}
          </button>
        </div>

        {message ? <div className="message-box">{message}</div> : null}
        {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

        {orders.length === 0 ? (
          <SectionShell>
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>📦</div>
              <h3 style={s.emptyTitle}>لا توجد طلبات بعد</h3>
              <p style={s.emptyText}>
                بعد إتمام أول عملية شراء من حسابك، ستظهر طلباتك هنا.
              </p>

              <Link to="/products" className="btn btn-primary full-width">
                تصفح المنتجات
              </Link>
            </div>
          </SectionShell>
        ) : (
          <SectionShell>
            <SectionHead
              chip="ACCOUNT ORDERS"
              title="سجل الطلبات"
              subtitle="راجع الطلبات السابقة، انسخ رقم الطلب، أو ادخل إلى التفاصيل."
            />

            <div style={s.list}>
              {orders.map((order) => {
                const status = getStatusMeta(order.order_status);

                return (
                  <article key={order.id} className="ui-card-soft" style={s.orderCard}>
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
          </SectionShell>
        )}
      </div>
    </section>
  );
}

const s = {
  stack: {
    display: "grid",
    gap: "26px"
  },

  heroShell: {
    background:
      "linear-gradient(135deg, rgba(23,59,116,0.06) 0%, rgba(20,184,166,0.06) 100%)",
    border: "1px solid #dfe7f3"
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
    color: UI.colors.navy
  },

  infoText: {
    color: UI.colors.muted,
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
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "18px"
  },

  orderDate: {
    color: "#7a6f63",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  guestPill: {
    minHeight: "34px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI.radius.pill,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
    fontWeight: 800,
    fontSize: UI.type.bodySm
  },

  statusPill: {
    minHeight: "34px",
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI.radius.pill,
    border: "1px solid transparent",
    fontWeight: 800,
    fontSize: UI.type.bodySm
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
    color: UI.colors.muted,
    fontWeight: 700
  },

  infoValue: {
    color: UI.colors.ink,
    fontWeight: 800
  },

  priceValue: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "18px"
  },

  actions: {
    display: "grid",
    gap: "10px"
  },

  emptyCard: {
    display: "grid",
    gap: "12px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "40px"
  },

  emptyTitle: {
    margin: 0,
    color: UI.colors.navy,
    fontWeight: 900
  },

  emptyText: {
    margin: 0,
    color: "#7a6f63",
    lineHeight: 1.8
  }
};
