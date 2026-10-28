// Porter stemmer, Step 1a and 1b only, as the CS 121 slide states them
// (Lecture 13 p22, the textbook's "Example step (1 of 5)"): for each word,
// find the rule for the longest applicable suffix and apply it.
//   1a: sses -> ss; ied/ies -> i (or ie if only one letter precedes);
//       us/ss -> unchanged; s deleted if the part before it has a vowel
//       not immediately before the s.
//   1b: eed/eedly -> ee if in R1 (after the first non-vowel that follows a
//       vowel); ed/edly/ing/ingly deleted if the part before has a vowel,
//       then: at/bl/iz -> add e; a double letter other than ll/ss/zz -> drop
//       one; a short word -> add e.
// Colours: a cell is purple when THAT step changed the word, plain when the
// step left it alone; the final stem (after 1b) is bold.
// `lang: "zh"` switches the messages, legend and headers to Chinese.
import { checkParams } from "./_core.js";

const MAX_WORDS = 12;
const VOWELS = "aeiouy";

export const meta = {
	name: "porter-step1",
	summary: "Porter stemmer Step 1a + 1b: which suffix rule fires for each word, and the word after each step.",
	groupLabel: "word",
	params: {
		words: { type: "string", required: true, desc: "Lower-case words, comma- or space-separated (at most 12)." },
		lang: { type: "enum", values: ["en", "zh"], default: "en", desc: "Language of the messages, legend and table headers." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: {
		words: "stresses, gaps, gas, ties, cries, agreed, feed, fished, pirating, falling, dripping, hoping"
	}
};

const TEXT = {
	en: {
		head: ["word", "after 1a", "after 1b"],
		vars: ["word", "after 1a", "after 1b", "rule"],
		legend: ["Word being stemmed", "Changed by this step", "Final stem (bold)"],
		intro: "Each step looks only at the end of the word and applies the rule for the longest suffix that fits. Step 1a handles plural -s endings, step 1b handles -ed / -ing. A purple cell means that step changed the word.",
		step: function(w, s, rule, out) { return "`" + w + "`, Step " + s + ": " + rule + " → `" + out + "`."; },
		done: "Done. These are only the first of the Porter stemmer's five steps — later steps keep stripping suffixes, and the output is a stem, not necessarily a word (L13 p21).",
		r: {
			sses: "sses → ss",
			iesI: function(suf) { return suf + " → i (more than one letter before it)"; },
			iesIe: function(suf) { return suf + " → ie (only one letter before it)"; },
			usss: function(suf) { return "ends in " + suf + " → do nothing"; },
			sDel: "s deleted (a vowel appears before the letter before s)",
			sKeep: "s kept (no vowel before the letter before s)",
			none1a: "no 1a suffix",
			eeYes: function(suf) { return suf + " → ee (the suffix is in R1)"; },
			eeNo: function(suf) { return suf + " kept (the suffix is not in R1)"; },
			noVowel: function(suf) { return suf + " kept (no vowel before it)"; },
			del: function(suf) { return suf + " deleted"; },
			then: ", then ",
			addE: function(end) { return "ends in " + end + " → add e"; },
			dbl: function(ch) { return "double " + ch + " → drop one"; },
			short: "short word → add e",
			none1b: "no 1b suffix"
		}
	},
	zh: {
		head: ["单词", "1a 之后", "1b 之后"],
		vars: ["单词", "1a 之后", "1b 之后", "规则"],
		legend: ["正在处理的词", "这一步改动了这个词", "最终词干（加粗）"],
		intro: "每一步只看词尾，执行适用的最长后缀所对应的规则。Step 1a 处理复数 -s 结尾，Step 1b 处理 -ed / -ing。紫色格子表示这一步改动了这个词。",
		step: function(w, s, rule, out) { return "`" + w + "`，Step " + s + "：" + rule + " → `" + out + "`。"; },
		done: "完成。这只是 Porter 词干提取器五个步骤中的第一步——后面的步骤还会继续去后缀，输出是词干，不一定是词（L13 p21）。",
		r: {
			sses: "sses → ss",
			iesI: function(suf) { return suf + " → i（前面多于一个字母）"; },
			iesIe: function(suf) { return suf + " → ie（前面只有一个字母）"; },
			usss: function(suf) { return "以 " + suf + " 结尾 → 不变"; },
			sDel: "删除 s（s 前面那个字母之前有元音）",
			sKeep: "保留 s（s 前面那个字母之前没有元音）",
			none1a: "没有 1a 后缀",
			eeYes: function(suf) { return suf + " → ee（后缀在 R1 中）"; },
			eeNo: function(suf) { return "保留 " + suf + "（后缀不在 R1 中）"; },
			noVowel: function(suf) { return "保留 " + suf + "（前面没有元音）"; },
			del: function(suf) { return "删除 " + suf; },
			then: "，然后",
			addE: function(end) { return "以 " + end + " 结尾 → 加 e"; },
			dbl: function(ch) { return "双写 " + ch + " → 去掉一个"; },
			short: "短词 → 加 e",
			none1b: "没有 1b 后缀"
		}
	}
};

function T(config) { return TEXT[config && config.lang === "zh" ? "zh" : "en"]; }

function splitWords(text) {
	return String(text).split(/[\s,]+/).map(function(s) { return s.trim(); }).filter(Boolean);
}

function hasVowel(s) { for (const c of s) if (VOWELS.indexOf(c) >= 0) return true; return false; }

function r1Start(w) {
	for (let i = 1; i < w.length; i++) if (VOWELS.indexOf(w[i]) < 0 && VOWELS.indexOf(w[i - 1]) >= 0) return i + 1;
	return w.length;
}

function isShort(s) {
	// a short stem: ends vowel + non-vowel and is at most 3 letters (hop, fil)
	return s.length >= 2 && s.length <= 3 && VOWELS.indexOf(s[s.length - 1]) < 0 && VOWELS.indexOf(s[s.length - 2]) >= 0;
}

// Returns { out, rule, lines }.
function step1a(w, r) {
	if (w.endsWith("sses")) return { out: w.slice(0, -2), rule: r.sses, lines: [2, 3] };
	if (w.endsWith("ied") || w.endsWith("ies")) {
		const keep = w.length > 4 ? "i" : "ie";
		return { out: w.slice(0, -3) + keep, rule: keep === "i" ? r.iesI(w.slice(-3)) : r.iesIe(w.slice(-3)), lines: [4, 5, 6] };
	}
	if (w.endsWith("us") || w.endsWith("ss")) return { out: w, rule: r.usss(w.slice(-2)), lines: [7] };
	if (w.endsWith("s")) {
		if (hasVowel(w.slice(0, -2))) return { out: w.slice(0, -1), rule: r.sDel, lines: [8, 9] };
		return { out: w, rule: r.sKeep, lines: [8, 10] };
	}
	return { out: w, rule: r.none1a, lines: [10] };
}

function tidy(s, r) {
	if (s.endsWith("at") || s.endsWith("bl") || s.endsWith("iz")) return { out: s + "e", why: r.addE(s.slice(-2)) };
	const n = s.length;
	if (n >= 2 && s[n - 1] === s[n - 2] && ["ll", "ss", "zz"].indexOf(s.slice(-2)) < 0) return { out: s.slice(0, -1), why: r.dbl(s[n - 1]) };
	if (isShort(s)) return { out: s + "e", why: r.short };
	return { out: s, why: "" };
}

function step1b(w, r) {
	for (const suf of ["eedly", "eed"]) {
		if (w.endsWith(suf)) {
			const inR1 = w.length - suf.length >= r1Start(w);
			return inR1
				? { out: w.slice(0, -suf.length) + "ee", rule: r.eeYes(suf), lines: [13, 14] }
				: { out: w, rule: r.eeNo(suf), lines: [13, 14] };
		}
	}
	for (const suf of ["ingly", "edly", "ing", "ed"]) {
		if (w.endsWith(suf)) {
			const s = w.slice(0, -suf.length);
			if (!hasVowel(s)) return { out: w, rule: r.noVowel(suf), lines: [15, 16, 17, 19] };
			const t = tidy(s, r);
			return { out: t.out, rule: r.del(suf) + (t.why ? r.then + t.why : ""), lines: [15, 16, 17, 18] };
		}
	}
	return { out: w, rule: r.none1b, lines: [19] };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const ws = splitWords(config.words);
	if (!ws.length) errors.push("\"words\" needs at least one word");
	if (ws.length > MAX_WORDS) errors.push("\"words\" has " + ws.length + " words; at most " + MAX_WORDS);
	for (const w of ws) {
		if (!/^[a-z]+$/.test(w)) errors.push("\"words\": \"" + w + "\" must be lower-case letters a–z only");
		else if (w.length > 20) errors.push("\"words\": \"" + w + "\" is longer than 20 letters");
	}
	return errors;
}

export const code = {
	python: [
		"def step1a(w):",
		"    if w.endswith(\"sses\"):",
		"        return w[:-2]",
		"    if w.endswith((\"ied\", \"ies\")):",
		"        keep = \"i\" if len(w) > 4 else \"ie\"",
		"        return w[:-3] + keep",
		"    if w.endswith((\"us\", \"ss\")): return w",
		"    if w.endswith(\"s\") and vowel_in(w[:-2]):",
		"        return w[:-1]",
		"    return w",
		"",
		"def step1b(w):",
		"    if w.endswith((\"eedly\", \"eed\")):",
		"        return to_ee(w) if in_r1(w) else w",
		"    for suf in (\"ingly\", \"edly\", \"ing\", \"ed\"):",
		"        stem = w[:-len(suf)]",
		"        if w.endswith(suf) and vowel_in(stem):",
		"            return tidy(stem)",
		"    return w"
	]
};

export function legend(config) {
	const l = T(config).legend;
	return [
		{ cls: "is-cmp", label: l[0] },
		{ cls: "is-swap", label: l[1] },
		{ cls: "", label: l[2] }
	];
}

export const input = {
	key: "words",
	label: "Words",
	format: function(config) { return config.words; },
	parse: function(text) {
		const ws = splitWords(String(text).toLowerCase());
		if (!ws.length) return { error: "type a few words, e.g. caresses, ponies, hopping" };
		if (ws.length > MAX_WORDS) return { error: "at most " + MAX_WORDS + " words" };
		for (const w of ws) if (!/^[a-z]+$/.test(w)) return { error: "\"" + w + "\": letters a–z only" };
		return { value: ws.join(", ") };
	},
	random: function() {
		const pool = ["caresses", "ponies", "ties", "cats", "gas", "bus", "hopping", "hoped", "agreed", "feed", "luxuriating", "troubled",
			"sized", "fizzed", "falling", "filing", "proceedings", "bleed", "crying", "pies", "mess", "dresses", "planned"];
		const out = [];
		while (out.length < 5) { const p = pool[Math.floor(Math.random() * pool.length)]; if (!out.includes(p)) out.push(p); }
		return out.join(", ");
	}
};

export function steps(config) {
	const t = T(config);
	const ws = splitWords(config.words);
	const results = [];
	const frames = [];
	function push(f) {
		frames.push({
			group: f.group,
			current: f.current === undefined ? -1 : f.current,
			mid: f.mid || null,
			stage: f.stage || null,
			results: results.slice(),
			lines: f.lines || [],
			msg: f.msg,
			vars: [[t.vars[0], f.word || "—"], [t.vars[1], f.a || "—"], [t.vars[2], f.b || "—"], [t.vars[3], f.rule || "—"]],
			words: ws,
			head: t.head
		});
	}
	push({ group: 0, msg: t.intro });
	ws.forEach(function(w, i) {
		const a = step1a(w, t.r);
		push({ group: i + 1, current: i, stage: "a", word: w, a: a.out, rule: a.rule, mid: a.out, lines: a.lines,
			msg: t.step(w, "1a", a.rule, a.out) });
		const b = step1b(a.out, t.r);
		results.push({ a: a.out, b: b.out });
		push({ group: i + 1, current: i, stage: "b", word: w, a: a.out, b: b.out, rule: b.rule, mid: a.out, lines: b.lines,
			msg: t.step(a.out, "1b", b.rule, b.out) });
	});
	push({ group: ws.length + 1, msg: t.done });
	return frames;
}

const STYLE = `
.vz-ps table { border-collapse: collapse; margin: 0 auto; font: 0.8rem/1.35 "Consolas", "Menlo", monospace; }
.vz-ps th, .vz-ps td { border: 1px solid var(--vz-border); padding: 0.28rem 0.6rem; text-align: left; }
.vz-ps thead th { font: 600 0.72rem/1.2 system-ui, sans-serif; color: var(--vz-muted); }
.vz-ps tr.is-cmp td { background: var(--vz-cmp-bg); }
.vz-ps tr.is-cmp td:first-child { box-shadow: inset 3px 0 0 var(--vz-cmp-bd); }
.vz-ps td.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); }
.vz-ps td.is-final { font-weight: 700; }
.vz-ps td.is-empty { color: var(--vz-muted); }
`;

function ensureStyle() {
	if (document.getElementById("viz-porter-step1-style")) return;
	const s = document.createElement("style");
	s.id = "viz-porter-step1-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function esc(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

export function render(stage, frame) {
	ensureStyle();
	let html = '<div class="vz-ps"><table><thead><tr>' + frame.head.map(function(h) { return "<th>" + esc(h) + "</th>"; }).join("") + "</tr></thead><tbody>";
	frame.words.forEach(function(w, i) {
		const res = frame.results[i];
		const cur = i === frame.current;
		let a = "", b = "", ca = "is-empty", cb = "is-empty";
		if (res) {
			// both steps done for this word (also the current word at its 1b frame)
			a = res.a; b = res.b;
			ca = res.a !== w ? "is-swap" : "";
			cb = (res.b !== res.a ? "is-swap " : "") + "is-final";
		} else if (cur) {
			// current word, only 1a done so far
			a = frame.mid; ca = frame.mid !== w ? "is-swap" : "";
		}
		html += '<tr class="' + (cur ? "is-cmp" : "") + '"><td>' + esc(w) + '</td><td class="' + ca + '">' + esc(a || "·") + '</td><td class="' + cb + '">' + esc(b || "·") + "</td></tr>";
	});
	stage.innerHTML = html + "</tbody></table></div>";
}
