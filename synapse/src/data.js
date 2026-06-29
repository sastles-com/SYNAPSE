// ─────────────────────────────────────────────────────────────
// SYNAPSE — Data Constants
// Replace these with real API calls when backend is ready.
// ─────────────────────────────────────────────────────────────

export const PARTS = [
  { id:"body",     name:"ボディ外装",   pct:72, status:"progress", design:75, test:40, dsgn:80, owner:"田中", issue:null },
  { id:"engine",   name:"駆動系",       pct:65, status:"progress", design:70, test:55, dsgn:60, owner:"鈴木", issue:"バッテリー熱管理 #I-042" },
  { id:"chassis",  name:"シャシー",     pct:88, status:"done",     design:92, test:82, dsgn:85, owner:"田中", issue:null },
  { id:"interior", name:"インテリア",   pct:48, status:"delay",    design:52, test:20, dsgn:65, owner:"佐藤", issue:"パネル合わせ精度 #I-037" },
  { id:"elec",     name:"電装・ソフト", pct:55, status:"issue",    design:60, test:48, dsgn:50, owner:"佐藤", issue:"OTA更新 処理時間 #I-035" },
  { id:"safety",   name:"安全システム", pct:42, status:"issue",    design:50, test:35, dsgn:40, owner:"山田", issue:"前方センサー誤検知 #I-039" },
  { id:"susp",     name:"足回り",       pct:30, status:"todo",     design:35, test:15, dsgn:30, owner:"田中", issue:null },
];

export const MILESTONES = [
  { label:"コンセプト承認", date:"2026/01/15", status:"done"   },
  { label:"基本設計完了",   date:"2026/03/31", status:"done"   },
  { label:"詳細設計完了",   date:"2026/07/31", status:"active" },
  { label:"試作車完成",     date:"2026/08/15", status:"todo"   },
  { label:"耐久・安全試験", date:"2026/10/31", status:"todo"   },
  { label:"量産準備完了",   date:"2027/02/28", status:"todo"   },
  { label:"SOP 生産開始",   date:"2027/06/01", status:"target" },
];

export const ISSUES = [
  { title:"バッテリー熱管理 発熱異常",   owner:"鈴木", area:"駆動系", id:"#I-042", sev:"high", partId:"engine",   openedAt:"2026/05/28" },
  { title:"前方センサー 誤検知",          owner:"山田", area:"安全系", id:"#I-039", sev:"high", partId:"safety",   openedAt:"2026/05/25" },
  { title:"インテリアパネル 合わせ精度",  owner:"田中", area:"車体",   id:"#I-037", sev:"mid",  partId:"interior", openedAt:"2026/05/22" },
  { title:"OTA 更新 処理時間超過",        owner:"佐藤", area:"電装",   id:"#I-035", sev:"mid",  partId:"elec",     openedAt:"2026/05/20" },
];

// Phase Gate definitions（設計原則②）
export const PHASE_GATES = [
  {
    id:"pg1", label:"コンセプト承認", date:"2026/01/15", status:"passed",
    conditions:[
      { label:"コンセプト設計完了",   met:true  },
      { label:"デザインスタディ承認", met:true  },
      { label:"事業性評価完了",       met:true  },
    ],
  },
  {
    id:"pg2", label:"基本設計 DR",   date:"2026/03/31", status:"passed",
    conditions:[
      { label:"設計進捗 ≥ 50%",       met:true  },
      { label:"基本性能試験完了",     met:true  },
      { label:"CMF方向性承認",        met:true  },
    ],
  },
  {
    id:"pg3", label:"詳細設計 DR3",  date:"2026/07/31", status:"active",
    conditions:[
      { label:"設計進捗 ≥ 80%",       met:false },
      { label:"実験項目 ≥ 60%",       met:false },
      { label:"CMF最終承認",          met:false },
      { label:"重大課題 = 0件",       met:false },
    ],
  },
  {
    id:"pg4", label:"試作車 DR",     date:"2026/08/15", status:"todo",
    conditions:[
      { label:"試作車完成",           met:false },
      { label:"走行試験開始",         met:false },
    ],
  },
  {
    id:"pg5", label:"SOP 承認",      date:"2027/06/01", status:"todo",
    conditions:[
      { label:"全部位設計完了",       met:false },
      { label:"安全基準適合",         met:false },
      { label:"量産ライン確認",       met:false },
    ],
  },
];

