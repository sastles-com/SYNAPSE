# SYNAPSE — Vehicle Development Intelligence Portal

NV-2026 · EV Sedan

## セットアップ

```bash
# 依存パッケージをインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで http://localhost:5173 を開く。

## ビルド

```bash
npm run build
npm run preview
```

## プロジェクト構成

```
synapse/
├── src/
│   ├── main.jsx              # エントリポイント
│   ├── index.css             # グローバルスタイル
│   ├── SynapsePortal.jsx     # ルートコンポーネント
│   ├── data.js               # データ定数（← 実APIに差し替え）
│   └── components/
│       ├── Shared.jsx        # 共通UIコンポーネント
│       ├── Header.jsx        # ヘッダー・ナビゲーション
│       ├── Dashboard.jsx     # ダッシュボードタブ
│       ├── Viewer3D.jsx      # 3Dビューワータブ（Three.js）
│       ├── Schedule.jsx      # フェーズゲート管理タブ
│       ├── Tasks.jsx         # タスク・課題管理タブ
│       ├── Docs.jsx          # ドキュメント管理タブ
│       └── Team.jsx          # チームタブ
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```

## 実装済み機能

| 機能 | 設計原則 | タブ |
|---|---|---|
| KPI・3領域進捗ダッシュボード | — | Dashboard |
| 予測リスクアラート | 原則③ ACC型 | Dashboard |
| クリッカブル3Dビューワー（Three.js） | — | 3D Viewer |
| Digital Threadタイムラインスライダー | 原則① 航空宇宙型 | 3D Viewer |
| 部位別サブポータル（設計/実験/デザイン） | — | 3D Viewer |
| フェーズゲート管理（Go/No-Go） | 原則② 医薬品型 | Schedule |
| 課題管理・タスク管理 | — | Tasks |
| ドキュメントライブラリ | — | Docs |
| チーム管理 | — | Team |

## バックエンド連携（将来）

`src/data.js` の定数を API 呼び出しに差し替えることで
バックエンドと接続できます。

```js
// 現在: モックデータ
export const PARTS = [ ... ]

// 将来: API呼び出し
export const fetchParts = () => fetch('/api/parts').then(r => r.json())
```

## 依存ライブラリ

- React 18
- Three.js r163
- Vite 5
