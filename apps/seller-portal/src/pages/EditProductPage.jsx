import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPut, apiUpload } from "../lib/api";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title_ar: "",
    description_ar: "",
    price_mad: "",
    stock: "",
    image_url: "",
    landing_html: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await apiGet(`/catalog/products/${id}`);
        setForm(res.data);
      } catch (err) {
        alert("فشل تحميل المنتج");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append("file", file);

      const res = await apiUpload("/upload", fd);

      setForm((prev) => ({
        ...prev,
        image_url: res.url
      }));

    } catch {
      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      await apiPut(`/catalog/products/${id}`, form);

      alert("تم التحديث");
      navigate("/products");

    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <section className="page-shell">تحميل...</section>;
  }

  return (
    <section className="page-shell" dir="rtl">

      <div className="page-header">
        <h1>تعديل المنتج</h1>
      </div>

      <form onSubmit={handleSubmit} className="card">

        <input name="title_ar" value={form.title_ar} onChange={handleChange} />

        <textarea name="description_ar" value={form.description_ar} onChange={handleChange} />

        <input name="price_mad" value={form.price_mad} onChange={handleChange} />

        <input name="stock" value={form.stock} onChange={handleChange} />

        <input type="file" onChange={handleImage} />

        {uploading && <p>جاري رفع الصورة...</p>}

        {form.image_url && (
          <img src={form.image_url} style={{ width: "120px" }} />
        )}

        <textarea
          name="landing_html"
          value={form.landing_html}
          onChange={handleChange}
          style={{ minHeight: "200px" }}
        />

        <button className="ui-btn ui-btn--accent">
          {saving ? "جاري..." : "حفظ"}
        </button>

      </form>

    </section>
  );
}
