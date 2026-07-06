# SYNAPSE02 データモデル & デモシナリオ定義

**Document status:** 実装仕様 v1.0（2026-07-06）
**対:** `SYNAPSE02_Spec.md`（画面仕様）
**実装先:** `synapse02/src/data.js`（synapse01 同様、単一ファイルのモックDB。全コンポーネントはここからエクスポート定数を直接 import する）

---

## 1. 設計方針

- **週次スナップショット方式:** synapse01 の `ANCHORS`/`ANCHOR_PCTS` パターンを踏襲し、時系列状態は**週ごとの事前計算済みスナップショット**として持つ。ブラウザ内でイベントソーシング再計算はしない（コンポーネントを単純に保つ）
- **週内の粒度:** タブ1のラウンド再生のみ、週内のイベント列（`ROUNDS`）を個別に持つ
- **すべての数値は演出値:** 受容確率・尤度比・KL系列などは物語（§6）に整合するよう手書きした値。計算ロジックは存在しない
- **ID規約:** すべて文字列ID。部品は `p-`（例 `p-door-fl`）、*w* 成分は `w-`（例 `w-term-module`）、ラウンドは `r-`、乖離は `d-` プレフィクス

## 2. 基本定数

### 2.1 DOMAINS — ドメイン（エージェント）

```js
export const DOMAINS = [
  { id: 'design', label: '設計',     color: '#5B8DEF' },
  { id: 'test',   label: '実験',     color: '#F2B33D' },
  { id: 'dsgn',   label: 'デザイン', color: '#B06DF7' },
  { id: 'mfg',    label: '生産',     color: '#4DC38F' },
  { id: 'mgmt',   label: '開発管理', color: '#8B93A7' },
];
```

synapse01 の3領域（設計/実験/デザイン）を保存し、ループの登場人物として生産・開発管理を追加した5ドメイン構成。

### 2.2 WEEKS — シナリオ時間軸

```js
export const WEEKS = 16;               // W1..W16
export const PHASE_LABELS = {          // 週帯のフェーズ表示（ヘッダー用）
  concept:   [1, 5],                   // W1-W5  コンセプト
  classA:    [6, 11],                  // W6-W11 クラスA
  prodCAD:   [12, 16],                 // W12-W16 量産CAD移行
};
```

## 3. *w* 成分 — 中核スキーマ

### 3.1 W_COMPONENTS — 成分マスタ（不変属性）

```js
export const W_COMPONENTS = [
  {
    id: 'w-term-module',
    type: 'term',            // 'term' | 'class' | 'idmap' | 'severity'
    label: 'モジュール',      // 表示名
    plain: '「モジュール」という語の意味',   // 平易説明（dual naming）
    domains: ['design', 'test'],             // 主たる係争ドメイン
    halfLife: 6,             // staleness 半減期（週）
    deadline: null,          // 不可逆デッドライン週。null = 多峰許容（無期限）
    partIds: [],             // 3D部位への紐付け（term は通常空）
  },
  {
    id: 'w-class-door-hinge',
    type: 'class',
    label: 'ドアヒンジ分類',
    plain: 'ドアヒンジは流用か一部変更か',
    domains: ['design', 'test', 'mfg'],
    halfLife: 4,
    deadline: 14,            // W14 = 金型発注（ハード）
    partIds: ['p-door-fl', 'p-door-fr'],
  },
  // ... 全成分（§6 の物語に必要な分を定義。目安: term×20, class×24, idmap×6, severity×4）
];
```

### 3.2 W_SNAPSHOTS — 週次状態（可変属性）

```js
// W_SNAPSHOTS[week][componentId] = 状態オブジェクト
export const W_SNAPSHOTS = {
  1: {
    'w-term-module': {
      modes: [                            // 多峰分布（share 合計 = 100）
        { value: '機能単位の部品集合',  share: 45, backers: ['design'] },
        { value: '組立単位の部品集合',  share: 40, backers: ['mfg'] },
        { value: '試験単位の部品集合',  share: 15, backers: ['test'] },
      ],
      consensus: 22,        // 合意強度 0-100（受容ダイナミクス由来の演出値）
      lastGrounded: 1,      // 最終物理接地週（staleness = 経過週/halfLife で描画側計算）
      temperature: 1.0,     // 焼きなまし温度 0.0(凍結)-1.0(高温)
      collapsedAt: null,    // 凍結確定週
      reheatedAt: null,     // 再加熱週（一部変更）
      fossil: false,
      certificateId: null,  // 流用部品のみ CERTIFICATES への参照
    },
    // ...
  },
  2: { /* ... */ },
  // ... W16 まで
};
```

