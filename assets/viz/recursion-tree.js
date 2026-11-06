// Recursion tree for a recurrence T(n) = a·T(n/b) + f(n) (or T(n) = T(n-1) + f(n)),
// revealed one level at a time with the work charged to each call, the level
// totals, and at the end the sum plus which part of the tree dominates
// (the Master Theorem's three cases).
import { checkParams } from "./_core.js";

export const meta = {
  name: "recursion-tree",
  summary: "Recursion-tree method: expand T(n) = aT(n/b) + f(n) level by level, sum the levels, read off the Big-O.",
  groupLabel: "level",
  params: {
    recurrence: { type: "string", required: true, desc: "e.g. \"T(n) = 2T(n/2) + n\", \"T(n) = T(n/2) + c\", \"T(n) = b + T(n-1)\". Work term: c, b, 1, O(1), n, n^2, n^3 (O(...) allowed)." },
    n: { type: "int", min: 1, max: 64, desc: "Input size to draw. Divide: a power of b (default: largest that fits). Subtract: 1–8 (default 5)." },
    base: { type: "string", default: "c", desc: "Name of the base-case cost, T(1) (divide) or T(0) (subtract). One letter." },
    code: { type: "enum", values: ["none", "factorial"], default: "none", desc: "\"factorial\" shows the slide's factorial code (subtract form only)." }
  },
  example: { recurrence: "T(n) = 2T(n/2) + n", n: 8 }
};

const SUP = { 2: "²", 3: "³" };

// Parse the recurrence text. Returns { a, b, mode, d, w } or { error }.
export function parseRecurrence(text) {
  let s = String(text).replace(/\s+/g, "").replace(/·|\*/g, "");
  s = s.replace(/^T\(n\)=/i, "");
  const tm = s.match(/(\d*)T\(n([\/-])(\d+)\)/);
  if (!tm) return { error: "can't find the recursive term — write it like 2T(n/2) or T(n-1)" };
  const a = tm[1] === "" ? 1 : Number(tm[1]);
  const mode = tm[2] === "/" ? "divide" : "subtract";
  const b = Number(tm[3]);
  let rest = (s.slice(0, tm.index) + s.slice(tm.index + tm[0].length)).replace(/\+\+/g, "+").replace(/^\+|\+$/g, "");
  let m = rest.match(/^O\((.*)\)$/i);
  if (m) rest = m[1];
  let d, w;
  if (/^[a-z]$/i.test(rest) && rest.toLowerCase() !== "n") { d = 0; w = rest; }
  else if (rest === "1") { d = 0; w = "c"; }
  else if (rest === "n") { d = 1; w = "n"; }
  else if ((m = rest.match(/^n(?:\^([0-9])|([²³]))$/))) { d = m[1] ? Number(m[1]) : (m[2] === "²" ? 2 : 3); w = "n" + SUP[d]; }
  else return { error: "work term \"" + (rest || "(missing)") + "\" not understood — use c, 1, n, n^2 or n^3" };
  if (d > 3) return { error: "work term: exponent must be 0–3" };
  return { a: a, b: b, mode: mode, d: d, w: w };
}

function defaultN(r) {
  if (r.mode === "subtract") return 5;
  let k = 0;
  while (k < 5 && Math.pow(r.a, k + 1) <= 16 && Math.pow(r.b, k + 1) <= 64) k++;
  if (r.a === 1) k = Math.min(5, Math.floor(Math.log(32) / Math.log(r.b) + 1e-9));
  return Math.pow(r.b, Math.max(k, 1));
}

function analyse(config) {
  const r = parseRecurrence(config.recurrence);
  if (r.error) return { error: r.error };
  if (r.mode === "divide") {
    if (r.a < 1 || r.a > 4) return { error: "\"recurrence\": a (number of subproblems) must be 1–4 to draw" };
    if (r.b < 2 || r.b > 4) return { error: "\"recurrence\": b in T(n/b) must be 2–4 to draw (non-integer b: solve with the formula)" };
  } else {
    if (r.b !== 1) return { error: "\"recurrence\": only T(n-1) is supported for the subtract form" };
    if (r.a !== 1) return { error: "\"recurrence\": aT(n-1) with a > 1 has 2ⁿ-style growth and is too big to draw; use a = 1" };
  }
  const n = config.n === undefined ? defaultN(r) : config.n;
  if (r.mode === "divide") {
    let k = 0, p = 1;
    while (p < n) { p *= r.b; k++; }
    if (p !== n) return { error: "\"n\" must be a power of b = " + r.b + " (got " + n + ")" };
    if (k < 1) return { error: "\"n\" must be at least b = " + r.b };
    if (Math.pow(r.a, k) > 32) return { error: "too many leaves (" + Math.pow(r.a, k) + "); pick a smaller \"n\" (at most 32 leaves)" };
    if (k > 6) return { error: "\"n\" gives more than 7 levels; pick a smaller \"n\"" };
    r.k = k;
  } else {
    if (n > 8) return { error: "\"n\" must be 1–8 for T(n-1) recurrences" };
    r.k = n;
  }
  r.n = n;
  return r;
}

