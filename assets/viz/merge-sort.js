// Top-down merge sort (Lecture 8), step by step: the recursive sort() calls
// with lo/mid/hi, and every merge() with its copy to aux and the k loop
// that picks from the left (i) or right (j) half. mode "merge" shows one
// merge of two already sorted halves (the slides' A G L O R | H I M S T).
import { checkParams, randomInts } from "./_core.js";

export const meta = {
	name: "merge-sort",
	summary: "Merge sort with an aux array: recursive splits, then merge() picks from aux[i] or aux[j] for each k.",
	groupLabel: "merge",
	params: {
		items: { type: "string", required: true, desc: "Values, comma-separated: integers or short words (2–16 items, 1–3 chars each), e.g. \"M, E, R, G, E, S, R, T\"." },
		mode: { type: "enum", values: ["sort", "merge"], default: "sort", desc: "\"sort\" runs the whole recursion; \"merge\" runs one merge(a, aux, 0, mid, n-1)." },
		mid: { type: "int", min: 0, desc: "Only for mode \"merge\": last index of the left half. Both halves must already be sorted." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code shown beside the demo, with the running line highlighted." }
	},
	example: { items: "M, E, R, G, E, S, R, T" }
};

function parseItems(text) {
	const parts = String(text).split(/[\s,，]+/).filter(Boolean);
	if (parts.length < 2) return { error: "needs at least 2 items" };
	if (parts.length > 16) return { error: "can have at most 16 items" };
	for (const p of parts) {
		if (p.length > 3 && !/^-?\d+$/.test(p)) return { error: "\"" + p + "\" is longer than 3 characters" };
		if (/^-?\d+$/.test(p) && (Number(p) < -99 || Number(p) > 999)) return { error: "\"" + p + "\" must be between -99 and 999" };
	}
	const numeric = parts.every(function(p) { return /^-?\d+$/.test(p); });
	return { values: numeric ? parts.map(Number) : parts, numeric: numeric };
}

function less(x, y) { return x < y; }

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const r = parseItems(config.items);
	if (r.error) return ["\"items\" " + r.error];
	const mode = config.mode || "sort";
	if (mode === "merge") {
		const n = r.values.length;
		if (config.mid === undefined) return ["mode \"merge\" needs \"mid\" (last index of the left half)"];
		if (config.mid > n - 2) return ["\"mid\" must be between 0 and " + (n - 2) + " so both halves are non-empty"];
		for (let k = 1; k < n; k++) {
			if (k === config.mid + 1) continue;
			if (less(r.values[k], r.values[k - 1])) {
				return ["for mode \"merge\" both halves must be sorted: \"" + r.values[k - 1] + "\" comes before \"" + r.values[k] + "\""];
			}
		}
	} else if (config.mid !== undefined) {
		return ["\"mid\" is only used with mode \"merge\""];
	}
	return [];
}

// The slide code, compacted to fit the panel (≤ 48 chars per line).
const CODE = {
	cpp: [
		"void sort(T* a, T* aux, int lo, int hi) {",
		"    if (hi <= lo) return;",
		"    int mid = lo + (hi - lo) / 2;",
		"    sort(a, aux, lo, mid);",
		"    sort(a, aux, mid+1, hi);",
		"    merge(a, aux, lo, mid, hi);",
		"}",
		"void merge(T* a, T* aux, int lo, int mid,",
		"           int hi) {",
		"    for (int k = lo; k <= hi; k++)",
		"        aux[k] = a[k];",
		"    int i = lo, j = mid + 1;",
		"    for (int k = lo; k <= hi; k++) {",
		"        if (i > mid) a[k] = aux[j++];",
		"        else if (j > hi) a[k] = aux[i++];",
		"        else if (aux[j] < aux[i])",
		"            a[k] = aux[j++];",
		"        else a[k] = aux[i++];",
		"    }",
		"}"
	]
};

// Mode "merge" only runs merge(), so it shows just that function (lines 8–20,
// renumbered 1–13 in steps()) to keep the demo short.
const MERGE_FROM = 8;
export function code(config) {
	if ((config.mode || "sort") === "sort") return CODE;
	return { cpp: CODE.cpp.slice(MERGE_FROM - 1) };
}

