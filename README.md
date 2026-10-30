# 連ね継ぐ

新幹線からブルートレイン、私鉄の名車まで。いま走らせたいNゲージを、車種・鉄道会社・実車の年代で横断するキュレーションサイト。KATO・TOMIXの全製品名簿つき。

公開予定URL: https://ngauge.napoblog.com

[EmDash](https://github.com/emdash-cms/emdash)(Astro製CMS)で作り、Cloudflare Workers + D1 + R2 で動かします。姉妹サイト「遊び継ぐ」「組み継ぐ」「走り継ぐ」「操り継ぐ」と同じ作りです。コード上のコレクション名・タクソノミー名は共通で、`kits` が製品、`grade` がカテゴリ(車種)、`series` が鉄道会社、`era` が実車の年代です。

## ページ

| ページ | パス |
|---|---|
| トップ | `/` |
| 製品一覧(実車の年代・カテゴリ・鉄道会社・推し度で絞り込み) | `/kits` |
| 製品ページ | `/kits/:slug` |
| 年表(製品の発売年順) | `/timeline` |
| 車種ガイド | `/guide` |
| 全製品名簿(カテゴリ別・年別) | `/catalog`, `/catalog/:カテゴリ`, `/catalog/:カテゴリ/:年`(年不明は `/0`) |
| 特集 | `/posts`, `/posts/:slug` |
| 検索 | `/search` |
| このサイトについて | `/pages/about` |
| プライバシーポリシー | `/privacy` |

## データ

- 厳選製品は `data/kits-*.mjs` に `data/entry.mjs` の `k()` で書く。本文は「どんな製品/見どころ/実車の歩み/こんな人におすすめ」の4見出し
- 製品の内容は KATO・TOMIX 公式サイトの製品ページで、実車の事実は公式の製品解説と日本語版ウィキペディアで裏付けが取れることだけを書く
- 年代(`era`)は実車が登場した年(`k()` の realYear)で決まる。製品の発売年ではない
- 発売年月は `node scripts/check-years.mjs data/kits-*.mjs` で全製品名簿と照合する(メーカーと品番で探す)
- 名簿から製品を探す: `node scripts/find-kit.mjs <正規表現> [カテゴリ] [kato|tomix]`
- `node scripts/build-seed.mjs` で `seed/seed.json` を生成(seed は空のデータベースにだけ適用される)
- 公開中のサイトへの反映は `node scripts/sync-remote.mjs --url https://ngauge.napoblog.com`(先に `npx emdash login`)

## 全製品名簿

`data/catalog/roster.mjs` が次の資料を組み合わせて作る。`node scripts/build-catalog.mjs` で `public/catalog-data/` に書き出す。

1. TOMIX公式サイトが公開している全製品の一覧 `https://www.tomytec.co.jp/tomix/common/csv/products_list.csv`(UTF-8)。`node scripts/catalog/tomix.mjs` でNゲージの車両だけを `data/catalog/tomix-products.json` に保存する。発売月は初めて発売された月、再生産日も入っている
2. KATO公式サイトの製品情報検索 `https://www.katomodels.com/product?page=N`。`node scripts/catalog/kato.mjs` で全ページ(約100ページ、1ページ1秒)を `data/catalog/kato-list.json` に保存する
3. `data/catalog/additions.json`: どちらにもない製品を手で足す分

注意点:

- KATOの「出荷日」は、その品番のいちばん新しいロットの出荷日。再生産された製品は再生産の日になる(初出ではない)。名簿では「出荷」と表示して区別する。厳選に載せるKATOの製品は、製品ページの「製品出荷日」で初めての出荷だと確かめられるものにする
- KATOの「予定」の製品は、再生産待ちの既存品と新製品を見分けられないので名簿に載せない
- カテゴリは TOMIX が公式の小カテゴリ、KATO が品番の頭(20xx 蒸気機関車、30xx 電気機関車、70xx ディーゼル機関車、5xxx 客車、6xxx 気動車、8xxx 貨車)と製品名から決める(`categoryOf`)
- 線路・建物・パーツ・制御機器は載せない

## 開発とデプロイ

```bash
npm run dev      # http://localhost:4321(ローカルの初期データは /_emdash/api/setup/dev-bypass で入る)
npm run deploy   # astro build && wrangler deploy(手動デプロイ)
```

GitHub henry12-masa/ngauge の main への push で、Cloudflare Workers Builds が自動でビルド・デプロイする(プレビューのビルドは無効)。

公開: Workers「ngauge-curation」+ D1「ngauge-curation」+ R2「ngauge-curation-media」+ KV「ngauge-curation-session」。

`node_modules` は容量節約のため `game-curation\node_modules` へのジャンクション(依存は同じ)。

`src/layouts/Base.astro` の `google-site-verification` は Search Console の所有権確認用なので消さないでください。`src/lib/ads.ts` の広告ユニットは操り継ぐのものを仮に入れてあるので、公開前にこのサイト専用のユニットに替える。

当サイトはファンによる非公式のサイトで、KATO(関水金属)・TOMIX(トミーテック)・各鉄道会社とは関係ありません。
