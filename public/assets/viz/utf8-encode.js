// UTF-8 encoding, step by step (CS 121 Lecture 10 p13): take a character's
// Unicode code point, write it in binary, pick the row of the encoding table
// whose range contains it, pour the payload bits into that row's byte
// template (the high bits into the first byte, 6 bits into each
// continuation byte) and read off the bytes in hexadecimal.
// Default: Greek pi, U+03C0 = 960 -> 11001111 10000000 = CF 80.
import { checkParams } from "./_core.js";

const MAX_CHARS = 4;

// The slide's table: [lo, hi, template bytes] (null = undefined range).
const TABLE = [
	{ lo: 0x0000, hi: 0x007F, dec: "0–127", hex: "0–7F", tpl: ["0xxxxxxx"] },
	{ lo: 0x0080, hi: 0x07FF, dec: "128–2047", hex: "80–7FF", tpl: ["110xxxxx", "10xxxxxx"] },
	{ lo: 0x0800, hi: 0xD7FF, dec: "2048–55295", hex: "800–D7FF", tpl: ["1110xxxx", "10xxxxxx", "10xxxxxx"] },
	{ lo: 0xD800, hi: 0xDFFF, dec: "55296–57343", hex: "D800–DFFF", tpl: null },
	{ lo: 0xE000, hi: 0xFFFF, dec: "57344–65535", hex: "E000–FFFF", tpl: ["1110xxxx", "10xxxxxx", "10xxxxxx"] },
	{ lo: 0x10000, hi: 0x10FFFF, dec: "65536–1114111", hex: "10000–10FFFF", tpl: ["11110xxx", "10xxxxxx", "10xxxxxx", "10xxxxxx"] }
];

