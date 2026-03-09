import { useState } from "react";

const API = "https://souq-rahba-api.ori00fit.workers.dev";

function slugify(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]+/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AddProductPage() {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    categoryId: "",
    description: ""
  });

  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);

      let imageKey = null;

      if (image) {
        const formData = new FormData();
        formData.append("file", image);

        const uploadRes = await fetch(`${API}/upload`, {
          method: "POST",
          body: formData
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok || !uploadData.ok) {
          throw new Error(uploadData.error || "Image upload failed");
        }

        imageKey = uploadData.key || null;
      }

      const slug = slugify(form.name);

      const productRes = await fetch(`${API}/catalog/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          seller_id: "s1",
          slug,
          title_ar: form.name,
          description_ar: form.description,
          category_id: form.categoryId || null,
          sku: form.sku || null,
          price_mad: Number(form.price),
          stock: Number(form.stock || 0),
          image_key: imageKey
        })
      });

      const productData = await productRes.json();

      if (!productRes.ok || !productData.ok) {
        throw new Error(productData.message || "Product creation failed");
      }

      alert("Product created successfully");

      setForm({
        name: "",
        sku: "",
        price: "",
        stock: "",
        categoryId: "",
        description: ""
      });
      setImage(null);
    } catch (err) {
      console.error(err);
      alert("Error creating product");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "20px"
        }}
      >
        <h2>Add Product</h2>
        <p style={{ color: "#64748b" }}>
          Create a new product listing for your marketplace store
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gap: "16px",
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: "20px",
          padding: "20px"
        }}
      >
        <input
          name="name"
          placeholder="Product name"
          value={form.name}
          onChange={handleChange}
          required
          style={input}
        />

        <input
          name="sku"
          placeholder="SKU"
          value={form.sku}
          onChange={handleChange}
          style={input}
        />

        <input
          name="price"
          placeholder="Price (MAD)"
          value={form.price}
          onChange={handleChange}
          type="number"
          min="0"
          required
          style={input}
        />

        <input
          name="stock"
          placeholder="Stock quantity"
          value={form.stock}
          onChange={handleChange}
          type="number"
          min="0"
          required
          style={input}
        />

        <input
          name="categoryId"
          placeholder="Category ID (example: c5)"
          value={form.categoryId}
          onChange={handleChange}
          style={input}
        />

        <textarea
          name="description"
          placeholder="Product description"
          value={form.description}
          onChange={handleChange}
          rows="4"
          style={input}
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
          style={input}
        />

        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#ea580c",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
            opacity: submitting ? 0.7 : 1
          }}
        >
          {submitting ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}

const input = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  fontSize: "14px"
};
