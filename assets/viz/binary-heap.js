// Binary heap (array-backed, pq[0] unused): insert + swim, sink, swim, and
// delMax, step by step, drawn both as the tree and as the array.
import { checkParams } from "./_core.js";

const MAXN = 15;

export const meta = {
	name: "binary-heap",
	summary: "Array-backed binary heap: insert (swim up), swim(k), sink(k), delMax(), shown as tree and array.",
	groupLabel: "operation",
	params: {
		heap: { type: "string", default: "", desc: "Starting keys pq[1..n] in level order, comma-separated (ints or 1–3 char words; at most 15). Need not be heap-ordered when the first op is swim/sink." },
		ops: { type: "string", required: true, desc: "Operations separated by ';': insert(x), swim(k), sink(k), delMax(). delMin() on a min-heap. At most 16." },
		order: { type: "enum", values: ["max", "min"], default: "max", desc: "Max-heap (parent ≥ children) or min-heap (parent ≤ children; less() is flipped, use delMin())." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code shown beside the demo, with the running line highlighted." }
	},
	example: { heap: "100, 19, 36, 17, 3, 25, 1, 2, 7", ops: "insert(47)" }
};

function splitItems(text) {
	return String(text).split(/\s*[,，]\s*/).map(function(s) { return s.trim(); }).filter(function(s) { return s !== ""; });
}

function parseHeap(text) {
	const items = splitItems(text);
	if (items.length > MAXN) return { error: "\"heap\" has " + items.length + " keys; at most " + MAXN };
	for (const s of items) {
		if (s.length > 3) return { error: "\"heap\": key \"" + s + "\" is longer than 3 characters" };
	}
	return { items: items };
}

function parseOps(text) {
	const parts = String(text).split(";").map(function(s) { return s.trim(); }).filter(Boolean);
	if (parts.length === 0) return { error: "\"ops\" is empty" };
	if (parts.length > 16) return { error: "\"ops\" has " + parts.length + " operations; at most 16" };
	const ops = [];
	for (const p of parts) {
		let m;
		if ((m = /^insert\(\s*"?([^"),\s]{1,3})"?\s*\)$/.exec(p))) ops.push({ op: "insert", x: m[1] });
		else if ((m = /^(swim|sink)\(\s*(\d+)\s*\)$/.exec(p))) ops.push({ op: m[1], k: Number(m[2]) });
		else if ((m = /^del(Max|Min)\(\s*\)$/.exec(p))) ops.push({ op: "delMax", name: "del" + m[1] });
		else return { error: "\"ops\": can't read \"" + p + "\" (use insert(x), swim(k), sink(k), delMax())" };
	}
	return { ops: ops };
}

function numeric(items) {
	return items.length > 0 && items.every(function(s) { return /^-?\d+$/.test(s); });
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const h = parseHeap(config.heap || "");
	if (h.error) return [h.error];
	const o = parseOps(config.ops);
	if (o.error) return [o.error];
	const all = h.items.concat(o.ops.filter(function(x) { return x.op === "insert"; }).map(function(x) { return x.x; }));
	if (all.length && !numeric(all) && all.some(function(s) { return /^-?\d+$/.test(s); })) {
		return ["\"heap\"/\"ops\": mix of numbers and words; use one kind so keys compare sensibly"];
	}
	const want = config.order === "min" ? "delMin" : "delMax";
	for (const x of o.ops) {
		if (x.name && x.name !== want) return ["\"ops\": " + x.name + "() doesn't match a " + (config.order === "min" ? "min" : "max") + "-heap; use " + want + "()"];
	}
	let n = h.items.length;
	for (const x of o.ops) {
		if (x.op === "insert") { n++; if (n > MAXN) return ["\"ops\": insert would make the heap bigger than " + MAXN]; }
		else if (x.op === "delMax") { if (n === 0) return ["\"ops\": delMax() on an empty heap"]; n--; }
		else if (x.k < 1 || x.k > n) return ["\"ops\": " + x.op + "(" + x.k + ") is out of range (heap has n = " + n + ")"];
	}
	return [];
}

// Line numbers below are 1-based into this array.
const CODE_LINES = [
	"void insert(const Key& x) {",       // 1
	"    pq[++n] = x;",                   // 2
	"    swim(n);",                       // 3
	"}",                                  // 4
	"void swim(size_t k) {",              // 5
	"    while (k > 1 && less(k/2, k)) {",// 6
	"        exch(k, k/2);",              // 7
	"        k = k/2;",                   // 8
	"    }",                              // 9
	"}",                                  // 10
	"void sink(int k) {",                 // 11
	"    while (2*k <= n) {",             // 12
	"        int j = 2*k;",               // 13
	"        if (j < n && less(j, j+1))", // 14
	"            j++;",                   // 15
	"        if (!less(k, j)) break;",    // 16
	"        exch(k, j);",                // 17
	"        k = j;",                     // 18
	"    }",                              // 19
	"}",                                  // 20
	"Key delMax() {",                     // 21
	"    Key max = pq[1];",               // 22
	"    exch(1, n--);",                  // 23
	"    sink(1);",                       // 24
	"    return max;",                    // 25
	"}"                                   // 26
];

// Sections of CODE_LINES (1-based, inclusive); show only the ones the ops use.
const SECTIONS = { insert: [1, 4], swim: [5, 10], sink: [11, 20], delMax: [21, 26] };

function usedSections(config) {
	const r = parseOps(config.ops || "");
	const used = { insert: false, swim: false, sink: false, delMax: false };
	(r.ops || []).forEach(function(o) {
		used[o.op] = true;
		if (o.op === "insert") used.swim = true;
		if (o.op === "delMax") used.sink = true;
	});
	if (!r.ops) for (const k in used) used[k] = true;
	return used;
}

// old line number -> shown line number (0 = hidden)
function lineMap(config) {
	const used = usedSections(config);
	const map = {};
	let shown = 0;
	for (const name of ["insert", "swim", "sink", "delMax"]) {
		const sec = SECTIONS[name];
		for (let l = sec[0]; l <= sec[1]; l++) map[l] = used[name] ? ++shown : 0;
	}
	return map;
}

export function code(config) {
	const map = lineMap(config);
	const lines = CODE_LINES.map(function(l) {
		return config.order === "min" ? l.replace("delMax()", "delMin()").replace("Key max", "Key min").replace("return max", "return min") : l;
	});
	return { cpp: lines.filter(function(_, i) { return map[i + 1] > 0; }) };
}

export const legend = [
	{ cls: "is-cmp", label: "k (the key moving)" },
	{ cls: "is-min", label: "Compared with" },
	{ cls: "is-swap", label: "Just exchanged" },
	{ cls: "is-sorted", label: "Settled / returned" }
];

export const input = {
	key: "ops",
	label: "Operations",
	format: function(config) { return config.ops; },
	parse: function(text) {
		const r = parseOps(text);
		return r.error ? { error: r.error } : { value: text };
	},
	random: function(config) {
		const heap = splitItems((config && config.heap) || "");
		const words = heap.length > 0 && !numeric(heap);
		const ops = [];
		for (let i = 0; i < 3; i++) {
			ops.push("insert(" + (words ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)] : Math.floor(Math.random() * 99 + 1)) + ")");
		}
		ops.push(config && config.order === "min" ? "delMin()" : "delMax()");
		return ops.join("; ");
	}
};

