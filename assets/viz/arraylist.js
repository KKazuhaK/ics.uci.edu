// ArrayList (dynamic array), step by step: add / insert with shifting,
// remove with shifting, resize by doubling (or +1) and halving at 1/4 full.
// Matches the Lecture 3 ArrayList: initial capacity 2, add(item) appends,
// remove() removes the last item.
import { checkParams } from "./_core.js";

const MAX_OPS = 14;
const MAX_SIZE = 16;
const MAX_CAP = 32;

export const meta = {
	name: "arraylist",
	summary: "ArrayList operations on a fixed-capacity buffer: shifting, doubling when full, halving at 1/4 full.",
	groupLabel: "operation",
	params: {
		ops: { type: "string", required: true, desc: "Calls separated by ; — add(x), add(i, x), remove(), remove(i), get(i). Items: words or \"quoted\"." },
		capacity: { type: "int", default: 2, min: 1, max: 8, desc: "Initial capacity (Lecture 3: 2)." },
		growth: { type: "enum", values: ["double", "plus1"], default: "double", desc: "How resize grows a full buffer: 2 × capacity, or capacity + 1." },
		shrink: { type: "bool", default: true, desc: "Halve the capacity when size ≤ capacity / 4 after a remove." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code beside the demo." }
	},
	example: { ops: "add(ICS46); add(Rocks); add(!); add(1, Throws); add(3, ?); remove(); remove(); remove()" }
};

// ---- ops parsing (same helper in linked-list / stack / queue) ----
function splitArgs(text) {
	const out = [];
	let cur = "", quote = null, quoted = false;
	for (const ch of text) {
		if (quote) {
			if (ch === quote) quote = null; else cur += ch;
		} else if (ch === '"' || ch === "'") {
			quote = ch; quoted = true;
		} else if (ch === ",") {
			out.push({ raw: quoted ? cur : cur.trim(), quoted: quoted }); cur = ""; quoted = false;
		} else cur += ch;
	}
	if (quote) return null;
	if (cur.trim() || quoted || out.length) out.push({ raw: quoted ? cur : cur.trim(), quoted: quoted });
	return out;
}

function parseCalls(text) {
	const calls = [];
	const parts = String(text).split(/[;\n]+/).map(function(s) { return s.trim(); }).filter(Boolean);
	for (const part of parts) {
		const m = /^([A-Za-z]+)\s*\((.*)\)$/.exec(part);
		if (!m) return { error: "can't read \"" + part + "\" — write calls like add(x); remove()" };
		const pieces = m[2].trim() ? splitArgs(m[2]) : [];
		if (pieces === null) return { error: "unclosed quote in \"" + part + "\"" };
		const args = pieces.map(function(a) {
			return !a.quoted && /^-?\d+$/.test(a.raw) ? { int: Number(a.raw), text: a.raw } : { text: a.raw };
		});
		calls.push({ name: m[1], args: args, src: part });
	}
	return { calls: calls };
}

function itemOk(text) {
	return text.length >= 1 && text.length <= 8;
}

// Turn calls into a normalised op list, simulating sizes to catch bad indices.
function plan(config) {
	const p = parseCalls(config.ops);
	if (p.error) return { errors: ["\"ops\": " + p.error] };
	if (!p.calls.length) return { errors: ["\"ops\" needs at least one call"] };
	if (p.calls.length > MAX_OPS) return { errors: ["\"ops\" can have at most " + MAX_OPS + " calls"] };
	const errors = [];
	const ops = [];
	let n = 0;
	let cap = config.capacity;
	for (const c of p.calls) {
		const where = "\"ops\": " + c.src + " — ";
		const a = c.args;
		if (c.name === "add" && a.length === 1) {
			if (!itemOk(a[0].text)) { errors.push(where + "items must be 1–8 characters"); continue; }
			ops.push({ kind: "add", index: n, item: a[0].text, append: true, src: c.src });
		} else if (c.name === "add" && a.length === 2) {
			if (a[0].int === undefined) { errors.push(where + "index must be an integer"); continue; }
			if (a[0].int < 0 || a[0].int > n) { errors.push(where + "index must be 0…" + n + " (size is " + n + ")"); continue; }
			if (!itemOk(a[1].text)) { errors.push(where + "items must be 1–8 characters"); continue; }
			ops.push({ kind: "add", index: a[0].int, item: a[1].text, append: false, src: c.src });
		} else if (c.name === "remove" && a.length <= 1) {
			if (n === 0) { errors.push(where + "the list is empty"); continue; }
			let index = n - 1;
			if (a.length === 1) {
				if (a[0].int === undefined || a[0].int < 0 || a[0].int >= n) { errors.push(where + "index must be 0…" + (n - 1)); continue; }
				index = a[0].int;
			}
			ops.push({ kind: "remove", index: index, last: a.length === 0, src: c.src });
		} else if (c.name === "get" && a.length === 1) {
			if (a[0].int === undefined || a[0].int < 0 || a[0].int >= n) { errors.push(where + "index must be 0…" + Math.max(0, n - 1)); continue; }
			ops.push({ kind: "get", index: a[0].int, src: c.src });
		} else {
			errors.push(where + "unknown call (use add(x), add(i, x), remove(), remove(i), get(i))");
			continue;
		}
		const last = ops[ops.length - 1];
		if (last.kind === "add") {
			if (n === cap) cap = config.growth === "double" ? cap * 2 : cap + 1;
			n++;
		} else if (last.kind === "remove") {
			n--;
			if (config.shrink && cap > 1 && n <= Math.floor(cap / 4)) cap = Math.floor(cap / 2);
		}
		if (n > MAX_SIZE) { errors.push("\"ops\": the list grows past " + MAX_SIZE + " items — keep the demo smaller"); break; }
		if (cap > MAX_CAP) { errors.push("\"ops\": capacity would exceed " + MAX_CAP + " — keep the demo smaller"); break; }
	}
	return errors.length ? { errors: errors } : { ops: ops };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const c = Object.assign({ capacity: 2, growth: "double", shrink: true }, config);
	return plan(c).errors || [];
}

export const code = {
	cpp: [
		"void add(size_t index, const T& item) {",
		"    if (n_ == capacity_) resize(2 * capacity_);",
		"    for (size_t i = n_; i > index; --i)",
		"        data_[i] = data_[i - 1];",
		"    data_[index] = item;",
		"    ++n_;",
		"}",
		"T remove(size_t index) {",
		"    T item = data_[index];",
		"    for (size_t i = index; i + 1 < n_; ++i)",
		"        data_[i] = data_[i + 1];",
		"    --n_;",
		"    if (capacity_ > 1 && n_ <= capacity_ / 4)",
		"        resize(capacity_ / 2);",
		"    return item;",
		"}",
		"void resize(size_t newCapacity) {",
		"    T* bigger = new T[newCapacity];",
		"    for (size_t i = 0; i < n_; ++i)",
		"        bigger[i] = data_[i];",
		"    delete[] data_;",
		"    data_ = bigger;",
		"    capacity_ = newCapacity;",
		"}"
	]
};

export const legend = [
	{ cls: "is-sorted", label: "Just written" },
	{ cls: "is-min", label: "Being moved / read" },
	{ cls: "is-swap", label: "Copied into the new buffer" },
	{ cls: "vz-al-empty", label: "Allocated, unused" }
];

export const input = {
	key: "ops",
	label: "Operations",
	format: function(config) { return config.ops; },
	parse: function(text) {
		return String(text).trim() ? { value: String(text).trim() } : { error: "type some calls, e.g. add(A); add(B); add(0, C)" };
	},
	random: function() {
		const words = ["A", "B", "C", "D", "E", "F", "G", "H"];
		const out = [];
		let n = 0;
		for (let k = 0; k < 8; k++) {
			const r = Math.random();
			if (n > 0 && r < 0.25) { out.push("remove()"); n--; }
			else if (n > 0 && r < 0.45) { out.push("add(" + Math.floor(Math.random() * (n + 1)) + ", " + words[k] + ")"); n++; }
			else { out.push("add(" + words[k] + ")"); n++; }
		}
		return out.join("; ");
	}
};

export function steps(config) {
	const ops = plan(config).ops;
	let cap = config.capacity;
	let data = new Array(cap).fill(null);
	let n = 0;
	let copies = 0;
	let moves = 0;
	const frames = [];
	let lastResult = "—";

	function push(f) {
		frames.push({
			data: data.slice(),
			cap: cap,
			n: n,
			newBuf: f.newBuf ? f.newBuf.slice() : null,
			hi: f.hi || {},
			newHi: f.newHi || {},
			lines: f.lines || [],
			msg: f.msg,
			group: f.group,
			vars: [
				["op", f.op || "—"],
				["n_ (size)", String(n)],
				["capacity_", String(cap)],
				["copies (resizes)", String(copies)],
				["shifts", String(moves)],
				["returned", lastResult]
			]
		});
	}

	push({ group: -1, msg: "Start: an empty ArrayList with capacity " + cap + "." + (config.growth === "plus1" ? " This demo grows a full buffer by +1 instead of doubling." : "") });

	function resize(newCap, g, op, why) {
		const bigger = new Array(newCap).fill(null);
		push({ group: g, op: op, newBuf: bigger, lines: why === "grow" ? [2, 18] : [13, 14, 18],
			msg: (why === "grow" ? "Full (n_ == capacity_ == " + cap + "), so resize to " + newCap + (config.growth === "plus1" ? " (this demo grows by +1 instead of the code's 2 × capacity_)" : "") + ": allocate a new buffer." : "n_ = " + n + " ≤ capacity_/4 = " + Math.floor(cap / 4) + ", so shrink: allocate a buffer of capacity " + newCap + ".") });
		for (let i = 0; i < n; i++) {
			bigger[i] = data[i];
			copies++;
			const hi = {}; hi[i] = "is-min";
			const nh = {}; nh[i] = "is-swap";
			push({ group: g, op: op, newBuf: bigger, hi: hi, newHi: nh, lines: [19, 20],
				msg: "Copy `data_[" + i + "]` = " + data[i] + " into the new buffer (copy " + copies + " so far)." });
		}
		push({ group: g, op: op, newBuf: bigger, lines: [21, 22, 23],
			msg: "`delete[]` the old buffer and point `data_` at the new one. That resize cost " + n + " copies." });
		data = bigger;
		cap = newCap;
	}

	ops.forEach(function(o, g) {
		if (o.kind === "get") {
			const hi = {}; hi[o.index] = "is-min";
			lastResult = String(data[o.index]);
			push({ group: g, op: o.src, hi: hi, msg: "`" + o.src + "`: read `data_[" + o.index + "]` = " + data[o.index] + " directly — O(1), no walking." });
			return;
		}
		if (o.kind === "add") {
			lastResult = "—";
			push({ group: g, op: o.src, lines: [1],
				msg: "`" + o.src + "`" + (o.append ? ": append, i.e. insert at index n_ = " + n + "." : ": insert at index " + o.index + ".") });
			if (n === cap) resize(config.growth === "double" ? cap * 2 : cap + 1, g, o.src, "grow");
			for (let i = n; i > o.index; i--) {
				data[i] = data[i - 1];
				moves++;
				const hi = {}; hi[i] = "is-min";
				push({ group: g, op: o.src, hi: hi, lines: [3, 4], msg: "Shift right: `data_[" + i + "] = data_[" + (i - 1) + "]` (" + data[i] + "). Back to front, so nothing is overwritten." });
			}
			data[o.index] = o.item;
			n++;
			const hi = {}; hi[o.index] = "is-sorted";
			push({ group: g, op: o.src, hi: hi, lines: [5, 6], msg: "Write " + o.item + " into `data_[" + o.index + "]` and `++n_` → size " + n + "." });
			return;
		}
		// remove
		const item = data[o.index];
		lastResult = String(item);
		const hr = {}; hr[o.index] = "is-min";
		push({ group: g, op: o.src, hi: hr, lines: [9], msg: "`" + o.src + "`: save `item = data_[" + o.index + "]` = " + item + "." });
		for (let i = o.index; i + 1 < n; i++) {
			data[i] = data[i + 1];
			moves++;
			const hi = {}; hi[i] = "is-min";
			push({ group: g, op: o.src, hi: hi, lines: [10, 11], msg: "Shift left: `data_[" + i + "] = data_[" + (i + 1) + "]` (" + data[i] + "). Front to back." });
		}
		data[n - 1] = null;
		n--;
		push({ group: g, op: o.src, lines: [12], msg: "`--n_` → size " + n + ". The old last slot is now unused." });
		if (config.shrink && cap > 1 && n <= Math.floor(cap / 4)) resize(Math.floor(cap / 2), g, o.src, "shrink");
		push({ group: g, op: o.src, lines: [15], msg: "Return " + item + "." });
	});

	push({ group: ops.length, msg: "Done: size " + n + ", capacity " + cap + ". Resizing copied " + copies + " element(s) in total; shifting moved " + moves + "." });
	return frames;
}

const STYLE = `
.vz-al { display: flex; flex-direction: column; gap: 0.9rem; align-items: center; overflow-x: auto; }
.vz-al-label { color: var(--vz-muted); font-size: 0.78rem; margin-bottom: 0.25rem; text-align: center; }
.vz-al .vz-row { flex-wrap: nowrap; }
.vz-al .vz-col { flex: 0 0 auto; }
/* Items are strings ("ROCKS", "Throws"): let a cell grow to fit its text. */
.vz-al .vz-cell { width: auto; min-width: 3.2rem; height: 3.35rem; aspect-ratio: auto; padding: 0 0.5rem; white-space: nowrap; }
@media (max-width: 736px) { .vz-al .vz-cell { min-width: 2.3rem; height: 2.5rem; padding: 0 0.3rem; } }
.vz-cell.vz-al-empty, .vz-swatch.vz-al-empty { border-style: dashed; color: var(--vz-muted); background: transparent; }
.vz-al-old { opacity: 0.55; }
`;

function ensureStyle() {
	if (document.getElementById("viz-arraylist-style")) return;
	const s = document.createElement("style");
	s.id = "viz-arraylist-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function rowHtml(buf, n, hi, label, extraPtrs) {
	let html = '<div><div class="vz-al-label">' + label + '</div><div class="vz-row">';
	for (let k = 0; k < buf.length; k++) {
		const v = buf[k];
		const cls = ["vz-cell"];
		if (v === null || v === undefined) cls.push("vz-al-empty");
		if (hi[k]) cls.push(hi[k]);
		const ptrs = (extraPtrs && extraPtrs[k]) || "";
		html += '<div class="vz-col"><div class="' + cls.join(" ") + '">' + (v === null || v === undefined ? "" : escapeHtml(v)) +
			'</div><div class="vz-idx">' + k + '</div><div class="vz-ptrs">' + ptrs + "</div></div>";
	}
	return html + "</div></div>";
}

function escapeHtml(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

export function render(stage, frame) {
	ensureStyle();
	const ptrs = {};
	if (frame.n < frame.cap) ptrs[frame.n] = '<span class="vz-ptr">n_</span>';
	let html = '<div class="vz-al">';
	html += '<div class="' + (frame.newBuf ? "vz-al-old" : "") + '">' +
		rowHtml(frame.data, frame.n, frame.hi, "data_ — size " + frame.n + " / capacity " + frame.cap, frame.newBuf ? null : ptrs) + "</div>";
	if (frame.newBuf) html += rowHtml(frame.newBuf, frame.n, frame.newHi, "bigger — new buffer, capacity " + frame.newBuf.length, null);
	stage.innerHTML = html + "</div>";
}
