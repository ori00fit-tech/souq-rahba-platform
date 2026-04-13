import { useMemo } from "react";
import SectionHead from "./SectionHead";
import SectionShell from "./SectionShell";
import SectionActionLink from "./SectionActionLink";
import { UI } from "./uiTokens";
import { Link } from "react-router-dom";
import { normalizeMarketplaceSellers } from "../../utils/marketplaceSellerMapper";

export default function SellerSpotlightSection({ sellers = [] }) {
  const items = useMemo(
    () => normalizeMarketplaceSellers(sellers),
    [sellers]
  );

  if (!items.length) return null;

  return (
    <SectionShell>
      <div style={s.headRow}>
        <SectionHead
          chip="SELLERS"
          title="باعة ومتاجر مميزة"
          subtitle="اكتشف متاجر نشيطة داخل رحبة وابدأ التسوق من بائعين واضحين"
        />
        <SectionActionLink to="/sellers">عرض الكل ←</SectionActionLink>
      </div>

      <div style={s.grid}>
        {items.map((seller) => (
          <div
            key={seller.id || seller.slug || seller.name}
            className="ui-card-soft"
            style={s.card}
          >
            <div style={s.cardTop}>
              <div style={s.avatar}>{seller.name.slice(0, 1)}</div>

              <div style={s.identity}>
                <div style={s.nameRow}>
                  <strong style={s.name}>{seller.name}</strong>
                  {seller.verified ? <span style={s.verified}>موثوق</span> : null}
                </div>

                <div style={s.meta}>
                  <span>📍 {seller.city}</span>
                  <span>•</span>
                  <span>⭐ {seller.rating || 0}</span>
                </div>
              </div>
            </div>

            <div style={s.statsRow}>
              <div style={s.statBox}>
                <strong style={s.statValue}>{seller.products_count || 0}</strong>
                <span style={s.statLabel}>منتج</span>
              </div>

              <div style={s.statBox}>
                <strong style={s.statValue}>
                  {seller.kyc_status === "approved" || seller.verified ? "نعم" : "—"}
                </strong>
                <span style={s.statLabel}>توثيق</span>
              </div>
            </div>

            <Link
              to={seller.slug ? `/sellers/${seller.slug}` : "#"}
              style={{
                ...s.storeBtn,
                opacity: seller.slug ? 1 : 0.5,
                pointerEvents: seller.slug ? "auto" : "none"
              }}
            >
              عرض المتجر
            </Link>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

const s = {
  headRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
    flexWrap: "wrap"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: UI.spacing.cardGap
  },

  card: {
    padding: UI.spacing.cardPadding,
    display: "grid",
    gap: UI.spacing.cardGap,
    border: `1px solid ${UI.colors.line}`,
    background: UI.colors.softBg,
    borderRadius: UI.radius.xl
  },

  cardTop: {
    display: "flex",
    gap: "12px",
    alignItems: "center"
  },

  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    background: UI.colors.softBlue,
    color: UI.colors.navy,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: "18px",
    flexShrink: 0
  },

  identity: {
    display: "grid",
    gap: "6px"
  },

  nameRow: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    flexWrap: "wrap"
  },

  name: {
    color: UI.colors.ink,
    fontSize: "16px"
  },

  verified: {
    padding: "4px 8px",
    borderRadius: UI.radius.pill,
    background: UI.colors.successBg,
    color: UI.colors.successText,
    border: `1px solid ${UI.colors.successBorder}`,
    fontSize: "11px",
    fontWeight: 900
  },

  meta: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    color: UI.colors.muted,
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px"
  },

  statBox: {
    display: "grid",
    gap: "4px",
    padding: "10px",
    borderRadius: UI.radius.md,
    background: UI.colors.white,
    border: `1px solid ${UI.colors.line}`,
    textAlign: "center"
  },

  statValue: {
    color: UI.colors.navy,
    fontSize: "16px",
    fontWeight: 900
  },

  statLabel: {
    color: UI.colors.muted,
    fontSize: UI.type.caption,
    fontWeight: 700
  },

  storeBtn: {
    textDecoration: "none",
    textAlign: "center",
    padding: "12px 14px",
    borderRadius: UI.radius.md,
    background: UI.colors.white,
    border: `1px solid ${UI.colors.line}`,
    color: UI.colors.navy,
    fontWeight: 900
  }
};
