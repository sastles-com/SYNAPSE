import { PHASE_GATES, C } from '../data'
import { Card, Bar, StatusPill, Pill } from './Shared'

export default function Schedule() {
  return (
    <div style={{ padding: 14, background: C.bg }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        フェーズゲート管理 — Go / No-Go 通過状況
        <Pill bg="#EEEDFE" color="#3C3489">医薬品型 原則②</Pill>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PHASE_GATES.map(gate => {
          const met   = gate.conditions.filter(c => c.met).length
          const total = gate.conditions.length
          const pct   = Math.round((met / total) * 100)
          const isPast = gate.status === "passed"
          const isNow  = gate.status === "active"
          return (
            <Card key={gate.id} style={{
              borderLeft: isNow ? `3px solid ${C.blue}` : isPast ? `3px solid ${C.teal}` : `.5px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isPast ? 0 : 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: isPast ? C.teal : isNow ? C.blue : "#E5E4DC",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: isPast || isNow ? "#fff" : "#888", fontSize: 14,
                }}>
                  {isPast ? "✓" : isNow ? "▶" : "○"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{gate.label}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{gate.date}</div>
                </div>
                <StatusPill status={gate.status} />
                <div style={{ fontSize: 12, fontWeight: 500, color: pct === 100 ? C.teal : isNow ? C.blue : "#888" }}>
                  {met}/{total} 条件充足
                </div>
              </div>
              {!isPast && (
                <>
                  <Bar pct={pct} color={isNow ? C.blue : "#B4B2A9"} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                    {gate.conditions.map((cond, i) => (
                      <div key={i} style={{
                        display: "flex", alignItems: "center", gap: 4, fontSize: 11,
                        color: cond.met ? C.teal : "#888", padding: "3px 8px",
                        background: cond.met ? "#E1F5EE" : "#F1EFE8", borderRadius: 99,
                      }}>
                        <span>{cond.met ? "✓" : "○"}</span>{cond.label}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
