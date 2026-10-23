// Quicksort (Lecture 8) with Sedgewick's partition, exactly as on the
// slides: pivot v = a[lo], i scans right while a[i] < v, j scans left while
// v < a[j], swap when both stop, stop when they cross, then swap a[lo] with
// a[j]. mode "partition" runs one partition(a, 0, n-1); mode "sort" runs the
// whole recursion. The input is taken as already shuffled.
import { checkParams, randomInts } from "./_core.js";

export const meta = {
	name: "quick-sort",
	summary: "Quicksort with the slides' partition(): i and j scan toward each other, swap, then the pivot drops into a[j].",
	groupLabel: "partition",
	params: {
		items: { type: "string", required: true, desc: "Values after the shuffle, comma-separated: integers or short words (2–16 items, 1–3 chars each), e.g. \"K, R, A, T, E\"." },
		mode: { type: "enum", values: ["sort", "partition"], default: "sort", desc: "\"sort\" runs the whole recursion; \"partition\" runs only partition(a, 0, n-1)." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code shown beside the demo, with the running line highlighted." }
	},
	example: { items: "3, 7, 8, 5, 2, 1, 9, 5, 4" }
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
	return { values: numeric ? parts.map(Number) : parts };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const r = parseItems(config.items);
	if (r.error) return ["\"items\" " + r.error];
	return [];
}

// The slide code (sort + partition), lines ≤ 48 chars.
export const code = {
	cpp: [
		"void sort(T* a, int lo, int hi) {",
		"    if (hi <= lo) return;",
		"    int j = partition(a, lo, hi);",
		"    sort(a, lo, j-1);",
		"    sort(a, j+1, hi);",
		"}",
		"int partition(T* a, int lo, int hi) {",
		"    int i = lo;",
		"    int j = hi + 1;",
		"    T v = a[lo];",
		"    while (true) {",
		"        while (i < hi && a[++i] < v) {",
		"            if (i == hi) break;",
		"        }",
		"        while (v < a[--j]) {",
		"            if (j == lo) break;",
		"        }",
		"        if (i >= j) break;",
		"        std::swap(a[i], a[j]);",
		"    }",
		"    std::swap(a[lo], a[j]);",
		"    return j;",
		"}"
	]
};

export const legend = [
	{ cls: "is-min", label: "Pivot v" },
	{ cls: "is-cmp", label: "Being compared with v" },
	{ cls: "is-swap", label: "Just swapped" },
	{ cls: "is-sorted", label: "In its final place" },
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
	random: function() { return randomInts(9, 1, 99).join(", "); }
};

export function steps(config) {
	const a = parseItems(config.items).values.slice();
	const n = a.length;
	const done = new Array(n).fill(false);
	const frames = [];
	const stack = [];
	let comparisons = 0;
	let swaps = 0;
	let group = 0;

	function push(f) {
		frames.push({
			a: a.slice(),
			done: done.slice(),
			lo: f.lo, hi: f.hi,
			i: f.i, j: f.j,
			pivot: f.pivot === undefined ? null : f.pivot,
			cmp: f.cmp === undefined ? null : f.cmp,
			swap: f.swap || null,
			lines: f.lines || [],
			msg: f.msg,
			group: group,
			vars: [
				["call stack", stack.length ? stack.join(" › ") : "—"],
				["lo, hi", f.lo === undefined ? "—" : f.lo + ", " + f.hi],
				["v", f.v === undefined ? "—" : String(f.v)],
				["i, j", f.i === undefined ? "—" : f.i + ", " + f.j],
				["comparisons", String(comparisons)],
				["swaps", String(swaps)]
			]
		});
	}

	function partition(lo, hi) {
		stack.push("partition(" + lo + "," + hi + ")");
		let i = lo;
		let j = hi + 1;
		const v = a[lo];
		const base = function() { return { lo: lo, hi: hi, i: i, j: j, v: v, pivot: lo }; };
		const at = function(f) { return Object.assign(base(), f); };
		push(at({ lines: [8, 9, 10], msg: "`partition(a, " + lo + ", " + hi + ")`: `i = " + lo + "`, `j = hi + 1 = " + (hi + 1) + "`, pivot `v = a[" + lo + "] = " + v + "`." }));
		while (true) {
			// i scans right: while (i < hi && a[++i] < v) { if (i == hi) break; }
			while (true) {
				if (!(i < hi)) {
					push(at({ lines: [12], msg: "`i < hi` is false (i = " + i + "), so `a[++i]` is not evaluated: i stays at " + i + "." }));
					break;
				}
				i++;
				comparisons++;
				const lt = a[i] < v;
				push(at({ cmp: i, lines: [12], msg: "`++i` → i = " + i + ". `a[" + i + "] < v`? " + a[i] + " < " + v + (lt ? " is true: it belongs on the left, keep going." : " is false: i stops on " + a[i] + " (≥ v, it should not stay on the left).") }));
				if (!lt) break;
				if (i === hi) {
					push(at({ lines: [13], msg: "`i == hi`: break, i stops at the right end." }));
					break;
				}
			}
			// j scans left: while (v < a[--j]) { if (j == lo) break; }
			while (true) {
				j--;
				comparisons++;
				const gt = v < a[j];
				push(at({ cmp: j, lines: [15], msg: "`--j` → j = " + j + ". `v < a[" + j + "]`? " + v + " < " + a[j] + (gt ? " is true: it belongs on the right, keep going." : " is false: j stops on " + a[j] + " (≤ v, it should not stay on the right).") }));
				if (!gt) break;
				if (j === lo) {
					push(at({ lines: [16], msg: "`j == lo`: break, j stops at the left end." }));
					break;
				}
			}
			if (i >= j) {
				push(at({ lines: [18], msg: "`i >= j` (" + i + " ≥ " + j + "): the pointers met or crossed, leave the loop." }));
				break;
			}
			const x = a[i], y = a[j];
			[a[i], a[j]] = [a[j], a[i]];
			swaps++;
			push(at({ swap: [i, j], lines: [19], msg: "`i < j`, so swap `a[" + i + "]` and `a[" + j + "]`: " + x + " goes right, " + y + " comes left. Back to the top of `while (true)`." }));
		}
		const y = a[j];
		[a[lo], a[j]] = [a[j], a[lo]];
		if (lo !== j) swaps++;
		done[j] = true;
		push(at({ pivot: j, swap: lo === j ? null : [lo, j], lines: [21], msg: lo === j
			? "`swap(a[lo], a[j])` with j = lo: the pivot " + v + " was already the smallest, it stays at " + j + "."
			: "`swap(a[lo], a[j])`: pivot " + v + " moves to index " + j + " (and " + y + ", which is ≤ v, moves to the front). Now " + v + " is in its final place." }));
		push(at({ pivot: j, lines: [22], msg: "`return " + j + "`: everything in " + lo + ".." + (j - 1) + " is ≤ " + v + ", everything in " + (j + 1) + ".." + hi + " is ≥ " + v + "." }));
		stack.pop();
		group++;
		return j;
	}

	function sort(lo, hi) {
		stack.push("sort(" + lo + "," + hi + ")");
		push({ lo: lo, hi: hi, lines: [1], msg: "Call `sort(a, " + lo + ", " + hi + ")`." });
		if (hi <= lo) {
			if (hi === lo) done[lo] = true;
			push({ lo: lo, hi: hi, lines: [2], msg: hi === lo ? "`hi <= lo`: one element (" + a[lo] + ") is already in its final place, return." : "`hi <= lo` (" + hi + " < " + lo + "): empty range, return." });
			stack.pop();
			return;
		}
		push({ lo: lo, hi: hi, lines: [3], msg: "Partition `a[" + lo + ".." + hi + "]`." });
		const j = partition(lo, hi);
		push({ lo: lo, hi: hi, lines: [4], msg: "Back in `sort(" + lo + "," + hi + ")` with j = " + j + ". Sort the left part: `sort(a, " + lo + ", " + (j - 1) + ")`." });
		sort(lo, j - 1);
		push({ lo: lo, hi: hi, lines: [5], msg: "Back in `sort(" + lo + "," + hi + ")`. Sort the right part: `sort(a, " + (j + 1) + ", " + hi + ")`." });
		sort(j + 1, hi);
		stack.pop();
	}

	if ((config.mode || "sort") === "partition") {
		push({ lines: [], msg: "One `partition(a, 0, " + (n - 1) + ")` on the shuffled array." });
		const j = partition(0, n - 1);
		push({ lines: [], msg: "Done: " + a.join(" ") + ", j = " + j + "." });
	} else {
		push({ lines: [], msg: "Start (array already shuffled): `sort(a, 0, " + (n - 1) + ")`." });
		sort(0, n - 1);
		push({ lines: [], msg: "Done: " + a.join(" ") + ". " + comparisons + " comparisons, " + swaps + " swaps." });
	}
	return frames;
}

const STYLE = `
.vz-qs .vz-row { gap: 0.3rem; }
.vz-qs .vz-col { flex: 1 1 2.6rem; }
.vz-qs .vz-cell { width: 100%; }
.vz-cell.is-out, .viz-legend .vz-swatch.is-out { opacity: 0.4; border-style: dashed; }
.vz-qs .vz-col.is-ghost .vz-cell { border-style: dashed; color: var(--vz-muted); font-size: 0.7rem; opacity: 0.6; }
`;

function ensureStyle() {
	if (document.getElementById("viz-quick-sort-style")) return;
	const s = document.createElement("style");
	s.id = "viz-quick-sort-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

export function render(stage, frame) {
	ensureStyle();
	const n = frame.a.length;
	let box = stage.querySelector(".vz-qs");
	if (!box || box.dataset.n !== String(n)) {
		stage.textContent = "";
		box = document.createElement("div");
		box.className = "vz-qs";
		box.dataset.n = String(n);
		const row = document.createElement("div");
		row.className = "vz-row";
		for (let k = 0; k <= n; k++) {
			const col = document.createElement("div");
			col.className = "vz-col" + (k === n ? " is-ghost" : "");
			col.innerHTML = '<div class="vz-ptrs"></div><div class="vz-cell"></div><div class="vz-idx">' + k + '</div>';
			row.appendChild(col);
		}
		box.appendChild(row);
		stage.appendChild(box);
	}
	Array.from(box.querySelector(".vz-row").children).forEach(function(col, k) {
		const cell = col.querySelector(".vz-cell");
		const p = [];
		if (frame.i !== undefined && k === frame.i) p.push('<span class="vz-ptr is-cmp">i ↓</span>');
		if (frame.j !== undefined && k === frame.j) p.push('<span class="vz-ptr is-min">j ↓</span>');
		col.querySelector(".vz-ptrs").innerHTML = p.join("");
		if (k === n) {
			cell.textContent = "end";
			col.style.visibility = frame.j === n ? "visible" : "hidden";
			return;
		}
		cell.textContent = frame.a[k];
		const inRange = frame.lo === undefined || (k >= frame.lo && k <= frame.hi);
		const isSwap = !!frame.swap && frame.swap.includes(k);
		cell.classList.toggle("is-swap", isSwap);
		cell.classList.toggle("is-min", !isSwap && k === frame.pivot && !frame.done[k]);
		cell.classList.toggle("is-sorted", !isSwap && frame.done[k]);
		cell.classList.toggle("is-cmp", k === frame.cmp);
		cell.classList.toggle("is-out", !inRange && !frame.done[k]);
	});
}
