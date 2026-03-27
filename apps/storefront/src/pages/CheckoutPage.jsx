import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
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

function normalizeZoneCode(city) {
  const value = String(city || "").trim().toLowerCase();
  const map = {
    casablanca: "casablanca",
    "الدار البيضاء": "casablanca",
    casa: "casablanca",
    rabat: "rabat",
    "الرباط": "rabat",
    tangier: "tangier",
    tanger: "tangier",
    "طنجة": "tangier",
    marrakech: "marrakech",
    "مراكش": "marrakech"
  };
  return map[value] || "other";
}

function shippingSpeed(option) {
  return Number(option.estimated_max_days || 0) + Number(option.handling_days || 0);
}

function pickSmartShipping(options) {
  if (!Array.isArray(options) || !options.length) {
    return {
      bestKey: null,
      cheapestKey: null,
      fastestKey: null
    };
  }

  const keyed = options.map((option) => ({
    ...option,
    _key: `${option.provider_method_id}::${option.zone_code}`,
    _price: Number(option.shipping_price || 0),
    _speed: shippingSpeed(option)
  }));

  const cheapest = [...keyed].sort((a, b) => {
    if (a._price !== b._price) return a._price - b._price;
    return a._speed - b._speed;
  })[0];

  const fastest = [...keyed].sort((a, b) => {
    if (a._speed !== b._speed) return a._speed - b._speed;
    return a._price - b._price;
  })[0];

  const best = [...keyed].sort((a, b) => {
    const aFree = a._price === 0 ? 1 : 0;
    const bFree = b._price === 0 ? 1 : 0;
    if (aFree !== bFree) return bFree - aFree;

    const aScore = a._price * 1.0 + a._speed * 8;
    const bScore = b._price * 1.0 + b._speed * 8;
    if (aScore !== bScore) return aScore - bScore;
    if (a._price !== b._price) return a._price - b._price;
    return a._speed - b._speed;
  })[0];

  return {
    bestKey: best?._key || null,
    cheapestKey: cheapest?._key || null,
    fastestKey: fastest?._key || null
  };
}

function optionKey(option) {
  return `${option.provider_method_id}::${option.zone_code}`;
}

function normalizeMoroccanPhone(input) {
  const raw = String(input || "").trim().replace(/\s+/g, "");
  if (!raw) return "";
  if (raw.startsWith("+212")) return `0${raw.slice(4)}`;
  if (raw.startsWith("212")) return `0${raw.slice(3)}`;
  return raw;
}

