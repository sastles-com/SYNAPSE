import { Logo } from './Shared'
import { C, phaseOf, PHASE_NAME } from '../data'

// 6タブ。UI第一表示は平易な日本語名、英名（内部ID）は補足。
export const TABS = [
  { id: 'loop',      jp: 'ループ',       en: 'loop' },
  { id: 'consensus', jp: '合意の回し方', en: 'consensus' },
  { id: 'shared',    jp: '共通図',       en: 'shared · w' },
  { id: 'anchor',    jp: '3Dアンカー',   en: 'anchor' },
  { id: 'collapse',  jp: '焼きなまし',   en: 'collapse' },
  { id: 'error',     jp: '答え合わせ',   en: 'error signal' },
]

export default function Header({ active, setActive, week }) {
  const phase = phaseOf(week)
  return (
    <header style={{
      background: C.navy, padding: "10px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Logo />
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#E6F1FB", letterSpacing: 2 }}>
              SYNAPSE<span style={{ color: "#5F5E5A", letterSpacing: 0 }}>02</span>
            </div>
            <div style={{ fontSize: 10, color: "#5F5E5A", letterSpacing: .5 }}>予測開発ループ · NV-2026</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)} title={t.en} style={{
              fontSize: 12, padding: "5px 11px", borderRadius: 6, border: "none", cursor: "pointer",
              background: active === t.id ? "rgba(255,255,255,.1)" : "transparent",
              color: active === t.id ? "#E6F1FB" : "#888780",
              fontFamily: "inherit", transition: "all .12s",
            }}>{t.jp}</button>
          ))}
        </nav>
      </div>
      <span style={{
        fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500,
        background: "rgba(55,138,221,.2)", color: "#85B7EB", flexShrink: 0, whiteSpace: "nowrap",
      }}>W{week} · {PHASE_NAME[phase]}</span>
    </header>
  )
}
