import { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import { PARTS, ANCHORS, ANCHOR_PCTS, STATUS_HEX, STATUS_3JS, C } from '../data'
import { Card, Bar, Pill } from './Shared'

// ── SubPanel ──────────────────────────────────────────────────
function SubPanel({ part, onClose }) {
  const [tab, setTab] = useState('design')
  if (!part) return null
  const rows = {
    design: [
      { label: "設計進捗",  value: `${part.design}%`, bar: { pct: part.design, color: C.blue  } },
      { label: "担当",      value: part.owner },
      { label: "CAD Rev.",  value: "v2.3" },
      { label: "最終更新",  value: "2026/06/02" },
    ],
    test: [
      { label: "実験進捗",     value: `${part.test}%`, bar: { pct: part.test, color: C.teal } },
      { label: "実施済み試験", value: `${Math.round(part.test / 10)}/10 項目` },
      { label: "最新結果",     value: part.test > 60 ? "合格" : "評価中" },
      { label: "次回試験",     value: "2026/06/20" },
    ],
    dsgn: [
      { label: "デザイン進捗",      value: `${part.dsgn}%`, bar: { pct: part.dsgn, color: "#7F77DD" } },
      { label: "CMF承認",           value: part.dsgn > 70 ? "承認済" : "レビュー中" },
      { label: "スタイリング Rev.", value: "B" },
    ],
  }
  return (
    <Card style={{ marginTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, background: "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚙</div>
        <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{part.name}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 18, color: "#888", cursor: "pointer", lineHeight: 1, fontFamily: "inherit" }}>×</button>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
        {[["design","設計"],["test","実験"],["dsgn","デザイン"]].map(([k, lbl]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            fontSize: 11, padding: "3px 9px", borderRadius: 99, cursor: "pointer",
            border: ".5px solid rgba(0,0,0,.15)", fontFamily: "inherit",
            background: tab === k ? "#F1EFE8" : "transparent",
            color: tab === k ? "#222" : "#888",
            fontWeight: tab === k ? 500 : 400,
          }}>{lbl}</button>
        ))}
      </div>
      {rows[tab].map((r, i) => (
        <div key={i}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 3 }}>
            <span>{r.label}</span><span style={{ fontWeight: 500, color: "#222" }}>{r.value}</span>
          </div>
          {r.bar && <Bar pct={r.bar.pct} color={r.bar.color} />}
        </div>
      ))}
      {part.issue && (
        <div style={{ marginTop: 8, padding: "6px 8px", background: "#FCEBEB", borderRadius: 6, fontSize: 11, color: "#791F1F" }}>
          ⚠ {part.issue}
        </div>
      )}
    </Card>
  )
}