// Sort mode (recursion tree) and merge mode (aux + a rows) colour different things.
export function legend(config) {
	if ((config.mode || "sort") === "sort") {
		return [
			{ cls: "is-cur", label: "Current call" },
			{ cls: "is-cmp", label: "Being compared · aux[i] vs aux[j]" },
			{ cls: "is-swap", label: "Just written · a[k]" },
			{ cls: "is-sorted", label: "Sorted (merge result)" },
			{ cls: "is-used", label: "Already taken by the merge" }
		];
	}
	return [
		{ cls: "is-cmp", label: "Being compared · aux[i] vs aux[j]" },
		{ cls: "is-swap", label: "Just written · a[k]" },
		{ cls: "is-sorted", label: "Sorted subarray (merge result)" },
		{ cls: "is-out", label: "Outside lo..hi" }
	];
}

export const input = {
	key: "items",
	label: "Items",
	format: function(config) { return config.items; },
	parse: function(text) {
		const r = parseItems(text);
		return r.error ? { error: r.error } : { value: r.values.join(", ") };
	},
	random: function() { return randomInts(8, 1, 99).join(", "); }
};

function show(v) { return v === null ? "" : String(v); }

export function steps(config) {
	const parsed = parseItems(config.items);
	const a = parsed.values.slice();
	const n = a.length;
	const aux = new Array(n).fill(null);
	const frames = [];
	const stack = [];
	let comparisons = 0;
	let group = 0;
	let sortedRanges = [];
	const mergeOnly = (config.mode || "sort") === "merge";

	function push(f) {
		frames.push({
			a: a.slice(),
			aux: aux.slice(),
			lo: f.lo, mid: f.mid, hi: f.hi,
			i: f.i, j: f.j, k: f.k,
			cmp: f.cmp || null,
			wrote: f.wrote === undefined ? null : f.wrote,
			sorted: sortedRanges.map(function(r) { return r.slice(); }),
			lines: f.lines || [],
			msg: f.msg,
			group: group,
			vars: [
				...(mergeOnly ? [] : [["call stack", stack.length ? stack.join(" › ") : "—"]]),
				["lo, mid, hi", f.lo === undefined ? "—" : f.lo + ", " + (f.mid === undefined ? "?" : f.mid) + ", " + f.hi],
				["i, j, k", f.i === undefined ? "—" : f.i + ", " + f.j + ", " + (f.k === undefined ? "—" : f.k)],
				["comparisons", String(comparisons)]
			]
		});
	}

	function addSorted(lo, hi) {
		sortedRanges = sortedRanges.filter(function(r) { return r[1] < lo || r[0] > hi; });
		sortedRanges.push([lo, hi]);
	}

	function merge(lo, mid, hi) {
		const show2 = function(x) { return "`" + x + "`"; };
		for (let k = lo; k <= hi; k++) aux[k] = a[k];
		push({ lo: lo, mid: mid, hi: hi, lines: [10, 11],
			msg: "`merge(a, aux, " + lo + ", " + mid + ", " + hi + ")`: copy `a[" + lo + ".." + hi + "]` into `aux`. Left half is `aux[" + lo + ".." + mid + "]`, right half is `aux[" + (mid + 1) + ".." + hi + "]`, both sorted." });
		let i = lo, j = mid + 1;
		push({ lo: lo, mid: mid, hi: hi, i: i, j: j, lines: [12],
			msg: "`i = " + i + "` starts the left half, `j = " + j + "` starts the right half." });
		for (let k = lo; k <= hi; k++) {
			let line, why;
			let cmp = null;
			if (i > mid) {
				line = [14]; why = "`i > mid` (left half used up): take " + show2(aux[j]) + " from the right, `j++`.";
				a[k] = aux[j++];
			} else if (j > hi) {
				line = [15]; why = "`j > hi` (right half used up): take " + show2(aux[i]) + " from the left, `i++`.";
				a[k] = aux[i++];
			} else {
				comparisons++;
				cmp = [i, j];
				if (less(aux[j], aux[i])) {
					line = [16, 17]; why = "`aux[j] < aux[i]` (" + aux[j] + " < " + aux[i] + "): take " + show2(aux[j]) + " from the right, `j++`.";
					a[k] = aux[j++];
				} else {
					line = [18]; why = "`aux[j] < aux[i]` is false (" + aux[j] + " vs " + aux[i] + (aux[i] === aux[j] ? ", equal, so the left one wins: stable" : "") + "): take " + show2(aux[i]) + " from the left, `i++`.";
					a[k] = aux[i++];
				}
			}
			push({ lo: lo, mid: mid, hi: hi, i: i, j: j, k: k, cmp: cmp, wrote: k, lines: line,
				msg: "k = " + k + ": " + why + " `a[" + k + "] = " + a[k] + "`." });
		}
		addSorted(lo, hi);
		push({ lo: lo, mid: mid, hi: hi, lines: [20],
			msg: "Merge done: `a[" + lo + ".." + hi + "]` = " + a.slice(lo, hi + 1).join(" ") + " is sorted." });
		group++;
	}

	// Sort mode draws the recursion tree: one node per sort(lo, hi) call,
	// showing its values when called, then filled in slot by slot by merge().
	const nodes = [];
	const nodeAt = {};
	(function build(lo, hi, d) {
		const node = { lo: lo, hi: hi, d: d, state: "hidden", vals: null };
		nodes.push(node);
		nodeAt[lo + "-" + hi] = node;
		if (hi > lo) {
			const mid = lo + Math.floor((hi - lo) / 2);
			build(lo, mid, d + 1);
			build(mid + 1, hi, d + 1);
		}
	})(0, n - 1, 0);
	let current = null;
	let merging = null;

	function pushTree(f) {
		push(f);
		frames[frames.length - 1].tree = {
			n: n,
			nodes: nodes.map(function(x) { return { lo: x.lo, hi: x.hi, d: x.d, state: x.state, vals: x.vals ? x.vals.slice() : null }; }),
			cur: current,
			merge: merging ? { lo: merging[0], mid: merging[1], hi: merging[2], i: f.i, j: f.j, k: f.k } : null,
			cmp: f.cmp || null,
			wrote: f.wrote === undefined ? null : f.wrote
		};
	}

	function treeMerge(lo, mid, hi) {
		const node = nodeAt[lo + "-" + hi];
		for (let k = lo; k <= hi; k++) aux[k] = a[k];
		merging = [lo, mid, hi];
		node.state = "merge";
		node.vals = new Array(hi - lo + 1).fill(null);
		let i = lo, j = mid + 1;
		pushTree({ lo: lo, mid: mid, hi: hi, i: i, j: j, lines: [10, 11, 12],
			msg: "Both halves of `sort(" + lo + "," + hi + ")` are sorted. `merge()` copies `a[" + lo + ".." + hi + "]` to `aux` (the two halves below) and refills `a[" + lo + ".." + hi + "]` from the front: `i = " + i + "` on the left half, `j = " + j + "` on the right." });
		for (let k = lo; k <= hi; k++) {
			let line, why;
			let cmp = null;
			if (i > mid) {
				line = [14]; why = "left half used up: take `" + aux[j] + "` from the right";
				a[k] = aux[j++];
			} else if (j > hi) {
				line = [15]; why = "right half used up: take `" + aux[i] + "` from the left";
				a[k] = aux[i++];
			} else {
				comparisons++;
				cmp = [i, j];
				if (less(aux[j], aux[i])) {
					line = [16, 17]; why = "`" + aux[j] + " < " + aux[i] + "`: take `" + aux[j] + "` from the right";
					a[k] = aux[j++];
				} else {
					line = [18]; why = (aux[i] === aux[j] ? "`" + aux[i] + "` = `" + aux[j] + "`, the left one wins (stable)" : "`" + aux[i] + " ≤ " + aux[j] + "`") + ": take `" + aux[i] + "` from the left";
					a[k] = aux[i++];
				}
			}
			node.vals[k - lo] = a[k];
			pushTree({ lo: lo, mid: mid, hi: hi, i: i, j: j, k: k, cmp: cmp, wrote: k, lines: line,
				msg: "k = " + k + ": " + why + ", `a[" + k + "] = " + a[k] + "`." });
		}
		merging = null;
		node.state = "done";
		nodeAt[lo + "-" + mid].state = "used";
		nodeAt[(mid + 1) + "-" + hi].state = "used";
		addSorted(lo, hi);
		pushTree({ lo: lo, mid: mid, hi: hi, lines: [20],
			msg: "Merge done: `a[" + lo + ".." + hi + "]` = " + a.slice(lo, hi + 1).join(" ") + " is sorted." });
		group++;
	}

	function sort(lo, hi, side) {
		const node = nodeAt[lo + "-" + hi];
		const where = side ? "The " + side + " half: " : "";
		stack.push("sort(" + lo + "," + hi + ")");
		current = lo + "-" + hi;
		node.vals = a.slice(lo, hi + 1);
		if (hi <= lo) {
			node.state = "done";
			addSorted(lo, lo);
			pushTree({ lo: lo, hi: hi, lines: [2], msg: where + "`sort(" + lo + "," + hi + ")` has one element (`" + a[lo] + "`): already sorted, return." });
			stack.pop();
			return;
		}
		node.state = "open";
		const mid = lo + Math.floor((hi - lo) / 2);
		pushTree({ lo: lo, mid: mid, hi: hi, lines: [3],
			msg: where + "`sort(" + lo + "," + hi + ")`: `mid = " + mid + "`, split into " + lo + ".." + mid + " and " + (mid + 1) + ".." + hi + ", then sort each half." });
		sort(lo, mid, "left");
		current = lo + "-" + hi;
		sort(mid + 1, hi, "right");
		current = lo + "-" + hi;
		treeMerge(lo, mid, hi);
		stack.pop();
		current = stack.length ? current : null;
	}

	if ((config.mode || "sort") === "merge") {
		addSorted(0, config.mid);
		addSorted(config.mid + 1, n - 1);
		push({ lo: 0, mid: config.mid, hi: n - 1, lines: [8, 9],
			msg: "Start: `a[0.." + config.mid + "]` and `a[" + (config.mid + 1) + ".." + (n - 1) + "]` are each sorted. `merge()` combines them into one sorted array." });
		merge(0, config.mid, n - 1);
		push({ lines: [], msg: "Done: " + a.join(" ") + ". " + comparisons + " comparisons for n = " + n + " (between n/2 and n − 1)." });
		frames.forEach(function(f) { f.lines = f.lines.map(function(l) { return l - MERGE_FROM + 1; }); });
	} else {
		sort(0, n - 1, null);
		current = null;
		pushTree({ lines: [], msg: "Done: " + a.join(" ") + ". " + comparisons + " comparisons; every level of the tree costs at most n, and there are lg n levels: ~n lg n." });
	}
	return frames;
}

