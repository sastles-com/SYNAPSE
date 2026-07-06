import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { Lead, Card, Bar, Pill, ClassPill, ModeBar } from './Shared'
import CertificateDrawer from './CertificateDrawer'
import {
  C, PARTS, PART_BY_ID, W_BY_ID, snapAt, ROUNDS, CERTIFICATES, stalenessOf,
  partClassAt, partConsensusAt, partStalenessAt, partTempAt,
  CLASS_3JS, CLASS_HEX, CLASS_LBL, consensusColor3JS, consensusColorHex,
  stalenessColor3JS, stalenessColorHex, tempColor3JS, tempColorHex,
  domainLabel, PROTOCOL_LBL,
} from '../data'

// 着色モード（synapse02 の新規価値）
const MODES = [
  { id: 'class',     label: '分類',     en: 'classification' },
  { id: 'consensus', label: '合意強度', en: 'consensus' },
  { id: 'staleness', label: 'staleness', en: '鮮度' },
  { id: 'temp',      label: '温度',     en: 'annealing temperature' },
]

// 部位色（Three.js 用 0x）— モード×週から算出
function partColor3JS(part, mode, week) {
  if (mode === 'class') return CLASS_3JS[partClassAt(part, week)] ?? 0x888780
  if (mode === 'consensus') return consensusColor3JS(partConsensusAt(part, week))
  if (mode === 'staleness') return stalenessColor3JS(partStalenessAt(part, week))
  if (mode === 'temp') return tempColor3JS(partTempAt(part, week))
  return 0x888780
}
function partColorHex(part, mode, week) {
  if (mode === 'class') return CLASS_HEX[partClassAt(part, week)] ?? '#888780'
  if (mode === 'consensus') return consensusColorHex(partConsensusAt(part, week))
  if (mode === 'staleness') return stalenessColorHex(partStalenessAt(part, week))
  if (mode === 'temp') return tempColorHex(partTempAt(part, week))
  return '#888780'
}

