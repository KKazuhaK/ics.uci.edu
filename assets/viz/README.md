# `viz` components (assets/viz/)

Site-wide: md-viewer loads them today (`VIZ_BASE`), md-editor and demo pages can
reuse them. Flat on purpose — one file per algorithm/structure; language is a
component option (`code: { cpp, python }`), not a folder. Old URLs under
`tools/md-viewer/viz/` 301-redirect here.

A fenced block tagged `viz <component>` with a JSON config becomes an
interactive step-through demo (Prev / Next / Play / End-of-group, code panel
with the running line highlighted, variable watch, optional input bar).

| File | Role |
| --- | --- |
| `_player.js` | Shared player UI. Expand button opens the block in a near-fullscreen `<dialog>` (the same node is moved, so state survives; components may export `moved(stage, config)` to react, since iframes reload). Hides the toolbar when a demo has only one frame (`.is-static`). `meta.msgPosition: "top"` puts the step note under the toolbar. |
| `_core.js` | DOM-free helpers: `checkParams`, `withDefaults`, parsing. Param types: `string`, `bool`, `int`, `enum`, `int[]`, `number[]`, `json-array`. |
| `<component>.js` | One component each. Must stay DOM-free at import time (check_md.py runs `validate`/`steps` under node); only `render` touches the DOM. |

## Components

| Component | Lecture | What it shows |
| --- | --- | --- |
| `selection-sort` | 6 | Passes, minIdx, swaps. |
| `arraylist` | 3 | add / insert / remove with shifting; resize (×2 or +1) and shrink at ¼, one copy per step. |
| `linked-list` | 4 | Singly linked list: get / add / remove at head or index, finger + previous walk, splice, bypass + delete. |
| `doubly-linked-list` | 4 | addFirst / addLast / removeFirst / removeLast with head and tail. |
| `stack` | 4–5 | push / pop / peek, top = head; algs4 shorthand `to be - or -`. |
| `queue` | 5 | enqueue / dequeue on an SLL with head and tail; same shorthand. |
| `circular-queue` | 5 | Fixed-capacity circular array: front, n, (front + n) % capacity. |
| `two-stack-eval` | 5 | Dijkstra's two-stack evaluation of fully parenthesized infix. |
| `postfix-eval` | 5 | One-stack postfix evaluation (v2 op v1). |
| `memory-trace` | any | Python Tutor-style stack/heap with pointer arrows; takes memdiag-format steps. |
| `array-2d` | 2 | Row-major layout of a 2D/3D array, offset and address of one element. |
| `doubling-test` | 2 | Doubling hypothesis: ratios, b = lg ratio, a = T/n^b, log-log plot. |
| `insertion-sort` | 7 | Swap version: `arr[j]` swaps left while smaller than `arr[j-1]`, `else break`; comparisons, swaps (= inversions), best/worst counts. |
| `merge-sort` | 8 | Top-down merge sort: recursive splits, merge() via aux with i/j/k; `mode: "merge"` shows one merge of two sorted halves. |
| `quick-sort` | 8 | Quicksort with the slides' partition (i/j scans, swap, pivot into a[j]); `mode: "partition"` runs one partition. |
| `recursion-tree` | 6 | Recursion-tree method for T(n) = aT(n/b) + f(n) or T(n-1) + f(n): levels revealed one at a time, per-call work, level totals, sum, and which Master Theorem case dominates. |
| `web-demo` | IN4MATX 133 | Live HTML/CSS/JS in a sandboxed iframe (built lazily near the viewport) with a console. Source tabs: Shiki dark-plus, line numbers, line diff per step (gold = added, red rule = removed, hover the number), auto-scroll to the change, Copy; edits kept per step until Revert. Side by side on wide demos (draggable divider; layout and split remembered in `localStorage` `viz-web-demo-layout` / `viz-web-demo-split`); drag the preview's right edge to change the simulated viewport width. Preview sits in a browser-window frame (white page = real browser default). "Code Runner" hands the current code to `tools/code-runner/?from=viz` via `localStorage.cr-web-transfer`; Code Runner's Web mode imports `pageDocument()` from this file. Optional steps (cumulative CSS/JS, HTML replace, viewport width) and `libs` (bootstrap, mathjs, moment, vega-lite). |

## Component contract

```js
export const meta = { name, summary, groupLabel, params: { … }, example: { … } };
export function validate(config) { return [/* error strings */]; }   // use checkParams + own checks
export function steps(config) { return [ { msg, lines, group, vars: [[name, value], …], …state } ]; }
export function render(stage, frame) { /* draw one frame */ }
export const code = { cpp: [ "…" ] };       // optional; keep lines ≤ 48 chars
export const legend = [ { cls, label } ];   // optional
export const input = { key, label, format, parse, random };   // optional (for "interactive": true)
```

Components inject their own CSS once (`<style id="viz-<name>-style">`) using the
player's `--vz-*` colour variables, so light and dark themes both work.

## Common params (every component)

| Param | Default | Meaning |
| --- | --- | --- |
| `title` | none | Caption above the demo |
| `interactive` | `false` | Input bar (edit the data, Random) under the demo |
| `start` | `1` | 1-based step to open on |

Unknown params, wrong types or out-of-range values show a red error box on the
page (and fail the notes skill's `check_md.py`), never a half-working demo.
md-editor and the Ask AI widget see only the raw JSON, so a note must still
make sense without the demo.

## Adding a component

Name it after the algorithm/structure, not a course or week, and add it only
when a note needs it. Check `steps()` under node for several inputs (the final
state must be right), `chmod 644` the file, add a row to the table above, and
add it to the notes skill's `references/viz-components.md` (the skill may only
use listed components).
