import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut } from "@rahba/shared";
import { useSellerAuth } from "../context/SellerAuthContext";

const CATEGORY_OPTIONS = [
  "مواد غذائية",
  "إلكترونيات",
  "لوازم البحر",
  "المنزل والمطبخ",
  "الملابس",
  "الصحة والجمال",
  "التجهيزات المهنية",
  "أخرى"
];

function normalizeSellerStatus(data) {
  const raw = String(data?.kyc_status || data?.status || "pending").toLowerCase();

  if (raw === "approved" || raw === "active" || raw === "verified") return "approved";
  if (raw === "rejected" || raw === "declined") return "rejected";
  if (raw === "needs_info" || raw === "pending_info") return "needs_info";
  return "pending";
}

function statusLabel(status) {
  if (status === "approved") return "مقبول";
  if (status === "rejected") return "مرفوض";
  if (status === "needs_info") return "معلومات إضافية مطلوبة";
  return "قيد المراجعة";
}

export default function SettingsPage() {
  const { currentSeller, authLoading } = useSellerAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [seller, setSeller] = useState(null);

  const [form, setForm] = useState({
    display_name: "",
    slug: "",
    city: "",
    phone: "",
    category: CATEGORY_OPTIONS[0],
    description: ""
  });

  useEffect(() => {
    async function loadSellerProfile() {
      try {
        setLoading(true);
        setMessage("");

        const res = await apiGet("/marketplace/me");

        if (!res?.ok || !res?.data) {
          setMessageType("error");
          setMessage(res?.message || "تعذر تحميل إعدادات المتجر");
          return;
        }

        const data = res.data;
        setSeller(data);

        setForm({
          display_name: data.display_name || "",
          slug: data.slug || "",
          city: data.city || "",
          phone: data.phone || "",
          category: data.category || CATEGORY_OPTIONS[0],
          description: data.description || ""
        });
      } catch (err) {
        console.error(err);
        setMessageType("error");
        setMessage(err?.message || "حدث خطأ أثناء تحميل بيانات المتجر");
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading && currentSeller) {
      loadSellerProfile();
    } else if (!authLoading && !currentSeller) {
      setLoading(false);
      setMessageType("error");
      setMessage("تعذر تحديد المتجر الحالي");
    }
  }, [authLoading, currentSeller]);

  const derivedStatus = useMemo(() => {
    return normalizeSellerStatus(seller || {});
  }, [seller]);

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validateForm() {
    if (!form.display_name.trim()) return "يرجى إدخال اسم المتجر";
    if (!form.slug.trim()) return "يرجى إدخال slug المتجر";
    if (!/^[a-z0-9-]+$/.test(form.slug.trim())) {
      return "الـ slug يجب أن يحتوي فقط على حروف إنجليزية صغيرة وأرقام و -";
    }
    if (!form.city.trim()) return "يرجى إدخال المدينة";
    if (!form.phone.trim()) return "يرجى إدخال رقم الهاتف";
    return "";
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setMessageType("error");
      setMessage(error);
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const payload = {
        display_name: form.display_name.trim(),
        slug: form.slug.trim(),
        city: form.city.trim(),
        phone: form.phone.trim(),
        category: form.category,
        description: form.description.trim() || null
      };

      const res = await apiPut("/marketplace/onboarding", payload);

      if (!res?.ok) {
        setMessageType("error");
        setMessage(res?.message || "تعذر تحديث إعدادات المتجر");
        return;
      }

      const updated = res?.data || { ...seller, ...payload };
      setSeller(updated);
      setMessageType("success");
      setMessage("تم تحديث إعدادات المتجر بنجاح");
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage(err?.message || "حدث خطأ أثناء تحديث المتجر");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header">
          <h1>إعدادات المتجر</h1>
          <p>جاري تحميل بيانات المتجر...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header">
        <h1>إعدادات المتجر</h1>
        <p>تحديث معلومات متجرك داخل بوابة البائع</p>
      </div>

      <div style={s.layout}>
        <div style={s.mainCol}>
          {message ? (
            <div
              style={{
                ...s.messageBox,
                ...(messageType === "success" ? s.messageSuccess : s.messageError)
              }}
            >
              {message}
            </div>
          ) : null}

          <form style={s.card} onSubmit={handleSubmit}>
            <div style={s.sectionTitle}>المعلومات الأساسية</div>

            <label style={s.label}>
              <span>اسم المتجر</span>
              <input
                style={s.input}
                value={form.display_name}
                onChange={(e) => updateField("display_name", e.target.value)}
                placeholder="مثلاً: Tech Store"
              />
            </label>

            <label style={s.label}>
              <span>Slug المتجر</span>
              <input
                style={s.input}
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value.toLowerCase())}
                placeholder="tech-store"
                dir="ltr"
              />
            </label>

            <label style={s.label}>
              <span>المدينة</span>
              <input
                style={s.input}
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="مثلاً: Larache"
              />
            </label>

            <label style={s.label}>
              <span>رقم الهاتف</span>
              <input
                style={s.input}
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="06xxxxxxxx"
                inputMode="tel"
              />
            </label>

            <label style={s.label}>
              <span>الفئة</span>
              <select
                style={s.input}
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label style={s.label}>
              <span>وصف المتجر</span>
              <textarea
                style={s.textarea}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="اكتب وصفاً مختصراً لمتجرك ومنتجاتك..."
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              style={{
                ...s.primaryButton,
                opacity: saving ? 0.8 : 1
              }}
            >
              {saving ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
          </form>
        </div>

        <aside style={s.sideCol}>
          <div style={s.card}>
            <div style={s.sectionTitle}>حالة الحساب</div>

            <div style={s.infoGrid}>
              <InfoRow
                label="الحالة"
                value={statusLabel(derivedStatus)}
              />
              <InfoRow
                label="KYC"
                value={seller?.kyc_status || "pending"}
              />
              <InfoRow
                label="Verified"
                value={Number(seller?.verified) === 1 ? "Yes" : "No"}
              />
              <InfoRow
                label="اسم المتجر الحالي"
                value={seller?.display_name || "—"}
              />
              <InfoRow
                label="Slug الحالي"
                value={seller?.slug || "—"}
              />
              <InfoRow
                label="تاريخ الإنشاء"
                value={seller?.created_at || "—"}
              />
            </div>
          </div>

          <div style={s.card}>
            <div style={s.sectionTitle}>ملاحظات</div>
            <div style={s.noteBox}>
              إذا كان حسابك ما زال قيد المراجعة، يمكنك تحديث معلومات المتجر من هنا، وسيتم اعتماد آخر نسخة محفوظة.
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={s.infoRow}>
      <span style={s.infoLabel}>{label}</span>
      <strong style={s.infoValue}>{value || "—"}</strong>
    </div>
  );
}

