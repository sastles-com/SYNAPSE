import { ISSUES, C } from '../data'
import { Card, CardTitle, StatusPill, Pill } from './Shared'

const TASKS = [
  { text: "サスペンション CAD レビュー",  owner: "田中", due: "2026/05/30", status: "done"     },
  { text: "ブレーキシステム仕様書 作成",   owner: "山田", due: "2026/06/03", status: "progress" },
  { text: "充電インフラ要件 定義",         owner: "鈴木", due: "2026/06/05", status: "todo"     },
  { text: "HMI デザインレビュー",          owner: "佐藤", due: "2026/06/06", status: "todo"     },
]

export default function Tasks() {
  return (
    <div style={{ padding: 14, background: C.bg }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <Card>
          <CardTitle icon="⚠">課題管理</CardTitle>
          {ISSUES.map((iss, i) => (
            <div key={i} style={{ padding: "9px 0", borderBottom: i < ISSUES.length - 1 ? `.5px solid ${C.border}` : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Pill bg={iss.sev === "high" ? "#FCEBEB" : "#FAEEDA"} color={iss.sev === "high" ? "#791F1F" : "#633806"}>
                  {iss.sev === "high" ? "重大" : "中"}
                </Pill>
                <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{iss.title}</span>
                <span style={{ fontSize: 11, color: "#888" }}>{iss.id}</span>
              </div>
              <div style={{ fontSize: 11, color: "#888", display: "flex", gap: 10 }}>
                <span>担当: {iss.owner}</span><span>領域: {iss.area}</span><span>登録: {iss.openedAt}</span>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle icon="✅">今週のタスク</CardTitle>
          {TASKS.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: i < TASKS.length - 1 ? `.5px solid ${C.border}` : "none" }}>
              <span style={{ fontSize: 18, color: t.status === "done" ? C.teal : "#B4B2A9" }}>
                {t.status === "done" ? "☑" : "☐"}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12 }}>{t.text}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{t.owner} — {t.due}</div>
              </div>
              <StatusPill status={t.status} />
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
