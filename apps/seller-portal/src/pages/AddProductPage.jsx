import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiUpload } from "../lib/api";

export default function AddProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title_ar: "",
    description_ar: "",
    price_mad: "",
    stock: "",
    image_url: "",
    landing_html: ""
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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

    } catch (err) {
      alert("فشل رفع الصورة");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      await apiPost("/catalog/products", form);

      alert("تم إنشاء المنتج");
      navigate("/products");

    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page-shell" dir="rtl">

      <div className="page-header">
        <h1>إضافة منتج</h1>
      </div>

      <form onSubmit={handleSubmit} className="card">

        <input
          name="title_ar"
          placeholder="اسم المنتج"
          onChange={handleChange}
          required
        />

        <textarea
          name="description_ar"
          placeholder="وصف المنتج"
          onChange={handleChange}
        />

        <input
          name="price_mad"
          placeholder="السعر"
          onChange={handleChange}
        />

        <input
          name="stock"
          placeholder="المخزون"
          onChange={handleChange}
        />

        {/* IMAGE */}
        <input type="file" onChange={handleImage} />

        {uploading && <p>جاري رفع الصورة...</p>}

        {form.image_url && (
          <img src={form.image_url} style={{ width: "120px" }} />
        )}

        {/* LANDING PAGE */}
        <textarea
          name="landing_html"
          placeholder="Landing HTML (اختياري)"
          onChange={handleChange}
          style={{ minHeight: "200px" }}
        />

        <button className="ui-btn ui-btn--accent">
          {loading ? "جاري..." : "إنشاء"}
        </button>

      </form>

    </section>
  );
}
