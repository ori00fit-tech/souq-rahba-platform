import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../lib/api";

export default function ProductPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    apiGet(`/catalog/products/${slug}`)
      .then((res) => {
        if (res.ok) setProduct(res.data);
      })
      .catch(console.error);
  }, [slug]);

  if (!product) return <div>تحميل...</div>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>{product.title_ar}</h1>

      <p style={{ fontSize: "22px", fontWeight: "bold" }}>
        {product.price_mad} MAD
      </p>

      <p>{product.description_ar}</p>
    </div>
  );
}
