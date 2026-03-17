import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPut, apiUploadFile } from "../lib/api";

export default function EditProductPage() {
  const { id } = useParams();

  const [form, setForm] = useState(null);

  useEffect(() => {
    apiGet(`/catalog/products/id/${id}`).then((res) => {
      setForm(res.data);
    });
  }, [id]);

  if (!form) return <p>loading...</p>;

  function update(key, val) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function upload(file) {
    const res = await apiUploadFile(file);
    update("image_url", res.url);
  }

  async function save() {
    await apiPut(`/catalog/products/${id}`, form);
    alert("تم الحفظ");
  }

  return (
    <div dir="rtl">
      <h2>تعديل منتج</h2>

      <input value={form.title_ar} onChange={(e) => update("title_ar", e.target.value)} />

      <input type="file" onChange={(e) => upload(e.target.files[0])} />

      {form.image_url && <img src={form.image_url} width="100" />}

      <button onClick={save}>حفظ</button>
    </div>
  );
}
