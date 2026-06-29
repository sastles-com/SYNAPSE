# SYNAPSE — Vehicle Development Intelligence Portal

**NV-2026 · EV Sedan**

新規車両開発における **設計・実験・デザイン（スタイリング）の3領域の進捗を、1つのポータルで統合可視化** するシステム。過去車種のデータをナレッジDBとして引用しながら、進捗の更新に応じて3D車両モデルがリアルタイムに変化する。

> **コアコンセプト**
> 3Dモデルは単なる「可視化UI」ではなく、異なるドメインが同一のアンカーを介して収束する **情報統合点** であり、**議論のブリッジ** である。

現在は **フロントエンドプロトタイプ段階**（モックデータ駆動・バックエンド未接続）。

---

## クイックスタート

```bash
cd synapse
npm install
npm run dev      # http://localhost:5173
```

ビルド:

```bash
npm run build
npm run preview
```

---

## 本質的価値命題

### アンカーの定義

```
アンカー = 3Dモデルの特定部位 × 特定時点のスナップショット
```

アンカーは単なるファイルではなく「ある時点で全ドメインが合意した成果物の状態」を指す。設計・実験・デザイン・経営の4ドメインが異なる言語で同じアンカーを参照することで「どの版に基づいた議論か」という曖昧さが消える。過去プロジェクトの同部位アンカー履歴を参照できることが「データベースとして引用する」という要件の本質。

### 対象ユーザー

| ユーザー | 主な用途 |
|---|---|
| 開発エンジニア（設計・実験） | 部位別進捗確認・課題登録・ドキュメント参照 |
| デザイナー（スタイリング） | CMF進捗・レンダリング履歴・デザインレビュー |
| プロジェクトマネージャー | 全体進捗・マイルストーン・課題管理 |
| 経営・役員層 | KPIサマリー・フェーズゲート承認・リスク把握 |

---

## 設計原則（3原則）

他業界のPLM／可視化事例から転用した3つの原則がそのまま機能に対応している。

| 原則 | 参照元 | 概念 | SYNAPSEでの実装 |
|---|---|---|---|
| **① デジタルスレッド** | 航空宇宙PLM（3DEXPERIENCE / Windchill） | フェーズをまたぐデータの連続性確保 | 3Dビューワーのタイムラインスライダー（時点別の部位進捗着色） |
| **② フェーズゲート** | 医薬品PLM（Teamcenter / Aras） | 明確なGo/No-Goゲート管理 | Schedule タブの充足条件バー・承認フロー |
| **③ 予測リスク可視化** | Autodesk Construction IQ | 進捗だけでなく遅延リスクの予測フラグ | Dashboard の予測リスクアラートパネル |

詳細は [doc/SYNAPSE_Design_Document.md](doc/SYNAPSE_Design_Document.md) を参照。

---

## 機能一覧

| 機能 | 設計原則 | タブ |
|---|---|---|
| KPI・3領域進捗ダッシュボード | — | Dashboard |
| 予測リスクアラート | ③ ACC型 | Dashboard |
| クリッカブル3Dビューワー（Three.js） | — | 3D Viewer |
| Digital Thread タイムラインスライダー | ① 航空宇宙型 | 3D Viewer |
| 部位別サブポータル（設計／実験／デザイン） | — | 3D Viewer |
| フェーズゲート管理（Go/No-Go） | ② 医薬品型 | Schedule |
| 課題管理・タスク管理 | — | Tasks |
| ドキュメントライブラリ | — | Docs |
| チーム管理 | — | Team |

---

## アーキテクチャ

```
CAD/PLM（CATIA・NX・Teamcenter）
    ↓ API / Webhook（将来）
バックエンドDB（将来実装）
    ↓ REST API
src/data.js（現在：モックデータ定数）
    ↓
3Dビューワー着色 ←→ サブポータルパネル ←→ ダッシュボードKPI
```

### コンポーネントツリー

```
SynapsePortal（ルート / タブ切替）
├── Header              ロゴ・ナビゲーション・フェーズバッジ
├── Dashboard           KPI・3領域カード・予測リスク・マイルストーン・課題
├── Viewer3D            Three.js 3Dモデル・タイムラインスライダー・部位サブパネル
├── Schedule            フェーズゲート充足状況
├── Tasks               課題管理・タスク一覧
├── Docs                ドキュメントライブラリ
└── Team                メンバー・稼働状況
```

`src/data.js` のモック定数（`PARTS` / `MILESTONES` / `ISSUES` / `PHASE_GATES` / `ANCHORS` 等）を実APIに差し替えることでバックエンド連携が可能。

---

## 技術スタック

| レイヤー | 採用技術 |
|---|---|
| 3Dビューワー | Three.js r163 |
| UIフレームワーク | React 18 |
| ビルドツール | Vite 5 |
| 3Dモデル形式（将来） | glTF / GLB |

---

## プロジェクト構成

```
SYNAPSE/
├── CLAUDE.md                 # Claude Code 向けガイド
├── README.md
├── doc/                      # 設計ドキュメント・ベンチマーク・プレゼン素材
│   ├── SYNAPSE_Design_Document.md
│   ├── SYNAPSE_ArchitectureDesign.md
│   └── SYNAPSE_CrossIndustry_BenchmarkReport.md
└── synapse/                  # アプリ本体
    ├── src/
    │   ├── main.jsx          # エントリポイント
    │   ├── SynapsePortal.jsx # ルートコンポーネント
    │   ├── data.js           # データ定数（← 実APIに差し替え）
    │   └── components/        # 各タブ・共通UI
    ├── public/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## ロードマップ

- **Phase 1（完了）** — フロントエンドプロトタイプ（全タブ・3Dビューワー・モックデータ）
- **Phase 2（次期）** — フェーズゲートUI / タイムラインスライダーの拡充
- **Phase 3（将来）** — CAD/PLM APIブリッジ・進捗DB・過去プロジェクト参照ライブラリ・予測リスクスコアリング

---

*SYNAPSE — NV-2026 EV Sedan Vehicle Development Portal*
