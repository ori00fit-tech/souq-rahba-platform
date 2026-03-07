import React from "react";

export function Section({ title, subtitle, children }) {
  return (
    <section style={{ padding: "24px 0" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>
        {subtitle ? <p style={{ margin: "8px 0 0", opacity: 0.8 }}>{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Badge({ children }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        background: "#f2eee7"
      }}
    >
      {children}
    </span>
  );
}
