// 全製品名簿から製品名を探す: node scripts/find-kit.mjs <正規表現> [カテゴリ] [kato|tomix]
import { loadRoster } from "../data/catalog/roster.mjs";
const kits = loadRoster();
const [re, grade, maker] = process.argv.slice(2);
const r = new RegExp(re, "i");
for (const k of kits) if (r.test(k.n.normalize("NFKC")) && (!grade || k.s === grade) && (!maker || k.c === maker))
	console.log(`${k.d || "----"}${k.ship ? "出荷" : ""}\t${k.s}\t${k.l ? "限定\t" : "\t"}${k.c.toUpperCase()} ${k.item}\t${k.n}${k.re ? `\t再生産 ${k.re}` : ""}`);