// ── Viewer3D ──────────────────────────────────────────────────
export default function Viewer3D() {
  const canvasRef = useRef(null)
  const stateRef  = useRef({ camTheta: .4, camPhi: 1.1, camR: 7, mouseDown: false, last: { x: 0, y: 0 } })
  const threeRef  = useRef({ scene: null, camera: null, renderer: null, meshes: {}, animId: null })
  const [selId,    setSelId]    = useState(null)
  const [exploded, setExploded] = useState(false)
  const [wire,     setWire]     = useState(false)
  const [timeIdx,  setTimeIdx]  = useState(2)

  const selPart = selId ? PARTS.find(p => p.id === selId) : null

  const updateCam = useCallback(() => {
    const { camTheta, camPhi, camR } = stateRef.current
    const { camera } = threeRef.current
    if (!camera) return
    camera.position.set(
      camR * Math.sin(camPhi) * Math.sin(camTheta),
      camR * Math.cos(camPhi),
      camR * Math.sin(camPhi) * Math.cos(camTheta)
    )
    camera.lookAt(0, .3, 0)
  }, [])

  const updateColors = useCallback((idx) => {
    const pcts = ANCHOR_PCTS[idx]
    Object.entries(threeRef.current.meshes).forEach(([id, arr]) => {
      const pct = pcts[id] || 0
      const col = pct >= 85 ? STATUS_3JS.done : pct >= 50 ? STATUS_3JS.progress : pct >= 30 ? STATUS_3JS.delay : STATUS_3JS.todo
      arr.forEach(m => m.material.color.setHex(col))
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const W = canvas.parentElement.clientWidth
    const H = canvas.parentElement.clientHeight
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H, false)
    renderer.setClearColor(0x0F1923, 1)
    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, W / H, .1, 100)
    threeRef.current = { scene, camera, renderer, meshes: {}, animId: null }
    updateCam()
    scene.add(new THREE.AmbientLight(0xffffff, .6))
    const dl  = new THREE.DirectionalLight(0xffffff, .9); dl.position.set(5, 8, 6);    scene.add(dl)
    const dl2 = new THREE.DirectionalLight(0x8888ff, .3); dl2.position.set(-5, -3, -4); scene.add(dl2)
    const meshes = {}
    const add = (geo, partId, pos, opacity = 1) => {
      const col = STATUS_3JS[PARTS.find(p => p.id === partId)?.status || 'todo']
      const m = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: col, transparent: opacity < 1, opacity, shininess: 60 }))
      m.position.set(...pos)
      m.userData = { partId, basePos: [...pos] }
      scene.add(m)
      if (!meshes[partId]) meshes[partId] = []
      meshes[partId].push(m)
    }
    add(new THREE.BoxGeometry(3.2, .35, 1.5), 'body',     [0, .52, 0])
    add(new THREE.BoxGeometry(1.8, .55, 1.4), 'body',     [0, .90, 0], .7)
    add(new THREE.BoxGeometry(3.0, .12, 1.4), 'chassis',  [0, 0, 0])
    add(new THREE.BoxGeometry(2.6, .22, 1.2), 'engine',   [.2, -.18, 0])
    const wg = new THREE.CylinderGeometry(.28, .28, .2, 16)
    ;[[-1.1, -.32, .78],[1.1, -.32, .78],[-1.1, -.32, -.78],[1.1, -.32, -.78]].forEach(p => add(wg, 'susp', p))
    add(new THREE.BoxGeometry(.8,  .5,  1.3), 'interior', [-.3, .68, 0])
    add(new THREE.BoxGeometry(2.0, .15, 1.3), 'interior', [0,  .75, 0], .4)
    add(new THREE.BoxGeometry(.6,  .35, 1.3), 'elec',     [1.1, .35, 0])
    add(new THREE.BoxGeometry(.5,  .3,  1.2), 'safety',   [-1.35, .52, 0])
    add(new THREE.BoxGeometry(.4,  .25, 1.2), 'safety',   [1.45,  .45, 0], .7)
    threeRef.current.meshes = meshes
    const loop = () => { threeRef.current.animId = requestAnimationFrame(loop); renderer.render(scene, camera) }
    loop()
    return () => { cancelAnimationFrame(threeRef.current.animId); renderer.dispose() }
  }, [updateCam])

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return
    const onDown  = e => { stateRef.current.mouseDown = true; stateRef.current.last = { x: e.clientX, y: e.clientY } }
    const onUp    = () => { stateRef.current.mouseDown = false }
    const onMove  = e => {
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

  const selectPart = id => {
    setSelId(id)
    Object.entries(threeRef.current.meshes).forEach(([pid, arr]) =>
      arr.forEach(m => { m.material.emissive = new THREE.Color(pid === id ? 0x224488 : 0x000000) })
    )
  }
  const clearSel = () => {
    setSelId(null)
    Object.values(threeRef.current.meshes).flat().forEach(m => { m.material.emissive = new THREE.Color(0x000000) })
  }
  const handleExplode = () => {
    const next = !exploded; setExploded(next)
    const off = { body:[0,.6,0], engine:[.5,-.2,0], chassis:[0,-.5,0], susp:[0,-.5,0], interior:[-.5,.4,0], elec:[.8,0,0], safety:[-.8,0,0] }
    Object.entries(threeRef.current.meshes).forEach(([id, arr]) => {
      const o = next ? (off[id] || [0,0,0]) : [0,0,0]
      arr.forEach(m => { const b = m.userData.basePos; m.position.set(b[0]+o[0], b[1]+o[1], b[2]+o[2]) })
    })
  }
  const handleWire = () => {
    const next = !wire; setWire(next)
    Object.values(threeRef.current.meshes).flat().forEach(m => { m.material.wireframe = next })
  }
  const handleTime = idx => { setTimeIdx(idx); updateColors(idx) }

  const toolBtn = (label, active, onClick) => (
    <button onClick={onClick} style={{
      background: active ? "rgba(55,138,221,.4)" : "rgba(12,26,46,.75)",
      border: ".5px solid rgba(255,255,255,.12)", borderRadius: 6,
      padding: "5px 10px", fontSize: 11, color: "#B5D4F4", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", fontFamily: "inherit",
    }}>{label}</button>
  )

  return (
    <div style={{ background: C.bg }}>
      {/* Digital Thread slider（原則①）*/}
      <div style={{ background: C.navy, padding: "8px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: "#5F5E5A", whiteSpace: "nowrap", fontWeight: 500 }}>
          Digital Thread
        </span>
        <input type="range" min={0} max={ANCHORS.length - 1} value={timeIdx}
          onChange={e => handleTime(Number(e.target.value))}
          style={{ flex: 1, accentColor: C.blue }}
        />
        <span style={{ fontSize: 11, color: "#85B7EB", whiteSpace: "nowrap", minWidth: 160, fontWeight: 500 }}>
          {ANCHORS[timeIdx]}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {ANCHORS.map((_, i) => (
            <div key={i} onClick={() => handleTime(i)} style={{
              width: 8, height: 8, borderRadius: "50%", cursor: "pointer", transition: "transform .12s",
              background: i < timeIdx ? C.teal : i === timeIdx ? C.blue : "#444",
              transform: i === timeIdx ? "scale(1.4)" : "scale(1)",
            }} />
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px" }}>
        {/* Canvas */}
        <div style={{ position: "relative", background: "#0F1923", height: 460 }}>
          <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
          <div style={{ position: "absolute", top: 10, left: 10, display: "flex", flexDirection: "column", gap: 6 }}>
            {toolBtn("↺ リセット",  false,    () => { stateRef.current.camTheta=.4; stateRef.current.camPhi=1.1; stateRef.current.camR=7; updateCam() })}
            {toolBtn("⤢ 分解図",    exploded, handleExplode)}
            {toolBtn("△ ワイヤー",  wire,     handleWire)}
          </div>
          <div style={{ position: "absolute", bottom: 10, left: 10, background: "rgba(12,26,46,.85)", borderRadius: 6, padding: "7px 10px", display: "flex", gap: 10 }}>
            {[["#1D9E75","完了"],["#378ADD","進行中"],["#EF9F27","遅延"],["#E24B4A","課題"],["#888780","未着手"]].map(([color, label]) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#888" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />{label}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(12,26,46,.7)", borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "#5F5E5A" }}>
            ドラッグ: 回転　ホイール: ズーム　クリック: 選択
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 6, background: C.bg, maxHeight: 460, overflowY: "auto" }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "#888", marginBottom: 4 }}>部位一覧</div>
          {PARTS.map(p => {
            const pct = ANCHOR_PCTS[timeIdx][p.id] ?? p.pct
            return (
              <button key={p.id} onClick={() => selectPart(p.id)} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 9px",
                borderRadius: 8, cursor: "pointer", textAlign: "left", width: "100%",
                fontFamily: "inherit", transition: "all .12s",
                background: selId === p.id ? "#EBF4FE" : C.card,
                border: selId === p.id ? `1.5px solid ${C.blue}` : `.5px solid ${C.border}`,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_HEX[p.status], flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, flex: 1 }}>{p.name}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: STATUS_HEX[p.status] }}>{pct}%</span>
              </button>
            )
          })}
          {selPart && <SubPanel part={selPart} onClose={clearSel} />}
        </div>
      </div>
    </div>
  )
}
