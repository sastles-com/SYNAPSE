# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

SYNAPSE は新規車両開発（NV-2026 · EV Sedan）の**設計・実験・デザイン3領域の進捗を統合可視化するポータル**のフロントエンドプロトタイプ。3Dモデルを「情報統合点 / 議論のブリッジ」と位置づけ、過去車種データをナレッジDBとして引用しながら進捗に応じて3Dモデルが変化する仕組みを目指す。現状はバックエンド無しのモックデータ駆動。

リポジトリは2層構成:
- `doc/` — 設計ドキュメント・他業界ベンチマーク・プレゼン素材（実装の根拠となる思想が記載されている）
- `synapse/` — React + Vite + Three.js アプリ本体

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
