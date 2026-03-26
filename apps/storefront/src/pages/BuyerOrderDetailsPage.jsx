import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function BuyerOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading, currency, language } = useApp();

  const [order, setOrder] = useState(null);
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
    async function loadOrder() {
      if (authLoading) return;

      if (!currentUser) {
        setLoading(false);
        setMessage("يجب تسجيل الدخول أولاً لعرض تفاصيل الطلب");
        return;
      }

      if (!id) {
        setLoading(false);
        setMessage("رقم الطلب غير صالح");
        return;
      }

      try {
        setLoading(true);
        setMessage("");

        const result = await apiGet(`/commerce/orders/${id}`);

        if (!result?.ok) {
          setMessage(result?.message || "تعذر تحميل تفاصيل الطلب");
          setOrder(null);
          return;
        }

        const data = result.data;

        if (buyerId && data?.buyer_user_id && data.buyer_user_id !== buyerId) {
          setMessage("ليس لديك صلاحية لعرض هذا الطلب");
          setOrder(null);
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل تفاصيل الطلب");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [authLoading, currentUser, id, buyerId]);

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
            <div className="ui-chip">RAHBA ORDER</div>
            <h1 className="page-title">تفاصيل الطلب</h1>
            <p className="page-subtitle">جاري تحميل تفاصيل الطلب...</p>
          </div>

          <div className="loading-state">جاري تحميل تفاصيل الطلب...</div>
        </div>
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA ORDER</div>
            <h1 className="page-title">تفاصيل الطلب</h1>
            <p className="page-subtitle">قم بتسجيل الدخول أولاً للوصول إلى الطلب.</p>
          </div>

          <div className="empty-state" style={s.emptyCard}>
            <div style={s.emptyIcon}>🔐</div>
            <h3 style={s.emptyTitle}>تسجيل الدخول مطلوب</h3>
            <p style={s.emptyText}>لا يمكن عرض تفاصيل الطلب بدون تسجيل الدخول.</p>

            <Link to="/auth" className="btn btn-primary full-width">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA ORDER</div>
            <h1 className="page-title">تفاصيل الطلب</h1>
            <p className="page-subtitle">تعذر العثور على الطلب المطلوب.</p>
          </div>

          {message ? <div className="message-box">{message}</div> : null}

          <button
            type="button"
            className="btn btn-secondary full-width"
            onClick={() => navigate("/my-orders")}
          >
            الرجوع إلى طلباتي
          </button>
        </div>
      </section>
    );
  }

  const status = getStatusMeta(order.order_status);
  const orderCurrency = order.currency || currency;
  const items = Array.isArray(order.items) ? order.items : [];
  const shipping = order.shipping || null;

  function getShippingSteps(status) {
    const current = String(status || "").toLowerCase();

    const steps = [
      { key: "pending", label: "تم إنشاء الطلب" },
      { key: "processing", label: "قيد التجهيز" },
      { key: "shipped", label: "تم الشحن" },
      { key: "delivered", label: "تم التسليم" }
    ];

    const order = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1
    };

    const currentRank = Object.prototype.hasOwnProperty.call(order, current)
      ? order[current]
      : 0;

    return steps.map((step, index) => ({
      ...step,
      done: current !== "cancelled" && index < currentRank,
      active: current !== "cancelled" && index === currentRank,
      pending: current === "cancelled" ? true : index > currentRank
    }));
  }

  function getShippingStatusMeta(status) {
    const s = String(status || "").toLowerCase();

    if (s === "pending") {
      return { label: "قيد الانتظار", bg: "#fff7ed", color: "#9a4f18", border: "#fed7aa" };
    }
    if (s === "processing") {
      return { label: "قيد المعالجة", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
    }
    if (s === "shipped") {
      return { label: "تم الشحن", bg: "#f5f3ff", color: "#6d28d9", border: "#ddd6fe" };
    }
    if (s === "delivered") {
      return { label: "تم التسليم", bg: "#ecfdf5", color: "#166534", border: "#bbf7d0" };
    }
    if (s === "cancelled") {
      return { label: "ملغي", bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" };
    }

    return { label: status || "غير معروف", bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
  };


  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div style={s.heroTop}>
            <div>
              <div className="ui-chip">RAHBA ORDER</div>
              <h1 className="page-title" style={s.heroTitle}>تفاصيل الطلب</h1>
              <p className="page-subtitle">
                راجع حالة الطلب، المنتجات، ومعلومات التوصيل.
              </p>
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

          {shipping ? (
            <div className="ui-card-soft" style={s.shippingCard}>
              <div style={s.shippingTitleRow}>
                <strong style={s.shippingTitle}>الشحن والتتبع</strong>
                {(() => {
                  const meta = getShippingStatusMeta(shipping.shipping_status);
                  return (
                    <span
                      style={{
                        ...s.shippingStatusBadge,
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`
                      }}
                    >
                      {meta.label}
                    </span>
                  );
                })()}
              </div>

              <div style={s.trackingTimeline}>
                {getShippingSteps(shipping.shipping_status).map((step, index, arr) => (
                  <div key={step.key} style={s.trackingStep}>
                    <div style={s.trackingVisualCol}>
                      <div
                        style={{
                          ...s.trackingDot,
                          ...(step.done ? s.trackingDotDone : {}),
                          ...(step.active ? s.trackingDotActive : {})
                        }}
                      >
                        {step.done ? "✓" : index + 1}
                      </div>
                      {index < arr.length - 1 ? (
                        <div
                          style={{
                            ...s.trackingLine,
                            ...((step.done || step.active) ? s.trackingLineDone : {})
                          }}
                        />
                      ) : null}
                    </div>

                    <div style={s.trackingContent}>
                      <div
                        style={{
                          ...s.trackingStepLabel,
                          ...(step.active ? s.trackingStepLabelActive : {})
                        }}
                      >
                        {step.label}
                      </div>
                      <div style={s.trackingStepMeta}>
                        {step.active
                          ? "الحالة الحالية"
                          : step.done
                          ? "مكتملة"
                          : "في الانتظار"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={s.shippingGrid}>
                <div style={s.shippingItem}>
                  <span style={s.shippingLabel}>شركة الشحن</span>
                  <strong style={s.shippingValue}>{shipping.provider_name || "—"}</strong>
                </div>

                <div style={s.shippingItem}>
                  <span style={s.shippingLabel}>طريقة الشحن</span>
                  <strong style={s.shippingValue}>{shipping.method_name || "—"}</strong>
                </div>

                <div style={s.shippingItem}>
                  <span style={s.shippingLabel}>ثمن الشحن</span>
                  <strong style={s.shippingValue}>
                    {Number(shipping.shipping_price || 0) === 0
                      ? "مجاني"
                      : formatMoney(Number(shipping.shipping_price || 0), orderCurrency, locale)}
                  </strong>
                </div>

                <div style={s.shippingItem}>
                  <span style={s.shippingLabel}>رقم التتبع</span>
                  <strong style={s.shippingValue}>{shipping.tracking_number || "—"}</strong>
                </div>
              </div>
            </div>
          ) : null}

          <div className="ui-card-soft" style={s.orderMetaCard}>
            <div style={s.metaRow}>
              <span style={s.metaLabel}>رقم الطلب</span>
              <strong style={s.metaValue}>{order.order_number || "—"}</strong>
            </div>

            <div style={s.metaRow}>
              <span style={s.metaLabel}>تاريخ الطلب</span>
              <strong style={s.metaValue}>{order.created_at || "—"}</strong>
            </div>

            <div style={s.metaRow}>
              <span style={s.metaLabel}>البائع</span>
              <strong style={s.metaValue}>{order.seller_name || "RAHBA"}</strong>
            </div>

            <div style={s.metaRow}>
              <span style={s.metaLabel}>الإجمالي</span>
              <strong style={s.totalValue}>
                {formatMoney(Number(order.total_mad || 0), orderCurrency, locale)}
              </strong>
            </div>
          </div>
        </div>

        {message ? <div className="message-box">{message}</div> : null}

        <section className="ui-card" style={s.sectionCard}>
          <h2 className="section-title">المنتجات</h2>

          <div style={s.itemsList}>
            {items.length === 0 ? (
              <div className="empty-state">لا توجد عناصر داخل هذا الطلب</div>
            ) : (
              items.map((item) => (
                <article key={item.id} className="ui-card-soft" style={s.itemCard}>
                  <div style={s.itemMedia}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title_ar || "منتج"}
                        style={s.itemImage}
                      />
                    ) : (
                      <div style={s.itemNoImage}>No image</div>
                    )}
                  </div>

                  <div style={s.itemBody}>
                    <div style={s.itemTitle}>
                      {item.title_ar || "منتج"}
                    </div>

                    <div style={s.itemInfoRow}>
                      <span style={s.itemLabel}>الكمية</span>
                      <strong style={s.itemValue}>{item.quantity || 0}</strong>
                    </div>

                    <div style={s.itemInfoRow}>
                      <span style={s.itemLabel}>السعر الفردي</span>
                      <strong style={s.itemValue}>
                        {formatMoney(Number(item.unit_price_mad || 0), orderCurrency, locale)}
                      </strong>
                    </div>

                    <div style={s.itemInfoRow}>
                      <span style={s.itemLabel}>الإجمالي</span>
                      <strong style={s.itemTotal}>
                        {formatMoney(
                          Number(item.unit_price_mad || 0) * Number(item.quantity || 0),
                          orderCurrency,
                          locale
                        )}
                      </strong>
                    </div>

                    {item.slug ? (
                      <button
                        type="button"
                        className="btn btn-outline full-width"
                        onClick={() => navigate(`/products/${item.slug}`)}
                      >
                        فتح المنتج
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="ui-card" style={s.sectionCard}>
          <h2 className="section-title">معلومات التوصيل</h2>

          <div style={s.infoGrid}>
            <InfoRow label="الاسم" value={order.buyer_name || "—"} />
            <InfoRow label="الهاتف" value={order.buyer_phone || "—"} />
            <InfoRow label="المدينة" value={order.buyer_city || "—"} />
            <InfoRow label="العنوان" value={order.buyer_address || "—"} />
          </div>
        </section>

        <section className="ui-card" style={s.sectionCard}>
          <h2 className="section-title">الدفع والشحن</h2>

          <div style={s.infoGrid}>
            <InfoRow
              label="طريقة الدفع"
              value={order.payment_method === "cod" ? "الدفع عند الاستلام" : (order.payment_method || "—")}
            />
            <InfoRow label="حالة الدفع" value={order.payment_status || "—"} />
            <InfoRow label="حالة الشحن" value={order.shipping_status || "—"} />
            <InfoRow label="رقم التتبع" value={order.tracking_number || "غير متوفر بعد"} />
          </div>
        </section>

        {order.notes ? (
          <section className="ui-card" style={s.sectionCard}>
            <h2 className="section-title">ملاحظات الطلب</h2>
            <div className="ui-card-soft" style={s.notesBox}>
              {order.notes}
            </div>
          </section>
        ) : null}

        <div style={s.actions}>
          <button
            type="button"
            className="btn btn-secondary full-width"
            onClick={() => navigate("/my-orders")}
          >
            الرجوع إلى طلباتي
          </button>

          <button
            type="button"
            className="btn btn-primary full-width"
            onClick={() => navigate("/products")}
          >
            متابعة التسوق
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="ui-card-soft" style={s.infoCard}>
      <div style={s.infoLabel}>{label}</div>
      <div style={s.infoValue}>{value}</div>
    </div>
  );
}

const s = {
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "14px"
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap"
  },
  heroTitle: {
    marginTop: "10px"
  },
  statusPill: {
    minHeight: "36px",
    padding: "0 12px",
    borderRadius: "999px",
    border: "1px solid",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: 900
  },
  shippingCard: {
    padding: "16px",
    display: "grid",
    gap: "14px",
    background: "#f8fbff",
    border: "1px solid #dbeafe"
  },
  shippingTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  shippingTitle: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  shippingStatusBadge: {
    background: "#eef6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: 800
  },
  trackingTimeline: {
    display: "grid",
    gap: "0"
  },
  trackingStep: {
    display: "grid",
    gridTemplateColumns: "30px 1fr",
    gap: "12px",
    alignItems: "start"
  },
  trackingVisualCol: {
    display: "grid",
    justifyItems: "center"
  },
  trackingDot: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    border: "2px solid #cbd5e1",
    color: "#64748b",
    background: "#fff",
    display: "grid",
    placeItems: "center",
    fontSize: "12px",
    fontWeight: 900
  },
  trackingDotDone: {
    background: "#dcfce7",
    color: "#166534",
    border: "2px solid #86efac"
  },
  trackingDotActive: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "2px solid #93c5fd",
    boxShadow: "0 0 0 4px rgba(147,197,253,0.22)"
  },
  trackingLine: {
    width: "2px",
    minHeight: "28px",
    background: "#e2e8f0",
    marginTop: "4px",
    marginBottom: "4px"
  },
  trackingLineDone: {
    background: "#93c5fd"
  },
  trackingContent: {
    paddingBottom: "16px"
  },
  trackingStepLabel: {
    color: "#334155",
    fontWeight: 800
  },
  trackingStepLabelActive: {
    color: "#173b74"
  },
  trackingStepMeta: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "4px"
  },
  shippingGrid: {

    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px"
  },
  shippingItem: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "6px"
  },
  shippingLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700
  },
  shippingValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 900
  },
  orderMetaCard: {
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center"
  },
  metaLabel: {
    color: "#7a6f63",
    fontSize: "14px",
    fontWeight: 700
  },
  metaValue: {
    color: "#1f2937",
    fontWeight: 900
  },
  totalValue: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  sectionCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  itemsList: {
    display: "grid",
    gap: "12px"
  },
  itemCard: {
    overflow: "hidden"
  },
  itemMedia: {
    borderBottom: "1px solid #eee6da"
  },
  itemImage: {
    width: "100%",
    height: "210px",
    objectFit: "cover",
    display: "block"
  },
  itemNoImage: {
    width: "100%",
    height: "210px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    color: "#94a3b8"
  },
  itemBody: {
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  itemTitle: {
    color: "#1f2937",
    fontWeight: 900,
    fontSize: "17px",
    lineHeight: 1.6
  },
  itemInfoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center"
  },
  itemLabel: {
    color: "#7a6f63",
    fontSize: "14px",
    fontWeight: 700
  },
  itemValue: {
    color: "#1f2937",
    fontWeight: 900
  },
  itemTotal: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  infoGrid: {
    display: "grid",
    gap: "10px"
  },
  infoCard: {
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  infoLabel: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  infoValue: {
    color: "#1f2937",
    fontWeight: 900,
    lineHeight: 1.7
  },
  notesBox: {
    padding: "14px",
    color: "#374151",
    lineHeight: 1.9
  },
  actions: {
    display: "grid",
    gap: "10px",
    paddingBottom: "8px"
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
