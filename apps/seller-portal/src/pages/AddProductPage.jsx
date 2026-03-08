import { useState } from "react";

export default function AddProductPage() {

  const [form, setForm] = useState({
  const [image, setImage] = useState(null);
    name: "",
    sku: "",
    price: "",
    stock: "",
    category: "",
    description: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {

e.preventDefault();

try {

let image_url = null;

if (image) {

const formData = new FormData();
formData.append("file", image);

const upload = await fetch("https://souq-rahba-api.ori00fit.workers.dev/upload", {
method: "POST",
body: formData
});

const result = await upload.json();
image_url = result.url;

}

const res = await fetch("https://souq-rahba-api.ori00fit.workers.dev/catalog/products", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
title: form.name,
sku: form.sku,
price: Number(form.price),
stock_quantity: Number(form.stock),
description: form.description,
vendor_id: "demo-vendor",
image: image_url
})
});

const data = await res.json();

console.log("Created product:", data);

alert("Product created successfully");

} catch (err) {

console.error(err);
alert("Error creating product");

}

}

  return (
    <div style={{display:"grid",gap:"20px"}}>

      <div
        style={{
          background:"#fff",
          border:"1px solid #e2e8f0",
          borderRadius:"20px",
          padding:"20px"
        }}
      >
        <h2>Add Product</h2>
        <p style={{color:"#64748b"}}>
          Create a new product listing for your marketplace store
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display:"grid",
          gap:"16px",
          background:"#fff",
          border:"1px solid #e2e8f0",
          borderRadius:"20px",
          padding:"20px"
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
          style={input}
        />

        <input
          name="stock"
          placeholder="Stock quantity"
          value={form.stock}
          onChange={handleChange}
          type="number"
          style={input}
        />

        <input
          name="category"
          placeholder="Category"
          value={form.category}
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

        <button
          type="submit"
          style={{
            padding:"14px",
            borderRadius:"12px",
            border:"none",
            background:"#ea580c",
            color:"#fff",
            fontWeight:"700",
            cursor:"pointer"
          }}
        >
        <input
type="file"
accept="image/*"
onChange={(e)=>setImage(e.target.files[0])}
/>
          Create Product
        </button>

      </form>

    </div>
  );
}

const input = {
  padding:"12px",
  borderRadius:"10px",
  border:"1px solid #e2e8f0",
  fontSize:"14px"
};
