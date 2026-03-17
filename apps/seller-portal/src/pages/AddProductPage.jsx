import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiUploadFile } from "../lib/api";

export default function AddProductPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title_ar: "",
    slug: "",
    price_mad: "",
    stock: "",
    images: [{ url: "", uploading: false }]
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function updateField(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  function updateImage(index, key, value) {
    const images = [...form.images];
    images[index][key] = value;
    setForm((p) => ({ ...p, images }));
  }

  async function uploadImage(index, file) {
    if (!file) return;

    try {
      updateImage(index, "uploading", true);

      const res = await apiUploadFile(file);

      updateImage(index, "url", res.url);
    } catch {
      setMsg("فشل رفع الصورة");
    } finally {
      updateImage(index, "uploading", false);
    }
  }

  async function submit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await apiPost("/catalog/products", {
        ...form,
        price_mad: Number(form.price_mad),
        stock: Number(form.stock)
      });

      setMsg("تم إنشاء المنتج");
      setTimeout(() => navigate("/products"), 800);
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card" dir="rtl">
      <h2>إضافة منتج</h2>

      <input placeholder="اسم المنتج" onChange={(e) => updateField("title_ar", e.target.value)} />
      <input placeholder="slug" onChange={(e) => updateField("slug", e.target.value)} />
      <input placeholder="السعر" type="number" onChange={(e) => updateField("price_mad", e.target.value)} />
      <input placeholder="المخزون" type="number" onChange={(e) => updateField("stock", e.target.value)} />

      {form.images.map((img, i) => (
        <div key={i}>
          <input
            placeholder="رابط الصورة"
            value={img.url}
            onChange={(e) => updateImage(i, "url", e.target.value)}
          />

          <input type="file" onChange={(e) => uploadImage(i, e.target.files[0])} />

          {img.uploading && <p>جاري الرفع...</p>}

          {img.url && <img src={img.url} width="100" />}
        </div>
      ))}

      <button disabled={loading}>
        {loading ? "..." : "حفظ"}
      </button>

      {msg && <p>{msg}</p>}
    </form>
  );
}
