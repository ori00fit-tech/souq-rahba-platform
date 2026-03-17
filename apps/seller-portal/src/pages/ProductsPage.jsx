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
      <div className="products-topbar">
        <div className="page-header">
          <h1>المنتجات</h1>
          <p>إدارة المنتجات، الأسعار، المخزون وصفحات العرض</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/products/new")}
          className="ui-btn ui-btn--accent"
        >
          + إضافة منتج
        </button>
      </div>

      <div className="stats-grid">
        <StatCard label="إجمالي المنتجات" value={stats.total} />
        <StatCard label="المنتجات النشطة" value={stats.active} />
        <StatCard label="المنتجات المميزة" value={stats.featured} />
        <StatCard label="نفد المخزون" value={stats.outOfStock} />
      </div>

      {message ? <div className="ui-message">{message}</div> : null}

      {!products.length ? (
        <div className="ui-empty">
          <strong>لا توجد منتجات بعد</strong>
          <p style={{ margin: "8px 0 0" }}>ابدأ بإضافة أول منتج داخل متجرك.</p>
        </div>
      ) : (
        <div className="product-cards-grid">
          {products.map((product) => (
            <article key={product.id} className="product-admin-card">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title_ar || "product"}
                  className="product-admin-image"
                />
              ) : (
                <div className="product-admin-noimage">No image</div>
              )}

              <div className="product-admin-body">
                <div className="product-admin-badges">
                  <span className="ui-badge ui-badge--info">
                    {product.status || "active"}
                  </span>

                  {Number(product.featured) === 1 ? (
                    <span className="ui-badge ui-badge--warning">featured</span>
                  ) : null}
                </div>

                <h3 className="product-admin-title">{product.title_ar || "بدون اسم"}</h3>

                <p className="product-admin-text">
                  {product.description_ar || "بدون وصف مختصر"}
                </p>

                <div className="product-admin-meta">
                  <div><strong>السعر:</strong> {product.price_mad || 0} MAD</div>
                  <div><strong>المخزون:</strong> {product.stock || 0}</div>
                  <div><strong>Slug:</strong> {product.slug || "—"}</div>
                </div>

                <div className="product-admin-actions">
                  <Link to={`/products/${product.id}/edit`} className="ui-btn ui-btn--secondary">
                    تعديل
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="ui-btn product-admin-danger"
                  >
                    {deletingId === product.id ? "جاري الحذف..." : "حذف"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="products-pagination">
        <span>الصفحة: {pagination.page}</span>
        <span>المجموع: {pagination.total}</span>
        <span>عدد الصفحات: {pagination.pages}</span>
      </div>
    </section>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="stat-card-ui">
      <div className="stat-card-ui__value">{value}</div>
      <div className="stat-card-ui__label">{label}</div>
    </div>
  );
}