export function validate(config) {
  const errs = checkParams(meta.params, config);
  if (errs.length) return errs;
  if (config.base !== undefined && !/^[a-z]$/i.test(config.base)) return ["\"base\" must be a single letter like \"c\" or \"a\""];
  const r = analyse(config);
  if (r.error) return [r.error];
  if (config.code === "factorial" && r.mode !== "subtract") return ["\"code\": \"factorial\" needs a T(n-1) recurrence"];
  return [];
}

export const code = {
  factorial: [
    "int factorial(int n)",
    "{",
    "    if (n == 0)",
    "        return 1;",
    "    else",
    "        return n * factorial(n - 1);",
    "}"
  ]
};

export const legend = [
  { cls: "is-cmp", label: "Level being expanded" },
  { cls: "is-sorted", label: "Levels already summed" },
  { cls: "is-min", label: "Where most of the work is (final step)" }
];

const EXAMPLES = ["T(n) = 2T(n/2) + n", "T(n) = T(n/2) + c", "T(n) = 2T(n/2) + c", "T(n) = 4T(n/2) + n",
  "T(n) = 4T(n/2) + n^2", "T(n) = 2T(n/2) + n^2", "T(n) = 3T(n/2) + n", "T(n) = 3T(n/3) + n", "T(n) = b + T(n-1)"];

export const input = {
  key: "recurrence",
  label: "Recurrence",
  format: function(config) { return config.recurrence; },
  parse: function(text) {
    const r = parseRecurrence(text);
    return r.error ? { error: r.error } : { value: String(text).trim() };
  },
  random: function() { return EXAMPLES[Math.floor(Math.random() * EXAMPLES.length)]; }
};

// A cost is { num, w, base }: num units of n-work, w copies of the work letter, base copies of the base letter.
function fmtCost(c, r, baseName) {
  if (c.w && c.base && r.w === baseName) c = { num: c.num, w: c.w + c.base, base: 0 };
  const parts = [];
  if (c.num) parts.push(String(c.num));
  if (c.w) parts.push((c.w === 1 ? "" : c.w) + r.w);
  if (c.base) parts.push((c.base === 1 ? "" : c.base) + baseName);
  return parts.length ? parts.join(" + ") : "0";
}
function addCost(x, y) { return { num: x.num + y.num, w: x.w + y.w, base: x.base + y.base }; }
function scale(c, k) { return { num: c.num * k, w: c.w * k, base: c.base * k }; }

function sizeLabel(r, i) {
  if (r.mode === "subtract") return i === 0 ? "n" : "n−" + i;
  if (i === 0) return "n";
  const den = Math.pow(r.b, i);
  return "n/" + den;
}

function fmtExp(x) {
  const v = Math.round(x * 100) / 100;
  return String(v);
}

