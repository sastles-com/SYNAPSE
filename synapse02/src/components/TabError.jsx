import { useState } from 'react'
import { Lead, TabBody, Card, Bar, Pill, DomainChip } from './Shared'
import {
  C, DIVERGENCES, OBSERVATIONS, accuracyAt, W_BY_ID, DOMAINS,
  domainLabel, domainColor,
} from '../data'

const STEP_LBL = { observe: '① 物理観測', register: '② 乖離登録', propose: '③ 提案生成', update: '④ w 更新' }
const STEP_COLOR = { observe: C.teal, register: C.red, propose: C.blue, update: C.purple }

// ── 予測-実測 比較（航続距離・NVH） ───────────────────────────
function PredActual({ d, week }) {
  const measured = week >= d.week
  const max = Math.max(d.predicted, d.actual) * 1.15
  return (
    <Card style={{ flex: 1, minWidth: 220 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2634' }}>{d.metric}</span>
        <span style={{ fontSize: 10, color: '#aaa' }}>物理試験 W{d.week}</span>
      </div>
      {/* 予測 */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
          <span>予測（w由来）</span><span style={{ fontWeight: 600 }}>{d.predicted}{d.unit}</span>
        </div>
        <Bar pct={d.predicted / max * 100} color={C.blue} h={9} />
      </div>
      {/* 実測 */}
      <div style={{ marginTop: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#888' }}>
          <span>実測（現物）</span>
          <span style={{ fontWeight: 600, color: measured ? C.red : '#ccc' }}>{measured ? `${d.actual}${d.unit}` : '未計測'}</span>
        </div>
        <Bar pct={measured ? d.actual / max * 100 : 0} color={measured ? C.red : '#ddd'} h={9} />
      </div>
      {measured && (
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: C.red }}>
          乖離 {d.diffPct > 0 ? '+' : ''}{d.diffPct}%
          <span style={{ fontSize: 10, fontWeight: 400, color: '#999', marginLeft: 6 }}>重大度 {d.severity === 'high' ? '高' : d.severity}</span>
        </div>
      )}
    </Card>
  )
}

// ── トレースチェーン（横並びステップカード） ───────────────────
function TraceChain({ d, week }) {
  return (
    <Card>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 4 }}>
        トレースチェーン <span style={{ color: '#bbb' }}>· {d.metric} の乖離（W{d.week}）</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 4, overflowX: 'auto', paddingBottom: 4 }}>
        {d.chain.map((s, i) => {
          const done = week >= s.week
          const col = STEP_COLOR[s.step]
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ minWidth: 168, background: done ? '#fff' : '#F5F4EE', borderRadius: 10,
                border: `.5px solid ${done ? col + '66' : C.border}`, padding: '9px 11px', opacity: done ? 1 : .55 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: col }}>{STEP_LBL[s.step]}</div>
                <div style={{ fontSize: 11, color: '#444', marginTop: 3, lineHeight: 1.45 }}>{s.label}</div>
                <div style={{ fontSize: 9.5, color: '#aaa', marginTop: 4 }}>W{s.week}{s.roundId ? ` · ${s.roundId}` : ''}</div>
              </div>
              {i < d.chain.length - 1 && <span style={{ color: '#bbb', fontSize: 16 }}>→</span>}
            </div>
          )
        })}
      </div>
      <div style={{ marginTop: 8, padding: '8px 12px', borderRadius: 8, background: '#EAF7F1', fontSize: 11.5, color: '#0a6b4d' }}>
        <b>append-only 原則:</b> {d.note} 誤差は観測記録 <i>o</i> を書き換えない——新しい提案を生むだけ。
      </div>
    </Card>
  )
}

