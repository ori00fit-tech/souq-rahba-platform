const cards = [
  { title: "إجمالي الإيرادات", value: "24,500 MAD", tone: "info" },
  { title: "دفعات قيد الانتظار", value: "6,200 MAD", tone: "warning" },
  { title: "دفعات مكتملة", value: "18,300 MAD", tone: "success" }
];

export default function EarningsPage() {
  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header earnings-header">
        <div>
          <h1>الأرباح</h1>
          <p>تتبع الإيرادات والمدفوعات الخاصة بمتجرك</p>
        </div>
      </div>

      <div className="earnings-stats-grid">
        {cards.map((card) => (
          <div key={card.title} className="earnings-stat-card">
            <div className={`ui-badge ${badgeClass(card.tone)}`}>
              {card.title}
            </div>

            <div className="earnings-stat-value">
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div className="earnings-panel">
        <div className="earnings-panel__title">ملخص الأداء</div>
        <div className="earnings-panel__text">
          هذه الصفحة مهيأة لعرض الإيرادات، الدفعات، الأداء الشهري، والمقارنات المستقبلية
          داخل لوحة تحكم البائع بشكل موحد واحترافي.
        </div>
      </div>
    </section>
  );
}

function badgeClass(tone) {
  if (tone === "success") return "ui-badge--success";
  if (tone === "warning") return "ui-badge--warning";
  return "ui-badge--info";
}
