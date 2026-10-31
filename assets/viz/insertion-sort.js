// Insertion sort, step by step (swap version from the ICS 46 slides): each
// pass takes the next element and swaps it left past every larger neighbour,
// stopping (break) at the first neighbour that is not larger.
import { checkParams, parseIntList, randomInts } from "./_core.js";

export const meta = {
  name: "insertion-sort",
  summary: "Insertion sort on an array: swap a[j] left while a[j] < a[j-1], break at the first in-order pair.",
  groupLabel: "pass",
  params: {
    array: { type: "int[]", required: true, minLength: 2, maxLength: 12, minValue: -99, maxValue: 999, desc: "Values to sort (2–12 integers, -99…999)." },
    code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code shown beside the demo, with the running line highlighted." }
  },
  example: { array: [3, 44, 38, 5, 47, 1, 36, 26] }
};

export function validate(config) {
  return checkParams(meta.params, config);
}

export const code = {
  cpp: [
    "for (int i = 0; i < size; i++) {",
    "    for (int j = i; j > 0; j--) {",
    "        if (arr[j] < arr[j-1]) {",
    "            std::swap(arr[j], arr[j-1]);",
    "        }",
    "        else break;",
    "    }",
    "}"
  ]
};

export const legend = [
  { cls: "is-sorted", label: "Sorted part a[0…i−1]" },
  { cls: "is-min", label: "Element being inserted · j" },
  { cls: "is-cmp", label: "Compared with · j − 1" },
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

export function steps(config) {
  const a = config.array.slice();
  const n = a.length;
  const frames = [];
  let comparisons = 0;
  let swaps = 0;

  function push(f) {
    frames.push({
      arr: a.slice(),
      sorted: f.sorted,
      i: f.i,
      j: f.j,
      key: f.key,
      cmp: f.cmp,
      swap: f.swap || null,
      lines: f.lines || [],
      msg: f.msg,
      group: f.group,
      vars: [
        ["pass", f.i === undefined ? "—" : "i = " + f.i + " of " + (n - 1)],
        ["j", f.j === undefined ? "—" : String(f.j)],
        ["inserting", f.val === undefined ? "—" : String(f.val)],
        ["comparisons", String(comparisons)],
        ["swaps", String(swaps)]
      ]
    });
  }

  push({
    sorted: 0, group: 0,
    msg: "Start: n = " + n + ". Pass i inserts `arr[i]` into the sorted part `arr[0…i−1]` by swapping it left past every larger neighbour."
  });

  for (let i = 0; i < n; i++) {
    const val = a[i];
    if (i === 0) {
      push({
        sorted: 1, i: 0, j: 0, val: val, lines: [1, 2], group: 0,
        msg: "Pass i = 0: `j = 0`, so `j > 0` is false and the inner loop never runs. A single element is already sorted."
      });
      continue;
    }
    push({
      sorted: i, i: i, j: i, key: i, val: val, lines: [1, 2], group: i,
      msg: "Pass i = " + i + ": insert `arr[" + i + "] = " + val + "` into the sorted part `arr[0…" + (i - 1) + "]`. Start with `j = " + i + "`."
    });
    let j = i;
    let stopped = false;
    for (; j > 0; j--) {
      comparisons++;
      const less = a[j] < a[j - 1];
      push({
        sorted: i, i: i, j: j, key: j, cmp: j - 1, val: val, lines: [3], group: i,
        msg: "Compare `arr[" + j + "] = " + a[j] + "` < `arr[" + (j - 1) + "] = " + a[j - 1] + "`? " + (less ? "Yes." : "No.")
      });
      if (less) {
        [a[j], a[j - 1]] = [a[j - 1], a[j]];
        swaps++;
        push({
          sorted: i, i: i, j: j, key: j - 1, swap: [j - 1, j], val: val, lines: [4], group: i,
          msg: "`std::swap(arr[" + j + "], arr[" + (j - 1) + "])`: " + val + " moves one slot left. Then `j--`."
        });
      } else {
        push({
          sorted: i + 1, i: i, j: j, key: j, val: val, lines: [6], group: i,
          msg: "`else break;` — " + val + " is not smaller than its left neighbour, so it is in place. Everything further left is even smaller: stop early."
        });
        stopped = true;
        break;
      }
    }
    if (!stopped) {
      push({
        sorted: i + 1, i: i, j: 0, key: 0, val: val, lines: [2], group: i,
        msg: "`j` reached 0: " + val + " is the smallest so far and now sits at the front. Pass " + i + " made " + i + " comparisons and " + i + " swaps (the worst a pass can do)."
      });
    }
  }

  const worst = n * (n - 1) / 2;
  push({
    sorted: n, group: n - 1,
    msg: "Done: " + comparisons + " comparisons, " + swaps + " swaps. Swaps = number of out-of-order pairs (inversions) in the input. " +
      "Best case (already sorted): n − 1 = " + (n - 1) + " comparisons, 0 swaps. Worst case (reverse sorted): n(n − 1)/2 = " + worst + " of each."
  });
  return frames;
}

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
    const isKey = !isSwap && frame.key === k && frame.sorted <= (frame.i === undefined ? -1 : frame.i);
    cell.classList.toggle("is-swap", isSwap);
    cell.classList.toggle("is-min", isKey);
    cell.classList.toggle("is-sorted", !isSwap && !isKey && (k < frame.sorted || (frame.i !== undefined && k <= frame.i && frame.sorted <= frame.i)));
    cell.classList.toggle("is-cmp", k === frame.cmp);

    const ptrs = [];
    if (k === frame.i) ptrs.push('<span class="vz-ptr">i</span>');
    const jAt = frame.key !== undefined ? frame.key : frame.j;
    if (frame.i !== undefined && frame.i > 0 && k === jAt) ptrs.push('<span class="vz-ptr is-min">j</span>');
    if (k === frame.cmp) ptrs.push('<span class="vz-ptr is-cmp">j−1</span>');
    col.querySelector(".vz-ptrs").innerHTML = ptrs.join("");
  });
}
