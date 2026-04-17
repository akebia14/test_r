# Rune Ruins (MVP)

スマホ縦画面向けの軽量ローグライトMVPです。探索・選択・半自動戦闘で5〜10分のランを遊べます。

## 起動方法

```bash
npm install
npm run dev
```

ビルド確認:

```bash
npm run build
```


## GitHub Pagesでの確認

GitHub Pages (Project Pages) で開けるように、`vite.config.ts` の `base` を相対パス (`./`) に設定しています。

- 例: `https://<user>.github.io/<repo>/`
- ローカル開発でも `npm run dev` で通常通り起動できます

デプロイ用成果物は次で生成できます。

```bash
npm run build
```

## プロジェクト構成

- `src/data/`: ゲームデータ定義（ルーン・遺物・呪い祝福・敵・マップ生成）
- `src/game/`: 戦闘ロジック、報酬抽選、ローカル保存、効果合成
- `src/App.tsx`: 画面遷移とゲームループ
- `src/styles.css`: スマホ縦画面向けの簡易UI

## 主要データ構造とロジック

- `UpgradeDef`: ルーン/遺物/呪い祝福を統一したデータ型。
- `Tag`: `rapid / guard / burst / risk / sync` のタグを各強化に付与。
- `applyUpgrades`: 所持強化を合算し、タグ3枚以上シナジーを反映。
- `generateMap`: 10マス+分岐の軽量マップをラン毎に生成。
- `tickCombat`: オート戦闘1フレーム分を進め、ダメージ計算・クリティカル・特殊効果を処理。

## MVPとして不足している点

- 演出は簡易（本格的なSE/アニメ/画像なし）。
- 敵AIはシンプルで、ボス行動は軽量な条件分岐のみ。
- バランス調整は初期値レベルで、長期プレイ前提のチューニング未実施。
- テストコードは未整備（手動プレイ前提）。

## 次に追加しやすい拡張候補

- マップ表示をノード可視化（線で接続表示）。
- ボスのフェーズ演出と固有スキル追加。
- イベントテキスト分岐の追加と選択式UI。
- セーブスロット、ラン履歴、実績。
- 多言語対応（i18n）やフォント調整。

## スマホ表示確認

- CSSを縦画面（`min(430px, 100vw)`）ベースで設計。
- タップしやすい大きめボタンを優先。
- 1プレイ通し（開始→分岐→戦闘→報酬→ボス→結果→再挑戦）で成立する構成。


### GitHub Actions で自動デプロイ（推奨）

このリポジトリには `.github/workflows/deploy-pages.yml` を用意してあります。

1. GitHub の `Settings > Pages` で **Build and deployment** の **Source** を `GitHub Actions` に変更
2. `main` ブランチへ push
3. Actions の `Deploy to GitHub Pages` が成功したら公開URLを開く

`base: "./"` と `dist` 配信の組み合わせにより、Project Pagesでもアセット参照が崩れにくくなります。
