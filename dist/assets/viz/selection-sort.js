// Selection sort, step by step: each pass scans the unsorted part for the
// minimum, then swaps it to the front of that part.
import { checkParams, parseIntList, randomInts } from "./_core.js";

export const meta = {
	name: "selection-sort",
	summary: "Selection sort on an array: scan for minIdx, swap into place, one pass at a time.",
	groupLabel: "pass",
	params: {
		array: { type: "int[]", required: true, minLength: 2, maxLength: 12, minValue: -99, maxValue: 999, desc: "Values to sort (2–12 integers, -99…999)." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code shown beside the demo, with the running line highlighted." }
	},
	example: { array: [38, 3, 5, 47, 44, 36, 26, 1] }
};

export function validate(config) {
	return checkParams(meta.params, config);
}

export const code = {
	cpp: [
		"for (int i = 0; i < n - 1; i++) {",
		"    int minIdx = i;",
		"    for (int j = i + 1; j < n; j++) {",
		"        if (a[j] < a[minIdx])",
		"            minIdx = j;",
		"    }",
		"    swap(a[i], a[minIdx]);",
		"}"
	]
};

export const legend = [
	{ cls: "is-sorted", label: "Sorted (left part)" },
	{ cls: "is-min", label: "Current minimum · minIdx" },
	{ cls: "is-cmp", label: "Being compared · j" },
	{ cls: "is-swap", label: "Just swapped" }
];

export const input = {
	key: "array",
	label: "Array",
	format: function(config) { return config.array.join(", "); },
	parse: function(text) {
		const r = parseIntList(text);
		return r.error ? { error: r.error } : { value: r.values };
	},
	random: function() { return randomInts(8, 1, 99); }
};

// Build the full list of frames. Each frame is a snapshot the player can show
// on its own: array contents, markers, highlighted code lines, message, vars.
export function steps(config) {
	const a = config.array.slice();
	const n = a.length;
	const frames = [];
	let comparisons = 0;
	let swaps = 0;

	function push(f) {
		const minIdx = f.minIdx;
		frames.push({
			arr: a.slice(),
			sorted: f.sorted,
			i: f.i,
			j: f.j,
			minIdx: minIdx,
			swap: f.swap || null,
			lines: f.lines || [],
			msg: f.msg,
			group: f.group,
			vars: [
				["pass", f.i === undefined ? "—" : (f.i + 1) + " / " + (n - 1)],
				["i", f.i === undefined ? "—" : String(f.i)],
				["j", f.j === undefined ? "—" : String(f.j)],
				["minIdx", minIdx === undefined ? "—" : minIdx + " (value " + a[minIdx] + ")"],
				["comparisons", String(comparisons)],
				["swaps", String(swaps)]
			]
		});
	}

	push({
		sorted: 0,
		group: 0,
		msg: "Start: n = " + n + ". Each pass finds the smallest value in the unsorted part and swaps it to the front of that part."
	});

	for (let i = 0; i < n - 1; i++) {
		let minIdx = i;
		push({
			sorted: i, i: i, minIdx: minIdx, lines: [1, 2], group: i,
			msg: "Pass " + (i + 1) + ": i = " + i + ". Assume `a[" + i + "] = " + a[i] + "` is the smallest so far, so `minIdx = " + i + "`."
		});

		for (let j = i + 1; j < n; j++) {
			comparisons++;
			const smaller = a[j] < a[minIdx];
			push({
				sorted: i, i: i, j: j, minIdx: minIdx, lines: [3, 4], group: i,
				msg: "Compare `a[" + j + "] = " + a[j] + "` with the current min `a[" + minIdx + "] = " + a[minIdx] + "`: " +
					(smaller ? a[j] + " is smaller." : a[j] + " is not smaller, so `minIdx` stays " + minIdx + ".")
			});
			if (smaller) {
				minIdx = j;
				push({
					sorted: i, i: i, j: j, minIdx: minIdx, lines: [5], group: i,
					msg: "New minimum found: `minIdx = " + j + "` (value " + a[j] + ")."
				});
			}
		}

		if (minIdx !== i) {
			const before = [a[i], a[minIdx]];
			[a[i], a[minIdx]] = [a[minIdx], a[i]];
			swaps++;
			push({
				sorted: i + 1, i: i, minIdx: minIdx, swap: [i, minIdx], lines: [7], group: i,
				msg: "`swap(a[" + i + "], a[" + minIdx + "])`: " + before[0] + " ↔ " + before[1] + ". Now `a[" + i + "] = " + a[i] + "` is in its final place."
			});
		} else {
			push({
				sorted: i + 1, i: i, minIdx: i, lines: [7], group: i,
				msg: "`minIdx == i`, so `a[" + i + "] = " + a[i] + "` was already the smallest; the swap changes nothing. It is in its final place."
			});
		}
	}

	push({
		sorted: n, group: n - 1,
		msg: "Done. After n − 1 = " + (n - 1) + " passes the last element is in place automatically. Comparisons = n(n − 1)/2 = " +
			comparisons + " no matter the input; swaps = " + swaps + " (at most n − 1)."
	});
	return frames;
}

// Draw one frame into `stage`. Cells are created once and then updated so
// colour changes can transition instead of flashing.
export function render(stage, frame) {
	const n = frame.arr.length;
	let row = stage.querySelector(".vz-row");
	if (!row || row.childElementCount !== n) {
		stage.textContent = "";
		row = document.createElement("div");
		row.className = "vz-row";
		for (let k = 0; k < n; k++) {
			const col = document.createElement("div");
			col.className = "vz-col";
			col.innerHTML = '<div class="vz-cell"></div><div class="vz-idx">' + k + '</div><div class="vz-ptrs"></div>';
			row.appendChild(col);
		}
		stage.appendChild(row);
	}

	Array.from(row.children).forEach(function(col, k) {
		const cell = col.querySelector(".vz-cell");
		cell.textContent = frame.arr[k];
		const isSwap = !!frame.swap && frame.swap.includes(k);
		cell.classList.toggle("is-swap", isSwap);
		cell.classList.toggle("is-sorted", !isSwap && k < frame.sorted);
		cell.classList.toggle("is-min", !isSwap && k >= frame.sorted && k === frame.minIdx);
		cell.classList.toggle("is-cmp", k === frame.j);

		const ptrs = [];
		if (k === frame.i) ptrs.push('<span class="vz-ptr">i</span>');
		if (k === frame.minIdx && !frame.swap) ptrs.push('<span class="vz-ptr is-min">minIdx</span>');
		if (k === frame.j) ptrs.push('<span class="vz-ptr is-cmp">j</span>');
		col.querySelector(".vz-ptrs").innerHTML = ptrs.join("");
	});
}
