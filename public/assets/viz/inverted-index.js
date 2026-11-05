// Inverted index construction, step by step (CS 121 Lecture 15 p16–23,
// Lecture 16 p9–11): tokenize each document into (term, docID) pairs, sort
// the pairs by term then docID, merge repeated entries into one dictionary
// entry with its document frequency and postings list. Postings can be
// plain docIDs, docID:count, or docID,position.
import { checkParams } from "./_core.js";

const MAX_DOCS = 5;
const MAX_TOKENS = 80;
const MAX_DOC_CHARS = 300;

export const meta = {
	name: "inverted-index",
	summary: "Inverted index construction: (term, docID) pairs → sort → dictionary with doc. frequency + postings (docIDs, counts or positions).",
	groupLabel: "phase",
	params: {
		docs: { type: "string", required: true, desc: "Documents separated by newlines, or by ; followed by the next docID:, each \"docID: text\" (docID a whole number). Tokens = runs of letters, digits and ', lowercased. At most 5 documents, 80 tokens in all." },
		postings: { type: "enum", values: ["docs", "counts", "positions"], default: "docs", desc: "What a posting stores: the docID (L15 p22), docID:count (L16 p10) or docID,position (L16 p11)." },
		lang: { type: "enum", values: ["en", "zh"], default: "en", desc: "Language of the messages and legend." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: {
		docs: "1: I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me. ; 2: So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious",
		postings: "docs"
	}
};

const TOKEN = /[\p{L}\p{N}][\p{L}\p{N}'’]*/gu;

function parseDocs(text) {
	const out = [];
	const parts = String(text).split(/\s*(?:;\s*(?=\d+\s*:)|\n+)\s*/).map(function(s) { return s.trim(); }).filter(Boolean);
	const seen = new Set();
	for (const p of parts) {
		const m = /^(\d+)\s*:\s*([\s\S]*)$/.exec(p);
		if (!m) return { error: "\"docs\": \"" + p.slice(0, 30) + "\" does not start with \"docID:\"" };
		const id = Number(m[1]);
		if (id > 99999) return { error: "\"docs\": docID " + m[1] + " is larger than 99999" };
		if (seen.has(id)) return { error: "\"docs\": docID " + id + " appears twice" };
		if (out.length && id < out[out.length - 1].id) return { error: "\"docs\": list documents in increasing docID order (" + out[out.length - 1].id + " then " + id + ")" };
		seen.add(id);
		const body = m[2].trim();
		if (body.length > MAX_DOC_CHARS) return { error: "\"docs\": document " + id + " is longer than " + MAX_DOC_CHARS + " characters" };
		const toks = (body.match(TOKEN) || []).map(function(t) { return t.toLowerCase(); });
		if (!toks.length) return { error: "\"docs\": document " + id + " has no tokens" };
		out.push({ id: id, text: body, tokens: toks });
	}
	return { docs: out };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const p = parseDocs(config.docs);
	if (p.error) return [p.error];
	if (!p.docs.length) return ["\"docs\" needs at least one document"];
	if (p.docs.length > MAX_DOCS) return ["\"docs\" has " + p.docs.length + " documents; at most " + MAX_DOCS];
	const n = p.docs.reduce(function(s, d) { return s + d.tokens.length; }, 0);
	if (n > MAX_TOKENS) return ["\"docs\" has " + n + " tokens in all; at most " + MAX_TOKENS];
	return [];
}

export const code = {
	python: [
		"def build_index(docs):",
		"    pairs = []  # tokenize, add_posting: helpers",
		"    for doc_id, text in docs:",
		"        for pos, t in enumerate(",
		"                tokenize(text), 1):",
		"            pairs.append((t, doc_id, pos))",
		"    pairs.sort()  # by term, then docID",
		"    index = {}",
		"    for t, doc_id, pos in pairs:",
		"        plist = index.setdefault(t, [])",
		"        # merge repeats in one doc",
		"        add_posting(plist, doc_id, pos)",
		"    df = {t: len(p) for t, p",
		"          in index.items()}",
		"    return index, df"
	]
};

const TEXT = {
	en: {
		legend: ["Just added / being merged", "Dictionary entry done", "Pairs already merged"],
		vars: ["doc", "pairs", "terms", "current term"],
		pairsHead: ["term", "docID", "pos"],
		dictHead: ["term", "doc. freq.", "postings"],
		caps: ["token sequence", "sorted", "dictionary → postings"],
		intro: function(n) { return "Index " + n + " document(s). Each document is tokenized (lowercased) into a token sequence; the indexer only ever sees (term, docID) pairs."; },
		doc: function(id, k, toks) { return "Document " + id + " → " + k + " (term, docID) pairs: " + toks + "."; },
		sort: function(n) { return "Sort all " + n + " pairs by term, then by docID. Equal terms are now next to each other, and each term's docIDs come out in increasing order — that is why postings end up sorted by docID."; },
		merge: function(term, df, plist, rows) { return "`" + term + "`: " + rows + " pair(s) merged into one entry — doc. freq. " + df + ", postings " + plist + "."; },
		done: function(terms, pairs) { return "Done: " + pairs + " pairs became " + terms + " dictionary entries (terms + counts) pointing at postings lists (lists of docIDs)."; }
	},
	zh: {
		legend: ["刚加入 / 正在合并", "词典条目已完成", "已合并的二元组"],
		vars: ["文档", "二元组", "词项数", "当前词项"],
		pairsHead: ["词项", "docID", "位置"],
		dictHead: ["词项", "文档频率", "postings"],
		caps: ["词条序列", "已排序", "词典 → postings"],
		intro: function(n) { return "为 " + n + " 篇文档建索引。每篇文档先分词（转小写）成词条序列；索引器看到的只是（词项, docID）二元组。"; },
		doc: function(id, k, toks) { return "文档 " + id + " → " + k + " 个（词项, docID）二元组：" + toks + "。"; },
		sort: function(n) { return "把全部 " + n + " 个二元组先按词项、再按 docID 排序。相同的词项挨在一起，每个词项的 docID 按递增顺序出现——这就是 postings 按 docID 有序的原因。"; },
		merge: function(term, df, plist, rows) { return "`" + term + "`：" + rows + " 个二元组合并成一个条目——文档频率 " + df + "，postings " + plist + "。"; },
		done: function(terms, pairs) { return "完成：" + pairs + " 个二元组变成 " + terms + " 个词典条目（词项 + 计数），各自指向一个 postings 列表（docID 列表）。"; }
	}
};

function T(config) { return TEXT[config && config.lang === "zh" ? "zh" : "en"]; }

export function legend(config) {
	const l = T(config).legend;
	return [
		{ cls: "is-cmp", label: l[0] },
		{ cls: "is-sorted", label: l[1] },
		{ cls: "is-min", label: l[2] }
	];
}

export const input = {
	key: "docs",
	label: "Documents",
	format: function(config) { return config.docs; },
	parse: function(text) {
		const p = parseDocs(text);
		if (p.error) return { error: p.error.replace("\"docs\"", "the documents") };
		return { value: String(text).trim() };
	}
};

function cmpPair(a, b) {
	if (a.term !== b.term) return a.term < b.term ? -1 : 1;
	if (a.doc !== b.doc) return a.doc - b.doc;
	return a.pos - b.pos;
}

function postingText(mode, p) {
	if (mode === "counts") return p.doc + ":" + p.count;
	if (mode === "positions") return p.positions.map(function(x) { return p.doc + "," + x; }).join(" ");
	return String(p.doc);
}

export function steps(config) {
	const t = T(config);
	const mode = config.postings || "docs";
	const docs = parseDocs(config.docs).docs;
	const frames = [];
	let pairs = [];
	let sorted = false;
	const dict = [];
	let mergedUpTo = 0;

	function push(f) {
		frames.push({
			group: f.group,
			lines: f.lines,
			msg: f.msg,
			final: !!f.final,
			mode: mode,
			pairs: pairs.slice(),
			hot: f.hot || [],
			merged: mergedUpTo,
			sorted: sorted,
			dict: dict.map(function(e) { return { term: e.term, df: e.postings.length, text: e.postings.map(function(p) { return postingText(mode, p); }) }; }),
			hotTerm: f.hotTerm || null,
			head: { pairs: t.pairsHead, dict: t.dictHead, caps: t.caps },
			vars: [
				[t.vars[0], f.doc != null ? String(f.doc) : "—"],
				[t.vars[1], String(pairs.length)],
				[t.vars[2], String(dict.length)],
				[t.vars[3], f.hotTerm || "—"]
			]
		});
	}

	push({ group: 0, lines: [1, 2], msg: t.intro(docs.length) });
	docs.forEach(function(d, k) {
		const start = pairs.length;
		d.tokens.forEach(function(tok, i) { pairs.push({ term: tok, doc: d.id, pos: i + 1 }); });
		const hot = [];
		for (let i = start; i < pairs.length; i++) hot.push(i);
		push({ group: k + 1, lines: [3, 4, 5, 6], doc: d.id, hot: hot, msg: t.doc(d.id, d.tokens.length, d.tokens.join(" ")) });
	});
	pairs.sort(cmpPair);
	sorted = true;
	const g = docs.length + 1;
	push({ group: g, lines: [7, 8], msg: t.sort(pairs.length) });

	let i = 0;
	while (i < pairs.length) {
		const term = pairs[i].term;
		const hot = [];
		const entry = { term: term, postings: [] };
		while (i < pairs.length && pairs[i].term === term) {
			const p = pairs[i];
			const last = entry.postings[entry.postings.length - 1];
			if (last && last.doc === p.doc) { last.count++; last.positions.push(p.pos); }
			else entry.postings.push({ doc: p.doc, count: 1, positions: [p.pos] });
			hot.push(i);
			i++;
		}
		dict.push(entry);
		push({ group: g + 1, lines: [9, 10, 11, 12], hot: hot, hotTerm: term,
			msg: t.merge(term, entry.postings.length, entry.postings.map(function(p) { return postingText(mode, p); }).join(" → "), hot.length) });
		mergedUpTo = i;
	}
	push({ group: g + 2, final: true, lines: [13, 14, 15], msg: t.done(dict.length, pairs.length) });
	return frames;
}

const STYLE = `
.vz-ii { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; justify-content: center; font: 0.76rem/1.25 "Consolas", "Menlo", monospace; }
.vz-ii-box { max-height: 26rem; overflow: auto; border: 1px solid var(--vz-border); border-radius: 0.3rem; }
.vz-ii table { border-collapse: collapse; }
.vz-ii th, .vz-ii td { border-bottom: 1px solid var(--vz-border); padding: 0.18rem 0.5rem; text-align: left; white-space: nowrap; }
.vz-ii thead th { position: sticky; top: 0; background: var(--vz-surface); font: 600 0.7rem/1.2 system-ui, sans-serif; color: var(--vz-muted); }
.vz-ii td.num { text-align: right; }
.vz-ii tr.is-cmp td { background: var(--vz-cmp-bg); }
.vz-ii tr.is-done td { background: var(--vz-min-bg); color: var(--vz-muted); }
.vz-ii tr.is-new td { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); }
.vz-ii-cap { font: 600 0.72rem/1.2 system-ui, sans-serif; color: var(--vz-muted); margin: 0 0 0.25rem; }
.vz-ii-post span { display: inline-block; border: 1px solid var(--vz-border); border-radius: 0.2rem; padding: 0 0.3rem; margin-right: 0.2rem; background: var(--vz-surface); }
`;

function ensureStyle() {
	if (document.getElementById("viz-inverted-index-style")) return;
	const s = document.createElement("style");
	s.id = "viz-inverted-index-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function esc(x) {
	return String(x).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

export function render(stage, frame) {
	ensureStyle();
	const showPos = frame.mode === "positions";
	let html = '<div class="vz-ii"><div><p class="vz-ii-cap">' + esc(frame.sorted ? frame.head.caps[1] : frame.head.caps[0]) + '</p><div class="vz-ii-box"><table><thead><tr><th>' +
		esc(frame.head.pairs[0]) + "</th><th>" + esc(frame.head.pairs[1]) + "</th>" + (showPos ? "<th>" + esc(frame.head.pairs[2]) + "</th>" : "") + "</tr></thead><tbody>";
	frame.pairs.forEach(function(p, k) {
		let cls = "";
		if (frame.hot.indexOf(k) >= 0) cls = "is-cmp";
		else if (frame.sorted && k < frame.merged) cls = "is-done";
		html += '<tr class="' + cls + '"><td>' + esc(p.term) + '</td><td class="num">' + p.doc + "</td>" + (showPos ? '<td class="num">' + p.pos + "</td>" : "") + "</tr>";
	});
	html += "</tbody></table></div></div>";
	if (frame.sorted) {
		html += '<div><p class="vz-ii-cap">' + esc(frame.head.caps[2]) + '</p><div class="vz-ii-box"><table><thead><tr><th>' + esc(frame.head.dict[0]) + "</th><th>" + esc(frame.head.dict[1]) + "</th><th>" + esc(frame.head.dict[2]) + "</th></tr></thead><tbody>";
		frame.dict.forEach(function(e) {
			const cls = e.term === frame.hotTerm ? "is-cmp" : "is-new";
			html += '<tr class="' + cls + '"><td>' + esc(e.term) + '</td><td class="num">' + e.df + '</td><td class="vz-ii-post">' +
				e.text.map(function(x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</td></tr>";
		});
		html += "</tbody></table></div></div>";
	}
	stage.innerHTML = html + "</div>";
}
