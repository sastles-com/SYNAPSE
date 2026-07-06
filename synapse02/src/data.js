// ─────────────────────────────────────────────────────────────
// SYNAPSE02 — Data Constants（予測開発ループ・モックDB）
//
// 全コンポーネントはこのファイルのエクスポート定数を直接 import する。
// バックエンド接続時はここを API 呼び出しに差し替える（synapse01 と同じ戦略）。
//
// すべての数値は「演出値」であり、正しさの基準は DataModel §6 の物語との整合のみ。
// 週次スナップショット方式: 時系列状態は週ごとの事前計算済み状態として持つ。
// ─────────────────────────────────────────────────────────────

// ── 小さなユーティリティ ───────────────────────────────────────
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const round1 = v => Math.round(v * 10) / 10

// ─────────────────────────────────────────────────────────────
// 1. デザイントークン（synapse01 の C を基調継承）
// ─────────────────────────────────────────────────────────────
export const C = {
  navy:   "#0C1A2E",
  blue:   "#378ADD",
  blueDk: "#185FA5",
  teal:   "#1D9E75",
  purple: "#7F77DD",
  amber:  "#EF9F27",
  red:    "#E24B4A",
  gray:   "#888780",
  bg:     "#F0EFE8",
  card:   "#FFFFFF",
  border: "rgba(0,0,0,0.08)",
}

// synapse01 互換の状態色（一部の共通部品が参照）
export const STATUS_HEX = { done: C.teal, progress: C.blue, delay: C.amber, issue: C.red, todo: C.gray }
export const STATUS_3JS = { done: 0x1D9E75, progress: 0x378ADD, delay: 0xEF9F27, issue: 0xE24B4A, todo: 0x888780 }
export const STATUS_LBL = {
  done: "完了", progress: "進行中", active: "進行中", delay: "遅延",
  issue: "課題あり", todo: "未着手", target: "目標", passed: "承認済",
}

// 分類色（CSS用 16進 / Three.js 用 0x を必ず同期）
export const CLASS_HEX = { new: '#5B8DEF', carry: '#4DC38F', partial: '#F2B33D', fossil: '#E5484D' }
export const CLASS_3JS = { new: 0x5b8def, carry: 0x4dc38f, partial: 0xf2b33d, fossil: 0xe5484d }
export const CLASS_LBL = { new: '新規', carry: '流用', partial: '一部変更', fossil: 'fossil（証明書欠落）' }

// 温度グラデーション端点（高温=赤 → 凍結=青）
export const TEMP_HOT_HEX = '#E5484D'; export const TEMP_HOT_3JS = 0xe5484d
export const TEMP_COLD_HEX = '#3B82F6'; export const TEMP_COLD_3JS = 0x3b82f6

// staleness グラデーション端点（新鮮=緑 → 減衰=灰）
export const STALE_FRESH_HEX = '#1D9E75'; export const STALE_FRESH_3JS = 0x1d9e75
export const STALE_DECAY_HEX = '#6B6A64'; export const STALE_DECAY_3JS = 0x6b6a64

