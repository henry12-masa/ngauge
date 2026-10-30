// 年代・カテゴリ・鉄道会社・推し度の定義。seed/seed.json は scripts/build-seed.mjs がここから生成する。
// 内部のタクソノミー名は grade = カテゴリ(車種)、series = 鉄道会社(姉妹サイトと共通のコードを使うため)。

// 年代は「実車が登場した年」で判定する(from〜to を含む)。製品の発売年ではない
export const ERAS = [
	{ slug: "steam", label: "蒸気の時代(〜1955)", short: "蒸気", from: 1800, to: 1955,
		lead: "D51、C62、C57。蒸気機関車が客車や貨車を引いて、日本じゅうの線路を走っていた時代の車両。" },
	{ slug: "jnr-golden", label: "国鉄の黄金期(1956〜1975)", short: "黄金期", from: 1956, to: 1975,
		lead: "151系「こだま」、0系新幹線、485系、EF65、20系ブルートレイン。電化と高速化で、国鉄の車両がいちばん華やかだった時代。" },
	{ slug: "jnr-late", label: "国鉄の晩年(1976〜1986)", short: "国鉄晩年", from: 1976, to: 1986,
		lead: "185系、117系、キハ40、EF66のブルートレイン牽引。国鉄が分割民営化を迎えるまでの車両。" },
	{ slug: "jr-dawn", label: "JRの誕生(1987〜1999)", short: "JR誕生", from: 1987, to: 1999,
		lead: "JR各社が個性を競った時代。300系「のぞみ」、500系、783系、E351系、285系「サンライズエクスプレス」が生まれた。" },
	{ slug: "modern", label: "21世紀の車両(2000〜2014)", short: "21世紀", from: 2000, to: 2014,
		lead: "E231系、E233系、N700系、E5系、885系。いま主力として走る車両の多くが、この時代に登場した。" },
	{ slug: "now", label: "最新の車両(2015〜)", short: "最新", from: 2015, to: 2100,
		lead: "E7系、N700S、E353系、HC85系、ハイブリッドや蓄電池の電車。いまの線路を走る新しい顔ぶれ。" },
];

// カテゴリ(車種)
export const GRADES = {
	shinkansen: "新幹線",
	limited: "特急・急行形電車",
	emu: "通勤・近郊形電車",
	dmu: "気動車",
	eloc: "電気機関車",
	dloc: "ディーゼル機関車",
	sloc: "蒸気機関車",
	coach: "客車・寝台列車",
	freight: "貨車",
	private: "私鉄・第三セクター",
	overseas: "海外の鉄道",
	other: "その他(入門セット・チビ電など)",
};

// 鉄道会社(実車の持ち主)
export const SERIES = {
	jnr: "国鉄",
	jrh: "JR北海道",
	jre: "JR東日本",
	jrc: "JR東海",
	jrw: "JR西日本",
	jrs: "JR四国",
	jrk: "JR九州",
	jrf: "JR貨物",
	private: "私鉄・第三セクター",
	overseas: "海外",
};

export const TIERS = {
	essential: "定番",
	recommended: "推し",
	deep: "通好み",
};

export function eraForYear(year) {
	return ERAS.find((e) => year >= e.from && year <= e.to);
}