const STYLE = `
.vz-ms { display: flex; flex-direction: column; gap: 0.35rem; }
.vz-ms .vz-ms-line { display: flex; justify-content: center; align-items: flex-start; gap: 0.4rem; }
.vz-ms .vz-ms-line::after { content: ""; width: 2.2rem; flex: 0 1 auto; }
.vz-ms .vz-ms-name { width: 2.2rem; flex: 0 0 auto; padding-top: 0.75rem; text-align: right; color: var(--vz-muted); font: 0.8rem "Consolas", "Menlo", monospace; }
.vz-ms .vz-row { flex: 0 1 auto; min-width: 0; gap: 0.3rem; }
.vz-ms .vz-col { flex: 0 1 auto; width: 3.2rem; }
.vz-ms .vz-cell { width: 100%; aspect-ratio: auto; height: 2.5rem; font-size: 1.05rem; border-radius: 0.5rem; }
.vz-ms .vz-idx { margin-top: 0.15rem; }
.vz-cell.is-out, .viz-legend .vz-swatch.is-out { opacity: 0.4; border-style: dashed; }
.vz-cell.is-empty { color: transparent; border-style: dashed; }
.vz-ms .vz-ptrs { min-height: 1.3em; flex-direction: row; gap: 0.3rem; }
.vz-mt { display: grid; gap: 0.55rem 0; justify-content: center; }
.vz-mt-idx { text-align: center; color: var(--vz-muted); font-size: 0.72rem; font-variant-numeric: tabular-nums; }
.vz-mt-node { display: flex; gap: 0.2rem; padding: 0.2rem; margin: 0 0.15rem; border: 1.5px solid transparent; border-radius: 0.7rem; transition: opacity 0.25s, border-color 0.25s; }
.vz-mt-node.is-hidden { visibility: hidden; }
.vz-mt-node.is-cur { border-color: var(--vz-min-bd); background: var(--vz-min-bg); }
.vz-mt-node.is-faded { opacity: 0.45; }
.vz-mt .vz-cell { flex: 1 1 0; min-width: 0; aspect-ratio: auto; height: 2.3rem; font-size: 1rem; border-radius: 0.5rem; }
.vz-mt .vz-cell.is-used { opacity: 0.35; }
.vz-mt .vz-cell[data-ptr]::after { content: attr(data-ptr); position: absolute; top: -0.55rem; right: -0.2rem; padding: 0 0.25rem; border-radius: 0.4rem; background: var(--vz-surface); color: var(--vz-blue); font: 600 0.68rem/1.3 "Consolas", "Menlo", monospace; }
.viz-legend .vz-swatch.is-cur { background: var(--vz-min-bg); border-color: var(--vz-min-bd); }
.viz-legend .vz-swatch.is-used { background: var(--vz-sorted-bg); border-color: var(--vz-sorted-bd); opacity: 0.35; }
@media (max-width: 736px) { .vz-mt .vz-cell { height: 1.9rem; font-size: 0.85rem; } .vz-mt-node { gap: 0.12rem; padding: 0.12rem; margin: 0 0.08rem; } }
`;