export const ACTIVITIES = [
  { text:"駆動系仕様書 v3.2 承認済み",       meta:"田中 · 2時間前", dot:"#1D9E75", domain:"設計"     },
  { text:"バッテリー熱管理 課題登録 #I-042", meta:"鈴木 · 5時間前", dot:"#E24B4A", domain:"重大"     },
  { text:"ボディ CAD モデル v2.3 更新",      meta:"佐藤 · 昨日",    dot:"#378ADD", domain:"設計"     },
  { text:"エクステリア CMF レビュー完了",    meta:"山田 · 昨日",    dot:"#7F77DD", domain:"デザイン" },
  { text:"シャシー強度解析 合格",            meta:"田中 · 2日前",   dot:"#1D9E75", domain:"実験"     },
];

export const TEAM = [
  { name:"田中 一郎",  role:"チーフエンジニア",   area:"車体設計",   initBg:"#B5D4F4", initC:"#0C447C", tasks:5, issues:1 },
  { name:"鈴木 花子",  role:"システムエンジニア", area:"駆動系",     initBg:"#9FE1CB", initC:"#085041", tasks:4, issues:2 },
  { name:"佐藤 次郎",  role:"電装設計",           area:"電装・ソフト",initBg:"#F5C4B3", initC:"#712B13", tasks:6, issues:1 },
  { name:"山田 三枝子",role:"安全・法規担当",     area:"安全・認証", initBg:"#CECBF6", initC:"#3C3489", tasks:3, issues:2 },
];

export const DOCS = [
  { name:"駆動系システム仕様書 v3.2", owner:"田中", date:"2026/05/28", type:"PDF",  size:"4.2 MB",  status:"done",     icon:"📄" },
  { name:"ボディ CAD モデル v2.3",    owner:"佐藤", date:"2026/05/27", type:"STEP", size:"128 MB",  status:"progress", icon:"📐" },
  { name:"部品表 (BOM) v5.1",         owner:"鈴木", date:"2026/05/25", type:"XLSX", size:"1.8 MB",  status:"delay",    icon:"📊" },
  { name:"安全基準適合チェックリスト", owner:"山田", date:"2026/05/24", type:"DOCX", size:"0.9 MB",  status:"done",     icon:"📋" },
  { name:"電気系統 配線図 Rev.B",      owner:"佐藤", date:"2026/05/20", type:"PDF",  size:"7.6 MB",  status:"todo",     icon:"🔌" },
];

// Digital Thread anchor snapshots（設計原則①）
export const ANCHORS = [
  "DR1 (2026/01)",
  "DR2 (2026/03)",
  "DR3 現在 (2026/06)",
  "試作1 予定",
  "SOP 予定",
];

export const ANCHOR_PCTS = [
  { body:30, engine:25, chassis:50, interior:20, elec:18, safety:15, susp:10 },
  { body:52, engine:45, chassis:75, interior:35, elec:38, safety:30, susp:18 },
  { body:72, engine:65, chassis:88, interior:48, elec:55, safety:42, susp:30 },
  { body:85, engine:78, chassis:95, interior:70, elec:72, safety:65, susp:55 },
  { body:100,engine:100,chassis:100,interior:100,elec:100,safety:100,susp:100 },
];

// Design tokens
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
};

export const STATUS_HEX = {
  done:     C.teal,
  progress: C.blue,
  delay:    C.amber,
  issue:    C.red,
  todo:     C.gray,
};

export const STATUS_3JS = {
  done:     0x1D9E75,
  progress: 0x378ADD,
  delay:    0xEF9F27,
  issue:    0xE24B4A,
  todo:     0x888780,
};

export const STATUS_LBL = {
  done:     "完了",
  progress: "進行中",
  active:   "進行中",
  delay:    "遅延",
  issue:    "課題あり",
  todo:     "未着手",
  target:   "目標",
  passed:   "承認済",
};
