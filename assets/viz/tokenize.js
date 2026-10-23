// Early tokenization methodology (CS 121 Lecture 4, slides 13–15): read the
// character stream one character at a time; alphanumeric characters build up
// the current token (lower-cased), any space or special character ends it, and
// only tokens of at least `minLen` characters (3 on the slides) are kept.
import { checkParams } from "./_core.js";

const MAX_CHARS = 80;

export const meta = {
	name: "tokenize",
	summary: "Character stream → token stream: alphanumerics build a token, a space or special character ends it, short tokens are dropped.",
	groupLabel: "token",
	params: {
		text: { type: "string", required: true, desc: "Input text, 1–80 characters, e.g. the slide's \"Bigcorp's 2007 bi-annual report showed profits rose 10%.\"" },
		minLen: { type: "int", default: 3, min: 1, max: 5, desc: "Minimum token length kept (the early methodology uses 3)." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo, with the running line highlighted." }
	},
	example: { text: "Bigcorp's 2007 bi-annual report showed profits rose 10%." }
};

const SAMPLES = [
	"Bigcorp's 2007 bi-annual report showed profits rose 10%.",
	"O'Neill aren't clear-headed",
	"mother-in-law lives in San Francisco",
	"Mail info@uci.edu or visit http://www.ics.uci.edu/",
	"New York University vs York University",
	"Ping 192.168.0.1 now"
];

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const n = Array.from(config.text).length;
	if (n === 0) errors.push("\"text\" is empty");
	else if (n > MAX_CHARS) errors.push("\"text\" can have at most " + MAX_CHARS + " characters (it has " + n + ")");
	return errors;
}

export const code = {
	python: [
		"def tokenize(text, min_len=3):",
		"    tokens = []",
		"    buf = \"\"",
		"    for ch in text:",
		"        if ch.isascii() and ch.isalnum():",
		"            buf += ch.lower()",
		"        else:",
		"            if len(buf) >= min_len:",
		"                tokens.append(buf)",
		"            buf = \"\"",
		"    if len(buf) >= min_len:",
		"        tokens.append(buf)",
		"    return tokens"
	]
};

export const legend = [
	{ cls: "is-cmp", label: "Current character · ch" },
	{ cls: "is-min", label: "In the buffer · buf" },
	{ cls: "is-sorted", label: "Emitted as a token" },
	{ cls: "is-swap", label: "Dropped (too short)" }
];

export const input = {
	key: "text",
	label: "Text",
	format: function(config) { return config.text; },
	parse: function(text) {
		const t = String(text);
		const n = Array.from(t).length;
		if (!t.trim()) return { error: "type some text" };
		if (n > MAX_CHARS) return { error: "at most " + MAX_CHARS + " characters (" + n + ")" };
		return { value: t };
	},
	random: function() { return SAMPLES[Math.floor(Math.random() * SAMPLES.length)]; }
};

function isAlnum(ch) {
	return /^[A-Za-z0-9]$/.test(ch);
}

function show(ch) {
	if (ch === " ") return "Space";
	if (ch === "\t") return "Tab";
	if (ch === "\n") return "Newline";
	if (ch === "`") return "Backtick";
	return "`" + ch + "`";
}

export function steps(config) {
	const chars = Array.from(config.text);
	const minLen = config.minLen;
	// state per character: "" (unread), "buf", "tok", "drop", "sep"
	const state = chars.map(function() { return ""; });
	const tokens = [];
	const dropped = [];
	const frames = [];
	let buf = "";
	let bufStart = -1;
	let group = 0;

	function push(f) {
		frames.push({
			chars: chars,
			state: state.slice(),
			pos: f.pos === undefined ? -1 : f.pos,
			buf: buf,
			tokens: tokens.slice(),
			dropped: dropped.slice(),
			lines: f.lines || [],
			msg: f.msg,
			group: group,
			vars: [
				["ch", f.pos === undefined || f.pos < 0 || f.pos >= chars.length ? "—" : JSON.stringify(chars[f.pos])],
				["buf", JSON.stringify(buf)],
				["tokens", tokens.length ? tokens.join(" ") : "[]"],
				["dropped", dropped.length ? dropped.join(" ") : "none"]
			]
		});
	}

	function flush(endPos, why) {
		// returns a sentence describing what happened to buf
		if (!buf) return why + " `buf` is empty, so there is nothing to emit.";
		const word = buf;
		const kept = buf.length >= minLen;
		for (let k = bufStart; k < endPos; k++) state[k] = kept ? "tok" : "drop";
		if (kept) tokens.push(word);
		else dropped.push(word);
		buf = "";
		bufStart = -1;
		return why + " `buf = \"" + word + "\"` has " + word.length + (kept ? " ≥ " : " < ") + minLen +
			" characters, so it is " + (kept ? "emitted as token #" + tokens.length + "." : "dropped.");
	}

	push({ lines: [1, 2, 3], msg: "Start: read the text as a stream of " + chars.length + " characters with an empty buffer. Alphanumerics build a token; anything else ends it. Tokens shorter than " + minLen + " are thrown away." });

	chars.forEach(function(ch, k) {
		if (isAlnum(ch)) {
			if (!buf) bufStart = k;
			buf += ch.toLowerCase();
			state[k] = "buf";
			push({
				pos: k, lines: [4, 5, 6],
				msg: show(ch) + " is alphanumeric: append " + (ch !== ch.toLowerCase() ? "it lower-cased (`" + ch.toLowerCase() + "`)" : "it") + " to the buffer → `buf = \"" + buf + "\"`."
			});
		} else {
			const hadBuf = !!buf;
			const kept = hadBuf && buf.length >= minLen;
			const sentence = flush(k, show(ch) + (ch === " " ? " is" : " is a special character —") + " a token boundary.");
			state[k] = "sep";
			push({ pos: k, lines: hadBuf ? (kept ? [7, 8, 9, 10] : [7, 8, 10]) : [7, 10], msg: sentence });
			if (hadBuf) group++;
		}
	});

	const hadBuf = !!buf;
	const kept = hadBuf && buf.length >= minLen;
	const endSentence = hadBuf
		? flush(chars.length, "End of the stream: the last token has no boundary after it, so it is checked after the loop.")
		: "End of the stream: `buf` is empty.";
	push({
		pos: chars.length, lines: hadBuf ? (kept ? [11, 12, 13] : [11, 13]) : [11, 13],
		msg: endSentence + " Result: " + tokens.length + " token" + (tokens.length === 1 ? "" : "s") +
			(tokens.length ? " — \"" + tokens.join(" ") + "\"" : "") + (dropped.length ? "; dropped: " + dropped.join(", ") + "." : ".")
	});
	return frames;
}

