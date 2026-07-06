# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

SYNAPSE は新規車両開発（NV-2026 · EV Sedan）の**設計・実験・デザイン3領域の進捗を統合可視化するポータル**のフロントエンドプロトタイプ。3Dモデルを「情報統合点 / 議論のブリッジ」と位置づけ、過去車種データをナレッジDBとして引用しながら進捗に応じて3Dモデルが変化する仕組みを目指す。現状はバックエンド無しのモックデータ駆動。

リポジトリ構成:
- `doc/` — 設計ドキュメント・他業界ベンチマーク・プレゼン素材（実装の根拠となる思想が記載されている）
- `synapse/` — React + Vite + Three.js アプリ本体（**synapse01 = 4層スタック時代のポータル。凍結**）
- `synapse02/` — 予測開発ループ時代のポータル（`doc/loop/` + `doc/synapse02/` 準拠）。synapse01 と並置・独立プロジェクト

**重要:** `synapse/`（synapse01）は凍結。synapse01 と synapse02 の見比べ自体がデモ価値であるため現状のまま保存する。**ループ関連の機能追加・変更は `synapse02/` へ行うこと。** バグ修正含め synapse01 は触らない。

## コマンド

すべて `synapse/` ディレクトリ内で実行する。

```bash
cd synapse
npm install        # 依存インストール
npm run dev        # 開発サーバー（http://localhost:5173）
npm run build      # 本番ビルド
npm run preview    # ビルド結果のプレビュー
```

テスト・リンタは未設定（プロトタイプ段階）。

## アーキテクチャ

### データフローの中心は `src/data.js`

全コンポーネントが `src/data.js` の**エクスポート定数を直接 import** する。状態管理ライブラリ（設計書はZustand推奨だが未導入）もAPI層も無く、`data.js` がモックDBそのもの。バックエンド連携時はここの定数を API 呼び出しに差し替える設計。主要な定数:

- `PARTS` — 部位データ。各部位は `design`/`test`/`dsgn`（設計/実験/デザインの3進捗値）と `status` を持つ。3D着色・ダッシュボード集計・サブパネルの全ソース
- `ANCHORS` / `ANCHOR_PCTS` — Digital Thread のスナップショット（時点別の部位進捗）。3Dビューワーのタイムラインスライダーが参照
- `PHASE_GATES` — フェーズゲート（Go/No-Go）の充足条件
- `ISSUES` / `MILESTONES` / `ACTIVITIES` / `TEAM` / `DOCS`
- `C` / `STATUS_HEX` / `STATUS_3JS` / `STATUS_LBL` — デザイントークン。`STATUS_HEX` はCSS用16進文字列、`STATUS_3JS` はThree.js用の `0x` 数値。**色を変える際は両方を同期させること**

### コンポーネント構成

`SynapsePortal.jsx`（ルート）が `active` タブ state を持ち、6つのタブコンポーネントを `switch` で切り替える単純構造。各タブは独立して `data.js` を読む。

- `components/Shared.jsx` — `Bar` / `Pill` / `StatusPill` / `Card` / `CardTitle` / `Logo` の共通UI。新規UIは原則ここを再利用
- `components/Viewer3D.jsx` — 最も複雑。Three.jsをReact外で命令的に制御する

### Viewer3D の設計（重要）

Three.js のオブジェクトは React state ではなく **`useRef` で保持**する（`threeRef` にscene/camera/renderer/meshes、`stateRef` にカメラ角度・マウス状態）。理由は再レンダリングでWebGLコンテキストを作り直さないため。

- 車両は glTF ではなく **BoxGeometry / CylinderGeometry を手組み**して構築。1つの部位（partId）に複数メッシュが対応し `meshes[partId] = [...]` の配列で管理
- 選択ハイライト・分解図・ワイヤー・時点別着色はすべて **mesh の material を直接書き換える**命令的操作。React state（`selId` 等）はUI表示用に併存
- クリック選択は Raycaster。マウス/ホイールイベントは2つ目の `useEffect` で登録

### スタイリング

CSSフレームワーク未使用。**全スタイルはインライン `style` オブジェクト**で記述（設計書のTailwind推奨とは乖離）。色は `data.js` の `C` トークンを参照する。

## 設計思想との対応

`doc/SYNAPSE_Design_Document.md` の「3原則」がコードにマッピングされている。機能を追加・変更する際はこの対応を意識する:

