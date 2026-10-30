// TOMIX公式サイトが公開している全製品の一覧(products_list.csv、UTF-8)を取得して、Nゲージの車両だけを data/catalog/tomix-products.json に保存する。
// 1行の形: [品番, 商品名, 発売月 "YYYY/MM(/DD)", 再生産日, 小カテゴリ]
import { writeFileSync } from "node:fs";
const r = await fetch("https://www.tomytec.co.jp/tomix/common/csv/products_list.csv", { headers: { "User-Agent": "Mozilla/5.0 (personal fan site research)" } });
const t = (await r.text()).replace(/^﻿/, "");
const rows = [];
let row = [], f = "", q = false;
for (let i = 0; i < t.length; i++) {
	const c = t[i];
	if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
	else if (c === '"') q = true;
	else if (c === ",") { row.push(f); f = ""; }
	else if (c === "\n") { row.push(f.replace(/\r$/, "")); rows.push(row); row = []; f = ""; }
	else f += c;
}
const [head, ...data] = rows;
const col = (name) => head.findIndex((h) => h.replace(/\s|　/g, "") === name);
const [I, N, D, R, NH, BIG, SMALL] = ["品番", "商品名", "発売月", "再生産日", "N/HO", "大カテゴリ", "小カテゴリ"].map(col);
const out = data
	.filter((r) => r[I] && r[BIG] === "cat-carset" && r[NH].split(",").map((s) => s.trim()).includes("N"))
	.map((r) => [r[I].trim(), r[N].trim(), r[D].trim(), r[R].trim(), r[SMALL].trim()]);
writeFileSync(new URL("../../data/catalog/tomix-products.json", import.meta.url), JSON.stringify(out));
console.log(`TOMIX Nゲージ車両 ${out.length}件`);
