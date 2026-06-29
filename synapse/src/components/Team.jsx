import { TEAM, C } from '../data'
import { Card } from './Shared'

export default function Team() {
  return (
    <div style={{ padding: 14, background: C.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }}>
        {TEAM.map(m => (
          <Card key={m.name} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: m.initBg, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 500, color: m.initC }}>
              {m.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{m.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>{m.role}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>担当: {m.area}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#888" }}>タスク: <b style={{ color: "#222" }}>{m.tasks}</b></div>
              <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>課題: <b style={{ color: m.issues > 1 ? C.red : C.amber }}>{m.issues}</b></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
