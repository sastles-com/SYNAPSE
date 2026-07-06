import { useState, useEffect } from 'react'
import { Lead, TabBody, Card, Bar, Pill, ModeBar, Gauge, DomainChip } from './Shared'
import {
  C, ROUNDS, W_BY_ID, snapAt, stalenessOf, PROTOCOL_LBL,
  DOMAINS, DOMAIN_BY_ID, domainColor, domainLabel, consensusColorHex, WEEKS, W_SNAPSHOTS,
} from '../data'

const PROTOCOLS = [['all', 'すべて'], ['daily', '日次統合'], ['milestone', '節目レビュー'], ['phase', 'フェーズ遷移交渉'], ['cert', '外部認証']]

// ── ラウンドビューア（3カラム：話者 → 提案 → 聴者） ─────────────
function RoundViewer({ round }) {
  if (!round) return (
    <Card style={{ minHeight: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#aaa', fontSize: 13 }}>この週・このプロトコルにラウンドはありません。</span>
    </Card>
  )
  const comp = W_BY_ID[round.componentId]
  const accepted = round.accepted
  return (
    <Card style={{ minHeight: 220 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Pill bg="#EBF4FE" color={C.blueDk}>{PROTOCOL_LBL[round.protocol]}</Pill>
        <span style={{ fontSize: 11, color: '#999' }}>{round.id}</span>
        <span style={{ fontSize: 11, color: '#bbb', marginLeft: 'auto' }}>対象成分: {comp?.label}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 8, alignItems: 'stretch' }}>
        {/* 話者 */}
        <div style={{ background: domainColor(round.speaker) + '12', borderRadius: 10, padding: '10px 12px', border: `.5px solid ${domainColor(round.speaker)}44` }}>
          <div style={{ fontSize: 10, color: '#999', fontWeight: 600, marginBottom: 4 }}>話者ドメイン</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: domainColor(round.speaker) }}>{domainLabel(round.speaker)}</div>
          <div style={{ fontSize: 11, color: '#666', marginTop: 6, lineHeight: 1.5 }}>根拠: {round.rationale}</div>
        </div>

        {/* 提案 */}
        <div style={{ background: '#FAFAF7', borderRadius: 10, padding: '10px 12px', border: `.5px solid ${C.border}`, position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#999', fontWeight: 600, marginBottom: 4 }}>提案内容</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2634' }}>「{round.proposal}」</div>
          <div style={{ marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999' }}>
              <span>受容確率</span><span style={{ fontWeight: 700, color: accepted ? C.teal : C.red }}>{Math.round(round.acceptProb * 100)}%</span>
            </div>
            <Bar pct={round.acceptProb * 100} color={accepted ? C.teal : C.red} h={7} />
            <div style={{ fontSize: 10, color: '#aaa', lineHeight: 1.5 }}>
              受容確率＝この提案が聴者自身の観測をどれだけよく説明するか（尤度 {round.likelihood}）。自己申告ではなく監査可能な根拠に基づく。
            </div>
          </div>
        </div>

        {/* 聴者 */}
        <div style={{ background: domainColor(round.listener) + '12', borderRadius: 10, padding: '10px 12px', border: `.5px solid ${domainColor(round.listener)}44`, position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#999', fontWeight: 600, marginBottom: 4 }}>聴者ドメイン</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: domainColor(round.listener) }}>{domainLabel(round.listener)}</div>
          <div style={{ position: 'absolute', bottom: 10, right: 12, fontSize: 13, fontWeight: 800,
            color: accepted ? C.teal : C.red, border: `2px solid ${accepted ? C.teal : C.red}`, borderRadius: 6,
            padding: '2px 8px', transform: 'rotate(-6deg)', opacity: .9 }}>
            {accepted ? '受容 ✓' : '棄却 ✕'}
          </div>
        </div>
      </div>

      {/* 矢印＋効果 */}
      <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: accepted ? '#EAF7F1' : '#FCEEEE',
        fontSize: 12, color: accepted ? '#0a6b4d' : '#8a2a2a' }}>
        <b>{accepted ? '受容の効果:' : '棄却:'}</b> {round.effect}
      </div>
    </Card>
  )
}

// ── ドメインペア別 受容率ヒストグラム ─────────────────────────
function AcceptanceHistogram({ week }) {
  const pairs = {}
  for (let w = 1; w <= week; w++) {
    (ROUNDS[w] || []).forEach(r => {
      const k = `${r.speaker}>${r.listener}`
      if (!pairs[k]) pairs[k] = { speaker: r.speaker, listener: r.listener, total: 0, acc: 0 }
      pairs[k].total++; if (r.accepted) pairs[k].acc++
    })
  }
  const list = Object.values(pairs).sort((a, b) => b.total - a.total)
  return (
    <Card>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 8 }}>
        ドメインペア別 受容率 <span style={{ color: '#bbb' }}>· W1〜W{week} 累計 · 健全性#1</span>
      </div>
      {list.length === 0 && <div style={{ fontSize: 12, color: '#aaa' }}>まだラウンドがありません。</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {list.map(p => {
          const rate = p.acc / p.total
          const ritual = p.total >= 3 && (rate >= 0.95 || rate <= 0.05)
          return (
            <div key={`${p.speaker}>${p.listener}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, minWidth: 120, display: 'flex', alignItems: 'center', gap: 4 }}>
                <DomainChip id={p.speaker} small /><span style={{ color: '#bbb' }}>→</span><DomainChip id={p.listener} small />
              </span>
              <div style={{ flex: 1, height: 14, background: '#EDEBE3', borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                <div style={{ width: `${rate * 100}%`, height: '100%', background: ritual ? C.amber : C.blue, transition: 'width .4s' }} />
                {/* 健全中間帯（30-70%）のガイド */}
                <div style={{ position: 'absolute', left: '30%', right: '30%', top: 0, bottom: 0, borderLeft: '1px dashed rgba(0,0,0,.15)', borderRight: '1px dashed rgba(0,0,0,.15)' }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, minWidth: 60, textAlign: 'right', color: '#555' }}>{Math.round(rate * 100)}% ({p.acc}/{p.total})</span>
              {ritual && <Pill bg="#FAEEDA" color="#633806">⚠ 儀式化の兆候</Pill>}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 8 }}>
        受容率が中間帯にあるのが健全。1.0/0.0 に張り付くペアは、機構が儀式（追認 or 門前払い）に堕している兆候。
      </div>
    </Card>
  )
}

// ── 収束チャート（用語ごとの安定度曲線 = 合意強度の推移） ──────
const CONV_TERMS = ['w-term-module', 'w-term-zone', 'w-term-tolerance', 'w-term-nvh', 'w-term-datum']
function ConvergenceChart({ week }) {
  const w = 380, h = 130, padL = 28, padB = 18, padT = 8
  const xw = w - padL - 8, yh = h - padB - padT
  const xAt = wk => padL + (WEEKS <= 1 ? 0 : (wk - 1) / (WEEKS - 1) * xw)
  const yAt = v => padT + (1 - v / 100) * yh
  return (
    <Card>
      <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 4 }}>
        収束チャート <span style={{ color: '#bbb' }}>· 用語ごとの合意安定度（KL風の模擬系列）</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
        {[0, 50, 100].map(v => (
          <g key={v}>
            <line x1={padL} y1={yAt(v)} x2={w - 8} y2={yAt(v)} stroke="#EDEBE3" strokeWidth="1" />
            <text x={4} y={yAt(v) + 3} fontSize="8" fill="#bbb">{v}</text>
          </g>
        ))}
        {/* 現在週の縦線 */}
        <line x1={xAt(week)} y1={padT} x2={xAt(week)} y2={h - padB} stroke={C.blue} strokeWidth="1" strokeDasharray="3 2" opacity=".5" />
        {CONV_TERMS.map(id => {
          const col = domainColor(W_BY_ID[id].domains[0])
          let d = ''
          for (let wk = 1; wk <= week; wk++) {
            const c = W_SNAPSHOTS[wk][id].consensus
            d += (wk === 1 ? 'M' : ' L') + xAt(wk).toFixed(1) + ',' + yAt(c).toFixed(1)
          }
          const last = W_SNAPSHOTS[week][id].consensus
          return (
            <g key={id}>
              <path d={d} fill="none" stroke={col} strokeWidth="1.6" />
              <circle cx={xAt(week)} cy={yAt(last)} r="2.5" fill={col} />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 4 }}>
        {CONV_TERMS.map(id => (
          <span key={id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#777' }}>
            <span style={{ width: 8, height: 3, background: domainColor(W_BY_ID[id].domains[0]), borderRadius: 2 }} />
            {W_BY_ID[id].label}
          </span>
        ))}
      </div>
    </Card>
  )
}

export default function TabConsensus({ week }) {
  const [proto, setProto] = useState('all')
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  const rounds = (ROUNDS[week] || []).filter(r => proto === 'all' || r.protocol === proto)
  // 週・フィルタ変更で step をリセット
  useEffect(() => { setStep(0); setPlaying(false) }, [week, proto])
  // ステップ自動再生
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setStep(s => {
      if (s >= rounds.length - 1) { setPlaying(false); return s }
      return s + 1
    }), 1600)
    return () => clearInterval(t)
  }, [playing, rounds.length])

  const cur = rounds[Math.min(step, rounds.length - 1)]
  const comp = cur ? W_BY_ID[cur.componentId] : null
  const compSt = cur ? snapAt(week, cur.componentId) : null

  return (
    <>
      <Lead title="合意の回し方" cpc="consensus dynamics · MHNG"
        sub="提案-受容プロトコル（MHNG由来）を1件ずつ再生する。提案ドメインが候補を出し、聴者は「その提案が自分の観測をどれだけ説明するか」に応じた確率で受容する。受容されると共通図 w の分布が更新される。" />
      <TabBody>
        {/* プロトコルフィルタ */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 10, flexWrap: 'wrap' }}>
          {PROTOCOLS.map(([id, lbl]) => (
            <button key={id} onClick={() => setProto(id)} style={{
              fontSize: 11.5, padding: '5px 11px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              border: `.5px solid ${proto === id ? C.blue : C.border}`,
              background: proto === id ? '#EBF4FE' : '#fff', color: proto === id ? C.blueDk : '#666',
              fontWeight: proto === id ? 600 : 400,
            }}>{lbl}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, alignItems: 'start' }}>
          {/* 中央: ラウンド再生 */}
          <div>
            {/* ステップコントロール */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button onClick={() => { setPlaying(false); setStep(s => Math.max(0, s - 1)) }} disabled={!rounds.length} style={ctrlBtn}>◀ 前</button>
              <button onClick={() => setPlaying(p => !p)} disabled={!rounds.length} style={{ ...ctrlBtn, background: playing ? '#EBF4FE' : '#fff' }}>{playing ? '⏸ 停止' : '▶ ステップ再生'}</button>
              <button onClick={() => { setPlaying(false); setStep(s => Math.min(rounds.length - 1, s + 1)) }} disabled={!rounds.length} style={ctrlBtn}>次 ▶</button>
              <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>
                {rounds.length ? `ラウンド ${Math.min(step + 1, rounds.length)} / ${rounds.length}` : '0 件'}
              </span>
            </div>
            {/* 進捗ドット */}
            {rounds.length > 0 && (
              <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                {rounds.map((r, i) => (
                  <div key={r.id} onClick={() => { setPlaying(false); setStep(i) }} title={r.id}
                    style={{ flex: 1, height: 6, borderRadius: 3, cursor: 'pointer',
                      background: i === step ? C.blue : i < step ? (r.accepted ? C.teal : C.red) : '#DDD' }} />
                ))}
              </div>
            )}
            <RoundViewer round={cur} />
          </div>

          {/* 右: 対象 w 成分の現在状態 */}
          <Card style={{ position: 'sticky', top: 8 }}>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 600, marginBottom: 4 }}>対象 w 成分の現在状態 · W{week}</div>
            {comp ? (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a2634' }}>{comp.label}</div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>{comp.plain}</div>
                <div style={{ fontSize: 10, color: '#999', marginTop: 6, fontWeight: 600 }}>多峰分布（modes）</div>
                <ModeBar modes={compSt.modes} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999', marginTop: 2 }}>
                  <span>合意強度</span><span style={{ fontWeight: 700, color: consensusColorHex(compSt.consensus) }}>{compSt.consensus}</span>
                </div>
                <Bar pct={compSt.consensus} color={consensusColorHex(compSt.consensus)} />
                <Gauge value={stalenessOf(comp.id, week)} halfLife={comp.halfLife} />
                <div style={{ fontSize: 10, color: '#aaa', marginTop: 4, lineHeight: 1.5 }}>
                  受容が積み重なるとこの分布の share が動き、合意強度が上がる。棄却は分布を動かさない。
                </div>
              </>
            ) : <div style={{ fontSize: 12, color: '#aaa' }}>ラウンドを選択すると対象成分を表示します。</div>}
          </Card>
        </div>

        {/* 下部: ヒストグラム＋収束チャート */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
          <AcceptanceHistogram week={week} />
          <ConvergenceChart week={week} />
        </div>
      </TabBody>
    </>
  )
}

const ctrlBtn = {
  fontSize: 12, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
  border: `.5px solid ${C.border}`, background: '#fff', color: '#444',
}
