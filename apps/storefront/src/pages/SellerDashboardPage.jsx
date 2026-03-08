import { useState } from "react";

export default function SellerDashboardPage() {
  const [titleAr, setTitleAr] = useState("");
  const [slug, setSlug] = useState("");
  const [priceMad, setPriceMad] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("جارٍ الإرسال...");

    try {
      const response = await fetch("https://souq-rahba-platform.ori00fit.workers.dev/catalog/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_id: "s1",
          title_ar: titleAr,
          slug,
          price_mad: Number(priceMad),
          stock: Number(stock),
          category_id: categoryId,
          description_ar: "",
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setMessage("تمت إضافة المنتج بنجاح");
        setTitleAr("");
        setSlug("");
        setPriceMad("");
        setStock("");
        setCategoryId("");
      } else {
        setMessage("فشل الإضافة");
      }
    } catch (err) {
      setMessage("حدث خطأ أثناء الإرسال");
    }
  }

  return (
    <section className="container section-space">
      <h1>لوحة البائع</h1>

      <form onSubmit={handleSubmit} style={{ maxWidth: "560px", display: "grid", gap: "12px" }}>
        <input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="اسم المنتج بالعربية" />
        <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="slug مثال: samsung-a55" />
        <input value={priceMad} onChange={(e) => setPriceMad(e.target.value)} placeholder="السعر" type="number" />
        <input value={stock} onChange={(e) => setStock(e.target.value)} placeholder="المخزون" type="number" />
        <input value={categoryId} onChange={(e) => setCategoryId(e.target.value)} placeholder="category_id مثال: c1" />

        <button type="submit">إضافة المنتج</button>
      </form>

      {message && <p style={{ marginTop: "16px" }}>{message}</p>}
    </section>
  );
}