export function steps(config) {
	const isMin = config.order === "min";
	const raw = parseHeap(config.heap || "").items;
	const ops = parseOps(config.ops).ops;
	const allKeys = raw.concat(ops.filter(function(x) { return x.op === "insert"; }).map(function(x) { return x.x; }));
	const num = numeric(allKeys);
	const val = function(s) { return num ? Number(s) : s; };
	const pq = [null].concat(raw);
	let n = raw.length;
	let compares = 0, exchanges = 0;
	let returned = "—";
	const frames = [];
	const parentWord = isMin ? "smaller" : "larger";

	// less(i, j) in the slides' sense: for a min-heap the comparison flips.
	function less(i, j) {
		compares++;
		const a = val(pq[i]), b = val(pq[j]);
		return isMin ? a > b : a < b;
	}
	function exch(i, j) { exchanges++; const t = pq[i]; pq[i] = pq[j]; pq[j] = t; }

	function push(f) {
		frames.push({
			pq: pq.slice(0, n + 1),
			ghost: f.ghost || null,
			k: f.k || 0, j: f.j || 0,
			swapped: f.swapped || null,
			swap: f.swapped && f.swapped.length === 2 ? f.swapped.slice() : null,
			step: frames.length,
			settled: f.settled || 0,
			lines: f.lines || [],
			group: f.group,
			msg: f.msg,
			vars: [
				["n", String(n)],
				["k", f.k ? String(f.k) : "—"],
				["j", f.j ? String(f.j) : "—"],
				["compares", String(compares)],
				["exchanges", String(exchanges)],
				["returned", returned]
			]
		});
	}

	push({ group: 0, msg: (isMin ? "Min" : "Max") + "-heap in an array: `pq[0]` unused, root at `pq[1]`, the children of `pq[k]` are `pq[2k]` and `pq[2k+1]`, its parent is `pq[k/2]`." +
		(n ? " n = " + n + "." : " Empty heap.") });

	function swim(k, g, base) {
		// base = line offset: swim's lines 5..10.
		while (true) {
			if (k <= 1) {
				push({ k: k, settled: k, lines: [6], group: g, msg: "k = 1: `" + pq[k] + "` reached the root, so the loop stops." });
				return;
			}
			const p = Math.floor(k / 2);
			const lt = less(p, k);
			push({ k: k, j: p, lines: [6], group: g,
				msg: "Parent of k = " + k + " is k/2 = " + p + ". `less(" + p + ", " + k + ")`: is `" + pq[p] + "` " + (isMin ? "larger" : "smaller") + " than `" + pq[k] + "`? " +
					(lt ? "Yes — heap order is violated." : "No — `" + pq[k] + "` is in place.") });
			if (!lt) { push({ k: k, settled: k, lines: [9, 10], group: g, msg: "Heap order holds again; swim stops at k = " + k + "." }); return; }
			exch(k, p);
			push({ k: p, swapped: [k, p], lines: [7, 8], group: g,
				msg: "`exch(" + k + ", " + p + ")`: the " + parentWord + " key `" + pq[p] + "` moves up; `k = k/2 = " + p + "`." });
			k = p;
		}
	}

	function sink(k, g) {
		while (true) {
			if (2 * k > n) {
				push({ k: k, settled: k, lines: [12], group: g, msg: "2k = " + (2 * k) + " > n = " + n + ": `" + pq[k] + "` is a leaf now, so sink stops." });
				return;
			}
			let j = 2 * k;
			push({ k: k, j: j, lines: [12, 13], group: g, msg: "2k = " + j + " ≤ n: `" + pq[k] + "` has a child. Start with the left child, j = " + j + " (`" + pq[j] + "`)." });
			if (j < n) {
				const pick = less(j, j + 1);
				if (pick) j++;
				push({ k: k, j: j, lines: pick ? [14, 15] : [14], group: g,
					msg: "Compare the two children `" + pq[2 * k] + "` and `" + pq[2 * k + 1] + "`: " +
						(String(pq[2 * k]) === String(pq[2 * k + 1]) ? "they tie, so j stays at the left child " + j + "." : "the " + parentWord + " one is `" + pq[j] + "` at j = " + j + ".") });
			}
			const ok = !less(k, j);
			if (ok) {
				push({ k: k, j: j, settled: k, lines: [16], group: g,
					msg: "`less(" + k + ", " + j + ")` is false: `" + pq[k] + "` is not " + (isMin ? "larger" : "smaller") + " than `" + pq[j] + "`. Heap order holds; break." });
				return;
			}
			exch(k, j);
			push({ k: j, swapped: [k, j], lines: [17, 18], group: g,
				msg: "`exch(" + k + ", " + j + ")`: `" + pq[k] + "` moves up, `" + pq[j] + "` moves down; `k = j = " + j + "`." });
			k = j;
		}
	}

	ops.forEach(function(o, idx) {
		const g = idx + 1;
		if (o.op === "insert") {
			pq[++n] = o.x;
			pq.length = n + 1;
			push({ k: n, lines: [1, 2], group: g, msg: "`insert(" + o.x + ")`: put it at the end of the bottom level, `pq[" + n + "]` (n is now " + n + ")." });
			push({ k: n, lines: [3, 5], group: g, msg: "`swim(" + n + ")`: move it up while it is " + parentWord + " than its parent." });
			swim(n, g);
		} else if (o.op === "swim") {
			push({ k: o.k, lines: [5], group: g, msg: "`swim(" + o.k + ")`: `" + pq[o.k] + "` may be " + parentWord + " than its parent." });
			swim(o.k, g);
		} else if (o.op === "sink") {
			push({ k: o.k, lines: [11], group: g, msg: "`sink(" + o.k + ")`: `" + pq[o.k] + "` may be " + (isMin ? "larger" : "smaller") + " than a child." });
			sink(o.k, g);
		} else {
			const top = pq[1];
			push({ k: 1, lines: [21, 22], group: g, msg: "`" + (isMin ? "delMin" : "delMax") + "()`: the " + (isMin ? "minimum" : "maximum") + " is at the root, `max = pq[1] = " + top + "`." });
			const last = n;
			exch(1, n);
			const removed = pq[n];
			n--;
			pq.length = n + 1;
			returned = String(removed);
			push({ k: 1, ghost: { idx: last, key: removed }, swapped: last !== 1 ? [1, last] : null, lines: [23], group: g,
				msg: n >= 1
					? "`exch(1, n--)`: the last key `" + pq[1] + "` goes to the root and `" + removed + "` leaves the heap (n is now " + n + ")."
					: "`exch(1, n--)`: `" + removed + "` was the only key; it leaves and the heap is empty." });
			if (n >= 1) {
				push({ k: 1, lines: [24, 11], group: g, msg: "`sink(1)`: the new root is probably too " + (isMin ? "large" : "small") + "; sink it." });
				sink(1, g);
			}
			push({ lines: [25], group: g, msg: "Return `" + removed + "`." });
		}
	});

	const map = lineMap(config);
	frames.forEach(function(f) { f.lines = f.lines.map(function(l) { return map[l]; }).filter(Boolean); });
	push({ group: ops.length, msg: "Done. Heap: " + (n ? pq.slice(1, n + 1).join(" ") : "(empty)") + ". Each swim/sink walks one root-to-leaf path: O(log n)." });
	return frames;
}

