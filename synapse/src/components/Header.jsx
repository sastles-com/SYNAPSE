import { Logo } from './Shared'
import { C } from '../data'

const TABS = ["Dashboard", "3D Viewer", "Schedule", "Tasks", "Docs", "Team"]

export default function Header({ active, setActive }) {
  return (
    <header style={{
      background: C.navy, padding: "10px 18px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <Logo />
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#E6F1FB", letterSpacing: 2 }}>SYNAPSE</div>
            <div style={{ fontSize: 10, color: "#5F5E5A", letterSpacing: .5 }}>NV-2026 · EV Sedan</div>
          </div>
        </div>
        <nav style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActive(t)} style={{
              fontSize: 12, padding: "5px 11px", borderRadius: 6, border: "none", cursor: "pointer",
              background: active === t ? "rgba(255,255,255,.1)" : "transparent",
              color: active === t ? "#E6F1FB" : "#888780",
              fontFamily: "inherit", transition: "all .12s",
            }}>{t}</button>
          ))}
        </nav>
      </div>
      <span style={{
        fontSize: 11, padding: "3px 10px", borderRadius: 99, fontWeight: 500,
        background: "rgba(55,138,221,.2)", color: "#85B7EB", flexShrink: 0,
      }}>Phase 2 — 詳細設計</span>
    </header>
  )
}
