// 全製品名簿を組み立てる。build-catalog / check-years / find-kit が共通で使う。
//   tomix-products.json  TOMIX公式サイトの全製品一覧(products_list.csv)のNゲージ車両。発売月は初出の月(scripts/catalog/tomix.mjs)
//   kato-list.json       KATO公式サイトの製品情報検索の一覧。出荷日はいちばん新しいロットの日で、再生産品は再生産の日(scripts/catalog/kato.mjs)
//   additions.json       どちらにもない製品を手で足す分 [{n, d, s, c, item, src}]
// 1行の形: { n: 製品名, s: カテゴリslug, c: メーカー("kato"|"tomix"), d: "YYYY-MM" か "", ship: KATOの出荷日なら1, re: TOMIXの再生産年月, l: 限定品なら1, item: 品番, src: 出典 }
import { readFileSync, existsSync } from "node:fs";

const read = (name, fallback = []) => {
	const url = new URL(name, import.meta.url);
	return existsSync(url) ? JSON.parse(readFileSync(url, "utf8")) : fallback;
};

/** 私鉄・第三セクター・公営の事業者名(製品名にあれば私鉄に分ける) */
const PRIVATE = /私鉄|東急|小田急|京急|京浜急行|京成|西武|東武|京王|相鉄|相模鉄道|東京メトロ|営団|都営|東京都交通局|横浜市|横浜高速|みなとみらい|北総|新京成|千葉ニュータウン|つくばエクスプレス|首都圏新都市|りんかい|ゆりかもめ|モノレール|江ノ電|江ノ島|箱根|伊豆急|伊豆箱根|富士急|富士山麓|大井川|秩父|上信|上毛|銚子|小湊|いすみ|わたらせ|真岡|野岩|会津鉄道|長野電鉄|しなの鉄道|えちごトキめき|あいの風|IRいしかわ|ハピラインふくい|北越急行|富山|万葉線|福井鉄道|えちぜん|名鉄|名古屋鉄道|名古屋市|近鉄|近畿日本|南海|阪急|阪神|京阪|叡山|叡電|山陽電|神戸電鉄|北神|能勢|泉北|大阪市|大阪メトロ|Osaka Metro|京都市|嵐電|京福|北近畿|京都丹後|WILLER|智頭|若桜|一畑|水島|井原|土佐くろしお|ことでん|高松琴平|伊予鉄|広島電鉄|西鉄|西日本鉄道|筑豊|松浦|島原|くま川|肥薩おれんじ|南阿蘇|熊本電鉄|鹿児島市|長崎電気|札幌市|函館市|道南いさりび|青い森|IGR|三陸|ひたちなか|鹿島臨海|関東鉄道|流山|ゆいレール|阿武隈|山形鉄道|由利高原|秋田内陸|弘南|津軽鉄道|岳南|静岡鉄道|遠州|天竜浜名湖|豊橋|明知|長良川|樽見|養老|伊賀|三岐|伊勢鉄道|信楽|近江鉄道|北条|紀州|和歌山電鐵|水間|嵯峨野|名松|北陸鉄道|黒部峡谷|立山|アルピコ|上田電鉄|山万|リゾートライン|路面電車|LRT|ライトレール|宇都宮|芳賀|ユニトラム/;

/** 海外の鉄道 */
const OVERSEAS = /アルプス|レーティッシュ|RhB|SBB|ÖBB|ドイツ|スイス|フランス|イギリス|英国|BR\s?Class|Class\s?\d|クラス\d|ユーロスター|TGV|ICE\d?|タリス|アムトラック|Amtrak|ユニオン・パシフィック|UP\s?#|サザン・パシフィック|BNSF|サンタフェ|ビッグボーイ|EMD|SD70|台湾|台鐵|自強|普悠瑪|太魯閣|韓国|KTX|中国|タイ国鉄|インドネシア|マレーシア|チャージャー|\(N\)|Greenbrier|Zephyr|ミルウォーキー|ペンシルバニア|NYC|RDC|GS-4|FEF-3|カナダ|オーストラリア/;

