import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

const T = {
  text: "#111827",
  subtext: "#5b6472",
  border: "#e5e7eb",
  bg: "#f8fafc",
  white: "#ffffff",
  blue: "#1f3b73",
  blueDark: "#13294b",
  gold: "#f59e0b",
  chip: "#eef2ff",
  success: "#166534"
};

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, currentUser, authLoading } = useApp();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    review_image_url: ""
  });

  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);
        setReviewsLoading(true);
        setMessage("");
        setReviewMessage("");

        const productRes = await apiGet(`/catalog/products/${slug}`);
        if (productRes.ok) {
          setProduct(productRes.data);
        } else {
          setMessage("تعذر تحميل المنتج");
        }

        const reviewsRes = await apiGet(`/catalog/products/${slug}/reviews`);
        if (reviewsRes.ok) {
          setReviews(reviewsRes.data || []);
        }

        const similarRes = await apiGet(`/catalog/products/${slug}/similar`);
        if (similarRes.ok) {
          setSimilar(similarRes.data || []);
        }
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    }

    loadAll();
  }, [slug]);

  const ratingSummary = useMemo(() => {
    const count = Number(product?.reviews_count || reviews.length || 0);
    const avg = Number(product?.rating_avg || 0);
    return { count, avg };
  }, [product, reviews]);

  const highlights = useMemo(() => {
    const source = product?.description_long_ar || product?.description_ar || "";
    const lines = source
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    const bulletLines = lines.filter((line) =>
      line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
    );

    if (bulletLines.length) {
      return bulletLines.map((line) => line.replace(/^[-•*]\s*/, "")).slice(0, 5);
    }

    if (source) {
      return source
        .split(/[.،]/)
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 5);
    }

    return [
      "منتج مناسب للاستخدام اليومي",
      "جودة موثوقة داخل منصة رحبة",
      "تجربة شراء سهلة وآمنة"
    ];
  }, [product]);

  function normalizeProduct(p) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.title_ar || "",
      price: p.price_mad || 0,
      seller_id: p.seller_id || null,
      seller: p.seller_name || p.brand || "RAHBA",
      city: "",
      rating: p.rating_avg || 0,
      reviews: p.reviews_count || 0,
      stock: p.stock || 0,
      badge: p.status || "",
      description: p.description_ar || "",
      image_url: p.image_url || ""
    };
  }

  function handleAddToCart() {
    if (!product) return;
    addToCart(normalizeProduct(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  function handleGoToCheckout() {
    if (!product) return;
    addToCart(normalizeProduct(product));
    navigate("/checkout");
  }

  async function handleSubmitReview(e) {
    e.preventDefault();

    if (!product) return;

    try {
      if (authLoading) {
        setReviewMessage("جاري التحقق من الجلسة...");
        return;
      }

      if (!currentUser) {
        setReviewMessage("يجب تسجيل الدخول أولاً لإضافة تقييم");
        navigate("/auth");
        return;
      }

      if (currentUser.role !== "buyer") {
        setReviewMessage("فقط المشترون يمكنهم إضافة تقييمات");
        return;
      }

      if (!reviewForm.comment.trim()) {
        setReviewMessage("يرجى كتابة تعليق");
        return;
      }

      setSubmittingReview(true);
      setReviewMessage("");

      const result = await apiPost(`/catalog/products/${slug}/reviews`, {
        rating: Number(reviewForm.rating),
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
        review_image_url: reviewForm.review_image_url.trim() || null
      });

      if (!result.ok) {
        setReviewMessage(result.message || "تعذر إرسال التقييم");
        return;
      }

      setReviewMessage("تم إرسال التقييم بنجاح");
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
        review_image_url: ""
      });

      const reviewsRes = await apiGet(`/catalog/products/${slug}/reviews`);
      if (reviewsRes.ok) {
        setReviews(reviewsRes.data || []);
      }

      const productRes = await apiGet(`/catalog/products/${slug}`);
      if (productRes.ok) {
        setProduct(productRes.data);
      }
    } catch (err) {
      console.error(err);
      setReviewMessage("حدث خطأ أثناء إرسال التقييم");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <section className="container section-space">
        <p>جاري تحميل المنتج...</p>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container section-space">
        <p>المنتج غير موجود</p>
      </section>
    );
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.page}>
        <div style={s.topCard}>
          <div style={s.brandRow}>
            <span style={s.brandText}>{product.brand || product.seller_name || "RAHBA"}</span>
          </div>

          <h1 style={s.title}>{product.title_ar}</h1>

          <div style={s.ratingRow}>
            <span style={s.stars}>{"★".repeat(Math.round(ratingSummary.avg || 0)) || "☆☆☆☆☆"}</span>
            <span style={s.ratingValue}>{ratingSummary.avg || 0}</span>
            <span style={s.ratingCount}>({ratingSummary.count || 0})</span>
          </div>

          <div style={s.imageCard}>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title_ar}
                style={s.mainImage}
              />
            ) : (
              <div style={s.noImage}>No image</div>
            )}
          </div>

          <div style={s.priceWrap}>
            <div style={s.price}>{product.price_mad} MAD</div>
            <div style={s.stock}>
              {product.stock > 0 ? `متوفر في المخزون: ${product.stock}` : "غير متوفر حالياً"}
            </div>
          </div>

          <div style={s.buyBox}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              style={buttonSecondary(product.stock <= 0)}
            >
              {product.stock <= 0 ? "غير متوفر" : "أضف إلى السلة"}
            </button>

            <button
              onClick={handleGoToCheckout}
              disabled={product.stock <= 0}
              style={buttonPrimary(product.stock <= 0)}
            >
              اشتر الآن عبر Checkout
            </button>

            {message ? <div style={s.infoBox}>{message}</div> : null}
          </div>
        </div>

        <section style={s.sectionCard}>
          <h2 style={s.sectionTitle}>من الشركة المصنعة</h2>
          <div style={s.manufacturerHero}>
            <div style={s.heroTextWrap}>
              <div style={s.heroBadge}>منتج مختار على رحبة</div>
              <h3 style={s.heroTitle}>اكتشف قيمة المنتج قبل الشراء</h3>
              <p style={s.heroText}>
                {product.description_long_ar ||
                  product.description_ar ||
                  "هذا المنتج يوفر توازنًا جيدًا بين الجودة، سهولة الاستخدام، والتجربة العملية داخل منصة رحبة."}
              </p>
            </div>

            <div style={s.heroChips}>
              <span style={s.heroChip}>جودة موثوقة</span>
              <span style={s.heroChip}>شراء آمن</span>
              <span style={s.heroChip}>مناسب للاستخدام اليومي</span>
            </div>
          </div>
        </section>

        <section style={s.sectionCard}>
          <h2 style={s.sectionTitle}>تفاصيل المنتج</h2>

          <div style={s.detailsGrid}>
            <DetailRow label="العلامة" value={product.brand || product.seller_name || "RAHBA"} />
            <DetailRow label="السعر" value={`${product.price_mad} MAD`} />
            <DetailRow label="الحالة" value={product.status || "active"} />
            <DetailRow label="المخزون" value={String(product.stock || 0)} />
          </div>

          <div style={s.highlightsBox}>
            <h3 style={s.subTitle}>أهم المميزات</h3>
            <ul style={s.bulletList}>
              {highlights.map((item, idx) => (
                <li key={`${item}-${idx}`} style={s.bulletItem}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section style={s.sectionCard}>
          <div style={s.reviewHeader}>
            <div>
              <h2 style={s.sectionTitle}>مراجعات العملاء</h2>
              <div style={s.reviewSummary}>
                <span style={s.bigStars}>{"★".repeat(Math.round(ratingSummary.avg || 0)) || "☆☆☆☆☆"}</span>
                <span style={s.bigRatingText}>
                  {ratingSummary.avg || 0} من 5
                </span>
              </div>
              <div style={s.reviewCountText}>
                {ratingSummary.count || 0} تقييم
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmitReview} style={s.reviewForm}>
            <div style={s.formGroup}>
              <label style={s.label}>التقييم</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                }
                style={s.input}
              >
                <option value={5}>5 - ممتاز</option>
                <option value={4}>4 - جيد جدًا</option>
                <option value={3}>3 - جيد</option>
                <option value={2}>2 - مقبول</option>
                <option value={1}>1 - ضعيف</option>
              </select>
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>عنوان المراجعة</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="مثلاً: منتج ممتاز"
                style={s.input}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>التعليق</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="اكتب تجربتك بعد الشراء"
                style={s.textarea}
              />
            </div>

            <div style={s.formGroup}>
              <label style={s.label}>رابط صورة المراجعة</label>
              <input
                type="url"
                value={reviewForm.review_image_url}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, review_image_url: e.target.value }))
                }
                placeholder="https://..."
                style={s.input}
              />
            </div>

            <div style={s.reviewHint}>
              التقييم وإرفاق الصورة متاحان فقط بعد شراء المنتج.
            </div>

            {reviewMessage ? <div style={s.infoBox}>{reviewMessage}</div> : null}

            <button
              type="submit"
              disabled={submittingReview}
              style={buttonPrimary(submittingReview)}
            >
              {submittingReview ? "جاري إرسال المراجعة..." : "إرسال المراجعة"}
            </button>
          </form>

          <div style={s.reviewsList}>
            {reviewsLoading ? (
              <p style={s.loadingText}>جاري تحميل المراجعات...</p>
            ) : reviews.length === 0 ? (
              <div style={s.emptyBox}>لا توجد مراجعات بعد</div>
            ) : (
              reviews.map((review) => (
                <article key={review.id} style={s.reviewCard}>
                  <div style={s.reviewCardTop}>
                    <div style={s.reviewCardStars}>
                      {"★".repeat(review.rating)}
                    </div>
                    <div style={s.reviewDate}>{review.created_at}</div>
                  </div>

                  {review.buyer_name ? (
                    <div style={s.reviewerName}>{review.buyer_name}</div>
                  ) : null}

                  {review.title ? (
                    <strong style={s.reviewTitle}>{review.title}</strong>
                  ) : null}

                  <p style={s.reviewText}>{review.comment}</p>

                  {review.review_image_url ? (
                    <img
                      src={review.review_image_url}
                      alt="صورة المراجعة"
                      style={s.reviewImage}
                    />
                  ) : null}
                </article>
              ))
            )}
          </div>
        </section>

        {similar.length > 0 ? (
          <section style={s.sectionCard}>
            <h2 style={s.sectionTitle}>منتجات مشابهة</h2>

            <div style={s.similarGrid}>
              {similar.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.slug}`)}
                  style={s.similarCard}
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title_ar}
                      style={s.similarImage}
                    />
                  ) : (
                    <div style={s.similarNoImage}>No image</div>
                  )}

                  <div style={s.similarBody}>
                    <div style={s.similarTitle}>{p.title_ar}</div>
                    <div style={s.similarDesc}>
                      {p.description_ar || "منتج مشابه داخل نفس الفئة"}
                    </div>
                    <div style={s.similarPrice}>{p.price_mad} MAD</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </section>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={s.detailRow}>
      <div style={s.detailLabel}>{label}</div>
      <div style={s.detailValue}>{value}</div>
    </div>
  );
}

function buttonPrimary(disabled) {
  return {
    padding: "13px 16px",
    borderRadius: "999px",
    border: "none",
    background: disabled ? "#94a3b8" : "#1f3b73",
    color: "#fff",
    fontWeight: 800,
    fontSize: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.8 : 1
  };
}

function buttonSecondary(disabled) {
  return {
    padding: "13px 16px",
    borderRadius: "999px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 800,
    fontSize: "14px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.8 : 1
  };
}

const s = {
  page: {
    display: "grid",
    gap: "18px"
  },

  topCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "16px",
    display: "grid",
    gap: "14px"
  },

  brandRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start"
  },

  brandText: {
    color: T.blue,
    fontWeight: 700,
    fontSize: "14px"
  },

  title: {
    margin: 0,
    color: T.text,
    fontSize: "26px",
    lineHeight: 1.35,
    fontWeight: 900
  },

  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap"
  },

  stars: {
    color: T.gold,
    fontSize: "16px",
    letterSpacing: "1px"
  },

  ratingValue: {
    color: T.text,
    fontWeight: 700,
    fontSize: "14px"
  },

  ratingCount: {
    color: T.blue,
    fontWeight: 700,
    fontSize: "14px"
  },

  imageCard: {
    background: "#fff",
    borderRadius: "16px",
    border: `1px solid ${T.border}`,
    overflow: "hidden"
  },

  mainImage: {
    width: "100%",
    maxHeight: "420px",
    objectFit: "contain",
    display: "block",
    background: "#fff"
  },

  noImage: {
    minHeight: "320px",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    background: T.bg
  },

  priceWrap: {
    display: "grid",
    gap: "6px"
  },

  price: {
    fontSize: "32px",
    fontWeight: 900,
    color: T.text
  },

  stock: {
    color: T.success,
    fontWeight: 700,
    fontSize: "14px"
  },

  buyBox: {
    display: "grid",
    gap: "10px"
  },

  sectionCard: {
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "14px"
  },

  sectionTitle: {
    margin: 0,
    color: T.text,
    fontSize: "18px",
    fontWeight: 900
  },

  manufacturerHero: {
    display: "grid",
    gap: "14px",
    padding: "18px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #0f2f6b 0%, #1d4ed8 50%, #1fb6a6 100%)",
    color: "#fff"
  },

  heroTextWrap: {
    display: "grid",
    gap: "10px"
  },

  heroBadge: {
    width: "fit-content",
    padding: "6px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "12px",
    fontWeight: 800
  },

  heroTitle: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.35,
    fontWeight: 900
  },

  heroText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 2,
    color: "rgba(255,255,255,0.92)"
  },

  heroChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },

  heroChip: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.16)",
    fontSize: "13px",
    fontWeight: 700
  },

  detailsGrid: {
    display: "grid",
    gap: "10px"
  },

  detailRow: {
    display: "grid",
    gridTemplateColumns: "110px 1fr",
    gap: "12px",
    paddingBottom: "10px",
    borderBottom: `1px solid ${T.border}`
  },

  detailLabel: {
    color: T.text,
    fontWeight: 800,
    fontSize: "14px"
  },

  detailValue: {
    color: T.subtext,
    fontWeight: 600,
    fontSize: "14px",
    lineHeight: 1.7
  },

  highlightsBox: {
    display: "grid",
    gap: "10px"
  },

  subTitle: {
    margin: 0,
    color: T.text,
    fontSize: "16px",
    fontWeight: 900
  },

  bulletList: {
    margin: 0,
    paddingInlineStart: "20px",
    display: "grid",
    gap: "8px"
  },

  bulletItem: {
    color: T.text,
    lineHeight: 1.9,
    fontSize: "14px"
  },

  reviewHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between"
  },

  reviewSummary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px"
  },

  bigStars: {
    color: T.gold,
    fontSize: "18px",
    letterSpacing: "1px"
  },

  bigRatingText: {
    color: T.text,
    fontWeight: 800,
    fontSize: "15px"
  },

  reviewCountText: {
    color: T.subtext,
    fontSize: "14px",
    marginTop: "4px"
  },

  reviewForm: {
    display: "grid",
    gap: "12px",
    padding: "14px",
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    background: T.bg
  },

  formGroup: {
    display: "grid",
    gap: "6px"
  },

  label: {
    color: T.text,
    fontSize: "14px",
    fontWeight: 800
  },

  input: {
    padding: "12px",
    borderRadius: "12px",
    border: `1px solid #d1d5db`,
    background: "#fff",
    fontFamily: "inherit",
    fontSize: "14px"
  },

  textarea: {
    padding: "12px",
    borderRadius: "12px",
    border: `1px solid #d1d5db`,
    background: "#fff",
    fontFamily: "inherit",
    fontSize: "14px",
    minHeight: "120px",
    resize: "vertical"
  },

  reviewHint: {
    color: T.subtext,
    fontSize: "13px",
    lineHeight: 1.8
  },

  infoBox: {
    padding: "12px",
    borderRadius: "12px",
    border: `1px solid ${T.border}`,
    background: "#fff",
    color: T.text
  },

  reviewsList: {
    display: "grid",
    gap: "12px"
  },

  loadingText: {
    margin: 0,
    color: T.subtext
  },

  emptyBox: {
    padding: "16px",
    borderRadius: "12px",
    border: `1px solid ${T.border}`,
    background: T.bg,
    color: T.subtext
  },

  reviewCard: {
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    padding: "14px",
    display: "grid",
    gap: "8px",
    background: "#fff"
  },

  reviewCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    flexWrap: "wrap"
  },

  reviewCardStars: {
    color: T.gold,
    fontWeight: 800,
    fontSize: "15px"
  },

  reviewDate: {
    color: T.subtext,
    fontSize: "13px"
  },

  reviewerName: {
    color: T.blue,
    fontWeight: 700,
    fontSize: "13px"
  },

  reviewTitle: {
    color: T.text,
    fontSize: "15px"
  },

  reviewText: {
    margin: 0,
    color: T.text,
    lineHeight: 1.9,
    fontSize: "14px"
  },

  reviewImage: {
    width: "120px",
    borderRadius: "10px",
    border: `1px solid ${T.border}`
  },

  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "14px"
  },

  similarCard: {
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    cursor: "pointer",
    background: "#fff"
  },

  similarImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block"
  },

  similarNoImage: {
    height: "150px",
    display: "grid",
    placeItems: "center",
    background: T.bg,
    color: "#94a3b8"
  },

  similarBody: {
    padding: "12px",
    display: "grid",
    gap: "6px"
  },

  similarTitle: {
    color: T.text,
    fontWeight: 800,
    fontSize: "14px",
    lineHeight: 1.7
  },

  similarDesc: {
    color: T.subtext,
    fontSize: "12px",
    lineHeight: 1.7
  },

  similarPrice: {
    color: T.blueDark,
    fontWeight: 900,
    fontSize: "15px"
  }
};
