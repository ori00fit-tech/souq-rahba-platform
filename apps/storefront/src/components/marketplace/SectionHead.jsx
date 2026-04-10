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
        display: "grid",
        gap: "8px",
        textAlign: align
      }}
    >
      <div className="ui-chip">{chip}</div>

      <h2
        style={{
          margin: 0,
          color: UI.colors.navy,
          fontSize: UI.type.titleMd,
          fontWeight: 900,
          lineHeight: 1.3
        }}
      >
        {title}
      </h2>

      {subtitle ? (
        <p
          style={{
            margin: 0,
            color: UI.colors.muted,
            fontSize: UI.type.body,
            lineHeight: 1.8
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