// 温度 0-1 → 16進 / 0x（赤→青の線形補間）
const lerpChannel = (a, b, t) => Math.round(a + (b - a) * t)
export function tempColorHex(temp) {
  const t = clamp(temp, 0, 1) // 1=hot(赤) 0=cold(青)
  const hot = [0xE5, 0x48, 0x4D], cold = [0x3B, 0x82, 0xF6]
  const r = lerpChannel(cold[0], hot[0], t), g = lerpChannel(cold[1], hot[1], t), b = lerpChannel(cold[2], hot[2], t)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
export const tempColor3JS = temp => parseInt(tempColorHex(temp).slice(1), 16)

// consensus 0-100 → 灰→青のグラデーション（合意が強いほど青）
export function consensusColorHex(c) {
  const t = clamp(c / 100, 0, 1)
  const weak = [0x8B, 0x93, 0xA7], strong = [0x37, 0x8A, 0xDD]
  const r = lerpChannel(weak[0], strong[0], t), g = lerpChannel(weak[1], strong[1], t), b = lerpChannel(weak[2], strong[2], t)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
export const consensusColor3JS = c => parseInt(consensusColorHex(c).slice(1), 16)

// staleness 0-1（0=新鮮 1=減衰）→ 緑→灰
export function stalenessColorHex(s) {
  const t = clamp(s, 0, 1)
  const fresh = [0x1D, 0x9E, 0x75], decay = [0x6B, 0x6A, 0x64]
  const r = lerpChannel(fresh[0], decay[0], t), g = lerpChannel(fresh[1], decay[1], t), b = lerpChannel(fresh[2], decay[2], t)
  return `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`
}
export const stalenessColor3JS = s => parseInt(stalenessColorHex(s).slice(1), 16)

// ─────────────────────────────────────────────────────────────
// 2. 基本定数
// ─────────────────────────────────────────────────────────────
export const DOMAINS = [
  { id: 'design', label: '設計',     color: '#5B8DEF' },
  { id: 'test',   label: '実験',     color: '#F2B33D' },
  { id: 'dsgn',   label: 'デザイン', color: '#B06DF7' },
  { id: 'mfg',    label: '生産',     color: '#4DC38F' },
  { id: 'mgmt',   label: '開発管理', color: '#8B93A7' },
]
export const DOMAIN_BY_ID = Object.fromEntries(DOMAINS.map(d => [d.id, d]))
export const domainColor = id => DOMAIN_BY_ID[id]?.color || C.gray
export const domainLabel = id => DOMAIN_BY_ID[id]?.label || id

export const WEEKS = 16 // W1..W16
export const PHASE_LABELS = {
  concept: [1, 5],   // W1-W5  コンセプト
  classA:  [6, 11],  // W6-W11 クラスA
  prodCAD: [12, 16], // W12-W16 量産CAD移行
}
export const PHASE_NAME = { concept: 'コンセプト', classA: 'クラスA', prodCAD: '量産CAD移行' }
export function phaseOf(week) {
  if (week <= PHASE_LABELS.concept[1]) return 'concept'
  if (week <= PHASE_LABELS.classA[1]) return 'classA'
  return 'prodCAD'
}

// ─────────────────────────────────────────────────────────────
// 3. collapse certificate（流用部品の凍結証明書）
// ─────────────────────────────────────────────────────────────
export const CERTIFICATES = {
  'cert-door-glass-gen5': {
    label: 'ドアガラス（NV-2021 流用）',
    frozenIn: 'NV-2021（先代プログラム）',
    loadAssumptions: '設計荷重: 昇降耐久 3万回 / 風圧 2.5kPa',
    regBaseline: '合わせガラス規格 JIS R3211:2015（凍結時点）',
    correlatedPredictions: '透過損失 予測-実測差 0.6dB（2021年実測）',
    supplierState: 'サプライヤB 硝子工場 / 工程能力 Cpk 1.55',
    contextDiff: [
      { axis: '荷重条件',       diverged: false },
      { axis: '規制',           diverged: false },
      { axis: 'パッケージ',     diverged: false },
      { axis: 'サプライヤ工程', diverged: false },
    ],
  },
  'cert-door-impactbeam-gen5': {
    label: 'サイドインパクトビーム（NV-2021 流用）',
    frozenIn: 'NV-2021（先代プログラム）',
    loadAssumptions: '設計荷重: 側面衝突 変位量 ≤ 150mm（32km/h ポール）',
    regBaseline: '2020年時点の側突規制（FMVSS 214 rev.2019）',
    correlatedPredictions: '侵入量 予測-実測差 4mm 以内（2021年実車）',
    supplierState: 'サプライヤA 第2工場 / 工程能力 Cpk 1.38',
    contextDiff: [
      { axis: '荷重条件',       diverged: false },
      { axis: '規制',           diverged: true, note: '側突規制が2024年改定（バッテリー保護要件追加）。要再評価' },
      { axis: 'パッケージ',     diverged: true, note: 'EVバッテリー搭載でドア内スペース変更' },
      { axis: 'サプライヤ工程', diverged: false },
    ],
  },
  'cert-battery-tray-gen4': {
    label: 'バッテリートレイ（NV-2019 流用ベース）',
    frozenIn: 'NV-2019（2世代前プログラム）',
    loadAssumptions: '設計荷重: 静荷重 12kN / 振動 PSD 0.04G²/Hz',
    regBaseline: '2018年時点の車載電池筐体基準',
    correlatedPredictions: 'セル温度 予測-実測差 3℃（2019年実測・小容量パック）',
    supplierState: 'サプライヤC 電池筐体ライン / 工程能力 Cpk 1.21',
    contextDiff: [
      { axis: '荷重条件',       diverged: false },
      { axis: '規制',           diverged: false },
      { axis: '熱条件',         diverged: true, note: '大容量パック化で放熱要件が増大。W6実走で航続乖離として顕在化' },
      { axis: 'サプライヤ工程', diverged: false },
    ],
  },
  'cert-door-regulator-gen5': {
    label: 'ウィンドウレギュレータ（NV-2021 流用）',
    frozenIn: 'NV-2021（先代プログラム）',
    loadAssumptions: '設計荷重: 昇降耐久 3万回 / 挟み込み荷重 100N',
    regBaseline: '挟み込み防止 UN-R21（凍結時点）',
    correlatedPredictions: '昇降時間 予測-実測差 0.1s（2021年実測）',
    supplierState: 'サプライヤD モータユニット / 工程能力 Cpk 1.60',
    contextDiff: [
      { axis: '荷重条件',       diverged: false },
      { axis: '規制',           diverged: false },
      { axis: 'パッケージ',     diverged: false },
      { axis: 'サプライヤ工程', diverged: false },
    ],
  },
}

// ─────────────────────────────────────────────────────────────
// 4. w 成分 — 中核スキーマ
//   COMPONENT_SPECS（内部）から W_COMPONENTS（公開・不変属性）と
//   W_SNAPSHOTS（週次・可変属性）を生成する。
// ─────────────────────────────────────────────────────────────

// --- 成分の進化スペック（内部） ---------------------------------
// term:  多峰の用語。converge があれば単峰へ収束。deadline なしは無期限多峰許容
// class: 分類成分（流用/一部変更/新規/fossil）。deadline・collapse・reheat・fossil を持つ
// idmap: ID対応。phaseFlip でフェーズ遷移交渉（W12）に更新
// severity: リスク重大度。grounded で staleness リセット

const TERM_SPECS = [
  // 主要係争語（ヒーロー）
  { id: 'w-term-module', label: 'モジュール', plain: '「モジュール」という語の意味', domains: ['design', 'test', 'mfg'], halfLife: 6,
    startModes: [['機能単位の部品集合', 45, ['design']], ['組立単位の部品集合', 40, ['mfg']], ['試験単位の部品集合', 15, ['test']]],
    convergeBy: 8, winner: '機能単位の部品集合', cStart: 22, cEnd: 78, grounded: [1, 5] },
  { id: 'w-term-zone', label: 'ゾーン', plain: '「ゾーン」という語の意味', domains: ['design', 'mfg'], halfLife: 8,
    startModes: [['車体レイアウト上の領域', 52, ['design']], ['生産ライン工程の区画', 48, ['mfg']]],
    multimodal: true, cStart: 20, cEnd: 44, grounded: [1] }, // 多峰のまま容認（deadline なし）
  { id: 'w-term-subassy', label: 'サブアッシー', plain: '「サブアッシー」の範囲', domains: ['design', 'mfg', 'test'], halfLife: 6,
    startModes: [['ドア完成体（ガラス込み）', 40, ['mfg']], ['ドア構造体（内外パネル）', 38, ['design']], ['試験単位のドア', 22, ['test']]],
    multimodal: true, cStart: 24, cEnd: 48, grounded: [1] }, // 多峰のまま容認
  // 収束していく一般語
  { id: 'w-term-variant', label: 'バリアント', plain: '流用元からの派生の呼び方', domains: ['design', 'dsgn'], halfLife: 8, convergeBy: 6, cStart: 30, cEnd: 82,
    startModes: [['USD variant アーク', 55, ['design']], ['CADコンフィグ', 45, ['dsgn']]], winner: 'USD variant アーク', grounded: [1] },
  { id: 'w-term-carryover', label: '流用', plain: '何をもって「流用」とするか', domains: ['design', 'mfg'], halfLife: 6, convergeBy: 7, cStart: 28, cEnd: 80,
    startModes: [['凍結条件が現文脈と一致', 50, ['design']], ['前形式の図番をそのまま', 50, ['mfg']]], winner: '凍結条件が現文脈と一致', grounded: [1, 5] },
  { id: 'w-term-classA', label: 'クラスA面', plain: '意匠面の完成度基準', domains: ['dsgn', 'design'], halfLife: 8, convergeBy: 6, cStart: 34, cEnd: 84,
    startModes: [['曲率連続 G2 以上', 58, ['dsgn']], ['製造可能な意匠面', 42, ['design']]], winner: '曲率連続 G2 以上', grounded: [1] },
  { id: 'w-term-package', label: 'パッケージ', plain: '寸法配置の合意単位', domains: ['design', 'mgmt'], halfLife: 8, convergeBy: 7, cStart: 32, cEnd: 76,
    startModes: [['乗員+機構の空間配置', 60, ['design']], ['原価配分の単位', 40, ['mgmt']]], winner: '乗員+機構の空間配置', grounded: [1] },
  { id: 'w-term-hardpoint', label: 'ハードポイント', plain: '動かせない基準点', domains: ['design', 'dsgn'], halfLife: 6, convergeBy: 6, cStart: 30, cEnd: 85,
    startModes: [['機構拘束点', 55, ['design']], ['意匠基準点', 45, ['dsgn']]], winner: '機構拘束点', grounded: [1, 5] },
  { id: 'w-term-datum', label: 'データム', plain: '計測の基準系', domains: ['design', 'mfg'], halfLife: 6, convergeBy: 5, cStart: 36, cEnd: 88,
    startModes: [['GD&T 基準系', 62, ['design']], ['治具基準', 38, ['mfg']]], winner: 'GD&T 基準系', grounded: [1] },
  { id: 'w-term-tolerance', label: '公差', plain: '公差の割り付け思想', domains: ['design', 'mfg', 'test'], halfLife: 5, convergeBy: 8, cStart: 26, cEnd: 74,
    startModes: [['機能公差から配分', 48, ['design']], ['工程能力から配分', 52, ['mfg']]], winner: '工程能力から配分', grounded: [1] },
  { id: 'w-term-nvh', label: 'NVH', plain: '静粛性の合否指標', domains: ['test', 'design'], halfLife: 4, convergeBy: 7, cStart: 30, cEnd: 80,
    startModes: [['車内音圧 dB(A)', 60, ['test']], ['透過損失 TL', 40, ['design']]], winner: '車内音圧 dB(A)', grounded: [1, 13] },
  { id: 'w-term-range', label: '航続距離', plain: '航続の測定条件', domains: ['test', 'mgmt'], halfLife: 4, convergeBy: 6, cStart: 34, cEnd: 82,
    startModes: [['WLTC実測', 65, ['test']], ['カタログ値換算', 35, ['mgmt']]], winner: 'WLTC実測', grounded: [1, 6] },
  { id: 'w-term-derating', label: 'ディレーティング', plain: '出力制限の設計余裕', domains: ['test', 'design'], halfLife: 5, convergeBy: 8, cStart: 28, cEnd: 72,
    startModes: [['熱余裕 15%', 50, ['test']], ['熱余裕 10%', 50, ['design']]], winner: '熱余裕 15%', grounded: [1, 6] },
  { id: 'w-term-cmf', label: 'CMF', plain: '色・素材・仕上げの合意', domains: ['dsgn', 'mgmt'], halfLife: 10, convergeBy: 9, cStart: 30, cEnd: 78,
    startModes: [['質感トーンボード', 58, ['dsgn']], ['原価内の素材表', 42, ['mgmt']]], winner: '質感トーンボード', grounded: [1] },
  { id: 'w-term-gapflush', label: 'ちり・段差', plain: '見切りの品質基準', domains: ['dsgn', 'mfg'], halfLife: 6, convergeBy: 8, cStart: 32, cEnd: 76,
    startModes: [['意匠見切り 0.5mm', 52, ['dsgn']], ['工程能力 0.8mm', 48, ['mfg']]], winner: '意匠見切り 0.5mm', grounded: [1] },
  { id: 'w-term-dr', label: 'デザインレビュー', plain: 'DRの合否の意味', domains: ['mgmt', 'design'], halfLife: 8, convergeBy: 5, cStart: 40, cEnd: 86,
    startModes: [['焼きなましイベント', 55, ['mgmt']], ['一斉凍結の関門', 45, ['design']]], winner: '焼きなましイベント', grounded: [1] },
  { id: 'w-term-freeze', label: 'フリーズ', plain: '凍結の可逆性', domains: ['mgmt', 'mfg'], halfLife: 6, convergeBy: 7, cStart: 30, cEnd: 80,
    startModes: [['成分別の不可逆デッドライン', 54, ['mgmt']], ['図面リリース日', 46, ['mfg']]], winner: '成分別の不可逆デッドライン', grounded: [1] },
  { id: 'w-term-cpk', label: '工程能力', plain: 'Cpk の合意目標', domains: ['mfg', 'test'], halfLife: 6, convergeBy: 6, cStart: 38, cEnd: 84,
    startModes: [['Cpk ≥ 1.33', 70, ['mfg']], ['Cpk ≥ 1.67', 30, ['test']]], winner: 'Cpk ≥ 1.33', grounded: [1] },
  { id: 'w-term-homolog', label: '認証', plain: '型式認証の適合範囲', domains: ['mgmt', 'test'], halfLife: 8, convergeBy: 9, cStart: 30, cEnd: 74,
    startModes: [['UN-R 準拠', 60, ['mgmt']], ['地域別上乗せ', 40, ['test']]], winner: 'UN-R 準拠', grounded: [1] },
  { id: 'w-term-thermal', label: '熱設計', plain: '熱マネジメントの合意単位', domains: ['design', 'test'], halfLife: 4, convergeBy: 8, cStart: 26, cEnd: 70,
    startModes: [['セル温度 ≤ 45℃', 55, ['test']], ['放熱経路の設計余裕', 45, ['design']]], winner: 'セル温度 ≤ 45℃', grounded: [1, 6] },
]

// ドア系サブシステムの分類成分（class）。24件（ヒーロー3件＋一般）
const CLASS_SPECS = [
  // ヒーロー
  { id: 'w-class-door-hinge', label: 'ドアヒンジ分類', plain: 'ドアヒンジは流用か一部変更か', domains: ['design', 'test', 'mfg'], halfLife: 4, deadline: 14,
    partIds: ['p-door-fl', 'p-door-fr'], base: 'partial', cStart: 30, cEnd: 62, grounded: [1, 6],
    bimodal: [['流用', 55, ['mfg', 'design']], ['一部変更', 45, ['test']]], lateWarn: true, collapseAt: 14, collapseTo: '一部変更' },
  { id: 'w-class-door-seal', label: 'ドアシール分類', plain: 'ドアシールは流用か（先代からの持ち越し）', domains: ['design', 'test', 'mfg'], halfLife: 5, deadline: 15,
    partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', cStart: 60, cEnd: 40, grounded: [1], // 一見 carry だが証明書欠落
    single: '流用', fossilAt: 9, certificateId: null, reheatAt: 13, reheatTo: '一部変更' },
  { id: 'w-class-battery-tray', label: 'バッテリートレイ分類', plain: 'バッテリートレイは流用か一部変更か', domains: ['design', 'test', 'mfg'], halfLife: 4, deadline: 14,
    partIds: ['p-battery'], base: 'carry', cStart: 70, cEnd: 66, grounded: [1, 6], certificateId: 'cert-battery-tray-gen4',
    single: '流用', reheatAt: 7, reheatTo: '一部変更', collapseAt: 14, collapseTo: '一部変更' },
  // 明確な流用（証明書あり）
  { id: 'w-class-door-glass', label: 'ドアガラス分類', plain: 'ドアガラスは流用', domains: ['design', 'mfg'], halfLife: 8,
    partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', certificateId: 'cert-door-glass-gen5', cStart: 88, cEnd: 90, grounded: [1] },
  { id: 'w-class-door-regulator', label: 'ウィンドウレギュレータ分類', plain: 'レギュレータは流用', domains: ['design', 'mfg'], halfLife: 8,
    partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', certificateId: 'cert-door-regulator-gen5', cStart: 86, cEnd: 88, grounded: [1] },
  { id: 'w-class-door-impactbeam', label: 'サイドインパクトビーム分類', plain: '側突ビームは規制改定で一部変更', domains: ['design', 'test', 'mgmt'], halfLife: 5, deadline: 15,
    partIds: ['p-door-fl', 'p-door-fr', 'p-safety'], base: 'partial', single: '一部変更', certificateId: 'cert-door-impactbeam-gen5', cStart: 44, cEnd: 70, grounded: [1, 6], reheatAt: 6, reheatTo: '一部変更', collapseAt: 15, collapseTo: '一部変更' },
  // 一般ドア部品（流用中心・単峰）
  { id: 'w-class-door-panel',      label: 'ドアアウターパネル分類', plain: '外板は新規', domains: ['dsgn', 'design'], halfLife: 6, partIds: ['p-door-fl', 'p-door-fr'], base: 'new',     single: '新規', cStart: 50, cEnd: 82, grounded: [1] },
  { id: 'w-class-door-inner',      label: 'ドアインナーパネル分類', plain: '内板は一部変更', domains: ['design', 'mfg'], halfLife: 6, partIds: ['p-door-fl', 'p-door-fr'], base: 'partial', single: '一部変更', cStart: 40, cEnd: 74, grounded: [1] },
  { id: 'w-class-door-latch',      label: 'ドアラッチ分類',       plain: 'ラッチは流用', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', cStart: 82, cEnd: 86, grounded: [1] },
  { id: 'w-class-door-checklink',  label: 'ドアチェックリンク分類', plain: 'チェックリンクは流用', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', cStart: 80, cEnd: 84, grounded: [1] },
  { id: 'w-class-door-mirror',     label: 'ドアミラー分類',       plain: 'ミラーは新規', domains: ['dsgn', 'design'], halfLife: 6, partIds: ['p-door-fl', 'p-door-fr'], base: 'new', single: '新規', cStart: 46, cEnd: 78, grounded: [1] },
  { id: 'w-class-door-handle',     label: 'ドアハンドル分類',     plain: 'ハンドルは新規（フラッシュ）', domains: ['dsgn', 'mfg'], halfLife: 6, partIds: ['p-door-fl', 'p-door-fr'], base: 'new', single: '新規', cStart: 42, cEnd: 76, grounded: [1] },
  { id: 'w-class-door-armrest',    label: 'アームレスト分類',     plain: 'アームレストは一部変更', domains: ['dsgn', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'partial', single: '一部変更', cStart: 44, cEnd: 72, grounded: [1] },
  { id: 'w-class-door-trim',       label: 'ドアトリム分類',       plain: 'トリムは新規', domains: ['dsgn', 'design'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'new', single: '新規', cStart: 48, cEnd: 80, grounded: [1] },
  { id: 'w-class-door-speaker',    label: 'スピーカーグリル分類', plain: 'グリルは流用', domains: ['dsgn', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', cStart: 84, cEnd: 88, grounded: [1] },
  { id: 'w-class-door-wiring',     label: 'ドアワイヤハーネス分類', plain: 'ハーネスは一部変更', domains: ['design', 'mfg'], halfLife: 6, partIds: ['p-door-fl', 'p-door-fr', 'p-elec'], base: 'partial', single: '一部変更', cStart: 38, cEnd: 70, grounded: [1] },
  { id: 'w-class-door-weatherstrip', label: 'ウェザーストリップ分類', plain: 'ウェザーストリップは一部変更', domains: ['design', 'test'], halfLife: 5, partIds: ['p-door-fl', 'p-door-fr'], base: 'partial', single: '一部変更', cStart: 40, cEnd: 68, grounded: [1] },
  { id: 'w-class-door-beltmoulding', label: 'ベルトモール分類', plain: 'ベルトモールは新規', domains: ['dsgn', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'new', single: '新規', cStart: 50, cEnd: 80, grounded: [1] },
  { id: 'w-class-door-lock',       label: 'ドアロックアクチュエータ分類', plain: 'ロックは流用', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr', 'p-elec'], base: 'carry', single: '流用', cStart: 82, cEnd: 86, grounded: [1] },
  { id: 'w-class-door-switch',     label: 'パワーウィンドウSW分類', plain: 'SWは流用', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr', 'p-elec'], base: 'carry', single: '流用', cStart: 80, cEnd: 84, grounded: [1] },
  { id: 'w-class-door-courtesy',   label: 'カーテシランプ分類',   plain: 'カーテシは新規', domains: ['dsgn', 'design'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'new', single: '新規', cStart: 52, cEnd: 82, grounded: [1] },
  { id: 'w-class-door-stopper',    label: 'ドアストッパー分類',   plain: 'ストッパーは流用', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', cStart: 84, cEnd: 88, grounded: [1] },
  { id: 'w-class-door-grommet',    label: 'グロメット分類',       plain: 'グロメットは流用', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-door-fl', 'p-door-fr'], base: 'carry', single: '流用', cStart: 86, cEnd: 90, grounded: [1] },
]

const IDMAP_SPECS = [
  { id: 'w-id-door-fl',      label: '左フロントドア ID', plain: '左フロントドアの永続ID対応', domains: ['design', 'dsgn', 'mfg'], halfLife: 8, partIds: ['p-door-fl'],
    concept: 'DOOR-FL / コンセプトサーフェス v0', classA: 'DOOR-FL / クラスA面 rev.C', prodCAD: 'DOOR-FL / 量産CAD PN 62100-NV26', phaseFlip: 12 },
  { id: 'w-id-door-fr',      label: '右フロントドア ID', plain: '右フロントドアの永続ID対応', domains: ['design', 'dsgn', 'mfg'], halfLife: 8, partIds: ['p-door-fr'],
    concept: 'DOOR-FR / コンセプトサーフェス v0', classA: 'DOOR-FR / クラスA面 rev.C', prodCAD: 'DOOR-FR / 量産CAD PN 62101-NV26', phaseFlip: 12 },
  { id: 'w-id-battery-pack', label: 'バッテリーパック ID', plain: 'バッテリーパックの永続ID対応', domains: ['design', 'mfg'], halfLife: 8, partIds: ['p-battery'],
    concept: 'BATT-PACK / レイアウト案 v0', classA: 'BATT-PACK / 構造モデル rev.B', prodCAD: 'BATT-PACK / 量産CAD PN 29500-NV26', phaseFlip: 12 },
  { id: 'w-id-front-fascia', label: 'フロントフェイシャ ID', plain: '前面意匠の永続ID対応', domains: ['dsgn', 'design'], halfLife: 10, partIds: ['p-body'],
    concept: 'F-FASCIA / スケッチ v0', classA: 'F-FASCIA / クラスA面 rev.D', prodCAD: 'F-FASCIA / 量産CAD PN 62010-NV26', phaseFlip: 13 },
  { id: 'w-id-cowl',         label: 'カウル ID', plain: 'カウルの永続ID対応', domains: ['design', 'mfg'], halfLife: 10, partIds: ['p-body'],
    concept: 'COWL / レイアウト案 v0', classA: 'COWL / 構造モデル rev.A', prodCAD: 'COWL / 量産CAD PN 66100-NV26', phaseFlip: 12 },
  { id: 'w-id-underbody',    label: 'アンダーボディ ID', plain: 'アンダーボディの永続ID対応', domains: ['design', 'mfg'], halfLife: 10, partIds: ['p-chassis'],
    concept: 'UNDERBODY / 骨格案 v0', classA: 'UNDERBODY / 構造モデル rev.B', prodCAD: 'UNDERBODY / 量産CAD PN 74000-NV26', phaseFlip: 12 },
]

const SEVERITY_SPECS = [
  { id: 'w-sev-range',     label: '航続距離リスク', plain: '航続距離が目標を下回るリスク', domains: ['test', 'design', 'mgmt'], halfLife: 4, partIds: ['p-battery'],
    sevStart: 'mid', sevPeak: 'high', peakAt: 6, calib: 'test', cStart: 40, cEnd: 66, grounded: [1, 6] },
  { id: 'w-sev-nvh',       label: 'NVHリスク', plain: '静粛性が目標に届かないリスク', domains: ['test', 'design'], halfLife: 4, partIds: ['p-door-fl', 'p-door-fr'],
    sevStart: 'low', sevPeak: 'high', peakAt: 13, calib: 'test', cStart: 42, cEnd: 60, grounded: [1, 13] },
  { id: 'w-sev-sidecrash', label: '側突安全リスク', plain: '側突規制改定への適合リスク', domains: ['test', 'design', 'mgmt'], halfLife: 6, partIds: ['p-safety', 'p-door-fl'],
    sevStart: 'mid', sevPeak: 'high', peakAt: 6, calib: 'test', cStart: 44, cEnd: 72, grounded: [1, 6] },
  { id: 'w-sev-thermal',   label: '熱マネジメントリスク', plain: 'バッテリー熱の設計余裕リスク', domains: ['design', 'test'], halfLife: 4, partIds: ['p-battery'],
    sevStart: 'mid', sevPeak: 'high', peakAt: 6, calib: 'design', cStart: 38, cEnd: 64, grounded: [1, 6] },
]

// --- 公開: W_COMPONENTS（不変属性のみ） -------------------------
function toComponent(s, type) {
  return {
    id: s.id, type, label: s.label, plain: s.plain,
    domains: s.domains, halfLife: s.halfLife, deadline: s.deadline ?? null,
    partIds: s.partIds || [], certificateId: s.certificateId ?? null,
  }
}
export const W_COMPONENTS = [
  ...TERM_SPECS.map(s => toComponent(s, 'term')),
  ...CLASS_SPECS.map(s => toComponent(s, 'class')),
  ...IDMAP_SPECS.map(s => toComponent(s, 'idmap')),
  ...SEVERITY_SPECS.map(s => toComponent(s, 'severity')),
]
export const W_BY_ID = Object.fromEntries(W_COMPONENTS.map(c => [c.id, c]))

// --- 週次スナップショット生成ロジック --------------------------
const lastGrounded = (grounded, w) => grounded.filter(g => g <= w).slice(-1)[0] ?? 1

function progress(cStart, cEnd, w, by = 8) {
  if (w <= 1) return cStart
  if (w >= by) return cEnd
  return Math.round(cStart + (cEnd - cStart) * (w - 1) / (by - 1))
}

function termSnap(s, w) {
  const grounded = s.grounded || [1]
  let consensus = progress(s.cStart, s.cEnd, w, s.convergeBy || 8)
  let modes
  if (s.multimodal || !s.convergeBy) {
    // 多峰のまま：share を僅かに揺らす
    modes = s.startModes.map(([value, share, backers], i) =>
      ({ value, share: clamp(share + (i === 0 ? Math.min(w, 6) : -Math.min(w, 6) / (s.startModes.length - 1)), 5, 95), backers }))
    // 正規化
    const sum = modes.reduce((a, m) => a + m.share, 0)
    modes = modes.map(m => ({ ...m, share: Math.round(m.share / sum * 100) }))
  } else if (w >= s.convergeBy) {
    modes = [{ value: s.winner, share: 100, backers: s.startModes.find(m => m[0] === s.winner)?.[2] || s.domains }]
  } else {
    // 収束途中：winner の share を押し上げる
    const t = (w - 1) / (s.convergeBy - 1)
    modes = s.startModes.map(([value, share, backers]) => {
      const isWin = value === s.winner
      const sh = isWin ? share + (95 - share) * t : share * (1 - t)
      return { value, share: Math.max(2, Math.round(sh)), backers }
    })
    const sum = modes.reduce((a, m) => a + m.share, 0)
    modes = modes.map(m => ({ ...m, share: Math.round(m.share / sum * 100) }))
  }
  return {
    modes, consensus,
    lastGrounded: lastGrounded(grounded, w),
    temperature: round1(clamp(0.9 - 0.02 * (w - 1), 0.55, 1)),
    collapsedAt: null, reheatedAt: null, fossil: false, certificateId: null,
    classification: null,
  }
}

const SEV_RANK = { low: 1, mid: 2, high: 3 }
const SEV_VAL = { 1: 'low', 2: 'mid', 3: 'high' }

function classSnap(s, w) {
  const grounded = s.grounded || [1]
  const reheated = s.reheatAt && w >= s.reheatAt
  const collapsed = s.collapseAt && w >= s.collapseAt
  // fossil は「証明書欠落のまま凍結」状態。再加熱で凍結根拠を作り直すと fossil ではなくなる。
  const fossil = s.fossilAt ? (w >= s.fossilAt && !(s.reheatAt && w >= s.reheatAt)) : false

  // 分類の現在値
  let classification = s.base
  if (reheated && s.reheatTo) classification = s.reheatTo === '一部変更' ? 'partial' : s.reheatTo === '新規' ? 'new' : 'carry'
  if (collapsed && s.collapseTo) classification = s.collapseTo === '一部変更' ? 'partial' : s.collapseTo === '新規' ? 'new' : 'carry'
  if (fossil) classification = 'fossil'

  // modes
  let modes
  if (s.bimodal && !collapsed) {
    // ヒーロー：二峰。デッドライン接近で winner 側へ寄る
    const t = s.deadline ? clamp((w - 1) / (s.deadline - 1), 0, 1) : 0
    const [a, b] = s.bimodal
    const winIsB = s.collapseTo && b[0] === s.collapseTo
    const aShare = winIsB ? Math.round(a[1] - (a[1] - 30) * t) : Math.round(a[1] + (70 - a[1]) * t)
    modes = [
      { value: a[0], share: aShare, backers: a[2] },
      { value: b[0], share: 100 - aShare, backers: b[2] },
    ]
  } else if (collapsed) {
    modes = [{ value: s.collapseTo || s.single, share: 100, backers: s.domains }]
  } else if (reheated && s.reheatTo) {
    // 再加熱：単峰から二峰へ割れる
    modes = [
      { value: s.single, share: 55, backers: [s.domains[0]] },
      { value: s.reheatTo, share: 45, backers: [s.domains[1] || s.domains[0]] },
    ]
  } else {
    modes = [{ value: s.single || CLASS_LBL[s.base], share: 100, backers: s.domains }]
  }

  // consensus
  let consensus = progress(s.cStart ?? 60, s.cEnd ?? 80, w, s.deadline || 12)
  if (reheated && !collapsed) consensus = Math.max(s.cStart ?? 40, consensus - 22) // 再加熱で合意が揺らぐ
  if (collapsed) consensus = 100
  if (fossil) consensus = Math.min(consensus, 46) // fossil は隠れた不確かさ

  // temperature
  let temperature
  if (collapsed) temperature = 0.05
  else if (!s.deadline) temperature = s.base === 'carry' ? 0.15 : round1(clamp(0.85 - 0.02 * (w - 1), 0.5, 0.95))
  else {
    temperature = round1(clamp(1 - (w - 1) / (s.deadline - 1), 0.08, 1))
    if (s.base === 'carry' && !reheated) temperature = 0.12 // 先代凍結（低温）
    if (reheated) temperature = round1(clamp(0.72 - (w - s.reheatAt) / Math.max(1, s.deadline - s.reheatAt) * 0.55, 0.12, 0.72))
  }

  return {
    modes, consensus: Math.round(consensus),
    lastGrounded: lastGrounded(grounded, w),
    temperature,
    collapsedAt: collapsed ? s.collapseAt : null,
    reheatedAt: reheated ? s.reheatAt : null,
    fossil,
    certificateId: s.certificateId ?? null,
    classification,
  }
}

function idmapSnap(s, w) {
  const phase = w >= (s.phaseFlip ?? 12) ? 'prodCAD' : (w >= PHASE_LABELS.classA[0] ? 'classA' : 'concept')
  const value = s[phase]
  const modes = [{ value, share: 100, backers: s.domains }]
  const consensus = phase === 'prodCAD' ? 90 : phase === 'classA' ? 74 : 58
  return {
    modes, consensus,
    lastGrounded: 1,
    temperature: round1(clamp(0.7 - 0.03 * (w - 1), 0.2, 0.7)),
    collapsedAt: w >= (s.phaseFlip ?? 12) ? s.phaseFlip : null,
    reheatedAt: null, fossil: false, certificateId: null, classification: null,
    phase,
  }
}

function severitySnap(s, w) {
  const grounded = s.grounded || [1]
  const rank = w >= (s.peakAt ?? 6) ? SEV_RANK[s.sevPeak] : SEV_RANK[s.sevStart]
  const consensus = progress(s.cStart, s.cEnd, w, 12)
  const modes = [{ value: `重大度: ${SEV_VAL[rank] === 'high' ? '高' : SEV_VAL[rank] === 'mid' ? '中' : '低'}`, share: 100, backers: [s.calib] }]
  return {
    modes, consensus,
    lastGrounded: lastGrounded(grounded, w),
    temperature: round1(clamp(0.8 - 0.02 * (w - 1), 0.4, 0.9)),
    collapsedAt: null, reheatedAt: null, fossil: false, certificateId: null,
    classification: null,
    severity: SEV_VAL[rank], calibDomain: s.calib,
  }
}

// --- 公開: W_SNAPSHOTS[week][componentId] ----------------------
export const W_SNAPSHOTS = (() => {
  const out = {}
  for (let w = 1; w <= WEEKS; w++) {
    const wk = {}
    TERM_SPECS.forEach(s => { wk[s.id] = termSnap(s, w) })
    CLASS_SPECS.forEach(s => { wk[s.id] = classSnap(s, w) })
    IDMAP_SPECS.forEach(s => { wk[s.id] = idmapSnap(s, w) })
    SEVERITY_SPECS.forEach(s => { wk[s.id] = severitySnap(s, w) })
    out[w] = wk
  }
  return out
})()

// staleness 0-1（0=新鮮 1=半減期到達以上）: 経過週 / halfLife
export function stalenessOf(componentId, week) {
  const c = W_BY_ID[componentId]
  const st = W_SNAPSHOTS[week]?.[componentId]
  if (!c || !st) return 0
  const elapsed = week - st.lastGrounded
  return clamp(elapsed / c.halfLife, 0, 1)
}
export const snapAt = (week, id) => W_SNAPSHOTS[week]?.[id]

// ─────────────────────────────────────────────────────────────
// 5. PARTS — 3D部位（synapse01 の車両構築コードを流用・拡張）
// ─────────────────────────────────────────────────────────────
export const PARTS = [
  { id: 'p-body',     name: 'ボディ外装',       classification: 'partial', fossil: false, wComponentIds: ['w-id-front-fascia', 'w-term-gapflush', 'w-term-classA'],          certificateId: null,                        owner: '田中' },
  { id: 'p-chassis',  name: 'シャシー',         classification: 'carry',   fossil: false, wComponentIds: ['w-id-underbody', 'w-term-tolerance'],                             certificateId: null,                        owner: '田中' },
  { id: 'p-battery',  name: 'バッテリートレイ', classification: 'carry',   fossil: false, wComponentIds: ['w-class-battery-tray', 'w-sev-range', 'w-sev-thermal', 'w-id-battery-pack'], certificateId: 'cert-battery-tray-gen4', owner: '鈴木' },
  { id: 'p-susp',     name: '足回り',           classification: 'carry',   fossil: false, wComponentIds: ['w-term-tolerance'],                                               certificateId: null,                        owner: '田中' },
  { id: 'p-interior', name: 'インテリア',       classification: 'new',     fossil: false, wComponentIds: ['w-term-cmf', 'w-class-door-trim'],                                certificateId: null,                        owner: '佐藤' },
  { id: 'p-elec',     name: '電装・ソフト',     classification: 'new',     fossil: false, wComponentIds: ['w-class-door-wiring', 'w-class-door-lock'],                        certificateId: null,                        owner: '佐藤' },
  { id: 'p-safety',   name: '安全システム',     classification: 'partial', fossil: false, wComponentIds: ['w-sev-sidecrash', 'w-class-door-impactbeam'],                     certificateId: null,                        owner: '山田' },
  { id: 'p-door-fl',  name: '左フロントドア',   classification: 'partial', fossil: false, wComponentIds: ['w-class-door-hinge', 'w-class-door-seal', 'w-term-subassy', 'w-id-door-fl'], certificateId: null,               owner: '田中' },
  { id: 'p-door-fr',  name: '右フロントドア',   classification: 'partial', fossil: false, wComponentIds: ['w-class-door-hinge', 'w-class-door-seal', 'w-id-door-fr'],         certificateId: null,                        owner: '田中' },
]
export const PART_BY_ID = Object.fromEntries(PARTS.map(p => [p.id, p]))

// 部位の週次「代表状態」を紐付き w 成分から導出（3D着色・部位パネル用）
function primaryClassComponent(part) {
  return part.wComponentIds.map(id => W_BY_ID[id]).find(c => c && c.type === 'class')
}
export function partClassAt(part, week) {
  // いずれかの成分が fossil ならその部位は fossil 表示
  for (const id of part.wComponentIds) {
    if (W_SNAPSHOTS[week]?.[id]?.fossil) return 'fossil'
  }
  const cc = primaryClassComponent(part)
  if (cc) return W_SNAPSHOTS[week][cc.id].classification || part.classification
  return part.classification
}
export function partConsensusAt(part, week) {
  const vals = part.wComponentIds.map(id => W_SNAPSHOTS[week]?.[id]?.consensus).filter(v => v != null)
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
}
export function partStalenessAt(part, week) {
  const vals = part.wComponentIds.map(id => stalenessOf(id, week))
  return vals.length ? Math.max(...vals) : 0
}
export function partTempAt(part, week) {
  const vals = part.wComponentIds.map(id => W_SNAPSHOTS[week]?.[id]?.temperature).filter(v => v != null)
  return vals.length ? Math.max(...vals) : 0.5
}

// ─────────────────────────────────────────────────────────────
// 6. ROUNDS — 提案-受容ラウンド（タブ1の再生素材）
//   protocol: 'daily' | 'milestone' | 'phase' | 'cert'
// ─────────────────────────────────────────────────────────────
export const ROUNDS = {
  2: [
    { id: 'r-w2-01', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-term-module', proposal: '機能単位の部品集合', rationale: '設計BOMの構成単位と一致するため', likelihood: 0.58, acceptProb: 0.58, accepted: false, effect: '生産は「組立単位」を支持し棄却。z乖離の初診断' },
    { id: 'r-w2-02', protocol: 'daily', speaker: 'design', listener: 'test', componentId: 'w-term-tolerance', proposal: '機能公差から配分', rationale: '機能要件から公差を割り付ける', likelihood: 0.55, acceptProb: 0.55, accepted: false, effect: '実験は工程能力起点を主張。多峰継続' },
    { id: 'r-w2-03', protocol: 'daily', speaker: 'dsgn', listener: 'design', componentId: 'w-term-classA', proposal: '曲率連続 G2 以上', rationale: '意匠面品質の定量基準', likelihood: 0.7, acceptProb: 0.7, accepted: true, effect: 'w-term-classA の share が dsgn 案 +10' },
    { id: 'r-w2-04', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-term-datum', proposal: 'GD&T 基準系', rationale: '計測基準を GD&T に統一', likelihood: 0.74, acceptProb: 0.74, accepted: true, effect: 'w-term-datum が収束方向へ +12' },
  ],
  3: [
    { id: 'r-w3-01', protocol: 'daily', speaker: 'design', listener: 'test', componentId: 'w-term-module', proposal: '機能単位の部品集合', rationale: '設計BOMの構成単位と一致するため', likelihood: 0.72, acceptProb: 0.72, accepted: true, effect: 'w-term-module の share が design 案 +8' },
    { id: 'r-w3-02', protocol: 'daily', speaker: 'mfg', listener: 'design', componentId: 'w-term-zone', proposal: '生産ライン工程の区画', rationale: '工程設計の単位と一致', likelihood: 0.46, acceptProb: 0.46, accepted: false, effect: '設計は「車体レイアウト領域」を維持。o乖離ではなく z乖離と診断' },
    { id: 'r-w3-03', protocol: 'daily', speaker: 'design', listener: 'dsgn', componentId: 'w-term-variant', proposal: 'USD variant アーク', rationale: '非破壊で流用/派生を表現できる', likelihood: 0.68, acceptProb: 0.68, accepted: true, effect: 'w-term-variant が収束方向へ +10' },
    { id: 'r-w3-04', protocol: 'daily', speaker: 'mgmt', listener: 'design', componentId: 'w-term-package', proposal: '乗員+機構の空間配置', rationale: 'DR資料の合意単位を統一', likelihood: 0.63, acceptProb: 0.63, accepted: true, effect: 'w-term-package +7' },
    { id: 'r-w3-05', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-term-hardpoint', proposal: '機構拘束点', rationale: 'ハードポイント＝機構上動かせない点', likelihood: 0.76, acceptProb: 0.76, accepted: true, effect: 'w-term-hardpoint +11' },
  ],
  4: [
    { id: 'r-w4-01', protocol: 'daily', speaker: 'mfg', listener: 'design', componentId: 'w-term-tolerance', proposal: '工程能力から配分', rationale: '実際の Cpk 実績から逆算する方が歩留まりが読める', likelihood: 0.66, acceptProb: 0.66, accepted: true, effect: 'w-term-tolerance が工程能力起点へ収束 +9' },
    { id: 'r-w4-02', protocol: 'daily', speaker: 'test', listener: 'design', componentId: 'w-term-nvh', proposal: '車内音圧 dB(A)', rationale: '実測しやすく合否が一意', likelihood: 0.71, acceptProb: 0.71, accepted: true, effect: 'w-term-nvh +10' },
    { id: 'r-w4-03', protocol: 'daily', speaker: 'test', listener: 'mgmt', componentId: 'w-term-range', proposal: 'WLTC実測', rationale: 'カタログ換算より現物に近い', likelihood: 0.78, acceptProb: 0.78, accepted: true, effect: 'w-term-range +12' },
    { id: 'r-w4-04', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-class-door-latch', proposal: '流用', rationale: '先代ラッチの凍結条件が現文脈と一致', likelihood: 0.83, acceptProb: 0.83, accepted: true, effect: 'w-class-door-latch を「流用」で確定方向' },
    { id: 'r-w4-05', protocol: 'daily', speaker: 'mfg', listener: 'design', componentId: 'w-term-datum', proposal: 'GD&T 基準系', rationale: '治具基準と GD&T の対応表を用意', likelihood: 0.8, acceptProb: 0.8, accepted: true, effect: 'w-term-datum 収束 +8' },
  ],
  5: [
    { id: 'r-w5-01', protocol: 'milestone', speaker: 'mgmt', listener: 'design', componentId: 'w-term-dr', proposal: '焼きなましイベント', rationale: 'DRを一斉凍結ではなく成分別の冷却として再定義', likelihood: 0.79, acceptProb: 0.79, accepted: true, effect: 'w-term-dr が consensus 86 到達' },
    { id: 'r-w5-02', protocol: 'milestone', speaker: 'design', listener: 'mfg', componentId: 'w-term-module', proposal: '機能単位の部品集合', rationale: '3週分の受容実績を提示', likelihood: 0.82, acceptProb: 0.82, accepted: true, effect: 'w-term-module consensus 60 超え' },
    { id: 'r-w5-03', protocol: 'milestone', speaker: 'dsgn', listener: 'mgmt', componentId: 'w-term-cmf', proposal: '質感トーンボード', rationale: 'CMFの合意単位をトーンボードに固定', likelihood: 0.67, acceptProb: 0.67, accepted: true, effect: 'w-term-cmf 収束方向 +12' },
    { id: 'r-w5-04', protocol: 'milestone', speaker: 'design', listener: 'dsgn', componentId: 'w-term-hardpoint', proposal: '機構拘束点', rationale: 'ハードポイント一覧を確定', likelihood: 0.85, acceptProb: 0.85, accepted: true, effect: 'w-term-hardpoint consensus 85 到達' },
    { id: 'r-w5-05', protocol: 'milestone', speaker: 'mfg', listener: 'design', componentId: 'w-class-door-glass', proposal: '流用', rationale: '証明書 cert-door-glass-gen5：全軸で文脈一致', likelihood: 0.9, acceptProb: 0.9, accepted: true, effect: 'w-class-door-glass 流用確定（証明書提示）' },
    { id: 'r-w5-06', protocol: 'milestone', speaker: 'mgmt', listener: 'test', componentId: 'w-term-freeze', proposal: '成分別の不可逆デッドライン', rationale: '金型・認証など成分ごとに凍結期日を設定', likelihood: 0.77, acceptProb: 0.77, accepted: true, effect: 'w-term-freeze consensus 80 到達' },
  ],
  6: [
    { id: 'r-w6-01', protocol: 'daily', speaker: 'test', listener: 'design', componentId: 'w-sev-range', proposal: '重大度: 高', rationale: '第1試作の実走で予測512kmに対し468km（-8.6%）', likelihood: 0.88, acceptProb: 0.88, accepted: true, effect: 'w-sev-range 重大度が 中→高。staleness リセット' },
    { id: 'r-w6-02', protocol: 'daily', speaker: 'test', listener: 'mgmt', componentId: 'w-class-door-impactbeam', proposal: '一部変更', rationale: '側突規制2024改定で凍結条件が乖離', likelihood: 0.74, acceptProb: 0.74, accepted: true, effect: 'w-class-door-impactbeam を再加熱（🔥）一部変更へ' },
  ],
  7: [
    { id: 'r-w7-01', protocol: 'daily', speaker: 'test', listener: 'design', componentId: 'w-sev-thermal', proposal: '重大度: 高', rationale: '航続乖離の一次要因はセル温度上昇と推定', likelihood: 0.8, acceptProb: 0.8, accepted: true, effect: 'w-sev-thermal 重大度 高で確定方向' },
    { id: 'r-w7-02', protocol: 'daily', speaker: 'test', listener: 'design', componentId: 'w-class-battery-tray', proposal: '一部変更', rationale: 'W6航続乖離：大容量パックで放熱要件が凍結条件から乖離（証明書 cert-battery-tray-gen4 の熱条件軸）', likelihood: 0.76, acceptProb: 0.76, accepted: true, effect: 'w-class-battery-tray を「流用」→「一部変更」に再加熱（🔥 reheat 第1号）' },
    { id: 'r-w7-03', protocol: 'daily', speaker: 'design', listener: 'test', componentId: 'w-term-thermal', proposal: 'セル温度 ≤ 45℃', rationale: '熱設計の合意単位を温度上限に固定', likelihood: 0.7, acceptProb: 0.7, accepted: true, effect: 'w-term-thermal 収束 +8' },
  ],
  8: [
    { id: 'r-w8-01', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-term-module', proposal: '機能単位の部品集合', rationale: '実質収束の確認', likelihood: 0.86, acceptProb: 0.86, accepted: true, effect: 'w-term-module 単峰へ収束（14語目の収束）' },
    { id: 'r-w8-02', protocol: 'daily', speaker: 'mfg', listener: 'design', componentId: 'w-term-zone', proposal: '生産ライン工程の区画', rationale: '再提案するが設計は領域定義を維持', likelihood: 0.44, acceptProb: 0.44, accepted: false, effect: '「ゾーン」は多峰のまま容認（deadline なし）' },
    { id: 'r-w8-03', protocol: 'daily', speaker: 'mfg', listener: 'test', componentId: 'w-term-subassy', proposal: 'ドア完成体（ガラス込み）', rationale: '組立単位での定義を主張', likelihood: 0.48, acceptProb: 0.48, accepted: false, effect: '「サブアッシー」も多峰容認' },
    { id: 'r-w8-04', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-class-door-inner', proposal: '一部変更', rationale: 'インナーパネルはヒンジ変更に伴い補強追加', likelihood: 0.69, acceptProb: 0.69, accepted: true, effect: 'w-class-door-inner 一部変更で収束方向' },
  ],
  9: [
    { id: 'r-w9-01', protocol: 'daily', speaker: 'mfg', listener: 'test', componentId: 'w-class-door-seal', proposal: '流用', rationale: '先代ドアシールをそのまま流用したい', likelihood: 0.4, acceptProb: 0.4, accepted: false, effect: 'fossil 発見：凍結証明書が存在しない。流用判定の根拠を提示できず棄却' },
    { id: 'r-w9-02', protocol: 'daily', speaker: 'test', listener: 'mfg', componentId: 'w-class-door-seal', proposal: '一部変更（要再評価）', rationale: '証明書なし＝凍結条件不明。fossil はリスク', likelihood: 0.58, acceptProb: 0.58, accepted: false, effect: 'fossil インベントリに登録。W13 NVH 計測まで判断保留' },
    { id: 'r-w9-03', protocol: 'daily', speaker: 'design', listener: 'mfg', componentId: 'w-class-door-checklink', proposal: '流用', rationale: '証明書相当の凍結記録あり', likelihood: 0.82, acceptProb: 0.82, accepted: true, effect: 'w-class-door-checklink 流用確定' },
  ],
  10: [
    { id: 'r-w10-01', protocol: 'milestone', speaker: 'mgmt', listener: 'test', componentId: 'w-term-freeze', proposal: '検証計画フリーズ（ソフトデッドライン）', rationale: '分類系成分の温度を下げ始める', likelihood: 0.75, acceptProb: 0.75, accepted: true, effect: '分類系成分の temperature 低下開始' },
    { id: 'r-w10-02', protocol: 'daily', speaker: 'design', listener: 'test', componentId: 'w-class-door-hinge', proposal: '一部変更', rationale: 'EV重量増でヒンジ荷重が増加', likelihood: 0.55, acceptProb: 0.55, accepted: false, effect: '生産は流用を主張。ヒンジは二峰のまま' },
    { id: 'r-w10-03', protocol: 'daily', speaker: 'mfg', listener: 'design', componentId: 'w-class-door-hinge', proposal: '流用', rationale: '既存金型を使いたい（コスト）', likelihood: 0.52, acceptProb: 0.52, accepted: false, effect: 'ヒンジ分類の膠着が続く（デッドライン W14）' },
  ],
  11: [
    { id: 'r-w11-01', protocol: 'daily', speaker: 'mgmt', listener: 'design', componentId: 'w-class-door-hinge', proposal: 'collapse 期日の再確認', rationale: 'W14 金型発注デッドラインに対しまだ二峰。焼きなまし遅延警告', likelihood: 0.6, acceptProb: 0.6, accepted: true, effect: 'ヒンジ分類に「collapse遅延」警告（健全性#4）' },
    { id: 'r-w11-02', protocol: 'daily', speaker: 'test', listener: 'mfg', componentId: 'w-class-door-hinge', proposal: '一部変更（荷重試験データ提示）', rationale: '追加試験で流用ヒンジの安全率不足を提示', likelihood: 0.64, acceptProb: 0.64, accepted: true, effect: 'ヒンジ分類が「一部変更」側へ share 移動' },
    { id: 'r-w11-03', protocol: 'daily', speaker: 'design', listener: 'dsgn', componentId: 'w-class-door-panel', proposal: '新規', rationale: 'アウターパネルは新意匠のため新規', likelihood: 0.8, acceptProb: 0.8, accepted: true, effect: 'w-class-door-panel 新規で収束' },
  ],
  12: [
    { id: 'r-w12-01', protocol: 'phase', speaker: 'design', listener: 'mfg', componentId: 'w-id-door-fl', proposal: 'DOOR-FL / 量産CAD PN 62100-NV26', rationale: 'クラスA面→量産CADへ永続IDを対応付け（非破壊）', likelihood: 0.83, acceptProb: 0.83, accepted: true, effect: 'w-id-door-fl が量産CADへ更新（旧意見は保持）' },
    { id: 'r-w12-02', protocol: 'phase', speaker: 'design', listener: 'mfg', componentId: 'w-id-door-fr', proposal: 'DOOR-FR / 量産CAD PN 62101-NV26', rationale: '左右対称でIDを対応付け', likelihood: 0.83, acceptProb: 0.83, accepted: true, effect: 'w-id-door-fr が量産CADへ更新' },
    { id: 'r-w12-03', protocol: 'phase', speaker: 'design', listener: 'mfg', componentId: 'w-id-battery-pack', proposal: 'BATT-PACK / 量産CAD PN 29500-NV26', rationale: '一部変更を反映した構造モデルからCAD化', likelihood: 0.78, acceptProb: 0.78, accepted: true, effect: 'w-id-battery-pack が量産CADへ更新' },
    { id: 'r-w12-04', protocol: 'phase', speaker: 'design', listener: 'mfg', componentId: 'w-id-underbody', proposal: 'UNDERBODY / 量産CAD PN 74000-NV26', rationale: '骨格の永続ID対応を確定', likelihood: 0.81, acceptProb: 0.81, accepted: true, effect: 'w-id-underbody が量産CADへ更新' },
  ],
  13: [
    { id: 'r-w13-01', protocol: 'daily', speaker: 'test', listener: 'design', componentId: 'w-sev-nvh', proposal: '重大度: 高', rationale: '第2試作NVH計測：ドアシール（fossil）で透過音が予測外れ', likelihood: 0.85, acceptProb: 0.85, accepted: true, effect: 'w-sev-nvh 重大度 高。fossil のリスクが回収される' },
    { id: 'r-w13-02', protocol: 'daily', speaker: 'test', listener: 'mfg', componentId: 'w-class-door-seal', proposal: '一部変更', rationale: 'fossil のシールを再設計。凍結条件を作り直す', likelihood: 0.72, acceptProb: 0.72, accepted: true, effect: 'w-class-door-seal を fossil → 一部変更へ再加熱（🔥）' },
    { id: 'r-w13-03', protocol: 'daily', speaker: 'design', listener: 'test', componentId: 'w-term-nvh', proposal: '車内音圧 dB(A)', rationale: 'NVH合否指標の最終確認', likelihood: 0.82, acceptProb: 0.82, accepted: true, effect: 'w-term-nvh consensus 80 到達' },
  ],
  14: [
    { id: 'r-w14-01', protocol: 'milestone', speaker: 'mgmt', listener: 'design', componentId: 'w-class-door-hinge', proposal: '一部変更（collapse 確定）', rationale: '金型発注デッドライン。二峰を単峰へ収束（❄）', likelihood: 0.86, acceptProb: 0.86, accepted: true, effect: 'w-class-door-hinge collapse（❄）一部変更で確定' },
    { id: 'r-w14-02', protocol: 'milestone', speaker: 'mgmt', listener: 'design', componentId: 'w-class-battery-tray', proposal: '一部変更（collapse 確定）', rationale: '金型発注デッドライン。再加熱後の分類を確定', likelihood: 0.84, acceptProb: 0.84, accepted: true, effect: 'w-class-battery-tray collapse（❄）一部変更で確定' },
    { id: 'r-w14-03', protocol: 'daily', speaker: 'mfg', listener: 'design', componentId: 'w-class-door-inner', proposal: '一部変更', rationale: 'ヒンジ確定に伴い内板補強を確定', likelihood: 0.82, acceptProb: 0.82, accepted: true, effect: 'w-class-door-inner 一部変更で確定' },
  ],
  15: [
    { id: 'r-w15-01', protocol: 'cert', speaker: 'mgmt', listener: 'design', componentId: 'w-class-door-impactbeam', proposal: '側突ビーム 一部変更（規制適合）', rationale: '規制側は veto 重み付き。2024側突規制に適合しなければ棄却権', likelihood: 0.7, acceptProb: 0.7, accepted: true, effect: 'w-class-door-impactbeam collapse（❄）認証適合で確定' },
    { id: 'r-w15-02', protocol: 'cert', speaker: 'mgmt', listener: 'test', componentId: 'w-term-homolog', proposal: 'UN-R 準拠', rationale: '認証範囲を UN-R に統一（地域上乗せは別管理）', likelihood: 0.68, acceptProb: 0.68, accepted: true, effect: 'w-term-homolog consensus 74 到達' },
    { id: 'r-w15-03', protocol: 'cert', speaker: 'mgmt', listener: 'design', componentId: 'w-sev-sidecrash', proposal: '重大度: 高（規制起因）', rationale: '規制ドメインの veto 重みで側突リスクを確定', likelihood: 0.75, acceptProb: 0.75, accepted: true, effect: 'w-sev-sidecrash 重大度 高で確定' },
  ],
  16: [
    { id: 'r-w16-01', protocol: 'milestone', speaker: 'mgmt', listener: 'test', componentId: 'w-sev-nvh', proposal: 'fossil 教訓の記録', rationale: 'ドアシール fossil の再発防止：全流用部品に証明書を義務化', likelihood: 0.8, acceptProb: 0.8, accepted: true, effect: 'ループ1周完了。健全性は W1 比で改善（教訓を残す）' },
    { id: 'r-w16-02', protocol: 'milestone', speaker: 'mgmt', listener: 'design', componentId: 'w-term-freeze', proposal: '成分別の不可逆デッドライン', rationale: '次周（R2）へ焼きなましカレンダーを引き継ぐ', likelihood: 0.85, acceptProb: 0.85, accepted: true, effect: 'w-term-freeze consensus 維持。次世代ループへ' },
  ],
}

// ─────────────────────────────────────────────────────────────
// 7. OBSERVATIONS — 物理観測イベント（staleness リセットの根拠）
// ─────────────────────────────────────────────────────────────
export const OBSERVATIONS = [
  { id: 'o-w1-baseline', week: 1,  domain: 'mgmt', label: 'ループ開始・先代データ棚卸し', grounds: [] },
  { id: 'o-w3-cae',      week: 3,  domain: 'design', label: '設計CAE 一次解析（骨格剛性）', grounds: ['w-term-tolerance'] },
  { id: 'o-w6-range',    week: 6,  domain: 'test', label: '第1試作車 実走行試験（航続距離）', grounds: ['w-sev-range', 'w-sev-thermal', 'w-class-battery-tray', 'w-class-door-hinge', 'w-class-door-impactbeam'] },
  { id: 'o-w10-verif',   week: 10, domain: 'mgmt', label: '検証計画フリーズ（ソフトデッドライン）', grounds: [] },
  { id: 'o-w13-nvh',     week: 13, domain: 'test', label: '第2試作車 NVH計測', grounds: ['w-sev-nvh', 'w-class-door-seal', 'w-term-nvh'] },
]

// ─────────────────────────────────────────────────────────────
// 8. DIVERGENCES — 乖離（答え合わせ）とトレースチェーン
// ─────────────────────────────────────────────────────────────
export const DIVERGENCES = [
  {
    id: 'd-range-w6', week: 6, metric: '航続距離', domain: 'range',
    predicted: 512, actual: 468, unit: 'km', diffPct: -8.6, severity: 'high',
    tracedTo: ['w-sev-range', 'w-sev-thermal', 'w-class-battery-tray'],
    chain: [
      { step: 'observe',  label: 'W6 第1試作の実走試験で 468km を記録', week: 6 },
      { step: 'register', label: '予測 512km との乖離 -8.6% を登録', week: 6 },
      { step: 'propose',  label: '実験→設計: バッテリートレイ熱設計の分類再検討を提案', week: 7, roundId: 'r-w7-02' },
      { step: 'update',   label: 'w-class-battery-tray が「流用」→「一部変更」に更新（🔥 reheat）', week: 7 },
    ],
    note: '観測記録(o)は書き換えない。乖離は新しい提案を生む（append-only）。',
  },
  {
    id: 'd-nvh-w13', week: 13, metric: 'NVH 透過音', domain: 'nvh',
    predicted: 38.0, actual: 43.5, unit: 'dB(A)', diffPct: 14.5, severity: 'high',
    tracedTo: ['w-sev-nvh', 'w-class-door-seal'],
    chain: [
      { step: 'observe',  label: 'W13 第2試作の NVH計測で 43.5dB(A) を記録', week: 13 },
      { step: 'register', label: '予測 38.0dB(A) との乖離 +5.5dB を登録', week: 13 },
      { step: 'propose',  label: '実験→生産: ドアシール（fossil）の再設計を提案', week: 13, roundId: 'r-w13-02' },
      { step: 'update',   label: 'w-class-door-seal が fossil → 一部変更に更新（🔥 reheat）', week: 13 },
    ],
    note: '証明書欠落の fossil が予測外れとして顕在化。凍結条件を作り直して初めて分類できる。',
  },
]

// ─────────────────────────────────────────────────────────────
// 9. PREDICTION_ACCURACY — ドメイン別予測的中率（受容重みの根拠）
// ─────────────────────────────────────────────────────────────
export const PREDICTION_ACCURACY = {
  1:  { design: 0.74, test: 0.80, dsgn: 0.68, mfg: 0.78, mgmt: 0.64 },
  6:  { design: 0.78, test: 0.85, dsgn: 0.70, mfg: 0.81, mgmt: 0.66 },
  13: { design: 0.80, test: 0.88, dsgn: 0.71, mfg: 0.83, mgmt: 0.68 },
  16: { design: 0.82, test: 0.89, dsgn: 0.73, mfg: 0.84, mgmt: 0.70 },
}
export function accuracyAt(week) {
  const keys = Object.keys(PREDICTION_ACCURACY).map(Number).sort((a, b) => a - b)
  let pick = keys[0]
  for (const k of keys) if (k <= week) pick = k
  return PREDICTION_ACCURACY[pick]
}

// ─────────────────────────────────────────────────────────────
// 10. HEALTH — ループ健全性7指標（週次系列, LoopArchitecture §8）
// ─────────────────────────────────────────────────────────────
// acceptanceMid: 受容率が健全な中間帯にある D-pair 比率（高いほど良）
// stalenessHigh: 半減期超過の高影響成分比率（低いほど良）
// errorLatency:  乖離登録までの週数（低いほど良, null=未発生）
// lateCollapse:  デッドライン超過でまだ多峰の成分数（0が良）
// reheatRate:    再加熱率（適度が良）
// shadowIT:      shadow-IT 指数 / Excel逃避 proxy（低いほど良）
// zRatio:        z乖離診断比率（0.3-0.6 が健全, null=診断なし）
export const HEALTH = {
  1:  { acceptanceMid: 0.55, stalenessHigh: 0.30, errorLatency: null, lateCollapse: 0, reheatRate: 0.00, shadowIT: 0.42, zRatio: null },
  2:  { acceptanceMid: 0.58, stalenessHigh: 0.31, errorLatency: null, lateCollapse: 0, reheatRate: 0.00, shadowIT: 0.41, zRatio: 0.30 },
  3:  { acceptanceMid: 0.61, stalenessHigh: 0.33, errorLatency: null, lateCollapse: 0, reheatRate: 0.00, shadowIT: 0.39, zRatio: 0.42 },
  4:  { acceptanceMid: 0.63, stalenessHigh: 0.34, errorLatency: null, lateCollapse: 0, reheatRate: 0.00, shadowIT: 0.38, zRatio: 0.45 },
  5:  { acceptanceMid: 0.66, stalenessHigh: 0.36, errorLatency: null, lateCollapse: 0, reheatRate: 0.00, shadowIT: 0.36, zRatio: 0.44 },
  6:  { acceptanceMid: 0.64, stalenessHigh: 0.18, errorLatency: 0.5,  lateCollapse: 0, reheatRate: 0.03, shadowIT: 0.35, zRatio: 0.40 },
  7:  { acceptanceMid: 0.67, stalenessHigh: 0.20, errorLatency: 1.0,  lateCollapse: 0, reheatRate: 0.06, shadowIT: 0.34, zRatio: 0.41 },
  8:  { acceptanceMid: 0.69, stalenessHigh: 0.22, errorLatency: 1.0,  lateCollapse: 0, reheatRate: 0.06, shadowIT: 0.32, zRatio: 0.43 },
  9:  { acceptanceMid: 0.66, stalenessHigh: 0.28, errorLatency: 1.0,  lateCollapse: 0, reheatRate: 0.06, shadowIT: 0.33, zRatio: 0.45 },
  10: { acceptanceMid: 0.68, stalenessHigh: 0.30, errorLatency: 1.0,  lateCollapse: 0, reheatRate: 0.06, shadowIT: 0.31, zRatio: 0.46 },
  11: { acceptanceMid: 0.65, stalenessHigh: 0.32, errorLatency: 1.0,  lateCollapse: 1, reheatRate: 0.06, shadowIT: 0.32, zRatio: 0.47 },
  12: { acceptanceMid: 0.70, stalenessHigh: 0.29, errorLatency: 1.0,  lateCollapse: 1, reheatRate: 0.06, shadowIT: 0.30, zRatio: 0.46 },
  13: { acceptanceMid: 0.72, stalenessHigh: 0.16, errorLatency: 0.5,  lateCollapse: 1, reheatRate: 0.09, shadowIT: 0.29, zRatio: 0.48 },
  14: { acceptanceMid: 0.74, stalenessHigh: 0.18, errorLatency: 0.5,  lateCollapse: 0, reheatRate: 0.09, shadowIT: 0.28, zRatio: 0.47 },
  15: { acceptanceMid: 0.75, stalenessHigh: 0.20, errorLatency: 0.5,  lateCollapse: 0, reheatRate: 0.09, shadowIT: 0.27, zRatio: 0.46 },
  16: { acceptanceMid: 0.77, stalenessHigh: 0.19, errorLatency: 0.5,  lateCollapse: 0, reheatRate: 0.09, shadowIT: 0.25, zRatio: 0.45 },
}

// 健全性指標のメタ（表示用）。dir: 'up'=高いほど良 / 'down'=低いほど良 / 'band'=中庸が良
export const HEALTH_META = [
  { key: 'acceptanceMid', num: 1, label: '受容率の健全域', plain: '提案の受容率が健全な中間帯にある割合', cpc: '#1 Acceptance-rate distribution', dir: 'up',   fmt: 'pct', good: 0.66, warn: 0.55 },
  { key: 'stalenessHigh', num: 2, label: '鮮度切れ成分',   plain: '半減期を超えた高影響成分の比率', cpc: '#2 Staleness profile', dir: 'down', fmt: 'pct', good: 0.22, warn: 0.30 },
  { key: 'errorLatency',  num: 3, label: '答え合わせ遅延', plain: '物理観測から乖離登録までの週数', cpc: '#3 Error-signal latency', dir: 'down', fmt: 'week', good: 1.0, warn: 2.0 },
  { key: 'lateCollapse',  num: 4, label: 'collapse遅延',   plain: 'デッドライン接近でまだ多峰の成分数', cpc: '#4 Collapse punctuality', dir: 'down', fmt: 'count', good: 0, warn: 1 },
  { key: 'reheatRate',    num: 5, label: '再加熱率',       plain: '凍結成分を再び開く頻度', cpc: '#5 Re-heat rate', dir: 'band', fmt: 'pct', good: 0.10, warn: 0.20 },
  { key: 'shadowIT',      num: 6, label: 'shadow-IT指数',  plain: 'Excel逃避の proxy（低いほど portal が使われている）', cpc: '#6 Shadow-IT index', dir: 'down', fmt: 'pct', good: 0.30, warn: 0.40 },
  { key: 'zRatio',        num: 7, label: 'z乖離診断比率',  plain: '解決した対立のうち z乖離と診断された割合', cpc: '#7 z-diagnostic ratio', dir: 'band', fmt: 'pct', good: 0.45, warn: 0.25 },
]

// 健全性の緑/黄/赤判定
export function healthVerdict(meta, val) {
  if (val == null) return 'na'
  if (meta.dir === 'up')   return val >= meta.good ? 'good' : val >= meta.warn ? 'warn' : 'bad'
  if (meta.dir === 'down') return val <= meta.good ? 'good' : val <= meta.warn ? 'warn' : 'bad'
  // band: good 付近が良、離れると悪化（warn は下限側の閾）
  if (meta.key === 'zRatio') return val >= meta.warn && val <= 0.6 ? 'good' : 'warn'
  return val <= meta.good ? 'good' : val <= meta.warn ? 'warn' : 'bad'
}
export const HEALTH_VERDICT_HEX = { good: C.teal, warn: C.amber, bad: C.red, na: C.gray }

// ─────────────────────────────────────────────────────────────
// 11. ACTIVITY — 週次アクティビティフィード（導出）
//   その週のラウンド・観測・collapse/reheat・乖離を時系列で集約
// ─────────────────────────────────────────────────────────────
export function activityForWeek(week) {
  const items = []
  // 観測
  OBSERVATIONS.filter(o => o.week === week).forEach(o =>
    items.push({ kind: 'observe', tab: 'error', dot: DOMAIN_BY_ID[o.domain]?.color || C.gray, text: `観測: ${o.label}`, meta: `${domainLabel(o.domain)} · 観測 o` }))
  // 乖離
  DIVERGENCES.filter(d => d.week === week).forEach(d =>
    items.push({ kind: 'diverge', tab: 'error', dot: C.red, text: `乖離登録: ${d.metric} 予測${d.predicted}→実測${d.actual}${d.unit}（${d.diffPct > 0 ? '+' : ''}${d.diffPct}%）`, meta: '答え合わせ · error signal' }))
  // collapse / reheat（該当週に発生した成分）
  W_COMPONENTS.forEach(c => {
    const st = W_SNAPSHOTS[week]?.[c.id]
    if (!st) return
    if (st.collapsedAt === week) items.push({ kind: 'collapse', tab: 'collapse', dot: TEMP_COLD_HEX, text: `❄ collapse確定: ${c.label}`, meta: '焼きなまし · 不可逆デッドライン' })
    if (st.reheatedAt === week) items.push({ kind: 'reheat', tab: 'collapse', dot: TEMP_HOT_HEX, text: `🔥 再加熱: ${c.label}`, meta: '焼きなまし · re-heat' })
    if (st.fossil && W_SNAPSHOTS[week - 1]?.[c.id] && !W_SNAPSHOTS[week - 1][c.id].fossil)
      items.push({ kind: 'fossil', tab: 'shared', dot: CLASS_HEX.fossil, text: `fossil 発見: ${c.label}（凍結証明書なし）`, meta: '共通図 · fossil インベントリ' })
  })
  // ラウンド要約
  const rounds = ROUNDS[week] || []
  const acc = rounds.filter(r => r.accepted).length
  if (rounds.length) items.push({ kind: 'round', tab: 'consensus', dot: C.blue, text: `合意ラウンド ${rounds.length}件（受容 ${acc} / 棄却 ${rounds.length - acc}）`, meta: `${rounds[0].protocol === 'milestone' ? '節目レビュー' : rounds[0].protocol === 'phase' ? 'フェーズ遷移交渉' : rounds[0].protocol === 'cert' ? '外部認証' : '日次統合'}` })
  return items
}

// ─────────────────────────────────────────────────────────────
// 12. 一行ピッチ（LoopArchitecture §9）
// ─────────────────────────────────────────────────────────────
export const ONE_LINER = 'SYNAPSEは車両の共通図を正直に保つ：全チームが提案し、提案は実データで検証され、予測は現物と答え合わせされる。'

// プロトコル表示ラベル
export const PROTOCOL_LBL = { daily: '日次統合', milestone: '節目レビュー', phase: 'フェーズ遷移交渉', cert: '外部認証' }
