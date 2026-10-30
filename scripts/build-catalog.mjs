// 全製品名簿(data/catalog/roster.mjs)を、サイトが読む形に分割して public/catalog-data/ に書き出す。
//   public/catalog-data/index.json            カテゴリごとの件数と年ごとの件数
//   public/catalog-data/<カテゴリ>/<年>.json  その年の製品 [[年月, 製品名, "メーカー 品番", 限定なら1, 厳選slug, KATOの出荷日なら1, TOMIXの再生産年月], ...]
//   年の分からない製品は <カテゴリ>/0.json にまとめる(ページでは「年不明」と表示)。
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { loadRoster } from "../data/catalog/roster.mjs";
import { games } from "../data/catalog.mjs";
import { GRADES } from "../data/taxonomies.mjs";

const raw = loadRoster();
// 名簿の更新日(日本時間)
const TODAY = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
const OUT = new URL("../public/catalog-data/", import.meta.url);
const MAKER = { kato: "KATO", tomix: "TOMIX" };

const ORDER = Object.keys(GRADES);
const SHORT = Object.fromEntries(Object.entries(GRADES).map(([k, v]) => [k, v.replace(/[(（].*$/, "").trim()]));

// 厳選製品の索引: メーカーと品番
const byItem = new Map(games.filter((g) => g.model).map((g) => [`${g.maker.toLowerCase()}:${g.model}`, g]));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const index = [];
let linked = 0;
for (const slug of ORDER) {
	const list = raw.filter((k) => k.s === slug).sort((a, b) => (a.d || "9999").localeCompare(b.d || "9999") || a.c.localeCompare(b.c) || a.n.localeCompare(b.n, "ja"));
	if (!list.length) continue;
	const byYear = new Map();
	for (const k of list) {
		const year = k.d ? k.d.slice(0, 4) : "0";
		const hit = byItem.get(`${k.c}:${k.item}`);
		const row = [k.d || "", k.n, `${MAKER[k.c]} ${k.item}`, k.l ? 1 : 0, hit ? hit.slug : "", k.ship ? 1 : 0, k.re || ""];
		if (hit) linked++;
		if (!byYear.has(year)) byYear.set(year, []);
		byYear.get(year).push(row);
	}
	mkdirSync(new URL(`${slug}/`, OUT), { recursive: true });
	const years = [];
	for (const [year, rows] of [...byYear].sort(([a], [b]) => (a === "0" ? 1 : b === "0" ? -1 : a.localeCompare(b)))) {
		writeFileSync(new URL(`${slug}/${year}.json`, OUT), JSON.stringify(rows));
		years.push([Number(year), rows.length]);
	}
	index.push({
		slug, label: GRADES[slug], short: SHORT[slug], count: list.length, dl: list.filter((k) => k.l).length,
		kato: list.filter((k) => k.c === "kato").length, tomix: list.filter((k) => k.c === "tomix").length, years,
	});
}
const total = index.reduce((n, p) => n + p.count, 0);
writeFileSync(new URL("index.json", OUT), JSON.stringify({ updated: TODAY, total, grades: index }));
console.log(`全製品名簿: ${total}件 / ${index.length}カテゴリ(厳選製品へのリンク ${linked}件 / 厳選${games.length}件)`);
