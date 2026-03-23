import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiUploadFile } from "@rahba/shared";

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AddProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title_ar: "",
    slug: "",
    description_ar: "",
    price_mad: "",
    stock: "",
    status: "active",
    featured: false
  });

  const [images, setImages] = useState([
    {
      image_url: "",
      alt_text: "",
      uploading: false
    }
  ]);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [saving, setSaving] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.title_ar.trim() &&
      form.slug.trim() &&
      form.description_ar.trim() &&
      String(form.price_mad).trim() &&
      String(form.stock).trim()
    );
  }, [form]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateImage(index, patch) {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, ...patch } : img))
    );
  }

  function addImageBlock() {
    setImages((prev) => [
      ...prev,
      { image_url: "", alt_text: "", uploading: false }
    ]);
  }

  function removeImageBlock(index) {
    setImages((prev) => {
      if (prev.length === 1) {
        return [{ image_url: "", alt_text: "", uploading: false }];
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleUpload(index, file) {
    if (!file) return;

    try {
      updateImage(index, { uploading: true });
      setMessage("");

      const res = await apiUploadFile(file);

      const uploadedUrl =
        res?.data?.url || res?.url || res?.data?.file_url || "";

      if (!uploadedUrl) {
        throw new Error("لم يتم إرجاع رابط الصورة");
      }

      updateImage(index, {
        image_url: uploadedUrl,
        uploading: false
      });

      setMessageType("success");
      setMessage("تم رفع الصورة بنجاح");
    } catch (err) {
      console.error(err);
      updateImage(index, { uploading: false });
      setMessageType("error");
      setMessage(err?.message || "فشل رفع الصورة");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      setMessageType("error");
      setMessage("يرجى ملء جميع الحقول الأساسية");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const validImages = images.filter(
        (img) => img.image_url && img.image_url.trim()
      );

      const payload = {
        title_ar: form.title_ar.trim(),
        slug: form.slug.trim(),
        description_ar: form.description_ar.trim(),
        price_mad: Number(form.price_mad),
        stock: Number(form.stock),
        status: form.status,
        featured: form.featured ? 1 : 0,
        image_url: validImages[0]?.image_url || "",
        images: validImages.map((img) => ({
          url: img.image_url.trim(),
          alt_text: img.alt_text?.trim() || form.title_ar.trim()
        }))
      };

      const res = await apiPost("/catalog/products", payload);

      if (!res?.ok) {
        setMessageType("error");
        setMessage(res?.message || "تعذر إضافة المنتج");
        return;
      }

      setMessageType("success");
      setMessage("تمت إضافة المنتج بنجاح");

      setTimeout(() => {
        navigate("/products");
      }, 900);
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage(err?.message || "حدث خطأ أثناء إضافة المنتج");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>إضافة منتج جديد</h1>
        <p>أضف منتجاً جديداً إلى متجرك مع الصور والمعلومات الأساسية</p>
      </div>

      {message ? (
        <div
          style={{
            ...s.message,
            ...(messageType === "success" ? s.messageSuccess : s.messageError)
          }}
        >
          {message}
        </div>
      ) : null}

      <form style={s.layout} onSubmit={handleSubmit}>
        <div style={s.mainCol}>
          <div style={s.card}>
            <div style={s.sectionTitle}>المعلومات الأساسية</div>

            <label style={s.label}>
              <span>اسم المنتج</span>
              <input
                style={s.input}
                value={form.title_ar}
                onChange={(e) => {
                  const title = e.target.value;
                  updateField("title_ar", title);
                  if (!form.slug.trim()) {
                    updateField("slug", slugify(title));
                  }
                }}
                placeholder="مثلاً: ساعة ذكية Fit Max S2"
              />
            </label>

            <label style={s.label}>
              <span>Slug</span>
              <input
                style={s.input}
                dir="ltr"
                value={form.slug}
                onChange={(e) => updateField("slug", slugify(e.target.value))}
                placeholder="smart-watch-fit-max-s2"
              />
            </label>

            <label style={s.label}>
              <span>وصف المنتج</span>
              <textarea
                style={s.textarea}
                value={form.description_ar}
                onChange={(e) => updateField("description_ar", e.target.value)}
                placeholder="اكتب وصفاً مختصراً وواضحاً للمنتج..."
              />
            </label>

            <div style={s.grid2}>
              <label style={s.label}>
                <span>السعر (MAD)</span>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  step="1"
                  value={form.price_mad}
                  onChange={(e) => updateField("price_mad", e.target.value)}
                  placeholder="349"
                />
              </label>

              <label style={s.label}>
                <span>المخزون</span>
                <input
                  style={s.input}
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  placeholder="10"
                />
              </label>
            </div>

            <div style={s.grid2}>
              <label style={s.label}>
                <span>الحالة</span>
                <select
                  style={s.input}
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                >
                  <option value="active">active</option>
                  <option value="draft">draft</option>
                  <option value="archived">archived</option>
                </select>
              </label>

              <label style={{ ...s.label, justifyContent: "end" }}>
                <span>منتج مميز Featured</span>
                <div style={s.checkboxRow}>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => updateField("featured", e.target.checked)}
                  />
                </div>
              </label>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>صور المنتج</div>

            <div style={s.imageStack}>
              {images.map((img, index) => {
                const previewUrl = resolveImageUrl(img.image_url);

                return (
                  <div key={index} style={s.imageBlock}>
                    <label style={s.label}>
                      <span>رابط الصورة {index + 1}</span>
                      <input
                        style={s.input}
                        value={img.image_url}
                        onChange={(e) =>
                          updateImage(index, { image_url: e.target.value })
                        }
                        placeholder="https://... أو /media/..."
                        dir="ltr"
                      />
                    </label>

                    <label style={s.label}>
                      <span>رفع صورة من الجهاز</span>
                      <input
                        style={s.input}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleUpload(index, e.target.files?.[0])}
                      />
                    </label>

                    <label style={s.label}>
                      <span>وصف الصورة</span>
                      <input
                        style={s.input}
                        value={img.alt_text}
                        onChange={(e) =>
                          updateImage(index, { alt_text: e.target.value })
                        }
                        placeholder="مثلاً: ساعة ذكية Fit Max S2"
                      />
                    </label>

                    <div style={s.previewBox}>
                      {img.uploading ? (
                        <div style={s.previewPlaceholder}>جاري رفع الصورة...</div>
                      ) : previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={img.alt_text || form.title_ar || "preview"}
                          style={s.previewImage}
                        />
                      ) : (
                        <div style={s.previewPlaceholder}>preview</div>
                      )}
                    </div>

                    <button
                      type="button"
                      style={s.secondaryButton}
                      onClick={() => removeImageBlock(index)}
                    >
                      حذف
                    </button>
                  </div>
                );
              })}
            </div>

            <button type="button" style={s.dashedButton} onClick={addImageBlock}>
              + إضافة صورة
            </button>
          </div>
        </div>

        <aside style={s.sideCol}>
          <div style={s.card}>
            <div style={s.sectionTitle}>المعاينة</div>

            <div style={s.summaryCard}>
              <div style={s.summaryImageWrap}>
                {resolveImageUrl(images[0]?.image_url) ? (
                  <img
                    src={resolveImageUrl(images[0]?.image_url)}
                    alt={images[0]?.alt_text || form.title_ar || "preview"}
                    style={s.summaryImage}
                  />
                ) : (
                  <div style={s.summaryNoImage}>No image</div>
                )}
              </div>

              <div style={s.summaryBody}>
                <div style={s.badgeRow}>
                  <span style={s.badge}>{form.status || "active"}</span>
                  {form.featured ? (
                    <span style={s.badgeFeatured}>featured</span>
                  ) : null}
                </div>

                <h3 style={s.summaryTitle}>
                  {form.title_ar || "اسم المنتج سيظهر هنا"}
                </h3>

                <p style={s.summaryText}>
                  {form.description_ar || "وصف المنتج سيظهر هنا."}
                </p>

                <div style={s.summaryMeta}>
                  <div><strong>السعر:</strong> {form.price_mad || 0} MAD</div>
                  <div><strong>المخزون:</strong> {form.stock || 0}</div>
                  <div><strong>Slug:</strong> {form.slug || "—"}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={s.card}>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              style={{
                ...s.primaryButton,
                opacity: !canSubmit || saving ? 0.7 : 1
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ المنتج"}
            </button>
          </div>
        </aside>
      </form>
    </section>
  );
}

const s = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "16px"
  },
  mainCol: {
    display: "grid",
    gap: "16px"
  },
  sideCol: {
    display: "grid",
    gap: "16px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "grid",
    gap: "16px"
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: "18px",
    color: "#0f172a"
  },
  label: {
    display: "grid",
    gap: "8px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827"
  },
  input: {
    width: "100%",
    minHeight: "52px",
    borderRadius: "14px",
    border: "1px solid #d9dde5",
    background: "#fff",
    padding: "0 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    borderRadius: "14px",
    border: "1px solid #d9dde5",
    background: "#fff",
    padding: "12px 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical"
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px"
  },
  checkboxRow: {
    minHeight: "52px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  imageStack: {
    display: "grid",
    gap: "16px"
  },
  imageBlock: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "12px",
    background: "#fafafa"
  },
  previewBox: {
    width: "100%",
    minHeight: "180px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  previewImage: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    display: "block"
  },
  previewPlaceholder: {
    color: "#64748b",
    fontWeight: "700"
  },
  secondaryButton: {
    minHeight: "48px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer"
  },
  dashedButton: {
    minHeight: "54px",
    borderRadius: "14px",
    border: "2px dashed #cbd5e1",
    background: "#fff",
    color: "#111827",
    fontSize: "18px",
    fontWeight: "900",
    cursor: "pointer"
  },
  primaryButton: {
    minHeight: "56px",
    borderRadius: "16px",
    border: "none",
    background: "linear-gradient(135deg, #173b74 0%, #14967f 100%)",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "900",
    cursor: "pointer"
  },
  summaryCard: {
    overflow: "hidden",
    borderRadius: "18px",
    border: "1px solid #e2e8f0",
    background: "#fff"
  },
  summaryImageWrap: {
    width: "100%",
    height: "220px",
    background: "#eef2f7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  summaryImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block"
  },
  summaryNoImage: {
    color: "#94a3b8",
    fontSize: "18px",
    fontWeight: "700"
  },
  summaryBody: {
    padding: "16px",
    display: "grid",
    gap: "12px"
  },
  badgeRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    fontWeight: "800",
    fontSize: "14px"
  },
  badgeFeatured: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "34px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "#fff7ed",
    color: "#c2410c",
    border: "1px solid #fdba74",
    fontWeight: "800",
    fontSize: "14px"
  },
  summaryTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: 1.4
  },
  summaryText: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.9,
    fontSize: "16px"
  },
  summaryMeta: {
    display: "grid",
    gap: "8px",
    color: "#111827",
    fontSize: "16px"
  },
  message: {
    borderRadius: "14px",
    padding: "12px 14px",
    marginBottom: "16px",
    fontSize: "14px",
    fontWeight: "700"
  },
  messageSuccess: {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0"
  },
  messageError: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca"
  }
};
