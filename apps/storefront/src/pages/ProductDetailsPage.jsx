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
  const [selectedImage, setSelectedImage] = useState("");

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
          const firstMedia = productRes.data?.media?.[0]?.url || productRes.data?.image_url || "";
          setSelectedImage(firstMedia);
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

  const galleryImages = useMemo(() => {
    const mediaImages = Array.isArray(product?.media)
      ? product.media.map((m) => m.url).filter(Boolean)
      : [];

    const reviewImages = reviews
      .map((r) => r.review_image_url)
      .filter(Boolean)
      .slice(0, 4);

    const fallback = product?.image_url ? [product.image_url] : [];

    return [...new Set([...mediaImages, ...fallback, ...reviewImages])];
  }, [product, reviews]);

  const highlights = useMemo(() => {
    const source = product?.description_long_ar || product?.description_ar || "";
    const lines = source
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    const bullets = lines.filter((line) =>
      line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
    );

    if (bullets.length) {
      return bullets.map((line) => line.replace(/^[-•*]\s*/, "")).slice(0, 6);
    }

    const parts = source
      .split(/[.،]/)
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 6);

    if (parts.length) return parts;

    return [
      "جودة موثوقة للاستخدام اليومي",
      "تصميم عملي ومريح",
      "تجربة شراء آمنة داخل رحبة",
      "قيمة جيدة مقابل السعر"
    ];
  }, [product]);

  const specs = useMemo(() => {
    if (Array.isArray(product?.specs) && product.specs.length > 0) {
      return product.specs;
    }

    return [
      { label_ar: "العلامة", value_ar: product?.brand || product?.seller_name || "RAHBA" },
      { label_ar: "السعر", value_ar: `${product?.price_mad || 0} MAD` },
      { label_ar: "الحالة", value_ar: product?.status || "active" },
      { label_ar: "المخزون", value_ar: String(product?.stock || 0) },
      { label_ar: "SKU", value_ar: product?.sku || "—" }
    ];
  }, [product]);

  const faqs = useMemo(() => {
    if (Array.isArray(product?.faqs) && product.faqs.length > 0) {
      return product.faqs;
    }

    return [
      {
        question_ar: "هل المنتج مناسب للاستعمال اليومي؟",
        answer_ar: "نعم، تم تقديم هذا المنتج داخل المنصة ليكون مناسبًا للاستعمال العملي واليومي."
      },
      {
        question_ar: "هل يمكن الشراء مباشرة عبر Checkout؟",
        answer_ar: "نعم، يمكنك إضافته إلى السلة ثم إتمام الطلب عبر صفحة Checkout."
      }
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
    <section className="container section-space product-page" dir="rtl">
      <div className="product-hero-card">
        <div className="product-hero-grid">
          <div className="product-gallery">
            <div className="product-brand-line">
              {product.brand || product.seller_name || "RAHBA"}
            </div>

            <h1 className="product-title-main">{product.title_ar}</h1>

            <div className="product-rating-line">
              <span className="product-stars">
                {"★".repeat(Math.round(ratingSummary.avg || 0)) || "☆☆☆☆☆"}
              </span>
              <span>{ratingSummary.avg || 0}</span>
              <span>({ratingSummary.count || 0})</span>
            </div>

            <div className="product-main-image-card">
              {selectedImage ? (
                <img src={selectedImage} alt={product.title_ar} className="product-main-image" />
              ) : (
                <div className="product-no-image">No image</div>
              )}
            </div>

            {galleryImages.length > 1 ? (
              <div className="product-thumbs-row">
                {galleryImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    className={`product-thumb-btn ${selectedImage === img ? "is-active" : ""}`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="product-thumb-img" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <aside className="product-buy-card">
            <div className="product-price-main">{product.price_mad} MAD</div>

            <div className={`product-stock ${product.stock > 0 ? "in-stock" : "out-stock"}`}>
              {product.stock > 0 ? `متوفر في المخزون: ${product.stock}` : "غير متوفر حالياً"}
            </div>

            <p className="product-short-desc">
              {product.description_ar || "بدون وصف مختصر"}
            </p>

            <div className="product-buy-actions">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn btn-primary full-width"
              >
                {product.stock <= 0 ? "غير متوفر" : "أضف إلى السلة"}
              </button>

              <button
                onClick={handleGoToCheckout}
                disabled={product.stock <= 0}
                className="btn btn-secondary full-width"
              >
                اشتر الآن عبر Checkout
              </button>
            </div>

            {message ? <div className="product-info-box">{message}</div> : null}
          </aside>
        </div>
      </div>

      {product.landing_html_ar ? (
        <section className="product-section-card">
          <h2 className="product-section-title">عرض تفصيلي للمنتج</h2>
          <div
            className="product-html-landing"
            dangerouslySetInnerHTML={{ __html: product.landing_html_ar }}
          />
        </section>
      ) : null}

      <section className="product-section-card manufacturer-block">
        <div className="manufacturer-badge">منتج مميز</div>
        <div className="manufacturer-small">جودة موثوقة داخل رحبة</div>
        <h2 className="manufacturer-title">عرض أغنى للمحتوى والمواصفات والصور</h2>
        <p className="manufacturer-text">
          {product.description_long_ar ||
            product.description_ar ||
            "هذا المنتج مناسب للمستخدمين الذين يبحثون عن تجربة عملية، وصف واضح، وصور أكثر قبل الشراء."}
        </p>

        <div className="manufacturer-stats">
          <HeroStat label="التقييم" value={`${ratingSummary.avg || 0} / 5`} />
          <HeroStat label="المراجعات" value={`${ratingSummary.count || 0}`} />
          <HeroStat label="المخزون" value={`${product.stock || 0}`} />
        </div>
      </section>

      <section className="product-section-card">
        <h2 className="product-section-title">أهم المميزات</h2>
        <div className="product-highlight-grid">
          {highlights.map((item, idx) => (
            <div key={`${item}-${idx}`} className="product-highlight-card">
              <div className="product-highlight-icon">✓</div>
              <div className="product-highlight-text">{item}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="product-section-card">
        <h2 className="product-section-title">تفاصيل المنتج</h2>
        <div className="product-details-grid">
          {specs.map((row, idx) => (
            <DetailRow
              key={row.id || `${row.label_ar}-${idx}`}
              label={row.label_ar}
              value={row.value_ar}
            />
          ))}
        </div>
      </section>

      <section className="product-section-card">
        <h2 className="product-section-title">أسئلة شائعة</h2>
        <div className="product-faq-list">
          {faqs.map((faq, idx) => (
            <div key={faq.id || `${faq.question_ar}-${idx}`} className="product-faq-item">
              <div className="product-faq-question">{faq.question_ar}</div>
              <div className="product-faq-answer">{faq.answer_ar}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="product-section-card">
        <div className="product-review-head">
          <div>
            <h2 className="product-section-title">مراجعات العملاء</h2>
            <div className="product-review-summary">
              <span className="product-review-stars">
                {"★".repeat(Math.round(ratingSummary.avg || 0)) || "☆☆☆☆☆"}
              </span>
              <span>{ratingSummary.avg || 0} من 5</span>
            </div>
            <div className="product-review-count">{ratingSummary.count || 0} تقييم</div>
          </div>
        </div>

        <form onSubmit={handleSubmitReview} className="product-review-form">
          <div className="product-form-group">
            <label>التقييم</label>
            <select
              value={reviewForm.rating}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, rating: Number(e.target.value) }))
              }
              className="ui-select"
            >
              <option value={5}>5 - ممتاز</option>
              <option value={4}>4 - جيد جدًا</option>
              <option value={3}>3 - جيد</option>
              <option value={2}>2 - مقبول</option>
              <option value={1}>1 - ضعيف</option>
            </select>
          </div>

          <div className="product-form-group">
            <label>عنوان المراجعة</label>
            <input
              type="text"
              value={reviewForm.title}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="مثلاً: منتج ممتاز"
              className="ui-input"
            />
          </div>

          <div className="product-form-group">
            <label>التعليق</label>
            <textarea
              value={reviewForm.comment}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
              }
              placeholder="اكتب تجربتك بعد الشراء"
              className="ui-textarea"
            />
          </div>

          <div className="product-form-group">
            <label>رابط صورة المراجعة</label>
            <input
              type="url"
              value={reviewForm.review_image_url}
              onChange={(e) =>
                setReviewForm((prev) => ({ ...prev, review_image_url: e.target.value }))
              }
              placeholder="https://..."
              className="ui-input"
            />
          </div>

          <div className="product-review-hint">
            التقييم وإرفاق الصورة متاحان فقط بعد شراء المنتج.
          </div>

          {reviewMessage ? <div className="product-info-box">{reviewMessage}</div> : null}

          <button
            type="submit"
            disabled={submittingReview}
            className="btn btn-secondary"
          >
            {submittingReview ? "جاري إرسال المراجعة..." : "إرسال المراجعة"}
          </button>
        </form>

        <div className="product-reviews-list">
          {reviewsLoading ? (
            <p className="ui-muted">جاري تحميل المراجعات...</p>
          ) : reviews.length === 0 ? (
            <div className="ui-empty">لا توجد مراجعات بعد</div>
          ) : (
            reviews.map((review) => (
              <article key={review.id} className="product-review-card">
                <div className="product-review-card-top">
                  <div className="product-review-card-stars">
                    {"★".repeat(review.rating)}
                  </div>
                  <div className="ui-muted">{review.created_at}</div>
                </div>

                {review.buyer_name ? (
                  <div className="product-reviewer-name">{review.buyer_name}</div>
                ) : null}

                {review.title ? (
                  <strong className="product-review-title">{review.title}</strong>
                ) : null}

                <p className="product-review-text">{review.comment}</p>

                {review.review_image_url ? (
                  <img
                    src={review.review_image_url}
                    alt="صورة المراجعة"
                    className="product-review-image"
                  />
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>

      {similar.length > 0 ? (
        <section className="product-section-card">
          <h2 className="product-section-title">منتجات مشابهة</h2>
          <div className="product-similar-grid">
            {similar.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/products/${p.slug}`)}
                className="product-similar-card"
              >
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title_ar} className="product-similar-image" />
                ) : (
                  <div className="product-similar-noimage">No image</div>
                )}

                <div className="product-similar-body">
                  <div className="product-similar-title">{p.title_ar}</div>
                  <div className="product-similar-desc">
                    {p.description_ar || "منتج مشابه داخل نفس الفئة"}
                  </div>
                  <div className="product-similar-price">{p.price_mad} MAD</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}

function HeroStat({ label, value }) {
  return (
    <div className="manufacturer-stat-card">
      <div className="manufacturer-stat-value">{value}</div>
      <div className="manufacturer-stat-label">{label}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="product-detail-row">
      <div className="product-detail-label">{label}</div>
      <div className="product-detail-value">{value}</div>
    </div>
  );
}