// ---------- drawing ----------
// The DOM is built once per heap shape and then only updated, so colour
// changes fade (CSS transitions) and an exchange is animated: the two keys
// glide along the tree edge, and the player arcs the two array cells
// (frame.swap). Motion runs only on a forward step.

const CSS = `
.vz-bh-wrap { overflow-x: auto; }
.vz-bh { display: block; margin: 0 auto; font-family: "Consolas", "Menlo", monospace; overflow: visible; }
.vz-bh .bh-edge { stroke: var(--vz-muted); stroke-width: 1.4; }
.vz-bh .bh-edge.is-path { stroke: var(--vz-swap-bd); stroke-width: 4; }
.vz-bh .bh-node circle { fill: var(--vz-surface); stroke: var(--vz-border); stroke-width: 1.6; transition: fill .3s, stroke .3s, stroke-width .3s; }
.vz-bh .bh-node text { fill: var(--vz-ink); font-weight: 600; text-anchor: middle; dominant-baseline: central; font-size: 13px; transition: fill .3s; }
.vz-bh .bh-node.is-cmp circle { fill: var(--vz-cmp-bg); stroke: var(--vz-cmp-bd); stroke-width: 3; }
.vz-bh .bh-node.is-min circle { fill: var(--vz-min-bg); stroke: var(--vz-min-bd); stroke-width: 2.5; }
.vz-bh .bh-node.is-min text { fill: var(--vz-min-fg); }
.vz-bh .bh-node.is-swap circle { fill: var(--vz-swap-bg); stroke: var(--vz-swap-bd); stroke-width: 2.5; }
.vz-bh .bh-node.is-swap text { fill: var(--vz-swap-fg); }
.vz-bh .bh-node.is-sorted circle { fill: var(--vz-sorted-bg); stroke: var(--vz-sorted-bd); }
.vz-bh .bh-node.is-sorted text { fill: var(--vz-sorted-fg); }
.vz-bh .bh-node.is-ghost circle { stroke-dasharray: 4 3; fill: none; }
.vz-bh .bh-node.is-ghost text { fill: var(--vz-muted); }
.vz-bh .bh-node.is-new { animation: vz-bh-pop .45s ease-out; }
.vz-bh .bh-idx { fill: var(--vz-blue); font-size: 10px; font-weight: 700; text-anchor: end; }
.vz-bh-arr .vz-cell.is-unused { color: var(--vz-muted); border-style: dashed; }
.vz-bh-arr .vz-cell.is-ghost { color: var(--vz-muted); border-style: dashed; text-decoration: line-through; }
@keyframes vz-bh-pop { from { opacity: 0; transform: translateY(-14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .vz-bh .bh-node.is-new { animation: none; } }
`;

