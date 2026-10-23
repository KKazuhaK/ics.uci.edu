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
export const code = {
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

export const legend = [
	{ cls: "is-cmp", label: "Being compared · aux[i] vs aux[j]" },
	{ cls: "is-swap", label: "Just written · a[k]" },
	{ cls: "is-sorted", label: "Sorted subarray (merge result)" },
	{ cls: "is-out", label: "Outside lo..hi" }
];

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
				["call stack", stack.length ? stack.join(" › ") : "—"],
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
					line = [16, 18]; why = "`aux[j] < aux[i]` is false (" + aux[j] + " vs " + aux[i] + (aux[i] === aux[j] ? ", equal, so the left one wins: stable" : "") + "): take " + show2(aux[i]) + " from the left, `i++`.";
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

	function sort(lo, hi) {
		stack.push("sort(" + lo + "," + hi + ")");
		push({ lo: lo, hi: hi, lines: [1], msg: "Call `sort(a, aux, " + lo + ", " + hi + ")`." });
		if (hi <= lo) {
			addSorted(lo, lo);
			push({ lo: lo, hi: hi, lines: [2], msg: "`hi <= lo`: one element is already sorted, return." });
			stack.pop();
			return;
		}
		const mid = lo + Math.floor((hi - lo) / 2);
		push({ lo: lo, mid: mid, hi: hi, lines: [3], msg: "`mid = " + lo + " + (" + hi + " - " + lo + ") / 2 = " + mid + "`. Left half " + lo + ".." + mid + ", right half " + (mid + 1) + ".." + hi + "." });
		push({ lo: lo, mid: mid, hi: hi, lines: [4], msg: "Recursively sort the left half: `sort(a, aux, " + lo + ", " + mid + ")`." });
		sort(lo, mid);
		push({ lo: lo, mid: mid, hi: hi, lines: [5], msg: "Back in `sort(" + lo + "," + hi + ")`. Recursively sort the right half: `sort(a, aux, " + (mid + 1) + ", " + hi + ")`." });
		sort(mid + 1, hi);
		push({ lo: lo, mid: mid, hi: hi, lines: [6], msg: "Back in `sort(" + lo + "," + hi + ")`: both halves are sorted, so merge them." });
		merge(lo, mid, hi);
		stack.pop();
	}

	if ((config.mode || "sort") === "merge") {
		addSorted(0, config.mid);
		addSorted(config.mid + 1, n - 1);
		push({ lo: 0, mid: config.mid, hi: n - 1, lines: [8, 9],
			msg: "Start: `a[0.." + config.mid + "]` and `a[" + (config.mid + 1) + ".." + (n - 1) + "]` are each sorted. `merge()` combines them into one sorted array." });
		merge(0, config.mid, n - 1);
		push({ lines: [], msg: "Done: " + a.join(" ") + ". " + comparisons + " comparisons for n = " + n + " (between n/2 and n − 1)." });
	} else {
		push({ lines: [], msg: "Start: `sort(a, n)` allocates `aux` (n = " + n + ", empty for now) and calls `sort(a, aux, 0, " + (n - 1) + ")`." });
		sort(0, n - 1);
		push({ lines: [], msg: "Done: " + a.join(" ") + ". Total comparisons: " + comparisons + "." });
	}
	return frames;
}

const STYLE = `
.vz-ms { display: flex; flex-direction: column; gap: 0.35rem; }
.vz-ms .vz-ms-line { display: flex; align-items: flex-start; gap: 0.4rem; }
.vz-ms .vz-ms-name { width: 2.2rem; flex: 0 0 auto; padding-top: 0.55rem; text-align: right; color: var(--vz-muted); font: 0.8rem "Consolas", "Menlo", monospace; }
.vz-ms .vz-row { flex: 1 1 auto; gap: 0.3rem; }
.vz-ms .vz-col { flex: 1 1 2.6rem; }
.vz-ms .vz-cell { width: 100%; }
.vz-cell.is-out, .viz-legend .vz-swatch.is-out { opacity: 0.4; border-style: dashed; }
.vz-cell.is-empty { color: transparent; border-style: dashed; }
.vz-ms .vz-ptrs { min-height: 1.3em; }
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

export function render(stage, frame) {
	ensureStyle();
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