function getApiErrorMessage(result, fallback = "فشل إنشاء الطلب") {
  return result?.error?.message || result?.message || fallback;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, currency, language, currentUser, removeFromCart } = useApp();

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [results, setResults] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingMessage, setShippingMessage] = useState("");
  const [shippingState, setShippingState] = useState({});
  const [cityTouched, setCityTouched] = useState(false);
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

    (Array.isArray(cart) ? cart : []).forEach((item) => {
      const sellerId = String(item.seller_id || "").trim();
      const sellerKey = sellerId || `seller:${item.seller || "RAHBA"}`;

      if (!groups[sellerKey]) {
        groups[sellerKey] = {
          seller_id: sellerId,
          seller_name: item.seller || "RAHBA",
          items: []
        };
      }

      groups[sellerKey].items.push({
        id: item.id,
        product_id: item.id,
        quantity: Math.max(1, Number(item.qty || item.quantity || 1)),
        price: Number(item.price || 0),
        name: item.name || item.title_ar || "منتج"
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

  const subtotal = useMemo(
    () => ordersGrouped.reduce((sum, group) => sum + group.subtotal, 0),
    [ordersGrouped]
  );

  useEffect(() => {
    let cancelled = false;

    async function resolveAllShipping() {
      if (!ordersGrouped.length) {
        setShippingState({});
        setShippingMessage("");
        return;
      }

      if (!form.buyer_city.trim()) {
        setShippingState({});
        setShippingMessage(cityTouched ? "أدخل المدينة لإظهار خيارات الشحن الذكية." : "");
        return;
      }

      const groupsToResolve = ordersGrouped.filter(
        (group) => group.seller_id && group.seller_id !== "default"
      );

      if (!groupsToResolve.length) {
        setShippingState({});
        setShippingMessage("");
        return;
      }

      try {
        setShippingLoading(true);
        setShippingMessage("");

        const zoneCode = normalizeZoneCode(form.buyer_city);

        const results = await Promise.all(
          groupsToResolve.map(async (group) => {
            const res = await apiPost("/marketplace/logistics/resolve", {
              seller_id: group.seller_id,
              zone_code: zoneCode,
              order_total: group.subtotal
            });

            const options = Array.isArray(res?.data) ? res.data : [];
            const ranked = pickSmartShipping(options);
            const selectedKey =
              ranked.bestKey || ranked.cheapestKey || ranked.fastestKey || null;

            return [
              group.seller_id,
              {
                options,
                selectedKey,
                ...ranked
              }
            ];
          })
        );

        if (!cancelled) {
          setShippingState(Object.fromEntries(results));

          const noOptionsCount = results.filter(
            ([, value]) => !Array.isArray(value.options) || value.options.length === 0
          ).length;

          setShippingMessage(
            noOptionsCount > 0
              ? "بعض الباعة لا يتوفر لهم شحن ذكي حالياً، وسيبقى الشحن غير محدد لهم."
              : ""
          );
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setShippingMessage("تعذر تحميل خيارات الشحن الذكية حالياً.");
        }
      } finally {
        if (!cancelled) setShippingLoading(false);
      }
    }

    resolveAllShipping();

    return () => {
      cancelled = true;
    };
  }, [ordersGrouped, form.buyer_city, cityTouched]);

  function validateForm() {
    if (!form.buyer_name.trim()) return "يرجى إدخال الاسم الكامل";

    const normalizedPhone = normalizeMoroccanPhone(form.buyer_phone);
    if (!normalizedPhone) return "يرجى إدخال رقم الهاتف";
    if (!/^0[5-7][0-9]{8}$/.test(normalizedPhone)) {
      return "يرجى إدخال رقم هاتف مغربي صحيح";
    }

    if (!form.buyer_city.trim()) return "يرجى إدخال المدينة";
    if (!form.buyer_address.trim()) return "يرجى إدخال العنوان";
    if (!ordersGrouped.length) return "السلة فارغة";

    const missingSeller = ordersGrouped.some(
      (group) => !group.seller_id || group.seller_id === "default"
    );
    if (missingSeller) {
      return "بعض المنتجات لا تحتوي على بائع صالح. أعد إضافة المنتجات من صفحاتها الرسمية.";
    }

    const needsShippingChoice = ordersGrouped.some(
      (group) =>
        Array.isArray(shippingState[group.seller_id]?.options) &&
        shippingState[group.seller_id].options.length > 0 &&
        !shippingState[group.seller_id].selectedKey
    );

    if (needsShippingChoice) {
      return "يرجى اختيار طريقة الشحن لكل بائع";
    }

    return "";
  }

  function getSelectedShipping(group) {
    const sellerShipping = shippingState[group.seller_id];
    if (!sellerShipping?.selectedKey) return null;
    return (sellerShipping.options || []).find(
      (option) => optionKey(option) === sellerShipping.selectedKey
    ) || null;
  }

  const shippingTotal = useMemo(() => {
    return ordersGrouped.reduce((sum, group) => {
      const selected = getSelectedShipping(group);
      return sum + Number(selected?.shipping_price || 0);
    }, 0);
  }, [ordersGrouped, shippingState]);

  const hasAnyShippingOptions = useMemo(
    () =>
      ordersGrouped.some(
        (group) =>
          Array.isArray(shippingState[group.seller_id]?.options) &&
          shippingState[group.seller_id].options.length > 0
      ),
    [ordersGrouped, shippingState]
  );

  const grandTotal = subtotal + shippingTotal;

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

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
        const selectedShipping = getSelectedShipping(group);

        const payload = {
          buyer_name: form.buyer_name.trim(),
          buyer_phone: normalizeMoroccanPhone(form.buyer_phone),
          buyer_city: form.buyer_city.trim(),
          buyer_address: form.buyer_address.trim(),
          notes: form.notes.trim() || null,
          seller_id: group.seller_id,
          payment_method: "cod",
          shipping_price: Number(selectedShipping?.shipping_price || 0),
          shipping_provider_id: selectedShipping?.provider_id || null,
          shipping_method_id: selectedShipping?.provider_method_id || null,
          shipping_method_label: selectedShipping
            ? `${selectedShipping.provider_name} - ${selectedShipping.method_name}`
            : null,
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
            order_id: res.data?.id || null,
            order_number: orderNumber,
            total_mad: totalMad
          });

          if (!currentUser) {
            saveGuestOrder({
              order_id: res.data?.id || null,
              order_number: orderNumber,
              phone: normalizeMoroccanPhone(form.buyer_phone),
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
            error: getApiErrorMessage(res, "فشل إنشاء الطلب")
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
                  يمكنك الرجوع لاحقاً إلى صفحة طلباتي من نفس المتصفح ونفس الهاتف.
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
        {shippingMessage ? <div className="message-box">{shippingMessage}</div> : null}

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
                onChange={(e) => {
                  setCityTouched(true);
                  setForm({ ...form, buyer_city: e.target.value });
                }}
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
              disabled={submitting || !ordersGrouped.length || shippingLoading}
            >
              {submitting
                ? "جاري إنشاء الطلبات..."
                : `تأكيد الطلب (${formatMoney(grandTotal, currency, locale)})`}
            </button>
          </form>

          <aside className="ui-card" style={s.summaryCard}>
            <h2 className="section-title">ملخص السلة</h2>

            <div style={s.groupList}>
              {ordersGrouped.map((group) => {
                const sellerShipping = shippingState[group.seller_id];
                const selectedShipping = getSelectedShipping(group);

                return (
                  <div key={`${group.seller_id || group.seller_name}`} className="ui-card-soft" style={s.groupCard}>
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

                    {Array.isArray(sellerShipping?.options) && sellerShipping.options.length > 0 ? (
                      <div style={s.shippingBox}>
                        <div style={s.shippingBoxTitle}>خيارات الشحن الذكية</div>

                        <div style={s.shippingOptionsList}>
                          {sellerShipping.options.map((option) => {
                            const key = optionKey(option);
                            const isSelected = sellerShipping.selectedKey === key;
                            const isBest = sellerShipping.bestKey === key;
                            const isCheapest = sellerShipping.cheapestKey === key;
                            const isFastest = sellerShipping.fastestKey === key;

                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() =>
                                  setShippingState((prev) => ({
                                    ...prev,
                                    [group.seller_id]: {
                                      ...prev[group.seller_id],
                                      selectedKey: key
                                    }
                                  }))
                                }
                                style={{
                                  ...s.shippingOptionCard,
                                  ...(isSelected ? s.shippingOptionSelected : {})
                                }}
                              >
                                <div style={s.shippingOptionHead}>
                                  <div>
                                    <div style={s.shippingOptionTitle}>
                                      {option.provider_name} - {option.method_name}
                                    </div>
                                    <div style={s.shippingOptionMeta}>
                                      {option.zone_name} · {option.estimated_min_days ?? "-"} - {option.estimated_max_days ?? "-"} أيام
                                      {Number(option.handling_days || 0) > 0
                                        ? ` + ${option.handling_days} تجهيز`
                                        : ""}
                                    </div>
                                  </div>

                                  <strong style={s.shippingOptionPrice}>
                                    {Number(option.shipping_price || 0) === 0
                                      ? "مجاني"
                                      : formatMoney(option.shipping_price, currency, locale)}
                                  </strong>
                                </div>

                                <div style={s.shippingBadgesRow}>
                                  {isBest ? <span style={s.bestBadge}>Best</span> : null}
                                  {isCheapest ? <span style={s.cheapestBadge}>Cheapest</span> : null}
                                  {isFastest ? <span style={s.fastestBadge}>Fastest</span> : null}
                                  {option.cash_on_delivery_available ? (
                                    <span style={s.codBadge}>COD</span>
                                  ) : null}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : group.seller_id ? (
                      <div style={s.shippingEmptyBox}>
                        {shippingLoading
                          ? "جاري تحميل خيارات الشحن..."
                          : "لا توجد خيارات شحن ذكية متاحة لهذا البائع حالياً."}
                      </div>
                    ) : (
                      <div style={s.shippingEmptyBox}>
                        هذا المنتج لا يحتوي على بائع صالح لإتمام الشحن.
                      </div>
                    )}

                    <div style={s.groupShippingRow}>
                      <span>الشحن المختار</span>
                      <strong>
                        {selectedShipping
                          ? Number(selectedShipping.shipping_price || 0) === 0
                            ? "مجاني"
                            : formatMoney(selectedShipping.shipping_price, currency, locale)
                          : hasAnyShippingOptions
                          ? "غير محدد بعد"
                          : "غير متوفر حالياً"}
                      </strong>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={s.totals}>
              <div style={s.totalRow}>
                <span>عدد الطلبات</span>
                <strong>{numSellers}</strong>
              </div>

              <div style={s.totalRow}>
                <span>المجموع الفرعي</span>
                <strong>{formatMoney(subtotal, currency, locale)}</strong>
              </div>

              <div style={s.totalRow}>
                <span>التوصيل</span>
                <strong>
                  {hasAnyShippingOptions
                    ? formatMoney(shippingTotal, currency, locale)
                    : "غير محدد بعد"}
                </strong>
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
  shippingBox: {
    display: "grid",
    gap: "10px",
    padding: "12px",
    borderRadius: "14px",
    border: "1px solid #dbeafe",
    background: "#f8fbff"
  },
  shippingBoxTitle: {
    color: "#173b74",
    fontWeight: 900
  },
  shippingOptionsList: {
    display: "grid",
    gap: "8px"
  },
  shippingOptionCard: {
    border: "1px solid #dbe4ee",
    background: "#fff",
    borderRadius: "14px",
    padding: "12px",
    textAlign: "right",
    cursor: "pointer"
  },
  shippingOptionSelected: {
    border: "1px solid #60a5fa",
    boxShadow: "0 0 0 3px rgba(96,165,250,0.15)"
  },
  shippingOptionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },
  shippingOptionTitle: {
    color: "#0f172a",
    fontWeight: 900
  },
  shippingOptionMeta: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "4px",
    lineHeight: 1.7
  },
  shippingOptionPrice: {
    color: "#173b74",
    whiteSpace: "nowrap"
  },
  shippingBadgesRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "10px"
  },
  bestBadge: {
    background: "#dbeafe",
    color: "#1d4ed8",
    border: "1px solid #93c5fd",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 800
  },
  cheapestBadge: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 800
  },
  fastestBadge: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fcd34d",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 800
  },
  codBadge: {
    background: "#ede9fe",
    color: "#6d28d9",
    border: "1px solid #c4b5fd",
    borderRadius: "999px",
    padding: "4px 8px",
    fontSize: "12px",
    fontWeight: 800
  },
  shippingEmptyBox: {
    padding: "12px",
    borderRadius: "14px",
    border: "1px dashed #d6d3d1",
    background: "#fafaf9",
    color: "#6b7280",
    lineHeight: 1.8
  },
  groupShippingRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#4b5563",
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
  backBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  successCard: {
    padding: "20px",
    display: "grid",
    gap: "14px",
    textAlign: "center"
  },
  successIcon: {
    fontSize: "42px"
  },
  resultsStats: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px"
  },
  statCard: {
    padding: "14px",
    display: "grid",
    gap: "6px"
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  statSuccess: {
    color: "#166534",
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
    gap: "10px",
    textAlign: "right"
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
    fontSize: "13px"
  },
  resultSide: {
    display: "grid",
    gap: "4px",
    textAlign: "left"
  },
  orderNumber: {
    color: "#111827"
  },
  orderAmount: {
    color: "#173b74",
    fontWeight: 900
  },
  errorText: {
    color: "#b91c1c"
  },
  successActions: {
    display: "grid",
    gap: "10px"
  }
};
