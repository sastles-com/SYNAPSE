import { DOCS, C } from '../data'
import { Card, CardTitle, StatusPill } from './Shared'

export default function Docs() {
  return (
    <div style={{ padding: 14, background: C.bg }}>
      <Card>
        <CardTitle icon="📁">ドキュメント管理</CardTitle>
        {DOCS.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < DOCS.length - 1 ? `.5px solid ${C.border}` : "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: "#F1EFE8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{d.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{d.owner} · {d.date} · {d.type} · {d.size}</div>
            </div>
            <StatusPill status={d.status} />
          </div>
        ))}
      </Card>
    </div>
  )
}
