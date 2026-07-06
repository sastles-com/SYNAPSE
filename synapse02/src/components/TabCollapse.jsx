import { useState } from 'react'
import { Lead, TabBody, Card, Pill } from './Shared'
import {
  C, WEEKS, W_COMPONENTS, W_SNAPSHOTS, W_BY_ID, snapAt, tempColorHex,
} from '../data'

// 焼きなましタイムラインの対象成分（デッドラインを持つ / 再加熱 / fossil / フェーズ遷移で collapse）
function timelineComponents() {
  return W_COMPONENTS.filter(c => {
    if (c.type === 'class') {
      // デッドライン持ち or 途中で reheat/fossil する成分
      const anyReheat = Object.values(W_SNAPSHOTS).some(wk => wk[c.id]?.reheatedAt)
      const anyFossil = Object.values(W_SNAPSHOTS).some(wk => wk[c.id]?.fossil)
      return c.deadline != null || anyReheat || anyFossil
    }
    return c.type === 'idmap' // フェーズ遷移で collapse する ID 対応
  })
}

// この週で collapse遅延警告か（デッドライン接近でまだ多峰・未凍結）
function isLate(c, st, week) {
  return c.deadline != null && !st.collapsedAt && st.modes.length > 1 && week >= c.deadline - 3
}

// ── 従来ゲート vs 成分別焼きなまし の対比図（静的SVG） ─────────
function GateComparison() {
  const W = 300, H = 150
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* 従来ゲート：全成分が数点で一斉凍結 */}
      <text x="6" y="14" fontSize="10" fill="#888" fontWeight="600">従来ゲート（全成分を数点で一斉凍結）</text>
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1={14} y1={26 + i * 8} x2={W - 60} y2={26 + i * 8} stroke="#DDD" strokeWidth="4" strokeLinecap="round" />
      ))}
      {[120, 240].map(x => (
        <g key={x}>
          <line x1={x} y1={22} x2={x} y2={66} stroke={C.red} strokeWidth="2" />
          {[0, 1, 2, 3, 4].map(i => <circle key={i} cx={x} cy={26 + i * 8} r="3" fill={C.red} />)}
        </g>
      ))}
      <text x={W - 54} y="48" fontSize="9" fill={C.red}>DR で全部</text>
      {/* ループ：各成分が自分のデッドラインで冷却 */}
      <text x="6" y="94" fontSize="10" fill="#888" fontWeight="600">ループ（成分ごとに自分の期日で冷却）</text>
      {[0, 1, 2, 3, 4].map(i => {
        const dl = [200, 90, 260, 150, 230][i]
        return (
          <g key={i}>
            <defs>
              <linearGradient id={`cool${i}`} x1="0" x2="1">
                <stop offset="0" stopColor={tempColorHex(1)} />
                <stop offset="1" stopColor={tempColorHex(0)} />
              </linearGradient>
            </defs>
            <line x1={14} y1={106 + i * 8} x2={dl} y2={106 + i * 8} stroke={`url(#cool${i})`} strokeWidth="4" strokeLinecap="round" />
            <text x={dl + 3} y={109 + i * 8} fontSize="9" fill={C.blueDk}>❄</text>
          </g>
        )
      })}
    </svg>
  )
}

