import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { apiGet, apiPatch } from "@rahba/shared";
import { useSellerAuth } from "../context/SellerAuthContext";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

function badgeStyle(status) {
  if (status === "delivered") {
    return { background: "#ecfdf5", color: "#166534", border: "1px solid #bbf7d0" };
  }
  if (status === "shipped") {
    return { background: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" };
  }
  if (status === "confirmed") {
    return { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" };
  }
  if (status === "cancelled") {
    return { background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" };
  }
  return { background: "#f8fafc", color: "#475569", border: "1px solid #cbd5e1" };
}

function formatMoney(value, currency = "MAD") {
  return `${Number(value || 0).toLocaleString("en-US")} ${currency}`;
}

function InfoRow({ label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <strong style={s.infoValue}>{value || "—"}</strong>
    </div>
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { currentSeller, authLoading } = useSellerAuth();

  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState("");

  useEffect(() => {
    async function loadOrder() {
      try {
        if (!id || !currentSeller?.id) return;

        setLoading(true);
        setMessage("");

        const res = await apiGet(`/orders/${id}`);

        if (!res?.ok) {
          setMessage(res?.message || "تعذر تحميل تفاصيل الطلب");
          setOrder(null);
          setItems([]);
          return;
        }

        const data = res?.data || {};
        const orderData = data?.order || data;
        const orderItems = Array.isArray(data?.items)
          ? data.items
          : Array.isArray(orderData?.items)
          ? orderData.items
          : [];

        setOrder(orderData || null);
        setItems(orderItems);
      } catch (err) {
        console.error(err);
        setMessage(err?.message || "حدث خطأ أثناء تحميل الطلب");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      loadOrder();
    }
  }, [id, currentSeller, authLoading]);

  async function updateStatus(nextStatus) {
    try {
      if (!order?.id) return;

      setUpdatingStatus(nextStatus);
      setMessage("");

      const res = await apiPatch(`/orders/${order.id}/status`, {
        order_status: nextStatus
      });

      if (!res?.ok) {
        setMessage(res?.message || "فشل تحديث حالة الطلب");
        return;
      }

      setOrder((prev) => ({
        ...prev,
        order_status: res.data?.order_status || nextStatus,
        shipping_status: res.data?.shipping_status || prev?.shipping_status
      }));
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "فشل تحديث حالة الطلب");
    } finally {
      setUpdatingStatus("");
    }
  }

  const totals = useMemo(() => {
    const itemsTotal = items.reduce((sum, item) => {
      const qty = Number(item.quantity || item.qty || 0);
      const unit = Number(item.unit_price_mad || item.unit_price || item.price_mad || 0);
      return sum + qty * unit;
    }, 0);

    return {
      itemsTotal,
      grandTotal: Number(order?.total_mad || itemsTotal || 0)
    };
  }, [items, order]);

  if (!authLoading && !currentSeller) {
    return <Navigate to="/login" replace />;
  }

  if (loading || authLoading) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header">
          <h1>تفاصيل الطلب</h1>
          <p>جاري تحميل تفاصيل الطلب...</p>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header">
          <h1>تفاصيل الطلب</h1>
          <p>تعذر العثور على هذا الطلب.</p>
        </div>

        {message ? <div className="ui-message">{message}</div> : null}

        <div style={s.actionsTop}>
          <Link to="/orders" style={s.secondaryLink}>
            الرجوع إلى الطلبات
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>تفاصيل الطلب</h1>
        <p>عرض كامل لبيانات الطلب الخاصة بمتجرك</p>
      </div>

      <div style={s.actionsTop}>
        <Link to="/orders" style={s.secondaryLink}>
          الرجوع إلى الطلبات
        </Link>
      </div>

      {message ? <div className="ui-message">{message}</div> : null}

      <div style={s.layout}>
        <div style={s.mainColumn}>
          <div style={s.card}>
            <div style={s.topRow}>
              <div>
                <div style={s.orderTitle}>طلب #{order.order_number || order.id}</div>
                <div style={s.metaText}>تم الإنشاء: {order.created_at || "—"}</div>
              </div>

              <div style={s.topRight}>
                <div style={s.totalPrice}>
                  {formatMoney(order.total_mad, order.currency || "MAD")}
                </div>
                <div style={{ ...s.badge, ...badgeStyle(order.order_status) }}>
                  {order.order_status || "pending"}
                </div>
              </div>
            </div>

            <div style={s.statusButtons}>
              {STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateStatus(status)}
                  disabled={updatingStatus === status}
                  style={{
                    ...s.statusBtn,
                    background: order.order_status === status ? "#111827" : "#fff",
                    color: order.order_status === status ? "#fff" : "#111827",
                    opacity: updatingStatus && updatingStatus !== status ? 0.7 : 1
                  }}
                >
                  {updatingStatus === status ? "..." : status}
                </button>
              ))}
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>عناصر الطلب</div>

            {!items.length ? (
              <div style={s.emptyMini}>لا توجد عناصر ظاهرة لهذا الطلب.</div>
            ) : (
              <div style={s.itemsList}>
                {items.map((item, index) => {
                  const qty = Number(item.quantity || item.qty || 0);
                  const unit = Number(item.unit_price_mad || item.unit_price || item.price_mad || 0);
                  const subtotal = qty * unit;

                  return (
                    <div key={item.id || `${item.product_id}-${index}`} style={s.itemCard}>
                      <div style={s.itemTop}>
                        <div>
                          <div style={s.itemName}>
                            {item.product_title ||
                              item.title_ar ||
                              item.name ||
                              `منتج #${item.product_id || index + 1}`}
                          </div>
                          <div style={s.itemMeta}>
                            Product ID: {item.product_id || "—"}
                          </div>
                        </div>

                        <div style={s.itemQty}>× {qty}</div>
                      </div>

                      <div style={s.itemBottom}>
                        <span>الوحدة: {formatMoney(unit, order.currency || "MAD")}</span>
                        <strong>{formatMoney(subtotal, order.currency || "MAD")}</strong>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div style={s.sideColumn}>
          <div style={s.card}>
            <div style={s.sectionTitle}>معلومات المشتري</div>

            <div style={s.infoGrid}>
              <InfoRow label="الاسم" value={order.buyer_name} />
              <InfoRow label="الهاتف" value={order.buyer_phone} />
              <InfoRow label="المدينة" value={order.buyer_city} />
              <InfoRow label="العنوان" value={order.buyer_address} />
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>معلومات الطلب</div>

            <div style={s.infoGrid}>
              <InfoRow label="رقم الطلب" value={order.order_number || order.id} />
              <InfoRow label="طريقة الدفع" value={order.payment_method} />
              <InfoRow label="حالة الدفع" value={order.payment_status} />
              <InfoRow label="حالة الشحن" value={order.shipping_status} />
              <InfoRow label="عملة الطلب" value={order.currency || "MAD"} />
              <InfoRow label="تاريخ الإنشاء" value={order.created_at} />
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>الملخص المالي</div>

            <div style={s.summaryGrid}>
              <div style={s.summaryRow}>
                <span>مجموع العناصر</span>
                <strong>{formatMoney(totals.itemsTotal, order.currency || "MAD")}</strong>
              </div>

              <div style={s.summaryRow}>
                <span>الإجمالي النهائي</span>
                <strong>{formatMoney(totals.grandTotal, order.currency || "MAD")}</strong>
              </div>
            </div>
          </div>

          {order.notes ? (
            <div style={s.card}>
              <div style={s.sectionTitle}>ملاحظات</div>
              <div style={s.notesBox}>{order.notes}</div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const s = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1.25fr 0.95fr",
    gap: "16px"
  },
  mainColumn: {
    display: "grid",
    gap: "16px"
  },
  sideColumn: {
    display: "grid",
    gap: "16px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "grid",
    gap: "16px"
  },
  actionsTop: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "14px"
  },
  secondaryLink: {
    padding: "10px 14px",
    borderRadius: "10px",
    background: "#fff",
    border: "1px solid #e2e8f0",
    color: "#111827",
    textDecoration: "none",
    fontWeight: "700"
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "start"
  },
  topRight: {
    display: "grid",
    gap: "8px",
    justifyItems: "end"
  },
  orderTitle: {
    fontWeight: "900",
    fontSize: "20px",
    color: "#0f172a"
  },
  metaText: {
    color: "#64748b",
    marginTop: "6px",
    fontSize: "14px"
  },
  totalPrice: {
    fontWeight: "900",
    fontSize: "20px",
    color: "#0f172a"
  },
  badge: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: "800"
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
  sectionTitle: {
    fontWeight: "900",
    fontSize: "18px",
    color: "#0f172a"
  },
  itemsList: {
    display: "grid",
    gap: "12px"
  },
  itemCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start"
  },
  itemName: {
    fontWeight: "800",
    fontSize: "16px",
    color: "#111827"
  },
  itemMeta: {
    marginTop: "4px",
    color: "#64748b",
    fontSize: "13px"
  },
  itemQty: {
    fontWeight: "900",
    color: "#1d4ed8",
    fontSize: "18px"
  },
  itemBottom: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    color: "#475569",
    fontSize: "14px"
  },
  infoGrid: {
    display: "grid",
    gap: "10px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    minHeight: "48px",
    padding: "0 14px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0"
  },
  infoLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "700"
  },
  infoValue: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "800",
    textAlign: "left"
  },
  summaryGrid: {
    display: "grid",
    gap: "10px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    minHeight: "48px",
    padding: "0 14px",
    borderRadius: "14px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    fontWeight: "700"
  },
  notesBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    color: "#334155",
    lineHeight: 1.8,
    fontSize: "14px"
  },
  emptyMini: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "16px",
    color: "#64748b",
    fontWeight: "700"
  }
};
