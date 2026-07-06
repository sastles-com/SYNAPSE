import { useState } from 'react'
import { Lead, TabBody, Card, Bar, Pill, ModeBar, Gauge, TempStripe, ClassPill, DomainChip } from './Shared'
import CertificateDrawer from './CertificateDrawer'
import {
  C, W_COMPONENTS, W_BY_ID, snapAt, stalenessOf, CERTIFICATES,
  CLASS_HEX, PHASE_LABELS, phaseOf, accuracyAt,
  domainLabel, domainColor, consensusColorHex,
} from '../data'

const SUBVIEWS = [
  { id: 'glossary', label: '用語集',     en: 'living glossary' },
  { id: 'class',    label: '部品分類',   en: 'classification' },
  { id: 'idmap',    label: 'IDレジストリ', en: 'persistent ID' },
  { id: 'severity', label: 'リスク重大度', en: 'severity' },
]

// w 成分の共通表示（合意強度）
function ConsensusRow({ consensus }) {
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#999' }}>
        <span>合意強度</span><span style={{ fontWeight: 600, color: consensusColorHex(consensus) }}>{consensus}</span>
      </div>
      <Bar pct={consensus} color={consensusColorHex(consensus)} />
    </div>
  )
}

// ── 用語集 ──────────────────────────────────────────────────────
function Glossary({ week }) {
  const terms = W_COMPONENTS.filter(c => c.type === 'term')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
      {terms.map(c => {
        const st = snapAt(week, c.id)
        const multimodal = st.modes.length > 1
        const stale = stalenessOf(c.id, week)
        return (
          <Card key={c.id} style={{ padding: '11px 13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2634' }}>{c.label}</span>
              {c.deadline == null && multimodal
                ? <Pill bg="#EEF" color="#5556B0">多峰許容（deadline なし）</Pill>
                : !multimodal ? <Pill bg="#E1F5EE" color="#085041">収束</Pill> : <Pill bg="#FAEEDA" color="#633806">係争中</Pill>}
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{c.plain}</div>
            <ModeBar modes={st.modes} />
            <ConsensusRow consensus={st.consensus} />
            <Gauge value={stale} halfLife={c.halfLife} />
            <div style={{ fontSize: 10, color: '#aaa' }}>最終物理接地: W{st.lastGrounded}　·　係争ドメイン: {c.domains.map(domainLabel).join('・')}</div>
          </Card>
        )
      })}
    </div>
  )
}

