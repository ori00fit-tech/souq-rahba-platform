import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://souq-rahba-api.ori00fit.workers.dev";

export default function EditProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title_ar: "",
    sku: "",
    price_mad: "",
    stock: "",
    category_id: "",
    description_ar: ""
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`${API}/catalog/products/id/${id}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data.message || "Failed to load product");
        }

        const p = data.data;

        setForm({
          title_ar: p.title_ar || "",
          sku: p.sku || "",
          price_mad: p.price_mad ?? "",
          stock: p.stock ?? "",
          category_id: p.category_id || "",
          description_ar: p.description_ar || ""
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load product");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await fetch(`${API}/catalog/products/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title_ar: form.title_ar,
          sku: form.sku || null,
          price_mad: Number(form.price_mad),
          stock: Number(form.stock || 0),
          category_id: form.category_id || null,
          description_ar: form.description_ar
        })
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        throw new Error(data.message || "Failed to update product");
      }

      alert("Product updated successfully");
      navigate("/products");
    } catch (err) {
      console.error(err);
      alert("Error updating product");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div>Loading product...</div>;
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
        <h2>Edit Product</h2>
        <p style={{ color: "#64748b" }}>
          Update product information
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
          name="title_ar"
          placeholder="Product name"
          value={form.title_ar}
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
          name="price_mad"
          placeholder="Price (MAD)"
          value={form.price_mad}
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
          name="category_id"
          placeholder="Category ID"
          value={form.category_id}
          onChange={handleChange}
          style={input}
        />

        <textarea
          name="description_ar"
          placeholder="Product description"
          value={form.description_ar}
          onChange={handleChange}
          rows="4"
          style={input}
        />

        <button
          type="submit"
          disabled={saving}
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            background: "#ea580c",
            color: "#fff",
            fontWeight: "700",
            cursor: "pointer",
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? "Saving..." : "Save Changes"}
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