**実装ノート:** 週間で変化しない成分はスプレッドでコピーして生成してよい（`data.js` 内のヘルパー関数で組み立て可）。エクスポートされる形が上記であれば内部の組み立て方は自由。

### 3.3 CERTIFICATES — collapse certificate（流用部品の凍結証明書）

```js
export const CERTIFICATES = {
  'cert-door-seal-gen5': {
    frozenIn: 'NV-2021（先代プログラム）',
    loadAssumptions: '設計荷重: ドア開閉 10万回 / 静荷重 800N',
    regBaseline: '2020年時点の側突規制（FMVSS 214 rev.2019）',
    correlatedPredictions: 'NVH透過音 予測-実測差 1.2dB以内（2021年実測）',
    supplierState: 'サプライヤA 第3工場 / 工程能力 Cpk 1.42',
    contextDiff: [                        // 現プログラム文脈との差分（分類判定の根拠）
      { axis: '荷重条件', diverged: false },
      { axis: '規制',     diverged: true, note: '側突規制が2024年改定。要再評価' },
      { axis: 'パッケージ', diverged: false },
      { axis: 'サプライヤ工程', diverged: false },
    ],
  },
  // ...
};
```

`contextDiff` に1つでも `diverged: true` があれば「一部変更」判定の根拠、すべて false なら「流用」、大半 true なら「新規」扱い——という差分判定の意味論（LoopArchitecture §5.4）を画面で説明できるようにする。

## 4. イベント系データ

### 4.1 ROUNDS — 提案-受容ラウンド（タブ1の再生素材）

```js
export const ROUNDS = {
  3: [   // week 3 のラウンド列（週内の再生順）
    {
      id: 'r-w3-01',
      protocol: 'daily',        // 'daily' | 'milestone' | 'phase' | 'cert'
      speaker: 'design',
      listener: 'test',
      componentId: 'w-term-module',
      proposal: '機能単位の部品集合',
      rationale: '設計BOMの構成単位と一致するため',       // 話者の根拠（表示用）
      likelihood: 0.72,         // 「聴者の観測をどれだけ説明するか」の演出値
      acceptProb: 0.72,
      accepted: true,
      effect: 'w-term-module の share が design 案 +8',   // 表示用の結果要約
    },
    // ...
  ],
  // ... 各週 3〜8 件程度
};
```

### 4.2 OBSERVATIONS — 物理観測イベント（staleness リセットの根拠）

```js
export const OBSERVATIONS = [
  { id: 'o-w6-range', week: 6,  domain: 'test',
    label: '第1試作車 実走行試験（航続距離）',
    grounds: ['w-sev-range', 'w-class-battery-tray'] },   // 接地された成分
  { id: 'o-w13-nvh', week: 13, domain: 'test',
    label: '第2試作車 NVH計測',
    grounds: ['w-sev-nvh', 'w-class-door-seal'] },
  // ...
];
```

### 4.3 DIVERGENCES — 乖離（答え合わせ）とトレースチェーン

```js
export const DIVERGENCES = [
  {
    id: 'd-range-w6',
    week: 6,
    metric: '航続距離',
    predicted: 512,           // km（w 由来の予測）
    actual: 468,              // km（実測）
    unit: 'km',
    severity: 'high',
    tracedTo: ['w-sev-range', 'w-class-battery-tray'],
    chain: [                  // トレースチェーン（タブ5の表示素材）
      { step: 'observe',  label: 'W6 実走試験で 468km を記録', week: 6 },
      { step: 'register', label: '予測512kmとの乖離 -8.6% を登録', week: 6 },
      { step: 'propose',  label: '実験→設計: バッテリートレイ熱設計の分類再検討を提案', week: 7, roundId: 'r-w7-02' },
      { step: 'update',   label: 'w-class-battery-tray が「流用」→「一部変更」に更新', week: 7 },
    ],
    note: '観測記録(o)は書き換えない。乖離は新しい提案を生む。',
  },
  // ... NVH 乖離（W13）ほか
];
```

