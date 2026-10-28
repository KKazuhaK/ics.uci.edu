// Simhash, step by step (CS 121 Lecture 12 p7–18, Charikar 2002):
// 1. words weighted by frequency, 2. a b-bit hash per word, 3. for every
// word, add its weight to V[i] where hash bit i is 1 and subtract it where
// the bit is 0, 4. fingerprint bit i = 1 if V[i] > 0. Optionally a second
// text B: similarity = fraction of the n bits that agree, compared with tau.
// The default is the slide's example with the slide's own 8-bit hashes;
// without `hashes`, a demo hash (FNV-1a, top b bits) is used.
import { checkParams } from "./_core.js";

const MAX_WORDS = 16;

const SLIDE_TEXT = "Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species.";
const SLIDE_STOP = "in, the, and";
const SLIDE_HASHES = "tropical 01100001, fish 10101011, include 11100110, found 00011110, environments 00101101, around 10001011, world 00101010, including 11000000, both 10101110, freshwater 00111111, salt 10110101, water 00100101, species 11101110";

export const meta = {
	name: "simhash",
	summary: "Simhash: word weights × hash bits → column sums V → fingerprint bit = 1 if V[i] > 0; optional text B: fraction of equal bits vs τ.",
	groupLabel: "word",
	params: {
		text: { type: "string", default: SLIDE_TEXT, desc: "Document A. Lower-cased, punctuation dropped; ≤ 16 distinct words after stopwords." },
		stopwords: { type: "string", desc: "Words to drop, comma-separated. Default: \"in, the, and\" for the slide's text (the slide's word list leaves them out), else none." },
		hashes: { type: "string", desc: "\"word bits, word bits, …\" — one b-bit hash per word (all the same length, 4–16 bits). Omit: the slide's 8-bit values for the slide's text, else a demo hash." },
		bits: { type: "int", default: 8, min: 4, max: 16, desc: "b, the fingerprint size, when the demo hash is used." },
		textB: { type: "string", desc: "Optional document B to compare with (its words need hashes too, if \"hashes\" is given)." },
		tau: { type: "int", default: 90, min: 1, max: 100, desc: "Threshold τ in percent: S ≥ τ ⇒ near duplicates." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: { text: SLIDE_TEXT }
};

function tokens(text) {
	return String(text).replace(/<[^>]*>/g, " ").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function splitList(text) {
	return String(text).split(/[,;\n]+/).map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);
}

// Words with weights (frequency), in order of first appearance.
function weigh(text, stop) {
	const stopSet = new Set(stop);
	const order = [];
	const w = new Map();
	for (const t of tokens(text)) {
		if (stopSet.has(t)) continue;
		if (!w.has(t)) { w.set(t, 0); order.push(t); }
		w.set(t, w.get(t) + 1);
	}
	return order.map(function(t) { return { word: t, weight: w.get(t) }; });
}

function parseHashes(text) {
	const map = new Map();
	let len = null;
	for (const item of splitList(text)) {
		const m = /^(\S+)\s*[: ]\s*([01]+)$/.exec(item);
		if (!m) return { error: "\"hashes\": \"" + item + "\" is not \"word 0101…\"" };
		if (m[2].length < 4 || m[2].length > 16) return { error: "\"hashes\": \"" + m[1] + "\" has " + m[2].length + " bits; use 4–16" };
		if (len !== null && m[2].length !== len) return { error: "\"hashes\": all hashes need the same length (" + len + " bits); \"" + m[1] + "\" has " + m[2].length };
		len = m[2].length;
		map.set(m[1], m[2]);
	}
	if (!map.size) return { error: "\"hashes\" is empty" };
	return { map: map, bits: len };
}

// FNV-1a 32-bit, top b bits — a stand-in when no hashes are given.
function demoHash(word, b) {
	let h = 0x811c9dc5;
	for (const x of new TextEncoder().encode(word)) {
		h ^= x;
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	let s = h.toString(2);
	while (s.length < 32) s = "0" + s;
	return s.slice(0, b);
}

function isSlide(config) {
	return config.text === undefined || config.text.trim() === SLIDE_TEXT;
}

function cfg(config) {
	const slide = isSlide(config);
	return {
		text: config.text === undefined ? SLIDE_TEXT : config.text,
		stop: splitList(config.stopwords !== undefined ? config.stopwords : (slide ? SLIDE_STOP : "")),
		hashes: config.hashes !== undefined ? config.hashes : (slide && config.textB === undefined ? SLIDE_HASHES : undefined),
		bits: config.bits === undefined ? 8 : config.bits,
		textB: config.textB,
		tau: config.tau === undefined ? 90 : config.tau
	};
}

function build(c, text, label) {
	const ws = weigh(text, c.stop);
	if (!ws.length) return { error: "\"" + label + "\" has no words left after the stopwords" };
	if (ws.length > MAX_WORDS) return { error: "\"" + label + "\" has " + ws.length + " distinct words; at most " + MAX_WORDS };
	let b = c.bits;
	let map = null;
	if (c.hashes !== undefined) {
		const p = parseHashes(c.hashes);
		if (p.error) return { error: p.error };
		map = p.map;
		b = p.bits;
		const missing = ws.filter(function(w) { return !map.has(w.word); }).map(function(w) { return w.word; });
		if (missing.length) return { error: "\"hashes\" has no hash for " + missing.map(function(m) { return "\"" + m + "\""; }).join(", ") + " (from \"" + label + "\")" };
	}
	ws.forEach(function(w) { w.hash = map ? map.get(w.word) : demoHash(w.word, b); });
	return { words: ws, b: b, given: !!map };
}

function simhash(words, b) {
	const v = new Array(b).fill(0);
	for (const w of words) for (let i = 0; i < b; i++) v[i] += w.hash[i] === "1" ? w.weight : -w.weight;
	return { v: v, fp: v.map(function(x) { return x > 0 ? "1" : "0"; }).join("") };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const c = cfg(config);
	const A = build(c, c.text, "text");
	if (A.error) return [A.error];
	if (c.textB !== undefined) {
		const B = build(c, c.textB, "textB");
		if (B.error) errors.push(B.error);
	}
	return errors;
}

export const code = {
	python: [
		"from collections import Counter",
		"",
		"def simhash(words, h, b=8):",
		"    weights = Counter(words)  # word -> freq",
		"    v = [0] * b",
		"    for w, wt in weights.items():",
		"        bits = h(w)           # b-bit string",
		"        for i in range(b):",
		"            if bits[i] == \"1\":",
		"                v[i] += wt",
		"            else:",
		"                v[i] -= wt",
		"    return \"\".join(\"1\" if x > 0 else \"0\"",
		"                   for x in v)",
		"",
		"def similarity(ha, hb):",
		"    same = sum(a == b for a, b in zip(ha, hb))",
		"    return same / len(ha)"
	]
};

export const legend = [
	{ cls: "is-cmp", label: "Word being added" },
	{ cls: "is-sorted", label: "+weight (bit 1) / bit 1 in the fingerprint" },
	{ cls: "is-min", label: "−weight (bit 0) / bits that differ" }
];

export const input = {
	key: "text",
	label: "Text A",
	format: function(config) { return config.text === undefined ? SLIDE_TEXT : config.text; },
	parse: function(text) {
		if (!tokens(text).length) return { error: "type some words" };
		return { value: String(text).trim() };
	}
};

function signed(x) { return x > 0 ? "+" + x : String(x); }

export function steps(config) {
	const c = cfg(config);
	const A = build(c, c.text, "text");
	const b = A.b;
	const frames = [];
	const v = new Array(b).fill(0);
	function push(f) {
		frames.push({
			group: f.group,
			phase: f.phase,
			words: A.words,
			b: b,
			upto: f.upto === undefined ? -1 : f.upto,
			cur: f.cur === undefined ? -1 : f.cur,
			v: f.v || null,
			fp: f.fp || null,
			col: f.col === undefined ? -1 : f.col,
			B: f.B || null,
			final: !!f.final,
			lines: f.lines || [],
			msg: f.msg,
			vars: f.vars || []
		});
	}
	const wlist = A.words.map(function(w) { return w.word + " " + w.weight; }).join(", ");
	push({ group: 0, phase: 1, lines: [4], msg: "Step 1: features = words weighted by their frequency" + (c.stop.length ? " (dropped: " + c.stop.join(", ") + ")" : "") + ": " + wlist + ".",
		vars: [["words", String(A.words.length)]] });
	push({ group: 0, phase: 2, lines: [7], msg: "Step 2: a " + b + "-bit hash value per word (" + (A.given ? "the slide's values" : "demo hash: FNV-1a, top " + b + " bits — not the slide's") + "). Each bit becomes +weight (1) or −weight (0).",
		vars: [["words", String(A.words.length)], ["b", String(b)]] });
	A.words.forEach(function(w, k) {
		for (let i = 0; i < b; i++) v[i] += w.hash[i] === "1" ? w.weight : -w.weight;
		push({ group: 1, phase: 3, upto: k, cur: k, v: v.slice(), lines: [6, 7, 8, 9, 10, 11, 12],
			msg: "Step 3: `" + w.word + "` (weight " + w.weight + ", hash " + w.hash + ") adds " + w.hash.split("").map(function(x) { return x === "1" ? "+" + w.weight : "−" + w.weight; }).join(" ") + ". V = " + v.join(" ") + ".",
			vars: [["word", w.word], ["wt", String(w.weight)], ["bits", w.hash], ["V", v.join(" ")]] });
	});
	const lastCol = b - 1;
	const terms = A.words.map(function(w) { return w.hash[lastCol] === "1" ? w.weight : -w.weight; });
	push({ group: 2, phase: 3, upto: A.words.length - 1, v: v.slice(), col: lastCol, lines: [8, 9, 10, 11, 12],
		msg: "Check one column, bit " + b + ": " + v[lastCol] + " = " + terms.map(function(t, i) { return (i === 0 ? String(t) : (t > 0 ? "+ " + t : "− " + (-t))); }).join(" ") + ".",
		vars: [["V", v.join(" ")]] });
	const fp = v.map(function(x) { return x > 0 ? "1" : "0"; }).join("");
	push({ group: 2, phase: 4, upto: A.words.length - 1, v: v.slice(), fp: fp, lines: [13, 14], final: c.textB === undefined,
		msg: "Step 4: bit i = 1 if V[i] > 0, else 0. V = " + v.join(" ") + " → " + b + "-bit fingerprint " + fp + ".",
		vars: [["V", v.join(" ")], ["fingerprint", fp]] });
	if (c.textB !== undefined) {
		const B = build(c, c.textB, "textB");
		const hb = simhash(B.words, b);
		const same = fp.split("").filter(function(x, i) { return x === hb.fp[i]; }).length;
		const S = same / b;
		const pct = Math.round(S * 1000) / 10;
		const near = S * 100 >= c.tau;
		push({ group: 3, phase: 5, upto: A.words.length - 1, v: v.slice(), fp: fp, B: { words: B.words, v: hb.v, fp: hb.fp }, lines: [3],
			msg: "Same steps for text B (" + B.words.length + " words): V = " + hb.v.join(" ") + " → fingerprint " + hb.fp + ".",
			vars: [["HA", fp], ["HB", hb.fp]] });
		push({ group: 3, phase: 6, upto: A.words.length - 1, v: v.slice(), fp: fp, B: { words: B.words, v: hb.v, fp: hb.fp }, final: true, lines: [16, 17, 18],
			msg: "S = (bits that agree) / n = " + same + " / " + b + " = " + pct + "% " + (near ? "≥" : "<") + " τ = " + c.tau + "% → " + (near ? "near duplicates." : "not near duplicates (under this τ)."),
			vars: [["HA", fp], ["HB", hb.fp], ["same", same + " / " + b], ["S", pct + "%"]] });
	}
	return frames;
}

const STYLE = `
.vz-sh { overflow-x: auto; display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
.vz-sh table { border-collapse: collapse; font: 0.76rem/1.25 "Consolas", "Menlo", monospace; }
.vz-sh th, .vz-sh td { border: 1px solid var(--vz-border); padding: 0.18rem 0.32rem; text-align: center; min-width: 1.6rem; }
.vz-sh thead th { font: 600 0.68rem/1.2 system-ui, sans-serif; color: var(--vz-muted); background: var(--vz-surface); }
.vz-sh tbody th { text-align: left; font: 600 0.74rem/1.2 system-ui, sans-serif; background: var(--vz-surface); white-space: nowrap; }
.vz-sh td.wt { color: var(--vz-muted); }
.vz-sh td.p { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); }
.vz-sh td.n { background: var(--vz-min-bg); color: var(--vz-min-fg); }
.vz-sh td.pending { color: var(--vz-muted); opacity: 0.55; }
.vz-sh tr.is-cmp th { background: var(--vz-cmp-bg); box-shadow: inset 3px 0 0 var(--vz-cmp-bd); }
.vz-sh td.is-col { outline: 2px solid var(--vz-cmp-bd); outline-offset: -2px; }
.vz-sh tr.vz-sh-v td, .vz-sh tr.vz-sh-v th { font-weight: 700; border-top: 2px solid var(--vz-ink); }
.vz-sh tr.vz-sh-fp td.one { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); font-weight: 700; }
.vz-sh tr.vz-sh-fp td.diff { box-shadow: inset 0 0 0 2px var(--vz-min-bd); }
`;

function ensureStyle() {
	if (document.getElementById("viz-simhash-style")) return;
	const s = document.createElement("style");
	s.id = "viz-simhash-style";
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
	const b = frame.b;
	let html = '<div class="vz-sh"><table><thead><tr><th>word</th><th>wt</th><th>hash</th>';
	for (let i = 0; i < b; i++) html += "<th>b" + (i + 1) + "</th>";
	html += "</tr></thead><tbody>";
	frame.words.forEach(function(w, k) {
		const shown = frame.phase >= 2;
		const added = k <= frame.upto;
		html += '<tr class="' + (k === frame.cur ? "is-cmp" : "") + '"><th>' + esc(w.word) + '</th><td class="wt">' + w.weight + "</td><td>" + (shown ? w.hash : "?") + "</td>";
		for (let i = 0; i < b; i++) {
			const one = w.hash[i] === "1";
			const val = one ? "+" + w.weight : "−" + w.weight;
			const cls = (!shown ? "pending" : added ? (one ? "p" : "n") : "pending") + (i === frame.col ? " is-col" : "");
			html += '<td class="' + cls + '">' + (shown ? val : "") + "</td>";
		}
		html += "</tr>";
	});
	if (frame.v) {
		html += '<tr class="vz-sh-v"><th>V</th><td></td><td></td>' + frame.v.map(function(x, i) { return '<td class="' + (i === frame.col ? "is-col" : "") + '">' + signed(x) + "</td>"; }).join("") + "</tr>";
	}
	const diff = frame.B ? frame.fp.split("").map(function(x, i) { return x !== frame.B.fp[i]; }) : null;
	if (frame.fp) {
		html += '<tr class="vz-sh-fp"><th>H<sub>A</sub></th><td></td><td>' + frame.fp + "</td>" + frame.fp.split("").map(function(x, i) { return '<td class="' + (x === "1" ? "one" : "") + (diff && diff[i] ? " diff" : "") + '">' + x + "</td>"; }).join("") + "</tr>";
	}
	if (frame.B) {
		html += '<tr class="vz-sh-v"><th>V<sub>B</sub></th><td></td><td></td>' + frame.B.v.map(function(x) { return "<td>" + signed(x) + "</td>"; }).join("") + "</tr>";
		html += '<tr class="vz-sh-fp"><th>H<sub>B</sub></th><td></td><td>' + frame.B.fp + "</td>" + frame.B.fp.split("").map(function(x, i) { return '<td class="' + (x === "1" ? "one" : "") + (diff[i] ? " diff" : "") + '">' + x + "</td>"; }).join("") + "</tr>";
	}
	stage.innerHTML = html + "</tbody></table></div>";
}
