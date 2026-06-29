// ─────────────────────────────────────────────────────────────
// SYNAPSE — Vehicle Development Intelligence Portal
// NV-2026 · EV Sedan
//
// Entry point: src/main.jsx
// Data:        src/data.js  ← swap mock data for real API here
// ─────────────────────────────────────────────────────────────
import { useState } from 'react'
import Header    from './components/Header'
import Dashboard from './components/Dashboard'
import Viewer3D  from './components/Viewer3D'
import Schedule  from './components/Schedule'
import Tasks     from './components/Tasks'
import Docs      from './components/Docs'
import Team      from './components/Team'

export default function SynapsePortal() {
  const [active, setActive] = useState('Dashboard')

  const renderTab = () => {
    switch (active) {
      case 'Dashboard': return <Dashboard />
      case '3D Viewer': return <Viewer3D />
      case 'Schedule':  return <Schedule />
      case 'Tasks':     return <Tasks />
      case 'Docs':      return <Docs />
      case 'Team':      return <Team />
      default:          return <Dashboard />
    }
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
      border: '.5px solid rgba(0,0,0,.1)',
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 4px 24px rgba(0,0,0,.08)',
    }}>
      <Header active={active} setActive={setActive} />
      {renderTab()}
    </div>
  )
}