function ensureStyle() {
	if (document.getElementById("viz-merge-sort-style")) return;
	const s = document.createElement("style");
	s.id = "viz-merge-sort-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function buildRow(name, n) {
	const line = document.createElement("div");
	line.className = "vz-ms-line";
	line.innerHTML = '<div class="vz-ms-name">' + name + '</div><div class="vz-row"></div>';
	const row = line.querySelector(".vz-row");
	for (let k = 0; k < n; k++) {
		const col = document.createElement("div");
		col.className = "vz-col";
		col.innerHTML = '<div class="vz-cell"></div><div class="vz-idx">' + k + '</div><div class="vz-ptrs"></div>';
		row.appendChild(col);
	}
	return line;
}

function renderTree(stage, t) {
	let box = stage.querySelector(".vz-mt");
	if (!box || box.dataset.n !== String(t.n)) {
		stage.textContent = "";
		box = document.createElement("div");
		box.className = "vz-mt";
		box.dataset.n = String(t.n);
		box.style.gridTemplateColumns = "repeat(" + t.n + ", minmax(0, 3.2rem))";
		let html = "";
		for (let k = 0; k < t.n; k++) html += '<div class="vz-mt-idx" style="grid-row:1;grid-column:' + (k + 1) + '">' + k + "</div>";
		t.nodes.forEach(function(x) {
			let cells = "";
			for (let k = x.lo; k <= x.hi; k++) cells += '<div class="vz-cell"></div>';
			html += '<div class="vz-mt-node" data-key="' + x.lo + "-" + x.hi + '" style="grid-row:' + (x.d + 2) + ";grid-column:" + (x.lo + 1) + " / " + (x.hi + 2) + '">' + cells + "</div>";
		});
		box.innerHTML = html;
		stage.appendChild(box);
	}
	const m = t.merge;
	t.nodes.forEach(function(x) {
		const key = x.lo + "-" + x.hi;
		const el = box.querySelector('[data-key="' + key + '"]');
		el.classList.toggle("is-hidden", x.state === "hidden");
		el.classList.toggle("is-cur", t.cur === key && x.state !== "done");
		el.classList.toggle("is-faded", x.state === "used");
		// Which half of the running merge this node is, if any.
		const half = !m ? null : (x.lo === m.lo && x.hi === m.mid) ? "left" : (x.lo === m.mid + 1 && x.hi === m.hi) ? "right" : null;
		Array.from(el.children).forEach(function(cell, t2) {
			const k = x.lo + t2;
			const v = x.vals ? x.vals[t2] : null;
			cell.textContent = v === null || v === undefined ? "" : String(v);
			const empty = x.state === "merge" && v === null;
			const wrote = x.state === "merge" && t.wrote === k;
			cell.classList.toggle("is-empty", empty);
			cell.classList.toggle("is-swap", wrote);
			cell.classList.toggle("is-sorted", !wrote && !empty && (x.state === "done" || x.state === "used" || x.state === "merge"));
			let used = false, ptr = null;
			if (half === "left") { used = m.i !== undefined && k < m.i; if (k === m.i) ptr = "i"; }
			if (half === "right") { used = m.j !== undefined && k < m.j; if (k === m.j) ptr = "j"; }
			if (x.state === "merge" && m && m.k !== undefined && k === m.k) ptr = "k";
			cell.classList.toggle("is-used", used);
			cell.classList.toggle("is-cmp", !!half && !!t.cmp && t.cmp.includes(k));
			if (ptr) cell.dataset.ptr = ptr; else delete cell.dataset.ptr;
		});
	});
}

