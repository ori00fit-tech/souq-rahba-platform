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
          const firstMedia =
            productRes.data?.media?.[0]?.url || productRes.data?.image_url || "";
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

    const bullets = lines.filter(
      (line) => line.startsWith("-") || line.startsWith("•") || line.startsWith("*")
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
      "شراء آمن داخل رحبة",
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
        question_ar: "هل المنتج متوفر حالياً؟",
        answer_ar: "يمكنك التأكد من التوفر من خلال خانة المخزون الظاهرة أعلى الصفحة."
      },
      {
        question_ar: "كيف أشتري هذا المنتج؟",
        answer_ar: "يمكنك إضافته إلى السلة أو الضغط على Checkout لإتمام الطلب بسرعة."
      }
    ];
  }, [product]);

  function normalizeProduct(p) {
    return {
      id: p.id,
      slug: p.slug,
      name: p.title_ar || "",
      price: Number(p.price_mad || 0),
      seller_id: p.seller_id || null,
      seller: p.seller_name || p.brand || "RAHBA",
      city: "",
      rating: Number(p.rating_avg || 0),
      reviews: Number(p.reviews_count || 0),
      stock: Number(p.stock || 0),
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
      <section className="container section-space" dir="rtl">
        <div className="loading-state">جاري تحميل المنتج...</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="empty-state">المنتج غير موجود</div>
      </section>
    );
  }

  return (
    <>
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <div className="ui-card" style={styles.heroCard}>
            <div style={styles.brandRow}>
              <span className="ui-chip">{product.brand || product.seller_name || "RAHBA"}</span>
              <span className="ui-chip">{product.category_slug || "منتج"}</span>
            </div>

            <h1 className="page-title">{product.title_ar}</h1>

            <div style={styles.ratingLine}>
              <span style={styles.stars}>
                {"★".repeat(Math.round(ratingSummary.avg || 0)) || "☆☆☆☆☆"}
              </span>
              <span>{ratingSummary.avg || 0}</span>
              <span>({ratingSummary.count || 0})</span>
            </div>

            <div style={styles.galleryCard}>
              {selectedImage ? (
                <img src={selectedImage} alt={product.title_ar} style={styles.mainImage} />
              ) : (
                <div style={styles.noImage}>No image</div>
              )}
            </div>

            {galleryImages.length > 1 ? (
              <div style={styles.thumbsRow}>
                {galleryImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    style={{
                      ...styles.thumbBtn,
                      ...(selectedImage === img ? styles.thumbBtnActive : {})
                    }}
                  >
                    <img src={img} alt={`thumb-${idx}`} style={styles.thumbImg} />
                  </button>
                ))}
              </div>
            ) : null}

            <div className="ui-card-soft" style={styles.summaryCard}>
              <div style={styles.summaryTop}>
                <div style={styles.priceBox}>{product.price_mad} MAD</div>
                <div
                  style={{
                    ...styles.stockPill,
                    color: product.stock > 0 ? "#166534" : "#b91c1c"
                  }}
                >
                  {product.stock > 0 ? `متوفر: ${product.stock}` : "غير متوفر حالياً"}
                </div>
              </div>

              <p style={styles.shortDesc}>
                {product.description_ar || "بدون وصف مختصر"}
              </p>

              <div style={styles.sellerBox}>
                <div style={styles.sellerLabel}>البائع</div>
                <div style={styles.sellerValue}>{product.seller_name || product.brand || "RAHBA"}</div>
              </div>
            </div>
          </div>

          {message ? <div className="message-box">{message}</div> : null}

          {product.landing_html_ar ? (
            <section className="ui-card" style={styles.sectionCard}>
              <h2 className="section-title">عرض تفصيلي للمنتج</h2>
              <div
                style={styles.htmlBlock}
                dangerouslySetInnerHTML={{ __html: product.landing_html_ar }}
              />
            </section>
          ) : null}

          <section className="ui-card" style={styles.sectionCard}>
            <h2 className="section-title">أهم المميزات</h2>
            <div style={styles.highlightsGrid}>
              {highlights.map((item, idx) => (
                <div key={`${item}-${idx}`} className="ui-card-soft" style={styles.highlightCard}>
                  <div style={styles.highlightIcon}>✓</div>
                  <div style={styles.highlightText}>{item}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="ui-card" style={styles.sectionCard}>
            <h2 className="section-title">تفاصيل المنتج</h2>
            <div style={styles.detailsGrid}>
              {specs.map((row, idx) => (
                <DetailRow
                  key={row.id || `${row.label_ar}-${idx}`}
                  label={row.label_ar}
                  value={row.value_ar}
                />
              ))}
            </div>
          </section>

          <section className="ui-card" style={styles.sectionCard}>
            <h2 className="section-title">أسئلة شائعة</h2>
            <div style={styles.faqList}>
              {faqs.map((faq, idx) => (
                <div key={faq.id || `${faq.question_ar}-${idx}`} className="ui-card-soft" style={styles.faqItem}>
                  <div style={styles.faqQuestion}>{faq.question_ar}</div>
                  <div style={styles.faqAnswer}>{faq.answer_ar}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="ui-card" style={styles.sectionCard}>
            <div style={styles.reviewHead}>
              <div>
                <h2 className="section-title">مراجعات العملاء</h2>
                <div style={styles.reviewSummary}>
                  <span style={styles.stars}>
                    {"★".repeat(Math.round(ratingSummary.avg || 0)) || "☆☆☆☆☆"}
                  </span>
                  <span>{ratingSummary.avg || 0} من 5</span>
                </div>
                <div style={styles.reviewCount}>{ratingSummary.count || 0} تقييم</div>
              </div>
            </div>

            <form onSubmit={handleSubmitReview} style={styles.reviewForm}>
              <label className="ui-label">
                <span>التقييم</span>
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
              </label>

              <label className="ui-label">
                <span>عنوان المراجعة</span>
                <input
                  type="text"
                  value={reviewForm.title}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="مثلاً: منتج ممتاز"
                  className="ui-input"
                />
              </label>

              <label className="ui-label">
                <span>التعليق</span>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, comment: e.target.value }))
                  }
                  placeholder="اكتب تجربتك بعد الشراء"
                  className="ui-textarea"
                />
              </label>

              <label className="ui-label">
                <span>رابط صورة المراجعة</span>
                <input
                  type="url"
                  value={reviewForm.review_image_url}
                  onChange={(e) =>
                    setReviewForm((prev) => ({ ...prev, review_image_url: e.target.value }))
                  }
                  placeholder="https://..."
                  className="ui-input"
                />
              </label>

              <div className="ui-chip">التقييم متاح بعد شراء المنتج</div>

              {reviewMessage ? <div className="message-box">{reviewMessage}</div> : null}

              <button type="submit" disabled={submittingReview} className="btn btn-secondary full-width">
                {submittingReview ? "جاري إرسال المراجعة..." : "إرسال المراجعة"}
              </button>
            </form>

            <div style={styles.reviewsList}>
              {reviewsLoading ? (
                <div className="loading-state">جاري تحميل المراجعات...</div>
              ) : reviews.length === 0 ? (
                <div className="empty-state">لا توجد مراجعات بعد</div>
              ) : (
                reviews.map((review) => (
                  <article key={review.id} className="ui-card-soft" style={styles.reviewCard}>
                    <div style={styles.reviewCardTop}>
                      <div style={styles.stars}>{"★".repeat(review.rating)}</div>
                      <div style={styles.reviewDate}>{review.created_at}</div>
                    </div>

                    {review.buyer_name ? (
                      <div style={styles.reviewerName}>{review.buyer_name}</div>
                    ) : null}

                    {review.title ? (
                      <strong style={styles.reviewTitle}>{review.title}</strong>
                    ) : null}

                    <p style={styles.reviewText}>{review.comment}</p>

                    {review.review_image_url ? (
                      <img
                        src={review.review_image_url}
                        alt="صورة المراجعة"
                        style={styles.reviewImage}
                      />
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </section>

          {similar.length > 0 ? (
            <section className="ui-card" style={styles.sectionCard}>
              <h2 className="section-title">منتجات مشابهة</h2>
              <div className="product-list">
                {similar.map((p) => (
                  <div
                    key={p.id}
                    className="product-card"
                    onClick={() => navigate(`/products/${p.slug}`)}
                    style={{ cursor: "pointer" }}
                  >
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.title_ar} className="product-card__image" />
                    ) : (
                      <div className="product-card__image" style={styles.noImage}>No image</div>
                    )}

                    <div className="product-card__body">
                      <h3 className="product-card__title">{p.title_ar}</h3>
                      <p className="product-card__desc">
                        {p.description_ar || "منتج مشابه داخل نفس الفئة"}
                      </p>
                      <strong className="product-card__price">{p.price_mad} MAD</strong>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <div style={styles.stickyBarWrap}>
        <div className="container">
          <div style={styles.stickyBar}>
            <div style={styles.stickyPrice}>
              <strong>{product.price_mad} MAD</strong>
              <span style={styles.stickyStock}>
                {product.stock > 0 ? "متوفر" : "غير متوفر"}
              </span>
            </div>

            <div style={styles.stickyActions}>
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn btn-secondary"
              >
                أضف إلى السلة
              </button>

              <button
                onClick={handleGoToCheckout}
                disabled={product.stock <= 0}
                className="btn btn-primary"
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="ui-card-soft" style={styles.detailRow}>
      <div style={styles.detailLabel}>{label}</div>
      <div style={styles.detailValue}>{value}</div>
    </div>
  );
}

const styles = {
  heroCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  brandRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  ratingLine: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
    color: "#6b6156",
    fontWeight: 800
  },
  stars: {
    color: "#f59e0b",
    fontWeight: 900
  },
  galleryCard: {
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid #e7ddcf",
    background: "#fff"
  },
  mainImage: {
    width: "100%",
    height: "360px",
    objectFit: "cover",
    display: "block"
  },
  noImage: {
    display: "grid",
    placeItems: "center",
    color: "#94a3b8"
  },
  thumbsRow: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "4px"
  },
  thumbBtn: {
    minWidth: "78px",
    width: "78px",
    height: "78px",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid #ddd2c2",
    background: "#fff",
    padding: 0,
    cursor: "pointer",
    flexShrink: 0
  },
  thumbBtnActive: {
    border: "2px solid #173b74"
  },
  thumbImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  },
  summaryCard: {
    padding: "14px",
    display: "grid",
    gap: "12px"
  },
  summaryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  priceBox: {
    color: "#173b74",
    fontSize: "28px",
    fontWeight: 900
  },
  stockPill: {
    fontSize: "13px",
    fontWeight: 900
  },
  shortDesc: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.8
  },
  sellerBox: {
    display: "grid",
    gap: "4px"
  },
  sellerLabel: {
    color: "#8a8175",
    fontSize: "13px",
    fontWeight: 700
  },
  sellerValue: {
    color: "#1f2937",
    fontWeight: 900
  },
  sectionCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  htmlBlock: {
    lineHeight: 1.9,
    color: "#374151"
  },
  highlightsGrid: {
    display: "grid",
    gap: "10px"
  },
  highlightCard: {
    padding: "14px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start"
  },
  highlightIcon: {
    width: "28px",
    height: "28px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#173b74",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    flexShrink: 0
  },
  highlightText: {
    color: "#374151",
    lineHeight: 1.8,
    fontWeight: 700
  },
  detailsGrid: {
    display: "grid",
    gap: "10px"
  },
  detailRow: {
    padding: "14px"
  },
  detailLabel: {
    color: "#8a8175",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "6px"
  },
  detailValue: {
    color: "#1f2937",
    fontWeight: 900
  },
  faqList: {
    display: "grid",
    gap: "10px"
  },
  faqItem: {
    padding: "14px"
  },
  faqQuestion: {
    color: "#173b74",
    fontWeight: 900,
    marginBottom: "8px"
  },
  faqAnswer: {
    color: "#4b5563",
    lineHeight: 1.8
  },
  reviewHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  reviewSummary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "6px",
    color: "#6b6156",
    fontWeight: 800
  },
  reviewCount: {
    marginTop: "6px",
    color: "#8a8175",
    fontWeight: 700,
    fontSize: "13px"
  },
  reviewForm: {
    display: "grid",
    gap: "12px"
  },
  reviewsList: {
    display: "grid",
    gap: "10px"
  },
  reviewCard: {
    padding: "14px",
    display: "grid",
    gap: "8px"
  },
  reviewCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  reviewDate: {
    color: "#8a8175",
    fontSize: "13px",
    fontWeight: 700
  },
  reviewerName: {
    color: "#173b74",
    fontWeight: 900
  },
  reviewTitle: {
    color: "#1f2937"
  },
  reviewText: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.8
  },
  reviewImage: {
    width: "100%",
    maxHeight: "280px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #e7ddcf"
  },
  stickyBarWrap: {
    position: "sticky",
    bottom: 0,
    zIndex: 40,
    paddingBottom: "max(10px, env(safe-area-inset-bottom))",
    background: "linear-gradient(180deg, rgba(245,241,232,0) 0%, rgba(245,241,232,0.96) 36%, rgba(245,241,232,1) 100%)"
  },
  stickyBar: {
    marginTop: "10px",
    background: "rgba(255,255,255,0.95)",
    border: "1px solid #e7ddcf",
    borderRadius: "20px",
    boxShadow: "0 12px 30px rgba(23,59,116,0.08)",
    padding: "12px",
    display: "grid",
    gap: "10px"
  },
  stickyPrice: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
    color: "#173b74",
    fontSize: "20px"
  },
  stickyStock: {
    color: "#6b6156",
    fontSize: "13px",
    fontWeight: 800
  },
  stickyActions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  }
};
