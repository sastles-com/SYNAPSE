import { Lead, TabBody, Card, Sparkline } from './Shared'
import {
  C, ONE_LINER, HEALTH, HEALTH_META, healthVerdict, HEALTH_VERDICT_HEX,
  OBSERVATIONS, DIVERGENCES, ROUNDS, W_COMPONENTS, W_SNAPSHOTS, activityForWeek,
} from '../data'

// ループ5要素のノード定義（UI第一表示は平易な日本語、CPC記号は補足）
const NODES = [
  { key: 'observe', jp: '観測',         sym: 'o', tab: 'error',     sub: '各ドメインの測定・試験・実車確認', color: C.teal },
  { key: 'interpret', jp: '解釈',       sym: 'z', tab: 'consensus', sub: '各チーム内部の世界モデル（非共有・予測のみ提供）', color: C.purple },
  { key: 'consensus', jp: '合意の回し方', sym: '',  tab: 'consensus', sub: '提案-受容ラウンドで w を更新（MHNG）', color: C.blue },
  { key: 'shared',   jp: '共通図',       sym: 'w', tab: 'shared',    sub: '合意された共有表現（アンカー・用語・分類）', color: C.blueDk },
  { key: 'error',    jp: '答え合わせ',   sym: '',  tab: 'error',     sub: '予測と現物の乖離を測る。誤差が次の提案を駆動', color: C.red },
]

// 選択週にアクティビティがあるノードを判定
function activeNodes(week) {
  const set = new Set()
  if (OBSERVATIONS.some(o => o.week === week)) set.add('observe')
  const rounds = ROUNDS[week] || []
  if (rounds.length) set.add('consensus')
  if (rounds.some(r => !r.accepted)) set.add('interpret') // 棄却＝解釈対立（z/o 乖離）の診断
  if (DIVERGENCES.some(d => d.week === week)) { set.add('error'); set.add('observe') }
  const wChanged = W_COMPONENTS.some(c => {
    const st = W_SNAPSHOTS[week]?.[c.id]
    return st && (st.collapsedAt === week || st.reheatedAt === week ||
      (st.fossil && !W_SNAPSHOTS[week - 1]?.[c.id]?.fossil) ||
      (st.phase && st.phase !== W_SNAPSHOTS[week - 1]?.[c.id]?.phase))
  })
  if (wChanged) set.add('shared')
  return set
}

const fmtHealth = (fmt, v) => {
  if (v == null) return '—'
  if (fmt === 'pct') return `${Math.round(v * 100)}%`
  if (fmt === 'week') return `${v}週`
  if (fmt === 'count') return `${v}件`
  return String(v)
}

// ── ループ図（SVG） ─────────────────────────────────────────────
function LoopDiagram({ week, onNav }) {
  const W = 430, H = 360, cx = 215, cy = 176, r = 132, nr = 40
  const active = activeNodes(week)
  const pts = NODES.map((_, i) => {
    const a = (-90 + i * 72) * Math.PI / 180
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }
  })
  // ノード端で止めた矢印座標
  const edge = (i, j) => {
    const A = pts[i], B = pts[j]
    const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy)
    const ux = dx / len, uy = dy / len
    return { x1: A.x + ux * nr, y1: A.y + uy * nr, x2: B.x - ux * (nr + 8), y2: B.y - uy * (nr + 8) }
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <defs>
        <marker id="arrow" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.gray} />
        </marker>
        <marker id="arrowRed" markerWidth="9" markerHeight="9" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L6,3 L0,6 Z" fill={C.red} />
        </marker>
      </defs>
      {/* エッジ（ループを一周） */}
      {NODES.map((_, i) => {
        const j = (i + 1) % NODES.length
        const e = edge(i, j)
        const isReturn = i === 4 && j === 0 // 答え合わせ → 観測（誤差フィードバック）
        return (
          <g key={i}>
            <line x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
              stroke={isReturn ? C.red : C.gray} strokeWidth={isReturn ? 2 : 1.4}
              strokeDasharray={isReturn ? '5 4' : 'none'}
              markerEnd={isReturn ? 'url(#arrowRed)' : 'url(#arrow)'}
              style={isReturn ? { animation: 'synapseFlow 1s linear infinite' } : undefined} />
          </g>
        )
      })}
      {/* 誤差フィードバックの注記 */}
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="10" fill="#B99" fontWeight="600">誤差が</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="10" fill="#B99" fontWeight="600">次の提案を駆動</text>
      <text x={cx} y={cy + 32} textAnchor="middle" fontSize="8.5" fill="#aaa">（o は書き換えない）</text>
      {/* ノード */}
      {NODES.map((n, i) => {
        const p = pts[i], on = active.has(n.key)
        return (
          <g key={n.key} onClick={() => onNav(n.tab)} style={{ cursor: 'pointer' }}>
            {on && <circle cx={p.x} cy={p.y} r={nr} fill={n.color} opacity="0.5"
              style={{ transformBox: 'fill-box', transformOrigin: 'center', animation: 'synapseRing 1.6s ease-out infinite' }} />}
            <circle cx={p.x} cy={p.y} r={nr} fill="#fff" stroke={n.color} strokeWidth={on ? 3 : 1.6}
              style={{ animation: on ? 'synapsePulse 1.6s ease-in-out infinite' : 'none' }} />
            <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize="13" fontWeight="600" fill="#1a2634">{n.jp}</text>
            {n.sym && <text x={p.x} y={p.y + 13} textAnchor="middle" fontSize="11" fontStyle="italic" fill={n.color} fontWeight="600">{n.sym}</text>}
          </g>
        )
      })}
    </svg>
  )
}

