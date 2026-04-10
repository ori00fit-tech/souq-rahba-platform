import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiGet, apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

function renderStars(value) {
  const rounded = Math.max(0, Math.min(5, Math.round(Number(value || 0))));
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
}

function getApiErrorMessage(result, fallback = "تعذر تحميل المنتج") {
  return result?.error?.message || result?.message || fallback;
}

function isValidReviewImageUrl(value) {
  const raw = String(value || "").trim();
  if (!raw) return true;
  return /^https?:\/\/.+/i.test(raw);
}

function normalizeProductPayload(product) {
  return {
    id: product?.id || "",
    slug: product?.slug || "",
    title_ar: product?.title_ar || "منتج",
    description_ar: product?.description_ar || "",
    description_long_ar: product?.description_long_ar || "",
    landing_html_ar: product?.landing_html_ar || "",
    seller_id: product?.seller_id || null,
    seller_name: product?.seller_name || product?.brand || "RAHBA",
    brand: product?.brand || product?.seller_name || "RAHBA",
    category_slug: product?.category_slug || "",
    price_mad: Number(product?.price_mad || 0),
    stock: Number(product?.stock || 0),
    status: product?.status || "active",
    sku: product?.sku || "",
    rating_avg: Number(product?.rating_avg || 0),
    reviews_count: Number(product?.reviews_count || 0),
    image_url: resolveImageUrl(product?.image_url || ""),
    media: Array.isArray(product?.media)
      ? product.media.map((m) => ({
          id: m?.id || "",
          url: resolveImageUrl(m?.url || m?.image_url || ""),
          image_url: resolveImageUrl(m?.image_url || m?.url || ""),
          media_type: m?.media_type || "image",
          alt_text: m?.alt_text || product?.title_ar || "product"
        }))
      : [],
    specs: Array.isArray(product?.specs)
      ? product.specs.map((row) => ({
          id: row?.id || "",
          label_ar: row?.label_ar || "تفصيل",
          value_ar: row?.value_ar || "—"
        }))
      : [],
    faqs: Array.isArray(product?.faqs)
      ? product.faqs.map((faq) => ({
          id: faq?.id || "",
          question_ar: faq?.question_ar || "سؤال",
          answer_ar: faq?.answer_ar || "—"
        }))
      : []
  };
}

function normalizeReviewPayload(review) {
  return {
    id: review?.id || "",
    rating: Number(review?.rating || 0),
    buyer_name: review?.buyer_name || "",
    title: review?.title || "",
    comment: review?.comment || "",
    created_at: review?.created_at || "",
    review_image_url: resolveImageUrl(review?.review_image_url || "")
  };
}

function normalizeSimilarPayload(product) {
  return {
    id: product?.id || "",
    slug: product?.slug || "",
    title_ar: product?.title_ar || "منتج مشابه",
    description_ar: product?.description_ar || "",
    price_mad: Number(product?.price_mad || 0),
    image_url: resolveImageUrl(product?.image_url || ""),
    stock: Number(product?.stock || 0),
    seller_name: product?.seller_name || "RAHBA"
  };
}

function getStockLabel(stock) {
  if (Number(stock || 0) <= 0) return "غير متوفر حالياً";
  if (Number(stock || 0) <= 3) return "متبقي عدد قليل";
  return "متوفر الآن";
}

function getStockTone(stock) {
  if (Number(stock || 0) <= 0) return "danger";
  if (Number(stock || 0) <= 3) return "warning";
  return "success";
}

