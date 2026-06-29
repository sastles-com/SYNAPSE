# 車両開発ポータル 他分野ベンチマーク調査レポート
## SYNAPSE（Vehicle Development Intelligence Portal）参考事例集

**調査目的：** 設計構想から進捗管理・DB統合までを一元化する「車両開発ポータル」に類するシステムが、自動車以外の分野でどのように実装されているかを調査し、SYNAPSEの設計・発展に活用する。

---

## 目次

1. [建設業 — BIM統合プロジェクトポータル](#1-建設業)
2. [デジタルツイン — 製品開発における仮想モデル統合](#2-デジタルツイン)
3. [航空宇宙 — PLM × フェーズゲート管理](#3-航空宇宙)
4. [医薬品 — 臨床試験進捗ポータル](#4-医薬品)
5. [食品・消費財 — 製品ポートフォリオポータル](#5-食品消費財)
6. [半導体 — チップ設計検証ポータル](#6-半導体)
7. [横断比較まとめ](#7-横断比較まとめ)
8. [SYNAPSEへの示唆（4つの設計原則）](#8-synapseへの示唆)

---

## 1. 建設業

### 概要

建設業は「設計図（BIMモデル）→施工→竣工引渡し」という複数フェーズにわたる複雑なプロジェクトを、複数ステークホルダー（設計者・施工者・発注者・PM）が共有する情報基盤として統合ポータルを活用している。

### 代表プラットフォーム

**Autodesk Construction Cloud（ACC）/ Autodesk Forma**

- 設計から施工・運用まで一貫したクラウドプラットフォーム
- BIM Collaborate・PlanGrid・BuildingConnectedを統合
- **Construction IQ**：MLを用いた予測リスク検出エンジン（設計・品質・安全・コストのリスクを自動フラグアップ）
- 2026年1月アップデートでQuality KPI Dashboardを追加、フィールド品質をリアルタイム可視化

> 公式リンク：[Autodesk Construction Cloud Dashboards](https://construction.autodesk.com/tools/dashboards-and-data-analytics/)

**BIM × ArcGIS 3D進捗ダッシュボード（Esri）**

- RevitやIFCファイルをArcGIS Proで直接読み込み、3D建物モデルと進捗データを統合
- 部材ごとに施工ステータスをカラーコードで表示（フロア・ゾーン・工種ごと）
- ステータス変更がリアルタイムでダッシュボードに反映

> 技術解説：[From BIM to Dashboard（Esri）](https://www.esri.com/arcgis-blog/products/arcgis-pro/3d-gis/from-bim-to-dashboard-building-a-3d-construction-progress-dashboard-with-arcgis)

**Mace Group 導入事例（BIM 360 → ACC）**

- 1,000人以上の内部・外部コラボレーターが参加するエンタープライズ展開
- BIM 360ドキュメント管理と3Dモデル連携によりコーディネーション・レポートの**50%時間削減**を達成

> 事例詳細：[Implementing ACC across a Billion-Dollar Business](https://medium.com/autodesk-university/implementing-autodesk-construction-cloud-across-a-billion-dollar-business-cea171979b3e)

### SYNAPSEとの対比

| BIM統合ポータル | SYNAPSE |
|---|---|
| RevitモデルをWebに公開、部材クリックで情報表示 | 3D車両モデル、パーツクリックでサブポータルへ |
| 施工ステータスをヒートマップ表示 | 設計/実験/デザイン進捗をRGB色分け |
| 設計・施工・コスト３領域を統合 | 設計・実験・デザイン３ドメインを統合 |
| Construction IQで遅延リスクを予測 | （将来実装）ISSUESデータからリスク予測 |

---

## 2. デジタルツイン

### 概要

デジタルツインは「物理製品と1対1で対応する仮想モデル」であり、設計・製造・運用の各フェーズにわたってリアルデータと同期し続ける。製品PLMシステムの延長として位置づけられ、従来の静的な設計データ管理から、ライブデータと連携するダイナミックな開発管理へのパラダイムシフトを示している。

### 主要分類（McKinsey定義）

| タイプ | 内容 | 用途例 |
|---|---|---|
| **エンジニアリングツイン** | 製品定義〜詳細設計のデジタル複製 | CAD/CAE連携、設計変更影響シミュレーション |
| **プロダクションツイン** | 製造プロセスをデジタル複製（使用部材・工程パラメータ・検査結果） | 製造品質管理、工程最適化 |
| **サービスツイン** | 運用中製品のデータ収集・劣化予測 | 予知保全、リアルタイム性能監視 |

> 参照：[McKinsey — Digital Twins: The Art of the Possible](https://www.mckinsey.com/capabilities/operations/our-insights/digital-twins-the-art-of-the-possible-in-product-development-and-beyond)

### 定量的効果（実績値）

- ある航空宇宙企業：デジタルツイン導入により**製品検証・バリデーション期間を12ヶ月短縮**、TTMを15〜25%改善（McKinsey実績）
- 先進製造業全体の約75%がすでに中〜高複雑度のデジタルツインを採用（McKinsey調査）
- 市場規模：2027年に730億ドル規模へ（年率約60%成長）

> 詳細調査：[McKinsey — Digital Twins in Manufacturing & Product Development](https://www.mckinsey.com/industries/industrials/our-insights/digital-twins-the-key-to-smart-product-development)

### PLMとの関係性

従来のPLMシステムが「製品バリアントごとに1モデル」だったのに対し、デジタルツインは**個体ごとに1モデルを持ち、ライフサイクルを通じて継続更新**する。この差異がSYNAPSEの将来アーキテクチャに直結する。

> 技術解説：[McKinsey — What is Digital Twin Technology](https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-digital-twin-technology)

### SYNAPSEとの対比

| デジタルツイン概念 | SYNAPSEへの適用 |
|---|---|
| 仮想モデルとリアルデータの双方向同期 | 3D Viewerをリビングモデルとして発展 |
| フェーズをまたいでデータが蓄積・更新される | 設計構想→実験データ→デザイン承認を単一モデルで追跡 |
| 個体ごとにツインを保持 | 将来的にNV-2026の試作車ごとにデータを管理 |

---

## 3. 航空宇宙

### 概要

航空宇宙産業は最も成熟したPLM活用分野であり、「コンセプト設計→試験・検証→量産認定」という複数フェーズと複数ドメイン（機械/電気/ソフトウェア/製造）の統合管理に長年取り組んできた。

### デジタルスレッドとPLM

**Siemens Teamcenter / Tecnomatix**

- ライフサイクル各段階の「部分デジタルツイン」を**デジタルスレッド**によって統合
- 構想設計時のデータが試験フェーズ・製造フェーズまで途切れなく連携
- PLM統合により設計変更の影響が即座に下流フェーズへ伝播

> エコシステム：[Siemens Fabless/Foundry Ecosystem Solutions](https://eda.sw.siemens.com/en-US/foundry-ecosystem-solutions/)

**IndX × Siemens Tecnomatix 導入事例**（エンジンコンポーネントメーカー）

- 新規生産施設の立ち上げにあたり、Tecnomatix Plant SimulationとPLM統合を組み合わせたプロセスデジタルツインを構築
- 生産ライン検証をシミュレーションで先行実施し、設計エンジニアと製造現場のクローズドループ通信を実現
- 国防省（DoD）の厳格なタイムラインに対応

> 事例詳細：[A Digital Twin for Seamless Aerospace Manufacturing（IndX）](https://www.indx.com/case-study/a-digital-twin-for-seamless-aerospace-manufacturing)

**McKinsey — 航空宇宙企業の実績**

- ある大手航空宇宙企業：マルチシステムデジタルツインを構築し、動的試験シミュレーションを実現。**製品検証・バリデーション期間を12ヶ月短縮**、市場投入期間を15〜25%削減。

> 詳細：[McKinsey — Product Digital Twins](https://www.mckinsey.com/capabilities/operations/how-we-help-clients/product-development-procurement/product-digital-twins)

### SYNAPSEとの対比

| 航空宇宙PLM | SYNAPSE |
|---|---|
| デジタルスレッドによるフェーズ間データ連携 | 将来バックエンドでのDB統合 |
| 複数ドメイン（機械/電気/SW）の統合 | 設計・実験・デザイン3ドメインの統合 |
| 設計変更の影響をリアルタイムで可視化 | SYNAPSEの3D Viewerに変更影響ビュー追加の可能性 |

---

## 4. 医薬品

### 概要

新薬開発は「前臨床→Ph.I→Ph.II→Ph.III→FDA承認」という厳格なフェーズゲート構造を持ち、各フェーズで大量のデータを複数チーム（研究/臨床/規制)が共有する必要がある。

### 代表システム

**FDA-TRACK（CDER進捗ダッシュボード）**

- FDAのCenter for Drug Evaluation and Research（CDER）がライフサイクル全体にわたる審査進捗をKPIダッシュボードで四半期ごとに公開
- 研究・発見フェーズから承認後の市販後監視まで、ライフサイクル全フェーズを網羅する構造
- 承認前安全性レビュー・臨床試験・承認後モニタリングの3ドメインを単一ポータルで管理

> 公式ダッシュボード：[FDA-TRACK CDER Dashboards](https://www.fda.gov/about-fda/fda-track-agency-wide-program-performance/fda-track-center-drug-evaluation-and-research-dashboards)

**AstraZeneca × FDA リアルタイム臨床試験（2026年）**

- AstraZenecaとFDAが協働し、AIと現代データサイエンスを活用してリアルタイムで安全性・有効性シグナルをストリーミング・検証するフレームワークを実証
- Amgenとの2件目の実証も進行中
- 次フェーズ：クラウドベースシステムと標準化指標を評価するパイロットプログラムを展開予定

> 報道：[FDA Commissioner — Smarter Real-Time Clinical Trials（STAT News）](https://www.statnews.com/2026/04/28/fda-clinical-trial-endpoints-real-time-drug-development/)

### フェーズゲート構造の対比

```
医薬品: 前臨床 → IND申請 → Ph.I → Ph.II → Ph.III → NDA承認 → 市販後
              ↑         ↑                 ↑              ↑
            Go/No-Go  Go/No-Go         Go/No-Go       Go/No-Go

SYNAPSE: 設計構想 → 基本設計完了 → 実験完了 → デザイン承認 → 量産判定
              ↑           ↑              ↑              ↑
            Go/No-Go   Go/No-Go      Go/No-Go       Go/No-Go
```

### SYNAPSEとの対比

| 医薬品開発ポータル | SYNAPSE |
|---|---|
| フェーズゲートでGo/No-Goを可視化 | マイルストーンをゲート構造として強化 |
| 研究/臨床/規制の3ドメイン統合 | 設計/実験/デザインの3ドメイン統合 |
| リアルタイムDB連携（AstraZeneca事例） | 将来的なバックエンドDB統合 |

---

## 5. 食品・消費財

### 概要

食品・CPG（Consumer Packaged Goods）産業では、多数の製品ラインと多数の部門（R&D/製造/マーケティング/サプライチェーン）にまたがる商品開発プロセスを単一プラットフォームで管理する必要性が高まっている。

### 代表事例

**Conagra Brands × Planview Product Portfolio Management**

- Bird's Eye・Duncan Hines・Slim Jimなど多数のブランドを持つ大手食品企業
- 課題：「サイロ化した環境による可視性の欠如、非生産的な会議の多発、コンテキスト外での断片的な会話」（VP of R&D Product Readiness, Mark Evans）
- 対策：Planviewを導入し、1,400ユーザーが参照する単一ポートフォリオ管理ハブを構築
- 成果：ブランド・プロジェクト・工場・5,000種の原材料・20,000種の包材をすべて一元管理。「数クリックで想像を絶する量のデータにアクセスできる」

> 公式事例：[Conagra Brands Case Study（Planview）](https://www.planview.com/resources/case-study/conagra-brands-improve-efficiency-to-speed-global-product-delivery/)

**ABB Electrification × Planview（電気機器製造）**

- 150名のPM/R&Dマネージャーが参加する製品ポートフォリオ計画を統合
- R&Dプロジェクト投資判断を予算ベースから成果ベースへ転換
- 次フェーズとしてリソース管理を追加予定

> 公式事例：[ABB Case Study（Planview）](https://www.planview.com/resources/case-study/abb/)

### SYNAPSEとの対比

| 食品/CPGポートフォリオ管理 | SYNAPSE |
|---|---|
| 複数ブランド・製品ラインを単一ポータルで管理 | NV-2026を軸とした複数開発プロジェクト管理 |
| 戦略から納品まで直接見通せる可視性 | ダッシュボードで全ドメインの進捗を一覧 |
| サイロ解消・会議削減 | 同一課題をSYNAPSEで解決 |

---

## 6. 半導体

### 概要

半導体チップ設計は「RTL設計→論理合成→配置配線→物理検証→テープアウト（量産リリース）」という厳密なフェーズ構造を持ち、フェーズごとに異なるEDAツールと大量の検証データが発生する。

### 代表システム

**Synopsys / Cadence EDA プラットフォーム**

- IC設計の全フェーズ（タイミング解析・シミュレーション・DRC/LVS検証・RC抽出）を統合
- 検証進捗のリアルタイムモニタリング：「テープアウトの準備が整ったかを判断するためのリアルタイム進捗把握が不可欠」（特許文献より）
- 既存手法の課題：データの非リアルタイム性・エンジニアへの使い勝手・プロセス自動化の困難さ

**TSMC EDA Alliance**

- 回路設計タイミング解析・シミュレーション・配置配線・物理レイアウト検証・RC抽出という全フェーズをカバーするツールチェーンを整備
- TSMCのプロセスロードマップ（N3/N2/A16/A14）と連動してEDAパートナーが設計イネーブルメントを提供
- CadenceとSiemensがAIエージェント支援によるデザインルールチェック自動修正フローを2025年に発表

> 公式サイト：[TSMC EDA Alliance](https://www.tsmc.com/english/dedicatedFoundry/oip/eda_alliance)

### フェーズ構造の対比

```
半導体: RTL設計 → 論理合成 → 配置配線 → DRC/LVS検証 → テープアウト（量産GO）
              ↑                              ↑                   ↑
           設計フェーズ                  実験/検証フェーズ        量産判定

SYNAPSE:  設計構想  →  基本設計  →  実験・試験  →  デザイン承認  →  量産判定
```

### SYNAPSEとの対比

| 半導体EDA管理 | SYNAPSE |
|---|---|
| 設計→検証→テープアウトのフェーズ管理 | 設計→実験→デザイン承認のフェーズ管理 |
| 検証進捗のリアルタイム可視化 | 3ドメイン進捗のリアルタイムヒートマップ |
| テープアウトGO判断 | 量産判定マイルストーン |

---

## 7. 横断比較まとめ

| 分野 | 「構想」相当 | 「開発・検証」相当 | 「量産/承認」相当 | 統合DB | 3D/モデルビジュアル |
|---|---|---|---|---|---|
| **建設（BIM）** | 基本設計・BIMモデリング | 施工図・現場管理 | 竣工・引渡し | ACC/Procore | BIM 3Dモデル（Revit/IFC） |
| **デジタルツイン** | コンセプト設計・エンジニアリングツイン | 試験・プロダクションツイン | 量産・サービスツイン | PLM/MES/IoT統合 | 製品デジタルツイン（1対1対応） |
| **航空宇宙（PLM）** | コンセプト設計 | 試験・検証フライト | 量産認定 | Teamcenter/Windchill | デジタルスレッド |
| **医薬品** | 化合物探索・前臨床 | Ph.I〜III臨床試験 | FDA承認 | eCTD/EDC統合DB | フェーズゲートダッシュボード |
| **食品/消費財** | レシピ・コンセプト | テスト販売 | 商品化 | Planviewポートフォリオハブ | 製品ポートフォリオカード |
| **半導体** | RTL設計 | DRC/LVS検証 | テープアウト | EDAデータベース | チップフロアプランビジュアル |
| **車両開発（SYNAPSE）** | 設計構想 | 実験・デザイン | 量産判定 | （将来統合） | クリッカブル3Dモデル |

---

## 8. SYNAPSEへの示唆

### SYNAPSEが束ねる「2つの価値」

他分野の実施例を横断的に分析すると、SYNAPSEは性質の異なる**2つの独立した価値**を同時に実現しようとしているシステムであることが浮かび上がる。

**(A) オブジェクト・アンカー型ナビゲーション**
成果物そのもの（クリッカブルな3Dモデル＋ヒートマップ）を、情報の入口かつ状態表示面として使う発想。「専門家でない人でも、モノを見れば状態が分かる」という**認知的民主化**が本体であり、エンジニア・デザイナー・経営層という認知レベルの異なる人々を同一画面で統合する。

**(B) ドメイン横断の状態統合（Single Source of Truth）**
設計・実験・デザインという、本来サイロ化した専門領域の進捗を一枚に束ねる**情報統合の価値**。各ドメインのDBと連携し、開発全体の状態を単一の真実として提供する。

この区別が重要なのは、他分野での「類似システム」が(A)(B)のどちらをどれだけ必要とするかで、SYNAPSEとの距離感が大きく変わるからである。**両方を高水準で必要とする分野は実はそれほど多くない**。

```
                    (B) ドメイン横断統合 の必要性
                         低                    高
                    ┌──────────────────┬──────────────────┐
               高   │  建設 / BIM      │  ★ SYNAPSE       │
  (A) オブジェクト  │  （3Dは強いが    │  航空宇宙 PLM     │
     アンカーの     │  施工1ドメイン中心）│  （両方高水準）  │
     必要性         ├──────────────────┼──────────────────┤
               低   │  半導体 EDA      │  医薬品 / 食品    │
                    │  （抽象的、      │  （統合は強いが   │
                    │  3Dアンカー不要）│  3Dアンカー弱）   │
                    └──────────────────┴──────────────────┘
```

「成果物が**物理オブジェクトとして明確に存在**し、かつ**複数の専門ドメインが並走する**」開発プロセスにおいてのみ、(A)(B)の両立が意味を持つ。これがSYNAPSEの構造的条件であり、同時に転用可能性の境界線でもある。

---

### 4つの機能原則（階層構造）

他分野の実装から抽出した4つの機能原則は、**独立した機能ではなく階層的に積み上がるアーキテクチャ**として理解する必要がある。

```
┌─────────────────────────────────────────────────────┐
│  ④ 予測リスク可視化  ← 出力層                       │
│     ①②③を統合することで初めて成立する              │
│     統合設計作業の連携を促す「議論の種」の見える化   │
├─────────────────────────────────────────────────────┤
│  ③ ゲートウェイ（デザインレビュー相当）← 判定層     │
│     各ドメインの相互作用を検証し                     │
│     Go/No-Go の判定根拠を構造化する                  │
├─────────────────────────────────────────────────────┤
│  ② デジタルスレッド  ← 接続層                       │
│     各ドメインDBと連携し                             │
│     データの流れ・トレーサビリティ・滞りを管理する   │
├─────────────────────────────────────────────────────┤
│  ① デジタルツイン   ← アンカー層                    │
│     開発者・デザイナー・経営層の合流点となる         │
│     物理とデジタルを繋ぐ視覚的・感覚的な基盤         │
└─────────────────────────────────────────────────────┘
```

---

### ① デジタルツイン — アンカー層

**参照事例：** McKinsey Digital Twin Framework、Siemens製造デジタルツイン、IndX × Tecnomatix

デジタルツインは、異なる専門領域の開発者・デザイナー・経営層が**視覚的・感覚的に合流できる共通の基準点（アンカー）**として機能する。3DモデルはCADデータそのものではなく、「現物の状態」と「開発の進捗」を同時に体現するインターフェースであり、現物・実験結果・設計変更をリアルタイムで反映することでデジタルとリアルを繋ぐ。

**SYNAPSEへの適用：** 現在のThree.js 3D Viewerはアンカー層の**プロトタイプ**として機能している。将来的には各パーツのCADデータ・実験結果・センサーデータと接続し、NV-2026の「リビングモデル」へ発展する。これが(A)オブジェクト・アンカー型ナビゲーションの技術的実体となる。

---

### ② デジタルスレッド — 接続層

**参照事例：** Siemens Teamcenter、航空宇宙PLM（デジタルスレッドアーキテクチャ）

デジタルスレッドは、フェーズをまたいでデータの連続性・トレーサビリティを確保する**データフロー管理機構**である。各ドメインのDB（設計CAD/実験計測システム/デザインレビュー記録）を接続し、変更の伝播・データの滞り・断絶箇所を検出・管理する。デジタルツインが「空間的アンカー」であるのに対し、デジタルスレッドは「時間的・データ的接続」を担う。

**SYNAPSEへの適用：** 現在フロントエンドで分離されているPARTS・MILESTONES・ISSUESのデータ構造を、将来バックエンドでデジタルスレッドとして統合する。これが(B)ドメイン横断統合の技術的基盤となる。

---

### ③ ゲートウェイ — 判定層

**参照事例：** FDA-TRACK CDER Dashboard（医薬品フェーズゲート）、AstraZeneca × FDA リアルタイム試験

ゲートウェイはデザインレビューに相当し、各フェーズの境界において**ドメイン間の相互作用を検証し、Go/No-Goの判定根拠を構造化する**機能を持つ。単なるマイルストーン通過の記録ではなく、「設計変更が実験結果に与えた影響」「デザイン要件と実験データの整合性」といったドメイン横断の依存関係を明示的に評価する場として機能する。

**SYNAPSEへの適用：** 現在のMILESTONESをフェーズゲートとして強化し、各ゲートにドメイン間整合条件（実験合格率・デザイン承認ステータス・設計変更影響スコア等）を紐付けることで、判定の根拠がデジタルスレッドを通じて自動的に集約される構造を実現する。

---

### ④ 予測リスク可視化 — 出力層

**参照事例：** Autodesk Construction Cloud Construction IQ、BIM × MLリスク検出

予測リスク可視化は、①②③の機能が統合されることで**初めて成立する出力層**である。デジタルツインが提供するアンカー（現状の空間的把握）、デジタルスレッドが蓄積するデータフロー（過去の変化パターン）、ゲートウェイが記録するドメイン間相互作用（判定履歴）——これら3層を束ねることで、「どのパーツが・どのドメイン間の連携において・どのタイミングでリスクを持つか」を統合設計作業の**議論の種**として見える化する。

**SYNAPSEへの適用：** 現在のISSUESデータは予測リスク可視化の萌芽である。将来的にはデジタルスレッドが蓄積する遅延パターン・ゲートウェイの判定履歴と組み合わせ、リスクスコアを3D Viewerのヒートマップに重ねて表示する。これは(A)(B)両方の価値が統合されたSYNAPSEの最終形に対応する。

---

## 参考リンク一覧

| 分野 | リソース名 | URL |
|---|---|---|
| 建設 | Autodesk Construction Cloud — Dashboards & Analytics | https://construction.autodesk.com/tools/dashboards-and-data-analytics/ |
| 建設 | Esri — From BIM to Dashboard（3D進捗可視化） | https://www.esri.com/arcgis-blog/products/arcgis-pro/3d-gis/from-bim-to-dashboard-building-a-3d-construction-progress-dashboard-with-arcgis |
| 建設 | Mace Group — ACC Enterprise Case Study | https://medium.com/autodesk-university/implementing-autodesk-construction-cloud-across-a-billion-dollar-business-cea171979b3e |
| デジタルツイン | McKinsey — Digital Twins: The Art of the Possible | https://www.mckinsey.com/capabilities/operations/our-insights/digital-twins-the-art-of-the-possible-in-product-development-and-beyond |
| デジタルツイン | McKinsey — Digital Twins in Manufacturing | https://www.mckinsey.com/industries/industrials/our-insights/digital-twins-the-key-to-smart-product-development |
| デジタルツイン | McKinsey — What is Digital Twin Technology | https://www.mckinsey.com/featured-insights/mckinsey-explainers/what-is-digital-twin-technology |
| デジタルツイン | McKinsey — Product Digital Twins（実績事例） | https://www.mckinsey.com/capabilities/operations/how-we-help-clients/product-development-procurement/product-digital-twins |
| 航空宇宙 | IndX × Siemens — Aerospace Manufacturing Digital Twin | https://www.indx.com/case-study/a-digital-twin-for-seamless-aerospace-manufacturing |
| 航空宇宙 | Siemens EDA — Fabless/Foundry Ecosystem | https://eda.sw.siemens.com/en-US/foundry-ecosystem-solutions/ |
| 医薬品 | FDA-TRACK CDER Dashboards（公式） | https://www.fda.gov/about-fda/fda-track-agency-wide-program-performance/fda-track-center-drug-evaluation-and-research-dashboards |
| 医薬品 | STAT News — FDA Real-Time Clinical Trials（2026） | https://www.statnews.com/2026/04/28/fda-clinical-trial-endpoints-real-time-drug-development/ |
| 食品/消費財 | Conagra Brands × Planview（公式事例） | https://www.planview.com/resources/case-study/conagra-brands-improve-efficiency-to-speed-global-product-delivery/ |
| 食品/消費財 | ABB × Planview（電気機器製造事例） | https://www.planview.com/resources/case-study/abb/ |
| 半導体 | TSMC EDA Alliance（公式） | https://www.tsmc.com/english/dedicatedFoundry/oip/eda_alliance |

---

*調査日：2026年6月 / 調査対象：建設・デジタルツイン・航空宇宙・医薬品・食品消費財・半導体の6分野*
