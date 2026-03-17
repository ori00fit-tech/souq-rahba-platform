import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiDelete, apiGet } from "../lib/api";

export default function ProductsPage() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setMessage("");

        const res = await apiGet("/catalog/products");

        if (!res?.ok) {
          setMessage(res?.message || "تعذر تحميل المنتجات");
          return;
        }

        const payload = res.data;

        if (Array.isArray(payload)) {
          setProducts(payload);
          setPagination({
            page: 1,
            limit: payload.length,
            total: payload.length,
            pages: 1
          });
          return;
        }

        setProducts(Array.isArray(payload?.items) ? payload.items : []);
        setPagination(
          payload?.pagination || {
            page: 1,
            limit: 12,
            total: 0,
            pages: 1
          }
        );
      } catch (err) {
        console.error(err);
        setMessage("حدث خطأ أثناء تحميل المنتجات");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const featured = products.filter((p) => Number(p.featured) === 1).length;
    const outOfStock = products.filter((p) => Number(p.stock || 0) <= 0).length;

    return { total, active, featured, outOfStock };
  }, [products]);

  async function handleDelete(productId) {
    const confirmed = window.confirm("هل تريد حذف هذا المنتج؟");
    if (!confirmed) return;

    try {
      setDeletingId(productId);
      setMessage("");

      const res = await apiDelete(`/catalog/products/${productId}`);

      if (!res?.ok) {
        setMessage(res?.message || "تعذر حذف المنتج");
        return;
      }

      setProducts((prev) => prev.filter((item) => item.id !== productId));
      setMessage("تم حذف المنتج بنجاح");
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء حذف المنتج");
    } finally {
      setDeletingId("");
    }
  }

  if (loading) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header">
          <h1>المنتجات</h1>
          <p>جاري تحميل المنتجات...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell" dir="rtl">
      <div className="page-header" style={s.header}>
        <div>
          <h1 style={s.title}>المنتجات</h1>
          <p style={s.subtitle}>
            إدارة المنتجات، الأسعار، المخزون والصفحات الغنية للعرض
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/products/new")}
          style={s.primaryBtn}
        >
          + إضافة منتج
        </button>
      </div>

      <div style={s.statsGrid}>
        <StatCard label="إجمالي المنتجات" value={stats.total} />
        <StatCard label="المنتجات النشطة" value={stats.active} />
        <StatCard label="المنتجات المميزة" value={stats.featured} />
        <StatCard label="نفد المخزون" value={stats.outOfStock} />
      </div>

      {message ? <div style={s.message}>{message}</div> : null}

      {!products.length ? (
        <div style={s.emptyBox}>
          <strong>لا توجد منتجات بعد</strong>
          <p style={{ margin: 0, color: "#64748b" }}>
            ابدأ بإضافة أول منتج داخل متجرك.
          </p>
        </div>
      ) : (
        <div style={s.grid}>
          {products.map((product) => (
            <article key={product.id} style={s.card}>
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title_ar}
                  style={s.image}
                />
              ) : (
                <div style={s.noImage}>No image</div>
              )}

              <div style={s.cardBody}>
                <div style={s.badgesRow}>
                  <span style={badgeStyle("#eef2ff", "#1d4ed8")}>
                    {product.status || "active"}
                  </span>

                  {Number(product.featured) === 1 ? (
                    <span style={badgeStyle("#fff7ed", "#c2410c")}>
                      featured
                    </span>
                  ) : null}
                </div>

                <h3 style={s.cardTitle}>{product.title_ar || "بدون اسم"}</h3>

                <p style={s.cardText}>
                  {product.description_ar || "بدون وصف مختصر"}
                </p>

                <div style={s.metaGrid}>
                  <div><strong>السعر:</strong> {product.price_mad || 0} MAD</div>
                  <div><strong>المخزون:</strong> {product.stock || 0}</div>
                  <div><strong>Slug:</strong> {product.slug || "—"}</div>
                </div>

                <div style={s.actionsRow}>
                  <Link to={`/products/${product.id}/edit`} style={s.secondaryBtn}>
                    تعديل
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    style={s.dangerBtn}
                  >
                    {deletingId === product.id ? "جاري الحذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div style={s.paginationBox}>
        <span>الصفحة: {pagination.page}</span>
        <span>المجموع: {pagination.total}</span>
        <span>عدد الصفحات: {pagination.pages}</span>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={s.statCard}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  );
}

function badgeStyle(bg, color) {
  return {
    padding: "6px 10px",
    borderRadius: "999px",
    background: bg,
    color,
    fontSize: "12px",
    fontWeight: 800
  };
}

const s = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    flexWrap: "wrap"
  },
  title: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 900
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#64748b"
  },
  primaryBtn: {
    border: "none",
    background: "#1f3b73",
    color: "#fff",
    borderRadius: "14px",
    padding: "12px 16px",
    fontWeight: 800,
    cursor: "pointer"
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginTop: "18px",
    marginBottom: "18px"
  },
  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "6px"
  },
  statValue: {
    fontSize: "24px",
    fontWeight: 900,
    color: "#0f172a"
  },
  statLabel: {
    color: "#64748b",
    fontWeight: 700
  },
  message: {
    padding: "12px",
    borderRadius: "12px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    marginBottom: "16px"
  },
  emptyBox: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "20px",
    display: "grid",
    gap: "10px"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "16px"
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    overflow: "hidden",
    display: "grid"
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    background: "#fff"
  },
  noImage: {
    width: "100%",
    height: "180px",
    display: "grid",
    placeItems: "center",
    background: "#f8fafc",
    color: "#94a3b8"
  },
  cardBody: {
    padding: "14px",
    display: "grid",
    gap: "12px"
  },
  badgesRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
  },
  cardTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: 800,
    lineHeight: 1.6
  },
  cardText: {
    margin: 0,
    color: "#64748b",
    lineHeight: 1.8,
    minHeight: "48px"
  },
  metaGrid: {
    display: "grid",
    gap: "6px",
    color: "#334155",
    fontSize: "14px"
  },
  actionsRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  secondaryBtn: {
    textDecoration: "none",
    textAlign: "center",
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    background: "#fff",
    color: "#111827",
    fontWeight: 700
  },
  dangerBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "none",
    background: "#7f1d1d",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer"
  },
  paginationBox: {
    marginTop: "18px",
    display: "flex",
    gap: "14px",
    flexWrap: "wrap",
    color: "#64748b",
    fontWeight: 700
  }
};
