// ─────────────────────────────────────────────────────────────
// SYNAPSE02 — Shared UI Components
// synapse01 の Bar/Pill/StatusPill/Card/CardTitle/Logo を流用し、
// ループ用に Gauge（staleness）/ ModeBar（多峰分布）/ TempStripe（温度帯）を追加。
// ─────────────────────────────────────────────────────────────
import { C, STATUS_LBL, DOMAINS, DOMAIN_BY_ID, domainColor, domainLabel,
  CLASS_HEX, CLASS_LBL, tempColorHex, stalenessColorHex } from '../data'

// ── 流用（synapse01 と同一） ───────────────────────────────────
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

// ── synapse02 追加部品 ─────────────────────────────────────────

// Lead — 各タブ上部の「この画面は何を見せているか」1〜2文リード（自己説明）
export const Lead = ({ title, sub, cpc, children }) => (
  <div style={{ padding: "14px 18px 4px" }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: "#1a2634" }}>{title}</span>
      {cpc && <span style={{ fontSize: 11, color: "#999", fontStyle: "italic" }}>{cpc}</span>}
    </div>
    {sub && <div style={{ fontSize: 12, color: "#666", marginTop: 3, lineHeight: 1.6, maxWidth: 820 }}>{sub}</div>}
    {children}
  </div>
)

// タブの本体ラッパ（背景トーンを統一）
export const TabBody = ({ children, style }) => (
  <div style={{ background: C.bg, padding: "6px 18px 20px", ...style }}>{children}</div>
)

// ドメインの色チップ＋ラベル
export const DomainChip = ({ id, small }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: small ? 10 : 11, whiteSpace: "nowrap" }}>
    <span style={{ width: 8, height: 8, borderRadius: "50%", background: domainColor(id), flexShrink: 0 }} />
    {domainLabel(id)}
  </span>
)

export const ClassPill = ({ cls }) => (
  <Pill bg={CLASS_HEX[cls] + "22"} color={CLASS_HEX[cls]}>{CLASS_LBL[cls] ?? cls}</Pill>
)

// Gauge — staleness 半減期ゲージ（0=新鮮 1=減衰）。物理接地でリセットされる
export const Gauge = ({ value, halfLife, label = "staleness", h = 6 }) => {
  const pct = Math.round(value * 100)
  const col = stalenessColorHex(value)
  return (
    <div style={{ margin: "3px 0 6px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#999", marginBottom: 2 }}>
        <span>{label}{halfLife ? ` · 半減期 ${halfLife}週` : ""}</span>
        <span style={{ color: col, fontWeight: 500 }}>{value >= 1 ? "減衰（要接地）" : value <= 0.05 ? "新鮮" : `${pct}%`}</span>
      </div>
      <div style={{ height: h, background: "#E5E4DC", borderRadius: 99, overflow: "hidden", position: "relative" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: col, transition: "width .4s ease" }} />
        {/* 半減期ライン（50%位置） */}
        <div style={{ position: "absolute", left: "50%", top: -1, bottom: -1, width: 1, background: "rgba(0,0,0,.25)" }} />
      </div>
    </div>
  )
}

// ModeBar — 多峰分布を候補値の積み上げバーで表示
export const ModeBar = ({ modes, h = 22, showLabels = true }) => {
  // backers ドメイン色で塗る（複数 backers は先頭色）。単峰=1色、多峰=分割
  const palette = [C.blue, C.amber, C.purple, C.teal, C.gray]
  return (
    <div style={{ margin: "4px 0 6px" }}>
      <div style={{ display: "flex", height: h, borderRadius: 6, overflow: "hidden", border: `.5px solid ${C.border}` }}>
        {modes.map((m, i) => {
          const col = m.backers?.length ? domainColor(m.backers[0]) : palette[i % palette.length]
          return (
            <div key={i} title={`${m.value} · ${m.share}%`} style={{
              width: `${m.share}%`, background: col, position: "relative",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "width .4s ease", minWidth: m.share > 0 ? 2 : 0,
            }}>
              {m.share >= 18 && <span style={{ fontSize: 10, color: "#fff", fontWeight: 600 }}>{m.share}%</span>}
            </div>
          )
        })}
      </div>
      {showLabels && (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginTop: 5 }}>
          {modes.map((m, i) => {
            const col = m.backers?.length ? domainColor(m.backers[0]) : palette[i % palette.length]
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: col, flexShrink: 0 }} />
                <span style={{ flex: 1, color: "#333" }}>{m.value}</span>
                <span style={{ color: "#999", fontSize: 10 }}>
                  {m.backers?.map(b => DOMAIN_BY_ID[b]?.label).filter(Boolean).join("・")}
                </span>
                <span style={{ fontWeight: 600, color: col, minWidth: 30, textAlign: "right" }}>{m.share}%</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// TempStripe — 温度帯（高温=赤 → 凍結=青）。1本のヒートバー
export const TempStripe = ({ temp, collapsed, reheated, h = 8, width = "100%" }) => {
  const col = collapsed ? "#3B82F6" : tempColorHex(temp)
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "2px 0" }}>
      <div style={{ width, height: h, borderRadius: 99, background: col, position: "relative",
        boxShadow: temp > 0.7 && !collapsed ? "0 0 6px rgba(229,72,77,.5)" : "none", transition: "background .4s ease" }} />
      <span style={{ fontSize: 10, color: collapsed ? "#3B82F6" : col, fontWeight: 600, whiteSpace: "nowrap" }}>
        {collapsed ? "❄ 凍結" : reheated ? "🔥 再加熱" : temp > 0.7 ? "高温" : temp > 0.35 ? "冷却中" : "低温"}
      </span>
    </div>
  )
}

// Sparkline — 週次系列の簡易折れ線（SVG）
export const Sparkline = ({ values, color = C.blue, w = 120, h = 28, min, max }) => {
  const vals = values.filter(v => v != null)
  if (vals.length < 2) return <div style={{ height: h }} />
  const lo = min != null ? min : Math.min(...vals)
  const hi = max != null ? max : Math.max(...vals)
  const span = hi - lo || 1
  const step = w / (values.length - 1)
  let d = "", started = false
  values.forEach((v, i) => {
    if (v == null) return
    const x = i * step
    const y = h - ((v - lo) / span) * (h - 4) - 2
    d += (started ? " L" : "M") + x.toFixed(1) + "," + y.toFixed(1)
    started = true
  })
  const lastIdx = values.map((v, i) => v != null ? i : -1).filter(i => i >= 0).slice(-1)[0]
  const lastX = lastIdx * step
  const lastY = h - ((values[lastIdx] - lo) / span) * (h - 4) - 2
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" />
      <circle cx={lastX} cy={lastY} r="2.5" fill={color} />
    </svg>
  )
}
