import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import { UI } from "../components/marketplace/uiTokens";

function saveGuestOrder(entry) {
  try {
    const raw = localStorage.getItem("guest_orders");
    const existing = raw ? JSON.parse(raw) : [];
    const next = [entry, ...existing]
      .filter(
        (item, index, arr) =>
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
    casa: "casablanca",
    "dar البيضاء": "casablanca",
    "الدار البيضاء": "casablanca",
    "الدارالبيضاء": "casablanca",
    rabat: "rabat",
    "الرباط": "rabat",
    tangier: "tangier",
    tanger: "tangier",
    طنجة: "tangier",
    marrakech: "marrakech",
    marrakesh: "marrakech",
    مراكش: "marrakech",
    fes: "fes",
    fez: "fes",
    فاس: "fes",
    agadir: "agadir",
    أكادير: "agadir",
    meknes: "meknes",
    مكناس: "meknes",
    oujda: "oujda",
    وجدة: "oujda",
    kenitra: "kenitra",
    القنيطرة: "kenitra",
    tetouan: "tetouan",
    تطوان: "tetouan",
    safi: "safi",
    آسفي: "safi",
    jadida: "eljadida",
    "el jadida": "eljadida",
    الجديدة: "eljadida",
    larache: "larache",
    العرائش: "larache",
    nador: "nador",
    الناظور: "nador",
    hoceima: "alhoceima",
    الحسيمة: "alhoceima",
    beni_mellal: "benimellal",
    "beni mellal": "benimellal",
    بني_ملال: "benimellal",
    بني: "benimellal",
    khouribga: "khouribga",
    خريبكة: "khouribga",
    settat: "settat",
    سطات: "settat",
    sale: "sale",
    سلا: "sale",
    temara: "temara",
    تمارة: "temara",
    mohammedia: "mohammedia",
    المحمدية: "mohammedia"
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

function sanitizeIdPart(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, 64);
}

function buildGroupIdempotencyKey(group, form, selectedShipping) {
  const sellerPart = sanitizeIdPart(group.seller_id || group.seller_name || "seller");
  const phonePart = sanitizeIdPart(normalizeMoroccanPhone(form.buyer_phone) || "phone");
  const cityPart = sanitizeIdPart(form.buyer_city || "city");
  const addressPart = sanitizeIdPart(form.buyer_address || "address").slice(0, 24);

  const itemsPart = group.items
    .map((item) => `${sanitizeIdPart(item.product_id)}:${Number(item.quantity || 0)}`)
    .sort()
    .join("|")
    .slice(0, 120);

  const shippingPart = selectedShipping
    ? `${sanitizeIdPart(selectedShipping.provider_id)}:${sanitizeIdPart(
        selectedShipping.provider_method_id
      )}:${Number(selectedShipping.shipping_price || 0)}`
    : "shipping:none";

  return [
    "rahba",
    "checkout",
    sellerPart,
    phonePart,
    cityPart,
    addressPart,
    shippingPart,
    itemsPart
  ].join("::");
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
  const submitKeysRef = useRef({});
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

  const validSellerGroups = useMemo(
    () => ordersGrouped.filter((group) => group.seller_id),
    [ordersGrouped]
  );

  const invalidSellerGroups = useMemo(
    () => ordersGrouped.filter((group) => !group.seller_id),
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
        setShippingMessage(cityTouched ? "أدخل المدينة لإظهار خيارات الشحن." : "");
        return;
      }

      if (!validSellerGroups.length) {
        setShippingState({});
        setShippingMessage("");
        return;
      }

      try {
        setShippingLoading(true);
        setShippingMessage("");

        const zoneCode = normalizeZoneCode(form.buyer_city);

        const resolvedEntries = await Promise.all(
          validSellerGroups.map(async (group) => {
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
                ...ranked,
                zoneCode,
                loaded: true
              }
            ];
          })
        );

        if (cancelled) return;

        const nextState = Object.fromEntries(resolvedEntries);
        setShippingState(nextState);

        const noOptionsCount = resolvedEntries.filter(
          ([, value]) => !Array.isArray(value.options) || value.options.length === 0
        ).length;

        if (zoneCode === "other" && noOptionsCount > 0) {
          setShippingMessage(
            "لم نتمكن من مطابقة المدينة مع منطقة شحن معروفة لبعض الباعة. جرّب كتابة اسم المدينة بشكل أدق."
          );
        } else if (noOptionsCount > 0) {
          setShippingMessage(
            "بعض الباعة لا يتوفر لهم شحن مفعّل لهذه المدينة حالياً."
          );
        } else {
          setShippingMessage("");
        }
      } catch (error) {
        console.error(error);
        if (!cancelled) {
          setShippingMessage("تعذر تحميل خيارات الشحن حالياً.");
          setShippingState({});
        }
      } finally {
        if (!cancelled) setShippingLoading(false);
      }
    }

    resolveAllShipping();

    return () => {
      cancelled = true;
    };
  }, [ordersGrouped, validSellerGroups, form.buyer_city, cityTouched]);

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

    if (invalidSellerGroups.length > 0) {
      return "بعض المنتجات لا تحتوي على بائع صالح. أعد إضافتها من صفحاتها الرسمية.";
    }

    for (const group of validSellerGroups) {
      const state = shippingState[group.seller_id];

      if (!state?.loaded && !shippingLoading) {
        return "تعذر تحميل الشحن لبعض الباعة. حاول تحديث المدينة أو أعد المحاولة.";
      }

      const hasOptions = Array.isArray(state?.options) && state.options.length > 0;

      if (!hasOptions) {
        return `لا توجد طريقة شحن متاحة حالياً للبائع: ${group.seller_name}`;
      }

      if (hasOptions && !state.selectedKey) {
        return `يرجى اختيار طريقة الشحن للبائع: ${group.seller_name}`;
      }
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
    return validSellerGroups.reduce((sum, group) => {
      const selected = getSelectedShipping(group);
      return sum + Number(selected?.shipping_price || 0);
    }, 0);
  }, [validSellerGroups, shippingState]);

  const allShippingResolved = useMemo(() => {
    if (!validSellerGroups.length) return false;

    return validSellerGroups.every((group) => {
      const state = shippingState[group.seller_id];
      return Array.isArray(state?.options) && state.options.length > 0 && state.selectedKey;
    });
  }, [validSellerGroups, shippingState]);

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

    for (const group of validSellerGroups) {
      try {
        const selectedShipping = getSelectedShipping(group);

        if (!selectedShipping) {
          newResults.push({
            ok: false,
            seller: group.seller_name,
            error: "تعذر تحديد طريقة الشحن"
          });
          continue;
        }

        const stableGroupKey = `${group.seller_id}::${group.items
          .map((item) => `${item.product_id}:${item.quantity}`)
          .sort()
          .join("|")}`;

        if (!submitKeysRef.current[stableGroupKey]) {
          submitKeysRef.current[stableGroupKey] = buildGroupIdempotencyKey(
            group,
            form,
            selectedShipping
          );
        }

        const payload = {
          buyer_name: form.buyer_name.trim(),
          buyer_phone: normalizeMoroccanPhone(form.buyer_phone),
          buyer_city: form.buyer_city.trim(),
          buyer_address: form.buyer_address.trim(),
          notes: form.notes.trim() || null,
          seller_id: group.seller_id,
          payment_method: "cod",
          shipping_price: Number(selectedShipping.shipping_price || 0),
          shipping_provider_id: selectedShipping.provider_id || null,
          shipping_method_id: selectedShipping.provider_method_id || null,
          shipping_method_label: `${selectedShipping.provider_name} - ${selectedShipping.method_name}`,
          idempotency_key: submitKeysRef.current[stableGroupKey],
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
            total_mad: totalMad,
            reused: Boolean(res.data?.reused)
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
  const reusedCount = results.filter((r) => r.ok && r.reused).length;
  const freshCount = results.filter((r) => r.ok && !r.reused).length;

  if (results.length > 0) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={s.stack}>
          <SectionShell style={s.successShell}>
            <div style={s.successIcon}>{successCount > 0 ? "✅" : "⚠️"}</div>

            <div className="ui-chip">
              {successCount === validSellerGroups.length
                ? "تم إرسال كل الطلبات"
                : `تم إرسال ${successCount} من أصل ${validSellerGroups.length}`}
            </div>

            <SectionHead
              title={
                successCount === validSellerGroups.length
                  ? "تم تأكيد طلباتك بنجاح"
                  : "تم تنفيذ الطلبات بشكل جزئي"
              }
              subtitle={
                successCount === validSellerGroups.length
                  ? "توصلنا بجميع طلباتك، وسيتم التواصل معك لتأكيد التفاصيل."
                  : "بعض الطلبات تم إنشاؤها بنجاح، وبعضها الآخر لم يكتمل. راجع النتيجة أسفله."
              }
              align="center"
            />

            {successCount > 0 ? (
              <div className="ui-card-soft" style={s.guestSavedBox}>
                <strong style={s.guestSavedTitle}>
                  {reusedCount > 0
                    ? `تم استرجاع ${reusedCount} طلب سابق وتأكيد ${freshCount} طلب جديد`
                    : `تم إنشاء ${freshCount} طلب جديد`}
                </strong>
                <span style={s.guestSavedText}>
                  إذا ضغطت على التأكيد أكثر من مرة، رحبة ستحاول منع تكرار نفس الطلب.
                </span>
              </div>
            ) : null}

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
                      {result.ok
                        ? result.reused
                          ? "تم استرجاع الطلب السابق"
                          : "تم إنشاء الطلب"
                        : "تعذر إنشاء الطلب"}
                    </div>
                  </div>

                  <div style={s.resultSide}>
                    {result.ok ? (
                      <>
                        <strong style={s.orderNumber}>{result.order_number}</strong>
                        <span style={s.orderAmount}>
                          {formatMoney(result.total_mad || 0, currency, locale)}
                        </span>
                        {result.order_number ? (
                          <Link
                            to={`/track/${encodeURIComponent(result.order_number)}`}
                            className="btn btn-secondary"
                            style={s.trackBtn}
                          >
                            تتبع الطلب
                          </Link>
                        ) : null}
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
          </SectionShell>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.stack}>
        <SectionShell style={s.heroShell}>
          <div style={s.heroTopRow}>
            <div className="ui-chip">RAHBA CHECKOUT</div>
            <div style={s.heroKicker}>Conversion-first checkout</div>
          </div>

          <SectionHead
            title="إتمام الطلب"
            subtitle="أدخل بيانات التوصيل مرة واحدة، وسنقسم السلة حسب البائعين تلقائياً مع إبقاء العملية واضحة وسهلة."
          />

          <div style={s.heroTrustRow}>
            <span style={s.heroTrustItem}>دفع عند الاستلام</span>
            <span style={s.heroTrustItem}>شحن حسب البائع</span>
            <span style={s.heroTrustItem}>إجمالي واضح</span>
          </div>

          {numSellers > 1 ? (
            <div className="ui-card-soft" style={s.splitNotice}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>📦</div>
                <strong style={s.splitTitle}>السلة متعددة الباعة</strong>
              </div>
              <div style={s.splitText}>
                سيتم إنشاء <strong>{numSellers} طلبات</strong> مستقلة، طلب لكل بائع،
                مع إظهار الشحن والإجمالي بوضوح لكل جزء.
              </div>
            </div>
          ) : (
            <div className="ui-card-soft" style={s.singleNotice}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>✅</div>
                <strong style={s.splitTitle}>طلب واحد</strong>
              </div>
              <div style={s.splitText}>
                كل المنتجات الحالية من نفس البائع، لذلك الإتمام هنا أبسط وأسرع.
              </div>
            </div>
          )}
        </SectionShell>

        {!currentUser ? (
          <SectionShell>
            <div className="ui-card-soft" style={s.guestInfo}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>👤</div>
                <strong style={s.guestTitle}>يمكنك الطلب كزائر</strong>
              </div>
              <span style={s.guestText}>
                لست بحاجة إلى حساب لإتمام الطلب، فقط أدخل معلومات التوصيل بشكل صحيح،
                وسيتم حفظ الطلبات على هذا الجهاز للرجوع إليها لاحقاً.
              </span>
            </div>
          </SectionShell>
        ) : null}

        {message ? <div className="message-box">{message}</div> : null}
        {shippingMessage ? <div className="message-box">{shippingMessage}</div> : null}

        {invalidSellerGroups.length > 0 ? (
          <SectionShell>
            <div className="ui-card-soft" style={s.invalidSellerBox}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>⚠️</div>
                <strong style={s.invalidSellerTitle}>منتجات غير صالحة للإتمام</strong>
              </div>
              <div style={s.invalidSellerText}>
                توجد منتجات داخل السلة بدون بائع صالح. ارجع إلى السلة واحذفها أو أعد إضافتها من صفحاتها الرسمية.
              </div>
            </div>
          </SectionShell>
        ) : null}

        <div style={s.layout}>
          <SectionShell style={s.formCard}>
            <SectionHead
              chip="DELIVERY"
              title="بيانات التوصيل"
              subtitle="أدخل معلوماتك بدقة لاختيار الشحن وإنشاء الطلب بشكل صحيح."
            />

            <div style={s.formTrustBox}>
              <div style={s.formTrustTitle}>معلومات واضحة = إتمام أسرع</div>
              <div style={s.formTrustText}>
                اكتب الاسم، الهاتف، المدينة، والعنوان بشكل دقيق لتجنب أي تأخير في الشحن أو التأكيد.
              </div>
            </div>

            <form style={s.formGrid} onSubmit={handleSubmit}>
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

                <div style={s.paymentNote}>
                  لن يتم طلب أداء إلكتروني الآن. ستؤكد الطلب أولاً، ثم يتم التنسيق معك حسب البائع والشحن.
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary full-width"
                disabled={
                  submitting ||
                  !ordersGrouped.length ||
                  shippingLoading ||
                  invalidSellerGroups.length > 0 ||
                  !allShippingResolved
                }
              >
                {submitting
                  ? "جاري إنشاء الطلبات..."
                  : `تأكيد الطلب (${formatMoney(grandTotal, currency, locale)})`}
              </button>
            </form>
          </SectionShell>

          <SectionShell style={s.summaryCard}>
            <SectionHead
              chip="SUMMARY"
              title="ملخص السلة"
              subtitle="راجع كل بائع، اختر الشحن المناسب، وتأكد من الإجمالي قبل الإرسال."
            />

            <div style={s.summaryTrustBox}>
              <div style={s.summaryTrustTitle}>آخر مراجعة قبل التأكيد</div>
              <div style={s.summaryTrustText}>
                راجع الشحن المختار لكل بائع، ثم تأكد من الإجمالي النهائي قبل الضغط على زر التأكيد.
              </div>
            </div>

            <div style={s.groupList}>
              {ordersGrouped.map((group) => {
                const sellerShipping = group.seller_id ? shippingState[group.seller_id] : null;
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
                        <div style={s.shippingBoxTitle}>خيارات الشحن</div>

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
                          : "لا توجد طرق شحن مفعلة حالياً لهذا البائع في هذه المدينة."}
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
                          : group.seller_id
                          ? "غير محدد"
                          : "غير متاح"}
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
                  {allShippingResolved
                    ? formatMoney(shippingTotal, currency, locale)
                    : "غير مكتمل بعد"}
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
          </SectionShell>
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

  noticeHead: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  noticeIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.72)",
    display: "grid",
    placeItems: "center",
    fontSize: "16px"
  },

  splitNotice: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#fff7e6",
    border: "1px solid #f3d7a4",
    borderRadius: UI.radius.xl
  },

  singleNotice: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: UI.colors.softBlue,
    border: "1px solid #d3e4f8",
    borderRadius: UI.radius.xl
  },

  splitTitle: {
    color: UI.colors.navy
  },

  splitText: {
    color: "#5b6470",
    lineHeight: 1.8
  },

  guestInfo: {
    padding: "16px",
    display: "grid",
    gap: "8px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)"
  },

  formTrustBox: {
    padding: "14px",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%)",
    border: "1px solid #d3e4f8",
    display: "grid",
    gap: "6px"
  },

  formTrustTitle: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  formTrustText: {
    color: "#5b6470",
    lineHeight: 1.8,
    fontSize: UI.type.bodySm
  },

  paymentNote: {
    color: "#5b6470",
    lineHeight: 1.8,
    fontSize: UI.type.bodySm
  },

  summaryTrustBox: {
    padding: "14px",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(180deg, #fffaf1 0%, #fffdf7 100%)",
    border: "1px solid #f3d7a4",
    display: "grid",
    gap: "6px"
  },

  summaryTrustTitle: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  summaryTrustText: {
    color: "#5b6470",
    lineHeight: 1.8,
    fontSize: UI.type.bodySm
  },

  guestTitle: {
    color: UI.colors.navy
  },

  guestText: {
    color: UI.colors.muted,
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
    color: UI.colors.successText
  },

  guestSavedText: {
    color: "#4b5563",
    lineHeight: 1.8
  },

  invalidSellerBox: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: UI.colors.dangerBg,
    border: `1px solid ${UI.colors.dangerBorder}`
  },

  invalidSellerTitle: {
    color: UI.colors.dangerText
  },

  invalidSellerText: {
    color: "#7f1d1d",
    lineHeight: 1.8
  },

  layout: {
    display: "grid",
    gap: "14px"
  },

  formCard: {
    gap: "14px"
  },

  formGrid: {
    display: "grid",
    gap: "14px"
  },

  paymentCard: {
    padding: "14px",
    display: "grid",
    gap: "10px"
  },

  paymentTitle: {
    color: UI.colors.navy,
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
    gap: "16px"
  },

  groupList: {
    display: "grid",
    gap: "10px"
  },

  groupCard: {
    padding: "14px",
    display: "grid",
    gap: "12px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)"
  },

  groupHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    paddingBottom: "6px",
    borderBottom: "1px solid #ebe3d7"
  },

  groupSeller: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  groupSubtotal: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "18px"
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
    padding: "14px",
    borderRadius: UI.radius.xl,
    border: "1px solid #dbeafe",
    background: "linear-gradient(180deg, #f8fbff 0%, #ffffff 100%)",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.55)"
  },

  shippingBoxTitle: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  shippingOptionsList: {
    display: "grid",
    gap: "8px"
  },

  shippingOptionCard: {
    border: "1px solid #dbe4ee",
    background: UI.colors.white,
    borderRadius: UI.radius.xl,
    padding: "13px",
    textAlign: "right",
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(15,23,42,0.04)",
    transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease"
  },

  shippingOptionSelected: {
    border: "1px solid #60a5fa",
    boxShadow: "0 0 0 3px rgba(96,165,250,0.15), 0 12px 24px rgba(37,99,235,0.08)",
    transform: "translateY(-1px)"
  },

  shippingOptionHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },

  shippingOptionTitle: {
    color: "#0f172a",
    fontWeight: 900,
    lineHeight: 1.5
  },

  shippingOptionMeta: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    marginTop: "4px",
    lineHeight: 1.7
  },

  shippingOptionPrice: {
    color: UI.colors.navy,
    whiteSpace: "nowrap",
    fontWeight: 900
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
    borderRadius: UI.radius.pill,
    padding: "4px 8px",
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  cheapestBadge: {
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: UI.radius.pill,
    padding: "4px 8px",
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  fastestBadge: {
    background: "#fef3c7",
    color: "#92400e",
    border: "1px solid #fcd34d",
    borderRadius: UI.radius.pill,
    padding: "4px 8px",
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  codBadge: {
    background: "#ede9fe",
    color: "#6d28d9",
    border: "1px solid #c4b5fd",
    borderRadius: UI.radius.pill,
    padding: "4px 8px",
    fontSize: UI.type.caption,
    fontWeight: 800
  },

  shippingEmptyBox: {
    padding: "13px",
    borderRadius: UI.radius.xl,
    border: "1px dashed #d6d3d1",
    background: "#fafaf9",
    color: UI.colors.muted,
    lineHeight: 1.8
  },

  groupShippingRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#4b5563",
    fontWeight: 700,
    paddingTop: "4px"
  },

  totals: {
    display: "grid",
    gap: "12px",
    padding: "14px",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
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
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "20px"
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

  successShell: {
    textAlign: "center",
    background: "linear-gradient(180deg, #fffdfa 0%, #f8f3ea 100%)",
    border: "1px solid #e5dcc9",
    boxShadow: "0 20px 50px rgba(11,15,26,0.06)"
  },

  successIcon: {
    fontSize: "48px"
  },

  resultsStats: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "10px"
  },

  statCard: {
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce"
  },

  statLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  statSuccess: {
    color: UI.colors.successText,
    fontSize: "24px",
    fontWeight: 900
  },

  statDanger: {
    color: UI.colors.dangerText,
    fontSize: "24px",
    fontWeight: 900
  },

  resultsList: {
    display: "grid",
    gap: "10px",
    textAlign: "right"
  },

  resultRow: {
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)"
  },

  resultMain: {
    display: "grid",
    gap: "4px"
  },

  resultSeller: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "16px"
  },

  resultMeta: {
    color: UI.colors.muted,
    fontSize: UI.type.bodySm
  },

  resultSide: {
    display: "grid",
    gap: "4px",
    textAlign: "left"
  },

  trackBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "36px"
  },

  orderNumber: {
    color: "#111827"
  },

  orderAmount: {
    color: UI.colors.navy,
    fontWeight: 900
  },

  errorText: {
    color: UI.colors.dangerText
  },

  successActions: {
    display: "grid",
    gap: "10px"
  }
};
