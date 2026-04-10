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
          color: "#16356b",
          fontSize: "22px",
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
            color: "#64748b",
            fontSize: "14px",
            lineHeight: 1.8
          }}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
