import { useMemo } from "react";

const MOCK_APPLICATION = {
  status: "pending", // pending | needs_info | approved | rejected
  store_name: "MicroTech",
  owner_name: "Mohamed dub",
  phone: "0772593541",
  city: "Tanger",
  category: "إلكترونيات",
  submitted_at: "2026-03-22 14:30",
  updated_at: "2026-03-22 18:10",
  review_note: "نحتاج فقط إلى تأكيد بعض المعلومات الإضافية قبل التفعيل."
};

function getStatusConfig(status) {
  switch (status) {
    case "approved":
      return {
        badge: "تم القبول",
        title: "تم قبول حسابك كبائع",
        subtitle:
          "مبروك، تم تفعيل حسابك بنجاح وأصبح بإمكانك الدخول إلى لوحة البائع وإضافة منتجاتك.",
        icon: "✅",
        tone: {
          bg: "#ecfdf5",
          border: "#bbf7d0",
          text: "#166534"
        },
        steps: [
          "ادخل إلى لوحة البائع.",
          "أضف أول منتج داخل متجرك.",
          "راجع الطلبات والإشعارات وابدأ البيع."
        ],
        primaryLabel: "الدخول إلى لوحة البائع",
        primaryHref: "/dashboard",
        secondaryLabel: "إضافة أول منتج لاحقاً",
        secondaryHref: "/dashboard"
      };

    case "needs_info":
      return {
        badge: "معلومات إضافية مطلوبة",
        title: "نحتاج بعض المعلومات الإضافية",
        subtitle:
          "راجع فريقنا طلبك، ونحتاج منك إكمال بعض التفاصيل قبل قبول الحساب بشكل نهائي.",
        icon: "📝",
        tone: {
          bg: "#fff7ed",
          border: "#fed7aa",
          text: "#9a3412"
        },
        steps: [
          "راجع البيانات الحالية وتأكد من صحتها.",
          "جهّز المعلومات أو الوثائق المطلوبة.",
          "تواصل مع الفريق أو أعد إرسال الطلب بعد التحديث."
        ],
        primaryLabel: "تحديث بيانات الطلب",
        primaryHref: "/login",
        secondaryLabel: "التواصل مع الدعم",
        secondaryHref: "https://wa.me/212618072884"
      };

    case "rejected":
      return {
        badge: "تعذر القبول حالياً",
        title: "تم رفض الطلب في هذه المرحلة",
        subtitle:
          "راجعنا طلب الانضمام، وتعذر قبوله حالياً. يمكنك تعديل معلوماتك وإعادة التقديم من جديد.",
        icon: "❌",
        tone: {
          bg: "#fef2f2",
          border: "#fecaca",
          text: "#b91c1c"
        },
        steps: [
          "راجع سبب الرفض أو الملاحظة المرفقة.",
          "حدّث بيانات المتجر والنشاط التجاري.",
          "أعد إرسال الطلب بعد التصحيح."
        ],
        primaryLabel: "إعادة التقديم",
        primaryHref: "/login",
        secondaryLabel: "الرجوع",
        secondaryHref: "/login"
      };

    case "pending":
    default:
      return {
        badge: "قيد المراجعة",
        title: "طلبك قيد المراجعة",
        subtitle:
          "توصلنا بطلب انضمامك كبائع داخل رحبة، وفريقنا يراجعه حالياً. سنتواصل معك فور انتهاء المراجعة.",
        icon: "⏳",
        tone: {
          bg: "#eef6ff",
          border: "#dbeafe",
          text: "#173b74"
        },
        steps: [
          "تأكد أن هاتفك وبريدك الإلكتروني صحيحان.",
          "تابع واتساب والبريد الإلكتروني لأي تحديث.",
          "انتظر مراجعة الفريق قبل الدخول إلى لوحة البائع."
        ],
        primaryLabel: "تحديث الصفحة لاحقاً",
        primaryHref: "/onboarding",
        secondaryLabel: "الرجوع إلى الدخول",
        secondaryHref: "/login"
      };
  }
}

function InfoRow({ label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <strong style={s.infoValue}>{value || "—"}</strong>
    </div>
  );
}

