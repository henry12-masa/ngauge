// KATO公式サイトの「製品情報検索」の一覧(全ページ)を取得して data/catalog/kato-list.json に保存する。1ページ1秒あける。
// 1行の形: { url, kind: "n"|"ho"|"p", name, item: 品番, ship: 出荷日の表記 }
// 出荷日は「いちばん新しいロットの出荷日」で、再生産品は再生産の日になっている(初出の日ではない)。
import { writeFileSync } from "node:fs";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dec = (s) => s.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'");
const out = [];
for (let p = 1; p <= 300; p++) {
	let s = "";
	for (let i = 0; i < 4; i++) {
		try { s = await (await fetch(`https://www.katomodels.com/product?page=${p}`, { headers: { "User-Agent": "Mozilla/5.0 (personal fan site research; 1 req/s)" } })).text(); break; }
		catch { await sleep(3000); }
	}
	const items = s.split("<li>").slice(1).map((b) => {
		const a = b.match(/<a href="(https:\/\/www\.katomodels\.com\/product\/([a-z]+)\/[^"]+)">([^<]+)<\/a>/);
		if (!a) return null;
		const day = b.match(/出荷日:\s*([^<]+)</);
		const name = dec(a[3]).trim();
		const m = name.match(/^(.*?)\s*\[([^\]]+)\]$/);
		return { url: a[1], kind: a[2], name: m ? m[1].trim() : name, item: m ? m[2].trim() : "", ship: day ? day[1].trim() : "" };
	}).filter(Boolean);
	if (!items.length) break;
	out.push(...items);
	await sleep(1000);
}
writeFileSync(new URL("../../data/catalog/kato-list.json", import.meta.url), JSON.stringify(out));
console.log(`KATO 製品 ${out.length}件`);
