import { useEffect, useState } from "react";
import { API_BASE_URL } from "../lib/config";

export default function DashboardPage() {

  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0
  });

  useEffect(() => {

    async function loadStats() {

      try {

        const products = await fetch(
          `${API_BASE_URL}/catalog/products`
        ).then(r => r.json());

        const orders = await fetch(
          `${API_BASE_URL}/orders`
        ).then(r => r.json());

        const productCount = products.data?.length || 0;
        const orderCount = orders.data?.length || 0;

        const revenue = orders.data?.reduce((sum,o)=>sum + (o.total || 0),0) || 0;

        setStats({
          products: productCount,
          orders: orderCount,
          revenue
        });

      } catch(e) {
        console.log(e);
      }

    }

    loadStats();

  }, []);

  return (

    <div style={{display:"grid", gap:"20px"}}>

      <h2>Store Analytics</h2>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",
        gap:"20px"
      }}>

        <div style={card}>
          <h3>Products</h3>
          <h1>{stats.products}</h1>
        </div>

        <div style={card}>
          <h3>Orders</h3>
          <h1>{stats.orders}</h1>
        </div>

        <div style={card}>
          <h3>Revenue</h3>
          <h1>{stats.revenue} MAD</h1>
        </div>

      </div>

    </div>
  );
}

const card = {
  background:"#fff",
  borderRadius:"16px",
  padding:"20px",
  border:"1px solid #e2e8f0"
};
