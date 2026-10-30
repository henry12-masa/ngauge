// 製品データの書き方。解説本文は4つの見出しで組み立てる。
export const SECTIONS = ["どんな製品", "見どころ", "実車の歩み", "こんな人におすすめ"];

/**
 * k(slug, 製品名, 品番, 発売"YYYY-MM", メーカー("KATO"|"TOMIX"), 鉄道会社(空白区切り), カテゴリ(空白区切り), 実車の登場年, 推し度, ひとこと紹介, 一言, [本文4段落], Amazon検索語?)
 * 発売年月は全製品名簿(data/catalog/roster.mjs)と scripts/check-years.mjs で照合する。
 * TOMIXは公式の発売月、KATOは公式サイトの出荷日(再生産品は再生産の月になるので、初めて出た製品だけを選ぶ)。
 */
export const k = (slug, title, model, released, maker, company, grade, realYear, tier, summary, note, parts, amazonQuery = "") => ({
	slug,
	title,
	model,
	maker,
	released,
	year: Number(released.slice(0, 4)),
	realYear,
	scale: `${maker} · ${grade.split(" ").includes("shinkansen") ? "1/160" : "1/150"}`,
	grades: grade.split(" "),
	series: company.split(" "),
	tier,
	summary,
	note,
	body: parts.map((text, i) => `## ${SECTIONS[i]}\n${text}`).join("\n\n"),
	amazonQuery,
});
