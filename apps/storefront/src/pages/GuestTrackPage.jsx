import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGet } from "../lib/api";
import { formatMoney } from "../lib/utils";

function normalizeMoroccanPhone(input) {
  const raw = String(input || "").trim().replace(/\s+/g, "");
  if (!raw) return "";
  if (raw.startsWith("+212")) return `0${raw.slice(4)}`;
  if (raw.startsWith("212")) return `0${raw.slice(3)}`;
  return raw;
}

function getApiErrorMessage(result, fallback = "تعذر تتبع الطلب") {
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

export default function GuestTrackPage() {
  const { orderNumber } = useParams();

  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const locale = "ar-MA";

  const normalizedOrderNumber = useMemo(
    () => String(orderNumber || "").trim().toUpperCase(),
    [orderNumber]
  );

  async function handleLookup(e) {
    if (e) e.preventDefault();

    const normalizedPhone = normalizeMoroccanPhone(phone);

    if (!normalizedOrderNumber) {
      setMessage("رقم الطلب غير صالح");
      setOrder(null);
      return;
    }

    if (!normalizedPhone) {
      setMessage("أدخل رقم الهاتف الذي استعملته أثناء الطلب");
      setOrder(null);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setOrder(null);

      const result = await apiGet(
        `/commerce/track/${encodeURIComponent(normalizedOrderNumber)}?phone=${encodeURIComponent(normalizedPhone)}`
      );

      if (!result?.ok) {
        setMessage(getApiErrorMessage(result, "تعذر تتبع الطلب"));
        setOrder(null);
        return;
      }

      setOrder(result.data || null);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تتبع الطلب");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setOrder(null);
    setMessage("");
  }, [normalizedOrderNumber]);

  const status = getStatusMeta(order?.order_status);

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA GUEST TRACKING</div>
          <h1 className="page-title">تتبع طلب الزائر</h1>
          <p className="page-subtitle">
            أدخل نفس رقم الهاتف الذي استعملته أثناء الطلب لتتبع الحالة من أي جهاز.
          </p>
        </div>

        <form className="ui-card" style={s.formCard} onSubmit={handleLookup}>
          <label className="ui-label">
            <span>رقم الطلب</span>
            <input
              className="ui-input"
              value={normalizedOrderNumber}
              readOnly
            />
          </label>

          <label className="ui-label">
            <span>رقم الهاتف</span>
            <input
              className="ui-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="06xxxxxxxx"
              inputMode="tel"
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary full-width"
            disabled={loading}
          >
            {loading ? "جاري التتبع..." : "تتبع الطلب"}
          </button>
        </form>

        {message ? <div className="message-box">{message}</div> : null}

        {order ? (
          <div className="page-stack">
            <div className="ui-card" style={s.card}>
              <div style={s.headerRow}>
                <div>
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

              <div style={s.infoGrid}>
                <div className="ui-card-soft" style={s.infoBox}>
                  <span style={s.infoLabel}>البائع</span>
                  <strong style={s.infoValue}>{order.seller_name || "RAHBA"}</strong>
                </div>

                <div className="ui-card-soft" style={s.infoBox}>
                  <span style={s.infoLabel}>المدينة</span>
                  <strong style={s.infoValue}>{order.buyer_city || "—"}</strong>
                </div>

                <div className="ui-card-soft" style={s.infoBox}>
                  <span style={s.infoLabel}>الإجمالي</span>
                  <strong style={s.infoValue}>
                    {formatMoney(Number(order.total_mad || 0), "MAD", locale)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="ui-card" style={s.card}>
              <h2 className="section-title">المنتجات</h2>

              {Array.isArray(order.items) && order.items.length > 0 ? (
                <div style={s.itemsList}>
                  {order.items.map((item, idx) => (
                    <div key={item.id || idx} className="ui-card-soft" style={s.itemCard}>
                      <div style={s.itemTitle}>{item.title_ar || "منتج"}</div>
                      <div style={s.itemMeta}>
                        <span>الكمية: {Number(item.quantity || 0)}</span>
                        <span>
                          {formatMoney(
                            Number(item.unit_price_mad || 0) * Number(item.quantity || 0),
                            "MAD",
                            locale
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">لا توجد عناصر ظاهرة لهذا الطلب</div>
              )}
            </div>

            {order.shipping ? (
              <div className="ui-card" style={s.card}>
                <h2 className="section-title">الشحن</h2>

                <div style={s.infoGrid}>
                  <div className="ui-card-soft" style={s.infoBox}>
                    <span style={s.infoLabel}>شركة الشحن</span>
                    <strong style={s.infoValue}>{order.shipping.provider_name || "—"}</strong>
                  </div>

                  <div className="ui-card-soft" style={s.infoBox}>
                    <span style={s.infoLabel}>طريقة الشحن</span>
                    <strong style={s.infoValue}>{order.shipping.method_name || "—"}</strong>
                  </div>

                  <div className="ui-card-soft" style={s.infoBox}>
                    <span style={s.infoLabel}>رقم التتبع</span>
                    <strong style={s.infoValue}>{order.shipping.tracking_number || "—"}</strong>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={s.bottomActions}>
          <Link to="/products" className="btn btn-secondary full-width">
            متابعة التسوق
          </Link>
        </div>
      </div>
    </section>
  );
}

const s = {
  heroCard: {
    padding: "18px",
    display: "grid",
    gap: "12px"
  },
  formCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  card: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap"
  },
  orderNumber: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "20px"
  },
  orderDate: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700,
    marginTop: "6px"
  },
  statusPill: {
    minHeight: "36px",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    border: "1px solid transparent",
    fontWeight: 800,
    fontSize: "13px"
  },
  infoGrid: {
    display: "grid",
    gap: "10px",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))"
  },
  infoBox: {
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  infoValue: {
    color: "#173b74",
    fontWeight: 900
  },
  itemsList: {
    display: "grid",
    gap: "10px"
  },
  itemCard: {
    padding: "14px",
    display: "grid",
    gap: "8px"
  },
  itemTitle: {
    color: "#173b74",
    fontWeight: 900
  },
  itemMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    color: "#4b5563",
    fontWeight: 700
  },
  bottomActions: {
    display: "grid",
    gap: "10px"
  }
};
