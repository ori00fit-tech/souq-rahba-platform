import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut, apiUploadFile } from "../lib/api";

function emptyImage() {
  return { url: "", alt_text: "", uploading: false };
}

function emptySpec() {
  return { label_ar: "", value_ar: "" };
}

function emptyFaq() {
  return { question_ar: "", answer_ar: "" };
}

function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/media/")) return `https://api.rahba.site${url}`;
  if (url.startsWith("media/")) return `https://api.rahba.site/${url}`;
  return url;
}

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title_ar: "",
    slug: "",
    description_ar: "",
    description_long_ar: "",
    landing_html_ar: "",
    category_id: "",
    sku: "",
    price_mad: "",
    stock: "",
    status: "active",
    featured: false,
    images: [emptyImage()],
    specs: [emptySpec()],
    faqs: [emptyFaq()]
  });

  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    async function loadCategories() {
      try {
        setCategoriesLoading(true);
        const res = await apiGet("/catalog/categories");
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCategories(list);
      } catch (err) {
        console.error(err);
      } finally {
        setCategoriesLoading(false);
      }
    }

    loadCategories();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await apiGet(`/catalog/products/id/${id}`);
        const data = res?.data || {};

        setForm({
          title_ar: data.title_ar || "",
          slug: data.slug || "",
          description_ar: data.description_ar || "",
          description_long_ar: data.description_long_ar || "",
          landing_html_ar: data.landing_html_ar || "",
          category_id: data.category_id || "",
          sku: data.sku || "",
          price_mad: data.price_mad || "",
          stock: data.stock || "",
          status: data.status || "active",
          featured: Boolean(data.featured),
          images: Array.isArray(data.media) && data.media.length
            ? data.media.map((m) => ({
                url: m.url || m.image_url || "",
                alt_text: m.alt_text || "",
                uploading: false
              }))
            : Array.isArray(data.images) && data.images.length
            ? data.images.map((m) => ({
                url: m.url || m.image_url || "",
                alt_text: m.alt_text || "",
                uploading: false
              }))
            : [emptyImage()],
          specs: Array.isArray(data.specs) && data.specs.length
            ? data.specs.map((x) => ({
                label_ar: x.label_ar || "",
                value_ar: x.value_ar || ""
              }))
            : [emptySpec()],
          faqs: Array.isArray(data.faqs) && data.faqs.length
            ? data.faqs.map((x) => ({
                question_ar: x.question_ar || "",
                answer_ar: x.answer_ar || ""
              }))
            : [emptyFaq()]
        });
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل المنتج");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  const canSubmit = useMemo(() => {
    return (
      form.title_ar.trim() &&
      form.slug.trim() &&
      form.description_ar.trim() &&
      String(form.price_mad).trim() &&
      String(form.stock).trim() &&
      form.category_id.trim()
    );
  }, [form]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateArrayItem(key, index, field, value) {
    setForm((prev) => {
      const next = [...prev[key]];
      next[index] = { ...next[index], [field]: value };
      return { ...prev, [key]: next };
    });
  }

  function addArrayItem(key, factory) {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], factory()] }));
  }

  function removeArrayItem(key, index) {
    setForm((prev) => {
      const next = prev[key].filter((_, i) => i !== index);
      return {
        ...prev,
        [key]: next.length
          ? next
          : [key === "images" ? emptyImage() : key === "specs" ? emptySpec() : emptyFaq()]
      };
    });
  }

  async function handleImageUpload(index, file) {
    if (!file) return;

    try {
      setMessage("");
      updateArrayItem("images", index, "uploading", true);

      const res = await apiUploadFile(file);
      const uploadedUrl = res?.url || res?.data?.url || res?.data?.file_url || "";

      if (!uploadedUrl) {
        throw new Error("لم يتم إرجاع رابط الصورة");
      }

      updateArrayItem("images", index, "url", uploadedUrl);

      if (!form.images[index]?.alt_text) {
        updateArrayItem("images", index, "alt_text", form.title_ar || file.name);
      }

      setMessage("تم رفع الصورة بنجاح");
      setMessageType("success");
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "حدث خطأ أثناء رفع الصورة");
      setMessageType("error");
    } finally {
      updateArrayItem("images", index, "uploading", false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!canSubmit) {
      setMessage("يرجى ملء جميع الحقول الأساسية بما فيها الفئة");
      setMessageType("error");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        title_ar: form.title_ar.trim(),
        slug: form.slug.trim(),
        description_ar: form.description_ar.trim(),
        description_long_ar: form.description_long_ar.trim(),
        landing_html_ar: form.landing_html_ar.trim(),
        category_id: form.category_id.trim(),
        sku: form.sku.trim() || null,
        price_mad: Number(form.price_mad || 0),
        stock: Number(form.stock || 0),
        status: form.status,
        featured: form.featured ? 1 : 0,
        image_url: form.images.find((x) => x.url.trim())?.url || "",
        images: form.images
          .filter((x) => x.url.trim())
          .map(({ url, alt_text }) => ({
            url: url.trim(),
            alt_text: (alt_text || form.title_ar).trim()
          })),
        specs: form.specs
          .filter((x) => x.label_ar.trim() && x.value_ar.trim())
          .map((x) => ({
            label_ar: x.label_ar.trim(),
            value_ar: x.value_ar.trim()
          })),
        faqs: form.faqs
          .filter((x) => x.question_ar.trim() && x.answer_ar.trim())
          .map((x) => ({
            question_ar: x.question_ar.trim(),
            answer_ar: x.answer_ar.trim()
          }))
      };

      const res = await apiPut(`/catalog/products/${id}`, payload);

      if (!res?.ok) {
        setMessage(res?.message || "تعذر تحديث المنتج");
        setMessageType("error");
        return;
      }

      setMessage("تم تحديث المنتج بنجاح");
      setMessageType("success");

      setTimeout(() => {
        navigate("/products");
      }, 800);
    } catch (err) {
      console.error(err);
      setMessage(err?.message || "حدث خطأ أثناء تحديث المنتج");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  const firstImage = resolveImageUrl(form.images[0]?.url || "");

  if (loading) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header">
          <h1>تعديل المنتج</h1>
          <p>جاري تحميل البيانات...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>تعديل المنتج</h1>
        <p>قم بتحديث الصور، الفئة، المواصفات، الوصف الطويل و HTML Landing.</p>
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
                onChange={(e) => updateField("title_ar", e.target.value)}
              />
            </label>

            <label style={s.label}>
              <span>Slug</span>
              <input
                style={s.input}
                dir="ltr"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
              />
            </label>

            <label style={s.label}>
              <span>الوصف المختصر</span>
              <textarea
                style={s.textarea}
                value={form.description_ar}
                onChange={(e) => updateField("description_ar", e.target.value)}
              />
            </label>

            <label style={s.label}>
              <span>الوصف الطويل</span>
              <textarea
                style={s.textarea}
                value={form.description_long_ar}
                onChange={(e) => updateField("description_long_ar", e.target.value)}
              />
            </label>

            <label style={s.label}>
              <span>HTML Landing اختياري</span>
              <textarea
                style={{ ...s.textarea, minHeight: "180px", fontFamily: "monospace" }}
                value={form.landing_html_ar}
                onChange={(e) => updateField("landing_html_ar", e.target.value)}
              />
            </label>

            <div style={s.grid2}>
              <label style={s.label}>
                <span>الفئة</span>
                <select
                  style={s.input}
                  value={form.category_id}
                  onChange={(e) => updateField("category_id", e.target.value)}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "جاري تحميل الفئات..." : "اختر الفئة"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_ar || cat.name || cat.slug}
                    </option>
                  ))}
                </select>
              </label>

              <label style={s.label}>
                <span>SKU</span>
                <input
                  style={s.input}
                  value={form.sku}
                  onChange={(e) => updateField("sku", e.target.value)}
                />
              </label>
            </div>

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
              {form.images.map((img, index) => {
                const previewUrl = resolveImageUrl(img.url);

                return (
                  <div key={index} style={s.imageBlock}>
                    <label style={s.label}>
                      <span>رابط الصورة {index + 1}</span>
                      <input
                        style={s.input}
                        value={img.url}
                        onChange={(e) => updateArrayItem("images", index, "url", e.target.value)}
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
                        onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                      />
                    </label>

                    <label style={s.label}>
                      <span>وصف الصورة</span>
                      <input
                        style={s.input}
                        value={img.alt_text}
                        onChange={(e) => updateArrayItem("images", index, "alt_text", e.target.value)}
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
                      onClick={() => removeArrayItem("images", index)}
                    >
                      حذف
                    </button>
                  </div>
                );
              })}
            </div>

            <button type="button" style={s.dashedButton} onClick={() => addArrayItem("images", emptyImage)}>
              + إضافة صورة
            </button>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>المواصفات</div>

            {form.specs.map((item, index) => (
              <div key={index} style={s.rowBox}>
                <label style={s.label}>
                  <span>الاسم</span>
                  <input
                    style={s.input}
                    value={item.label_ar}
                    onChange={(e) => updateArrayItem("specs", index, "label_ar", e.target.value)}
                  />
                </label>

                <label style={s.label}>
                  <span>القيمة</span>
                  <input
                    style={s.input}
                    value={item.value_ar}
                    onChange={(e) => updateArrayItem("specs", index, "value_ar", e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeArrayItem("specs", index)}
                  style={s.secondaryButton}
                >
                  حذف
                </button>
              </div>
            ))}

            <button type="button" style={s.dashedButton} onClick={() => addArrayItem("specs", emptySpec)}>
              + إضافة مواصفة
            </button>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>الأسئلة الشائعة</div>

            {form.faqs.map((item, index) => (
              <div key={index} style={s.rowBox}>
                <label style={s.label}>
                  <span>السؤال</span>
                  <input
                    style={s.input}
                    value={item.question_ar}
                    onChange={(e) => updateArrayItem("faqs", index, "question_ar", e.target.value)}
                  />
                </label>

                <label style={s.label}>
                  <span>الجواب</span>
                  <textarea
                    style={s.textarea}
                    value={item.answer_ar}
                    onChange={(e) => updateArrayItem("faqs", index, "answer_ar", e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removeArrayItem("faqs", index)}
                  style={s.secondaryButton}
                >
                  حذف
                </button>
              </div>
            ))}

            <button type="button" style={s.dashedButton} onClick={() => addArrayItem("faqs", emptyFaq)}>
              + إضافة سؤال
            </button>
          </div>
        </div>

        <aside style={s.sideCol}>
          <div style={s.card}>
            <div style={s.sectionTitle}>المعاينة</div>

            <div style={s.summaryCard}>
              <div style={s.summaryImageWrap}>
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={form.images[0]?.alt_text || form.title_ar || "preview"}
                    style={s.summaryImage}
                  />
                ) : (
                  <div style={s.summaryNoImage}>No image</div>
                )}
              </div>

              <div style={s.summaryBody}>
                <div style={s.badgeRow}>
                  <span style={s.badge}>{form.status || "active"}</span>
                  {form.featured ? <span style={s.badgeFeatured}>featured</span> : null}
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
                  <div>
                    <strong>الفئة:</strong>{" "}
                    {categories.find((x) => x.id === form.category_id)?.name_ar || form.category_id || "—"}
                  </div>
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
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
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
  rowBox: {
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
