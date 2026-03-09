import { useEffect, useState } from "react";

const API = "https://souq-rahba-api.ori00fit.workers.dev";

export default function ProductsPage() {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    async function loadProducts() {
      try {

        const res = await fetch(`${API}/catalog/products`);
        const data = await res.json();

        setProducts(data.data || []);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }
    }

    loadProducts();

  }, []);

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div style={{display:"grid", gap:"20px"}}>

      <h2>Your Products</h2>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",
        gap:"20px"
      }}>

        {products.map(p => {

          const imageUrl = p.image
            ? `${API}/media/${p.image}`
            : null;

          return (

            <div
              key={p.id}
              style={{
                background:"#fff",
                padding:"16px",
                borderRadius:"12px",
                border:"1px solid #e2e8f0",
                display:"grid",
                gap:"10px"
              }}
            >

              {imageUrl && (
                <img
                  src={imageUrl}
                  style={{
                    width:"100%",
                    height:"160px",
                    objectFit:"cover",
                    borderRadius:"8px"
                  }}
                />
              )}

              <h3>{p.title}</h3>

              <p>Price: {p.price} MAD</p>

              <p>Stock: {p.stock_quantity}</p>

            </div>

          );

        })}

      </div>

    </div>
  );
}
