import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import { UI } from "../components/marketplace/uiTokens";

function getApiErrorMessage(result, fallback = "تعذر تحميل تفاصيل الطلب") {
  return result?.error?.message || result?.message || fallback;
}

function formatDateTime(value, locale) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(locale);
}

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

function normalizeOrderPayload(payload) {
  const items = Array.isArray(payload?.items)
    ? payload.items.map((item) => ({
        id: item?.id || "",
        title_ar: item?.title_ar || item?.product_name || "منتج",
        product_name: item?.product_name || item?.title_ar || "منتج",
        slug: item?.slug || "",
        quantity: Number(item?.quantity || 0),
        unit_price_mad: Number(item?.unit_price_mad || 0),
        image_url: resolveImageUrl(item?.image_url || "")
      }))
    : [];

  const shipping = payload?.shipping
    ? {
        id: payload.shipping?.id || "",
        provider_id: payload.shipping?.provider_id || "",
        provider_name: payload.shipping?.provider_name || "",
        provider_method_id: payload.shipping?.provider_method_id || "",
        method_name: payload.shipping?.method_name || "",
        method_code: payload.shipping?.method_code || "",
        shipping_price: Number(payload.shipping?.shipping_price || 0),
        shipping_status: payload.shipping?.shipping_status || payload?.shipping_status || "",
        tracking_number: payload.shipping?.tracking_number || "",
        shipped_at: payload.shipping?.shipped_at || null,
        delivered_at: payload.shipping?.delivered_at || null
      }
    : null;

  return {
    id: payload?.id || "",
    buyer_user_id: payload?.buyer_user_id || null,
    order_number: payload?.order_number || "—",
    order_status: payload?.order_status || "",
    payment_status: payload?.payment_status || "",
    shipping_status: payload?.shipping_status || shipping?.shipping_status || "",
    payment_method: payload?.payment_method || "",
    total_mad: Number(payload?.total_mad || 0),
    currency: payload?.currency || "MAD",
    created_at: payload?.created_at || null,
    seller_name: payload?.seller_name || "RAHBA",
    buyer_name: payload?.buyer_name || "—",
    buyer_phone: payload?.buyer_phone || "—",
    buyer_city: payload?.buyer_city || "—",
    buyer_address: payload?.buyer_address || "—",
    notes: payload?.notes || "",
    items,
    shipping
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
    case "paid":
      return { label: "مؤدى", bg: "#ecfdf5", color: "#166534", border: "#bbf7d0" };
    case "unpaid":
      return { label: "غير مؤدى", bg: "#fff7ed", color: "#9a3412", border: "#fdba74" };
    default:
      return { label: status || "غير معروف", bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
  }
}

function getShippingStatusMeta(status) {
  return getStatusMeta(status);
}

function getShippingSteps(status) {
  const current = String(status || "").toLowerCase();

  const steps = [
    { key: "pending", label: "تم إنشاء الطلب" },
    { key: "processing", label: "قيد التجهيز" },
    { key: "shipped", label: "تم الشحن" },
    { key: "delivered", label: "تم التسليم" }
  ];

  const rankMap = {
    pending: 0,
    confirmed: 0,
    processing: 1,
    shipped: 2,
    delivered: 3,
    cancelled: -1
  };

  const currentRank = Object.prototype.hasOwnProperty.call(rankMap, current)
    ? rankMap[current]
    : 0;

  return steps.map((step, index) => ({
    ...step,
    done: current !== "cancelled" && index < currentRank,
    active: current !== "cancelled" && index === currentRank,
    pending: current === "cancelled" ? true : index > currentRank
  }));
}

function getTrackingUrl(shipping) {
  const trackingNumber = String(shipping?.tracking_number || "").trim();
  const providerId = String(shipping?.provider_id || "").trim().toLowerCase();
  const providerName = String(shipping?.provider_name || "").trim().toLowerCase();

  if (!trackingNumber) return null;

  const raw = `${providerId} ${providerName}`;

  if (raw.includes("aramex")) {
    return `https://www.aramex.com/track/shipments?ShipmentNumber=${encodeURIComponent(trackingNumber)}`;
  }

  if (raw.includes("dhl")) {
    return `https://www.dhl.com/ma-en/home/tracking.html?tracking-id=${encodeURIComponent(trackingNumber)}`;
  }

  if (raw.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`;
  }

  if (raw.includes("amana") || raw.includes("poste")) {
    return `https://www.poste.ma/`;
  }

  return null;
}

export default function BuyerOrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, authLoading, currency, language } = useApp();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copyMessage, setCopyMessage] = useState("");

  const requestIdRef = useRef(0);
  const copyTimerRef = useRef(null);

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
        setMessage("تسجيل الدخول مطلوب لعرض تفاصيل الطلب.");
        return;
      }

      if (!id) {
        setLoading(false);
        setMessage("رقم الطلب غير صالح");
        return;
      }

      const requestId = ++requestIdRef.current;

      try {
        setLoading(true);
        setMessage("");

        const result = await apiGet(`/commerce/orders/${id}`);

        if (requestId !== requestIdRef.current) return;

        if (!result?.ok) {
          setMessage(getApiErrorMessage(result, "تعذر تحميل تفاصيل الطلب"));
          setOrder(null);
          return;
        }

        const data = normalizeOrderPayload(result?.data || null);

        if (buyerId && data?.buyer_user_id && data.buyer_user_id !== buyerId) {
          setMessage("ليس لديك صلاحية لعرض هذا الطلب");
          setOrder(null);
          return;
        }

        setOrder(data);
      } catch (err) {
        console.error(err);
        if (requestId !== requestIdRef.current) return;
        setMessage("حدث خطأ أثناء تحميل تفاصيل الطلب");
        setOrder(null);
      } finally {
        if (requestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    }

    loadOrder();
  }, [authLoading, currentUser, id, buyerId]);

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
            <div style={s.heroTopRow}>
              <div className="ui-chip">RAHBA ORDER</div>
              <div style={s.heroKicker}>Loading order details</div>
            </div>

            <SectionHead
              title="تفاصيل الطلب"
              subtitle="جاري تحميل تفاصيل الطلب..."
            />
          </SectionShell>

          <SectionShell>
            <div className="loading-state">جاري تحميل تفاصيل الطلب...</div>
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
            <div style={s.heroTopRow}>
              <div className="ui-chip">RAHBA ORDER</div>
              <div style={s.heroKicker}>Protected page</div>
            </div>

            <SectionHead
              title="تفاصيل الطلب"
              subtitle="قم بتسجيل الدخول أولاً للوصول إلى الطلب."
            />
          </SectionShell>

          <SectionShell>
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>🔐</div>
              <h3 style={s.emptyTitle}>تسجيل الدخول مطلوب</h3>
              <p style={s.emptyText}>
                لا يمكن عرض تفاصيل الطلب في وضع الزائر حالياً.
              </p>

              <Link to="/auth" className="btn btn-primary full-width">
                تسجيل الدخول
              </Link>
            </div>
          </SectionShell>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={s.stack}>
          <SectionShell style={s.heroShell}>
            <div style={s.heroTopRow}>
              <div className="ui-chip">RAHBA ORDER</div>
              <div style={s.heroKicker}>Order not available</div>
            </div>

            <SectionHead
              title="تفاصيل الطلب"
              subtitle="تعذر العثور على الطلب المطلوب."
            />
          </SectionShell>

          {message ? <div className="message-box">{message}</div> : null}

          <button
            type="button"
            className="btn btn-secondary full-width"
            onClick={() => navigate("/my-orders")}
          >
            الرجوع إلى حسابي
          </button>
        </div>
      </section>
    );
  }

  const status = getStatusMeta(order.order_status);
  const paymentStatus = getStatusMeta(order.payment_status);
  const shippingStatus = getStatusMeta(
    order.shipping?.shipping_status || order.shipping_status
  );
  const orderCurrency = order.currency || currency;
  const items = Array.isArray(order.items) ? order.items : [];
  const shipping = order.shipping || null;
  const trackingUrl = shipping ? getTrackingUrl(shipping) : null;

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.stack}>
        <SectionShell style={s.heroShell}>
          <div style={s.heroTopRow}>
            <div className="ui-chip">RAHBA ORDER</div>
            <div style={s.heroKicker}>Premium post-purchase page</div>
          </div>

          <div style={s.heroMainRow}>
            <div style={s.heroMainInfo}>
              <SectionHead
                title="تفاصيل الطلب"
                subtitle="راجع حالة الطلب، المنتجات، الشحن، ومعلومات التوصيل من مكان واحد."
              />

              <div style={s.heroTrustRow}>
                <span style={s.heroTrustItem}>حالة أوضح</span>
                <span style={s.heroTrustItem}>تتبع أسرع</span>
                <span style={s.heroTrustItem}>وصول مباشر للمعلومات</span>
              </div>
            </div>

            <div
              style={{
                ...s.statusPillHero,
                background: status.bg,
                color: status.color,
                borderColor: status.border
              }}
            >
              {status.label}
            </div>
          </div>

          {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

          <div style={s.topSummary}>
            <div className="ui-card-soft" style={s.summaryBox}>
              <span style={s.summaryLabel}>رقم الطلب</span>
              <strong style={s.summaryValue}>{order.order_number || "—"}</strong>
            </div>

            <div className="ui-card-soft" style={s.summaryBox}>
              <span style={s.summaryLabel}>التاريخ</span>
              <strong style={s.summaryValue}>{formatDateTime(order.created_at, locale)}</strong>
            </div>

            <div className="ui-card-soft" style={s.summaryBox}>
              <span style={s.summaryLabel}>الإجمالي</span>
              <strong style={s.summaryValue}>
                {formatMoney(Number(order.total_mad || 0), orderCurrency, locale)}
              </strong>
            </div>
          </div>

          <div style={s.heroActions}>
            <button
              type="button"
              className="btn btn-secondary"
              style={s.copyOrderBtn}
              onClick={() => copyText(order.order_number || "")}
            >
              نسخ رقم الطلب
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate("/my-orders")}
            >
              الرجوع إلى حسابي
            </button>
          </div>
        </SectionShell>

        {message ? <div className="message-box">{message}</div> : null}

        <div style={s.layout}>
          <div style={s.mainCol}>
            <SectionShell>
              <SectionHead
                chip="ORDER STATUS"
                title="حالة الطلب"
                subtitle="متابعة سريعة لحالة الطلب والدفع والشحن."
              />

              <div style={s.statusGrid}>
                <div className="ui-card-soft" style={s.statusItem}>
                  <span style={s.statusLabel}>الطلب</span>
                  <strong
                    style={{
                      ...s.statusBadgeInline,
                      background: status.bg,
                      color: status.color,
                      borderColor: status.border
                    }}
                  >
                    {status.label}
                  </strong>
                </div>

                <div className="ui-card-soft" style={s.statusItem}>
                  <span style={s.statusLabel}>الدفع</span>
                  <strong
                    style={{
                      ...s.statusBadgeInline,
                      background: paymentStatus.bg,
                      color: paymentStatus.color,
                      borderColor: paymentStatus.border
                    }}
                  >
                    {paymentStatus.label}
                  </strong>
                </div>

                <div className="ui-card-soft" style={s.statusItem}>
                  <span style={s.statusLabel}>الشحن</span>
                  <strong
                    style={{
                      ...s.statusBadgeInline,
                      background: shippingStatus.bg,
                      color: shippingStatus.color,
                      borderColor: shippingStatus.border
                    }}
                  >
                    {shippingStatus.label}
                  </strong>
                </div>
              </div>
            </SectionShell>

            <SectionShell>
              <SectionHead
                chip="ORDER ITEMS"
                title="المنتجات"
                subtitle="العناصر المرتبطة بهذا الطلب مع الكمية والسعر."
              />

              {items.length === 0 ? (
                <div style={s.emptyInline}>لا توجد عناصر مرتبطة بهذا الطلب.</div>
              ) : (
                <div style={s.itemsList}>
                  {items.map((item, idx) => (
                    <article key={item.id || idx} className="ui-card-soft" style={s.itemCard}>
                      <div style={s.itemRowTop}>
                        <div style={s.itemInfo}>
                          <div style={s.itemTitle}>
                            {item.title_ar || item.product_name || "منتج"}
                          </div>
                          <div style={s.itemMeta}>
                            {item.slug ? `/${item.slug}` : "بدون رابط منتج"}
                          </div>
                        </div>

                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title_ar || "product"}
                            style={s.itemImage}
                          />
                        ) : (
                          <div style={s.itemImageFallback}>📦</div>
                        )}
                      </div>

                      <div style={s.itemStats}>
                        <div style={s.infoRow}>
                          <span style={s.infoLabel}>الكمية</span>
                          <strong style={s.infoValue}>{Number(item.quantity || 0)}</strong>
                        </div>

                        <div style={s.infoRow}>
                          <span style={s.infoLabel}>ثمن الوحدة</span>
                          <strong style={s.infoValue}>
                            {formatMoney(Number(item.unit_price_mad || 0), orderCurrency, locale)}
                          </strong>
                        </div>

                        <div style={s.infoRow}>
                          <span style={s.infoLabel}>المجموع</span>
                          <strong style={s.priceValue}>
                            {formatMoney(
                              Number(item.unit_price_mad || 0) * Number(item.quantity || 0),
                              orderCurrency,
                              locale
                            )}
                          </strong>
                        </div>
                      </div>

                      {item.slug ? (
                        <Link to={`/products/${item.slug}`} className="btn btn-secondary full-width">
                          عرض المنتج
                        </Link>
                      ) : null}
                    </article>
                  ))}
                </div>
              )}
            </SectionShell>

            {shipping ? (
              <SectionShell>
                <div style={s.shippingTitleRow}>
                  <SectionHead
                    chip="SHIPPING"
                    title="الشحن والتتبع"
                    subtitle="تابع تقدم الشحنة ومعلومات التوصيل."
                  />

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
                  <div className="ui-card-soft" style={s.shippingItem}>
                    <span style={s.shippingLabel}>شركة الشحن</span>
                    <strong style={s.shippingValue}>{shipping.provider_name || "—"}</strong>
                  </div>

                  <div className="ui-card-soft" style={s.shippingItem}>
                    <span style={s.shippingLabel}>طريقة الشحن</span>
                    <strong style={s.shippingValue}>{shipping.method_name || "—"}</strong>
                  </div>

                  <div className="ui-card-soft" style={s.shippingItem}>
                    <span style={s.shippingLabel}>ثمن الشحن</span>
                    <strong style={s.shippingValue}>
                      {Number(shipping.shipping_price || 0) === 0
                        ? "مجاني"
                        : formatMoney(Number(shipping.shipping_price || 0), orderCurrency, locale)}
                    </strong>
                  </div>

                  <div className="ui-card-soft" style={s.shippingItem}>
                    <span style={s.shippingLabel}>رقم التتبع</span>
                    {shipping.tracking_number ? (
                      trackingUrl ? (
                        <a
                          href={trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={s.trackingLink}
                        >
                          {shipping.tracking_number}
                        </a>
                      ) : (
                        <strong style={s.shippingValue}>{shipping.tracking_number}</strong>
                      )
                    ) : (
                      <strong style={s.shippingValue}>—</strong>
                    )}
                  </div>

                  <div className="ui-card-soft" style={s.shippingItem}>
                    <span style={s.shippingLabel}>تاريخ الشحن</span>
                    <strong style={s.shippingValue}>{formatDateTime(shipping.shipped_at, locale)}</strong>
                  </div>

                  <div className="ui-card-soft" style={s.shippingItem}>
                    <span style={s.shippingLabel}>تاريخ التسليم</span>
                    <strong style={s.shippingValue}>{formatDateTime(shipping.delivered_at, locale)}</strong>
                  </div>
                </div>
              </SectionShell>
            ) : null}
          </div>

          <aside style={s.sideCol}>
            <SectionShell>
              <SectionHead
                chip="ORDER INFO"
                title="معلومات الطلب"
                subtitle="بيانات المستلم والدفع والبائع."
              />

              <div style={s.sideInfoList}>
                <div style={s.infoRow}>
                  <span style={s.infoLabel}>البائع</span>
                  <strong style={s.infoValue}>{order.seller_name || "RAHBA"}</strong>
                </div>

                <div style={s.infoRow}>
                  <span style={s.infoLabel}>اسم المستلم</span>
                  <strong style={s.infoValue}>{order.buyer_name || "—"}</strong>
                </div>

                <div style={s.infoRow}>
                  <span style={s.infoLabel}>الهاتف</span>
                  <strong style={s.infoValue}>{order.buyer_phone || "—"}</strong>
                </div>

                <div style={s.infoRow}>
                  <span style={s.infoLabel}>المدينة</span>
                  <strong style={s.infoValue}>{order.buyer_city || "—"}</strong>
                </div>

                <div style={s.infoRow}>
                  <span style={s.infoLabel}>العنوان</span>
                  <strong style={s.infoValue}>{order.buyer_address || "—"}</strong>
                </div>

                <div style={s.infoRow}>
                  <span style={s.infoLabel}>طريقة الدفع</span>
                  <strong style={s.infoValue}>{order.payment_method || "—"}</strong>
                </div>
              </div>

              {order.notes ? (
                <div className="ui-card-soft" style={s.notesCard}>
                  <strong style={s.notesTitle}>ملاحظات الطلب</strong>
                  <p style={s.notesText}>{order.notes}</p>
                </div>
              ) : null}

              <div style={s.sideActions}>
                <button
                  type="button"
                  className="btn btn-primary full-width"
                  onClick={() => navigate("/my-orders")}
                >
                  الرجوع إلى حسابي
                </button>

                <button
                  type="button"
                  className="btn btn-secondary full-width"
                  onClick={() => copyText(order.order_number || "")}
                >
                  نسخ رقم الطلب
                </button>
              </div>
            </SectionShell>
          </aside>
        </div>
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
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(23,59,116,0.07) 0%, rgba(20,184,166,0.08) 100%)",
    border: "1px solid #dfe7f3",
    boxShadow: "0 18px 42px rgba(15,23,42,0.06)"
  },

  heroTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  heroKicker: {
    color: "#0f766e",
    fontWeight: 800,
    fontSize: UI.type.bodySm
  },

  heroMainRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "start",
    flexWrap: "wrap"
  },

  heroMainInfo: {
    display: "grid",
    gap: "10px"
  },

  heroTrustRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },

  heroTrustItem: {
    minHeight: "30px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.74)",
    border: "1px solid #dce8f7",
    color: UI.colors.navy,
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 800
  },

  statusPillHero: {
    minHeight: "38px",
    padding: "0 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI.radius.pill,
    border: "1px solid transparent",
    fontWeight: 800,
    fontSize: UI.type.bodySm
  },

  heroActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  copyOrderBtn: {
    width: "fit-content"
  },

  topSummary: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
  },

  summaryBox: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
  },

  summaryLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  summaryValue: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  layout: {
    display: "grid",
    gap: "16px"
  },

  mainCol: {
    display: "grid",
    gap: "14px"
  },

  sideCol: {
    display: "grid",
    gap: "14px"
  },

  statusGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
  },

  statusItem: {
    padding: "14px",
    display: "grid",
    gap: "8px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
  },

  statusLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  statusBadgeInline: {
    minHeight: "34px",
    padding: "0 12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI.radius.pill,
    border: "1px solid transparent",
    width: "fit-content",
    fontWeight: 800,
    fontSize: UI.type.bodySm
  },

  itemsList: {
    display: "grid",
    gap: "12px"
  },

  itemCard: {
    padding: "15px",
    display: "grid",
    gap: "12px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)"
  },

  itemRowTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start"
  },

  itemInfo: {
    display: "grid",
    gap: "4px"
  },

  itemTitle: {
    color: UI.colors.navy,
    fontWeight: 900,
    lineHeight: 1.6
  },

  itemMeta: {
    color: "#7a6f63",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  itemImage: {
    width: "84px",
    height: "84px",
    objectFit: "cover",
    borderRadius: UI.radius.xl,
    border: "1px solid #ece3d8",
    flexShrink: 0
  },

  itemImageFallback: {
    width: "84px",
    height: "84px",
    borderRadius: UI.radius.xl,
    border: "1px solid #ece3d8",
    background: "#f8f7f3",
    display: "grid",
    placeItems: "center",
    fontSize: "30px",
    flexShrink: 0
  },

  itemStats: {
    display: "grid",
    gap: "8px"
  },

  shippingTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  shippingStatusBadge: {
    minHeight: "34px",
    padding: "0 12px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI.radius.pill,
    fontWeight: 800,
    fontSize: UI.type.bodySm
  },

  trackingTimeline: {
    display: "grid",
    gap: "10px"
  },

  trackingStep: {
    display: "grid",
    gridTemplateColumns: "30px 1fr",
    gap: "12px"
  },

  trackingVisualCol: {
    display: "grid",
    justifyItems: "center"
  },

  trackingDot: {
    width: "28px",
    height: "28px",
    borderRadius: UI.radius.pill,
    background: "#e5e7eb",
    color: "#475569",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: UI.type.bodySm
  },

  trackingDotDone: {
    background: "#16a34a",
    color: "#fff"
  },

  trackingDotActive: {
    background: "#1d4ed8",
    color: "#fff"
  },

  trackingLine: {
    width: "2px",
    minHeight: "26px",
    background: "#e5e7eb",
    marginTop: "4px"
  },

  trackingLineDone: {
    background: "#93c5fd"
  },

  trackingContent: {
    display: "grid",
    gap: "3px"
  },

  trackingStepLabel: {
    color: "#334155",
    fontWeight: 800
  },

  trackingStepLabelActive: {
    color: UI.colors.navy
  },

  trackingStepMeta: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm
  },

  shippingGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
  },

  shippingItem: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
  },

  shippingLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  shippingValue: {
    color: UI.colors.ink,
    fontWeight: 800
  },

  trackingLink: {
    color: "#1d4ed8",
    fontWeight: 800,
    textDecoration: "none",
    wordBreak: "break-word"
  },

  sideInfoList: {
    display: "grid",
    gap: "10px"
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
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
    fontWeight: 900
  },

  notesCard: {
    padding: "14px",
    display: "grid",
    gap: "8px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
  },

  notesTitle: {
    color: UI.colors.navy
  },

  notesText: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.9
  },

  sideActions: {
    display: "grid",
    gap: "10px"
  },

  emptyInline: {
    color: UI.colors.muted,
    lineHeight: 1.8
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