export function render(stage, frame) {
	ensureStyle();
	if (frame.tree) return renderTree(stage, frame.tree);
	const n = frame.a.length;
	let box = stage.querySelector(".vz-ms");
	if (!box || box.dataset.n !== String(n)) {
		stage.textContent = "";
		box = document.createElement("div");
		box.className = "vz-ms";
		box.dataset.n = String(n);
		box.appendChild(buildRow("aux", n));
		box.appendChild(buildRow("a", n));
		stage.appendChild(box);
	}
	const rows = box.querySelectorAll(".vz-row");
	const inRange = function(k) { return frame.lo === undefined || (k >= frame.lo && k <= frame.hi); };
	// Inside a running merge, only the slots already written (lo..k) are a
	// sorted result; the old halves still in a[] are about to be overwritten.
	const merging = frame.i !== undefined && frame.lo !== undefined;
	const isSorted = function(k) {
		if (merging && k >= frame.lo && k <= frame.hi) return frame.k !== undefined && k <= frame.k;
		return frame.sorted.some(function(r) { return k >= r[0] && k <= r[1] && r[1] > r[0]; });
	};

	Array.from(rows[0].children).forEach(function(col, k) {
		const cell = col.querySelector(".vz-cell");
		cell.textContent = show(frame.aux[k]);
		cell.classList.toggle("is-empty", frame.aux[k] === null);
		cell.classList.toggle("is-out", !inRange(k));
		cell.classList.toggle("is-cmp", !!frame.cmp && frame.cmp.includes(k));
		const p = [];
		if (k === frame.lo) p.push('<span class="vz-ptr">lo</span>');
		if (k === frame.mid) p.push('<span class="vz-ptr">mid</span>');
		if (k === frame.hi) p.push('<span class="vz-ptr">hi</span>');
		if (frame.i !== undefined && k === frame.i) p.push('<span class="vz-ptr is-cmp">i</span>');
		if (frame.j !== undefined && k === frame.j) p.push('<span class="vz-ptr is-min">j</span>');
		col.querySelector(".vz-ptrs").innerHTML = p.join("");
	});

	Array.from(rows[1].children).forEach(function(col, k) {
		const cell = col.querySelector(".vz-cell");
		cell.textContent = show(frame.a[k]);
		const wrote = frame.wrote === k;
		cell.classList.toggle("is-swap", wrote);
		cell.classList.toggle("is-sorted", !wrote && isSorted(k));
		cell.classList.toggle("is-out", !inRange(k));
		col.querySelector(".vz-ptrs").innerHTML = frame.k !== undefined && k === frame.k ? '<span class="vz-ptr">k</span>' : "";
	});
}
