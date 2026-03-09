import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";
import { useApp } from "../context/AppContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { currentUser, loginUser, logoutUser } = useApp();

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    password: "",
    role: "buyer",
    locale: "ar"
  });

  const [message, setMessage] = useState("");
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingRegister, setLoadingRegister] = useState(false);

  function handleLoginChange(e) {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value
    });
  }

  function handleRegisterChange(e) {
    setRegisterForm({
      ...registerForm,
      [e.target.name]: e.target.value
    });
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoadingLogin(true);
      setMessage("");

      const result = await apiPost("/auth/login", loginForm);

      if (result.ok) {
        await loginUser(result.data.token);
        setMessage("تم تسجيل الدخول بنجاح");
        navigate("/my-orders");
      }
    } catch (err) {
      console.error(err);
      setMessage("فشل تسجيل الدخول");
    } finally {
      setLoadingLogin(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();

    try {
      setLoadingRegister(true);
      setMessage("");

      const result = await apiPost("/auth/register", registerForm);

      if (result.ok) {
        setMessage("تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.");
        setRegisterForm({
          full_name: "",
          phone: "",
          email: "",
          password: "",
          role: "buyer",
          locale: "ar"
        });
      }
    } catch (err) {
      console.error(err);
      setMessage("فشل إنشاء الحساب");
    } finally {
      setLoadingRegister(false);
    }
  }

  return (
    <section className="container section-space auth-grid">
      <div className="panel-card">
        <h1>Buyer login</h1>

        {currentUser ? (
          <div style={{ display: "grid", gap: "12px" }}>
            <p>Logged in as: {currentUser.email}</p>
            <p>Role: {currentUser.role}</p>
            <button className="btn btn-secondary" onClick={logoutUser}>
              Logout
            </button>
          </div>
        ) : (
          <form className="form-grid" onSubmit={handleLogin}>
            <input
              name="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={handleLoginChange}
            />
            <input
              name="password"
              placeholder="Password"
              type="password"
              value={loginForm.password}
              onChange={handleLoginChange}
            />
            <button className="btn btn-primary" disabled={loadingLogin}>
              {loadingLogin ? "Logging in..." : "Login"}
            </button>
          </form>
        )}
      </div>

      <div className="panel-card">
        <h1>Buyer registration</h1>
        <form className="form-grid" onSubmit={handleRegister}>
          <input
            name="full_name"
            placeholder="Full name"
            value={registerForm.full_name}
            onChange={handleRegisterChange}
          />
          <input
            name="phone"
            placeholder="Phone"
            value={registerForm.phone}
            onChange={handleRegisterChange}
          />
          <input
            name="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={handleRegisterChange}
          />
          <input
            name="password"
            placeholder="Password"
            type="password"
            value={registerForm.password}
            onChange={handleRegisterChange}
          />
          <button className="btn btn-secondary" disabled={loadingRegister}>
            {loadingRegister ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>

      {message ? (
        <div className="panel-card" style={{ gridColumn: "1 / -1" }}>
          {message}
        </div>
      ) : null}
    </section>
  );
}
