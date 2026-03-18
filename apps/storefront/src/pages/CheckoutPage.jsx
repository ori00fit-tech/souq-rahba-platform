import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cartItems = [],
    clearCart,
    currentUser,
    authLoading
  } = useApp();

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
      buyer_name: currentUser?.full_name || prev.buyer_name,
      buyer_phone: currentUser?.phone || prev.buyer_phone
    }));
  }, [currentUser]);

  const groupedBySeller = useMemo(() => {
    const groups = new Map();

    for (const item of Array.isArray(cartItems) ? cartItems : []) {
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
  }, [cartItems]);

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

    if (!form.buyer_name.trim() || !form.buyer_phone.trim() || !form.buyer_city.trim() || !form.buyer_address.trim()) {
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
            quantity: Number(item.quantity || item.qty || 1),
            unit_price_mad: Number(item.price || item.price_mad || 0)
          }))
        };

        const res = await apiPost("/commerce/orders", payload);

        if (!res?.ok) {
          throw new Error(res?.message || "تعذر إنشاء الطلب");
        }

        createdOrders.push(res.data);
      }

      if (typeof clearCart === "function") {
        clearCart();
      }

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
      setMessage(err.message || "حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setSubmitting(false);
    }
  }

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
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
      <div style={s.layout}>
        <form onSubmit={handleSubmit} style={s.card}>
          <div style={s.head}>
            <h1 style={s.title}>إتمام الطلب</h1>
            <p style={s.muted}>أدخل بيانات التوصيل لإرسال الطلب بشكل صحيح</p>
          </div>

          <div style={s.grid}>
            <Field label="الاسم الكامل">
              <input
                value={form.buyer_name}
                onChange={(e) => updateField("buyer_name", e.target.value)}
                style={s.input}
              />
            </Field>

            <Field label="رقم الهاتف">
              <input
                value={form.buyer_phone}
                onChange={(e) => updateField("buyer_phone", e.target.value)}
                style={s.input}
              />
            </Field>

            <Field label="المدينة">
              <input
                value={form.buyer_city}
                onChange={(e) => updateField("buyer_city", e.target.value)}
                style={s.input}
              />
            </Field>

            <Field label="طريقة الدفع">
              <select
                value={form.payment_method}
                onChange={(e) => updateField("payment_method", e.target.value)}
                style={s.input}
              >
                <option value="cash_on_delivery">الدفع عند الاستلام</option>
              </select>
            </Field>
          </div>

          <Field label="العنوان الكامل">
            <textarea
              value={form.buyer_address}
              onChange={(e) => updateField("buyer_address", e.target.value)}
              style={s.textarea}
              placeholder="الحي، الشارع، رقم المنزل، معلومات إضافية..."
            />
          </Field>

          <Field label="ملاحظات للطلب (اختياري)">
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              style={s.textarea}
              placeholder="مثلاً: اتصل بي قبل التوصيل"
            />
          </Field>

          {message ? <div style={s.message}>{message}</div> : null}

          <button type="submit" disabled={submitting} style={s.submitBtn}>
            {submitting ? "جاري تأكيد الطلب..." : "تأكيد الطلب"}
          </button>
        </form>

        <aside style={s.card}>
          <div style={s.head}>
            <h2 style={s.sideTitle}>ملخص الطلب</h2>
            <p style={s.muted}>سيتم إنشاء طلب منفصل لكل بائع داخل السلة</p>
          </div>

          <div style={s.summaryList}>
            {groupedBySeller.map((group) => (
              <div key={group.seller_id} style={s.groupCard}>
                <div style={s.groupSeller}>{group.seller_name}</div>

                <div style={s.itemsList}>
                  {group.items.map((item) => (
                    <div key={item.id} style={s.itemRow}>
                      <div>
                        <div style={s.itemTitle}>{item.name || item.title_ar}</div>
                        <div style={s.itemMeta}>الكمية: {item.quantity || 1}</div>
                      </div>
                      <div style={s.itemPrice}>
                        {(Number(item.price || item.price_mad || 0) * Number(item.quantity || 1)).toFixed(0)} MAD
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={s.totalBox}>
            <div style={s.totalRow}>
              <span>المجموع</span>
              <strong>{totals.total.toFixed(0)} MAD</strong>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      {children}
    </label>
  );
}

const s = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "20px",
    display: "grid",
    gap: "16px"
  },
  head: {
    display: "grid",
    gap: "6px"
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 800,
    color: "#1f3b73"
  },
  sideTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 800,
    color: "#1f3b73"
  },
  muted: {
    margin: 0,
    color: "#64748b"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px"
  },
  field: {
    display: "grid",
    gap: "6px"
  },
  label: {
    fontWeight: 700,
    fontSize: "14px",
    color: "#111827"
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff"
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    resize: "vertical"
  },
  message: {
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    background: "#f8fafc"
  },
  submitBtn: {
    padding: "14px 18px",
    borderRadius: "14px",
    border: "none",
    background: "#1f3b73",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer"
  },
  summaryList: {
    display: "grid",
    gap: "12px"
  },
  groupCard: {
    border: "1px solid #e5e7eb",
    borderRadius: "14px",
    padding: "14px",
    display: "grid",
    gap: "12px",
    background: "#f8fafc"
  },
  groupSeller: {
    fontWeight: 800,
    color: "#1f3b73"
  },
  itemsList: {
    display: "grid",
    gap: "10px"
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center"
  },
  itemTitle: {
    fontWeight: 700
  },
  itemMeta: {
    fontSize: "13px",
    color: "#64748b"
  },
  itemPrice: {
    fontWeight: 800,
    color: "#111827"
  },
  totalBox: {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "14px"
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "18px"
  }
};
