# SYNAPSE02 — 予測開発ループ・デモポータル

NV-2026 · EV Sedan ／ *Collective Predictive Development*

車両開発を **4層スタック**ではなく **予測開発ループ**（propose → compose → predict → measure error → update）として運営・可視化するモック駆動デモポータル。`synapse/`（synapse01＝4層スタック時代のポータル）と**並置**され、両者を見比べられること自体がデモ価値を持つ。

> **アンカーは3Dモデルではない。共有された潜在変数 *w*（共通図）である。** 全チームが提案し、提案は実データで検証され、予測は現物と答え合わせされる。

概念の正典は [`doc/loop/SYNAPSE_LoopArchitecture.md`](../doc/loop/SYNAPSE_LoopArchitecture.md)、仕様は [`doc/synapse02/`](../doc/synapse02/) を参照。

## セットアップ

```bash
# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5174 を開く（synapse01 の 5173 と**同時起動**して比較可能）。

## ビルド

```bash
npm run build
npm run preview
```

## プロジェクト構成

```
synapse02/
├── src/
│   ├── main.jsx                # エントリポイント
│   ├── index.css               # グローバルスタイル（＋pulse/flowキーフレーム）
│   ├── Synapse02Portal.jsx     # ルート（active/week/playing を保持し props で配布）
│   ├── data.js                 # 週次スナップショットのモックDB（← 実APIに差し替え）
│   └── components/
│       ├── Shared.jsx          # 共通UI（Bar/Pill/Card/Logo ＋ Gauge/ModeBar/TempStripe/Sparkline）
│       ├── Header.jsx          # ヘッダー・6タブナビ・週/フェーズ表示
│       ├── WeekSlider.jsx      # グローバル週スライダー（W1-W16・再生/一時停止/1週送り）
│       ├── TabLoop.jsx         # ループ全景＋健全性7指標＋アクティビティフィード
│       ├── TabConsensus.jsx    # 合意の回し方（MHNGラウンド再生）
│       ├── TabShared.jsx       # 共通図 w エクスプローラ（4サブビュー）
│       ├── TabAnchor.jsx       # 3Dアンカー（synapse01 Viewer3D 流用＋4着色モード）
│       ├── TabCollapse.jsx     # 焼きなまし（collapse タイムライン）
│       ├── TabError.jsx        # 答え合わせ（誤差信号・相関ガバナンス）
│       └── CertificateDrawer.jsx  # collapse certificate ドロワー
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js              # base:'./' ／ server.port:5174
└── package.json
```

## タブ構成（ループ5要素の可視化）

UI第一表示は必ず平易な日本語名。CPC用語（*o* / *z* / *w*、MHNG、annealing）はサブラベル・ツールチップの補足に留める。

| # | タブ（表示） | 内部ID | 対応概念 |
|---|---|---|---|
| 0 | ループ | `loop` | ループ全景＋健全性メトリクス7指標（ホーム） |
| 1 | 合意の回し方 | `consensus` | MHNG 提案-受容ラウンド再生＋受容率ヒストグラム＋収束チャート |
| 2 | 共通図 | `shared` | *w* エクスプローラ（用語集／部品分類＋証明書＋fossil／IDレジストリ／リスク重大度） |
| 3 | 3Dアンカー | `anchor` | *w* の一レンダリング。4着色モード（分類/合意強度/staleness/温度） |
| 4 | 焼きなまし | `collapse` | collapse operator・成分別デッドライン・❄collapse/🔥reheat・遅延警告 |
| 5 | 答え合わせ | `error` | 予測-実測乖離・トレースチェーン（append-only）・相関ガバナンス |

全タブはヘッダー直下の**週スライダー（W1〜W16）**に追随する。再生で 1週 ≒ 2秒の自動送り。

## デモシナリオ（16週の物語）

週スライダーを W1→W16 に通し再生すると、以下が一貫した物語として読み取れる。

- **W6** 第1試作の実走試験で航続 468km（予測 512km）の**乖離登録** → staleness 一斉リセット
- **W7** 乖離が提案を駆動：バッテリートレイが「流用」→「一部変更」に**再加熱（🔥 第1号）**
- **W9** ドアシールに凍結証明書が無いと判明＝**fossil 発見**（インベントリ入り）
- **W11** ドアヒンジ分類が W14 デッドライン接近でもまだ二峰＝**collapse遅延警告**（健全性#4）
- **W12** フェーズ遷移交渉でクラスA→量産CADの**ID対応を非破壊更新**
- **W13** 第2試作 NVH計測で fossil のドアシールが予測外れ → **fossil を再設計して解決**
- **W14** 金型発注デッドラインでドアヒンジ分類が **collapse（❄）**

## アーキテクチャ要点

- **週次スナップショット方式:** 時系列状態は週ごとの事前計算済みスナップショット。中核は `W_SNAPSHOTS[week][componentId]`。数値はすべて演出値で、正しさの基準は上記シナリオとの整合のみ
- **共通図 *w* が中核:** *w* 成分は term / class / idmap / severity の4種（計53件）。各成分は多峰分布（modes）・合意強度・staleness（半減期）・温度・collapse/fossil 状態を持つ
- **3Dは *w* の一描画:** synapse01 の Viewer3D 車両構築コード（BoxGeometry手組み・`meshes[partId]`・useRef 保持・Raycaster）を流用し、着色のみループ用4モードに差し替え
- **状態管理ライブラリなし:** ルートの useState + props（synapse01 と同流儀）。全スタイルはインライン `style`

## バックエンド連携（将来）

`src/data.js` のエクスポート定数を API 呼び出しに差し替えることでバックエンドと接続できる（synapse01 と同じ差し替え戦略）。本物の MHNG 計算・尤度計算は行わず、受容確率などはシナリオに事前記録した値を表示している。

```js
// 現在: モックデータ（週次スナップショット）
export const W_SNAPSHOTS = { 1: { ... }, 2: { ... }, ... }

// 将来: API呼び出し
export const fetchSnapshot = week => fetch(`/api/w?week=${week}`).then(r => r.json())
```

## 依存ライブラリ

- React 18
- Three.js r163
- Vite 5
