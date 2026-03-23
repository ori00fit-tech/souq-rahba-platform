import { resolveImageUrl } from "../lib/media";
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
    featured: false,
    images: [emptyImage()],
    specs: [emptySpec()],
    faqs: [emptyFaq()]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiGet(`/catalog/products/id/${id}`);
        const data = res.data || {};

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
          featured: Boolean(data.featured),
          images: data.media?.length
            ? data.media.map((m) => ({
                url: m.url || "",
                alt_text: m.alt_text || "",
                uploading: false
              }))
            : [emptyImage()],
          specs: data.specs?.length
            ? data.specs.map((s) => ({
                label_ar: s.label_ar || "",
                value_ar: s.value_ar || ""
              }))
            : [emptySpec()],
          faqs: data.faqs?.length
            ? data.faqs.map((f) => ({
                question_ar: f.question_ar || "",
                answer_ar: f.answer_ar || ""
              }))
            : [emptyFaq()]
        });
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل المنتج");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  const canSubmit = useMemo(() => {
    return form.title_ar.trim() && String(form.price_mad).trim();
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
        [key]: next.length ? next : [key === "images" ? emptyImage() : key === "specs" ? emptySpec() : emptyFaq()]
      };
    });
  }

  async function handleImageUpload(index, file) {
    if (!file) return;

    try {
      setMessage("");
      updateArrayItem("images", index, "uploading", true);

      const res = await apiUploadFile(file);

      if (!res?.url) {
        setMessage("تعذر رفع الصورة");
        return;
      }

      updateArrayItem("images", index, "url", res.url);

      if (!form.images[index]?.alt_text) {
        updateArrayItem("images", index, "alt_text", form.title_ar || file.name);
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء رفع الصورة");
    } finally {
      updateArrayItem("images", index, "uploading", false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        title_ar: form.title_ar.trim(),
        slug: form.slug.trim(),
        description_ar: form.description_ar.trim(),
        description_long_ar: form.description_long_ar.trim(),
        landing_html_ar: form.landing_html_ar.trim(),
        category_id: form.category_id.trim() || null,
        sku: form.sku.trim() || null,
        price_mad: Number(form.price_mad || 0),
        stock: Number(form.stock || 0),
        featured: form.featured,
        images: form.images
          .filter((x) => x.url.trim())
          .map(({ url, alt_text }) => ({ url, alt_text })),
        specs: form.specs.filter((x) => x.label_ar.trim() && x.value_ar.trim()),
        faqs: form.faqs.filter((x) => x.question_ar.trim() && x.answer_ar.trim())
      };

      await apiPut(`/catalog/products/${id}`, payload);

      setMessage("تم تحديث المنتج بنجاح");
      setTimeout(() => navigate("/products"), 800);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className="page-shell"><p>جاري تحميل المنتج...</p></section>;
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>تعديل المنتج</h1>
        <p>قم بتحديث الصور، المواصفات، الوصف الطويل و HTML Landing.</p>
      </div>

      <form onSubmit={handleSubmit} style={s.form}>
        <Card title="المعلومات الأساسية">
          <Input label="اسم المنتج" value={form.title_ar} onChange={(v) => updateField("title_ar", v)} />
          <Input label="Slug" value={form.slug} onChange={(v) => updateField("slug", v)} />
          <Input label="الوصف المختصر" value={form.description_ar} onChange={(v) => updateField("description_ar", v)} />
          <Textarea label="الوصف الطويل" value={form.description_long_ar} onChange={(v) => updateField("description_long_ar", v)} />
          <Textarea label="HTML Landing اختياري" value={form.landing_html_ar} onChange={(v) => updateField("landing_html_ar", v)} />
          <Input label="الفئة category_id" value={form.category_id} onChange={(v) => updateField("category_id", v)} />
          <Input label="SKU" value={form.sku} onChange={(v) => updateField("sku", v)} />
          <Input label="السعر MAD" value={form.price_mad} onChange={(v) => updateField("price_mad", v)} type="number" />
          <Input label="المخزون" value={form.stock} onChange={(v) => updateField("stock", v)} type="number" />
          <label style={s.checkboxRow}>
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => updateField("featured", e.target.checked)}
            />
            <span>منتج مميز Featured</span>
          </label>
        </Card>

        <Card title="صور المنتج">
          {form.images.map((item, index) => (
            <div key={index} style={s.rowBox}>
              <Input
                label={`رابط الصورة ${index + 1}`}
                value={item.url}
                onChange={(v) => updateArrayItem("images", index, "url", v)}
              />

              <label style={s.field}>
                <span style={s.label}>رفع صورة من الجهاز</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(index, e.target.files?.[0])}
                  style={s.input}
                />
              </label>

              {item.uploading ? (
                <div style={s.uploadInfo}>جاري رفع الصورة...</div>
              ) : null}

              {item.url ? (
                <img src={item.url} alt="preview" style={s.previewImage} />
              ) : null}

              <Input
                label="وصف الصورة"
                value={item.alt_text}
                onChange={(v) => updateArrayItem("images", index, "alt_text", v)}
              />

              <button type="button" onClick={() => removeArrayItem("images", index)} style={s.smallBtn}>
                حذف
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addArrayItem("images", emptyImage)} style={s.addBtn}>
            + إضافة صورة
          </button>
        </Card>

        <Card title="المواصفات">
          {form.specs.map((item, index) => (
            <div key={index} style={s.rowBox}>
              <Input label="الاسم" value={item.label_ar} onChange={(v) => updateArrayItem("specs", index, "label_ar", v)} />
              <Input label="القيمة" value={item.value_ar} onChange={(v) => updateArrayItem("specs", index, "value_ar", v)} />
              <button type="button" onClick={() => removeArrayItem("specs", index)} style={s.smallBtn}>
                حذف
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addArrayItem("specs", emptySpec)} style={s.addBtn}>
            + إضافة مواصفة
          </button>
        </Card>

        <Card title="الأسئلة الشائعة">
          {form.faqs.map((item, index) => (
            <div key={index} style={s.rowBox}>
              <Input label="السؤال" value={item.question_ar} onChange={(v) => updateArrayItem("faqs", index, "question_ar", v)} />
              <Textarea label="الجواب" value={item.answer_ar} onChange={(v) => updateArrayItem("faqs", index, "answer_ar", v)} />
              <button type="button" onClick={() => removeArrayItem("faqs", index)} style={s.smallBtn}>
                حذف
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addArrayItem("faqs", emptyFaq)} style={s.addBtn}>
            + إضافة سؤال
          </button>
        </Card>

        {message ? <div style={s.message}>{message}</div> : null}

        <button type="submit" disabled={!canSubmit || saving} style={s.submitBtn}>
          {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
        </button>
      </form>
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div style={s.card}>
      <h3 style={s.cardTitle}>{title}</h3>
      <div style={s.cardBody}>{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={s.input} />
    </label>
  );
}

function Textarea({ label, value, onChange }) {
  return (
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} style={s.textarea} />
    </label>
  );
}

const s = {
  form: { display: "grid", gap: "18px" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "18px", padding: "18px" },
  cardTitle: { margin: "0 0 14px", fontSize: "18px", fontWeight: 800 },
  cardBody: { display: "grid", gap: "14px" },
  field: { display: "grid", gap: "6px" },
  label: { fontWeight: 700, fontSize: "14px" },
  input: { padding: "12px", borderRadius: "12px", border: "1px solid #d1d5db" },
  textarea: { padding: "12px", borderRadius: "12px", border: "1px solid #d1d5db", minHeight: "120px", resize: "vertical" },
  checkboxRow: { display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 },
  rowBox: { border: "1px solid #e5e7eb", borderRadius: "14px", padding: "12px", display: "grid", gap: "10px", background: "#f8fafc" },
  smallBtn: { padding: "10px 12px", borderRadius: "10px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer" },
  addBtn: { padding: "12px 14px", borderRadius: "12px", border: "1px dashed #94a3b8", background: "#fff", cursor: "pointer", fontWeight: 700 },
  submitBtn: { padding: "14px 18px", borderRadius: "14px", border: "none", background: "#1f3b73", color: "#fff", fontWeight: 800, cursor: "pointer" },
  message: { padding: "12px", borderRadius: "12px", background: "#fff", border: "1px solid #e5e7eb" },
  uploadInfo: { fontSize: "13px", color: "#1d4ed8", fontWeight: 700 },
  previewImage: { width: "120px", borderRadius: "10px", border: "1px solid #e5e7eb" }
};
