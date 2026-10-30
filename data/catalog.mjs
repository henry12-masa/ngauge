// 全製品(厳選)をひとつの配列にまとめる。
// seed生成(scripts/build-seed.mjs)と本番への同期(scripts/sync-remote.mjs)の両方がここを読む。
import train from "./kits-train.mjs";
import loco from "./kits-loco.mjs";
import updates from "./kits-updates.mjs";
import { loadRoster } from "./catalog/roster.mjs";

export const games = [...train, ...loco, ...updates].sort(
	(a, b) => a.released.localeCompare(b.released) || a.title.localeCompare(b.title, "ja"),
);

// メーカーの製品ページのURL(TOMIXは品番から、KATOは公式の一覧に載っているURL)
const roster = loadRoster();
for (const g of games) {
	const maker = g.maker.toLowerCase();
	const row = roster.find((r) => r.c === maker && r.item === g.model);
	g.officialUrl = maker === "tomix"
		? `https://www.tomytec.co.jp/tomix/products/n/${encodeURIComponent(g.model)}.html`
		: row?.src?.startsWith("kato:") ? `https://www.katomodels.com${row.src.slice(5)}` : "";
}

let keyCounter = 0;
const key = (prefix) => `${prefix}${(keyCounter++).toString(36)}`;

/** 本文を Portable Text のブロック配列にする。「## 」で始まる行は小見出し(h3)、空行で段落を区切る */
export function bodyToPortableText(slug, body) {
	const blocks = [];
	for (const chunk of body.trim().split(/\n\s*\n/)) {
		const para = [];
		for (const line of chunk.split("\n")) {
			if (line.startsWith("## ")) blocks.push({ style: "h3", text: line.slice(3).trim() });
			else para.push(line.trim());
		}
		if (para.join("")) blocks.push({ style: "normal", text: para.join("") });
	}
	return blocks.map((b, i) => ({
		_type: "block",
		_key: `${slug}-b${i}`,
		style: b.style,
		markDefs: [],
		children: [{ _type: "span", _key: key(`${slug}-s`), text: b.text, marks: [] }],
	}));
}
