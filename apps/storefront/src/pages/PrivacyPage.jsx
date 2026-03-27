const sections = [
  {
    title: "1. المعلومات التي قد نجمعها",
    list: [
      "الاسم",
      "البريد الإلكتروني",
      "رقم الهاتف",
      "بيانات الحساب",
      "بيانات الطلبات",
      "بيانات الاستخدام الأساسية المرتبطة بتحسين الأداء وتجربة المنصة"
    ]
  },
  {
    title: "2. كيف نستخدم المعلومات",
    list: [
      "تشغيل الحسابات وتسجيل الدخول",
      "معالجة الطلبات",
      "تحسين تجربة المستخدم",
      "التواصل بخصوص الطلبات أو المشاكل التقنية",
      "تعزيز الأمان ومنع إساءة الاستخدام"
    ]
  },
  {
    title: "3. مشاركة المعلومات",
    body:
      "لا يتم استخدام المعلومات خارج الأغراض التشغيلية المعقولة للمنصة إلا عند الضرورة التقنية أو القانونية أو التشغيلية المرتبطة بتقديم الخدمة."
  },
  {
    title: "4. حماية البيانات",
    body:
      "تسعى رحبة إلى اعتماد تدابير تقنية وتنظيمية مناسبة لحماية المعلومات من الوصول غير المصرح به أو سوء الاستخدام."
  },
  {
    title: "5. الاحتفاظ بالبيانات",
    body:
      "يتم الاحتفاظ بالبيانات للمدة اللازمة لتشغيل المنصة، معالجة الطلبات، الامتثال للمتطلبات التقنية أو القانونية، وتحسين الخدمة."
  },
  {
    title: "6. ملفات تعريف الارتباط وتقنيات مشابهة",
    body:
      "قد تستخدم المنصة أدوات تقنية أساسية لتحسين الأداء، تذكر الجلسات، وفهم الاستخدام بشكل عام."
  },
  {
    title: "7. حقوق المستخدم",
    body:
      "يمكن للمستخدم طلب تحديث بعض بياناته أو مراجعة معلوماته المرتبطة بالحساب بحسب ما تتيحه المنصة في المرحلة الحالية."
  },
  {
    title: "8. تحديث السياسة",
    body:
      "قد يتم تعديل سياسة الخصوصية عند تطوير رحبة أو تغيير بعض الجوانب التشغيلية، وسيتم اعتماد النسخة الأحدث المنشورة داخل المنصة."
  },
  {
    title: "9. التواصل",
    body:
      "إذا كان لديك أي سؤال حول الخصوصية أو كيفية استخدام البيانات، يمكنك التواصل عبر صفحة المساعدة والدعم."
  }
];

export default function PrivacyPage() {
  return (
    <section className="container section-space" dir="rtl">
      <div className="page-stack">
        <div className="ui-card" style={styles.hero}>
          <div className="ui-chip">سياسة الخصوصية</div>
          <h1 className="page-title">كيف تتعامل رحبة مع البيانات والمعلومات</h1>
          <p className="page-subtitle" style={styles.lead}>
            تحترم رحبة خصوصية المستخدمين وتلتزم بالتعامل مع البيانات الشخصية بطريقة مسؤولة وواضحة، بما يتوافق مع الغرض من تشغيل المنصة وتحسين خدماتها.
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
