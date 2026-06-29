import { PARTS, MILESTONES, ISSUES, ACTIVITIES, C } from '../data'
import { Card, CardTitle, Bar, StatusPill, Pill } from './Shared'

export default function Dashboard() {
  const avg  = (arr, key) => Math.round(arr.reduce((s, p) => s + p[key], 0) / arr.length)
  const overall = avg(PARTS, 'pct')
  const design  = avg(PARTS, 'design')
  const test    = avg(PARTS, 'test')
  const dsgn    = avg(PARTS, 'dsgn')
  const highIss = ISSUES.filter(i => i.sev === 'high').length
  const riskParts = PARTS.filter(p => p.status === 'issue' || p.status === 'delay')

  return (
    <div style={{ padding: 14, background: C.bg, display: "flex", flexDirection: "column", gap: 10 }}>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        {[
          { label: "全体進捗",           value: <>{overall}<span style={{ fontSize: 14, fontWeight: 400 }}>%</span></>,      sub: "▲ 先週比 +3%",        subC: C.teal },
          { label: "完了タスク",         value: <>124<span style={{ fontSize: 13, fontWeight: 400, color: "#888" }}>/210</span></>, sub: "今週 12件完了",  subC: C.teal },
          { label: "オープン課題",       value: <span style={{ color: C.red }}>{ISSUES.length}</span>,                        sub: `⚠ 重大 ${highIss}件`, subC: C.red  },
          { label: "次期マイルストーン", value: <span style={{ fontSize: 13, fontWeight: 500 }}>試作車完成</span>,           sub: "2026/08/15 まで",    subC: "#888" },
        ].map(({ label, value, sub, subC }) => (
          <Card key={label}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: 11, marginTop: 4, color: subC }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* 3-domain row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
        {[
          { name: "設計進捗",   pct: design, color: C.blueDk, bg: "#E6F1FB", icon: "✏️", sub: "詳細設計 進行中"   },
          { name: "実験進捗",   pct: test,   color: C.teal,   bg: "#E1F5EE", icon: "🧪", sub: "基本性能試験 進行中" },
          { name: "デザイン進捗", pct: dsgn,  color: "#534AB7",bg: "#EEEDFE", icon: "🎨", sub: "CMF 承認待ち"      },
        ].map(({ name, pct, color, bg, icon, sub }) => (
          <Card key={name}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 6, fontSize: 14 }}>{icon}</div>
            <div style={{ fontSize: 11, fontWeight: 500, color, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 20, fontWeight: 500, color }}>{pct}%</div>
            <Bar pct={pct} color={color} />
            <div style={{ fontSize: 11, color: "#888" }}>{sub}</div>
          </Card>
        ))}
      </div>

      {/* Main grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Predictive risk（原則③）*/}
          <Card>
            <CardTitle icon="⚡">
              予測リスクアラート
              <Pill bg="#EEEDFE" color="#3C3489" style={{ marginLeft: 6 }}>ACC型 原則③</Pill>
            </CardTitle>
            {riskParts.length === 0
              ? <div style={{ fontSize: 12, color: "#888", textAlign: "center", padding: "12px 0" }}>重大リスクなし</div>
              : riskParts.map(p => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: `.5px solid ${C.border}` }}>
                    <div style={{ width: 5, height: 28, borderRadius: 2, background: p.status === "issue" ? C.red : C.amber, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: "#888" }}>{p.issue || "進捗遅延"}</div>
                    </div>
                    <Pill bg={p.status === "issue" ? "#FCEBEB" : "#FAEEDA"} color={p.status === "issue" ? "#791F1F" : "#633806"}>
                      リスク {p.status === "issue" ? "高" : "中"}
                    </Pill>
                  </div>
                ))
            }
          </Card>

          {/* Phase progress */}
          <Card>
            <CardTitle icon="📊">フェーズ別進捗</CardTitle>
            {[
              { label: "コンセプト設計", pct: 100, color: C.teal  },
              { label: "詳細設計",       pct: 68,  color: C.blue  },
              { label: "試作・検証",     pct: 15,  color: C.amber },
              { label: "量産準備",       pct: 0,   color: "#B4B2A9" },
            ].map(({ label, pct, color }) => (
              <div key={label} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span>{label}</span><span style={{ fontWeight: 500, color }}>{pct}%</span>
                </div>
                <Bar pct={pct} color={color} />
              </div>
            ))}
          </Card>

          {/* Activity */}
          <Card>
            <CardTitle icon="🕐">直近のアクティビティ</CardTitle>
            {ACTIVITIES.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 8, padding: "7px 0", borderBottom: i < ACTIVITIES.length - 1 ? `.5px solid ${C.border}` : "none" }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: a.dot, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 1 }}>{a.meta}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Milestones */}
          <Card>
            <CardTitle icon="📅">マイルストーン</CardTitle>
            {MILESTONES.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < MILESTONES.length - 1 ? `.5px solid ${C.border}` : "none" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                  background: m.status === "done" ? C.teal : m.status === "active" ? C.blue : "#B4B2A9" }} />
                <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{m.label}</span>
                <StatusPill status={m.status} />
                <span style={{ fontSize: 11, color: "#888" }}>{m.date}</span>
              </div>
            ))}
          </Card>

          {/* Issues */}
          <Card>
            <CardTitle icon="⚠">オープン課題</CardTitle>
            {ISSUES.map((iss, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0", borderBottom: i < ISSUES.length - 1 ? `.5px solid ${C.border}` : "none" }}>
                <div style={{ width: 5, height: 28, borderRadius: 2, flexShrink: 0, background: iss.sev === "high" ? C.red : C.amber }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{iss.title}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{iss.owner} · {iss.area} · {iss.id}</div>
                </div>
                <Pill bg={iss.sev === "high" ? "#FCEBEB" : "#FAEEDA"} color={iss.sev === "high" ? "#791F1F" : "#633806"}>
                  {iss.sev === "high" ? "重大" : "中"}
                </Pill>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