function ensureCss() {
	if (document.getElementById("viz-binary-heap-style")) return;
	const st = document.createElement("style");
	st.id = "viz-binary-heap-style";
	st.textContent = CSS;
	document.head.appendChild(st);
}

const SVGNS = "http://www.w3.org/2000/svg";
function el(tag, attrs, parent) {
	const e = document.createElementNS(SVGNS, tag);
	for (const k in attrs) e.setAttribute(k, attrs[k]);
	if (parent) parent.appendChild(e);
	return e;
}

function cls(frame, i) {
	if (frame.swapped && frame.swapped.indexOf(i) >= 0) return "is-swap";
	if (i === frame.k && i === frame.settled) return "is-sorted";
	if (i === frame.k) return "is-cmp";
	if (i === frame.j) return "is-min";
	return "";
}

function reducedMotion() {
	return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Build the SVG tree + array row for `total` slots.
function build(stage, total) {
	const depth = total ? Math.floor(Math.log2(total)) : 0;
	const slots = Math.pow(2, depth);
	const colW = 46, rowH = 56, pad = 24, R = 15;
	const W = Math.max(slots * colW + pad * 2, 220), H = (depth + 1) * rowH + pad;
	const pos = [null];
	for (let i = 1; i <= total; i++) {
		const d = Math.floor(Math.log2(i));
		const span = slots / Math.pow(2, d);
		pos.push({ x: pad + ((i - Math.pow(2, d)) * span + span / 2) * colW, y: pad + d * rowH });
	}
	stage.textContent = "";
	const wrap = document.createElement("div");
	wrap.className = "vz-bh-wrap";
	const svg = el("svg", { "class": "vz-bh", viewBox: "0 0 " + W + " " + H, width: W, role: "img", "aria-label": "binary heap" });
	svg.style.maxWidth = "100%";
	svg.style.height = "auto";
	const edges = [null, null], nodes = [null];
	const gE = el("g", {}, svg), gN = el("g", {}, svg);
	for (let i = 2; i <= total; i++) {
		edges.push(el("line", { "class": "bh-edge", x1: pos[i >> 1].x, y1: pos[i >> 1].y, x2: pos[i].x, y2: pos[i].y }, gE));
	}
	for (let i = 1; i <= total; i++) {
		const g = el("g", { "class": "bh-node" }, gN);
		el("circle", { cx: pos[i].x, cy: pos[i].y, r: R }, g);
		const t = el("text", { x: pos[i].x, y: pos[i].y }, g);
		const ix = el("text", { "class": "bh-idx", x: pos[i].x - R + 1, y: pos[i].y - R - 1 }, gN);
		ix.textContent = String(i);
		nodes.push({ g: g, text: t, idx: ix });
	}
	wrap.appendChild(svg);
	const row = document.createElement("div");
	row.className = "vz-row vz-bh-arr";
	const cells = [];
	for (let i = 0; i <= total; i++) {
		const col = document.createElement("div");
		col.className = "vz-col";
		col.innerHTML = '<div class="vz-cell"></div><div class="vz-idx">' + i + "</div>";
		row.appendChild(col);
		cells.push(col.firstChild);
	}
	stage.appendChild(wrap);
	stage.appendChild(row);
	return { total: total, pos: pos, edges: edges, nodes: nodes, cells: cells, lastStep: -2, lastN: -1 };
}

export function render(stage, frame) {
	ensureCss();
	const pq = frame.pq;
	const n = pq.length - 1;
	const total = Math.max(n, frame.ghost ? frame.ghost.idx : 0);
	let st = stage._bh;
	// Rebuild only when the number of slots changes (insert / delMax) or the stage was emptied.
	if (!st || st.total !== total || !stage.contains(st.cells[0])) {
		const prev = st;
		st = stage._bh = build(stage, total);
		// Keep the step history so the frame that grew/shrank the heap still counts as a forward step.
		if (prev) { st.lastStep = prev.lastStep; st.lastN = prev.lastN; }
	}
	// Finish any glide still running (fast playback) before drawing the next frame.
	(st.anims || []).forEach(function(an) { an.cancel(); });
	st.anims = [];
	const forward = frame.step === st.lastStep + 1;
	const grew = forward && st.lastN >= 0 && n > st.lastN;

	for (let i = 1; i <= total; i++) {
		const node = st.nodes[i];
		let label, c;
		if (i <= n) { label = pq[i]; c = cls(frame, i); }
		else if (frame.ghost && frame.ghost.idx === i) { label = frame.ghost.key; c = "is-ghost"; }
		else { label = null; }
		node.g.style.display = label === null ? "none" : "";
		if (label === null) node.g.setAttribute("class", "bh-node");
		node.idx.style.display = label === null ? "none" : "";
		if (label !== null) {
			node.text.textContent = String(label);
			node.g.setAttribute("class", "bh-node " + c + (grew && i === n ? " is-new" : ""));
		}
		if (i >= 2) {
			const e = st.edges[i];
			e.style.display = label === null ? "none" : "";
			if (i > n) e.setAttribute("stroke-dasharray", "4 3"); else e.removeAttribute("stroke-dasharray");
			const onPath = frame.swapped && frame.swapped.length === 2 && frame.swapped.indexOf(i) >= 0 && frame.swapped.indexOf(i >> 1) >= 0;
			e.setAttribute("class", "bh-edge" + (onPath ? " is-path" : ""));
		}
	}
	for (let i = 0; i <= total; i++) {
		const cell = st.cells[i];
		if (i === 0) { cell.textContent = "–"; cell.className = "vz-cell is-unused"; }
		else if (i <= n) { cell.textContent = String(pq[i]); cell.className = "vz-cell " + cls(frame, i); }
		else { cell.textContent = String(frame.ghost.key); cell.className = "vz-cell is-ghost"; }
	}

	// Exchange: the two keys (already showing their new values) glide from each
	// other's node along the edge, one bowing left and one right so they don't overlap.
	if (forward && frame.swapped && frame.swapped.length === 2 && !reducedMotion()) {
		const a = frame.swapped[0], b = frame.swapped[1];
		const pa = st.pos[a], pb = st.pos[b];
		if (pa && pb && st.nodes[a].g.animate) {
			const opts = { duration: 600, easing: "cubic-bezier(0.45, 0, 0.25, 1)" };
			const nx = -(pb.y - pa.y), ny = pb.x - pa.x, len = Math.hypot(nx, ny) || 1, bow = 16;
			[[a, pb, pa, 1], [b, pa, pb, -1]].forEach(function(t) {
				const from = t[1], to = t[2], sgn = t[3];
				const dx = from.x - to.x, dy = from.y - to.y;
				const mx = dx / 2 + sgn * bow * nx / len, my = dy / 2 + sgn * bow * ny / len;
				st.anims.push(st.nodes[t[0]].g.animate([
					{ transform: "translate(" + dx + "px," + dy + "px)" },
					{ transform: "translate(" + mx + "px," + my + "px)", offset: 0.5 },
					{ transform: "translate(0px,0px)" }
				], opts));
			});
		}
	}
	st.lastStep = frame.step;
	st.lastN = n;
}