// ── 部品分類（＋fossil インベントリ ＋証明書ドロワー） ─────────────
function Classification({ week, onCert }) {
  const classes = W_COMPONENTS.filter(c => c.type === 'class')
  const rows = classes.map(c => ({ c, st: snapAt(week, c.id) }))
  const fossils = rows.filter(r => r.st.fossil)
  return (
    <>
      {/* fossil インベントリ集約ビュー */}
      {fossils.length > 0 && (
        <Card style={{ marginBottom: 10, borderColor: CLASS_HEX.fossil + '66', background: '#FFF6F6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15 }}>🦴</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: CLASS_HEX.fossil }}>fossil インベントリ（{fossils.length}件）</span>
            <span style={{ fontSize: 11, color: '#999' }}>凍結証明書が失われた流用部品。再加熱時に凍結根拠の再構築が必要な最高リスク群</span>
          </div>
          {fossils.map(r => (
            <div key={r.c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '3px 0' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: CLASS_HEX.fossil }} />
              <span style={{ fontWeight: 600, color: '#333' }}>{r.c.label}</span>
              <span style={{ color: '#999', fontSize: 11 }}>{r.c.plain} — 証明書なし</span>
            </div>
          ))}
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
        {rows.map(({ c, st }) => {
          const cls = st.fossil ? 'fossil' : st.classification
          const cert = c.certificateId ? CERTIFICATES[c.certificateId] : null
          const stale = stalenessOf(c.id, week)
          return (
            <Card key={c.id} style={{ padding: '11px 13px', borderColor: st.fossil ? CLASS_HEX.fossil + '55' : C.border }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a2634' }}>{c.label}</span>
                <ClassPill cls={cls} />
              </div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{c.plain}</div>
              <ModeBar modes={st.modes} showLabels={st.modes.length > 1} />
              <ConsensusRow consensus={st.consensus} />
              <Gauge value={stale} halfLife={c.halfLife} />
              <TempStripe temp={st.temperature} collapsed={!!st.collapsedAt} reheated={!!st.reheatedAt} width={120} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 6 }}>
                <span style={{ fontSize: 10, color: '#aaa' }}>{c.deadline ? `不可逆デッドライン: W${c.deadline}` : 'デッドラインなし'}</span>
                {cert
                  ? <button onClick={() => onCert(c)} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, cursor: 'pointer',
                      border: `.5px solid ${C.teal}`, background: C.teal + '14', color: '#0a6b4d', fontFamily: 'inherit', fontWeight: 500 }}>
                      証明書を見る
                    </button>
                  : st.fossil
                    ? <Pill bg="#FCEBEB" color="#791F1F">⚠ 証明書なし（fossil）</Pill>
                    : cls === 'carry'
                      ? <Pill bg="#FAEEDA" color="#633806">証明書未整備</Pill>
                      : <span style={{ fontSize: 10, color: '#ccc' }}>—</span>}
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}

// idmap の各フェーズ文字列（表示用の参照表）
const IDMAP_TEXT = {
  'w-id-door-fl':      { concept: 'DOOR-FL / コンセプトサーフェス v0', classA: 'DOOR-FL / クラスA面 rev.C', prodCAD: 'DOOR-FL / 量産CAD PN 62100-NV26' },
  'w-id-door-fr':      { concept: 'DOOR-FR / コンセプトサーフェス v0', classA: 'DOOR-FR / クラスA面 rev.C', prodCAD: 'DOOR-FR / 量産CAD PN 62101-NV26' },
  'w-id-battery-pack': { concept: 'BATT-PACK / レイアウト案 v0', classA: 'BATT-PACK / 構造モデル rev.B', prodCAD: 'BATT-PACK / 量産CAD PN 29500-NV26' },
  'w-id-front-fascia': { concept: 'F-FASCIA / スケッチ v0', classA: 'F-FASCIA / クラスA面 rev.D', prodCAD: 'F-FASCIA / 量産CAD PN 62010-NV26' },
  'w-id-cowl':         { concept: 'COWL / レイアウト案 v0', classA: 'COWL / 構造モデル rev.A', prodCAD: 'COWL / 量産CAD PN 66100-NV26' },
  'w-id-underbody':    { concept: 'UNDERBODY / 骨格案 v0', classA: 'UNDERBODY / 構造モデル rev.B', prodCAD: 'UNDERBODY / 量産CAD PN 74000-NV26' },
}

// ── IDレジストリ ───────────────────────────────────────────────
function IdRegistry({ week }) {
  const ids = W_COMPONENTS.filter(c => c.type === 'idmap')
  const cols = [['concept', 'コンセプト'], ['classA', 'クラスA'], ['prodCAD', '量産CAD']]
  return (
    <Card>
      <div style={{ fontSize: 11.5, color: '#888', marginBottom: 8 }}>
        永続ID ↔ フェーズ別ジオメトリの対応。フェーズ遷移交渉（W12）で量産CADへ<b>非破壊で</b>更新される（旧フェーズの意見は保持）。
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 700 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', color: '#999', fontWeight: 600, fontSize: 11 }}>永続ID</th>
              {cols.map(([k, lbl]) => (
                <th key={k} style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600, fontSize: 11, color: '#999' }}>{lbl}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ids.map(c => {
              const st = snapAt(week, c.id)
              const txt = IDMAP_TEXT[c.id] || {}
              return (
                <tr key={c.id} style={{ borderTop: `.5px solid ${C.border}` }}>
                  <td style={{ padding: '7px 8px', fontWeight: 600, color: '#333' }}>{c.label}</td>
                  {cols.map(([k]) => {
                    const isCur = st.phase === k
                    const reached = (k === 'concept') || (k === 'classA' && week >= PHASE_LABELS.classA[0]) || (k === 'prodCAD' && st.phase === 'prodCAD')
                    return (
                      <td key={k} style={{ padding: '7px 8px', color: isCur ? '#1a2634' : reached ? '#888' : '#ccc',
                        fontWeight: isCur ? 600 : 400, background: isCur ? '#EBF4FE' : 'transparent',
                        fontFamily: 'ui-monospace, monospace', fontSize: 11 }}>
                        {txt[k]}
                        {isCur && <span style={{ color: C.blue, fontFamily: 'inherit' }}> ◀ 現在</span>}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

// ── リスク重大度 ──────────────────────────────────────────────
function Severity({ week }) {
  const sevs = W_COMPONENTS.filter(c => c.type === 'severity')
  const acc = accuracyAt(week)
  const sevMap = { high: { lbl: '高', bg: '#FCEBEB', c: '#791F1F' }, mid: { lbl: '中', bg: '#FAEEDA', c: '#633806' }, low: { lbl: '低', bg: '#E1F5EE', c: '#085041' } }
  return (
    <Card>
      <div style={{ fontSize: 11.5, color: '#888', marginBottom: 8 }}>
        重大度付き w 成分。較正根拠＝提案ドメインの過去予測的中率（この値がタブ1「合意の回し方」の受容重みになる）。
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 640 }}>
          <thead>
            <tr style={{ color: '#999', fontSize: 11 }}>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>リスク成分</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>重大度</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>較正ドメイン</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>過去的中率</th>
              <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>合意</th>
            </tr>
          </thead>
          <tbody>
            {sevs.map(c => {
              const st = snapAt(week, c.id)
              const s = sevMap[st.severity] || sevMap.mid
              const calib = st.calibDomain
              return (
                <tr key={c.id} style={{ borderTop: `.5px solid ${C.border}` }}>
                  <td style={{ padding: '8px' }}>
                    <div style={{ fontWeight: 600, color: '#333' }}>{c.label}</div>
                    <div style={{ fontSize: 10.5, color: '#999' }}>{c.plain}</div>
                  </td>
                  <td style={{ padding: '8px' }}><Pill bg={s.bg} color={s.c}>{s.lbl}</Pill></td>
                  <td style={{ padding: '8px' }}><DomainChip id={calib} /></td>
                  <td style={{ padding: '8px', fontWeight: 700, color: domainColor(calib) }}>{acc[calib] != null ? `${Math.round(acc[calib] * 100)}%` : '—'}</td>
                  <td style={{ padding: '8px', minWidth: 90 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: consensusColorHex(st.consensus) }}>{st.consensus}</div>
                    <Bar pct={st.consensus} color={consensusColorHex(st.consensus)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

export default function TabShared({ week }) {
  const [sub, setSub] = useState('glossary')
  const [certComp, setCertComp] = useState(null)

  return (
    <>
      <Lead title="共通図" cpc="shared representation · w"
        sub="共有されているのは3Dモデルではなく w（共通図）そのもの——用語・部品分類・永続ID・リスク重大度。各成分は多峰分布・合意強度・鮮度（staleness）・温度を持つ。" />
      <TabBody>
        <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
          {SUBVIEWS.map(v => (
            <button key={v.id} onClick={() => setSub(v.id)} title={v.en} style={{
              fontSize: 12, padding: '6px 13px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              border: `.5px solid ${sub === v.id ? C.blue : C.border}`,
              background: sub === v.id ? '#EBF4FE' : '#fff',
              color: sub === v.id ? C.blueDk : '#666', fontWeight: sub === v.id ? 600 : 400,
            }}>{v.label}</button>
          ))}
        </div>

        {sub === 'glossary' && <Glossary week={week} />}
        {sub === 'class' && <Classification week={week} onCert={setCertComp} />}
        {sub === 'idmap' && <IdRegistry week={week} />}
        {sub === 'severity' && <Severity week={week} />}
      </TabBody>

      {certComp && (
        <CertificateDrawer cert={CERTIFICATES[certComp.certificateId]} componentLabel={certComp.label} onClose={() => setCertComp(null)} />
      )}
    </>
  )
}
