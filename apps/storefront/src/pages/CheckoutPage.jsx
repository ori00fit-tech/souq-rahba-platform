import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "@rahba/shared";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

function saveGuestOrder(entry) {
  try {
    const raw = localStorage.getItem("guest_orders");
    const existing = raw ? JSON.parse(raw) : [];
    const next = [entry, ...existing]
      .filter((item, index, arr) =>
        index === arr.findIndex((x) => x.order_number === item.order_number)
      )
      .slice(0, 20);

    localStorage.setItem("guest_orders", JSON.stringify(next));
  } catch (error) {
    console.error("Failed to save guest order", error);
  }
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, total, currency, language, currentUser, removeFromCart } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);

  const [form, setForm] = useState({
    buyer_name: "",
    buyer_phone: "",
    buyer_city: "",
    buyer_address: "",
    notes: ""
  });

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  useEffect(() => {
    if (currentUser) {
      setForm((f) => ({
        ...f,
        buyer_name: f.buyer_name || currentUser.full_name || "",
        buyer_phone: f.buyer_phone || currentUser.phone || ""
      }));
    }
  }, [currentUser]);

  const ordersGrouped = useMemo(() => {
    const groups = {};

    (cart || []).forEach((item) => {
      const sellerId = item.seller_id || "default";
      if (!groups[sellerId]) {
        groups[sellerId] = {
          seller_id: sellerId,
          seller_name: item.seller || "RAHBA",
          items: []
        };
      }

      groups[sellerId].items.push({
        id: item.id,
        product_id: item.id,
        quantity: Number(item.qty || item.quantity || 1),
        price: Number(item.price || 0),
        name: item.name || "منتج"
      });
    });

    return Object.values(groups).map((group) => ({
      ...group,
      subtotal: group.items.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
      )
    }));
  }, [cart]);

  const numSellers = ordersGrouped.length;
  const shipping = total > 0 ? 0 : 0;
  const grandTotal = total + shipping;

  function validateForm() {
    if (!form.buyer_name.trim()) return "يرجى إدخال الاسم الكامل";
    if (!form.buyer_phone.trim()) return "يرجى إدخال رقم الهاتف";
    if (!/^0[5-7][0-9]{8}$/.test(form.buyer_phone.trim())) {
      return "يرجى إدخال رقم هاتف مغربي صحيح";
    }
    if (!form.buyer_city.trim()) return "يرجى إدخال المدينة";
    if (!form.buyer_address.trim()) return "يرجى إدخال العنوان";
    if (!ordersGrouped.length) return "السلة فارغة";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setSubmitting(true);
    setMessage("");

    const newResults = [];

    for (const group of ordersGrouped) {
      try {
        const payload = {
          buyer_name: form.buyer_name.trim(),
          buyer_phone: form.buyer_phone.trim(),
          buyer_city: form.buyer_city.trim(),
          buyer_address: form.buyer_address.trim(),
          notes: form.notes.trim() || null,
          seller_id: group.seller_id === "default" ? null : group.seller_id,
          payment_method: "cod",
          items: group.items.map((item) => ({
            product_id: item.product_id,
            quantity: item.quantity
          }))
        };

        const res = await apiPost("/commerce/orders", payload);

        if (res?.ok) {
          const orderNumber = res.data?.order_number || "—";
          const totalMad = Number(res.data?.total_mad ?? group.subtotal);

          newResults.push({
            ok: true,
            seller: group.seller_name,
            order_number: orderNumber,
            total_mad: totalMad
          });

          if (!currentUser) {
            saveGuestOrder({
              order_number: orderNumber,
              phone: form.buyer_phone.trim(),
              seller: group.seller_name,
              total_mad: totalMad,
              created_at: new Date().toISOString()
            });
          }

          group.items.forEach((item) => removeFromCart(item.id));
        } else {
          newResults.push({
            ok: false,
            seller: group.seller_name,
            error: res?.message || "فشل إنشاء الطلب"
          });
        }
      } catch (err) {
        console.error(err);
        newResults.push({
          ok: false,
          seller: group.seller_name,
          error: "خطأ في الاتصال بالخادم"
        });
      }
    }

    setResults(newResults);
    setSubmitting(false);
  }

  const successCount = results.filter((r) => r.ok).length;
  const failedCount = results.filter((r) => !r.ok).length;

  if (results.length > 0) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={s.successCard}>
            <div style={s.successIcon}>{successCount > 0 ? "✅" : "⚠️"}</div>

            <div className="ui-chip">
              {successCount === numSellers
                ? "تم إرسال كل الطلبات"
                : `تم إرسال ${successCount} من أصل ${numSellers}`}
            </div>

            <h1 className="page-title">
              {successCount === numSellers
                ? "تم تأكيد طلباتك بنجاح"
                : "تم تنفيذ الطلبات بشكل جزئي"}
            </h1>

            <p className="page-subtitle">
              {successCount === numSellers
                ? "توصلنا بجميع طلباتك، وسيتم التواصل معك لتأكيد التفاصيل."
                : "بعض الطلبات تم إنشاؤها بنجاح، وبعضها الآخر لم يكتمل. راجع النتيجة أسفله."}
            </p>

            {!currentUser && successCount > 0 ? (
              <div className="ui-card-soft" style={s.guestSavedBox}>
                <strong style={s.guestSavedTitle}>تم حفظ طلباتك على هذا الجهاز</strong>
                <span style={s.guestSavedText}>
                  يمكنك الرجوع لاحقاً إلى صفحة "طلباتي" من نفس المتصفح ونفس الهاتف.
                </span>
              </div>
            ) : null}

            <div style={s.resultsStats}>
              <div className="ui-card-soft" style={s.statCard}>
                <span style={s.statLabel}>الطلبات الناجحة</span>
                <strong style={s.statSuccess}>{successCount}</strong>
              </div>

              <div className="ui-card-soft" style={s.statCard}>
                <span style={s.statLabel}>الطلبات غير المكتملة</span>
                <strong style={s.statDanger}>{failedCount}</strong>
              </div>
            </div>

            <div style={s.resultsList}>
              {results.map((result, idx) => (
                <div
                  key={`${result.seller}-${idx}`}
                  className="ui-card-soft"
                  style={{
                    ...s.resultRow,
                    borderRight: result.ok ? "4px solid #16a34a" : "4px solid #dc2626"
                  }}
                >
                  <div style={s.resultMain}>
                    <div style={s.resultSeller}>{result.seller}</div>
                    <div style={s.resultMeta}>
                      {result.ok ? "تم إنشاء الطلب" : "تعذر إنشاء الطلب"}
                    </div>
                  </div>

                  <div style={s.resultSide}>
                    {result.ok ? (
                      <>
                        <strong style={s.orderNumber}>{result.order_number}</strong>
                        <span style={s.orderAmount}>
                          {formatMoney(result.total_mad || 0, currency, locale)}
                        </span>
                      </>
                    ) : (
                      <strong style={s.errorText}>{result.error}</strong>
                    )}
                  </div>
                </div>
              ))}
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
            أدخل بيانات التوصيل مرة واحدة، وسنقسم السلة حسب البائعين تلقائياً.
          </p>

          {numSellers > 1 ? (
            <div className="ui-card-soft" style={s.splitNotice}>
              <strong style={s.splitTitle}>📦 السلة متعددة الباعة</strong>
              <div style={s.splitText}>
                سيتم إنشاء <strong>{numSellers} طلبات</strong> مستقلة، طلب لكل بائع.
              </div>
            </div>
          ) : (
            <div className="ui-card-soft" style={s.singleNotice}>
              <strong style={s.splitTitle}>طلب واحد</strong>
              <div style={s.splitText}>كل المنتجات الحالية من نفس البائع.</div>
            </div>
          )}
        </div>

        {!currentUser ? (
          <div className="ui-card-soft" style={s.guestInfo}>
            <strong style={s.guestTitle}>يمكنك الطلب كزائر</strong>
            <span style={s.guestText}>
              لست بحاجة إلى حساب لإتمام الطلب، فقط أدخل معلومات التوصيل بشكل صحيح.
            </span>
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
                onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
                placeholder="الاسم الكامل"
              />
            </label>

            <label className="ui-label">
              <span>رقم الهاتف</span>
              <input
                className="ui-input"
                value={form.buyer_phone}
                onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })}
                placeholder="06xxxxxxxx"
                inputMode="tel"
              />
            </label>

            <label className="ui-label">
              <span>المدينة</span>
              <input
                className="ui-input"
                value={form.buyer_city}
                onChange={(e) => setForm({ ...form, buyer_city: e.target.value })}
                placeholder="مثلاً: الدار البيضاء"
              />
            </label>

            <label className="ui-label">
              <span>العنوان</span>
              <textarea
                className="ui-textarea"
                value={form.buyer_address}
                onChange={(e) => setForm({ ...form, buyer_address: e.target.value })}
                placeholder="الحي، الزنقة، رقم المنزل..."
              />
            </label>

            <label className="ui-label">
              <span>ملاحظات إضافية</span>
              <textarea
                className="ui-textarea"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="ملاحظات اختيارية حول الطلب أو التوصيل"
              />
            </label>

            <div className="ui-card-soft" style={s.paymentCard}>
              <div style={s.paymentTitle}>طريقة الدفع</div>
              <label style={s.paymentMethod}>
                <input type="radio" checked readOnly />
                <span>الدفع عند الاستلام (Cash on Delivery)</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-primary full-width"
              disabled={submitting || !ordersGrouped.length}
            >
              {submitting
                ? "جاري إنشاء الطلبات..."
                : `تأكيد الطلب (${formatMoney(grandTotal, currency, locale)})`}
            </button>
          </form>

          <aside className="ui-card" style={s.summaryCard}>
            <h2 className="section-title">ملخص السلة</h2>

            <div style={s.groupList}>
              {ordersGrouped.map((group) => (
                <div key={group.seller_id} className="ui-card-soft" style={s.groupCard}>
                  <div style={s.groupHead}>
                    <strong style={s.groupSeller}>{group.seller_name}</strong>
                    <span style={s.groupSubtotal}>
                      {formatMoney(group.subtotal, currency, locale)}
                    </span>
                  </div>

                  <div style={s.groupItems}>
                    {group.items.map((item) => (
                      <div key={item.id} style={s.itemRow}>
                        <span style={s.itemName}>
                          {item.name} × {item.quantity}
                        </span>
                        <strong style={s.itemPrice}>
                          {formatMoney(item.price * item.quantity, currency, locale)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div style={s.totals}>
              <div style={s.totalRow}>
                <span>عدد الطلبات</span>
                <strong>{numSellers}</strong>
              </div>

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

            <Link to="/cart" className="btn btn-secondary full-width" style={s.backBtn}>
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
    gap: "12px"
  },
  splitNotice: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#fff7e6",
    border: "1px solid #f3d7a4"
  },
  singleNotice: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#eef6ff",
    border: "1px solid #d3e4f8"
  },
  splitTitle: {
    color: "#173b74"
  },
  splitText: {
    color: "#5b6470",
    lineHeight: 1.8
  },
  guestInfo: {
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  guestTitle: {
    color: "#173b74"
  },
  guestText: {
    color: "#6b7280",
    lineHeight: 1.8
  },
  guestSavedBox: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#eefbf3",
    border: "1px solid #b7ebc6"
  },
  guestSavedTitle: {
    color: "#166534"
  },
  guestSavedText: {
    color: "#4b5563",
    lineHeight: 1.8
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
    gap: "14px"
  },
  groupList: {
    display: "grid",
    gap: "10px"
  },
  groupCard: {
    padding: "12px",
    display: "grid",
    gap: "10px"
  },
  groupHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center"
  },
  groupSeller: {
    color: "#173b74"
  },
  groupSubtotal: {
    color: "#173b74",
    fontWeight: 900
  },
  groupItems: {
    display: "grid",
    gap: "8px"
  },
  itemRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },
  itemName: {
    color: "#4b5563",
    lineHeight: 1.6
  },
  itemPrice: {
    color: "#1f2937",
    whiteSpace: "nowrap"
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
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  successCard: {
    padding: "22px",
    display: "grid",
    gap: "14px"
  },
  successIcon: {
    fontSize: "42px",
    textAlign: "center"
  },
  resultsStats: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px"
  },
  statCard: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    textAlign: "center"
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  statSuccess: {
    color: "#15803d",
    fontSize: "24px",
    fontWeight: 900
  },
  statDanger: {
    color: "#b91c1c",
    fontSize: "24px",
    fontWeight: 900
  },
  resultsList: {
    display: "grid",
    gap: "10px"
  },
  resultRow: {
    padding: "14px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start"
  },
  resultMain: {
    display: "grid",
    gap: "4px"
  },
  resultSeller: {
    color: "#173b74",
    fontWeight: 900
  },
  resultMeta: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  resultSide: {
    display: "grid",
    gap: "4px",
    textAlign: "left"
  },
  orderNumber: {
    color: "#1f2937",
    fontWeight: 900
  },
  orderAmount: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  errorText: {
    color: "#b91c1c",
    fontWeight: 800,
    maxWidth: "160px"
  },
  successActions: {
    display: "grid",
    gap: "10px"
  }
};
