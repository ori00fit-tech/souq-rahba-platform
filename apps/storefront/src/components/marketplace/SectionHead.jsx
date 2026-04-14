import { UI } from "./uiTokens";

export default function SectionHead({
  chip = "SECTION",
  title,
  subtitle,
  align = "right"
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        textAlign: align
      }}
    >
      <div style={s.chip}>{chip}</div>

      <h2 style={s.title}>{title}</h2>

      {subtitle && <p style={s.subtitle}>{subtitle}</p>}
    </div>
  );
}

const s = {
  chip: {
    display: "inline-flex",
    alignItems: "center",
    width: "fit-content",
    height: "26px",
    padding: "0 10px",
    borderRadius: UI.radius.pill,
    background: UI.colors.accentMuted,
    color: UI.colors.accent,
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.04em"
  },
  title: {
    margin: 0,
    color: UI.colors.text,
    fontSize: UI.type.titleMd,
    fontWeight: 600,
    lineHeight: 1.3
  },
  subtitle: {
    margin: 0,
    color: UI.colors.textMuted,
    fontSize: UI.type.body,
    lineHeight: 1.7
  }
};
