import { useEffect, useState } from "react";

export default function ProductsPage() {

  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://souq-rahba-api.ori00fit.workers.dev/catalog/products")
      .then(r => r.json())
      .then(data => {
        setProducts(data.data || []);
      });
  }, []);

  return (
    <div style={{display:"grid", gap:"20px"}}>

      <h2>Your Products</h2>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",
        gap:"20px"
      }}>

        {products.map(p => (
          <div key={p.id} style={{
            background:"#fff",
            padding:"16px",
            borderRadius:"12px",
            border:"1px solid #e2e8f0"
          }}>

            <h3>{p.title}</h3>

            <p>Price: {p.price} MAD</p>

            <p>Stock: {p.stock_quantity}</p>

          </div>
        ))}

      </div>

    </div>
  );
}
