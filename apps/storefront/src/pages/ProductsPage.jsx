import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    apiGet("/catalog/products")
      .then((res) => {
        if (res.ok) setProducts(res.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div>
      <h1>المنتجات</h1>

      {products.map((p) => (
  <div key={p.id}>
    <h3>{p.title_ar}</h3>

    <p>{p.price_mad} MAD</p>

    <a href={`/products/${p.slug}`}>
      عرض المنتج
    </a>
  </div>
))}
