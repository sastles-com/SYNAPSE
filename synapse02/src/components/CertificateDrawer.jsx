import { C } from '../data'
import { Pill } from './Shared'

// collapse certificate ドロワー（流用部品の凍結証明書）
// 4項目（設計荷重・規制基準・相関予測・サプライヤ工程）＋ contextDiff（分類判定の根拠）
export default function CertificateDrawer({ cert, componentLabel, onClose }) {
  if (!cert) return null
  const divergedCount = cert.contextDiff.filter(d => d.diverged).length
  const verdict = divergedCount === 0 ? { cls: 'carry', lbl: '流用（全軸で文脈一致）', c: C.teal }
    : divergedCount >= cert.contextDiff.length - 1 ? { cls: 'new', lbl: '新規相当（大半が乖離）', c: C.blue }
    : { cls: 'partial', lbl: `一部変更（${divergedCount}軸が乖離 → その軸のみ再加熱）`, c: C.amber }

  const rows = [
    { k: '設計荷重',       v: cert.loadAssumptions },
    { k: '規制基準',       v: cert.regBaseline },
    { k: '相関予測',       v: cert.correlatedPredictions },
    { k: 'サプライヤ工程', v: cert.supplierState },
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,20,34,.4)' }} />
      <div style={{ position: 'relative', width: 400, maxWidth: '92vw', height: '100%', background: '#fff',
        boxShadow: '-4px 0 24px rgba(0,0,0,.2)', overflowY: 'auto', padding: '18px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: '#999', fontWeight: 600 }}>COLLAPSE CERTIFICATE · 凍結証明書</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1a2634', marginTop: 2 }}>{cert.label}</div>
            {componentLabel && <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{componentLabel}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, color: '#888', cursor: 'pointer', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
        </div>

        <div style={{ marginTop: 12, padding: '8px 10px', background: '#F1EFE8', borderRadius: 8, fontSize: 11.5, color: '#555' }}>
          この部品は <b>{cert.frozenIn}</b> のループで焼きなまされ、既に凍結された状態でこのプログラムに入っている（pre-collapsed）。
        </div>

        {/* 凍結条件4項目 */}
        <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginTop: 16, marginBottom: 6 }}>凍結時の条件（4項目）</div>
        {rows.map(r => (
          <div key={r.k} style={{ padding: '7px 0', borderBottom: `.5px solid ${C.border}` }}>
            <div style={{ fontSize: 10.5, color: '#999', fontWeight: 600 }}>{r.k}</div>
            <div style={{ fontSize: 12, color: '#333', marginTop: 1 }}>{r.v}</div>
          </div>
        ))}

        {/* contextDiff — 現プログラム文脈との差分（分類判定の根拠） */}
        <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginTop: 16, marginBottom: 6 }}>
          現プログラム文脈との差分 <span style={{ color: '#bbb', fontWeight: 400 }}>· 分類は差分オペレーション</span>
        </div>
        {cert.contextDiff.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: `.5px solid ${C.border}` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, flexShrink: 0,
              background: d.diverged ? C.red : C.teal }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 12, color: '#333', fontWeight: 500 }}>{d.axis}</span>
                <Pill bg={d.diverged ? '#FCEBEB' : '#E1F5EE'} color={d.diverged ? '#791F1F' : '#085041'}>
                  {d.diverged ? '乖離' : '一致'}
                </Pill>
              </div>
              {d.note && <div style={{ fontSize: 11, color: '#B0453C', marginTop: 2 }}>{d.note}</div>}
            </div>
          </div>
        ))}

        <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 8, background: verdict.c + '18',
          border: `.5px solid ${verdict.c}55` }}>
          <div style={{ fontSize: 10.5, color: '#999', fontWeight: 600 }}>差分からの分類判定</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: verdict.c, marginTop: 2 }}>{verdict.lbl}</div>
          <div style={{ fontSize: 11, color: '#777', marginTop: 4, lineHeight: 1.5 }}>
            new / carry / partially-modified の分類は、凍結条件と現文脈の差分（diff）に還元される。乖離ゼロ＝流用、特定軸のみ乖離＝その軸を再加熱して一部変更、大半が乖離＝新規扱い。
          </div>
        </div>
      </div>
    </div>
  )
}
