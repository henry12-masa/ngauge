// 厳選製品の発売年月を、全製品名簿(data/catalog/roster.mjs)と照合する。
// 使い方: node scripts/check-years.mjs data/kits-*.mjs
// 名簿の年月は TOMIX が公式の発売月、KATO が公式サイトの製品出荷日(再生産品は再生産の日)。
// KATOの製品は、出荷日が初めての出荷かどうかを名簿だけでは確かめられないので、製品ページの「製品出荷日」も見ること。
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { loadRoster } from "../data/catalog/roster.mjs";

const raw = loadRoster();
let bad = 0, miss = 0, ok = 0;
for (const file of process.argv.slice(2)) {
	const list = (await import(pathToFileURL(resolve(file)).href)).default;
	for (const kit of list) {
		const r = raw.find((x) => x.c === kit.maker.toLowerCase() && x.item === kit.model);
		if (!r) { miss++; console.log(`?? ${kit.slug} ${kit.maker} ${kit.model}「${kit.title}」名簿に見つからない`); continue; }
		if (r.d === kit.released) { ok++; continue; }
		bad++; console.log(`NG ${kit.slug} 掲載${kit.released} / 名簿 ${r.d || "年不明"} ${r.n} (${r.src})`);
	}
}
console.log(`一致 ${ok} / 年月が違う ${bad} / 名簿で見つからない ${miss}`);