const SHINKANSEN = /新幹線|ドクターイエロー|East i|ALFA-X|(^|[^\dA-Z])(0|100|200|300|400|500|700|800|E1|E2|E3|E4|E5|E6|E7|E8|W7|H5|N700S?|N700A|923|925|E926)(系|形)/;
const SL = /(^|[\s「(（<])(C\d{2}|D\d{2}|9600|8620|B6|E10|7100)(?![\dA-Z])|蒸気機関車|SL/;
const ELOC = /(^|[\s「(（<])E[DFHCB]\d{2,3}|電気機関車/;
const DLOC = /(^|[\s「(（<])(DD|DE|DF|DB|HD)\d{2,3}|ディーゼル機関車/;
const DMU = /キハ|キロ|キシ|キサシ|キクハ|キヤ|キクヤ|気動車|HC85|GV-E|YC1|DEC7|H100|ディーゼルカー|レールバス/;
const COACH = /客車|寝台|ブルートレイン|(^|[\s「(（<])(オハ|オロ|スハ|ナハ|マハ|マロ|マシ|オシ|スシ|スロ|オユ|スユ|マニ|カニ|オニ|スニ|オヤ|マヤ|スヤ|ナロ|ナシ|マイネ|マイテ|スイテ|オイ|スイ|マイ)[ネフテ]*\d|(^|[^\dA-Z-])(10|12|14|20|24|25|35|43|50|E26|77)系(?!.*(電車|気動車))|オリエントエクスプレス|カシオペア|トワイライトエクスプレス(?!.*瑞風)|北斗星|ななつ星|サロンカー/;
const FREIGHT = /貨車|(^|[\s「(（<])(コキ|コキフ|タキ|タム|ホキ|ワム|ワラ|ワキ|ワフ|トラ|トキ|チキ|ヨ|クム|シキ|ソ|ポム|ツム|レム|レサ|テム|テラ|セキ|セラ|ホサ|ホラ|ワサ)\d|コンテナ|貨物列車/;
const LIMITED = /特急|急行|スーパー|サンライズ|トワイライト|瑞風|四季島|リゾート|ジョイフル|お座敷|(^|[^\dA-Z-])(151|153|155|157|159|161|165|167|169|181|183|185|189|251|253|255|271|281|283|285|287|289|371|373|381|383|451|453|455|457|471|473|475|481|483|485|489|583|651|681|683|781|783|785|787|789|883|885|8000|8600|2000|N2000|2700|E001|E257|E259|E261|E351|E353|E653|E655|E657)系/;

const has = (re, n) => re.test(n.normalize("NFKC"));

/** 製品名からカテゴリを決める(TOMIXは公式の小カテゴリを優先する) */
export function categoryOf(name, maker, tomixCat = "", item = "") {
	const n = name.normalize("NFKC");
	if (maker === "kato" && /^(1\d{2}-|K\d)/.test(item)) return "overseas";
	if (/トーマス|チビ電|チビ客車|チビ凸|チビロコ|パト電|旅するNゲージ|スターターセット/.test(n)) return "other";
	const cats = tomixCat.split(",").map((s) => s.trim());
	if (maker === "tomix") {
		if (cats.includes("thomas")) return "other";
		if (cats.includes("sin")) return "shinkansen";
		if (cats.includes("pri")) return "private";
		if (has(OVERSEAS, n)) return "overseas";
		if (cats.includes("sloc")) return "sloc";
		if (cats.includes("eloc")) return "eloc";
		if (cats.includes("dloc")) return "dloc";
		if (cats.includes("kya")) return "coach";
		if (cats.includes("wag")) return "freight";
		if (cats.includes("di")) return "dmu";
		if (cats.includes("ele")) return has(LIMITED, n) ? "limited" : "emu";
	}
	if (has(OVERSEAS, n)) return "overseas";
	if (has(SHINKANSEN, n) && !/客車|寝台/.test(n)) return "shinkansen";
	if (has(PRIVATE, n)) return "private";
	// KATOの品番の頭: 20xx 蒸気機関車、30xx 電気機関車、70xx ディーゼル機関車、5xxx 客車、6xxx 気動車、8xxx 貨車
	const head = item.split("-")[0];
	if (maker === "kato") {
		if (/^20\d\d$/.test(head)) return "sloc";
		if (/^3[01]\d\d$/.test(head)) return "eloc";
		if (/^70\d\d$/.test(head)) return "dloc";
		if (/^5\d{3}$/.test(head)) return "coach";
		if (/^6\d{3}$/.test(head)) return "dmu";
		if (/^8\d{3}$/.test(head)) return "freight";
	}
	if (has(DMU, n)) return "dmu";
	if (has(COACH, n)) return "coach";
	if (has(FREIGHT, n) && !/電車/.test(n)) return "freight";
	if (has(SL, n)) return "sloc";
	if (has(DLOC, n)) return "dloc";
	if (has(ELOC, n)) return "eloc";
	if (has(LIMITED, n)) return "limited";
	return "emu";
}

/** 限定品(TOMIXの97xxxは特別企画品、KATOは名前に【特別企画品】などの表記) */
const isLimited = (maker, item, name) =>
	(maker === "tomix" && /^97\d{3}$/.test(item)) || /特別企画品|限定品|【限定】/.test(name) ? 1 : 0;

/** "2021/03/18" "2021年03月18日" → "2021-03" */
const ym = (s) => {
	const m = (s ?? "").match(/^(\d{4})[/年-](\d{1,2})/);
	return m ? `${m[1]}-${m[2].padStart(2, "0")}` : "";
};

/** KATOの一覧で、車両でないもの(線路・制御機器・建物・情景・パーツ・本) */
const KATO_NOT_A_CAR = /^(11|20|21|22|23|24|25|26|27|28|29|40|41|42|43|44|45|46|47|48|49|Z\d)-/;

function fromTomix() {
	return read("tomix-products.json").map(([item, name, released, reissue, cat]) => {
		const n = name.replace(/\s+/g, " ").trim();
		return {
			n, s: categoryOf(n, "tomix", cat, item), c: "tomix", d: ym(released), ship: 0, re: ym(reissue),
			l: isLimited("tomix", item, n), item, src: `tomix:${item}`,
		};
	});
}

function fromKato() {
	return read("kato-list.json")
		.filter((x) => x.kind === "n" && x.item && !KATO_NOT_A_CAR.test(x.item))
		.filter((x) => !/動力ユニット|動力台車|パーツ|ケース|ASSY|室内灯|カプラー|ガイドブック|サウンドカード|線路|レール(?!バス)/.test(x.name))
		.map((x) => {
			const n = x.name.replace(/\s*[(（]ホビーセンターカトー[^)）]*[)）]\s*/g, " ").replace(/\s+/g, " ").trim();
			return {
				n, s: categoryOf(n, "kato", "", x.item), c: "kato", d: /予定|調整中/.test(x.ship) ? "future" : ym(x.ship), ship: 1, re: "",
				hck: /ホビーセンターカトー/.test(x.name) ? 1 : 0,
				l: isLimited("kato", x.item, x.name), item: x.item, src: `kato:${x.url.replace("https://www.katomodels.com", "")}`,
			};
		});
}

let cache;
export function loadRoster() {
	if (cache) return cache;
	// 載せるのは先月発売分まで(今月の分は、公式の一覧に予定の品が混じるので月が明けてから載せる)
	const jst = new Date(Date.now() + 9 * 3600e3);
	const lastMonth = new Date(Date.UTC(jst.getUTCFullYear(), jst.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
	const out = [];
	const seen = new Set();
	for (const r of [...fromTomix(), ...fromKato(), ...read("additions.json").map((a) => ({ ship: 0, re: "", l: 0, ...a }))]) {
		const key = `${r.c}:${r.item}`;
		if (seen.has(key)) continue;
		seen.add(key);
		// まだ発売されていない製品は載せない(公式の一覧には予定の月も載る)。
		// KATOの「予定」には再生産待ちの既存品も混じるが、初めて出る製品と見分けられないので外す
		if (r.d === "future" || (r.d && r.d > lastMonth)) continue;
		out.push(r);
	}
	cache = out;
	return cache;
}