export default function TabCollapse({ week, setActive }) {
  const [selEvent, setSelEvent] = useState(null)
  const rows = timelineComponents()
  const cellW = 100 / WEEKS
  const lateNow = rows.filter(c => isLate(c, snapAt(week, c.id), week))

  return (
    <>
      <Lead title="焼きなまし" cpc="collapse operator · gates as annealing"
        sub="ゲートは「全成分の一斉凍結」ではなく「宣言された成分集合の合意分布を、その不可逆デッドラインに向けて収束させる焼きなましイベント」である。各成分は自分の期日で冷え、金型発注や認証で凍結（❄）し、一部変更で再加熱（🔥）する。" />
      <TabBody>
        {/* collapse遅延 警告（健全性#4） */}
        {lateNow.length > 0 && (
          <div style={{ background: '#FCEEEE', border: `1px solid ${C.red}55`, borderRadius: 10, padding: '9px 13px', marginBottom: 10, fontSize: 12.5, color: '#8a2a2a' }}>
            ⚠ <b>collapse遅延警告（健全性#4）:</b> {lateNow.map(c => c.label).join('、')} が不可逆デッドライン接近でもまだ多峰。冷却スケジュールが間に合っていない（＝pharma型ゲート失敗モードの裏口再侵入）。
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 12, alignItems: 'start' }}>
          {/* ガントチャート */}
          <Card>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 10 }}>
              成分別 焼きなましタイムライン <span style={{ color: '#bbb' }}>· 温度カーブ（高温→凍結）・❄ collapse・🔥 re-heat</span>
            </div>
            {/* 週目盛りヘッダ */}
            <div style={{ display: 'flex', paddingLeft: 150, marginBottom: 3 }}>
              {Array.from({ length: WEEKS }, (_, i) => i + 1).map(w => (
                <div key={w} style={{ flex: 1, textAlign: 'center', fontSize: 8, color: w === week ? C.blue : '#bbb', fontWeight: w === week ? 700 : 400 }}>{w}</div>
              ))}
            </div>
            {rows.map(c => {
              const late = isLate(c, snapAt(week, c.id), week)
              return (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <button onClick={() => setActive && setActive('shared')} title="共通図タブで詳細"
                    style={{ width: 150, textAlign: 'left', fontSize: 10.5, color: late ? C.red : '#444', fontWeight: late ? 700 : 500,
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', paddingRight: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {late && '⚠ '}{c.label}
                  </button>
                  <div style={{ flex: 1, display: 'flex', position: 'relative', height: 18,
                    outline: late ? `1.5px solid ${C.red}` : 'none', borderRadius: 3 }}>
                    {Array.from({ length: WEEKS }, (_, i) => i + 1).map(w => {
                      const st = W_SNAPSHOTS[w][c.id]
                      const isCollapse = st.collapsedAt === w
                      const isReheat = st.reheatedAt === w
                      const isFossil = st.fossil && !W_SNAPSHOTS[w - 1]?.[c.id]?.fossil
                      const isDeadline = c.deadline === w
                      const temp = st.collapsedAt && w >= st.collapsedAt ? 0 : st.temperature
                      return (
                        <div key={w} title={`W${w} ${c.label}: 温度 ${temp.toFixed(2)}${isCollapse ? ' ❄collapse' : ''}${isReheat ? ' 🔥reheat' : ''}`}
                          onClick={() => setSelEvent({ c, w, st })}
                          style={{ flex: 1, background: tempColorHex(temp), borderRight: '1px solid rgba(255,255,255,.5)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, cursor: 'pointer',
                            opacity: w <= week ? 1 : .3, position: 'relative',
                            boxShadow: w === week ? `inset 0 0 0 1.5px ${C.blue}` : 'none' }}>
                          {isCollapse ? '❄' : isReheat ? '🔥' : isFossil ? '🦴' : isDeadline ? '│' : ''}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
            <div style={{ fontSize: 10, color: '#aaa', marginTop: 8, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span>❄ collapse（凍結確定）</span><span>🔥 re-heat（一部変更で再加熱）</span><span>🦴 fossil 発見</span><span>│ 不可逆デッドライン</span>
            </div>
          </Card>

          {/* 凡例・対比図・イベント詳細 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Card>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4 }}>ゲート＝焼きなまし</div>
              <div style={{ fontSize: 11, color: '#777', lineHeight: 1.6, marginBottom: 8 }}>
                pharma型ゲートは「少数の点で全成分を一斉凍結」した。ループは「各成分をそれぞれの不可逆デッドラインで冷やす」——多数の小さな焼きなまし、少数の大きな凍結。SBCE（set-based）は高温域、ゲートは冷却スケジュールにすぎない。
              </div>
              <GateComparison />
            </Card>

            {selEvent && (
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#333' }}>{selEvent.c.label}</span>
                  <button onClick={() => setSelEvent(null)} style={{ background: 'none', border: 'none', fontSize: 16, color: '#999', cursor: 'pointer', fontFamily: 'inherit' }}>×</button>
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>W{selEvent.w} の状態</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '6px 0', flexWrap: 'wrap' }}>
                  <Pill bg="#F1EFE8" color="#555">温度 {(selEvent.st.collapsedAt && selEvent.w >= selEvent.st.collapsedAt ? 0 : selEvent.st.temperature).toFixed(2)}</Pill>
                  {selEvent.st.collapsedAt && selEvent.w >= selEvent.st.collapsedAt && <Pill bg="#E6F1FB" color="#0C447C">❄ 凍結（W{selEvent.st.collapsedAt}）</Pill>}
                  {selEvent.st.reheatedAt && selEvent.w >= selEvent.st.reheatedAt && <Pill bg="#FCEBEB" color="#791F1F">🔥 再加熱（W{selEvent.st.reheatedAt}）</Pill>}
                  {selEvent.c.deadline && <Pill bg="#FAEEDA" color="#633806">期日 W{selEvent.c.deadline}</Pill>}
                </div>
                <div style={{ fontSize: 11, color: '#666' }}>
                  合意強度 {selEvent.st.consensus} / {selEvent.st.modes.length > 1 ? `多峰（${selEvent.st.modes.length}）` : '単峰'}
                </div>
                <button onClick={() => setActive && setActive('shared')} style={{ marginTop: 8, fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: `.5px solid ${C.blue}`, background: '#EBF4FE', color: C.blueDk, fontFamily: 'inherit' }}>共通図タブで見る →</button>
              </Card>
            )}
          </div>
        </div>
      </TabBody>
    </>
  )
}