### 4.4 PREDICTION_ACCURACY — ドメイン別予測的中率（受容重みの根拠）

```js
// 週次でゆるやかに更新される演出値
export const PREDICTION_ACCURACY = {
  6:  { design: 0.78, test: 0.85, dsgn: 0.70, mfg: 0.81, mgmt: 0.66 },
  13: { design: 0.80, test: 0.88, dsgn: 0.71, mfg: 0.83, mgmt: 0.68 },
};
```

### 4.5 HEALTH — ループ健全性7指標（週次系列）

```js
// HEALTH[week] = その週の7指標（LoopArchitecture §8 対応）
export const HEALTH = {
  1: {
    acceptanceMid: 0.55,   // #1 受容率の健全域割合（中間帯にある D-pair 比率）
    stalenessHigh: 0.30,   // #2 半減期超過の高影響成分比率
    errorLatency: null,    // #3 乖離登録までの週数（乖離未発生は null）
    lateCollapse: 0,       // #4 デッドライン超過の多峰成分数
    reheatRate: 0.00,      // #5 再加熱率
    shadowIT: 0.42,        // #6 shadow-IT 指数（Excel逃避の proxy、演出値）
    zRatio: null,          // #7 z乖離診断比率
  },
  // ... W16 まで。§6 の物語（改善傾向＋W11 の警告）に整合させる
};
```

## 5. デザイントークン（synapse01 からの拡張）

```js
export const C = { /* synapse01 の C をコピーして基調継承 */ };

// 分類色（CSS用 / Three.js 用を必ず同期）
export const CLASS_HEX  = { new: '#5B8DEF', carry: '#4DC38F', partial: '#F2B33D', fossil: '#E5484D' };
export const CLASS_3JS  = { new: 0x5b8def, carry: 0x4dc38f, partial: 0xf2b33d, fossil: 0xe5484d };

// 温度グラデーション端点（高温→凍結）
export const TEMP_HOT_HEX = '#E5484D';  export const TEMP_HOT_3JS  = 0xe5484d;
export const TEMP_COLD_HEX = '#3B82F6'; export const TEMP_COLD_3JS = 0x3b82f6;

// staleness（新鮮→減衰）: 部位色の彩度/明度を落とす方式でも可。実装ガイド参照
```

## 6. デモシナリオ（16週の物語）

タブ横断で一貫した物語。**データ作成時はこの物語に数値を整合させること。**

| 週 | 出来事 | 主な対象データ |
|---|---|---|
| W1 | ループ開始。用語20語が多峰状態、ドア系24部品は分類未確定。健全性は黄色多め | W_SNAPSHOTS[1], HEALTH[1] |
| W2-W4 | 日次ラウンドで用語が収束し始める。「モジュール」「ゾーン」で設計vs生産の解釈対立が可視化（z乖離の初診断） | ROUNDS, zRatio |
| W5 | 節目レビュー（milestone ラウンド集中）。用語の過半が consensus 60 超え | ROUNDS[5] |
| W6 | **第1試作車 実走試験。** 航続距離 468km vs 予測 512km の乖離登録 → staleness 一斉リセット | OBSERVATIONS, DIVERGENCES d-range-w6 |
| W7 | 乖離が提案を駆動：バッテリートレイ「流用」→「一部変更」に再加熱（reheat 第1号） | chain, reheatedAt |
| W8 | 用語 20語中 14語が実質収束。2語（「ゾーン」「サブアッシー」）は多峰のまま容認（deadline なし） | W_SNAPSHOTS[8] |
| W9 | **fossil 発見:** ドアシール（先代流用）に証明書が無いことが判明 → fossil バッジ、インベントリ入り | fossil: true |
| W10 | 検証計画フリーズ（ソフトデッドライン）。分類系成分の温度が下がり始める | temperature 低下 |
| W11 | **警告イベント:** ドアヒンジ分類が W14 デッドライン接近でもまだ二峰 → 焼きなましタブに遅延警告 | lateCollapse=1 |
| W12 | フェーズ遷移交渉（phase ラウンド）: クラスA→量産CADの ID 対応を再交渉。IDレジストリが更新 | idmap 更新 |
| W13 | **第2試作車 NVH計測。** ドアシール（fossil）で予測外れ → fossil のリスクが物語上で回収される | DIVERGENCES d-nvh-w13 |
| W14 | **金型発注デッドライン:** ドアヒンジ分類が collapse（❄）。ぎりぎりの収束として演出 | collapsedAt: 14 |
| W15 | 外部認証ラウンド（cert）: 規制側を veto 重み付きドメインとして描く | ROUNDS[15] |
| W16 | ループ1周の完了。健全性指標が W1 比で改善（shadowIT 低下、acceptanceMid 上昇）。ただし fossil 起因の教訓を残す | HEALTH[16] |

