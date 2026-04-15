import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";
import SectionShell from "../components/marketplace/SectionShell";
import SectionHead from "../components/marketplace/SectionHead";
import { UI } from "../components/marketplace/uiTokens";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQty, currency, language, cartCount } = useApp();
  const [message, setMessage] = useState("");

  const locale =
    language === "ar" ? "ar-MA" :
    language === "fr" ? "fr-MA" :
    "en-US";

  const normalizedCart = useMemo(() => {
    if (!Array.isArray(cart)) return [];
    return cart.map((item) => ({
      id: item.id || "",
      slug: item.slug || "",
      name: item.name || item.title_ar || "منتج",
      seller_id: item.seller_id || "",
      seller: item.seller || "بائع غير معروف",
      city: item.city || "",
      image_url: resolveImageUrl(item.image_url || ""),
      price: Number(item.price ?? item.price_mad ?? 0),
      qty: Math.max(1, Number(item.qty || item.quantity || 1)),
      stock: Number(item.stock ?? 0)
    }));
  }, [cart]);

  const groupedBySeller = useMemo(() => {
    const map = new Map();

    for (const item of normalizedCart) {
      const sellerKey = item.seller_id || `seller:${item.seller}`;
      if (!map.has(sellerKey)) {
        map.set(sellerKey, {
          seller_id: item.seller_id || "",
          seller_name: item.seller,
          items: []
        });
      }
      map.get(sellerKey).items.push(item);
    }

    return Array.from(map.values()).map((group) => ({
      ...group,
      subtotal: group.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    }));
  }, [normalizedCart]);

  const subtotal = useMemo(
    () => normalizedCart.reduce((sum, item) => sum + item.price * item.qty, 0),
    [normalizedCart]
  );

  const computedItemCount = useMemo(
    () => normalizedCart.reduce((sum, item) => sum + Number(item.qty || 1), 0),
    [normalizedCart]
  );

  const displayItemCount =
    typeof cartCount === "number" && cartCount >= 0 ? cartCount : computedItemCount;

  const sellerCount = groupedBySeller.length;
  const shippingLabel = "يتم احتسابه في صفحة الإتمام";

  const cartIssues = useMemo(() => {
    const issues = [];

    const hasMissingProductId = normalizedCart.some((item) => !item.id);
    if (hasMissingProductId) {
      issues.push("بعض المنتجات في السلة غير صالحة حالياً. أعد إضافتها من صفحة المنتج.");
    }

    const hasMissingSeller = normalizedCart.some((item) => !item.seller_id);
    if (hasMissingSeller) {
      issues.push("بعض المنتجات لا تحتوي على معلومات البائع بشكل كامل.");
    }

    const hasOutOfStock = normalizedCart.some(
      (item) => Number.isFinite(item.stock) && item.stock <= 0
    );
    if (hasOutOfStock) {
      issues.push("توجد منتجات غير متوفرة حالياً داخل السلة.");
    }

    const hasQtyOverStock = normalizedCart.some(
      (item) => Number.isFinite(item.stock) && item.stock > 0 && item.qty > item.stock
    );
    if (hasQtyOverStock) {
      issues.push("بعض الكميات المطلوبة أكبر من المخزون المتاح.");
    }

    const hasInvalidPrice = normalizedCart.some((item) => !Number.isFinite(item.price) || item.price < 0);
    if (hasInvalidPrice) {
      issues.push("تعذر التحقق من أسعار بعض المنتجات.");
    }

    return issues;
  }, [normalizedCart]);

  const canCheckout = cartIssues.length === 0 && normalizedCart.length > 0;

  function decreaseQty(item) {
    setMessage("");
    const nextQty = item.qty - 1;
    if (nextQty < 1) {
      removeFromCart(item.id);
      return;
    }
    updateQty(item.id, nextQty);
  }

  function increaseQty(item) {
    setMessage("");

    if (Number.isFinite(item.stock) && item.stock > 0 && item.qty >= item.stock) {
      setMessage(`لا يمكن تجاوز المخزون المتاح للمنتج: ${item.name}`);
      return;
    }

    updateQty(item.id, item.qty + 1);
  }

  function goToCheckout() {
    if (!canCheckout) {
      setMessage(cartIssues[0] || "يرجى مراجعة السلة قبل المتابعة");
      return;
    }

    navigate("/checkout");
  }

  if (!normalizedCart.length) {
    return (
      <section className="container section-space" dir="rtl">
        <div style={s.stack}>
          <SectionShell style={s.heroShell}>
            <div className="ui-chip">RAHBA CART</div>
            <SectionHead
              title="السلة"
              subtitle="السلة فارغة حالياً. أضف بعض المنتجات ثم عد لإتمام الطلب."
            />
          </SectionShell>

          <SectionShell>
            <div style={s.emptyCard}>
              <div style={s.emptyIcon}>🛒</div>
              <div className="ui-chip">READY TO START</div>
              <h3 style={s.emptyTitle}>لم تضف أي منتج بعد</h3>
              <p style={s.emptyText}>
                تصفح المنتجات المناسبة لك، أضف ما تحتاجه إلى السلة، ثم عد لإتمام
                الطلب بسرعة ووضوح.
              </p>
              <div style={s.emptyActions}>
                <Link to="/products" className="btn btn-primary full-width">
                  تصفح المنتجات
                </Link>
              </div>
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
            <div className="ui-chip">RAHBA CART</div>
            <div style={s.heroKicker}>Premium cart review</div>
          </div>

          <SectionHead
            title="سلة التسوق"
            subtitle="راجع المنتجات، عدّل الكميات، وتأكد من الجاهزية قبل الانتقال إلى الإتمام."
          />

          <div style={s.metaRow}>
            <span className="ui-chip">{displayItemCount} عنصر</span>
            <span className="ui-chip">{sellerCount} بائع</span>
            <span className="ui-chip">{formatMoney(subtotal, currency, locale)}</span>
          </div>

          <div style={s.heroTrustRow}>
            <span style={s.heroTrustItem}>مراجعة سريعة</span>
            <span style={s.heroTrustItem}>إتمام أوضح</span>
            <span style={s.heroTrustItem}>تجربة شراء أفضل</span>
          </div>
        </SectionShell>

        {message ? <div className="message-box">{message}</div> : null}

        {cartIssues.length > 0 ? (
          <SectionShell>
            <div className="ui-card-soft" style={s.warningBox}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>⚠️</div>
                <strong style={s.warningTitle}>راجع السلة قبل الإتمام</strong>
              </div>
              <ul style={s.warningList}>
                {cartIssues.map((issue, index) => (
                  <li key={`${issue}-${index}`}>{issue}</li>
                ))}
              </ul>
            </div>
          </SectionShell>
        ) : null}

        {sellerCount > 1 ? (
          <SectionShell>
            <div className="ui-card-soft" style={s.splitNotice}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>📦</div>
                <strong style={s.splitTitle}>السلة متعددة الباعة</strong>
              </div>
              <div style={s.splitText}>
                سيتم تقسيم هذه السلة إلى <strong>{sellerCount} طلبات</strong> عند إتمام الشراء،
                مع إنشاء طلب مستقل لكل بائع لتسهيل التتبع والمعالجة.
              </div>
            </div>
          </SectionShell>
        ) : (
          <SectionShell>
            <div className="ui-card-soft" style={s.singleNotice}>
              <div style={s.noticeHead}>
                <div style={s.noticeIcon}>✅</div>
                <strong style={s.splitTitle}>طلب واحد</strong>
              </div>
              <div style={s.splitText}>
                كل المنتجات الحالية من نفس البائع، لذلك سيتم إنشاء طلب واحد فقط
                بشكل أبسط وأوضح.
              </div>
            </div>
          </SectionShell>
        )}

        <div style={s.layout}>
          <div style={s.itemsCol}>
            {groupedBySeller.map((group) => (
              <SectionShell key={`${group.seller_id || group.seller_name}`}>
                <div style={s.sellerHeader}>
                  <div>
                    <div style={s.sellerEyebrow}>البائع</div>
                    <div style={s.sellerName}>{group.seller_name}</div>
                    <div style={s.sellerMeta}>{group.items.length} منتج</div>
                  </div>
                  <div style={s.sellerSubtotalWrap}>
                    <div style={s.sellerEyebrow}>المجموع</div>
                    <div style={s.sellerSubtotal}>
                      {formatMoney(group.subtotal, currency, locale)}
                    </div>
                  </div>
                </div>

                <div style={s.groupItems}>
                  {group.items.map((item) => {
                    const lineTotal = item.price * item.qty;
                    const isOutOfStock = Number.isFinite(item.stock) && item.stock <= 0;
                    const isOverStock =
                      Number.isFinite(item.stock) && item.stock > 0 && item.qty > item.stock;

                    return (
                      <article key={item.id || `${group.seller_name}-${item.name}`} className="ui-card-soft" style={s.itemCard}>
                        <div style={s.itemTop}>
                          <div style={s.itemInfo}>
                            <div style={s.itemTitle}>{item.name}</div>
                            <div style={s.itemMetaRow}>
                              <span style={s.itemMetaBadge}>{group.seller_name}</span>
                              <span style={s.itemMetaBadge}>
                                {item.city ? item.city : "المغرب"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="btn btn-soft"
                            style={s.removeBtn}
                          >
                            حذف
                          </button>
                        </div>

                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} style={s.itemImage} />
                        ) : (
                          <div style={s.itemImageFallback}>📦</div>
                        )}

                        <div style={s.itemBottom}>
                          <div style={s.qtyControl}>
                            <button
                              type="button"
                              onClick={() => increaseQty(item)}
                              style={s.qtyBtn}
                              disabled={isOutOfStock}
                            >
                              +
                            </button>

                            <span style={s.qtyValue}>{item.qty}</span>

                            <button
                              type="button"
                              onClick={() => decreaseQty(item)}
                              style={s.qtyBtn}
                            >
                              −
                            </button>
                          </div>

                          <div style={s.priceBlock}>
                            <div style={s.unitPrice}>
                              {formatMoney(item.price, currency, locale)}
                            </div>
                            <div style={s.lineTotal}>
                              {formatMoney(lineTotal, currency, locale)}
                            </div>
                          </div>
                        </div>

                        {isOutOfStock ? (
                          <div style={s.stockDanger}>غير متوفر حالياً — احذف المنتج أو راجع لاحقاً</div>
                        ) : isOverStock ? (
                          <div style={s.stockWarn}>الكمية في السلة أكبر من المخزون المتاح ({item.stock})</div>
                        ) : item.stock > 0 ? (
                          <div style={s.stockOk}>متوفر: {item.stock}</div>
                        ) : (
                          <div style={s.stockWarn}>تحقق من التوفر قبل إتمام الطلب</div>
                        )}

                        {item.slug ? (
                          <Link to={`/products/${item.slug}`} className="btn btn-secondary full-width">
                            عرض المنتج
                          </Link>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              </SectionShell>
            ))}
          </div>

          <aside style={s.summaryCol}>
            <SectionShell>
              <SectionHead
                chip="CART SUMMARY"
                title="ملخص السلة"
                subtitle="راجع الإجمالي الحالي ثم انتقل إلى صفحة الإتمام."
              />

              <div style={s.summaryRows}>
                <div style={s.summaryRow}>
                  <span>عدد العناصر</span>
                  <strong>{displayItemCount}</strong>
                </div>

                <div style={s.summaryRow}>
                  <span>عدد الباعة</span>
                  <strong>{sellerCount}</strong>
                </div>

                <div style={s.summaryRow}>
                  <span>المجموع الفرعي</span>
                  <strong>{formatMoney(subtotal, currency, locale)}</strong>
                </div>

                <div style={s.summaryRow}>
                  <span>التوصيل</span>
                  <strong>{shippingLabel}</strong>
                </div>

                <div style={s.divider} />

                <div style={s.summaryRowTotal}>
                  <span>الإجمالي الحالي</span>
                  <strong>{formatMoney(subtotal, currency, locale)}</strong>
                </div>
              </div>

              <div style={s.summaryTrustBox}>
                <div style={s.summaryTrustTitle}>جاهز للانتقال إلى الإتمام</div>
                <div style={s.summaryTrustText}>
                  راجع السلة، تأكد من الكميات، ثم أكمل الطلب بخطوات واضحة وسريعة.
                </div>
              </div>

              <button
                type="button"
                onClick={goToCheckout}
                className="btn btn-primary full-width"
                disabled={!canCheckout}
              >
                متابعة إلى إتمام الطلب
              </button>

              <Link to="/products" className="btn btn-secondary full-width" style={s.backBtn}>
                متابعة التسوق
              </Link>
            </SectionShell>
          </aside>
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
    boxShadow: "0 18px 42px rgba(15,23,42,0.06)",
  },

  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  heroTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  heroKicker: {
    color: "#0f766e",
    fontWeight: 800,
    fontSize: UI.type.bodySm,
  },

  heroTrustRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
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
    fontWeight: 800,
  },

  noticeHead: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  noticeIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.72)",
    display: "grid",
    placeItems: "center",
    fontSize: "16px",
  },

  warningBox: {
    padding: "16px",
    display: "grid",
    gap: "10px",
    background: "linear-gradient(180deg, #fff7ed 0%, #fffaf4 100%)",
    border: "1px solid #fed7aa",
    boxShadow: "0 10px 24px rgba(154,52,18,0.06)",
  },

  warningTitle: {
    color: "#9a3412"
  },

  warningList: {
    margin: 0,
    paddingInlineStart: "18px",
    color: "#7c2d12",
    lineHeight: 1.9
  },

  splitNotice: {
    padding: "16px",
    display: "grid",
    gap: "8px",
    background: "linear-gradient(180deg, #fff7e6 0%, #fffaf1 100%)",
    border: "1px solid #f3d7a4",
    boxShadow: "0 10px 24px rgba(180,83,9,0.06)",
  },

  singleNotice: {
    padding: "16px",
    display: "grid",
    gap: "8px",
    background: "linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%)",
    border: "1px solid #d3e4f8",
    boxShadow: "0 10px 24px rgba(23,59,116,0.05)",
  },

  splitTitle: {
    color: UI.colors.navy
  },

  splitText: {
    color: "#5b6470",
    lineHeight: 1.8
  },

  layout: {
    display: "grid",
    gap: "16px",
  },

  itemsCol: {
    display: "grid",
    gap: "14px",
  },

  summaryCol: {
    display: "grid",
    gap: "14px",
  },

  sellerHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap",
    paddingBottom: "4px",
    borderBottom: "1px solid #ebe3d7",
  },

  sellerEyebrow: {
    color: "#8a8175",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "4px",
  },

  sellerSubtotalWrap: {
    textAlign: "left",
  },

  sellerName: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "19px",
  },

  sellerMeta: {
    marginTop: "4px",
    color: "#7a6f63",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  sellerSubtotal: {
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "19px",
  },

  groupItems: {
    display: "grid",
    gap: "12px",
  },

  itemCard: {
    padding: "16px",
    display: "grid",
    gap: "12px",
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce",
    boxShadow: "0 10px 24px rgba(15,23,42,0.04)",
  },

  itemTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "start"
  },

  itemInfo: {
    display: "grid",
    gap: "4px"
  },

  itemMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginTop: "2px",
  },

  itemMetaBadge: {
    minHeight: "28px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: "#ffffff",
    border: "1px solid #e7ddcf",
    color: "#7a6f63",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "12px",
    fontWeight: 700,
  },

  itemTitle: {
    color: UI.colors.ink,
    fontWeight: 900,
    lineHeight: 1.6
  },

  itemMeta: {
    color: "#7a6f63",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  removeBtn: {
    minHeight: "40px",
    paddingInline: "12px",
    flexShrink: 0
  },

  itemImage: {
    width: "100%",
    maxHeight: "220px",
    objectFit: "cover",
    borderRadius: UI.radius.xl,
    border: "1px solid #ece3d8",
  },

  itemImageFallback: {
    width: "100%",
    minHeight: "180px",
    borderRadius: UI.radius.xl,
    border: "1px solid #ece3d8",
    background: "#f8f7f3",
    display: "grid",
    placeItems: "center",
    fontSize: "40px",
  },

  itemBottom: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
    paddingTop: "4px",
  },

  qtyControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fbff",
    border: "1px solid #d7e2ef",
    borderRadius: UI.radius.lg,
    padding: "6px",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45)",
  },

  qtyBtn: {
    width: "40px",
    height: "40px",
    border: "none",
    borderRadius: UI.radius.md,
    background: UI.colors.white,
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "20px",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(23,59,116,0.06)",
  },

  qtyValue: {
    minWidth: "34px",
    textAlign: "center",
    fontWeight: 900,
    color: UI.colors.navy
  },

  priceBlock: {
    display: "grid",
    gap: "4px",
    textAlign: "left",
  },

  unitPrice: {
    color: "#7a6f63",
    fontSize: UI.type.bodySm,
    fontWeight: 700
  },

  lineTotal: {
    color: UI.colors.navy,
    fontSize: "22px",
    fontWeight: 900,
  },

  stockOk: {
    color: UI.colors.successText,
    fontSize: UI.type.bodySm,
    fontWeight: 800
  },

  stockWarn: {
    color: "#b45309",
    fontSize: UI.type.bodySm,
    fontWeight: 800
  },

  stockDanger: {
    color: UI.colors.dangerText,
    fontSize: UI.type.bodySm,
    fontWeight: 800
  },

  summaryRows: {
    display: "grid",
    gap: "12px",
    padding: "14px",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(180deg, #ffffff 0%, #fbf8f2 100%)",
    border: "1px solid #eadfce",
  },

  summaryTrustBox: {
    padding: "14px",
    borderRadius: UI.radius.xl,
    background: "linear-gradient(180deg, #eef6ff 0%, #f8fbff 100%)",
    border: "1px solid #d3e4f8",
    display: "grid",
    gap: "6px",
  },

  summaryTrustTitle: {
    color: UI.colors.navy,
    fontWeight: 900,
  },

  summaryTrustText: {
    color: "#5b6470",
    lineHeight: 1.8,
    fontSize: UI.type.bodySm,
  },

  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#4b5563",
    fontWeight: 700
  },

  summaryRowTotal: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: UI.colors.navy,
    fontWeight: 900,
    fontSize: "20px",
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

  emptyCard: {
    display: "grid",
    gap: "12px",
    textAlign: "center",
    padding: "8px 0",
  },

  emptyActions: {
    display: "grid",
    gap: "10px",
  },

  emptyIcon: {
    fontSize: "48px",
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
