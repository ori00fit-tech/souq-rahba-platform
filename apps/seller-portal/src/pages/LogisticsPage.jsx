import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPut } from "../lib/api";

function emptyMethod(method, zone) {
  return {
    provider_method_id: method.id,
    zone_id: zone.id,
    method_enabled: false,
    flat_price: "",
    free_shipping_threshold: "",
    min_order_value: "",
    max_order_value: "",
    handling_days: 0,
    cash_on_delivery_available: false
  };
}

function providerTags(provider) {
  const code = String(provider?.code || "").toLowerCase();
  const name = String(provider?.name || "").toLowerCase();
  const raw = `${code} ${name}`;

  const tags = [];

  if (raw.includes("jibli")) tags.push("محلي");
  if (
    raw.includes("amana") ||
    raw.includes("aramex") ||
    raw.includes("ctm") ||
    raw.includes("ozon") ||
    raw.includes("cathedis")
  ) {
    tags.push("وطني");
  }
  if (raw.includes("dhl") || raw.includes("fedex") || raw.includes("express")) {
    tags.push("سريع");
  }

  if (tags.length === 0) tags.push("شحن");
  return tags;
}

function methodTags(method) {
  const code = String(method?.code || "").toLowerCase();
  const name = String(method?.name || "").toLowerCase();
  const raw = `${code} ${name}`;

  const tags = [];
  if (raw.includes("express")) tags.push("سريع");
  if (raw.includes("standard")) tags.push("قياسي");
  if (tags.length === 0) tags.push("طريقة شحن");
  return tags;
}

function buildForm(providers, zones, settings) {
  return (providers || []).map((provider) => {
    const savedProvider = (settings || []).find(
      (item) => item.provider_id === provider.id
    );

    return {
      provider_id: provider.id,
      provider_name: provider.name,
      provider_enabled: !!savedProvider?.provider_enabled,
      account_label: savedProvider?.account_label || "",
      provider_account_code: savedProvider?.provider_account_code || "",
      expanded: !!savedProvider?.provider_enabled,
      methods: (provider.methods || []).flatMap((method) =>
        (zones || []).map((zone) => {
          const savedMethod = (savedProvider?.methods || []).find(
            (item) =>
              item.provider_method_id === method.id &&
              item.zone_id === zone.id
          );

          return (
            savedMethod || {
              ...emptyMethod(method, zone)
            }
          );
        })
      )
    };
  });
}

