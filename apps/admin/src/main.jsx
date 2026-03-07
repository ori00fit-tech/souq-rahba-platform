import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";

function Card({ title, children }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function App() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Souq Admin</h1>
        <nav>
          <a href="#">Dashboard</a>
          <a href="#">Sellers</a>
          <a href="#">Products</a>
          <a href="#">Orders</a>
          <a href="#">Disputes</a>
        </nav>
      </aside>
      <main className="content">
        <div className="grid">
          <Card title="Platform health">API, queues, D1, R2, notifications</Card>
          <Card title="Moderation queue">Pending sellers, flagged products, reviews</Card>
          <Card title="Operations">COD failure rate, return rate, payout backlog</Card>
          <Card title="Compliance">KYC, invoice gaps, privacy requests</Card>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