const STYLE = `
.vz-tk { display: flex; flex-direction: column; align-items: center; gap: 0.9rem; }
.vz-tk-chars { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.18rem; font: 0.92rem "Consolas", "Menlo", monospace; }
.vz-tk-ch { min-width: 1.15rem; padding: 0.2rem 0.1rem; text-align: center; border: 1.5px solid var(--vz-border); border-radius: 0.3rem; background: var(--vz-surface);
	transition: background-color 0.2s, border-color 0.2s, color 0.2s; }
.vz-tk-ch.is-space { color: var(--vz-muted); }
.vz-tk-ch.is-unread { opacity: 0.55; }
.vz-tk-ch.is-sep { color: var(--vz-muted); opacity: 0.6; }
.vz-tk-ch.is-min { background: var(--vz-min-bg); color: var(--vz-min-fg); border-color: var(--vz-min-bd); }
.vz-tk-ch.is-sorted { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-color: var(--vz-sorted-bd); }
.vz-tk-ch.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); border-color: var(--vz-swap-bd); border-style: dashed; text-decoration: line-through; }
.vz-tk-ch.is-cmp { border-color: var(--vz-cmp-bd); box-shadow: 0 0 0 2px var(--vz-cmp-bd); opacity: 1; }
.vz-tk-ch.is-cmp:not(.is-min):not(.is-sorted):not(.is-swap) { background: var(--vz-cmp-bg); }
.vz-tk-rows { display: grid; grid-template-columns: auto 1fr; gap: 0.45rem 0.7rem; align-items: center; width: 100%; max-width: 34rem; }
.vz-tk-cap { color: var(--vz-muted); font-size: 0.8rem; text-align: right; }
.vz-tk-list { display: flex; flex-wrap: wrap; gap: 0.3rem; min-height: 1.7rem; align-items: center; }
.vz-tk-chip { padding: 0.15rem 0.5rem; border-radius: 999px; border: 1.5px solid var(--vz-border); background: var(--vz-surface); font: 0.85rem "Consolas", "Menlo", monospace; }
.vz-tk-chip.is-sorted { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-color: var(--vz-sorted-bd); }
.vz-tk-chip.is-min { background: var(--vz-min-bg); color: var(--vz-min-fg); border-color: var(--vz-min-bd); }
.vz-tk-chip.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); border-color: var(--vz-swap-bd); border-style: dashed; text-decoration: line-through; }
.vz-tk-none { color: var(--vz-muted); font-size: 0.82rem; }
`;

function ensureStyle() {
	if (document.getElementById("viz-tokenize-style")) return;
	const s = document.createElement("style");
	s.id = "viz-tokenize-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function escapeHtml(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

const CLS = { "": "is-unread", buf: "is-min", tok: "is-sorted", drop: "is-swap", sep: "is-sep" };

export function render(stage, frame) {
	ensureStyle();
	let html = '<div class="vz-tk"><div class="vz-tk-chars">';
	frame.chars.forEach(function(ch, k) {
		const cls = ["vz-tk-ch", CLS[frame.state[k]]];
		if (/\s/.test(ch)) cls.push("is-space");
		if (k === frame.pos) cls.push("is-cmp");
		html += '<span class="' + cls.join(" ") + '">' + (ch === " " ? "␣" : /\s/.test(ch) ? "↵" : escapeHtml(ch)) + "</span>";
	});
	html += '</div><div class="vz-tk-rows">';
	html += '<span class="vz-tk-cap">buf</span><div class="vz-tk-list">' +
		(frame.buf ? '<span class="vz-tk-chip is-min">' + escapeHtml(frame.buf) + "</span>" : '<span class="vz-tk-none">empty</span>') + "</div>";
	html += '<span class="vz-tk-cap">tokens</span><div class="vz-tk-list">' +
		(frame.tokens.length ? frame.tokens.map(function(t) { return '<span class="vz-tk-chip is-sorted">' + escapeHtml(t) + "</span>"; }).join("") : '<span class="vz-tk-none">none yet</span>') + "</div>";
	html += '<span class="vz-tk-cap">dropped</span><div class="vz-tk-list">' +
		(frame.dropped.length ? frame.dropped.map(function(t) { return '<span class="vz-tk-chip is-swap">' + escapeHtml(t) + "</span>"; }).join("") : '<span class="vz-tk-none">none</span>') + "</div>";
	html += "</div></div>";
	stage.innerHTML = html;
}
