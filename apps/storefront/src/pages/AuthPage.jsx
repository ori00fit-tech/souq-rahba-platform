import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../lib/config";

const TAB_LOGIN = "login";
const TAB_REGISTER = "register";

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authLoading, loginUser } = useApp();

  const [tab, setTab] = useState(TAB_LOGIN);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: ""
  });

  const googleUrl = useMemo(() => `${API_BASE_URL}/auth/google/login`, []);

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate("/", { replace: true });
    }
  }, [authLoading, currentUser, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const provider = params.get("provider");

    async function consumeGoogleToken() {
      if (!token) return;

      try {
        setLoadingGoogle(true);
        setMessage("");
        await loginUser(token);
        navigate("/", { replace: true });
      } catch (err) {
        console.error(err);
        setMessage("تعذر إكمال تسجيل الدخول عبر Google");
      } finally {
        setLoadingGoogle(false);
      }
    }

    if (provider === "google" && token) {
      consumeGoogleToken();
    }
  }, [location.search, loginUser, navigate]);

  function switchTab(nextTab) {
    setTab(nextTab);
    setMessage("");
  }

  function updateLoginField(name, value) {
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  }

  function updateRegisterField(name, value) {
    setRegisterForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();

    if (!loginForm.email.trim() || !loginForm.password) {
      setMessage("يرجى إدخال البريد الإلكتروني وكلمة السر");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const result = await apiPost("/auth/login", {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      });

      const token = result?.data?.token;
      if (!token) {
        setMessage("لم يتم العثور على رمز الجلسة");
        return;
      }

      await loginUser(token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("تعذر تسجيل الدخول، تحقق من البيانات ثم حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();

    if (!registerForm.full_name.trim()) {
      setMessage("يرجى إدخال الاسم الكامل");
      return;
    }

    if (!registerForm.email.trim()) {
      setMessage("يرجى إدخال البريد الإلكتروني");
      return;
    }

    if (!registerForm.password) {
      setMessage("يرجى إدخال كلمة السر");
      return;
    }

    if (registerForm.password.length < 6) {
      setMessage("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (registerForm.password !== registerForm.confirm_password) {
      setMessage("تأكيد كلمة السر غير مطابق");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      await apiPost("/auth/register", {
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        role: "buyer",
        locale: "ar"
      });

      const loginResult = await apiPost("/auth/login", {
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password
      });

      const token = loginResult?.data?.token;
      if (!token) {
        setMessage("تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائياً");
        setTab(TAB_LOGIN);
        return;
      }

      await loginUser(token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("تعذر إنشاء الحساب، ربما البريد الإلكتروني مستعمل مسبقاً");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={styles.page}>
        <div style={styles.hero}>
          <div style={styles.badge}>RAHBA</div>
          <h1 style={styles.heroTitle}>دخول احترافي إلى رحبة</h1>
          <p style={styles.heroText}>
            سجل الدخول بسرعة عبر Google أو بالبريد الإلكتروني، واحفظ طلباتك
            وتابع مشترياتك داخل منصة رحبة بشكل آمن وسلس.
          </p>

          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>✓</span>
              <span>دخول سريع وآمن</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🛍️</span>
              <span>متابعة الطلبات بسهولة</span>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🔒</span>
              <span>جلسة مستقرة ومحمية</span>
            </div>
          </div>
        </div>

        <div style={styles.cardWrap}>
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>
                {tab === TAB_LOGIN ? "تسجيل الدخول" : "إنشاء حساب جديد"}
              </h2>
              <p style={styles.cardSubtitle}>
                {tab === TAB_LOGIN
                  ? "أدخل بياناتك للمتابعة"
                  : "أنشئ حسابك وابدأ الشراء داخل رحبة"}
              </p>
            </div>

            <a href={googleUrl} style={styles.googleBtn}>
              <span style={styles.googleIcon}>G</span>
              <span>
                {loadingGoogle ? "جاري المتابعة عبر Google..." : "المتابعة عبر Google"}
              </span>
            </a>

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>أو</span>
              <span style={styles.dividerLine} />
            </div>

            <div style={styles.tabs}>
              <button
                type="button"
                onClick={() => switchTab(TAB_REGISTER)}
                style={{
                  ...styles.tabBtn,
                  ...(tab === TAB_REGISTER ? styles.tabBtnActive : {})
                }}
              >
                إنشاء حساب
              </button>

              <button
                type="button"
                onClick={() => switchTab(TAB_LOGIN)}
                style={{
                  ...styles.tabBtn,
                  ...(tab === TAB_LOGIN ? styles.tabBtnActive : {})
                }}
              >
                تسجيل الدخول
              </button>
            </div>

            {message ? <div style={styles.message}>{message}</div> : null}

            {tab === TAB_LOGIN ? (
              <form style={styles.form} onSubmit={handleLoginSubmit}>
                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => updateLoginField("email", e.target.value)}
                    placeholder="name@example.com"
                    style={styles.input}
                    autoComplete="email"
                  />
                </Field>

                <Field label="كلمة السر">
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => updateLoginField("password", e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    autoComplete="current-password"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting || loadingGoogle || authLoading}
                  style={styles.primaryBtn}
                >
                  {submitting ? "جاري تسجيل الدخول..." : "دخول"}
                </button>
              </form>
            ) : (
              <form style={styles.form} onSubmit={handleRegisterSubmit}>
                <Field label="الاسم الكامل">
                  <input
                    type="text"
                    value={registerForm.full_name}
                    onChange={(e) => updateRegisterField("full_name", e.target.value)}
                    placeholder="الاسم الكامل"
                    style={styles.input}
                    autoComplete="name"
                  />
                </Field>

                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => updateRegisterField("email", e.target.value)}
                    placeholder="name@example.com"
                    style={styles.input}
                    autoComplete="email"
                  />
                </Field>

                <Field label="رقم الهاتف">
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => updateRegisterField("phone", e.target.value)}
                    placeholder="06xxxxxxxx"
                    style={styles.input}
                    autoComplete="tel"
                  />
                </Field>

                <Field label="كلمة السر">
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => updateRegisterField("password", e.target.value)}
                    placeholder="••••••••"
                    style={styles.input}
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="تأكيد كلمة السر">
                  <input
                    type="password"
                    value={registerForm.confirm_password}
                    onChange={(e) =>
                      updateRegisterField("confirm_password", e.target.value)
                    }
                    placeholder="••••••••"
                    style={styles.input}
                    autoComplete="new-password"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={submitting || loadingGoogle || authLoading}
                  style={styles.primaryBtn}
                >
                  {submitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </button>
              </form>
            )}

            <div style={styles.footer}>
              <NavLink to="/" style={styles.backLink}>
                العودة إلى الرئيسية
              </NavLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label style={styles.field}>
      <span style={styles.label}>{label}</span>
      {children}
    </label>
  );
}

const styles = {
  page: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "28px",
    alignItems: "stretch"
  },
  hero: {
    background:
      "linear-gradient(135deg, rgba(20,48,98,1) 0%, rgba(27,89,143,1) 52%, rgba(14,121,111,1) 100%)",
    color: "#fff",
    borderRadius: "28px",
    padding: "34px",
    minHeight: "660px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    boxShadow: "0 24px 60px rgba(20,48,98,0.18)"
  },
  badge: {
    alignSelf: "flex-start",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontWeight: 800,
    fontSize: "12px",
    marginBottom: "18px"
  },
  heroTitle: {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.15,
    fontWeight: 900
  },
  heroText: {
    marginTop: "16px",
    marginBottom: "24px",
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.9)",
    fontSize: "16px",
    maxWidth: "560px"
  },
  featureList: {
    display: "grid",
    gap: "14px"
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "16px"
  },
  featureIcon: {
    width: "34px",
    height: "34px",
    display: "grid",
    placeItems: "center",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.14)"
  },
  cardWrap: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    width: "100%",
    background: "#fff",
    borderRadius: "28px",
    padding: "30px",
    border: "1px solid #eadfd3",
    boxShadow: "0 18px 50px rgba(29,45,74,0.10)"
  },
  cardHeader: {
    marginBottom: "18px"
  },
  cardTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900,
    fontSize: "30px"
  },
  cardSubtitle: {
    margin: "10px 0 0",
    color: "#6b6156",
    lineHeight: 1.8
  },
  googleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    textDecoration: "none",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d6e1ee",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    color: "#173b74",
    fontWeight: 800
  },
  googleIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    display: "grid",
    placeItems: "center",
    border: "1px solid #e5e5e5",
    background: "#fff",
    color: "#ea4335",
    fontWeight: 900
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "22px 0"
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    background: "#ece2d7"
  },
  dividerText: {
    color: "#7d7368",
    fontSize: "13px",
    fontWeight: 700
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    background: "#f7f3ee",
    padding: "8px",
    borderRadius: "18px",
    marginBottom: "18px"
  },
  tabBtn: {
    border: "none",
    background: "transparent",
    padding: "13px 14px",
    borderRadius: "14px",
    cursor: "pointer",
    fontWeight: 800,
    color: "#6d6257"
  },
  tabBtnActive: {
    background: "#fff",
    color: "#173b74",
    boxShadow: "0 8px 20px rgba(20,40,72,0.08)"
  },
  message: {
    marginBottom: "16px",
    padding: "13px 15px",
    borderRadius: "14px",
    background: "#fff8ee",
    color: "#9a4f18",
    border: "1px solid #f8d7a8",
    fontWeight: 700,
    fontSize: "14px"
  },
  form: {
    display: "grid",
    gap: "14px"
  },
  field: {
    display: "grid",
    gap: "8px"
  },
  label: {
    color: "#2d241d",
    fontWeight: 800,
    fontSize: "14px"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #ddd2c5",
    outline: "none",
    background: "#fffdfa",
    fontSize: "15px",
    color: "#1e1b16"
  },
  primaryBtn: {
    marginTop: "6px",
    width: "100%",
    border: "none",
    padding: "15px 18px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #173b74 0%, #1d5c97 55%, #0f766e 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 16px 30px rgba(23,59,116,0.18)"
  },
  footer: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center"
  },
  backLink: {
    color: "#173b74",
    fontWeight: 800,
    textDecoration: "none"
  }
};