export default function TabLoop({ week, setActive }) {
  const h = HEALTH[week]
  return (
    <>
      <Lead title="ループ" cpc="loop · propose → compose → predict → measure error → update"
        sub="このポータルは車両開発を「4層スタック」ではなく「予測開発ループ」として運営する。各チームが提案し、提案は実データで検証され、予測は現物と答え合わせされ、誤差が次の提案を生む——その一周を可視化する。" />
      <TabBody>
        {/* 一行ピッチ */}
        <div style={{ background: '#0C1A2E', color: '#B5D4F4', borderRadius: 10, padding: '10px 14px',
          fontSize: 12.5, lineHeight: 1.6, marginBottom: 12 }}>
          <span style={{ color: '#5F8FBF', fontWeight: 600 }}>■ </span>{ONE_LINER}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 328px', gap: 12, alignItems: 'start' }}>
          {/* 左: ループ図 */}
          <Card>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 4 }}>
              ループ全景 <span style={{ color: '#bbb' }}>· W{week} にアクティビティのある要素が点滅</span>
            </div>
            <LoopDiagram week={week} onNav={setActive} />
            {/* サブラベル凡例 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
              {NODES.map(n => (
                <button key={n.key} onClick={() => setActive(n.tab)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', width: '100%',
                  background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0', fontFamily: 'inherit',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#333', minWidth: 78 }}>
                    {n.jp}{n.sym && <span style={{ color: n.color, fontStyle: 'italic' }}> {n.sym}</span>}
                  </span>
                  <span style={{ fontSize: 11, color: '#888', flex: 1 }}>{n.sub}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* 右: 健全性メトリクス7指標 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888' }}>ループ健全性メトリクス <span style={{ color: '#bbb' }}>· §8</span></div>
            {HEALTH_META.map(m => {
              const cur = h[m.key]
              const verdict = healthVerdict(m, cur)
              const vhex = HEALTH_VERDICT_HEX[verdict]
              const series = Array.from({ length: week }, (_, i) => HEALTH[i + 1][m.key])
              return (
                <Card key={m.key} style={{ padding: '9px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: vhex, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{m.num}. {m.label}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: vhex, whiteSpace: 'nowrap' }}>{fmtHealth(m.fmt, cur)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, marginTop: 3 }}>
                    <span style={{ fontSize: 10, color: '#999', lineHeight: 1.4, flex: 1 }}>{m.plain}</span>
                    <Sparkline values={series} color={vhex} w={90} h={24} />
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* 下部: アクティビティフィード */}
        <Card style={{ marginTop: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 8 }}>
            W{week} のアクティビティ <span style={{ color: '#bbb' }}>· クリックで該当タブへ</span>
          </div>
          {activityForWeek(week).length === 0 && (
            <div style={{ fontSize: 12, color: '#aaa', padding: '8px 0' }}>この週に記録されたイベントはありません。</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {activityForWeek(week).map((a, i) => (
              <button key={i} onClick={() => setActive(a.tab)} style={{
                display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left', width: '100%',
                background: '#FAFAF7', border: `.5px solid ${C.border}`, borderRadius: 8, padding: '7px 10px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: a.dot, flexShrink: 0 }} />
                <span style={{ fontSize: 12, color: '#333', flex: 1 }}>{a.text}</span>
                <span style={{ fontSize: 10, color: '#aaa', whiteSpace: 'nowrap' }}>{a.meta}</span>
              </button>
            ))}
          </div>
        </Card>
      </TabBody>
    </>
  )
}
