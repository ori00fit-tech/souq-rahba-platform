const sections = [
  {
    title: "من نحن",
    body:
      "رحبة هي منصة Marketplace مغربية تهدف إلى تسهيل عرض وبيع وشراء المنتجات من متاجر وباعة مختلفين داخل فضاء رقمي واحد. نسعى إلى بناء تجربة تجارة إلكترونية حديثة تساعد المشترين على الوصول إلى المنتجات بسهولة، وتمنح البائعين أدوات واضحة لإدارة متاجرهم ومنتجاتهم وطلباتهم."
  },
  {
    title: "رؤيتنا",
    body:
      "نريد أن تصبح رحبة منصة مغربية مرجعية تجمع بين وضوح تجربة التصفح والشراء، وثقة أكبر في المتاجر والبائعين، وقابلية توسع حقيقية نحو فئات متعددة ومنتجات متنوعة."
  },
  {
    title: "ماذا نوفر",
    list: [
      "عرض منتجات من باعة مختلفين",
      "صفحات متاجر وباعة داخل المنصة",
      "تجربة شراء واضحة وسهلة",
      "تنظيم أفضل للفئات والمنتجات",
      "تطوير مستمر لتحسين الأداء والثقة والخدمات"
    ]
  },
  {
    title: "لمن صممت رحبة",
    body:
      "للمشترين الذين يريدون الوصول السريع إلى المنتجات والمتاجر داخل واجهة واضحة، وللباعة الذين يريدون إنشاء متجر داخل المنصة وإضافة المنتجات ومتابعة الطلبات."
  },
  {
    title: "قيم رحبة",
    list: [
      "الوضوح: تجربة مفهومة بدون تعقيد",
      "الثقة: إبراز المتاجر والبيانات الأساسية بشكل واضح",
      "السهولة: واجهات مناسبة للاستخدام اليومي",
      "التطوير المستمر: تحسين المنصة بشكل دائم"
    ]
  }
];

export default function AboutPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={styles.hero}>
          <div className="ui-chip">عن رحبة</div>
          <h1 className="page-title">رحبة منصة مغربية حديثة للتجارة الإلكترونية متعددة الباعة</h1>
          <p className="page-subtitle" style={styles.lead}>
            رحبة تجمع بين المشترين والبائعين داخل تجربة واضحة، موثوقة، وسهلة الاستخدام، مع التركيز على السوق المغربي واحتياجاته اليومية والمهنية.
          </p>
        </div>

        {sections.map((section) => (
          <article key={section.title} className="ui-card" style={styles.card}>
            <h2 style={styles.title}>{section.title}</h2>

            {section.body ? <p style={styles.body}>{section.body}</p> : null}

            {section.list ? (
              <ul style={styles.list}>
                {section.list.map((item) => (
                  <li key={item} style={styles.listItem}>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        <div className="ui-card" style={styles.card}>
          <h2 style={styles.title}>الخلاصة</h2>
          <p style={styles.body}>
            رحبة ليست مجرد واجهة عرض منتجات، بل مشروع Marketplace مغربي قابل للنمو، هدفه تحسين الربط بين البائع والمشتري داخل تجربة تجارة إلكترونية أكثر نضجًا واحترافية.
          </p>
        </div>
      </div>
    </section>
  );
}

const styles = {
  hero: {
    display: "grid",
    gap: "14px",
    padding: "20px"
  },
  lead: {
    margin: 0,
    lineHeight: 1.9
  },
  card: {
    display: "grid",
    gap: "14px",
    padding: "20px"
  },
  title: {
    margin: 0,
    color: "#173b74",
    fontSize: "22px",
    fontWeight: 900
  },
  body: {
    margin: 0,
    color: "#4b5563",
    lineHeight: 1.95,
    fontSize: "15px"
  },
  list: {
    margin: 0,
    paddingRight: "18px",
    display: "grid",
    gap: "10px",
    color: "#4b5563"
  },
  listItem: {
    lineHeight: 1.9
  }
};
