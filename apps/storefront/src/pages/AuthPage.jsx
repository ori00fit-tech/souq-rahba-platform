import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";
import { API_BASE_URL } from "../lib/config";

const TABS = {
  login: "login",
  register: "register"
};

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, authLoading, loginUser } = useApp();

  const [tab, setTab] = useState(TABS.login);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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

  async function handleLoginSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");

      const result = await apiPost("/auth/login", {
        email: loginForm.email.trim().toLowerCase(),
        password: loginForm.password
      });

      if (!result.ok) {
        setMessage(result.message || "تعذر تسجيل الدخول");
        return;
      }

      const token = result?.data?.token;

      if (!token) {
        setMessage("لم يتم العثور على رمز الجلسة");
        return;
      }

      await loginUser(token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء تسجيل الدخول");
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

      const registerResult = await apiPost("/auth/register", {
        full_name: registerForm.full_name.trim(),
        email: registerForm.email.trim().toLowerCase(),
        phone: registerForm.phone.trim(),
        password: registerForm.password,
        role: "buyer",
        locale: "ar"
      });

      if (!registerResult.ok) {
        setMessage(registerResult.message || "تعذر إنشاء الحساب");
        return;
      }

      const loginResult = await apiPost("/auth/login", {
        email: registerForm.email.trim().toLowerCase(),
        password: registerForm.password
      });

      if (!loginResult.ok) {
        setMessage("تم إنشاء الحساب، لكن تعذر تسجيل الدخول تلقائياً");
        setTab(TABS.login);
        return;
      }

      const token = loginResult?.data?.token;

      if (!token) {
        setMessage("تم إنشاء الحساب، لكن لم يتم العثور على رمز الجلسة");
        setTab(TABS.login);
        return;
      }

      await loginUser(token);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء إنشاء الحساب");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="container section-space" dir="rtl">
      <div style={s.shell}>
        <div style={s.heroPanel}>
          <div style={s.heroBadge}>RAHBA AUTH</div>
          <h1 style={s.heroTitle}>دخول أنيق وآمن إلى رحبة</h1>
          <p style={s.heroText}>
            سجل الدخول أو أنشئ حسابك في ثوانٍ. تابع طلباتك، أكمل الشراء بسرعة،
            وادخل إلى تجربة Marketplace مصممة بروح مغربية عصرية.
          </p>

          <div style={s.heroPoints}>
            <div style={s.pointCard}>
              <div style={s.pointIcon}>✓</div>
              <div>
                <div style={s.pointTitle}>دخول سريع</div>
                <div style={s.pointText}>عبر Google أو البريد الإلكتروني</div>
              </div>
            </div>

            <div style={s.pointCard}>
              <div style={s.pointIcon}>🔒</div>
              <div>
                <div style={s.pointTitle}>حماية أفضل</div>
                <div style={s.pointText}>جلسات آمنة وتتبع أسهل للطلبات</div>
              </div>
            </div>

            <div style={s.pointCard}>
              <div style={s.pointIcon}>🛍️</div>
              <div>
                <div style={s.pointTitle}>شراء أسهل</div>
                <div style={s.pointText}>احفظ بياناتك وواصل التسوق بسلاسة</div>
              </div>
            </div>
          </div>
        </div>

        <div style={s.formPanel}>
          <div style={s.cardGlow} />

          <div style={s.formCard}>
            <div style={s.cardTop}>
              <div style={s.cardBadge}>ابدأ الآن</div>
              <h2 style={s.cardTitle}>مرحباً بك</h2>
              <p style={s.cardSubtitle}>
                ادخل إلى حسابك أو أنشئ حساباً جديداً للاستفادة الكاملة من المنصة.
              </p>
            </div>

            <a href={googleUrl} style={s.googleBtn}>
              <span style={s.googleIcon}>G</span>
              <span style={s.googleText}>
                {loadingGoogle ? "جاري المتابعة عبر Google..." : "المتابعة عبر Google"}
              </span>
            </a>

            <div style={s.divider}>
              <span style={s.dividerLine} />
              <span style={s.dividerText}>أو أكمل بالبريد الإلكتروني</span>
              <span style={s.dividerLine} />
            </div>

            <div style={s.tabs}>
              <button
                type="button"
                onClick={() => {
                  setTab(TABS.register);
                  setMessage("");
                }}
                style={{
                  ...s.tabBtn,
                  ...(tab === TABS.register ? s.tabBtnActive : {})
                }}
              >
                إنشاء حساب
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab(TABS.login);
                  setMessage("");
                }}
                style={{
                  ...s.tabBtn,
                  ...(tab === TABS.login ? s.tabBtnActive : {})
                }}
              >
                تسجيل الدخول
              </button>
            </div>

            {message ? <div style={s.messageBox}>{message}</div> : null}

            {tab === TABS.login ? (
              <form style={s.form} onSubmit={handleLoginSubmit}>
                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="name@example.com"
                    style={s.input}
                    autoComplete="email"
                  />
                </Field>

                <Field label="كلمة السر">
                  <input
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    style={s.input}
                    autoComplete="current-password"
                  />
                </Field>

                <button
                  type="submit"
                  style={s.primaryBtn}
                  disabled={submitting || authLoading || loadingGoogle}
                >
                  {submitting ? "جاري تسجيل الدخول..." : "دخول"}
                </button>
              </form>
            ) : (
              <form style={s.form} onSubmit={handleRegisterSubmit}>
                <Field label="الاسم الكامل">
                  <input
                    type="text"
                    value={registerForm.full_name}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                    placeholder="Talidi Chafik"
                    style={s.input}
                    autoComplete="name"
                  />
                </Field>

                <Field label="البريد الإلكتروني">
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="talidichafiq@gmail.com"
                    style={s.input}
                    autoComplete="email"
                  />
                </Field>

                <Field label="رقم الهاتف">
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="0612345678"
                    style={s.input}
                    autoComplete="tel"
                  />
                </Field>

                <Field label="كلمة السر">
                  <input
                    type="password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="••••••••"
                    style={s.input}
                    autoComplete="new-password"
                  />
                </Field>

                <Field label="تأكيد كلمة السر">
                  <input
                    type="password"
                    value={registerForm.confirm_password}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        confirm_password: e.target.value
                      }))
                    }
                    placeholder="••••••••"
                    style={s.input}
                    autoComplete="new-password"
                  />
                </Field>

                <button
                  type="submit"
                  style={s.primaryBtn}
                  disabled={submitting || authLoading || loadingGoogle}
                >
                  {submitting ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
                </button>
              </form>
            )}

            <div style={s.footerRow}>
              <NavLink to="/" style={s.homeLink}>
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
    <label style={s.field}>
      <span style={s.label}>{label}</span>
      {children}
    </label>
  );
}