**データ量の目安:** ROUNDS 全 60〜80 件 / W_COMPONENTS 約 54 件 / DIVERGENCES 2〜3 件 / OBSERVATIONS 4〜6 件。これ以上増やさない（デモの読み取りやすさ優先）。

## 7. PARTS — 3D部位（synapse01 から流用・拡張）

```js
export const PARTS = [
  {
    id: 'p-door-fl', label: '左フロントドア',
    // --- synapse01 互換（Viewer3D 流用のため保持） ---
    design: 72, test: 55, dsgn: 80, status: 'warn',
    // --- synapse02 拡張 ---
    classification: 'partial',        // 'new' | 'carry' | 'partial'
    fossil: false,
    wComponentIds: ['w-class-door-hinge', 'w-term-subassy'],
    certificateId: null,
  },
  // ... synapse01 の部位構成（ボディ/ドア/バッテリー/モーター/足回り等）を踏襲
];
```

Viewer3D の車両構築コード（部位→メッシュ対応）を流用するため、**部位IDの体系は synapse01 と互換に保つ**（synapse01 の `PARTS` の id をベースに `p-` プレフィクスへ正規化するか、synapse01 の id をそのまま使うかは実装者判断。ただし全データで統一すること）。

---

*v1.0 — 2026-07-06。数値はすべて演出値であり、§6 の物語との整合が唯一の正しさの基準。*

---

## 実装ノート（2026-07-06 実装時の逸脱・補足）

- **door-seal を fossil として実装（§3.3 例との整合）:** §3.3 の CERTIFICATES 例 `cert-door-seal-gen5` は、§6 物語「W9 ドアシールに証明書が無い（fossil）」と矛盾する。物語を優先し、`w-class-door-seal` には証明書を付けず fossil として実装した。証明書スキーマの実例は別部品で提示（`cert-door-glass-gen5`＝全軸一致の流用／`cert-door-impactbeam-gen5`＝規制軸乖離の一部変更／`cert-battery-tray-gen4`＝熱条件軸乖離／`cert-door-regulator-gen5`）。fossil は W13 の NVH 乖離を受けて再加熱（🔥）され、その時点で fossil 状態を脱する（凍結根拠の再構築）。
- **成分数:** term 20 / class 23 / idmap 6 / severity 4 = 計 53 件（目安「約54件」に対し class を 23 で実装）。
- **ROUNDS:** 53 件（目安 60-80 に対しやや少ないが、物語イベント W2-16 を全て網羅。ImplementationGuide §7 の優先順位「物語の一貫性 > 機能の網羅」に従う）。
- **W_SNAPSHOTS の状態フィールド追加:** §3.2 の基本フィールドに加え、描画補助として class に `classification`、idmap に `phase`、severity に `severity`/`calibDomain` を持たせた（エクスポート形は §3.2 準拠のまま拡張）。
- **staleness 着色:** 「彩度/明度を落とす」案ではなく、緑（新鮮）→灰（減衰）の線形グラデーション（`stalenessColorHex` / `stalenessColor3JS`）で実装。
- **PARTS:** synapse01 の7部位を `p-` プレフィクスへ正規化し、ドア系ナラティブの3D居場所としてドア2枚（`p-door-fl`/`p-door-fr`）を側面パネルとして追加（計9部位）。