export function steps(config) {
  const r = analyse(config);
  const baseName = config.base || "c";
  const fact = config.code === "factorial";
  const frames = [];
  const levels = [];
  let running = { num: 0, w: 0, base: 0 };

  for (let i = 0; i <= r.k; i++) {
    const count = r.mode === "divide" ? Math.pow(r.a, i) : 1;
    const size = r.mode === "divide" ? r.n / Math.pow(r.b, i) : r.n - i;
    const leaf = i === r.k;
    let per;
    if (leaf) per = { num: 0, w: 0, base: 1 };
    else if (r.d === 0) per = { num: 0, w: 1, base: 0 };
    else per = { num: Math.pow(size, r.d), w: 0, base: 0 };
    levels.push({ count: count, size: size, leaf: leaf, per: per, total: scale(per, count) });
  }

  function push(f) {
    frames.push({
      shown: f.shown, cur: f.cur, summed: f.summed, dom: f.dom || null, levels: levels, r: r, baseName: baseName,
      lines: f.lines || [], msg: f.msg, group: f.group,
      vars: f.vars
    });
  }

  const rec = r.mode === "divide"
    ? "T(n) = " + (r.a === 1 ? "" : r.a) + "T(n/" + r.b + ") + " + r.w + ",  T(1) = " + baseName
    : "T(n) = " + r.w + " + T(n−1),  T(0) = " + baseName;
  push({
    shown: 0, cur: -1, summed: -1, group: 0,
    msg: "Recurrence " + rec + ". Draw it for n = " + r.n + ": every call is a node; charge each call only the work it does itself (not its recursive calls).",
    vars: [["recurrence", rec], ["n", String(r.n)], ["level", "—"], ["running sum", "0"]]
  });

  for (let i = 0; i <= r.k; i++) {
    const L = levels[i];
    running = addCost(running, L.total);
    let msg;
    if (L.leaf) {
      msg = "Level " + i + " (leaves): " + L.count + (L.count === 1 ? " base case" : " base cases") + " T(" + L.size + "), each costs " + baseName +
        " → level total `" + fmtCost(L.total, r, baseName) + "`.";
    } else {
      const each = fmtCost(L.per, r, baseName);
      msg = "Level " + i + ": " + L.count + (L.count === 1 ? " call" : " calls") + " on input size " + sizeLabel(r, i) + " = " + L.size +
        "; each does " + (r.d === 0 ? each : r.w + " = " + each) + " work outside its recursive calls → level total `" + fmtCost(L.total, r, baseName) + "`.";
    }
    push({
      shown: i, cur: i, summed: i, group: i,
      lines: fact ? (L.leaf ? [3, 4] : [6]) : [],
      msg: msg,
      vars: [["recurrence", rec], ["n", String(r.n)], ["level", i + " / " + r.k], ["calls", String(L.count)],
        ["size", String(L.size)], ["level total", fmtCost(L.total, r, baseName)], ["running sum", fmtCost(running, r, baseName)]]
    });
  }

  // Final verdict.
  let msg, dom;
  const nLevels = r.k + 1;
  if (r.mode === "subtract") {
    dom = "all";
    msg = "Sum of all " + nLevels + " levels = `" + fmtCost(running, r, baseName) + "`. In general there are n + 1 calls: " +
      (r.d === 0 ? "n·" + r.w + " + " + baseName + " → O(n)." : "the sizes n, n−1, …, 1 each do size^" + r.d + " work → O(n^" + (r.d + 1) + ").");
  } else {
    const bd = Math.pow(r.b, r.d);
    const logba = Math.log(r.a) / Math.log(r.b);
    const nd = r.d === 0 ? "1" : (r.d === 1 ? "n" : "n^" + r.d);
    const ndw = r.d === 0 ? r.w : nd;
    const head = "Sum = `" + fmtCost(running, r, baseName) + "` over " + nLevels + " levels (log" + r.b + " n + 1). Leaves = " + r.a + "^log" + r.b + "(n) = " +
      levels[r.k].count + " = n^log" + r.b + "(" + r.a + ")" + ". ";
    if (r.a === bd) {
      dom = "all";
      msg = head + "a = b^d (" + r.a + " = " + r.b + "^" + r.d + "): every level costs about the same (" + ndw +
        "), so total ≈ " + (r.d === 0 ? "" : nd + " × ") + "log n → O(" + (r.d === 0 ? "log n" : nd + " log n") + "). Work balanced across the tree.";
    } else if (r.a < bd) {
      dom = "root";
      msg = head + "a < b^d (" + r.a + " < " + bd + "): level totals shrink going down, so the root's " + nd + " dominates → O(" + nd + ").";
    } else {
      dom = "leaves";
      const whole = Math.abs(logba - Math.round(logba)) < 1e-9;
      const exp = whole ? Math.round(logba) : fmtExp(logba);
      const big = whole ? (exp === 1 ? "n" : "n^" + exp) : "n^" + exp;
      msg = head + "a > b^d (" + r.a + " > " + bd + "): level totals grow going down, so the leaves dominate → O(n^log" + r.b + "(" + r.a + ")) = O(" + big + ").";
    }
  }
  push({
    shown: r.k, cur: -1, summed: r.k, dom: dom, group: r.k,
    msg: msg,
    vars: [["recurrence", rec], ["n", String(r.n)], ["levels", String(nLevels)], ["leaves", String(levels[r.k].count)], ["total", fmtCost(running, r, baseName)]]
  });
  return frames;
}

