import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart, currentUser, authLoading } = useApp();

  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    buyer_city: "",
    buyer_address: "",
    notes: "",
    payment_method: "cash_on_delivery"
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      buyer_name: currentUser?.full_name || prev.buyer_name || "",
      buyer_phone: currentUser?.phone || prev.buyer_phone || ""
    }));
  }, [currentUser]);

  const groupedBySeller = useMemo(() => {
    const groups = new Map();

    for (const item of Array.isArray(cart) ? cart : []) {
      const sellerId = item?.seller_id || "unknown";
      const existing = groups.get(sellerId) || {
        seller_id: sellerId,
        seller_name: item?.seller || "RAHBA Seller",
        items: []
      };

      existing.items.push({
        ...item,
        quantity: Number(item.quantity || item.qty || 1)
      });

      groups.set(sellerId, existing);
    }

    return Array.from(groups.values());
  }, [cart]);

  const totals = useMemo(() => {
    let subtotal = 0;

    for (const sellerGroup of groupedBySeller) {
      for (const item of sellerGroup.items) {
        subtotal += Number(item.price || item.price_mad || 0) * Number(item.quantity || 1);
      }
    }

    return {
      subtotal,
      total: subtotal
    };
  }, [groupedBySeller]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (authLoading) {
      setMessage("جاري التحقق من الجلسة...");
      return;
    }

    if (!currentUser) {
      setMessage("يجب تسجيل الدخول أولاً");
      navigate("/auth");
      return;
    }

    if (currentUser.role !== "buyer") {
      setMessage("هذه الصفحة مخصصة لحسابات المشترين فقط");
      return;
    }

    if (!groupedBySeller.length) {
      setMessage("السلة فارغة");
      return;
    }

    if (
      !form.buyer_name.trim() ||
      !form.buyer_phone.trim() ||
      !form.buyer_city.trim() ||
      !form.buyer_address.trim()
    ) {
      setMessage("يرجى ملء الاسم والهاتف والمدينة والعنوان");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const createdOrders = [];

      for (const sellerGroup of groupedBySeller) {
        const payload = {
          buyer_user_id: currentUser.id,
          seller_id: sellerGroup.seller_id,
          payment_method: form.payment_method,
          buyer_name: form.buyer_name.trim(),
          buyer_phone: form.buyer_phone.trim(),
          buyer_city: form.buyer_city.trim(),
          buyer_address: form.buyer_address.trim(),
          notes: form.notes.trim() || null,
          items: sellerGroup.items.map((item) => ({
            product_id: item.id,
            quantity: Number(item.quantity || item.qty || 1)
          }))
        };

        const res = await apiPost("/commerce/orders", payload);

        if (!res?.ok) {
          throw new Error(res?.message || "تعذر إنشاء الطلب");
        }

        createdOrders.push(res.data);
      }

      clearCart();

      const firstOrder = createdOrders[0];
      setMessage(
        firstOrder?.order_number
          ? `تم إنشاء الطلب بنجاح. رقم الطلب: ${firstOrder.order_number}`
          : "تم إنشاء الطلب بنجاح"
      );

      setTimeout(() => {
        navigate("/my-orders");
      }, 900);
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={s.card}>
          <h1 style={s.title}>إتمام الطلب</h1>
          <p style={s.muted}>السلة فارغة حالياً</p>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.checkoutPage}>
        <div style={s.checkoutHeader}>
          <h1 style={s.title}>إتمام الطلب</h1>
          <p style={s.muted}>أدخل معلوماتك لإكمال عملية الشراء</p>
        </div>

        <div style={s.checkoutGrid}>
          <form onSubmit={handleSubmit} style={s.card}>
            <div style={s.formGroup}>
              <label style={s.label}>الاسم الكامل</label>
              <input
                value={form.buyer_name}
                onChange={(e) => updateField("buyer_name", e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>رقم الهاتف</label>
              <input
                value={form.buyer_phone}
                onChange={(e) => updateField("buyer_phone", e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>المدينة</label>
              <input
                value={form.buyer_city}
                onChange={(e) => updateField("buyer_city", e.target.value)}
                style={s.input}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>العنوان</label>
              <textarea
                value={form.buyer_address}
                onChange={(e) => updateField("buyer_address", e.target.value)}
                style={s.textarea}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>ملاحظات أثناء الطلب</label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="مثلاً: اتصل بي قبل التسليم"
                style={s.textareaSmall}
              />
            </div>

            {message ? <div style={s.message}>{message}</div> : null}

            <button type="submit" disabled={submitting} style={s.submitBtn}>
              {submitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
            </button>
          </form>

          <aside style={s.card}>
            <h2 style={s.summaryTitle}>ملخص الطلب</h2>

            <div style={s.summaryList}>
              {groupedBySeller.map((group) => (
                <div key={group.seller_id} style={s.summaryBlock}>
                  {group.items.map((item) => (
                    <div key={item.id} style={s.summaryRow}>
                      <div style={s.summaryPrice}>
                        MAD {Number(item.price || item.price_mad || 0).toLocaleString()}
                      </div>
                      <div style={s.summaryName}>
                        {item.name || item.title_ar}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={s.totalRow}>
              <strong>الإجمالي</strong>
              <strong>MAD {totals.total.toLocaleString()}</strong>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

const s = {
  checkoutPage: {
    display: "grid",
    gap: "24px"
  },
  checkoutHeader: {
    display: "grid",
    gap: "8px"
  },
  checkoutGrid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "20px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e6dccf",
    borderRadius: "24px",
    padding: "18px",
    boxShadow: "0 18px 40px rgba(27,58,107,0.08)",
    display: "grid",
    gap: "16px"
  },
  title: {
    margin: 0,
    color: "#1b3a6b",
    fontSize: "22px",
    fontWeight: 900
  },
  muted: {
    margin: 0,
    color: "#6e6357"
  },
  summaryTitle: {
    margin: 0,
    color: "#1b3a6b",
    fontSize: "20px",
    fontWeight: 900
  },
  formGroup: {
    display: "grid",
    gap: "8px"
  },
  label: {
    color: "#1b3a6b",
    fontWeight: 700
  },
  input: {
    width: "100%",
    border: "1px solid #d9cfbf",
    borderRadius: "14px",
    padding: "14px 16px",
    background: "#f8fbff",
    fontSize: "16px",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    minHeight: "72px",
    border: "1px solid #d9cfbf",
    borderRadius: "14px",
    padding: "14px 16px",
    background: "#f8fbff",
    fontSize: "16px",
    boxSizing: "border-box",
    resize: "vertical"
  },
  textareaSmall: {
    width: "100%",
    minHeight: "56px",
    border: "1px solid #d9cfbf",
    borderRadius: "14px",
    padding: "14px 16px",
    background: "#fffdfa",
    fontSize: "16px",
    boxSizing: "border-box",
    resize: "vertical"
  },
  message: {
    border: "1px solid #e6dccf",
    background: "#fffdfa",
    borderRadius: "14px",
    padding: "14px 16px",
    color: "#7c2d12"
  },
  submitBtn: {
    border: "none",
    borderRadius: "16px",
    padding: "16px 18px",
    fontWeight: 800,
    fontSize: "16px",
    cursor: "pointer",
    background: "#c8922a",
    color: "#231a10"
  },
  summaryList: {
    display: "grid",
    gap: "14px"
  },
  summaryBlock: {
    display: "grid",
    gap: "12px"
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    paddingBottom: "12px",
    borderBottom: "1px solid #efe5d8"
  },
  summaryPrice: {
    fontWeight: 800,
    color: "#221d16",
    minWidth: "90px"
  },
  summaryName: {
    color: "#221d16",
    textAlign: "right"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "8px",
    borderTop: "1px solid #e6dccf",
    color: "#1b3a6b",
    fontSize: "18px"
  }
};