function normalizeCategoryLabel(value) {
  const raw = String(value || "").trim();
  if (!raw) return "منتج";
  return raw.replace(/[-_]/g, " ");
}

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, currentUser, authLoading } = useApp();

  const requestIdRef = useRef(0);

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [message, setMessage] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: "",
    comment: "",
    review_image_url: ""
  });

  async function loadProductPage() {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setMessage("");
      setReviewMessage("");

      const result = await apiGet(`/catalog/products/${slug}/full`);

      if (requestId !== requestIdRef.current) return;

      if (!result?.ok || !result?.data?.product) {
        setProduct(null);
        setReviews([]);
        setSimilar([]);
        setMessage(getApiErrorMessage(result, "تعذر تحميل المنتج"));
        return;
      }

      setProduct(normalizeProductPayload(result.data.product));
      setReviews(
        Array.isArray(result.data.reviews)
          ? result.data.reviews.map(normalizeReviewPayload)
          : []
      );
      setSimilar(
        Array.isArray(result.data.similar)
          ? result.data.similar.map(normalizeSimilarPayload)
          : []
      );
    } catch (err) {
      console.error(err);
      if (requestId !== requestIdRef.current) return;
      setProduct(null);
      setReviews([]);
      setSimilar([]);
      setMessage("حدث خطأ أثناء تحميل المنتج");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    if (!slug) {
      setProduct(null);
      setReviews([]);
      setSimilar([]);
      setMessage("رابط المنتج غير صالح");
      setLoading(false);
      return;
    }

    loadProductPage();
  }, [slug]);

  const galleryImages = useMemo(() => {
    const mediaImages = Array.isArray(product?.media)
      ? product.media
          .map((m) => resolveImageUrl(m.url || m.image_url || ""))
          .filter(Boolean)
      : [];

    const reviewImages = reviews
      .map((r) => resolveImageUrl(r.review_image_url || ""))
      .filter(Boolean)
      .slice(0, 4);

    const fallback = product?.image_url ? [resolveImageUrl(product.image_url)] : [];

    return [...new Set([...mediaImages, ...fallback, ...reviewImages])];
  }, [product, reviews]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      setSelectedImage((current) =>
        current && galleryImages.includes(current) ? current : galleryImages[0]
      );
    } else {
      setSelectedImage("");
    }
  }, [galleryImages]);

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

  const quickSpecs = useMemo(
    () => (showAllSpecs ? specs : specs.slice(0, 5)),
    [specs, showAllSpecs]
  );

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
        answer_ar: "يمكنك إضافته إلى السلة أو الضغط على إتمام الطلب للشراء بسرعة."
      },
      {
        question_ar: "هل الدفع عند الاستلام متاح؟",
        answer_ar: "نعم، يمكن إتمام الطلب مع الدفع عند الاستلام حسب توفر الخدمة."
      }
    ];
  }, [product]);

  const previewReviews = useMemo(
    () => (showAllReviews ? reviews : reviews.slice(0, 3)),
    [reviews, showAllReviews]
  );

  function normalizeProductForCart(p) {
    const mediaImage =
      Array.isArray(p?.media) && p.media.length
        ? resolveImageUrl(p.media[0]?.url || p.media[0]?.image_url || "")
        : "";

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
      image_url: resolveImageUrl(p.image_url || mediaImage || "")
    };
  }

  function handleAddToCart() {
    if (!product || product.stock <= 0) return;
    addToCart(normalizeProductForCart(product));
    setMessage("تمت إضافة المنتج إلى السلة");
  }

  function handleGoToCheckout() {
    if (!product || product.stock <= 0) return;
    addToCart(normalizeProductForCart(product));
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

      if (!isValidReviewImageUrl(reviewForm.review_image_url)) {
        setReviewMessage("رابط صورة المراجعة غير صالح");
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

      if (!result?.ok) {
        setReviewMessage(
          result?.error?.message ||
            result?.message ||
            "تعذر إرسال التقييم"
        );
        return;
      }

      setReviewMessage("تم إرسال التقييم بنجاح");
      setReviewForm({
        rating: 5,
        title: "",
        comment: "",
        review_image_url: ""
      });

      await loadProductPage();
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
        <div className="page-stack">
          <div className="loading-state">جاري تحميل المنتج...</div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          {message ? <div className="message-box">{message}</div> : null}
          <div className="empty-state">المنتج غير موجود</div>
          <Link to="/products" className="btn btn-primary full-width">
            الرجوع إلى المنتجات
          </Link>
        </div>
      </section>
    );
  }

  const stockTone = getStockTone(product.stock);

  return (
    <>
      <section className="container section-space" dir="rtl">
        <div className="page-stack">
          <section className="ui-card" style={styles.heroShell}>
            <div style={styles.heroGrid}>
              <div style={styles.galleryCol}>
                <div style={styles.galleryCard}>
                  {selectedImage ? (
                    <img src={selectedImage} alt={product.title_ar} style={styles.mainImage} />
                  ) : (
                    <div style={styles.noImage}>لا توجد صورة</div>
                  )}

                  <div style={styles.galleryBadges}>
                    <span style={styles.badgeNeutral}>{normalizeCategoryLabel(product.category_slug)}</span>
                    {product.stock > 0 ? (
                      <span
                        style={{
                          ...styles.badgeSuccess,
                          ...(stockTone === "warning" ? styles.badgeWarning : {})
                        }}
                      >
                        {getStockLabel(product.stock)}
                      </span>
                    ) : (
                      <span style={styles.badgeDanger}>غير متوفر</span>
                    )}
                  </div>
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
              </div>

              <div style={styles.infoCol}>
                <div style={styles.identityBlock}>
                  <div style={styles.brandRow}>
                    <span className="ui-chip">{product.brand || product.seller_name || "RAHBA"}</span>
                    <span className="ui-chip">{normalizeCategoryLabel(product.category_slug)}</span>
                  </div>

                  <h1 className="page-title" style={styles.productTitle}>
                    {product.title_ar}
                  </h1>

                  <div style={styles.ratingLine}>
                    <span style={styles.stars}>{renderStars(ratingSummary.avg)}</span>
                    <span>{ratingSummary.avg || 0}</span>
                    <span>({ratingSummary.count || 0} تقييم)</span>
                  </div>
                </div>

                <div className="ui-card-soft" style={styles.commerceCard}>
                  <div style={styles.priceRow}>
                    <strong style={styles.priceBox}>{product.price_mad} MAD</strong>
                    <span
                      style={{
                        ...styles.stockPill,
                        ...(stockTone === "success"
                          ? styles.stockSuccess
                          : stockTone === "warning"
                          ? styles.stockWarning
                          : styles.stockDanger)
                      }}
                    >
                      {getStockLabel(product.stock)}
                    </span>
                  </div>

                  <div style={styles.trustList}>
                    <div style={styles.trustItem}>✔ شراء آمن عبر رحبة</div>
                    <div style={styles.trustItem}>🚚 التوصيل متاح حسب المدينة</div>
                    <div style={styles.trustItem}>💵 الدفع عند الاستلام</div>
                    <div style={styles.trustItem}>
                      {product.stock > 0 ? "📦 جاهز للطلب الآن" : "⛔ غير متوفر حالياً"}
                    </div>
                  </div>

                  <p style={styles.shortDesc}>
                    {product.description_ar || "وصف مختصر غير متوفر حالياً"}
                  </p>
                </div>

                <div className="ui-card-soft" style={styles.sellerCard}>
                  <div style={styles.sellerHead}>
                    <div>
                      <div style={styles.sellerLabel}>يباع بواسطة</div>
                      <div style={styles.sellerValue}>{product.seller_name || product.brand || "RAHBA"}</div>
                    </div>

                    <div style={styles.sellerTrustBadge}>بائع داخل رحبة</div>
                  </div>

                  <div style={styles.sellerMetaRow}>
                    <span>⭐ {ratingSummary.avg || 0}</span>
                    <span>•</span>
                    <span>{ratingSummary.count || 0} تقييم</span>
                  </div>

                  <div style={styles.sellerActionRow}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => navigate(`/marketplace/sellers/${product.seller_id || ""}`)}
                      disabled={!product.seller_id}
                    >
                      عرض المتجر
                    </button>

                    <a
                      href="https://wa.me/"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={styles.whatsappBtn}
                    >
                      واتساب
                    </a>
                  </div>
                </div>

                <div style={styles.inlineCtaRow}>
                  <button
                    onClick={handleGoToCheckout}
                    disabled={product.stock <= 0}
                    className="btn btn-primary"
                  >
                    إتمام الطلب الآن
                  </button>

                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="btn btn-secondary"
                  >
                    أضف إلى السلة
                  </button>
                </div>
              </div>
            </div>
          </section>

          {message ? <div className="message-box">{message}</div> : null}

          <section className="ui-card" style={styles.sectionCard}>
            <h2 className="section-title">لماذا تختار هذا المنتج؟</h2>
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
            <div style={styles.sectionHeadRow}>
              <h2 className="section-title">تفاصيل سريعة</h2>
              {specs.length > 5 ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAllSpecs((prev) => !prev)}
                >
                  {showAllSpecs ? "عرض أقل" : "عرض كل التفاصيل"}
                </button>
              ) : null}
            </div>

            <div style={styles.detailsGrid}>
              {quickSpecs.map((row, idx) => (
                <DetailRow
                  key={row.id || `${row.label_ar}-${idx}`}
                  label={row.label_ar}
                  value={row.value_ar}
                />
              ))}
            </div>
          </section>

          <section className="ui-card" style={styles.sectionCard}>
            <h2 className="section-title">معلومات الشراء</h2>
            <div style={styles.reassuranceGrid}>
              <div className="ui-card-soft" style={styles.reassuranceCard}>
                <div style={styles.reassuranceIcon}>🚚</div>
                <div>
                  <div style={styles.reassuranceTitle}>التوصيل</div>
                  <div style={styles.reassuranceText}>التوصيل متاح حسب المدينة والبائع.</div>
                </div>
              </div>

              <div className="ui-card-soft" style={styles.reassuranceCard}>
                <div style={styles.reassuranceIcon}>💵</div>
                <div>
                  <div style={styles.reassuranceTitle}>الدفع</div>
                  <div style={styles.reassuranceText}>الدفع عند الاستلام متاح لهذا الطلب.</div>
                </div>
              </div>

              <div className="ui-card-soft" style={styles.reassuranceCard}>
                <div style={styles.reassuranceIcon}>📞</div>
                <div>
                  <div style={styles.reassuranceTitle}>التواصل</div>
                  <div style={styles.reassuranceText}>يمكنك التواصل مع البائع قبل أو بعد الطلب.</div>
                </div>
              </div>

              <div className="ui-card-soft" style={styles.reassuranceCard}>
                <div style={styles.reassuranceIcon}>🔒</div>
                <div>
                  <div style={styles.reassuranceTitle}>الطلب الآمن</div>
                  <div style={styles.reassuranceText}>يتم تسجيل الطلب ومتابعته داخل رحبة.</div>
                </div>
              </div>
            </div>
          </section>

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
                  <span style={styles.stars}>{renderStars(ratingSummary.avg)}</span>
                  <span>{ratingSummary.avg || 0} من 5</span>
                </div>
                <div style={styles.reviewCount}>{ratingSummary.count || 0} تقييم</div>
              </div>

              <div style={styles.reviewActions}>
                {reviews.length > 3 ? (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowAllReviews((prev) => !prev)}
                  >
                    {showAllReviews ? "عرض أقل" : "عرض كل المراجعات"}
                  </button>
                ) : null}

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReviewForm((prev) => !prev)}
                >
                  {showReviewForm ? "إخفاء نموذج التقييم" : "إضافة تقييم"}
                </button>
              </div>
            </div>

            <div style={styles.reviewsList}>
              {previewReviews.length === 0 ? (
                <div className="empty-state">لا توجد مراجعات بعد</div>
              ) : (
                previewReviews.map((review) => (
                  <article key={review.id} className="ui-card-soft" style={styles.reviewCard}>
                    <div style={styles.reviewCardTop}>
                      <div style={styles.stars}>{renderStars(review.rating)}</div>
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
                        src={resolveImageUrl(review.review_image_url)}
                        alt="صورة المراجعة"
                        style={styles.reviewImage}
                      />
                    ) : null}
                  </article>
                ))
              )}
            </div>

            {showReviewForm ? (
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
            ) : null}
          </section>

          {similar.length > 0 ? (
            <section className="ui-card" style={styles.sectionCard}>
              <h2 className="section-title">منتجات مشابهة</h2>
              <div style={styles.similarGrid}>
                {similar.map((p) => (
                  <div
                    key={p.id}
                    className="ui-card-soft"
                    onClick={() => p.slug && navigate(`/products/${p.slug}`)}
                    style={{ ...styles.similarCard, cursor: p.slug ? "pointer" : "default" }}
                  >
                    {resolveImageUrl(p.image_url) ? (
                      <img
                        src={resolveImageUrl(p.image_url)}
                        alt={p.title_ar}
                        style={styles.similarImage}
                      />
                    ) : (
                      <div style={{ ...styles.similarImage, ...styles.noImage }}>لا توجد صورة</div>
                    )}

                    <div style={styles.similarBody}>
                      <h3 style={styles.similarTitle}>{p.title_ar}</h3>

                      <div style={styles.similarMeta}>
                        <span>{p.seller_name || "RAHBA"}</span>
                        <span>{p.stock > 0 ? "متوفر" : "غير متوفر"}</span>
                      </div>

                      <strong style={styles.similarPrice}>{p.price_mad} MAD</strong>
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
                {getStockLabel(product.stock)}
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
                إتمام الطلب
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
  heroShell: {
    padding: "16px",
    display: "grid",
    gap: "18px"
  },
  heroGrid: {
    display: "grid",
    gap: "18px"
  },
  galleryCol: {
    display: "grid",
    gap: "10px"
  },
  infoCol: {
    display: "grid",
    gap: "12px"
  },
  identityBlock: {
    display: "grid",
    gap: "10px"
  },
  productTitle: {
    margin: 0
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
    position: "relative",
    overflow: "hidden",
    borderRadius: "22px",
    border: "1px solid #e7ddcf",
    background: "#fff"
  },
  galleryBadges: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px"
  },
  badgeNeutral: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid #e5dcc9",
    color: "#475569",
    fontWeight: 800,
    fontSize: "12px"
  },
  badgeSuccess: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(220,252,231,0.95)",
    border: "1px solid #86efac",
    color: "#166534",
    fontWeight: 900,
    fontSize: "12px"
  },
  badgeWarning: {
    background: "rgba(254,243,199,0.95)",
    border: "1px solid #fcd34d",
    color: "#92400e"
  },
  badgeDanger: {
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(254,226,226,0.95)",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontWeight: 900,
    fontSize: "12px"
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
  commerceCard: {
    padding: "16px",
    display: "grid",
    gap: "12px"
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  priceBox: {
    color: "#173b74",
    fontSize: "30px",
    fontWeight: 900,
    lineHeight: 1.1
  },
  stockPill: {
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 900
  },
  stockSuccess: {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #a7f3d0"
  },
  stockWarning: {
    background: "#fffbeb",
    color: "#92400e",
    border: "1px solid #fde68a"
  },
  stockDanger: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca"
  },
  trustList: {
    display: "grid",
    gap: "8px"
  },
  trustItem: {
    color: "#475569",
    fontWeight: 700,
    lineHeight: 1.6
  },
  shortDesc: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.8
  },
  sellerCard: {
    padding: "16px",
    display: "grid",
    gap: "12px"
  },
  sellerHead: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  sellerLabel: {
    color: "#8a8175",
    fontSize: "13px",
    fontWeight: 700,
    marginBottom: "4px"
  },
  sellerValue: {
    color: "#1f2937",
    fontWeight: 900,
    fontSize: "18px"
  },
  sellerTrustBadge: {
    background: "#eef6ff",
    border: "1px solid #cfe0fb",
    color: "#173b74",
    padding: "8px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 900
  },
  sellerMetaRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 700
  },
  sellerActionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  whatsappBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  },
  inlineCtaRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },
  sectionCard: {
    padding: "16px",
    display: "grid",
    gap: "14px"
  },
  sectionHeadRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  },
  reassuranceGrid: {
    display: "grid",
    gap: "10px"
  },
  reassuranceCard: {
    padding: "14px",
    display: "flex",
    gap: "12px",
    alignItems: "flex-start"
  },
  reassuranceIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#173b74",
    display: "grid",
    placeItems: "center",
    fontSize: "16px",
    flexShrink: 0
  },
  reassuranceTitle: {
    color: "#173b74",
    fontWeight: 900,
    marginBottom: "4px"
  },
  reassuranceText: {
    color: "#4b5563",
    lineHeight: 1.8
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
  reviewActions: {
    display: "flex",
    gap: "8px",
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
    gap: "12px",
    paddingTop: "8px"
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
  similarGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
    gap: "12px"
  },
  similarCard: {
    padding: "10px",
    display: "grid",
    gap: "10px"
  },
  similarImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "16px",
    border: "1px solid #e7ddcf",
    background: "#fff"
  },
  similarBody: {
    display: "grid",
    gap: "8px"
  },
  similarTitle: {
    margin: 0,
    color: "#1f2937",
    fontSize: "14px",
    lineHeight: 1.5,
    fontWeight: 900
  },
  similarMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "8px",
    flexWrap: "wrap",
    color: "#6b7280",
    fontSize: "12px",
    fontWeight: 700
  },
  similarPrice: {
    color: "#173b74",
    fontSize: "16px",
    fontWeight: 900
  },
  stickyBarWrap: {
    position: "sticky",
    bottom: 0,
    zIndex: 40,
    paddingBottom: "max(10px, env(safe-area-inset-bottom))",
    background:
      "linear-gradient(180deg, rgba(245,241,232,0) 0%, rgba(245,241,232,0.96) 36%, rgba(245,241,232,1) 100%)"
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
