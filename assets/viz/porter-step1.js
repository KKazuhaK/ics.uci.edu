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
import { checkParams } from "./_core.js";

const MAX_WORDS = 12;
const VOWELS = "aeiouy";

export const meta = {
	name: "porter-step1",
	summary: "Porter stemmer Step 1a + 1b: which suffix rule fires for each word, and the word after each step.",
	groupLabel: "word",
	params: {
		words: { type: "string", required: true, desc: "Lower-case words, comma- or space-separated (at most 12)." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: {
		words: "stresses, gaps, gas, ties, cries, agreed, feed, fished, pirating, falling, dripping, hoping"
	}
};

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
function step1a(w) {
	if (w.endsWith("sses")) return { out: w.slice(0, -2), rule: "sses → ss", lines: [2, 3] };
	if (w.endsWith("ied") || w.endsWith("ies")) {
		const keep = w.length > 4 ? "i" : "ie";
		return { out: w.slice(0, -3) + keep, rule: (w.slice(-3)) + " → " + keep + (keep === "i" ? " (more than one letter before it)" : " (only one letter before it)"), lines: [4, 5, 6] };
	}
	if (w.endsWith("us") || w.endsWith("ss")) return { out: w, rule: "ends in " + w.slice(-2) + " → do nothing", lines: [7] };
	if (w.endsWith("s")) {
		if (hasVowel(w.slice(0, -2))) return { out: w.slice(0, -1), rule: "s deleted (a vowel appears before the letter before s)", lines: [8, 9] };
		return { out: w, rule: "s kept (no vowel before the letter before s)", lines: [8, 10] };
	}
	return { out: w, rule: "no 1a suffix", lines: [10] };
}

function tidy(s) {
	if (s.endsWith("at") || s.endsWith("bl") || s.endsWith("iz")) return { out: s + "e", why: "ends in " + s.slice(-2) + " → add e" };
	const n = s.length;
	if (n >= 2 && s[n - 1] === s[n - 2] && ["ll", "ss", "zz"].indexOf(s.slice(-2)) < 0) return { out: s.slice(0, -1), why: "double " + s[n - 1] + " → drop one" };
	if (isShort(s)) return { out: s + "e", why: "short word → add e" };
	return { out: s, why: "" };
}

function step1b(w) {
	for (const suf of ["eedly", "eed"]) {
		if (w.endsWith(suf)) {
			const inR1 = w.length - suf.length >= r1Start(w);
			return inR1
				? { out: w.slice(0, -suf.length) + "ee", rule: suf + " → ee (the suffix is in R1)", lines: [13, 14] }
				: { out: w, rule: suf + " kept (the suffix is not in R1)", lines: [13, 14] };
		}
	}
	for (const suf of ["ingly", "edly", "ing", "ed"]) {
		if (w.endsWith(suf)) {
			const s = w.slice(0, -suf.length);
			if (!hasVowel(s)) return { out: w, rule: suf + " kept (no vowel before it)", lines: [15, 16, 17, 19] };
			const t = tidy(s);
			return { out: t.out, rule: suf + " deleted" + (t.why ? ", then " + t.why : ""), lines: [15, 16, 17, 18] };
		}
	}
	return { out: w, rule: "no 1b suffix", lines: [19] };
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

export const legend = [
	{ cls: "is-cmp", label: "Word being stemmed" },
	{ cls: "is-swap", label: "Suffix removed / replaced" },
	{ cls: "is-sorted", label: "Finished" }
];

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
	const ws = splitWords(config.words);
	const results = [];
	const frames = [];
	function push(f) {
		frames.push({
			group: f.group,
			current: f.current === undefined ? -1 : f.current,
			mid: f.mid || null,
			cut: f.cut || null,
			results: results.slice(),
			lines: f.lines || [],
			msg: f.msg,
			vars: [["word", f.word || "—"], ["after 1a", f.a || "—"], ["after 1b", f.b || "—"], ["rule", f.rule || "—"]],
			words: ws
		});
	}
	push({ group: 0, msg: "Each step looks only at the end of the word and applies the rule for the longest suffix that fits. Step 1a handles plural -s endings, step 1b handles -ed / -ing." });
	ws.forEach(function(w, i) {
		const a = step1a(w);
		push({ group: i + 1, current: i, word: w, a: a.out, rule: a.rule, mid: a.out, cut: a.out !== w ? "a" : null, lines: a.lines,
			msg: "`" + w + "`, Step 1a: " + a.rule + " → `" + a.out + "`." });
		const b = step1b(a.out);
		results.push({ a: a.out, b: b.out });
		push({ group: i + 1, current: i, word: w, a: a.out, b: b.out, rule: b.rule, mid: a.out, cut: b.out !== a.out ? "b" : null, lines: b.lines,
			msg: "`" + a.out + "`, Step 1b: " + b.rule + " → `" + b.out + "`." });
	});
	push({ group: ws.length + 1, msg: "Done. These are only the first of the Porter stemmer's five steps — later steps keep stripping suffixes, and the output is a stem, not necessarily a word (L13 p21)." });
	return frames;
}

const STYLE = `
.vz-ps table { border-collapse: collapse; margin: 0 auto; font: 0.8rem/1.35 "Consolas", "Menlo", monospace; }
.vz-ps th, .vz-ps td { border: 1px solid var(--vz-border); padding: 0.28rem 0.6rem; text-align: left; }
.vz-ps thead th { font: 600 0.72rem/1.2 system-ui, sans-serif; color: var(--vz-muted); }
.vz-ps tr.is-cmp td { background: var(--vz-cmp-bg); }
.vz-ps tr.is-cmp td:first-child { box-shadow: inset 3px 0 0 var(--vz-cmp-bd); }
.vz-ps td.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); font-weight: 600; }
.vz-ps td.is-sorted { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); font-weight: 600; }
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
	let html = '<div class="vz-ps"><table><thead><tr><th>word</th><th>after 1a</th><th>after 1b</th></tr></thead><tbody>';
	frame.words.forEach(function(w, i) {
		const res = frame.results[i];
		const cur = i === frame.current;
		let a = "", b = "", ca = "is-empty", cb = "is-empty";
		if (res && !cur) { a = res.a; b = res.b; ca = res.a !== w ? "is-swap" : ""; cb = "is-sorted"; }
		if (cur) {
			a = frame.mid; ca = frame.cut === "a" ? "is-swap" : "";
			if (res) { b = res.b; cb = frame.cut === "b" ? "is-swap" : "is-sorted"; }
		}
		html += '<tr class="' + (cur ? "is-cmp" : "") + '"><td>' + esc(w) + '</td><td class="' + ca + '">' + esc(a || "·") + '</td><td class="' + cb + '">' + esc(b || "·") + "</td></tr>";
	});
	stage.innerHTML = html + "</tbody></table></div>";
}
