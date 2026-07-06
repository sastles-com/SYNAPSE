// ─────────────────────────────────────────────────────────────
// SYNAPSE02 — 予測開発ループ・デモポータル
// NV-2026 · propose → compose → predict → measure error → update
//
// Entry point: src/main.jsx
// Data:        src/data.js  ← モックDB（バックエンド接続時はここを差し替え）
//
// ルートが active（タブ）/ week（シナリオ時刻）/ playing（再生中）を持ち props で配る。
// 状態管理ライブラリなし（synapse01 と同じ流儀）。
// ─────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import Header from './components/Header'
import WeekSlider from './components/WeekSlider'
import { WEEKS } from './data'
import TabLoop from './components/TabLoop'
import TabConsensus from './components/TabConsensus'
import TabShared from './components/TabShared'
import TabAnchor from './components/TabAnchor'
import TabCollapse from './components/TabCollapse'
import TabError from './components/TabError'

export default function Synapse02Portal() {
  const [active, setActive] = useState('loop')
  const [week, setWeek] = useState(1)
  const [playing, setPlaying] = useState(false)

  // 再生中は 1週 ≒ 2秒で自動送り。W16 で停止。
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      setWeek(w => {
        if (w >= WEEKS) { setPlaying(false); return w }
        return w + 1
      })
    }, 2000)
    return () => clearInterval(t)
  }, [playing])

  const nav = { week, setWeek, setActive }
  const renderTab = () => {
    switch (active) {
      case 'loop':      return <TabLoop {...nav} />
      case 'consensus': return <TabConsensus {...nav} />
      case 'shared':    return <TabShared {...nav} />
      case 'anchor':    return <TabAnchor {...nav} />
      case 'collapse':  return <TabCollapse {...nav} />
      case 'error':     return <TabError {...nav} />
      default:          return <TabLoop {...nav} />
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
      <Header active={active} setActive={setActive} week={week} />
      <WeekSlider week={week} setWeek={setWeek} playing={playing} setPlaying={setPlaying} />
      {renderTab()}
    </div>
  )
}