const s = {
  layout: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: "16px"
  },
  mainCol: {
    display: "grid",
    gap: "16px"
  },
  sideCol: {
    display: "grid",
    gap: "16px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "18px",
    display: "grid",
    gap: "14px"
  },
  sectionTitle: {
    fontWeight: "900",
    fontSize: "18px",
    color: "#0f172a"
  },
  label: {
    display: "grid",
    gap: "8px",
    color: "#1f2937",
    fontWeight: "700",
    fontSize: "14px"
  },
  input: {
    width: "100%",
    minHeight: "52px",
    borderRadius: "14px",
    border: "1px solid #d9dde5",
    background: "#fff",
    padding: "0 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box"
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    borderRadius: "14px",
    border: "1px solid #d9dde5",
    background: "#fff",
    padding: "12px 14px",
    fontSize: "15px",
    color: "#111827",
    outline: "none",
    boxSizing: "border-box",
    resize: "vertical"
  },
  primaryButton: {
    minHeight: "54px",
    borderRadius: "14px",
    border: "none",
    background: "linear-gradient(135deg, #173b74 0%, #14967f 100%)",
    color: "#fff",
    fontSize: "17px",
    fontWeight: "900",
    cursor: "pointer"
  },
  messageBox: {
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: 1.8
  },
  messageSuccess: {
    background: "#ecfdf5",
    color: "#166534",
    border: "1px solid #bbf7d0"
  },
  messageError: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca"
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
    minHeight: "46px",
    padding: "0 12px",
    borderRadius: "12px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0"
  },
  infoLabel: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "700"
  },
  infoValue: {
    color: "#111827",
    fontSize: "14px",
    fontWeight: "800",
    textAlign: "left"
  },
  noteBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px",
    color: "#334155",
    lineHeight: 1.9,
    fontSize: "14px"
  }
};
