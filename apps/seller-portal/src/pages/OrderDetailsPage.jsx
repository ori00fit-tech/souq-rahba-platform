import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { useSellerAuth } from "../context/SellerAuthContext";

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

function resolveTrackingUrl(shipping) {
  if (!shipping?.tracking_number) return null;

  const tracking = encodeURIComponent(shipping.tracking_number);
  const provider = String(shipping.provider_name || shipping.provider_id || "").toLowerCase();

  if (provider.includes("amana")) {
    return `https://www.poste.ma/wps/portal/PosteMaroc/suivre-vos-envois?tracking=${tracking}`;
  }

  if (provider.includes("aramex")) {
    return `https://www.aramex.com/track/results?ShipmentNumber=${tracking}`;
  }

  if (provider.includes("dhl")) {
    return `https://www.dhl.com/ma-en/home/tracking.html?tracking-id=${tracking}`;
  }

  if (provider.includes("fedex")) {
    return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`;
  }

  return null;
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { currentSeller, authLoading } = useSellerAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadOrder() {
      try {
        if (!id) {
          setMessage("معرّف الطلب غير صالح");
          setLoading(false);
          return;
        }

        setLoading(true);
        setMessage("");

        const res = await apiGet(`/commerce/orders/${id}`);

        if (!res?.ok || !res?.data) {
          setOrder(null);
          setMessage(res?.error?.message || res?.message || "تعذر تحميل تفاصيل الطلب");
          return;
        }

        setOrder(res.data);
      } catch (err) {
        console.error(err);
        setOrder(null);
        setMessage("حدث خطأ أثناء تحميل تفاصيل الطلب");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadOrder();
    }
  }, [id, authLoading]);

  if (!authLoading && !currentSeller) {
    return <Navigate to="/login" replace />;
  }

  if (loading || authLoading) {
    return <div className="page-shell">جاري تحميل تفاصيل الطلب...</div>;
  }

  if (!order) {
    return (
      <section className="page-shell" dir="rtl">
        <div style={s.hero}>
          <div>
            <div style={s.eyebrow}>Rahba Seller Order</div>
            <h1 style={s.heroTitle}>تفاصيل الطلب</h1>
            <p style={s.heroText}>لم نتمكن من تحميل هذا الطلب.</p>
          </div>
        </div>

        {message ? <div className="ui-message">{message}</div> : null}

        <div style={s.backRow}>
          <Link to="/orders" style={s.backLink}>الرجوع إلى الطلبات</Link>
        </div>
      </section>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const shipping = order.shipping || null;
  const orderStatus = statusMeta(order.order_status);
  const paymentStatus = paymentMeta(order.payment_status);
  const shippingStatus = statusMeta(shipping?.shipping_status || order.shipping_status);
  const trackingUrl = resolveTrackingUrl(shipping);

  async function copyTracking() {
    try {
      if (!shipping?.tracking_number) return;
      await navigator.clipboard.writeText(shipping.tracking_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (err) {
      console.error("Failed to copy tracking", err);
    }
  }

  return (
    <section className="page-shell" dir="rtl">
      <div style={s.hero}>
        <div>
          <div style={s.eyebrow}>Rahba Seller Order</div>
          <h1 style={s.heroTitle}>{order.order_number || "تفاصيل الطلب"}</h1>
          <p style={s.heroText}>
            راقب المشتري، حالة الطلب، الدفع، والشحن من شاشة واحدة أوضح وأكثر احترافية.
          </p>
        </div>

        <div style={s.heroStats}>
          <div style={s.heroStatCard}>
            <span style={s.heroStatLabel}>الإجمالي</span>
            <strong style={s.heroStatValue}>{formatMoney(order.total_mad, order.currency || "MAD")}</strong>
          </div>

          <div style={s.heroStatCard}>
            <span style={s.heroStatLabel}>عدد المنتجات</span>
            <strong style={s.heroStatValue}>{items.length}</strong>
          </div>

          <div style={s.heroStatCard}>
            <span style={s.heroStatLabel}>الإنشاء</span>
            <strong style={s.heroStatValueSmall}>{order.created_at || "—"}</strong>
          </div>
        </div>
      </div>

      {message ? <div className="ui-message">{message}</div> : null}

      <div style={s.backRow}>
        <Link to="/orders" style={s.backLink}>← الرجوع إلى الطلبات</Link>
      </div>

      <div style={s.statusStrip}>
        <span
          style={{
            ...s.stripBadge,
            background: orderStatus.bg,
            color: orderStatus.color,
            border: `1px solid ${orderStatus.border}`
          }}
        >
          حالة الطلب: {orderStatus.label}
        </span>

        <span
          style={{
            ...s.stripBadge,
            background: paymentStatus.bg,
            color: paymentStatus.color,
            border: `1px solid ${paymentStatus.border}`
          }}
        >
          الدفع: {paymentStatus.label}
        </span>

        <span
          style={{
            ...s.stripBadge,
            background: shippingStatus.bg,
            color: shippingStatus.color,
            border: `1px solid ${shippingStatus.border}`
          }}
        >
          الشحن: {shippingStatus.label}
        </span>
      </div>

      <div style={s.topGrid}>
        <div style={s.panel}>
          <div style={s.panelTitle}>معلومات المشتري</div>
          <div style={s.infoRow}><span style={s.infoKey}>الاسم</span><strong style={s.infoValue}>{order.buyer_name || "اسم غير معروف"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>الهاتف</span><strong style={s.infoValue}>{order.buyer_phone || "بدون هاتف"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>المدينة</span><strong style={s.infoValue}>{order.buyer_city || "مدينة غير معروفة"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>العنوان</span><strong style={s.infoValue}>{order.buyer_address || "بدون عنوان"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>ملاحظات</span><strong style={s.infoValue}>{order.notes || "—"}</strong></div>
        </div>

        <div style={s.panel}>
          <div style={s.panelTitle}>معلومات الطلب</div>
          <div style={s.infoRow}><span style={s.infoKey}>رقم الطلب</span><strong style={s.infoValue}>{order.order_number || "—"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>المعرّف</span><strong style={s.infoValue}>{order.id || "—"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>طريقة الدفع</span><strong style={s.infoValue}>{order.payment_method || "—"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>العملة</span><strong style={s.infoValue}>{order.currency || "MAD"}</strong></div>
          <div style={s.infoRow}><span style={s.infoKey}>الإجمالي</span><strong style={s.infoValue}>{formatMoney(order.total_mad, order.currency || "MAD")}</strong></div>
        </div>
      </div>

      <div style={s.shippingCard}>
        <div style={s.panelTitle}>الشحن والتتبع</div>

        {shipping ? (
          <>
            <div style={s.shippingGrid}>
              <div style={s.shippingMiniCard}>
                <span style={s.shippingLabel}>شركة الشحن</span>
                <strong style={s.shippingValue}>{shipping.provider_name || "—"}</strong>
              </div>

              <div style={s.shippingMiniCard}>
                <span style={s.shippingLabel}>طريقة الشحن</span>
                <strong style={s.shippingValue}>{shipping.method_name || shipping.method_code || "—"}</strong>
              </div>

              <div style={s.shippingMiniCard}>
                <span style={s.shippingLabel}>حالة الشحن</span>
                <strong style={s.shippingValue}>{shippingStatus.label}</strong>
              </div>

              <div style={s.shippingMiniCard}>
                <span style={s.shippingLabel}>ثمن الشحن</span>
                <strong style={s.shippingValue}>{formatMoney(shipping.shipping_price, order.currency || "MAD")}</strong>
              </div>
            </div>

            <div style={s.trackingBar}>
              <div style={s.trackingMain}>
                <span style={s.trackingLabel}>رقم التتبع</span>
                <strong style={s.trackingNumber}>{shipping.tracking_number || "لا يوجد بعد"}</strong>
              </div>

              <div style={s.trackingActions}>
                <button
                  type="button"
                  onClick={copyTracking}
                  disabled={!shipping.tracking_number}
                  style={{
                    ...s.secondaryBtn,
                    opacity: shipping.tracking_number ? 1 : 0.55,
                    cursor: shipping.tracking_number ? "pointer" : "not-allowed"
                  }}
                >
                  {copied ? "تم النسخ" : "نسخ الرقم"}
                </button>

                {trackingUrl ? (
                  <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={s.primaryBtn}
                  >
                    فتح التتبع
                  </a>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <div style={s.noShippingBox}>
            لا توجد معلومات شحن مرتبطة بهذا الطلب بعد.
          </div>
        )}
      </div>

      <div style={s.itemsCard}>
        <div style={s.panelTitle}>المنتجات</div>

        {items.length === 0 ? (
          <div style={s.noShippingBox}>لا توجد عناصر داخل هذا الطلب.</div>
        ) : (
          <div style={s.itemsList}>
            {items.map((item) => (
              <div key={item.id} style={s.itemRow}>
                <div style={s.itemLeft}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title_ar || "product"} style={s.itemImage} />
                  ) : (
                    <div style={s.itemImageFallback}>📦</div>
                  )}

                  <div style={s.itemText}>
                    <div style={s.itemTitle}>{item.title_ar || "منتج"}</div>
                    <div style={s.itemMeta}>
                      <span>الكمية: {item.quantity || 0}</span>
                      <span>•</span>
                      <span>SKU/Slug: {item.slug || "—"}</span>
                    </div>
                  </div>
                </div>

                <div style={s.itemPrice}>
                  {formatMoney(item.unit_price_mad, order.currency || "MAD")}
                </div>
              </div>
            ))}
          </div>
        )}
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
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px"
  },
  heroStatCard: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  heroStatLabel: {
    fontSize: "13px",
    color: "rgba(255,255,255,0.82)",
    fontWeight: "700"
  },
  heroStatValue: {
    fontSize: "24px",
    fontWeight: "900",
    color: "#fff"
  },
  heroStatValueSmall: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#fff",
    lineHeight: 1.6
  },
  backRow: {
    display: "flex",
    justifyContent: "flex-start",
    marginTop: "16px"
  },
  backLink: {
    textDecoration: "none",
    color: "#16356b",
    fontWeight: "800",
    background: "#fff",
    border: "1px solid #dbe4ee",
    borderRadius: "12px",
    padding: "10px 14px"
  },
  statusStrip: {
    marginTop: "16px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  stripBadge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800"
  },
  topGrid: {
    marginTop: "16px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "14px"
  },
  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "10px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)"
  },
  panelTitle: {
    fontWeight: "900",
    fontSize: "16px",
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
  shippingCard: {
    marginTop: "16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "14px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)"
  },
  shippingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px"
  },
  shippingMiniCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "6px"
  },
  shippingLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700"
  },
  shippingValue: {
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "900"
  },
  trackingBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px"
  },
  trackingMain: {
    display: "grid",
    gap: "6px"
  },
  trackingLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "700"
  },
  trackingNumber: {
    color: "#0f172a",
    fontSize: "16px",
    fontWeight: "900",
    letterSpacing: "0.02em"
  },
  trackingActions: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  primaryBtn: {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #ea580c 0%, #f97316 100%)",
    color: "#fff",
    fontWeight: "800",
    boxShadow: "0 10px 24px rgba(249,115,22,0.22)"
  },
  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #dbe4ee",
    color: "#0f172a",
    fontWeight: "800"
  },
  noShippingBox: {
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "16px",
    color: "#475569",
    fontWeight: "700"
  },
  itemsCard: {
    marginTop: "16px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "14px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)"
  },
  itemsList: {
    display: "grid",
    gap: "12px"
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "12px"
  },
  itemLeft: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    minWidth: "0",
    flex: 1
  },
  itemImage: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
    background: "#fff"
  },
  itemImageFallback: {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    display: "grid",
    placeItems: "center",
    background: "#fff",
    border: "1px solid #e2e8f0",
    fontSize: "26px"
  },
  itemText: {
    display: "grid",
    gap: "6px",
    minWidth: "0"
  },
  itemTitle: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: "15px"
  },
  itemMeta: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: "12px"
  },
  itemPrice: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: "15px"
  }
};
