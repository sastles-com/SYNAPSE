# SYNAPSE02 実装ガイド — 実装エージェント向け

**Document status:** 実装指示 v1.0（2026-07-06）
**読者:** synapse02 を実装する Claude（または開発者）
**読む順序:** ① `doc/loop/SYNAPSE_LoopArchitecture.md`（概念）→ ② `SYNAPSE02_Spec.md`（画面）→ ③ `SYNAPSE02_DataModel.md`（データ）→ ④ 本書（進め方）

---

## 1. リポジトリ構成方針

```
SYNAPSE/
├── doc/                  # 設計ドキュメント（既存）
│   ├── loop/             # ループアーキテクチャ正典
│   └── synapse02/        # 本仕様書一式
├── synapse/              # synapse01 = 4層スタック時代のポータル。凍結。触らない
└── synapse02/            # ★ 新規作成。ループ時代のポータル
```

- **synapse/ は変更禁止**（バグ修正含め本タスクでは触らない）。synapse01 と synapse02 の見比べ自体がデモ価値であるため、synapse01 は現状のまま保存する
- 同一ブランチ（main）で開発する。ブランチ分離はしない（両アプリを同時に起動して比較するため）
- synapse02 は synapse01 と独立した Vite プロジェクト（`package.json` も別）。コード共有はコピーで行い、モノレポ化（workspaces）はしない

## 2. 立ち上げ手順

```bash
cd /path/to/SYNAPSE
npm create vite@latest synapse02 -- --template react
cd synapse02
npm install
npm install three
```

- `vite.config.js` に `server: { port: 5174 }` を設定（synapse01 の 5173 と同時起動可能に）
- synapse01 が `base` 相対パス設定を持つ場合は同様に設定（デプロイ互換のため synapse01 の `vite.config.js` を必ず確認して揃える）

## 3. synapse01 流用マップ

| synapse01 のファイル | synapse02 での扱い |
|---|---|
| `src/components/Shared.jsx` | **コピーして拡張。** Bar/Pill/StatusPill/Card/CardTitle/Logo をそのまま使い、`Gauge`（staleness）/`ModeBar`（多峰分布積み上げ）/`TempStripe`（温度帯）を追加 |
| `src/components/Viewer3D.jsx` | **車両構築部分をコピー。** BoxGeometry/CylinderGeometry の手組みコード、`meshes[partId]` 管理、useRef 保持（threeRef/stateRef）、Raycaster 選択、マウス/ホイールの useEffect 登録——これらのパターンを変更せず流用。着色ロジックのみ synapse02 の4モード（分類/合意強度/staleness/温度）に差し替え |
| `src/data.js` | **構造パターンのみ参考。** `C` トークンをコピーして基調継承。データ本体は DataModel.md に従い新規作成 |
| `src/SynapsePortal.jsx` | **構造パターンのみ参考。** タブ switch＋ヘッダー構成を踏襲。synapse02 では週スライダー（グローバル時刻）が加わる |

**Viewer3D 流用時の注意（synapse01 の既知の設計判断）:**
- Three.js オブジェクトは React state に入れない。再レンダリングで WebGL コンテキストを作り直さないため useRef 保持は必須
- 着色は mesh の material を直接書き換える命令的操作。React state は UI 表示用に併存させる
- 色トークンは CSS 用 16進（`*_HEX`）と Three.js 用 0x 数値（`*_3JS`）を必ず両方定義し同期させる

## 4. コーディング規約（synapse01 準拠）

- 全スタイルはインライン `style` オブジェクト。CSSフレームワーク・CSSファイル追加は不可（Vite 標準の index.css 最小限を除く）
- 状態管理ライブラリなし。ルート（`Synapse02Portal.jsx`）が `active`（タブ）と `week`（シナリオ時刻）と `playing`（再生中フラグ）を持ち、props で配る
- 各タブコンポーネントは `data.js` を直接 import して読む（synapse01 と同じ流儀）
- コメント密度・命名・日本語ラベルの流儀は synapse01 の既存コードに合わせる

## 5. 実装マイルストーン

各マイルストーン完了時に `npm run dev` で目視確認してから次へ進むこと。

| M | 内容 | 完了条件 |
|---|---|---|
| M1 | Vite scaffold＋`data.js` 全定数（DataModel 準拠、16週分） | data.js が lint エラーなく import でき、主要定数の中身をコンソールで確認できる |
| M2 | ルート＋ヘッダー＋週スライダー＋タブ骨格（6タブ、中身はプレースホルダ） | タブ切替と週送り再生が動く |
| M3 | タブ0「ループ」: SVGループ図＋健全性7カード＋アクティビティフィード | 週送りで指標とフィードが変化する |
| M4 | タブ2「共通図」: 4サブビュー（用語集/分類/IDレジストリ/重大度）＋証明書ドロワー＋fossil | W9 で fossil が出現し、証明書の contextDiff が読める |
| M5 | タブ1「合意の回し方」: ラウンドステップ再生＋受容率ヒストグラム＋収束チャート | W3 のラウンドを1件ずつ再生でき、受容結果が右パネルの modes に反映される |
| M6 | タブ3「3Dアンカー」: Viewer3D 流用＋4着色モード＋部位クリック→ *w* パネル | 4モードが切り替わり週送りで着色が変化する |
| M7 | タブ4「焼きなまし」＋タブ5「答え合わせ」 | W11 の遅延警告、W14 の collapse、W6 乖離のトレースチェーンが表示される |
| M8 | 通し再生の物語検証＋受け入れ基準（Spec §7 の11項目）の全チェック＋`npm run build` | 11項目すべて合格 |

## 6. 完了時の後処理（必須）

1. `CLAUDE.md` に synapse02 のセクションを追加する:
   - コマンド（`cd synapse02 && npm run dev` / port 5174）
   - アーキテクチャ要点（週次スナップショット方式、`W_SNAPSHOTS`、dual naming 規約、synapse01 との関係=凍結・並置）
   - 「synapse/ は凍結。ループ関連の機能追加は synapse02/ へ」の明記
2. `doc/synapse02/` の3文書に実装時の逸脱があれば、逸脱内容を各文書末尾に「実装ノート」として追記する（仕様と実装の乖離を残さない）
3. コミットは機能単位（マイルストーン単位を推奨）。コミットメッセージは英語、本文に対応マイルストーン番号を記す

## 7. 判断に迷ったときの優先順位

1. **物語の一貫性 > 機能の網羅。** シナリオ（DataModel §6）が通しで読み取れることが最優先。実装が重い機能（例: 収束チャート）は簡略化してよいが、物語のイベント（W6乖離、W9 fossil、W14 collapse）は削らない
2. **synapse01 の流儀 > 一般的ベストプラクティス。** 二つのアプリの見た目・操作感が揃っていることがデモ価値
3. **平易な日本語 > CPC用語。** 迷ったら LoopArchitecture §9 の dual naming に従い、CPC用語を補足側に落とす
4. 仕様に書かれていない細部は実装者判断でよいが、**Spec §7 受け入れ基準11項目と衝突する判断は不可**

---

*v1.0 — 2026-07-06。仕様一式: Spec / DataModel / 本書。概念の正典は `doc/loop/SYNAPSE_LoopArchitecture.md`。*