const s = {
  shell: {
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "28px",
    alignItems: "stretch"
  },
  heroPanel: {
    position: "relative",
    overflow: "hidden",
    background:
      "linear-gradient(135deg, rgba(14,54,109,0.98) 0%, rgba(19,95,150,0.96) 45%, rgba(15,130,116,0.94) 100%)",
    color: "#fff",
    borderRadius: "30px",
    padding: "38px 32px",
    boxShadow: "0 24px 60px rgba(16,42,84,0.22)",
    minHeight: "680px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between"
  },
  heroBadge: {
    alignSelf: "flex-start",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.18)",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em"
  },
  heroTitle: {
    margin: "18px 0 14px",
    fontSize: "42px",
    lineHeight: 1.15,
    fontWeight: 900
  },
  heroText: {
    margin: 0,
    maxWidth: "560px",
    lineHeight: 1.9,
    color: "rgba(255,255,255,0.9)",
    fontSize: "16px"
  },
  heroPoints: {
    display: "grid",
    gap: "14px",
    marginTop: "28px"
  },
  pointCard: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    padding: "16px 18px",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(8px)"
  },
  pointIcon: {
    width: "44px",
    height: "44px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,0.16)",
    fontWeight: 900
  },
  pointTitle: {
    fontWeight: 800,
    marginBottom: "4px"
  },
  pointText: {
    color: "rgba(255,255,255,0.84)",
    fontSize: "14px"
  },
  formPanel: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  cardGlow: {
    position: "absolute",
    inset: "14px 30px auto auto",
    width: "160px",
    height: "160px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(15,118,110,0.20) 0%, rgba(15,118,110,0) 70%)",
    pointerEvents: "none"
  },
  formCard: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    background: "#fff",
    borderRadius: "28px",
    padding: "30px",
    border: "1px solid #e9dfd1",
    boxShadow: "0 20px 50px rgba(28,47,80,0.12)"
  },
  cardTop: {
    marginBottom: "18px"
  },
  cardBadge: {
    display: "inline-block",
    padding: "7px 12px",
    borderRadius: "999px",
    background: "#eef6ff",
    color: "#17407c",
    fontSize: "12px",
    fontWeight: 800,
    marginBottom: "12px"
  },
  cardTitle: {
    margin: 0,
    color: "#173b74",
    fontWeight: 900,
    fontSize: "30px"
  },
  cardSubtitle: {
    margin: "10px 0 0",
    color: "#6d6255",
    lineHeight: 1.8,
    fontSize: "15px"
  },
  googleBtn: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    textDecoration: "none",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d8e1ef",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    color: "#173b74",
    fontWeight: 800,
    transition: "all 0.2s ease"
  },
  googleIcon: {
    width: "34px",
    height: "34px",
    borderRadius: "999px",
    background: "#fff",
    border: "1px solid #e6e6e6",
    display: "grid",
    placeItems: "center",
    color: "#ea4335",
    fontWeight: 900
  },
  googleText: {
    fontSize: "15px"
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
    background: "#ece3d8"
  },
  dividerText: {
    color: "#7f7468",
    fontSize: "13px",
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    background: "#f7f4ee",
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
    color: "#6f6459",
    transition: "all 0.2s ease"
  },
  tabBtnActive: {
    background: "#fff",
    color: "#173b74",
    boxShadow: "0 8px 20px rgba(20,40,72,0.08)"
  },
  messageBox: {
    marginBottom: "16px",
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#fff7ed",
    color: "#9a4b0f",
    border: "1px solid #fed7aa",
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
    color: "#2e241d",
    fontWeight: 800,
    fontSize: "14px"
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #ddd2c5",
    outline: "none",
    fontSize: "15px",
    background: "#fffdfa",
    color: "#1f1b16"
  },
  primaryBtn: {
    marginTop: "6px",
    border: "none",
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #173b74 0%, #1b5da0 55%, #0f766e 100%)",
    color: "#fff",
    fontWeight: 900,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 18px 30px rgba(23,59,116,0.18)"
  },
  footerRow: {
    marginTop: "18px",
    display: "flex",
    justifyContent: "center"
  },
  homeLink: {
    color: "#173b74",
    fontWeight: 800,
    textDecoration: "none"
  }
};
