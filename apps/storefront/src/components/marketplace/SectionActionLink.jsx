import { Link } from "react-router-dom";
import { UI } from "./uiTokens";

export default function SectionActionLink({ to, children }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: "none",
        fontSize: UI.type.bodySm,
        fontWeight: 800,
        color: UI.colors.navy,
        whiteSpace: "nowrap",
        alignSelf: "center",
        padding: "8px 14px",
        borderRadius: UI.radius.sm,
        border: `1.5px solid ${UI.colors.border}`,
        background: UI.colors.white
      }}
    >
      {children}
    </Link>
  );
}