export default function TabError({ week, setActive }) {
  const occurred = DIVERGENCES.filter(d => d.week <= week)
  const [selId, setSelId] = useState(null)
  const sel = occurred.find(d => d.id === selId) || occurred[occurred.length - 1] || null
  const acc = accuracyAt(week)
  const accSorted = [...DOMAINS].sort((a, b) => (acc[b.id] || 0) - (acc[a.id] || 0))

  return (
    <>
      <Lead title="答え合わせ" cpc="error signal · correlation governance"
        sub="予測は必ず現物と突き合わせる。乖離は関連する w 成分・提案・緩和策へトレースされ、次の提案を駆動する。ドメイン別の過去的中率は、合意ラウンドの受容重みの根拠になる。" />
      <TabBody>
        {/* 上部: 予測-実測 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          {DIVERGENCES.map(d => <PredActual key={d.id} d={d} week={week} />)}
        </div>

        {/* トレースチェーン */}
        {occurred.length === 0 ? (
          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: '#aaa', padding: '10px 0', textAlign: 'center' }}>
              まだ物理試験による乖離は登録されていません（最初の実走試験は W6）。週を進めてください。
            </div>
          </Card>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
              {occurred.map(d => (
                <button key={d.id} onClick={() => setSelId(d.id)} style={{
                  fontSize: 11.5, padding: '5px 11px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
                  border: `.5px solid ${sel?.id === d.id ? C.red : C.border}`,
                  background: sel?.id === d.id ? '#FCEEEE' : '#fff', color: sel?.id === d.id ? '#8a2a2a' : '#666',
                  fontWeight: sel?.id === d.id ? 600 : 400,
                }}>{d.metric}（W{d.week}）</button>
              ))}
            </div>
            {sel && <div style={{ marginBottom: 12 }}><TraceChain d={sel} week={week} /></div>}
          </>
        )}

        {/* 下部: 的中率テーブル ＋ リスクトレースマトリクス */}
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 12 }}>
          <Card>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 8 }}>
              ドメイン別 予測的中率 <span style={{ color: '#bbb' }}>· W{week}</span>
            </div>
            {accSorted.map(dm => (
              <div key={dm.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ minWidth: 78 }}><DomainChip id={dm.id} /></span>
                <div style={{ flex: 1 }}><Bar pct={(acc[dm.id] || 0) * 100} color={dm.color} h={8} /></div>
                <span style={{ fontSize: 12, fontWeight: 700, color: dm.color, minWidth: 34, textAlign: 'right' }}>{Math.round((acc[dm.id] || 0) * 100)}%</span>
              </div>
            ))}
            <div style={{ fontSize: 10.5, color: '#aaa', marginTop: 6, lineHeight: 1.5 }}>
              この的中率が「合意の回し方」タブでリスク重大度提案の受容重みになる（信頼ではなくデータで較正）。
            </div>
            <button onClick={() => setActive && setActive('consensus')} style={{ marginTop: 8, fontSize: 11, padding: '4px 10px', borderRadius: 6, cursor: 'pointer', border: `.5px solid ${C.blue}`, background: '#EBF4FE', color: C.blueDk, fontFamily: 'inherit' }}>合意の回し方タブへ →</button>
          </Card>

          <Card>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 8 }}>
              リスクトレースマトリクス <span style={{ color: '#bbb' }}>· 乖離 × 関連 w 成分 × 緩和策（ISO 14971 アナロジー）</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, minWidth: 480 }}>
                <thead>
                  <tr style={{ color: '#999', fontSize: 10.5 }}>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>乖離</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>関連 w 成分</th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>緩和策（生成された提案）</th>
                  </tr>
                </thead>
                <tbody>
                  {DIVERGENCES.map(d => {
                    const occ = d.week <= week
                    const mitigation = d.chain.find(s => s.step === 'update')?.label || '—'
                    return (
                      <tr key={d.id} style={{ borderTop: `.5px solid ${C.border}`, opacity: occ ? 1 : .4 }}>
                        <td style={{ padding: '7px 8px' }}>
                          <div style={{ fontWeight: 600, color: '#333' }}>{d.metric}</div>
                          <div style={{ fontSize: 10, color: '#999' }}>W{d.week} · {occ ? `${d.diffPct > 0 ? '+' : ''}${d.diffPct}%` : '未発生'}</div>
                        </td>
                        <td style={{ padding: '7px 8px' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                            {d.tracedTo.map(id => <Pill key={id} bg="#EEF" color="#5556B0">{W_BY_ID[id]?.label || id}</Pill>)}
                          </div>
                        </td>
                        <td style={{ padding: '7px 8px', color: '#555' }}>{mitigation}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </TabBody>
    </>
  )
}