const CSS = `
.vz-rt-wrap { overflow-x: auto; }
.vz-rt { width: 100%; height: auto; display: block; font-family: "Consolas", "Menlo", monospace; }
.vz-rt .rt-edge { stroke: var(--vz-muted); stroke-width: 1.2; fill: none; }
.vz-rt .rt-node rect { fill: var(--vz-surface); stroke: var(--vz-border); stroke-width: 1.5; transition: fill .25s, stroke .25s; }
.vz-rt .rt-node text { fill: var(--vz-ink); font-weight: 600; text-anchor: middle; dominant-baseline: central; }
.vz-rt .rt-node.is-done rect { fill: var(--vz-sorted-bg); stroke: var(--vz-sorted-bd); }
.vz-rt .rt-node.is-done text { fill: var(--vz-sorted-fg); }
.vz-rt .rt-node.is-cur rect { fill: var(--vz-cmp-bg); stroke: var(--vz-cmp-bd); stroke-width: 2.5; }
.vz-rt .rt-node.is-dom rect { fill: var(--vz-min-bg); stroke: var(--vz-min-bd); stroke-width: 2.5; }
.vz-rt .rt-node.is-dom text { fill: var(--vz-min-fg); }
.vz-rt .rt-lvl { fill: var(--vz-muted); font-size: 12px; dominant-baseline: central; }
.vz-rt .rt-sum { fill: var(--vz-ink); font-size: 13px; dominant-baseline: central; }
.vz-rt .rt-sum.is-cur { fill: var(--vz-blue); font-weight: 700; }
.vz-rt .rt-sum.is-dom { fill: var(--vz-min-fg); font-weight: 700; }
.vz-rt .rt-head { fill: var(--vz-muted); font-size: 11px; }
`;

function ensureCss() {
  if (document.getElementById("viz-recursion-tree-style")) return;
  const st = document.createElement("style");
  st.id = "viz-recursion-tree-style";
  st.textContent = CSS;
  document.head.appendChild(st);
}

export function render(stage, frame) {
  ensureCss();
  const r = frame.r, levels = frame.levels;
  const leaves = levels[r.k].count;
  const slot = r.mode === "divide" ? Math.max(30, Math.min(64, 640 / leaves)) : 64;
  const treeW = Math.max(r.mode === "divide" ? leaves * slot : slot * 3, 240);
  const left = 34, gutter = 150, rowH = r.k > 5 ? 44 : 54, top = 22;
  const W = left + treeW + gutter, H = top + (r.k + 1) * rowH + 6;
  const nodeH = 26;
  let svg = '<svg class="vz-rt" viewBox="0 0 ' + W + " " + H + '" style="max-width:' + W + 'px;min-width:' + Math.round(W * 0.62) + 'px" role="img" aria-label="recursion tree">';
  svg += '<text class="rt-head" x="' + (left + treeW + 12) + '" y="12">calls × cost = level</text>';

  function isDom(i) {
    if (!frame.dom) return false;
    if (frame.dom === "all") return true;
    if (frame.dom === "root") return i === 0;
    return i === r.k;
  }

  for (let i = 0; i <= Math.min(frame.shown, r.k); i++) {
    const L = levels[i];
    const y = top + i * rowH + rowH / 2;
    const span = r.mode === "divide" ? leaves / L.count : 1;
    const cls = isDom(i) ? "is-dom" : (i === frame.cur ? "is-cur" : (i <= frame.summed ? "is-done" : ""));
    const label = String(L.size);
    const fs = Math.max(10, Math.min(14, slot * span / Math.max(2.2, label.length + 0.8)));
    for (let j = 0; j < L.count; j++) {
      const cx = r.mode === "divide" ? left + (j * span + span / 2) * slot : left + treeW / 2;
      const w = Math.min(54, Math.max(20, slot * span - 6));
      if (i > 0) {
        const pj = r.mode === "divide" ? Math.floor(j / r.a) : 0;
        const pspan = r.mode === "divide" ? span * r.a : 1;
        const px = r.mode === "divide" ? left + (pj * pspan + pspan / 2) * slot : cx;
        svg += '<path class="rt-edge" d="M' + px + " " + (y - rowH + nodeH / 2) + " L" + cx + " " + (y - nodeH / 2) + '"/>';
      }
      svg += '<g class="rt-node ' + cls + '"><rect x="' + (cx - w / 2) + '" y="' + (y - nodeH / 2) + '" width="' + w + '" height="' + nodeH + '" rx="6"/>' +
        '<text x="' + cx + '" y="' + y + '" style="font-size:' + fs + 'px">' + label + "</text></g>";
    }
    svg += '<text class="rt-lvl" x="4" y="' + y + '">L' + i + "</text>";
    const sumCls = isDom(i) ? "is-dom" : (i === frame.cur ? "is-cur" : "");
    if (i > frame.summed) continue;
    svg += '<text class="rt-sum ' + sumCls + '" x="' + (left + treeW + 12) + '" y="' + y + '">' +
      L.count + " × " + fmtCost(L.per, r, frame.baseName) + " = " + fmtCost(L.total, r, frame.baseName) + "</text>";
  }
  svg += "</svg>";
  stage.innerHTML = '<div class="vz-rt-wrap">' + svg + "</div>";
}