- **原則① デジタルスレッド** → Viewer3D のタイムラインスライダー + `ANCHOR_PCTS`
- **原則② フェーズゲート** → Schedule タブ + `PHASE_GATES`
- **原則③ 予測リスク可視化** → Dashboard の予測リスクアラートパネル

注意: README.md / 設計書では Schedule/Tasks/Docs/Team を「実装予定」と記すが、実際は全タブ実装済み。ドキュメントを参照する際はコードの実態と突き合わせること。

---

## synapse02（予測開発ループ・ポータル）

### コマンド

すべて `synapse02/` ディレクトリ内で実行する（synapse01 の 5173 と同時起動できるよう **port 5174**）。

```bash
cd synapse02
npm install
npm run dev        # 開発サーバー（http://localhost:5174）
npm run build      # 本番ビルド
npm run preview    # ビルド結果のプレビュー
```

synapse01 と同一スタック（React18 + Vite + Three.js、状態管理ライブラリなし、全スタイルはインライン `style`、`base: './'`）。テスト・リンタは未設定。

### アーキテクチャ要点

- **データ源は `src/data.js`（モックDB）。** synapse01 同様、全コンポーネントがエクスポート定数を直接 import する。バックエンド接続時はここを API に差し替え
- **週次スナップショット方式:** 時系列状態は週ごとの事前計算済みスナップショット。中核は `W_SNAPSHOTS[week][componentId]`（synapse01 の `ANCHOR_PCTS` の拡張）。`data.js` 内では `COMPONENT_SPECS`（内部の進化スペック）から `W_COMPONENTS`（不変属性）と `W_SNAPSHOTS`（可変属性）をビルド関数で生成する。演出値であり計算ロジックは無い
- **中核概念 = 共通図 *w*。** 3Dモデルは *w* の一レンダリングにすぎない。`w-` 成分は type=term/class/idmap/severity の4種（計53件）。各成分は modes（多峰分布）/consensus/staleness/temperature/collapse/fossil を持つ
- **dual naming 規約:** UI第一表示は必ず平易な日本語（観測／解釈／共通図／合意の回し方／答え合わせ）。CPC用語（o/z/w・MHNG・annealing）はサブラベル・ツールチップの補足に落とす（`SYNAPSE_LoopArchitecture.md` §9）
- **状態色の二重定義:** `CLASS_HEX`/`CLASS_3JS`、`tempColorHex`/`tempColor3JS` 等、CSS用16進とThree.js用0x数値を必ず両方定義・同期（synapse01 の規約踏襲）

### コンポーネント構成

`Synapse02Portal.jsx`（ルート）が `active`（タブ）/ `week`（シナリオ時刻 W1-W16）/ `playing`（再生中）を持ち props で配る。`WeekSlider.jsx` がグローバル週スライダー（全タブ共通・ヘッダー直下常設）。6タブ:

- `TabLoop`（ループ／ホーム）— SVGループ図＋健全性7指標（`HEALTH`）＋週次アクティビティフィード
- `TabConsensus`（合意の回し方）— MHNG ラウンド再生（`ROUNDS`）＋受容率ヒストグラム＋収束チャート
- `TabShared`（共通図）— *w* エクスプローラ4サブビュー。`CertificateDrawer.jsx`（collapse certificate）と fossil インベントリ
- `TabAnchor`（3Dアンカー）— **synapse01 `Viewer3D.jsx` の車両構築を流用**（BoxGeometry手組み・`meshes[partId]`・useRef 保持・Raycaster）。着色を4モード（分類/合意強度/staleness/温度）に差し替え。部位IDは `p-` プレフィクス、ドア2枚を追加
- `TabCollapse`（焼きなまし）— 成分別ガントの温度カーブ・❄collapse/🔥reheat・collapse遅延警告
- `TabError`（答え合わせ）— 予測-実測（`DIVERGENCES`）・トレースチェーン・的中率テーブル・リスクトレースマトリクス

`components/Shared.jsx` は synapse01 の Bar/Pill/StatusPill/Card/CardTitle/Logo を流用し、`Gauge`（staleness）/`ModeBar`（多峰分布）/`TempStripe`（温度帯）/`Sparkline`/`DomainChip`/`ClassPill`/`Lead` を追加。

### 物語の一貫性が最優先

`SYNAPSE02_DataModel.md` §6 の16週シナリオ（W6航続乖離→W7 battery再加熱、W9 fossil発見→W13 NVH乖離で解決、W11 collapse遅延警告→W14 金型collapse、W12 フェーズ遷移）が通し再生で読み取れることが正しさの唯一の基準。数値変更時はこの物語との整合を必ず保つこと。
