import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    <div className="container section-space">
      <h1>المنتجات</h1>

      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: "24px" }}>
          <Link
            to={`/products/${p.slug}`}
            style={{
              display: "inline-block",
              fontSize: "24px",
              fontWeight: "700",
              color: "#1f3b73",
              textDecoration: "none",
              marginBottom: "8px",
            }}
          >
            {p.title_ar}
          </Link>

          <p>{p.price_mad} MAD</p>

          <div>
            <Link
              to={`/products/${p.slug}`}
              style={{
                display: "inline-block",
                padding: "8px 14px",
                border: "1px solid #ccc",
                borderRadius: "10px",
                textDecoration: "none",
                color: "#111",
              }}
            >
              عرض المنتج
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
