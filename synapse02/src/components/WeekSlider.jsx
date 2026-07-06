import { C, WEEKS, phaseOf, PHASE_NAME, PHASE_LABELS, OBSERVATIONS, DIVERGENCES } from '../data'

// シナリオ時刻コントロール（全タブ共通・ヘッダー直下に常設）
// 週スライダー W1〜W16 ＋ 再生/一時停止/1週送り。
export default function WeekSlider({ week, setWeek, playing, setPlaying }) {
  const step = dir => { setPlaying(false); setWeek(w => Math.max(1, Math.min(WEEKS, w + dir))) }
  // 物語イベントのあるマーカー週
  const eventWeeks = {}
  OBSERVATIONS.forEach(o => { eventWeeks[o.week] = 'obs' })
  DIVERGENCES.forEach(d => { eventWeeks[d.week] = 'div' })
  const heroNotes = { 6: '第1試作/航続乖離', 7: 'battery 再加熱', 9: 'fossil 発見', 11: 'collapse遅延警告', 12: 'フェーズ遷移', 13: '第2試作/NVH', 14: '金型 collapse', 15: '外部認証' }

  const btn = (label, onClick, active) => (
    <button onClick={onClick} style={{
      background: active ? "rgba(55,138,221,.5)" : "rgba(255,255,255,.08)",
      border: ".5px solid rgba(255,255,255,.15)", borderRadius: 6,
      padding: "4px 10px", fontSize: 12, color: "#B5D4F4", cursor: "pointer",
      fontFamily: "inherit", whiteSpace: "nowrap",
    }}>{label}</button>
  )

  return (
    <div style={{ background: "#0A1522", padding: "8px 16px 10px", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 11, color: "#5F5E5A", fontWeight: 500, whiteSpace: "nowrap" }}>シナリオ時刻</span>
        {btn("◀", () => step(-1))}
        {btn(playing ? "⏸ 一時停止" : "▶ 再生", () => setPlaying(p => !p), playing)}
        {btn("▶|", () => step(1))}
        <div style={{ flex: 1, position: "relative", padding: "0 4px" }}>
          <input type="range" min={1} max={WEEKS} value={week}
            onChange={e => { setPlaying(false); setWeek(Number(e.target.value)) }}
            style={{ width: "100%", accentColor: C.blue }} />
        </div>
        <span style={{ fontSize: 12, color: "#85B7EB", fontWeight: 600, minWidth: 140, textAlign: "right", whiteSpace: "nowrap" }}>
          W{week} / {WEEKS} · {PHASE_NAME[phaseOf(week)]}
        </span>
      </div>
      {/* 週目盛り＋イベントマーカー */}
      <div style={{ display: "flex", gap: 2, marginTop: 4, paddingLeft: 2 }}>
        {Array.from({ length: WEEKS }, (_, i) => i + 1).map(w => {
          const ev = eventWeeks[w]
          return (
            <div key={w} onClick={() => { setPlaying(false); setWeek(w) }} title={heroNotes[w] ? `W${w}: ${heroNotes[w]}` : `W${w}`}
              style={{ flex: 1, cursor: "pointer", textAlign: "center" }}>
              <div style={{
                height: 4, borderRadius: 2, marginBottom: 2,
                background: w === week ? C.blue : w < week ? "rgba(55,138,221,.35)" : "rgba(255,255,255,.1)",
              }} />
              <div style={{ height: 5, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {ev && <div style={{ width: 5, height: 5, borderRadius: "50%", background: ev === 'div' ? C.red : C.teal }} />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
