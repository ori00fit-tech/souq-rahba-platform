import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    total,
    currency,
    language,
    currentUser,
    clearCart,
    removeFromCart
  } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    buyer_city: "",
    buyer_address: "",
    notes: "",
    payment_method: "cod"
  });

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      buyer_name: prev.buyer_name || currentUser?.full_name || "",
      buyer_phone: prev.buyer_phone || currentUser?.phone || ""
    }));
  }, [currentUser]);

  const normalizedCart = useMemo(() => {
    if (!Array.isArray(cart)) return [];

    return cart.map((item) => ({
      id: item.id,
      product_id: item.id,
      slug: item.slug,
      name: item.name || "",
      seller_id: item.seller_id || null,
      seller: item.seller || "RAHBA",
      price: Number(item.price ?? 0),
      qty: Number(item.qty || item.quantity || 1),
      image_url: item.image_url || ""
    }));
  }, [cart]);

  const sellerIds = useMemo(() => {
    return [...new Set(normalizedCart.map((item) => item.seller_id).filter(Boolean))];
  }, [normalizedCart]);

  const hasMixedSellers = sellerIds.length > 1;
  const canCheckout = normalizedCart.length > 0 && !hasMixedSellers;

  const shipping = total > 0 ? 0 : 0;
  const grandTotal = total + shipping;

  async function emptyCartSafely() {
    if (typeof clearCart === "function") {
      clearCart();
      return;
    }

    if (typeof removeFromCart === "function") {
      normalizedCart.forEach((item) => removeFromCart(item.id));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!normalizedCart.length) {
      setMessage("السلة فارغة");
      return;
    }

    if (hasMixedSellers) {
      setMessage("حالياً يجب أن تكون كل عناصر الطلب من نفس البائع");
      return;
    }

    if (!form.buyer_name.trim()) {
      setMessage("يرجى إدخال الاسم الكامل");
      return;
    }

    if (!form.buyer_phone.trim()) {
      setMessage("يرجى إدخال رقم الهاتف");
      return;
    }

    if (!form.buyer_city.trim()) {
      setMessage("يرجى إدخال المدينة");
      return;
    }

    if (!form.buyer_address.trim()) {
      setMessage("يرجى إدخال العنوان");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const payload = {
        seller_id: sellerIds[0],
        payment_method: "cod",
        buyer_name: form.buyer_name.trim(),
        buyer_phone: form.buyer_phone.trim(),
        buyer_city: form.buyer_city.trim(),
        buyer_address: form.buyer_address.trim(),
        notes: form.notes.trim() || null,
        items: normalizedCart.map((item) => ({
          product_id: item.product_id,
          quantity: item.qty
        }))
      };

      const result = await apiPost("/commerce/orders", payload);

      if (!result?.ok) {
        setMessage(result?.message || "تعذر إتمام الطلب");
        return;
      }

      await emptyCartSafely();
      setSuccessOrder(result.data || null);
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تأكيد الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  if (!normalizedCart.length && !successOrder) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA CHECKOUT</div>
            <h1 className="page-title">إتمام الطلب</h1>
            <p className="page-subtitle">
              لا يمكن إتمام الطلب لأن السلة فارغة حالياً.
            </p>
          </div>

          <div className="empty-state" style={s.emptyCard}>
            <div style={s.emptyIcon}>🧺</div>
            <h3 style={s.emptyTitle}>السلة فارغة</h3>
            <p style={s.emptyText}>
              أضف منتجات إلى السلة أولاً ثم ارجع لإتمام الطلب.
            </p>

            <Link to="/products" className="btn btn-primary full-width">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (successOrder) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.successCard}>
            <div style={s.successIcon}>✅</div>
            <div className="ui-chip">تم الطلب بنجاح</div>
            <h1 className="page-title">تم تأكيد طلبك</h1>
            <p className="page-subtitle">
              توصلنا بطلبك بنجاح، وسيتم التواصل معك لتأكيد التفاصيل.
            </p>

            <div className="ui-card-soft" style={s.successInfo}>
              <div style={s.successRow}>
                <span>رقم الطلب</span>
                <strong>{successOrder.order_number || "—"}</strong>
              </div>
              <div style={s.successRow}>
                <span>طريقة الدفع</span>
                <strong>الدفع عند الاستلام</strong>
              </div>
              <div style={s.successRow}>
                <span>الإجمالي</span>
                <strong>{formatMoney(successOrder.total_mad || grandTotal, currency, locale)}</strong>
              </div>
            </div>

            <div style={s.successActions}>
              <button
                type="button"
                className="btn btn-primary full-width"
                onClick={() => navigate("/my-orders")}
              >
                عرض طلباتي
              </button>

              <button
                type="button"
                className="btn btn-secondary full-width"
                onClick={() => navigate("/products")}
              >
                متابعة التسوق
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA CHECKOUT</div>
          <h1 className="page-title">إتمام الطلب</h1>
          <p className="page-subtitle">
            خطوة أخيرة فقط: أدخل بيانات التوصيل وأكد الطلب.
          </p>
        </div>

        {hasMixedSellers ? (
          <div className="message-box">
            حالياً لا يمكن إتمام طلب واحد من عدة باعة. يرجى إتمام كل بائع بشكل منفصل.
          </div>
        ) : null}

        {message ? <div className="message-box">{message}</div> : null}

        <div style={s.layout}>
          <form className="ui-card" style={s.formCard} onSubmit={handleSubmit}>
            <h2 className="section-title">بيانات التوصيل</h2>

            <label className="ui-label">
              <span>الاسم الكامل</span>
              <input
                className="ui-input"
                value={form.buyer_name}
                onChange={(e) => setForm((prev) => ({ ...prev, buyer_name: e.target.value }))}
                placeholder="الاسم الكامل"
              />
            </label>

            <label className="ui-label">
              <span>رقم الهاتف</span>
              <input
                className="ui-input"
                value={form.buyer_phone}
                onChange={(e) => setForm((prev) => ({ ...prev, buyer_phone: e.target.value }))}
                placeholder="06xxxxxxxx"
                inputMode="tel"
              />
            </label>

            <label className="ui-label">
              <span>المدينة</span>
              <input
                className="ui-input"
                value={form.buyer_city}
                onChange={(e) => setForm((prev) => ({ ...prev, buyer_city: e.target.value }))}
                placeholder="مثلاً: الدار البيضاء"
              />
            </label>

            <label className="ui-label">
              <span>العنوان</span>
              <textarea
                className="ui-textarea"
                value={form.buyer_address}
                onChange={(e) => setForm((prev) => ({ ...prev, buyer_address: e.target.value }))}
                placeholder="الحي، الزنقة، رقم المنزل..."
              />
            </label>

            <label className="ui-label">
              <span>ملاحظات إضافية</span>
              <textarea
                className="ui-textarea"
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="ملاحظات اختيارية حول الطلب أو التوصيل"
              />
            </label>

            <div className="ui-card-soft" style={s.paymentCard}>
              <div style={s.paymentTitle}>طريقة الدفع</div>
              <label style={s.paymentMethod}>
                <input
                  type="radio"
                  checked
                  readOnly
                />
                <span>الدفع عند الاستلام (Cash on Delivery)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting || !canCheckout}
              className="btn btn-primary full-width"
            >
              {submitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
            </button>
          </form>

          <aside className="ui-card" style={s.summaryCard}>
            <h2 className="section-title">ملخص الطلب</h2>

            <div style={s.itemsList}>
              {normalizedCart.map((item) => (
                <div key={item.id} className="ui-card-soft" style={s.summaryItem}>
                  <div style={s.summaryItemTop}>
                    <div style={s.summaryItemName}>{item.name}</div>
                    <div style={s.summaryItemQty}>× {item.qty}</div>
                  </div>

                  <div style={s.summaryItemMeta}>
                    <span>{item.seller}</span>
                    <strong>{formatMoney(item.price * item.qty, currency, locale)}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div style={s.totals}>
              <div style={s.totalRow}>
                <span>المجموع الفرعي</span>
                <strong>{formatMoney(total, currency, locale)}</strong>
              </div>

              <div style={s.totalRow}>
                <span>التوصيل</span>
                <strong>{shipping === 0 ? "مجاني" : formatMoney(shipping, currency, locale)}</strong>
              </div>

              <div style={s.divider} />

              <div style={s.totalRowGrand}>
                <span>الإجمالي</span>
                <strong>{formatMoney(grandTotal, currency, locale)}</strong>
              </div>
            </div>

            <Link to="/cart" className="btn btn-secondary full-width" style={s.backToCart}>
              الرجوع إلى السلة
            </Link>
          </aside>
        </div>
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
  layout: {
    display: "grid",
    gap: "14px"
  },
  formCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  paymentCard: {
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  paymentTitle: {
    color: "#173b74",
    fontWeight: 900
  },
  paymentMethod: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#374151",
    fontWeight: 700
  },
  summaryCard: {
    padding: "16px",
    display: "grid",
    gap: "14px",
    position: "sticky",
    bottom: "12px"
  },
  itemsList: {
    display: "grid",
    gap: "10px"
  },
  summaryItem: {
    padding: "12px"
  },
  summaryItemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },
  summaryItemName: {
    color: "#1f2937",
    fontWeight: 900,
    lineHeight: 1.6
  },
  summaryItemQty: {
    color: "#173b74",
    fontWeight: 900,
    whiteSpace: "nowrap"
  },
  summaryItemMeta: {
    marginTop: "8px",
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  totals: {
    display: "grid",
    gap: "12px"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#4b5563",
    fontWeight: 700
  },
  totalRowGrand: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  divider: {
    height: "1px",
    background: "#e9dfd2"
  },
  backToCart: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
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
  },
  successCard: {
    padding: "22px",
    display: "grid",
    gap: "14px"
  },
  successIcon: {
    fontSize: "42px"
  },
  successInfo: {
    padding: "14px",
    display: "grid",
    gap: "10px"
  },
  successRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#374151",
    fontWeight: 700
  },
  successActions: {
    display: "grid",
    gap: "10px"
  }
};