export const meta = {
	name: "utf8-encode",
	summary: "UTF-8 encoding of a character: code point → binary → row of the encoding table → payload bits into the byte template → bytes in hex.",
	groupLabel: "character",
	params: {
		text: { type: "string", default: "π", desc: "1–4 characters to encode, one after the other (default: π, the slide's example)." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: { text: "π" }
};

function chars(text) { return Array.from(String(text)); }

function rowOf(cp) {
	for (let k = 0; k < TABLE.length; k++) if (cp >= TABLE[k].lo && cp <= TABLE[k].hi) return k;
	return -1;
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	if (config.text === undefined) return errors;
	const cs = chars(config.text);
	if (!cs.length) return ["\"text\" needs at least one character"];
	if (cs.length > MAX_CHARS) return ["\"text\" has " + cs.length + " characters; at most " + MAX_CHARS];
	for (const c of cs) {
		const cp = c.codePointAt(0);
		if (cp >= 0xD800 && cp <= 0xDFFF) errors.push("\"text\": U+" + hex(cp, 4) + " is a lone surrogate (the table's \"Undefined\" range)");
	}
	return errors;
}

export const code = {
	python: [
		"def utf8_encode(ch):",
		"    cp = ord(ch)             # code point",
		"    if cp < 128:             # 1 byte",
		"        return bytes([cp])",
		"    if cp < 2048:            # 2 bytes",
		"        return bytes([192 | cp >> 6,",
		"                      128 | cp & 63])",
		"    if cp < 65536:           # 3 bytes",
		"        return bytes([224 | cp >> 12,",
		"                      128 | cp >> 6 & 63,",
		"                      128 | cp & 63])",
		"    return bytes([240 | cp >> 18,  # 4 bytes",
		"                  128 | cp >> 12 & 63,",
		"                  128 | cp >> 6 & 63,",
		"                  128 | cp & 63])",
		"",
		"# markers: 192 = 110 00000, 224 = 1110 0000,",
		"# 240 = 11110 000, 128 = 10 000000;",
		"# 63 = 111111 keeps the low 6 bits",
		"print(utf8_encode(\"π\").hex(\" \"))  # cf 80"
	]
};

export const legend = [
	{ cls: "is-cmp", label: "Table row that applies" },
	{ cls: "is-min", label: "Fixed marker bits" },
	{ cls: "is-sorted", label: "Payload bits (from the code point)" }
];

export const input = {
	key: "text",
	label: "Characters",
	format: function(config) { return config.text === undefined ? "π" : config.text; },
	parse: function(text) {
		const cs = chars(text.trim());
		if (!cs.length) return { error: "type 1–4 characters" };
		if (cs.length > MAX_CHARS) return { error: "at most " + MAX_CHARS + " characters" };
		return { value: cs.join("") };
	},
	random: function() {
		const pool = ["A", "é", "π", "€", "中", "文", "😀", "ß", "Ω", "あ", "ñ", "~"];
		const n = 1 + Math.floor(Math.random() * 3);
		let s = "";
		for (let i = 0; i < n; i++) s += pool[Math.floor(Math.random() * pool.length)];
		return s;
	}
};

function hex(n, w) {
	let s = n.toString(16).toUpperCase();
	while (s.length < (w || 1)) s = "0" + s;
	return s;
}

function bin(n, w) {
	let s = n.toString(2);
	while (s.length < w) s = "0" + s;
	return s;
}

// Fill the templates with the payload bits; returns [{ marker, payload }] per byte.
function fill(cp, tpl) {
	const slots = tpl.reduce(function(a, t) { return a + (t.match(/x/g) || []).length; }, 0);
	const payload = bin(cp, slots);
	let k = 0;
	return tpl.map(function(t) {
		const marker = t.replace(/x/g, "");
		const n = t.length - marker.length;
		const p = payload.slice(k, k + n);
		k += n;
		return { marker: marker, payload: p, value: parseInt(marker + p, 2) };
	});
}

function lineFor(row) {
	return row === 0 ? [3, 4] : row === 1 ? [5, 6, 7] : row === 5 ? [12, 13, 14, 15] : [8, 9, 10, 11];
}

export function steps(config) {
	const cs = chars(config.text === undefined ? "π" : config.text);
	const frames = [];
	const done = [];
	function push(f) {
		frames.push({
			group: f.group,
			row: f.row === undefined ? -1 : f.row,
			ch: f.ch || "",
			cp: f.cp === undefined ? null : f.cp,
			bits: f.bits || "",
			bytes: f.bytes || null,
			stage: f.stage || 0,
			done: done.slice(),
			final: !!f.final,
			lines: f.lines || [],
			msg: f.msg,
			vars: f.vars || []
		});
	}
	push({ group: 0, msg: "The table maps each code-point range to a byte template. `0` / `10` / `110` / `1110` / `11110` are fixed marker bits; each `x` is filled with a bit of the code point.", lines: [] });
	cs.forEach(function(c, k) {
		const cp = c.codePointAt(0);
		const row = rowOf(cp);
		const tpl = TABLE[row].tpl;
		const slots = tpl.reduce(function(a, t) { return a + (t.match(/x/g) || []).length; }, 0);
		const g = k + 1;
		const cpTxt = "U+" + hex(cp, 4);
		const vars0 = [["char", c], ["cp", cp + " (0x" + hex(cp) + ")"]];
		push({ group: g, ch: c, cp: cp, stage: 1, lines: [2], vars: vars0,
			msg: "`" + c + "` is Unicode code point " + cp + " = " + cpTxt + " (hex " + hex(cp) + ")." });
		const b16 = bin(cp, Math.max(16, Math.ceil(cp.toString(2).length / 8) * 8));
		push({ group: g, ch: c, cp: cp, stage: 2, lines: [2], vars: vars0.concat([["binary", b16.replace(/(.{8})(?=.)/g, "$1 ")]]),
			msg: "In binary: " + b16.replace(/(.{8})(?=.)/g, "$1 ") + "." });
		push({ group: g, ch: c, cp: cp, row: row, stage: 3, lines: lineFor(row).slice(0, 1), vars: vars0.concat([["template", tpl.join(" ")]]),
			msg: cp + " is in the range " + TABLE[row].dec + " (hex " + TABLE[row].hex + "), so the encoding follows " + tpl.join(" ") + ": " + tpl.length + " byte(s), " + slots + " payload bits." });
		const bytes = fill(cp, tpl);
		const payload = bin(cp, slots);
		const split = bytes.map(function(b) { return b.payload; });
		push({ group: g, ch: c, cp: cp, row: row, bits: payload, bytes: bytes, stage: 4, lines: lineFor(row), vars: vars0.concat([["payload", payload]]),
			msg: "Write " + cp + " in " + slots + " bits: " + payload + ". " + (tpl.length === 1 ? "All 7 go into the single byte." : "The high " + split[0].length + " bits (" + split[0] + ") go into the first byte, then 6 bits into each next byte (" + split.slice(1).join(", ") + ").") });
		const hexs = bytes.map(function(b) { return hex(b.value, 2); });
		done.push({ ch: c, hex: hexs });
		push({ group: g, ch: c, cp: cp, row: row, bits: payload, bytes: bytes, stage: 5, lines: lineFor(row), vars: vars0.concat([["bytes", hexs.join(" ")]]),
			msg: "Final encoding: " + bytes.map(function(b) { return b.marker + b.payload; }).join(" ") + " = " + hexs.join(" ") + " in hexadecimal (" + bytes.length + " byte" + (bytes.length > 1 ? "s" : "") + ")." });
	});
	const total = done.reduce(function(a, d) { return a + d.hex.length; }, 0);
	push({ group: cs.length + 1, final: true, stage: 6, lines: [20],
		vars: [["UTF-8", done.map(function(d) { return d.hex.join(" "); }).join(" | ")], ["bytes", String(total)], ["UTF-32 bytes", String(4 * cs.length)]],
		msg: "`" + cs.join("") + "` in UTF-8: " + done.map(function(d) { return d.hex.join(" "); }).join(" ") + " — " + total + " byte(s). UTF-32 would use 4 bytes per character: " + (4 * cs.length) + "." });
	return frames;
}

const STYLE = `
.vz-u8 { display: flex; flex-direction: column; gap: 0.7rem; align-items: center; overflow-x: auto; }
.vz-u8 table { border-collapse: collapse; font: 0.76rem/1.3 "Consolas", "Menlo", monospace; }
.vz-u8 th, .vz-u8 td { border: 1px solid var(--vz-border); padding: 0.22rem 0.4rem; text-align: left; white-space: nowrap; }
.vz-u8 thead th { font: 600 0.7rem/1.2 system-ui, sans-serif; color: var(--vz-muted); background: var(--vz-surface); }
.vz-u8 tr.is-cmp td { background: var(--vz-cmp-bg); }
.vz-u8 tr.is-cmp td:first-child { box-shadow: inset 3px 0 0 var(--vz-cmp-bd); }
.vz-u8 tr.is-undef td { color: var(--vz-muted); font-style: italic; }
.vz-u8-cp { font: 600 0.95rem/1.4 system-ui, sans-serif; text-align: center; }
.vz-u8-cp .vz-u8-glyph { font-size: 1.6rem; padding: 0 0.4rem; }
.vz-u8-cp .vz-u8-mono { font-family: "Consolas", "Menlo", monospace; font-weight: 400; }
.vz-u8-bytes { display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; }
.vz-u8-byte { border: 1px solid var(--vz-border); border-radius: 6px; padding: 0.3rem 0.45rem; text-align: center; font: 0.95rem/1.3 "Consolas", "Menlo", monospace; }
.vz-u8-byte .m { background: var(--vz-min-bg); color: var(--vz-min-fg); }
.vz-u8-byte .p { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); font-weight: 700; }
.vz-u8-byte .x { color: var(--vz-muted); }
.vz-u8-byte .h { display: block; font-size: 0.8rem; color: var(--vz-muted); margin-top: 0.15rem; }
.vz-u8-byte .h.is-on { color: var(--vz-ink); font-weight: 700; }
.vz-u8-done { font: 0.8rem/1.4 "Consolas", "Menlo", monospace; color: var(--vz-muted); text-align: center; }
`;

function ensureStyle() {
	if (document.getElementById("viz-utf8-encode-style")) return;
	const s = document.createElement("style");
	s.id = "viz-utf8-encode-style";
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
	let html = '<div class="vz-u8">';
	if (frame.cp !== null) {
		html += '<div class="vz-u8-cp"><span class="vz-u8-glyph">' + esc(frame.ch) + '</span> = ' + frame.cp +
			' = <span class="vz-u8-mono">U+' + hex(frame.cp, 4) + "</span>" +
			(frame.stage >= 2 ? ' = <span class="vz-u8-mono">' + bin(frame.cp, Math.max(16, Math.ceil(frame.cp.toString(2).length / 8) * 8)).replace(/(.{8})(?=.)/g, "$1 ") + "</span>" : "") + "</div>";
	}
	html += "<table><thead><tr><th>Decimal</th><th>Hexadecimal</th><th>Encoding</th></tr></thead><tbody>";
	TABLE.forEach(function(r, k) {
		const cls = (k === frame.row ? "is-cmp" : "") + (r.tpl ? "" : " is-undef");
		html += '<tr class="' + cls + '"><td>' + r.dec + "</td><td>" + r.hex + "</td><td>" + (r.tpl ? r.tpl.join(" ") : "Undefined") + "</td></tr>";
	});
	html += "</tbody></table>";
	if (frame.row >= 0) {
		const tpl = TABLE[frame.row].tpl;
		html += '<div class="vz-u8-bytes">';
		tpl.forEach(function(t, k) {
			const marker = t.replace(/x/g, "");
			const b = frame.bytes ? frame.bytes[k] : null;
			html += '<div class="vz-u8-byte"><span class="m">' + marker + "</span>" +
				(b ? '<span class="p">' + b.payload + "</span>" : '<span class="x">' + t.slice(marker.length) + "</span>") +
				'<span class="h' + (frame.stage >= 5 ? " is-on" : "") + '">' + (frame.stage >= 5 && b ? "0x" + hex(b.value, 2) : "byte " + (k + 1)) + "</span></div>";
		});
		html += "</div>";
	}
	if (frame.done.length && (frame.final || frame.done.length > 1)) {
		html += '<div class="vz-u8-done">' + frame.done.map(function(d) { return esc(d.ch) + " → " + d.hex.join(" "); }).join(" · ") + "</div>";
	}
	stage.innerHTML = html + "</div>";
}
