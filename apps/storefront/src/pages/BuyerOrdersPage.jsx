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

function getOrderStatusRank(status) {
  switch (String(status || "").toLowerCase()) {
    case "pending":
      return 1;
    case "confirmed":
    case "processing":
      return 2;
    case "shipped":
      return 3;
    case "delivered":
      return 4;
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

function getLastOrderDate(items) {
  if (!Array.isArray(items) || !items.length) return null;
  const sorted = [...items].sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime();
    const db = new Date(b.created_at || 0).getTime();
    return db - da;
  });
  return sorted[0]?.created_at || null;
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

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      })
      .slice(0, 4);
  }, [orders]);

  const accountStats = useMemo(() => {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((order) => {
      const status = String(order.order_status || "").toLowerCase();
      return ["pending", "confirmed", "processing", "shipped"].includes(status);
    }).length;

    const deliveredOrders = orders.filter(
      (order) => String(order.order_status || "").toLowerCase() === "delivered"
    ).length;

    const cancelledOrders = orders.filter(
      (order) => String(order.order_status || "").toLowerCase() === "cancelled"
    ).length;

    const totalSpent = orders.reduce(
      (sum, order) => sum + Number(order.total_mad || 0),
      0
    );

    return {
      totalOrders,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      totalSpent,
      lastOrderDate: getLastOrderDate(orders)
    };
  }, [orders]);

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
            <div style={s.heroTopRow}>
              <div className="ui-chip">RAHBA ACCOUNT</div>
              <div style={s.heroKicker}>Guest account mode</div>
            </div>

            <div style={s.accountNav}>
              <span style={{ ...s.accountNavItem, ...s.accountNavItemActive }}>حساب الزائر</span>
              <Link to="/track/RB-DEMO" style={s.accountNavLink}>التتبع</Link>
              <Link to="/products" style={s.accountNavLink}>التسوق</Link>
              <Link to="/auth" style={s.accountNavLink}>تسجيل الدخول</Link>
            </div>

            <SectionHead
              title="حساب الزائر"
              subtitle="راجع آخر الطلبات المحفوظة على هذا الجهاز، أو سجّل الدخول لتجربة حساب كاملة وأكثر ثباتاً عبر الأجهزة."
            />

            <div style={s.heroTrustRow}>
              <span style={s.heroTrustItem}>طلبات محفوظة محلياً</span>
              <span style={s.heroTrustItem}>نسخ رقم الطلب</span>
              <span style={s.heroTrustItem}>دخول أسرع لاحقاً</span>
            </div>
          </SectionShell>

          <SectionShell>
            <div className="ui-card-soft" style={s.infoCard}>
              <strong style={s.infoTitle}>مهم</strong>
              <span style={s.infoText}>
                في وضع الزائر، نحفظ رقم الطلب وبعض المعلومات الأساسية فقط على هذا الجهاز.
                التفاصيل الكاملة للطلب والمزامنة بين الأجهزة تتطلب تسجيل الدخول.
              </span>
            </div>
          </SectionShell>

          <div style={s.quickGrid}>
            <SectionShell style={s.quickCardShell}>
              <div style={s.quickCardValue}>{guestOrders.length}</div>
              <div style={s.quickCardLabel}>طلبات محفوظة</div>
            </SectionShell>

            <SectionShell style={s.quickCardShell}>
              <div style={s.quickCardValue}>
                {guestOrders[0]?.created_at ? formatDateTime(guestOrders[0]?.created_at, locale) : "—"}
              </div>
              <div style={s.quickCardLabel}>آخر نشاط</div>
            </SectionShell>
          </div>

          <div style={s.topActions}>
            <Link to="/auth" className="btn btn-secondary">
              تسجيل الدخول
            </Link>
            <Link to="/products" className="btn btn-primary">
              متابعة التسوق
            </Link>
          </div>

          {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

          {guestOrders.length === 0 ? (
            <SectionShell>
              <div style={s.emptyCard}>
                <div style={s.emptyIcon}>📦</div>
                <h3 style={s.emptyTitle}>لا توجد طلبات محفوظة على هذا الجهاز</h3>
                <p style={s.emptyText}>
                  عند إتمام طلب كزائر، سيتم حفظه هنا تلقائياً لتتمكن من الرجوع إليه لاحقاً.
                </p>

                <div style={s.emptyActions}>
                  <Link to="/products" className="btn btn-primary full-width">
                    تصفح المنتجات
                  </Link>
                  <Link to="/auth" className="btn btn-secondary full-width">
                    إنشاء حساب أو تسجيل الدخول
                  </Link>
                </div>
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
          <div style={s.heroTopRow}>
            <div className="ui-chip">RAHBA ACCOUNT</div>
            <div style={s.heroKicker}>Orders & account hub</div>
          </div>

          <div style={s.accountNav}>
            <span style={{ ...s.accountNavItem, ...s.accountNavItemActive }}>حسابي</span>
            <span style={s.accountNavItem}>طلباتي</span>
            <Link to="/products" style={s.accountNavLink}>التسوق</Link>
            <button type="button" onClick={loadAccountOrders} style={s.accountNavButton}>
              تحديث
            </button>
          </div>

          <SectionHead
            title={currentUser?.full_name ? `مرحباً، ${currentUser.full_name}` : "حسابي"}
            subtitle="لوحة حسابك لمراجعة الطلبات، تتبع حالتها، والرجوع بسرعة إلى أهم الإجراءات داخل تجربة أوضح وأكثر احترافية."
          />

          <div style={s.heroTrustRow}>
            <span style={s.heroTrustItem}>طلباتك في مكان واحد</span>
            <span style={s.heroTrustItem}>تتبع أوضح</span>
            <span style={s.heroTrustItem}>وصول أسرع للتفاصيل</span>
          </div>
        </SectionShell>

        <div style={s.quickGrid}>
          <SectionShell style={s.quickCardShell}>
            <div style={s.quickCardValue}>{accountStats.totalOrders}</div>
            <div style={s.quickCardLabel}>إجمالي الطلبات</div>
          </SectionShell>

          <SectionShell style={s.quickCardShell}>
            <div style={s.quickCardValue}>{accountStats.activeOrders}</div>
            <div style={s.quickCardLabel}>طلبات جارية</div>
          </SectionShell>

          <SectionShell style={s.quickCardShell}>
            <div style={s.quickCardValue}>{accountStats.deliveredOrders}</div>
            <div style={s.quickCardLabel}>طلبات مكتملة</div>
          </SectionShell>

          <SectionShell style={s.quickCardShell}>
            <div style={s.quickCardValue}>
              {formatMoney(accountStats.totalSpent, currency, locale)}
            </div>
            <div style={s.quickCardLabel}>إجمالي الإنفاق</div>
          </SectionShell>
        </div>

        <SectionShell>
          <div style={s.accountSummaryGrid}>
            <div className="ui-card-soft" style={s.accountSummaryCard}>
              <div style={s.accountSummaryTitle}>آخر نشاط</div>
              <div style={s.accountSummaryText}>
                {accountStats.lastOrderDate
                  ? formatDateTime(accountStats.lastOrderDate, locale)
                  : "لا يوجد نشاط بعد"}
              </div>
            </div>

            <div className="ui-card-soft" style={s.accountSummaryCard}>
              <div style={s.accountSummaryTitle}>الطلبات الملغاة</div>
              <div style={s.accountSummaryText}>{accountStats.cancelledOrders}</div>
            </div>
          </div>
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

          <Link to="/products" className="btn btn-primary">
            متابعة التسوق
          </Link>
        </div>

        {message ? <div className="message-box">{message}</div> : null}
        {copyMessage ? <div className="message-box">{copyMessage}</div> : null}

        {orders.length === 0 ? (
          <SectionShell>
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>📦</div>
              <h3 style={s.emptyTitle}>لا توجد طلبات بعد</h3>
              <p style={s.emptyText}>
                بعد إتمام أول عملية شراء من حسابك، ستظهر طلباتك هنا مع حالة كل طلب وتفاصيله.
              </p>

              <div style={s.emptyActions}>
                <Link to="/products" className="btn btn-primary full-width">
                  تصفح المنتجات
                </Link>
              </div>
            </div>
          </SectionShell>
        ) : (
          <>
            <SectionShell>
              <SectionHead
                chip="RECENT ORDERS"
                title="آخر الطلبات"
                subtitle="أقرب الطلبات الحديثة للوصول السريع إلى التفاصيل."
              />

              <div style={s.list}>
                {recentOrders.map((order) => {
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

                      <div style={s.orderMetaStrip}>
                        <span style={s.orderMetaChip}>{order.seller_name || "RAHBA"}</span>
                        <span style={s.orderMetaChip}>{Number(order.items_count || 0)} منتج</span>
                        <span style={s.orderMetaChip}>
                          {formatMoney(Number(order.total_mad || 0), order.currency || currency, locale)}
                        </span>
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
                          فتح الطلب
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

            {orders.length > 4 ? (
              <SectionShell>
                <SectionHead
                  chip="ORDER HISTORY"
                  title="كل الطلبات"
                  subtitle="السجل الكامل لطلباتك داخل رحبة."
                />

                <div style={s.compactList}>
                  {orders.map((order) => {
                    const status = getStatusMeta(order.order_status);

                    return (
                      <button
                        key={`compact-${order.id}`}
                        type="button"
                        onClick={() => navigate(`/my-orders/${order.id}`)}
                        style={s.compactOrderRow}
                      >
                        <div style={s.compactOrderMain}>
                          <div style={s.compactOrderNumber}>{order.order_number || "—"}</div>
                          <div style={s.compactOrderMeta}>
                            {order.seller_name || "RAHBA"} · {formatDateTime(order.created_at, locale)}
                          </div>
                        </div>

                        <div style={s.compactOrderSide}>
                          <div
                            style={{
                              ...s.compactStatusPill,
                              background: status.bg,
                              color: status.color,
                              borderColor: status.border
                            }}
                          >
                            {status.label}
                          </div>
                          <strong style={s.compactPrice}>
                            {formatMoney(Number(order.total_mad || 0), order.currency || currency, locale)}
                          </strong>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </SectionShell>
            ) : null}
          </>
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

  accountNav: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    alignItems: "center"
  },

  accountNavItem: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.58)",
    border: "1px solid #dce8f7",
    color: UI.colors.navy,
    display: "inline-flex",
    alignItems: "center",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  accountNavItemActive: {
    background: "#173b74",
    border: "1px solid #173b74",
    color: "#ffffff"
  },

  accountNavLink: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.58)",
    border: "1px solid #dce8f7",
    color: UI.colors.navy,
    display: "inline-flex",
    alignItems: "center",
    textDecoration: "none",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  accountNavButton: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: UI.radius.pill,
    background: "rgba(255,255,255,0.58)",
    border: "1px solid #dce8f7",
    color: UI.colors.navy,
    display: "inline-flex",
    alignItems: "center",
    fontSize: UI.type.bodySm,
    fontWeight: 700,
    cursor: "pointer"
  },

  quickGrid: {
    display: "grid",
    gap: "14px",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))"
  },

  quickCardShell: {
    textAlign: "center",
    gap: "10px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)"
  },

  quickCardValue: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "24px",
    lineHeight: 1.4
  },

  quickCardLabel: {
    color: UI.colors.muted,
    fontWeight: 700,
    fontSize: UI.type.bodySm
  },

  accountSummaryGrid: {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))"
  },

  accountSummaryCard: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
  },

  accountSummaryTitle: {
    color: UI.colors.muted,
    fontWeight: 700,
    fontSize: UI.type.bodySm
  },

  accountSummaryText: {
    color: UI.colors.navy,
    fontWeight: 900,
    lineHeight: 1.8
  },

  topActions: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "10px",
    flexWrap: "wrap"
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

  orderMetaStrip: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },

  orderMetaChip: {
    minHeight: "28px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: "#ffffff",
    border: "1px solid #e7ddcf",
    color: "#7a6f63",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 700
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

  compactList: {
    display: "grid",
    gap: "10px"
  },

  compactOrderRow: {
    width: "100%",
    border: "1px solid #eadfce",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "14px",
    textAlign: "right",
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease"
  },

  compactOrderMain: {
    display: "grid",
    gap: "4px"
  },

  compactOrderNumber: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  compactOrderMeta: {
    color: UI.colors.muted,
    fontWeight: 700,
    fontSize: UI.type.bodySm
  },

  compactOrderSide: {
    display: "grid",
    gap: "8px",
    justifyItems: "end"
  },

  compactStatusPill: {
    minHeight: "30px",
    padding: "0 10px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: UI.radius.pill,
    border: "1px solid transparent",
    fontWeight: 800,
    fontSize: "12px"
  },

  compactPrice: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  emptyCard: {
    display: "grid",
    gap: "12px",
    textAlign: "center",
    padding: "8px 0"
  },

  emptyActions: {
    display: "grid",
    gap: "10px"
  },

  emptyIcon: {
    fontSize: "48px"
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
