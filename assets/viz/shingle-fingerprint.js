// N-gram fingerprints for near-duplicate detection, step by step
// (CS 121 Lecture 11 p30–38): parse the text into words, group them into
// overlapping n-grams, hash each n-gram, keep the hashes that are 0 mod p,
// and use that set as the fingerprint. Two documents are compared by the
// size of the intersection over the size of the union of their
// fingerprints, against a threshold tau.
// The default is the slide's example, with the slide's own hash values.
// Without `hashes`, a demo hash (FNV-1a mod 1000) is used instead.
import { checkParams } from "./_core.js";

const MAX_WORDS = 40;

const SLIDE_TEXT = "Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species.";
const SLIDE_HASHES = "938 664 463 822 492 798 78 969 143 236 913 908 694 553 870 779";

export const meta = {
	name: "shingle-fingerprint",
	summary: "N-gram fingerprint: words → overlapping n-grams → hash values → keep those ≡ 0 mod p; optional second text: |FA ∩ FB| / |FA ∪ FB| vs a threshold τ.",
	groupLabel: "n-gram",
	params: {
		text: { type: "string", default: SLIDE_TEXT, desc: "Document A (≤ 40 words). Punctuation and HTML tags are dropped, words lower-cased." },
		n: { type: "int", default: 3, min: 1, max: 5, desc: "N-gram length in words." },
		mod: { type: "int", default: 4, min: 1, max: 16, desc: "Keep the hash values h with h mod p = 0." },
		hashes: { type: "string", desc: "Hash value of each n-gram of text A, space/comma-separated, in order. Omit: the slide's values for the slide's text with n = 3, else a demo hash (FNV-1a mod 1000)." },
		textB: { type: "string", desc: "Optional document B to compare with." },
		hashesB: { type: "string", desc: "Hash values for the n-grams of text B; required with textB when \"hashes\" is given." },
		tau: { type: "int", default: 90, min: 1, max: 100, desc: "Threshold τ in percent: S ≥ τ ⇒ near duplicates." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: { text: SLIDE_TEXT, n: 3, mod: 4 }
};

function words(text) {
	return String(text).replace(/<[^>]*>/g, " ").toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function grams(ws, n) {
	const out = [];
	for (let i = 0; i + n <= ws.length; i++) out.push(ws.slice(i, i + n).join(" "));
	return out;
}

function parseHashes(text) {
	const parts = String(text).split(/[\s,]+/).filter(Boolean);
	const out = [];
	for (const p of parts) {
		if (!/^\d{1,9}$/.test(p)) return { error: "\"" + p + "\" is not a non-negative integer" };
		out.push(Number(p));
	}
	return { values: out };
}

// FNV-1a (32-bit) mod 1000 — a stand-in when no hash values are given.
function demoHash(s) {
	let h = 0x811c9dc5;
	const bytes = new TextEncoder().encode(s);
	for (const b of bytes) {
		h ^= b;
		h = Math.imul(h, 0x01000193) >>> 0;
	}
	return h % 1000;
}

function side(text, n, hashText, label) {
	const ws = words(text);
	if (ws.length > MAX_WORDS) return { error: "\"" + label + "\" has " + ws.length + " words; at most " + MAX_WORDS };
	const gs = grams(ws, n);
	if (!gs.length) return { error: "\"" + label + "\" has " + ws.length + " word(s): fewer than n = " + n };
	let hs;
	if (hashText !== undefined) {
		const p = parseHashes(hashText);
		if (p.error) return { error: "\"" + (label === "text" ? "hashes" : "hashesB") + "\": " + p.error };
		if (p.values.length !== gs.length) return { error: "\"" + (label === "text" ? "hashes" : "hashesB") + "\" has " + p.values.length + " values but \"" + label + "\" has " + gs.length + " " + n + "-grams" };
		hs = p.values;
	} else {
		hs = gs.map(demoHash);
	}
	return { words: ws, grams: gs, hashes: hs };
}

function cfg(config) {
	return {
		text: config.text === undefined ? SLIDE_TEXT : config.text,
		n: config.n === undefined ? 3 : config.n,
		mod: config.mod === undefined ? 4 : config.mod,
		tau: config.tau === undefined ? 90 : config.tau,
		// The slide's text with n = 3 gets the slide's hash values automatically
		// (unless a text B without hashesB asks for the demo hash on both sides).
		hashes: config.hashes !== undefined ? config.hashes
			: ((config.text === undefined || config.text.trim() === SLIDE_TEXT) && (config.n === undefined || config.n === 3) &&
				(config.textB === undefined || config.hashesB !== undefined)) ? SLIDE_HASHES : undefined,
		textB: config.textB,
		hashesB: config.hashesB
	};
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const c = cfg(config);
	const a = side(c.text, c.n, c.hashes, "text");
	if (a.error) errors.push(a.error);
	if (c.hashesB !== undefined && c.textB === undefined) errors.push("\"hashesB\" needs \"textB\"");
	if (c.textB !== undefined) {
		if (c.hashes !== undefined && c.hashesB === undefined) errors.push("\"textB\" needs \"hashesB\" when \"hashes\" is given (don't mix given and demo hash values)");
		else if (c.hashes === undefined && c.hashesB !== undefined) errors.push("\"hashesB\" needs \"hashes\" for text A too");
		else {
			const b = side(c.textB, c.n, c.hashesB, "textB");
			if (b.error) errors.push(b.error);
		}
	}
	return errors;
}

export const code = {
	python: [
		"import re",
		"",
		"def ngrams(text, n=3):",
		"    words = re.findall(r\"\\w+\", text.lower())",
		"    return [\" \".join(words[i:i + n])",
		"            for i in range(len(words) - n + 1)]",
		"",
		"def fingerprint(hashes, p=4):",
		"    # keep the hash values that are 0 mod p",
		"    return {h for h in hashes if h % p == 0}",
		"",
		"def similarity(fa, fb):",
		"    # |FA ∩ FB| / |FA ∪ FB|",
		"    return len(fa & fb) / len(fa | fb)",
		"",
		"grams = ngrams(text)            # steps 1-2",
		"hashes = [h(g) for g in grams]  # step 4",
		"fa = fingerprint(hashes)        # steps 3, 5",
		"near_dup = similarity(fa, fb) >= tau  # 6"
	]
};

export const legend = [
	{ cls: "is-cmp", label: "Current n-gram" },
	{ cls: "is-sorted", label: "Selected (h mod p = 0)" },
	{ cls: "is-min", label: "In both fingerprints" }
];

export const input = {
	key: "text",
	label: "Text A",
	format: function(config) { return config.text === undefined ? SLIDE_TEXT : config.text; },
	parse: function(text) {
		const ws = words(text);
		if (ws.length > MAX_WORDS) return { error: "at most " + MAX_WORDS + " words" };
		if (!ws.length) return { error: "type some words" };
		return { value: String(text).trim() };
	}
};

function hashNote(given) { return given ? "the slide's hash values" : "a demo hash (FNV-1a mod 1000, not the slide's)"; }

export function steps(config) {
	const c = cfg(config);
	const A = side(c.text, c.n, c.hashes, "text");
	const given = c.hashes !== undefined;
	const frames = [];
	const p = c.mod;
	function push(f) {
		frames.push({
			group: f.group,
			phase: f.phase,
			words: A.words,
			grams: A.grams,
			hashes: A.hashes,
			cur: f.cur === undefined ? -1 : f.cur,
			upto: f.upto === undefined ? -1 : f.upto,
			fa: f.fa || null,
			B: f.B || null,
			fb: f.fb || null,
			both: f.both || null,
			n: c.n,
			p: p,
			final: !!f.final,
			lines: f.lines || [],
			msg: f.msg,
			vars: f.vars || []
		});
	}
	push({ group: 0, phase: 1, lines: [4], msg: "Step 1: parse the document into words — punctuation, HTML tags and extra whitespace go. " + A.words.length + " words." ,
		vars: [["words", String(A.words.length)]] });
	push({ group: 0, phase: 2, lines: [5, 6], msg: "Step 2: group the words into overlapping " + c.n + "-grams: " + A.words.length + " − " + c.n + " + 1 = " + A.grams.length + " of them.",
		vars: [["words", String(A.words.length)], [c.n + "-grams", String(A.grams.length)]] });
	const fa = [];
	A.grams.forEach(function(g, i) {
		const h = A.hashes[i];
		const keep = h % p === 0;
		if (keep) fa.push(h);
		push({ group: 1, phase: 3, cur: i, upto: i, lines: keep ? [9, 10, 17] : [17],
			msg: "\"" + g + "\" → " + h + "; " + h + " mod " + p + " = " + (h % p) + (keep ? " → selected." : " → not selected."),
			vars: [["n-gram", g], ["h", String(h)], ["h mod " + p, String(h % p)], ["FA", "{" + fa.join(", ") + "}"]] });
	});
	push({ group: 2, phase: 4, upto: A.grams.length - 1, fa: fa.slice(), lines: [18], final: c.textB === undefined,
		msg: "Fingerprint FA = {" + fa.join(", ") + "}: " + fa.length + " of " + A.grams.length + " hash values (" + hashNote(given) + ", selected with 0 mod " + p + "). Steps 5–6: store them (typically in an inverted index) and compare documents by overlap.",
		vars: [["FA", "{" + fa.join(", ") + "}"], ["|FA|", String(fa.length)]] });
	if (c.textB !== undefined) {
		const B = side(c.textB, c.n, c.hashesB, "textB");
		const fb = [];
		B.hashes.forEach(function(h) { if (h % p === 0 && !fb.includes(h)) fb.push(h); });
		const fas = Array.from(new Set(fa));
		push({ group: 3, phase: 5, upto: A.grams.length - 1, fa: fas, B: B, fb: fb, lines: [16, 17, 18],
			msg: "Same steps for text B: " + B.grams.length + " " + c.n + "-grams → FB = {" + fb.join(", ") + "}.",
			vars: [["FA", "{" + fas.join(", ") + "}"], ["FB", "{" + fb.join(", ") + "}"]] });
		const inter = fas.filter(function(h) { return fb.includes(h); });
		const uni = Array.from(new Set(fas.concat(fb)));
		const S = uni.length ? inter.length / uni.length : 0;
		const pct = Math.round(S * 1000) / 10;
		const near = uni.length > 0 && S * 100 >= c.tau;
		push({ group: 3, phase: 6, upto: A.grams.length - 1, fa: fas, B: B, fb: fb, both: inter, final: true, lines: [12, 13, 14, 19],
			msg: uni.length
				? "S = |FA ∩ FB| / |FA ∪ FB| = " + inter.length + " / " + uni.length + " = " + pct + "% " + (near ? "≥" : "<") + " τ = " + c.tau + "% → " + (near ? "near duplicates." : "not near duplicates (under this τ).")
				: "Both fingerprints are empty: nothing to compare (pick another p).",
			vars: [["|FA ∩ FB|", String(inter.length)], ["|FA ∪ FB|", String(uni.length)], ["S", pct + "%"], ["τ", c.tau + "%"]] });
	}
	return frames;
}

const STYLE = `
.vz-sf { display: flex; flex-direction: column; gap: 0.6rem; font: 0.8rem/1.4 system-ui, sans-serif; }
.vz-sf-words { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.vz-sf-words span { border: 1px solid var(--vz-border); border-radius: 4px; padding: 0 0.3rem; background: var(--vz-surface); }
.vz-sf-words span.is-cmp { background: var(--vz-cmp-bg); border-color: var(--vz-cmp-bd); }
.vz-sf-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(11.5rem, 1fr)); gap: 0.3rem; }
.vz-sf-g { border: 1px solid var(--vz-border); border-radius: 5px; padding: 0.2rem 0.4rem; display: flex; justify-content: space-between; gap: 0.4rem; }
.vz-sf-g .h { font-family: "Consolas", "Menlo", monospace; font-weight: 700; }
.vz-sf-g.is-pending { opacity: 0.45; }
.vz-sf-g.is-cmp { background: var(--vz-cmp-bg); border-color: var(--vz-cmp-bd); }
.vz-sf-g.is-sel { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-color: var(--vz-sorted-bd); }
.vz-sf-set { font-family: "Consolas", "Menlo", monospace; text-align: center; }
.vz-sf-set b { display: inline-block; border: 1px solid var(--vz-sorted-bd); background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-radius: 4px; padding: 0 0.3rem; margin: 0 0.12rem; }
.vz-sf-set b.is-both { background: var(--vz-min-bg); color: var(--vz-min-fg); border-color: var(--vz-min-bd); }
.vz-sf-lbl { color: var(--vz-muted); font: 600 0.72rem/1.2 system-ui, sans-serif; }
`;

function ensureStyle() {
	if (document.getElementById("viz-shingle-fingerprint-style")) return;
	const s = document.createElement("style");
	s.id = "viz-shingle-fingerprint-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function esc(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

function setHtml(label, list, both) {
	return '<div class="vz-sf-set"><span class="vz-sf-lbl">' + label + "</span> { " +
		list.map(function(h) { return '<b class="' + (both && both.includes(h) ? "is-both" : "") + '">' + h + "</b>"; }).join(" ") + " }</div>";
}

export function render(stage, frame) {
	ensureStyle();
	let html = '<div class="vz-sf">';
	const curWords = frame.cur >= 0 ? [frame.cur, frame.cur + frame.n - 1] : null;
	html += '<div class="vz-sf-lbl">Words (A)</div><div class="vz-sf-words">' + frame.words.map(function(w, i) {
		const on = curWords && i >= curWords[0] && i <= curWords[1];
		return '<span class="' + (on ? "is-cmp" : "") + '">' + esc(w) + "</span>";
	}).join("") + "</div>";
	if (frame.phase >= 2) {
		html += '<div class="vz-sf-lbl">' + frame.n + "-grams → hash (selected if h mod " + frame.p + " = 0)</div><div class=\"vz-sf-grid\">";
		frame.grams.forEach(function(g, i) {
			const seen = i <= frame.upto;
			const h = frame.hashes[i];
			let cls = seen ? "" : "is-pending";
			if (i === frame.cur) cls = "is-cmp";
			else if (seen && h % frame.p === 0) cls = "is-sel";
			html += '<div class="vz-sf-g ' + cls + '"><span>' + esc(g) + '</span><span class="h">' + (seen ? h : "?") + "</span></div>";
		});
		html += "</div>";
	}
	if (frame.fa) html += setHtml("FA =", frame.fa, frame.both);
	if (frame.fb) html += setHtml("FB =", frame.fb, frame.both);
	stage.innerHTML = html + "</div>";
}
