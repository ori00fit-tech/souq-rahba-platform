import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

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

  function normalizeProduct(p) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.title_ar || "",
      price: p.price_mad || 0,
      seller_id: p.seller_id || null,
      seller: p.seller_id || "Souq Rahba",
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

      setReviewMessage("تم إرسال التقييم بنجاح ✅");
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
      <div style={{ display: "grid", gap: "32px" }}>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "24px",
            alignItems: "start"
          }}
        >
          <div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title_ar}
                style={{
                  width: "100%",
                  maxHeight: "420px",
                  objectFit: "cover",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0"
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  minHeight: "320px",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                  display: "grid",
                  placeItems: "center",
                  color: "#94a3b8"
                }}
              >
                No image
              </div>
            )}
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            <div>
              <h1 style={{ marginBottom: "8px", lineHeight: 1.4 }}>
                {product.title_ar}
              </h1>

              <p style={{ color: "#64748b", margin: 0, lineHeight: 1.8 }}>
                {product.description_ar || "بدون وصف مختصر"}
              </p>
            </div>

            <div style={{ fontSize: "28px", fontWeight: "700" }}>
              {product.price_mad} MAD
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                alignItems: "center",
                color: "#475569"
              }}
            >
              <span style={{ color: "#f59e0b", fontWeight: "700" }}>
                ⭐ {ratingSummary.avg || 0}
              </span>
              <span>({ratingSummary.count || 0} تقييم)</span>
              <span>•</span>
              <span>المخزون: {product.stock}</span>
            </div>

            {message ? (
              <div style={infoBoxStyle}>{message}</div>
            ) : null}

            <div style={{ display: "grid", gap: "10px" }}>
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
            </div>
          </div>
        </div>

        <section
          style={{
            background: "linear-gradient(135deg, #0f2f6b 0%, #1d4ed8 45%, #14b8a6 100%)",
            borderRadius: "22px",
            padding: "28px 22px",
            color: "#fff",
            display: "grid",
            gap: "18px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <div
            style={{
              display: "inline-flex",
              width: "fit-content",
              alignItems: "center",
              gap: "8px",
              padding: "6px 12px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontSize: "12px",
              fontWeight: "800"
            }}
          >
            منتج مميز على رحبة
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "30px",
                lineHeight: 1.35,
                fontWeight: "900"
              }}
            >
              اكتشف لماذا يعتبر {product.title_ar} خيارًا ممتازًا
            </h2>

            <p
              style={{
                margin: 0,
                color: "rgba(255,255,255,0.90)",
                lineHeight: 2,
                fontSize: "15px"
              }}
            >
              {product.description_long_ar ||
                product.description_ar ||
                "هذا المنتج مناسب للمستخدمين الذين يبحثون عن جودة، أداء، وسهولة في الاستخدام ضمن تجربة شراء موثوقة داخل منصة رحبة."}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px"
            }}
          >
            <FeatureBadge text="جودة موثوقة" />
            <FeatureBadge text="شراء آمن" />
            <FeatureBadge text="تجربة سلسة" />
            <FeatureBadge text="مناسب للاستخدام اليومي" />
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gap: "18px",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "16px",
            padding: "20px"
          }}
        >
          <div style={{ display: "grid", gap: "6px" }}>
            <h2 style={{ margin: 0 }}>تقييمات المشترين</h2>
            <p style={{ margin: 0, color: "#64748b" }}>
              يمكنك إضافة تقييم وصورة فقط بعد شراء المنتج
            </p>
          </div>

          <form onSubmit={handleSubmitReview} style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={labelStyle}>التقييم</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
                }
                style={inputStyle}
              >
                <option value={5}>5 - ممتاز</option>
                <option value={4}>4 - جيد جدًا</option>
                <option value={3}>3 - جيد</option>
                <option value={2}>2 - مقبول</option>
                <option value={1}>1 - ضعيف</option>
              </select>
            </div>

            <div style={{ display: "grid", gap: "6px" }}>
              <label style={labelStyle}>عنوان التقييم</label>
              <input
                type="text"
                value={reviewForm.title}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="مثلاً: منتج ممتاز"
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: "6px" }}>
              <label style={labelStyle}>التعليق</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                }
                placeholder="اكتب تجربتك مع المنتج"
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gap: "6px" }}>
              <label style={labelStyle}>رابط صورة المراجعة (اختياري)</label>
              <input
                type="url"
                value={reviewForm.review_image_url}
                onChange={(e) =>
                  setReviewForm((prev) => ({ ...prev, review_image_url: e.target.value }))
                }
                placeholder="https://..."
                style={inputStyle}
              />
            </div>

            {reviewMessage ? (
              <div style={infoBoxStyle}>{reviewMessage}</div>
            ) : null}

            <button
              type="submit"
              disabled={submittingReview}
              style={buttonPrimary(submittingReview)}
            >
              {submittingReview ? "جاري إرسال التقييم..." : "إرسال التقييم"}
            </button>
          </form>

          <div style={{ display: "grid", gap: "12px" }}>
            {reviewsLoading ? (
              <p style={{ margin: 0 }}>جاري تحميل التقييمات...</p>
            ) : reviews.length === 0 ? (
              <div
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc"
                }}
              >
                لا توجد تقييمات بعد
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  key={review.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "14px",
                    display: "grid",
                    gap: "8px",
                    background: "#fff"
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "10px",
                      flexWrap: "wrap"
                    }}
                  >
                    <div style={{ color: "#f59e0b", fontWeight: "700" }}>
                      {"★".repeat(review.rating)}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "13px" }}>
                      {review.created_at}
                    </div>
                  </div>

                  {review.buyer_name ? (
                    <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "700" }}>
                      {review.buyer_name}
                    </div>
                  ) : null}

                  {review.title ? (
                    <strong style={{ fontSize: "15px" }}>{review.title}</strong>
                  ) : null}

                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
                    {review.comment}
                  </p>

                  {review.review_image_url ? (
                    <img
                      src={review.review_image_url}
                      alt="صورة المراجعة"
                      style={{
                        width: "120px",
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0"
                      }}
                    />
                  ) : null}
                </article>
              ))
            )}
          </div>
        </div>

        {similar.length > 0 ? (
          <div style={{ display: "grid", gap: "16px" }}>
            <h2 style={{ margin: 0 }}>منتجات مشابهة</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px"
              }}
            >
              {similar.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/products/${p.slug}`)}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "#fff"
                  }}
                >
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title_ar}
                      style={{
                        width: "100%",
                        height: "140px",
                        objectFit: "cover"
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "140px",
                        background: "#f1f5f9",
                        display: "grid",
                        placeItems: "center",
                        color: "#94a3b8"
                      }}
                    >
                      No image
                    </div>
                  )}

                  <div style={{ padding: "10px", display: "grid", gap: "4px" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "#111827",
                        lineHeight: 1.6
                      }}
                    >
                      {p.title_ar}
                    </div>

                    <div style={{ fontSize: "14px", fontWeight: "800", color: "#1f3b73" }}>
                      {p.price_mad} MAD
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function FeatureBadge({ text }) {
  return (
    <span
      style={{
        padding: "8px 12px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.16)",
        fontSize: "13px",
        fontWeight: "700",
        color: "#fff"
      }}
    >
      {text}
    </span>
  );
}

const inputStyle = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  background: "#fff",
  fontFamily: "inherit",
  fontSize: "14px"
};

const labelStyle = {
  fontSize: "14px",
  fontWeight: "700",
  color: "#111827"
};

const infoBoxStyle = {
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  background: "#fff"
};

function buttonPrimary(disabled) {
  return {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: disabled ? "#94a3b8" : "#1f3b73",
    color: "#fff",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.8 : 1
  };
}

function buttonSecondary(disabled) {
  return {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.8 : 1
  };
}
