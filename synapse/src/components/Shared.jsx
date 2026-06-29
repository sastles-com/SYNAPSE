// ─────────────────────────────────────────────────────────────
// SYNAPSE — Shared UI Components
// ─────────────────────────────────────────────────────────────
import { C, STATUS_LBL } from '../data'

export const Bar = ({ pct, color, h = 5 }) => (
  <div style={{ height: h, background: "#E5E4DC", borderRadius: 99, overflow: "hidden", margin: "4px 0 8px" }}>
    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width .5s ease" }} />
  </div>
)

export const Pill = ({ children, bg, color }) => (
  <span style={{
    fontSize: 10, padding: "2px 8px", borderRadius: 99, fontWeight: 500,
    background: bg, color, whiteSpace: "nowrap", display: "inline-block",
  }}>{children}</span>
)

export const StatusPill = ({ status }) => {
  const map = {
    done:     { bg: "#E1F5EE", c: "#085041" },
    progress: { bg: "#E6F1FB", c: "#0C447C" },
    active:   { bg: "#E6F1FB", c: "#0C447C" },
    delay:    { bg: "#FAEEDA", c: "#633806" },
    issue:    { bg: "#FCEBEB", c: "#791F1F" },
    todo:     { bg: "#F1EFE8", c: "#444441" },
    target:   { bg: "#FAEEDA", c: "#633806" },
    passed:   { bg: "#E1F5EE", c: "#085041" },
  }
  const t = map[status] || map.todo
  return <Pill bg={t.bg} color={t.c}>{STATUS_LBL[status] ?? status}</Pill>
}

export const Card = ({ children, style }) => (
  <div style={{
    background: C.card, border: `.5px solid ${C.border}`,
    borderRadius: 12, padding: "12px 14px", ...style,
  }}>{children}</div>
)

export const CardTitle = ({ icon, children, right }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, justifyContent: "space-between" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "#888" }}>
      {icon && <span>{icon}</span>}{children}
    </div>
    {right}
  </div>
)

export const Logo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true">
    <circle cx="10" cy="19" r="5"  fill="#378ADD" />
    <circle cx="28" cy="9"  r="4"  fill="#1D9E75" />
    <circle cx="28" cy="29" r="4"  fill="#7F77DD" />
    <line x1="15" y1="19" x2="24" y2="10" stroke="#85B7EB" strokeWidth="1.5" />
    <line x1="15" y1="19" x2="24" y2="28" stroke="#AFA9EC" strokeWidth="1.5" />
    <line x1="28" y1="13" x2="28" y2="25" stroke="#5F5E5A" strokeWidth="1" />
  </svg>
)