export default function OnboardingPage() {
  const application = MOCK_APPLICATION;
  const statusConfig = useMemo(
    () => getStatusConfig(application.status),
    [application.status]
  );

  return (
    <section style={s.page} dir="rtl">
      <div style={s.shell}>
        <div style={s.stack}>
          <div style={s.heroCard}>
            <div style={s.badge}>RAHBA SELLER</div>
            <h1 style={s.pageTitle}>مراجعة طلب البائع</h1>
            <p style={s.pageSubtitle}>
              تابع حالة طلب الانضمام إلى بوابة البائع وتحقق من الخطوات التالية.
            </p>
          </div>

          <div
            style={{
              ...s.statusCard,
              background: statusConfig.tone.bg,
              borderColor: statusConfig.tone.border
            }}
          >
            <div style={s.statusTop}>
              <div style={s.statusIcon}>{statusConfig.icon}</div>
              <div style={s.statusTextWrap}>
                <div
                  style={{
                    ...s.statusBadge,
                    color: statusConfig.tone.text
                  }}
                >
                  {statusConfig.badge}
                </div>

                <h2 style={s.statusTitle}>{statusConfig.title}</h2>
                <p style={s.statusSubtitle}>{statusConfig.subtitle}</p>
              </div>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionHead}>
              <h3 style={s.sectionTitle}>ملخص الطلب</h3>
              <span style={s.sectionMeta}>آخر تحديث: {application.updated_at}</span>
            </div>

            <div style={s.infoGrid}>
              <InfoRow label="اسم المتجر" value={application.store_name} />
              <InfoRow label="اسم المسؤول" value={application.owner_name} />
              <InfoRow label="رقم الهاتف" value={application.phone} />
              <InfoRow label="المدينة" value={application.city} />
              <InfoRow label="الفئة" value={application.category} />
              <InfoRow label="تاريخ الإرسال" value={application.submitted_at} />
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionHead}>
              <h3 style={s.sectionTitle}>الخطوات التالية</h3>
            </div>

            <div style={s.stepsList}>
              {statusConfig.steps.map((step, index) => (
                <div key={step} style={s.stepItem}>
                  <div style={s.stepIndex}>{index + 1}</div>
                  <div style={s.stepText}>{step}</div>
                </div>
              ))}
            </div>
          </div>

          {application.review_note ? (
            <div style={s.noteCard}>
              <div style={s.noteTitle}>ملاحظة من فريق رحبة</div>
              <p style={s.noteText}>{application.review_note}</p>
            </div>
          ) : null}

          <div style={s.actions}>
            <a href={statusConfig.primaryHref} style={s.primaryButton}>
              {statusConfig.primaryLabel}
            </a>

            <a href={statusConfig.secondaryHref} style={s.secondaryButton}>
              {statusConfig.secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  page: {
    minHeight: "100dvh",
    background: "linear-gradient(180deg, #f4f1ea 0%, #f7f5ef 100%)",
    padding: "20px 14px 40px"
  },
  shell: {
    width: "100%",
    maxWidth: "560px",
    margin: "0 auto"
  },
  stack: {
    display: "grid",
    gap: "14px"
  },
  heroCard: {
    background: "#ffffff",
    borderRadius: "28px",
    border: "1px solid #e9dfd2",
    boxShadow: "0 20px 44px rgba(23,59,116,0.07)",
    padding: "22px 16px",
    display: "grid",
    gap: "10px",
    textAlign: "center"
  },
  badge: {
    margin: "0 auto",
    minHeight: "34px",
    padding: "0 14px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#173b74",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 900
  },
  pageTitle: {
    margin: 0,
    color: "#0f1d3a",
    fontSize: "30px",
    lineHeight: 1.1,
    fontWeight: 900
  },
  pageSubtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: 1.9
  },
  statusCard: {
    borderRadius: "24px",
    border: "1px solid",
    padding: "18px 16px"
  },
  statusTop: {
    display: "grid",
    gridTemplateColumns: "56px 1fr",
    gap: "12px",
    alignItems: "start"
  },
  statusIcon: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    background: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "28px",
    boxShadow: "0 10px 18px rgba(15,23,42,0.06)"
  },
  statusTextWrap: {
    display: "grid",
    gap: "8px"
  },
  statusBadge: {
    fontSize: "13px",
    fontWeight: 900
  },
  statusTitle: {
    margin: 0,
    color: "#0f1d3a",
    fontSize: "24px",
    lineHeight: 1.3,
    fontWeight: 900
  },
  statusSubtitle: {
    margin: 0,
    color: "#4b5563",
    fontSize: "15px",
    lineHeight: 1.9
  },
  card: {
    background: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #e9dfd2",
    boxShadow: "0 18px 36px rgba(23,59,116,0.05)",
    padding: "18px 16px",
    display: "grid",
    gap: "14px"
  },
  sectionHead: {
    display: "grid",
    gap: "6px"
  },
  sectionTitle: {
    margin: 0,
    color: "#173b74",
    fontSize: "20px",
    fontWeight: 900
  },
  sectionMeta: {
    color: "#7a6f63",
    fontSize: "13px",
    fontWeight: 700
  },
  infoGrid: {
    display: "grid",
    gap: "10px"
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    minHeight: "48px",
    padding: "0 14px",
    borderRadius: "16px",
    background: "#faf8f4",
    border: "1px solid #eee5d8"
  },
  infoLabel: {
    color: "#7a6f63",
    fontSize: "14px",
    fontWeight: 700
  },
  infoValue: {
    color: "#1f2937",
    fontSize: "15px",
    fontWeight: 900,
    textAlign: "left"
  },
  stepsList: {
    display: "grid",
    gap: "10px"
  },
  stepItem: {
    display: "grid",
    gridTemplateColumns: "36px 1fr",
    gap: "12px",
    alignItems: "start",
    padding: "12px 14px",
    borderRadius: "18px",
    background: "#faf8f4",
    border: "1px solid #eee5d8"
  },
  stepIndex: {
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #173b74 0%, #14967f 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    fontSize: "14px"
  },
  stepText: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: 1.9,
    fontWeight: 700
  },
  noteCard: {
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    borderRadius: "22px",
    padding: "16px",
    display: "grid",
    gap: "8px"
  },
  noteTitle: {
    color: "#9a3412",
    fontSize: "15px",
    fontWeight: 900
  },
  noteText: {
    margin: 0,
    color: "#7c2d12",
    fontSize: "14px",
    lineHeight: 1.9,
    fontWeight: 700
  },
  actions: {
    display: "grid",
    gap: "10px"
  },
  primaryButton: {
    minHeight: "56px",
    borderRadius: "18px",
    textDecoration: "none",
    background: "linear-gradient(135deg, #173b74 0%, #14967f 100%)",
    color: "#ffffff",
    fontSize: "17px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 14px 28px rgba(20,150,127,0.18)"
  },
  secondaryButton: {
    minHeight: "54px",
    borderRadius: "18px",
    textDecoration: "none",
    background: "#ffffff",
    border: "1px solid #d9dde5",
    color: "#173b74",
    fontSize: "16px",
    fontWeight: 900,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  }
};