// ── 選択部位の w 成分パネル ──────────────────────────────────
function PartPanel({ part, week, onClose, onCert }) {
  if (!part) return null
  const comps = part.wComponentIds.map(id => W_BY_ID[id]).filter(Boolean)
  const relatedRounds = []
  for (let w = 1; w <= week; w++) (ROUNDS[w] || []).forEach(r => { if (part.wComponentIds.includes(r.componentId)) relatedRounds.push({ ...r, week: w }) })
  const cls = partClassAt(part, week)
  return (
    <Card style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{part.name}</span>
        <ClassPill cls={cls} />
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, color: '#888', cursor: 'pointer', lineHeight: 1, fontFamily: 'inherit' }}>×</button>
      </div>

      <div style={{ fontSize: 10, color: '#999', fontWeight: 600, marginBottom: 4 }}>紐づく w 成分</div>
      {comps.map(c => {
        const st = snapAt(week, c.id)
        const cert = c.certificateId ? CERTIFICATES[c.certificateId] : null
        return (
          <div key={c.id} style={{ padding: '6px 0', borderBottom: `.5px solid ${C.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#333' }}>{c.label}</span>
              <Pill bg="#EEF" color="#5556B0">{c.type}</Pill>
            </div>
            {st.modes && <ModeBar modes={st.modes} showLabels={st.modes.length > 1} h={14} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, color: '#999' }}>
              <span>合意 {st.consensus}</span>
              <span>staleness {Math.round(stalenessOf(c.id, week) * 100)}%</span>
              {st.fossil && <Pill bg="#FCEBEB" color="#791F1F">fossil</Pill>}
              {cert && <button onClick={() => onCert(c)} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 5, cursor: 'pointer', border: `.5px solid ${C.teal}`, background: C.teal + '14', color: '#0a6b4d', fontFamily: 'inherit' }}>証明書</button>}
            </div>
          </div>
        )
      })}

      <div style={{ fontSize: 10, color: '#999', fontWeight: 600, margin: '8px 0 4px' }}>関連ラウンド履歴（〜W{week}）</div>
      {relatedRounds.length === 0 && <div style={{ fontSize: 11, color: '#bbb' }}>まだありません。</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxHeight: 140, overflowY: 'auto' }}>
        {relatedRounds.map(r => (
          <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5 }}>
            <span style={{ color: '#bbb', minWidth: 26 }}>W{r.week}</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.accepted ? C.teal : C.red, flexShrink: 0 }} />
            <span style={{ color: '#555', flex: 1 }}>{domainLabel(r.speaker)}→{domainLabel(r.listener)}: 「{r.proposal}」</span>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function TabAnchor({ week }) {
  const canvasRef = useRef(null)
  const stateRef = useRef({ camTheta: .5, camPhi: 1.05, camR: 7, mouseDown: false, last: { x: 0, y: 0 } })
  const threeRef = useRef({ scene: null, camera: null, renderer: null, meshes: {}, animId: null })
  const modeRef = useRef('class')
  const weekRef = useRef(week)
  const [selId, setSelId] = useState(null)
  const [mode, setMode] = useState('class')
  const [exploded, setExploded] = useState(false)
  const [wire, setWire] = useState(false)
  const [certComp, setCertComp] = useState(null)

  const selPart = selId ? PART_BY_ID[selId] : null

  const updateCam = useCallback(() => {
    const { camTheta, camPhi, camR } = stateRef.current
    const { camera } = threeRef.current
    if (!camera) return
    camera.position.set(camR * Math.sin(camPhi) * Math.sin(camTheta), camR * Math.cos(camPhi), camR * Math.sin(camPhi) * Math.cos(camTheta))
    camera.lookAt(0, .3, 0)
  }, [])

  const updateColors = useCallback(() => {
    const m = modeRef.current, w = weekRef.current
    Object.entries(threeRef.current.meshes).forEach(([id, arr]) => {
      const part = PART_BY_ID[id]; if (!part) return
      const col = partColor3JS(part, m, w)
      arr.forEach(msh => msh.material.color.setHex(col))
    })
  }, [])

  const selectPart = id => {
    setSelId(id)
    Object.entries(threeRef.current.meshes).forEach(([pid, arr]) =>
      arr.forEach(msh => { msh.material.emissive = new THREE.Color(pid === id ? 0x333333 : 0x000000) }))
  }
  const clearSel = () => {
    setSelId(null)
    Object.values(threeRef.current.meshes).flat().forEach(msh => { msh.material.emissive = new THREE.Color(0x000000) })
  }

  // ── Three.js 初期化（synapse01 の車両構築を流用・拡張） ──
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const W = canvas.parentElement.clientWidth, H = canvas.parentElement.clientHeight
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H, false)
    renderer.setClearColor(0x0F1923, 1)
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, .1, 100)
    threeRef.current = { scene, camera, renderer, meshes: {}, animId: null }
    updateCam()
    scene.add(new THREE.AmbientLight(0xffffff, .6))
    const dl = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(5, 8, 6); scene.add(dl)
    const dl2 = new THREE.DirectionalLight(0x8888ff, .3); dl2.position.set(-5, -3, -4); scene.add(dl2)
    const meshes = {}
    const add = (geo, partId, pos, opacity = 1) => {
      const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0x888780, transparent: opacity < 1, opacity, shininess: 60 }))
      m.position.set(...pos)
      m.userData = { partId, basePos: [...pos] }
      scene.add(m)
      if (!meshes[partId]) meshes[partId] = []
      meshes[partId].push(m)
    }
    add(new THREE.BoxGeometry(3.2, .35, 1.5), 'p-body', [0, .52, 0])
    add(new THREE.BoxGeometry(1.8, .55, 1.4), 'p-body', [0, .90, 0], .75)
    add(new THREE.BoxGeometry(3.0, .12, 1.4), 'p-chassis', [0, 0, 0])
    add(new THREE.BoxGeometry(2.6, .22, 1.2), 'p-battery', [.2, -.18, 0])
    const wg = new THREE.CylinderGeometry(.28, .28, .2, 16)
    ;[[-1.1, -.32, .78], [1.1, -.32, .78], [-1.1, -.32, -.78], [1.1, -.32, -.78]].forEach(p => add(wg, 'p-susp', p))
    add(new THREE.BoxGeometry(.8, .5, 1.3), 'p-interior', [-.3, .68, 0])
    add(new THREE.BoxGeometry(2.0, .15, 1.3), 'p-interior', [0, .95, 0], .35)
    add(new THREE.BoxGeometry(.6, .35, 1.1), 'p-elec', [1.15, .35, 0])
    add(new THREE.BoxGeometry(.5, .35, 1.1), 'p-safety', [-1.4, .52, 0])
    // ドア（左右の側面パネル）— ドア系ナラティブの3D居場所
    add(new THREE.BoxGeometry(1.5, .5, .06), 'p-door-fl', [.1, .58, .74])
    add(new THREE.BoxGeometry(1.5, .5, .06), 'p-door-fr', [.1, .58, -.74])
    threeRef.current.meshes = meshes
    updateColors()
    const loop = () => { threeRef.current.animId = requestAnimationFrame(loop); renderer.render(scene, camera) }
    loop()
    return () => { cancelAnimationFrame(threeRef.current.animId); renderer.dispose() }
  }, [updateCam, updateColors])

  // マウス/ホイール/クリック（synapse01 と同様に 2つ目の useEffect で登録）
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const onDown = e => { stateRef.current.mouseDown = true; stateRef.current.last = { x: e.clientX, y: e.clientY } }
    const onUp = () => { stateRef.current.mouseDown = false }
    const onMove = e => {
      if (!stateRef.current.mouseDown) return
      const dx = e.clientX - stateRef.current.last.x, dy = e.clientY - stateRef.current.last.y
      stateRef.current.camTheta -= dx * .008
      stateRef.current.camPhi = Math.max(.3, Math.min(2.5, stateRef.current.camPhi + dy * .008))
      stateRef.current.last = { x: e.clientX, y: e.clientY }
      updateCam()
    }
    const onWheel = e => { stateRef.current.camR = Math.max(3, Math.min(14, stateRef.current.camR + e.deltaY * .01)); updateCam(); e.preventDefault() }
    const onClick = e => {
      const rect = canvas.getBoundingClientRect()
      const mouse = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1)
      const ray = new THREE.Raycaster(); ray.setFromCamera(mouse, threeRef.current.camera)
      const hits = ray.intersectObjects(Object.values(threeRef.current.meshes).flat())
      if (hits.length) selectPart(hits[0].object.userData.partId)
    }
    canvas.addEventListener('mousedown', onDown); window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove); canvas.addEventListener('wheel', onWheel, { passive: false })
    canvas.addEventListener('click', onClick)
    return () => {
      canvas.removeEventListener('mousedown', onDown); window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove); canvas.removeEventListener('wheel', onWheel)
      canvas.removeEventListener('click', onClick)
    }
  }, [updateCam])

  // 週・モード変更で再着色（命令的に material を書き換え）
  useEffect(() => { modeRef.current = mode; weekRef.current = week; updateColors() }, [mode, week, updateColors])

  const handleExplode = () => {
    const next = !exploded; setExploded(next)
    const off = { 'p-body': [0, .6, 0], 'p-battery': [.4, -.3, 0], 'p-chassis': [0, -.5, 0], 'p-susp': [0, -.5, 0], 'p-interior': [-.4, .5, 0], 'p-elec': [.9, 0, 0], 'p-safety': [-.9, 0, 0], 'p-door-fl': [0, 0, .5], 'p-door-fr': [0, 0, -.5] }
    Object.entries(threeRef.current.meshes).forEach(([id, arr]) => {
      const o = next ? (off[id] || [0, 0, 0]) : [0, 0, 0]
      arr.forEach(m => { const b = m.userData.basePos; m.position.set(b[0] + o[0], b[1] + o[1], b[2] + o[2]) })
    })
  }
  const handleWire = () => { const next = !wire; setWire(next); Object.values(threeRef.current.meshes).flat().forEach(m => { m.material.wireframe = next }) }

  const toolBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{
      background: active ? 'rgba(55,138,221,.4)' : 'rgba(12,26,46,.75)', border: '.5px solid rgba(255,255,255,.12)',
      borderRadius: 6, padding: '5px 10px', fontSize: 11, color: '#B5D4F4', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'inherit',
    }}>{label}</button>
  )

  // 凡例（モード別）
  const legend = () => {
    if (mode === 'class') return [['新規', CLASS_HEX.new], ['流用', CLASS_HEX.carry], ['一部変更', CLASS_HEX.partial], ['fossil', CLASS_HEX.fossil]]
    if (mode === 'consensus') return [['弱', consensusColorHex(20)], ['中', consensusColorHex(55)], ['強', consensusColorHex(90)]]
    if (mode === 'staleness') return [['新鮮', stalenessColorHex(0)], ['半減', stalenessColorHex(.5)], ['減衰', stalenessColorHex(1)]]
    return [['高温', tempColorHex(1)], ['冷却中', tempColorHex(.5)], ['凍結', tempColorHex(0)]]
  }

  return (
    <>
      <Lead title="3Dアンカー" cpc="a rendering of w"
        sub="この3Dモデルは共通図 w の“ひとつの描画”にすぎない。アンカーの実体はジオメトリではなく、永続ID＋合意状態である。着色モードを切り替えると、同じ車体が w のどの側面を映すかが変わる。" />
      <div style={{ background: C.bg, padding: '0 18px 20px' }}>
        {/* 中心命題の常時表示 */}
        <div style={{ background: '#0C1A2E', color: '#9FC3EA', borderRadius: 8, padding: '8px 12px', fontSize: 11.5, margin: '4px 0 10px' }}>
          この3Dモデルは共通図 <i>w</i> のひとつの描画です。アンカーの実体は<b>永続ID＋合意状態</b>であり、ジオメトリはその一表現です。
        </div>

        {/* 着色モード切替 */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>着色モード:</span>
          {MODES.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)} title={m.en} style={{
              fontSize: 12, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
              border: `.5px solid ${mode === m.id ? C.blue : C.border}`,
              background: mode === m.id ? '#EBF4FE' : '#fff', color: mode === m.id ? C.blueDk : '#666', fontWeight: mode === m.id ? 600 : 400,
            }}>{m.label}</button>
          ))}
          <span style={{ fontSize: 11, color: '#bbb', marginLeft: 'auto' }}>W{week} の状態を着色</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, alignItems: 'start' }}>
          {/* Canvas */}
          <div style={{ position: 'relative', background: '#0F1923', height: 460, borderRadius: 12, overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {toolBtn('↺ リセット', false, () => { stateRef.current.camTheta = .5; stateRef.current.camPhi = 1.05; stateRef.current.camR = 7; updateCam() })}
              {toolBtn('⤢ 分解図', exploded, handleExplode)}
              {toolBtn('△ ワイヤー', wire, handleWire)}
            </div>
            <div style={{ position: 'absolute', bottom: 10, left: 10, background: 'rgba(12,26,46,.85)', borderRadius: 6, padding: '7px 10px', display: 'flex', gap: 10, flexWrap: 'wrap', maxWidth: '80%' }}>
              {legend().map(([lbl, col]) => (
                <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#B5D4F4' }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: col }} />{lbl}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(12,26,46,.7)', borderRadius: 6, padding: '5px 9px', fontSize: 11, color: '#7f9cbb' }}>
              ドラッグ: 回転　ホイール: ズーム　クリック: 選択
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 520, overflowY: 'auto' }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: '#888' }}>部位一覧</div>
            {PARTS.map(p => (
              <button key={p.id} onClick={() => selectPart(p.id)} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderRadius: 8, cursor: 'pointer',
                textAlign: 'left', width: '100%', fontFamily: 'inherit',
                background: selId === p.id ? '#EBF4FE' : C.card,
                border: selId === p.id ? `1.5px solid ${C.blue}` : `.5px solid ${C.border}`,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: partColorHex(p, mode, week), flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{p.name}</span>
                <ClassPill cls={partClassAt(p, week)} />
              </button>
            ))}
            {selPart && <PartPanel part={selPart} week={week} onClose={clearSel} onCert={setCertComp} />}
          </div>
        </div>
      </div>
      {certComp && <CertificateDrawer cert={CERTIFICATES[certComp.certificateId]} componentLabel={certComp.label} onClose={() => setCertComp(null)} />}
    </>
  )
}
