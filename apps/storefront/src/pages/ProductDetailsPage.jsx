import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, currentUser, authLoading } = useApp();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: ""
  });

  useEffect(() => {
    async function loadProductAndReviews() {
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
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
        setReviewsLoading(false);
      }
    }

    loadProductAndReviews();
  }, [slug]);

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

  async function handleBuyNow() {
    if (!product) return;

    try {
      if (authLoading) {
        setMessage("جاري التحقق من الجلسة...");
        return;
      }

      if (!currentUser) {
        setMessage("يجب تسجيل الدخول أولاً قبل إنشاء الطلب");
        navigate("/auth");
        return;
      }

      if (currentUser.role !== "buyer") {
        setMessage("فقط حسابات المشترين يمكنها إنشاء الطلبات");
        return;
      }

      setBuying(true);
      setMessage("");

      const result = await apiPost("/commerce/orders", {
        buyer_user_id: currentUser.id,
        seller_id: product.seller_id,
        payment_method: "cash_on_delivery",
        items: [
          {
            product_id: product.id,
            quantity: 1,
            unit_price_mad: product.price_mad
          }
        ]
      });

      if (result.ok) {
        setMessage(`تم إنشاء الطلب بنجاح. رقم الطلب: ${result.data.id}`);
        setTimeout(() => {
          navigate("/my-orders");
        }, 1000);
      } else {
        setMessage("فشل إنشاء الطلب");
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء إنشاء الطلب");
    } finally {
      setBuying(false);
    }
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
        comment: reviewForm.comment.trim()
      });

      if (!result.ok) {
        setReviewMessage(result.message || "تعذر إرسال التقييم");
        return;
      }

      setReviewMessage("تم إرسال التقييم بنجاح");
      setReviewForm({
        rating: 5,
        title: "",
        comment: ""
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
              <h1 style={{ marginBottom: "8px" }}>{product.title_ar}</h1>
              <p style={{ color: "#64748b", margin: 0, lineHeight: 1.8 }}>
                {product.description_ar || "بدون وصف"}
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
                ⭐ {product.rating_avg || 0}
              </span>
              <span>({product.reviews_count || 0} تقييم)</span>
              <span>•</span>
              <span>المخزون: {product.stock}</span>
            </div>

            {message ? (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  background: "#fff"
                }}
              >
                {message}
              </div>
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

              <button
                onClick={handleBuyNow}
                disabled={buying || product.stock <= 0}
                style={buttonDark(buying || product.stock <= 0)}
              >
                {buying
                  ? "جاري الطلب..."
                  : product.stock <= 0
                  ? "غير متوفر"
                  : "Buy Now مباشر"}
              </button>
            </div>
          </div>
        </div>

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
              شارك تجربتك مع هذا المنتج وساعد المشترين الآخرين
            </p>
          </div>

          <form onSubmit={handleSubmitReview} style={{ display: "grid", gap: "12px" }}>
            <div style={{ display: "grid", gap: "6px" }}>
              <label style={labelStyle}>التقييم</label>
              <select
                value={reviewForm.rating}
                onChange={(e) =>
                  setReviewForm((prev) => ({
                    ...prev,
                    rating: Number(e.target.value)
                  }))
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
                  setReviewForm((prev) => ({
                    ...prev,
                    title: e.target.value
                  }))
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
                  setReviewForm((prev) => ({
                    ...prev,
                    comment: e.target.value
                  }))
                }
                placeholder="اكتب تجربتك مع المنتج"
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
              />
            </div>

            {reviewMessage ? (
              <div
                style={{
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  background: "#fff"
                }}
              >
                {reviewMessage}
              </div>
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

                  {review.title ? (
                    <strong style={{ fontSize: "15px" }}>{review.title}</strong>
                  ) : null}

                  <p style={{ margin: 0, color: "#475569", lineHeight: 1.8 }}>
                    {review.comment}
                  </p>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
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

function buttonDark(disabled) {
  return {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: disabled ? "#94a3b8" : "#111827",
    color: "#fff",
    fontWeight: "700",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.8 : 1
  };
}