export default function LogisticsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [providers, setProviders] = useState([]);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setMessage("");

        const [providersRes, zonesRes, settingsRes] = await Promise.all([
          apiGet("/marketplace/logistics/providers"),
          apiGet("/marketplace/logistics/zones"),
          apiGet("/marketplace/logistics/settings")
        ]);

        if (!mounted) return;

        const providersData = providersRes?.data || [];
        const zonesData = zonesRes?.data || [];
        const settingsData = settingsRes?.data || [];

        setProviders(providersData);
        setZones(zonesData);
        setForm(buildForm(providersData, zonesData, settingsData));
      } catch (err) {
        console.error(err);
        if (mounted) {
          setMessageType("error");
          setMessage("تعذر تحميل إعدادات اللوجيستيك");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const providerMap = useMemo(() => {
    return new Map((providers || []).map((item) => [item.id, item]));
  }, [providers]);

  function updateProvider(providerId, updater) {
    setForm((prev) =>
      prev.map((item) =>
        item.provider_id === providerId ? updater(item) : item
      )
    );
  }

  function updateMethod(providerId, providerMethodId, zoneId, patch) {
    updateProvider(providerId, (provider) => ({
      ...provider,
      methods: provider.methods.map((method) =>
        method.provider_method_id === providerMethodId && method.zone_id === zoneId
          ? { ...method, ...patch }
          : method
      )
    }));
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage("");

      const payload = {
        providers: form.map((provider) => ({
          provider_id: provider.provider_id,
          provider_enabled: !!provider.provider_enabled,
          account_label: provider.account_label?.trim() || null,
          provider_account_code: provider.provider_account_code?.trim() || null,
          methods: provider.methods.map((method) => ({
            provider_method_id: method.provider_method_id,
            zone_id: method.zone_id,
            method_enabled: !!method.method_enabled,
            flat_price:
              method.flat_price === "" || method.flat_price == null
                ? null
                : Number(method.flat_price),
            free_shipping_threshold:
              method.free_shipping_threshold === "" || method.free_shipping_threshold == null
                ? null
                : Number(method.free_shipping_threshold),
            min_order_value:
              method.min_order_value === "" || method.min_order_value == null
                ? null
                : Number(method.min_order_value),
            max_order_value:
              method.max_order_value === "" || method.max_order_value == null
                ? null
                : Number(method.max_order_value),
            handling_days: Number(method.handling_days || 0),
            cash_on_delivery_available: !!method.cash_on_delivery_available
          }))
        }))
      };

      const res = await apiPut("/marketplace/logistics/settings", payload);

      if (!res?.ok) {
        setMessageType("error");
        setMessage(res?.error?.message || res?.message || "تعذر حفظ إعدادات الشحن");
        return;
      }

      setMessageType("success");
      setMessage("تم حفظ إعدادات الشحن واللوجيستيك بنجاح");
    } catch (err) {
      console.error(err);
      setMessageType("error");
      setMessage(err?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="page-shell" dir="rtl">
        <div className="page-header">
          <h1>إعدادات الشحن</h1>
          <p>جاري تحميل شركات التوصيل والمناطق...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell" dir="rtl">
      <div style={s.hero}>
        <div>
          <div style={s.eyebrow}>Rahba Logistics</div>
          <h1 style={s.heroTitle}>إعدادات الشحن واللوجيستيك</h1>
          <p style={s.heroText}>
            فعّل شركات التوصيل وحدد الأسعار حسب المنطقة وطريقة الشحن، مع دعم الشحن المجاني والدفع عند الاستلام.
          </p>
        </div>

        <div style={s.heroStats}>
          <div style={s.statCard}>
            <strong>{providers.length}</strong>
            <span>شركات متاحة</span>
          </div>
          <div style={s.statCard}>
            <strong>{zones.length}</strong>
            <span>مناطق شحن</span>
          </div>
        </div>
      </div>

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

      <div style={s.providersGrid}>
        {form.map((provider) => {
          const providerMeta = providerMap.get(provider.provider_id);
          const activeMethodsCount = provider.methods.filter((item) => item.method_enabled).length;

          return (
            <div key={provider.provider_id} style={s.providerCard}>
              <button
                type="button"
                onClick={() =>
                  updateProvider(provider.provider_id, (current) => ({
                    ...current,
                    expanded: !current.expanded
                  }))
                }
                style={s.providerHeaderButton}
              >
                <div style={{ textAlign: "right" }}>
                  <div style={s.providerTitleRow}>
                    <span style={s.providerTitle}>{provider.provider_name}</span>
                    <span style={provider.provider_enabled ? s.badgeActive : s.badgeMuted}>
                      {provider.provider_enabled ? "مفعلة" : "غير مفعلة"}
                    </span>
                  </div>

                  <div style={s.providerSubTitle}>
                    {(providerMeta?.methods || []).length} طرق شحن · {activeMethodsCount} مفعلة
                  </div>

                  <div style={s.badgesRow}>
                    {providerTags(providerMeta || provider).map((tag) => (
                      <span key={tag} style={s.neutralBadge}>{tag}</span>
                    ))}
                  </div>
                </div>

                <span style={s.chevron}>{provider.expanded ? "▾" : "▸"}</span>
              </button>

              {provider.expanded ? (
                <div style={s.providerBody}>
                  <div style={s.inlineToggleRow}>
                    <label style={s.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={!!provider.provider_enabled}
                        onChange={(e) =>
                          updateProvider(provider.provider_id, (current) => ({
                            ...current,
                            provider_enabled: e.target.checked
                          }))
                        }
                      />
                      تفعيل الشركة
                    </label>
                  </div>

                  <div style={s.topInputsGrid}>
                    <label style={s.label}>
                      <span>اسم الحساب</span>
                      <input
                        style={s.input}
                        value={provider.account_label}
                        onChange={(e) =>
                          updateProvider(provider.provider_id, (current) => ({
                            ...current,
                            account_label: e.target.value
                          }))
                        }
                        placeholder="مثلاً: Main Account"
                      />
                    </label>

                    <label style={s.label}>
                      <span>رمز الحساب / المرجع</span>
                      <input
                        style={s.input}
                        value={provider.provider_account_code}
                        onChange={(e) =>
                          updateProvider(provider.provider_id, (current) => ({
                            ...current,
                            provider_account_code: e.target.value
                          }))
                        }
                        placeholder="Optional"
                      />
                    </label>
                  </div>

                  <div style={s.methodStack}>
                    {(providerMeta?.methods || []).map((method) => (
                      <div key={method.id} style={s.methodCard}>
                        <div style={s.methodHead}>
                          <div>
                            <div style={s.methodName}>{method.name}</div>
                            <div style={s.methodMeta}>
                              {method.description || "Shipping method"} · {method.estimated_min_days ?? "-"} - {method.estimated_max_days ?? "-"} أيام
                            </div>
                            <div style={s.badgesRow}>
                              {methodTags(method).map((tag) => (
                                <span key={tag} style={s.softBadge}>{tag}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={s.zoneStack}>
                          {zones.map((zone) => {
                            const row = provider.methods.find(
                              (item) =>
                                item.provider_method_id === method.id &&
                                item.zone_id === zone.id
                            );

                            if (!row) return null;

                            return (
                              <div key={`${method.id}_${zone.id}`} style={s.zoneCard}>
                                <div style={s.zoneHeader}>
                                  <div>
                                    <strong style={s.zoneTitle}>{zone.name}</strong>
                                    <div style={s.zoneMeta}>
                                      {zone.cities?.length ? `${zone.cities.length} مدينة` : "منطقة عامة"}
                                    </div>
                                  </div>

                                  <label style={s.toggleLabel}>
                                    <input
                                      type="checkbox"
                                      checked={!!row.method_enabled}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          method_enabled: e.target.checked
                                        })
                                      }
                                    />
                                    تفعيل
                                  </label>
                                </div>

                                <div style={s.zoneInputsGrid}>
                                  <label style={s.label}>
                                    <span>السعر (MAD)</span>
                                    <input
                                      style={s.input}
                                      type="number"
                                      min="0"
                                      value={row.flat_price ?? ""}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          flat_price: e.target.value
                                        })
                                      }
                                    />
                                  </label>

                                  <label style={s.label}>
                                    <span>حد الشحن المجاني</span>
                                    <input
                                      style={s.input}
                                      type="number"
                                      min="0"
                                      value={row.free_shipping_threshold ?? ""}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          free_shipping_threshold: e.target.value
                                        })
                                      }
                                    />
                                  </label>

                                  <label style={s.label}>
                                    <span>أقل قيمة طلب</span>
                                    <input
                                      style={s.input}
                                      type="number"
                                      min="0"
                                      value={row.min_order_value ?? ""}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          min_order_value: e.target.value
                                        })
                                      }
                                    />
                                  </label>

                                  <label style={s.label}>
                                    <span>أقصى قيمة طلب</span>
                                    <input
                                      style={s.input}
                                      type="number"
                                      min="0"
                                      value={row.max_order_value ?? ""}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          max_order_value: e.target.value
                                        })
                                      }
                                    />
                                  </label>

                                  <label style={s.label}>
                                    <span>مدة التجهيز</span>
                                    <input
                                      style={s.input}
                                      type="number"
                                      min="0"
                                      value={row.handling_days ?? 0}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          handling_days: e.target.value
                                        })
                                      }
                                    />
                                  </label>

                                  <label style={s.codBox}>
                                    <input
                                      type="checkbox"
                                      checked={!!row.cash_on_delivery_available}
                                      onChange={(e) =>
                                        updateMethod(provider.provider_id, method.id, zone.id, {
                                          cash_on_delivery_available: e.target.checked
                                        })
                                      }
                                    />
                                    الدفع عند الاستلام
                                  </label>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div style={s.footerBar}>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          style={{
            ...s.saveButton,
            opacity: saving ? 0.8 : 1
          }}
        >
          {saving ? "جاري حفظ إعدادات اللوجيستيك..." : "حفظ إعدادات اللوجيستيك"}
        </button>
      </div>
    </section>
  );
}

const s = {
  hero: {
    background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 55%, #14b8a6 100%)",
    borderRadius: "22px",
    padding: "22px",
    color: "#fff",
    display: "grid",
    gap: "18px",
    boxShadow: "0 18px 40px rgba(14, 165, 233, 0.18)"
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    opacity: 0.9,
    letterSpacing: "0.08em"
  },
  heroTitle: {
    margin: "6px 0 10px",
    fontSize: "28px",
    lineHeight: 1.15,
    fontWeight: "900"
  },
  heroText: {
    margin: 0,
    lineHeight: 1.9,
    fontSize: "15px",
    maxWidth: "720px"
  },
  heroStats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px"
  },
  statCard: {
    background: "rgba(255,255,255,0.14)",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "4px"
  },
  providersGrid: {
    display: "grid",
    gap: "16px",
    marginTop: "18px"
  },
  providerCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)"
  },
  providerHeaderButton: {
    width: "100%",
    background: "#fff",
    border: "none",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer"
  },
  providerTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },
  providerTitle: {
    color: "#0f172a",
    fontWeight: "900",
    fontSize: "20px"
  },
  providerSubTitle: {
    color: "#64748b",
    fontSize: "13px",
    marginTop: "6px"
  },
  badgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px"
  },
  neutralBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "800"
  },
  softBadge: {
    background: "#f0fdf4",
    color: "#166534",
    border: "1px solid #bbf7d0",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "800"
  },
  badgeActive: {
    background: "#dcfce7",
    color: "#166534",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "800"
  },
  badgeMuted: {
    background: "#e2e8f0",
    color: "#334155",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "12px",
    fontWeight: "800"
  },
  chevron: {
    fontSize: "22px",
    color: "#334155",
    fontWeight: "900"
  },
  providerBody: {
    borderTop: "1px solid #eef2f7",
    padding: "18px",
    display: "grid",
    gap: "16px",
    background: "#f8fafc"
  },
  inlineToggleRow: {
    display: "flex",
    justifyContent: "flex-start"
  },
  toggleLabel: {
    display: "inline-flex",
    gap: "8px",
    alignItems: "center",
    fontWeight: "800",
    color: "#0f172a"
  },
  topInputsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px"
  },
  methodStack: {
    display: "grid",
    gap: "14px"
  },
  methodCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "12px"
  },
  methodHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "start",
    gap: "12px"
  },
  methodName: {
    fontWeight: "900",
    fontSize: "17px",
    color: "#0f172a"
  },
  methodMeta: {
    marginTop: "4px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.7
  },
  zoneStack: {
    display: "grid",
    gap: "12px"
  },
  zoneCard: {
    background: "#fafafa",
    border: "1px solid #edf2f7",
    borderRadius: "14px",
    padding: "12px",
    display: "grid",
    gap: "12px"
  },
  zoneHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap"
  },
  zoneTitle: {
    color: "#0f172a"
  },
  zoneMeta: {
    color: "#64748b",
    fontSize: "12px",
    marginTop: "4px"
  },
  zoneInputsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px"
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
    minHeight: "48px",
    borderRadius: "14px",
    border: "1px solid #dbe4ee",
    padding: "0 14px",
    fontSize: "14px",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box"
  },
  codBox: {
    minHeight: "48px",
    borderRadius: "14px",
    border: "1px dashed #cbd5e1",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "800",
    color: "#0f172a",
    background: "#fff"
  },
  footerBar: {
    position: "sticky",
    bottom: "12px",
    marginTop: "18px",
    display: "flex",
    justifyContent: "center",
    zIndex: 5
  },
  saveButton: {
    minWidth: "280px",
    border: "none",
    borderRadius: "16px",
    padding: "16px 20px",
    background: "linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 55%, #14b8a6 100%)",
    color: "#fff",
    fontWeight: "900",
    fontSize: "16px",
    boxShadow: "0 16px 30px rgba(14, 165, 233, 0.18)",
    cursor: "pointer"
  },
  messageBox: {
    marginTop: "16px",
    borderRadius: "14px",
    padding: "14px 16px",
    fontWeight: "700"
  },
  messageSuccess: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    color: "#065f46"
  },
  messageError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b"
  }
};