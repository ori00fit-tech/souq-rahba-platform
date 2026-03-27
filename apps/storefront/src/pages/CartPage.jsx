import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import { formatMoney } from "../lib/utils";

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
        <div className="page-stack">
          <div className="ui-card" style={s.heroCard}>
            <div className="ui-chip">RAHBA CART</div>
            <h1 className="page-title">السلة</h1>
            <p className="page-subtitle">
              السلة فارغة حالياً. أضف بعض المنتجات ثم عد لإتمام الطلب.
            </p>
          </div>

          <div className="empty-state" style={s.emptyCard}>
            <div style={s.emptyIcon}>🛒</div>
            <h3 style={s.emptyTitle}>لم تضف أي منتج بعد</h3>
            <p style={s.emptyText}>
              تصفح المنتجات المناسبة لك وابدأ بإضافة أول منتج إلى السلة.
            </p>
            <Link to="/products" className="btn btn-primary full-width">
              تصفح المنتجات
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={s.heroCard}>
          <div className="ui-chip">RAHBA CART</div>
          <h1 className="page-title">سلة التسوق</h1>
          <p className="page-subtitle">
            راجع المنتجات، عدّل الكميات، ثم أكمل الطلب بسهولة.
          </p>

          <div style={s.metaRow}>
            <span className="ui-chip">{displayItemCount} عنصر</span>
            <span className="ui-chip">{sellerCount} بائع</span>
            <span className="ui-chip">{formatMoney(subtotal, currency, locale)}</span>
          </div>
        </div>

        {message ? <div className="message-box">{message}</div> : null}

        {cartIssues.length > 0 ? (
          <div className="ui-card-soft" style={s.warningBox}>
            <strong style={s.warningTitle}>راجع السلة قبل الإتمام</strong>
            <ul style={s.warningList}>
              {cartIssues.map((issue, index) => (
                <li key={`${issue}-${index}`}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {sellerCount > 1 ? (
          <div className="ui-card-soft" style={s.splitNotice}>
            <strong style={s.splitTitle}>📦 السلة متعددة الباعة</strong>
            <div style={s.splitText}>
              سيتم تقسيم هذه السلة إلى <strong>{sellerCount} طلبات</strong> عند إتمام الشراء،
              طلب مستقل لكل بائع.
            </div>
          </div>
        ) : (
          <div className="ui-card-soft" style={s.singleNotice}>
            <strong style={s.splitTitle}>طلب واحد</strong>
            <div style={s.splitText}>
              كل المنتجات الحالية من نفس البائع، وسيتم إنشاء طلب واحد فقط.
            </div>
          </div>
        )}

        <div style={s.layout}>
          <div style={s.itemsCol}>
            {groupedBySeller.map((group) => (
              <section key={`${group.seller_id || group.seller_name}`} className="ui-card" style={s.sellerSection}>
                <div style={s.sellerHeader}>
                  <div>
                    <div style={s.sellerName}>{group.seller_name}</div>
                    <div style={s.sellerMeta}>{group.items.length} منتج</div>
                  </div>
                  <div style={s.sellerSubtotal}>
                    {formatMoney(group.subtotal, currency, locale)}
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
                            <div style={s.itemMeta}>
                              {item.city ? item.city : group.seller_name}
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
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>

          <aside className="ui-card" style={s.summaryCard}>
            <h2 className="section-title" style={s.summaryTitle}>ملخص السلة</h2>

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
  metaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  warningBox: {
    padding: "14px",
    display: "grid",
    gap: "8px",
    background: "#fff7ed",
    border: "1px solid #fed7aa"
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
  layout: {
    display: "grid",
    gap: "14px"
  },
  itemsCol: {
    display: "grid",
    gap: "12px"
  },
  sellerSection: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  sellerHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "start",
    flexWrap: "wrap"
  },
  sellerName: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  sellerMeta: {
    marginTop: "4px",
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  sellerSubtotal: {
    color: "#173b74",
    fontWeight: 900,
    fontSize: "18px"
  },
  groupItems: {
    display: "grid",
    gap: "10px"
  },
  itemCard: {
    padding: "14px",
    display: "grid",
    gap: "12px"
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
  itemTitle: {
    color: "#1f2937",
    fontWeight: 900,
    lineHeight: 1.6
  },
  itemMeta: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  removeBtn: {
    minHeight: "40px",
    paddingInline: "12px",
    flexShrink: 0
  },
  itemImage: {
    width: "100%",
    maxHeight: "180px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #ece3d8"
  },
  itemImageFallback: {
    width: "100%",
    minHeight: "140px",
    borderRadius: "16px",
    border: "1px solid #ece3d8",
    background: "#f8f7f3",
    display: "grid",
    placeItems: "center",
    fontSize: "36px"
  },
  itemBottom: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#f8fbff",
    border: "1px solid #d7e2ef",
    borderRadius: "16px",
    padding: "6px"
  },
  qtyBtn: {
    width: "38px",
    height: "38px",
    border: "none",
    borderRadius: "12px",
    background: "#fff",
    color: "#173b74",
    fontWeight: 900,
    fontSize: "20px",
    cursor: "pointer"
  },
  qtyValue: {
    minWidth: "34px",
    textAlign: "center",
    fontWeight: 900,
    color: "#173b74"
  },
  priceBlock: {
    display: "grid",
    gap: "4px",
    textAlign: "left"
  },
  unitPrice: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  lineTotal: {
    color: "#173b74",
    fontSize: "20px",
    fontWeight: 900
  },
  stockOk: {
    color: "#166534",
    fontSize: "13px",
    fontWeight: 800
  },
  stockWarn: {
    color: "#b45309",
    fontSize: "13px",
    fontWeight: 800
  },
  stockDanger: {
    color: "#b91c1c",
    fontSize: "13px",
    fontWeight: 800
  },
  summaryCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  summaryTitle: {
    fontSize: "22px"
  },
  summaryRows: {
    display: "grid",
    gap: "12px"
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
  }
};
