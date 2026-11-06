// Binary tree traversals, step by step: pre-order, in-order and post-order
// (recursive, with the call stack shown) and level order (with a queue).
// The tree is given in heap positions: position 1 is the root, the children
// of position p are 2p and 2p + 1, "-" marks an empty position.
import { checkParams } from "./_core.js";

const MAXPOS = 31;

export const meta = {
	name: "tree-traversal",
	summary: "Pre-order, in-order, post-order (recursive, call stack shown) or level-order (queue) traversal of a binary tree.",
	groupLabel: "visit",
	params: {
		tree: { type: "string", required: true, desc: "Nodes by heap position, comma-separated: root first, children of p at 2p and 2p+1, \"-\", \"_\" or \"null\" = empty (so those can't be labels). Labels 1–3 chars, at most 31 positions (depth ≤ 4)." },
		order: { type: "enum", values: ["pre", "in", "post", "level"], default: "pre", desc: "Which traversal to run." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code shown beside the demo, with the running line highlighted." }
	},
	example: { tree: "K, C, N, A, F, M, V, -, B, D, H, -, -, U", order: "in" },
	// One-click switch in the player between the four traversals on the same tree.
	switch: { key: "order", label: "Order", options: [
		{ value: "pre", label: "Pre-order" },
		{ value: "in", label: "In-order" },
		{ value: "post", label: "Post-order" },
		{ value: "level", label: "Level order" }
	] }
};

// Parse the position list into an array indexed 1..len (null = empty).
function parseTree(text) {
	const parts = String(text).trim().split(/\s*[,，]\s*|\s+/).map(function(s) { return s.trim(); });
	if (parts.some(function(s) { return s === ""; })) return { error: "\"tree\" has an empty item (two commas in a row?); write \"-\" for an empty position" };
	if (parts.length === 0) return { error: "\"tree\" is empty" };
	if (parts.length > MAXPOS) return { error: "\"tree\" has " + parts.length + " positions; at most " + MAXPOS + " (depth ≤ 4)" };
	const pos = [null];
	const seen = {};
	for (let i = 0; i < parts.length; i++) {
		const s = parts[i];
		if (s === "-" || s === "_" || s.toLowerCase() === "null") { pos.push(null); continue; }
		if (s.length > 3) return { error: "\"tree\": label \"" + s + "\" is longer than 3 characters" };
		if (seen[s]) return { error: "\"tree\": label \"" + s + "\" appears twice; labels must be unique" };
		seen[s] = true;
		pos.push(s);
	}
	if (pos[1] === null) return { error: "\"tree\": position 1 (the root) can't be empty" };
	for (let p = 2; p < pos.length; p++) {
		if (pos[p] !== null && pos[p >> 1] === null) {
			return { error: "\"tree\": \"" + pos[p] + "\" at position " + p + " has no parent (position " + (p >> 1) + " is \"-\")" };
		}
	}
	while (pos.length > 2 && pos[pos.length - 1] === null) pos.pop();
	return { pos: pos };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const r = parseTree(config.tree);
	return r.error ? [r.error] : [];
}

const CODE = {
	pre: [
		"void preorder(Node* t) {",
		"    if (t == nullptr) return;",
		"    visit(t->item);",
		"    preorder(t->left);",
		"    preorder(t->right);",
		"}"
	],
	in: [
		"void inorder(Node* t) {",
		"    if (t == nullptr) return;",
		"    inorder(t->left);",
		"    visit(t->item);",
		"    inorder(t->right);",
		"}"
	],
	post: [
		"void postorder(Node* t) {",
		"    if (t == nullptr) return;",
		"    postorder(t->left);",
		"    postorder(t->right);",
		"    visit(t->item);",
		"}"
	],
	level: [
		"std::queue<Node*> q;",
		"if (root) q.push(root);",
		"while (!q.empty()) {",
		"    Node* t = q.front(); q.pop();",
		"    visit(t->item);",
		"    if (t->left)  q.push(t->left);",
		"    if (t->right) q.push(t->right);",
		"}"
	]
};

export function code(config) {
	return { cpp: CODE[config.order || "pre"] };
}

export const legend = [
	{ cls: "is-cmp", label: "Current node t (moving ring)" },
	{ cls: "is-min", label: "On the call stack / in the queue" },
	{ cls: "is-sorted", label: "Visited" }
];

export const input = {
	key: "tree",
	label: "Tree (heap positions)",
	format: function(config) { return config.tree; },
	parse: function(text) {
		const r = parseTree(text);
		return r.error ? { error: r.error } : { value: text };
	},
	random: function() {
		const labels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
		const pos = [null, labels.shift()];
		for (let p = 2; p <= 15; p++) {
			pos.push(pos[p >> 1] !== null && Math.random() < 0.72 ? labels.shift() : null);
		}
		while (pos.length > 2 && pos[pos.length - 1] === null) pos.pop();
		return pos.slice(1).map(function(v) { return v === null ? "-" : v; }).join(", ");
	}
};

function left(pos, p) { const c = 2 * p; return c < pos.length && pos[c] !== null ? c : 0; }
function right(pos, p) { const c = 2 * p + 1; return c < pos.length && pos[c] !== null ? c : 0; }

const NAME = { pre: "Pre-order", in: "In-order", post: "Post-order", level: "Level order" };

export function steps(config) {
	const order = config.order || "pre";
	const pos = parseTree(config.tree).pos;
	const frames = [];
	const out = [];
	const stack = [];
	let queue = [];

	function push(cur, lines, msg) {
		frames.push({
			step: frames.length,
			pos: pos,
			cur: cur,
			order: order,
			active: order === "level" ? queue.slice() : stack.slice(),
			visited: out.slice(),
			lines: lines,
			group: out.length,
			msg: msg,
			vars: [
				["order", NAME[order]],
				["t", cur ? pos[cur] : "—"],
				[order === "level" ? "queue (front→rear)" : "call stack (bottom→top)",
					(order === "level" ? queue : stack).map(function(p) { return pos[p]; }).join(" ") || "(empty)"],
				["output", out.map(function(p) { return pos[p]; }).join(" ") || "—"]
			]
		});
	}

	const counts = { n: 0 };
	for (let p = 1; p < pos.length; p++) if (pos[p] !== null) counts.n++;

	if (order === "level") {
		push(0, [], "Level order (breadth-first): visit level 0, then level 1 left to right, then level 2, … A FIFO queue keeps the order.");
		queue.push(1);
		push(0, [1, 2], "Push the root `" + pos[1] + "` into the queue.");
		while (queue.length) {
			const t = queue.shift();
			push(t, [3, 4], "Take `" + pos[t] + "` from the front of the queue.");
			out.push(t);
			push(t, [5], "Visit `" + pos[t] + "`. Output so far: " + out.map(function(p) { return pos[p]; }).join(" ") + ".");
			const l = left(pos, t), r = right(pos, t);
			if (l || r) {
				if (l) queue.push(l);
				if (r) queue.push(r);
				push(t, [6, 7], "Push its children" + (l ? " `" + pos[l] + "`" : "") + (l && r ? " and" : "") + (r ? " `" + pos[r] + "`" : "") +
					" to the rear — they come out after everything already waiting on this level.");
			} else {
				push(t, [6, 7], "`" + pos[t] + "` is a leaf: nothing to push.");
			}
		}
		push(0, [], "Done: " + out.map(function(p) { return pos[p]; }).join(" ") + ". Each of the " + counts.n + " nodes is pushed and popped once: O(n).");
		return frames;
	}

	const fn = { pre: "preorder", in: "inorder", post: "postorder" }[order];
	// Line numbers (1-based) of each statement in CODE[order].
	const L = order === "pre" ? { visit: 3, goL: 4, goR: 5 } : order === "in" ? { goL: 3, visit: 4, goR: 5 } : { goL: 3, goR: 4, visit: 5 };
	const when = { pre: "before both subtrees", in: "between the subtrees", post: "after both subtrees" }[order];
	push(0, [], NAME[order] + ": each call marks its node visited " + when + ". Null children return at once and are not drawn as steps.");

	function visit(t) {
		out.push(t);
		push(t, [L.visit], "Visit `" + pos[t] + "`. Output so far: " + out.map(function(p) { return pos[p]; }).join(" ") + ".");
	}
	function go(t, side) {
		const c = side === "left" ? left(pos, t) : right(pos, t);
		if (!c) {
			push(t, [side === "left" ? L.goL : L.goR, 2], "`" + fn + "(t->" + side + ")`: `" + pos[t] + "` has no " + side + " child, so that call returns immediately.");
			return;
		}
		rec(c, "`" + fn + "(t->" + side + ")`: go to `" + pos[t] + "`'s " + side + " child `" + pos[c] + "`.", side === "left" ? L.goL : L.goR);
		push(t, [side === "left" ? L.goL : L.goR], "Back in `" + pos[t] + "`: its " + side + " subtree is finished.");
	}
	function rec(t, why, line) {
		stack.push(t);
		push(t, [line || 1], why);
		if (order === "pre") visit(t);
		go(t, "left");
		if (order === "in") visit(t);
		go(t, "right");
		if (order === "post") visit(t);
		stack.pop();
	}
	rec(1, "`" + fn + "(root)`: start at the root `" + pos[1] + "`.", 1);
	push(0, [], "Done: " + out.map(function(p) { return pos[p]; }).join(" ") + ". One call per node (plus one per null link): O(n).");
	return frames;
}

// ---------- drawing ----------
// Built once per tree and then only updated: node colours fade, a ring glides
// from node to node as `t` moves, and each newly visited node's chip slides
// into the output row.

const CSS = `
.vz-tt-wrap { overflow-x: auto; }
.vz-tt { display: block; margin: 0 auto; font-family: "Consolas", "Menlo", monospace; overflow: visible; }
.vz-tt .tt-edge { stroke: var(--vz-muted); stroke-width: 1.4; transition: stroke .3s, stroke-width .3s; }
.vz-tt .tt-edge.is-active { stroke: var(--vz-min-bd); stroke-width: 3; }
.vz-tt .tt-node circle { fill: var(--vz-surface); stroke: var(--vz-border); stroke-width: 1.6; transition: fill .3s, stroke .3s; }
.vz-tt .tt-node text { fill: var(--vz-ink); font-weight: 600; text-anchor: middle; dominant-baseline: central; font-size: 13px; transition: fill .3s; }
.vz-tt .tt-node.is-active circle { fill: var(--vz-min-bg); stroke: var(--vz-min-bd); }
.vz-tt .tt-node.is-active text { fill: var(--vz-min-fg); }
.vz-tt .tt-node.is-visited circle { fill: var(--vz-sorted-bg); stroke: var(--vz-sorted-bd); }
.vz-tt .tt-node.is-visited text { fill: var(--vz-sorted-fg); }
.vz-tt .tt-node.is-just circle { animation: vz-tt-flash .5s ease-out; }
.vz-tt .tt-cursor { fill: none; stroke: var(--vz-cmp-bd); stroke-width: 3; transition: transform .38s cubic-bezier(0.45, 0, 0.25, 1), opacity .25s; }
.vz-tt .tt-rank { fill: var(--vz-blue); font-size: 10px; font-weight: 700; text-anchor: middle; }
.vz-tt-outlabel { text-align: center; color: var(--vz-muted); font-size: .8rem; margin-top: .5rem; }
.vz-tt-out { flex-wrap: wrap; row-gap: .5rem; }
.vz-tt-out .vz-col { flex: 0 0 2.6rem; }
.vz-tt-out .vz-cell.is-empty { border-style: dashed; color: transparent; }
.vz-tt-out .vz-cell.is-new { animation: vz-tt-in .4s ease-out; }
@keyframes vz-tt-in { from { opacity: 0; transform: translateY(-10px) scale(.8); } to { opacity: 1; transform: none; } }
@keyframes vz-tt-flash { 0% { stroke-width: 6; } 100% { stroke-width: 1.6; } }
@media (prefers-reduced-motion: reduce) {
  .vz-tt .tt-cursor { transition: none; }
  .vz-tt .tt-node.is-just circle, .vz-tt-out .vz-cell.is-new { animation: none; }
}
`;

function ensureCss() {
	if (document.getElementById("viz-tree-traversal-style")) return;
	const st = document.createElement("style");
	st.id = "viz-tree-traversal-style";
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

// x = in-order rank (each node its own column), y = depth.
function layout(pos) {
	const x = {}, y = {};
	let rank = 0, maxD = 0;
	(function walk(p, d) {
		if (p >= pos.length || pos[p] === null) return;
		walk(2 * p, d + 1);
		x[p] = rank++;
		y[p] = d;
		if (d > maxD) maxD = d;
		walk(2 * p + 1, d + 1);
	})(1, 0);
	return { x: x, y: y, cols: rank, depth: maxD };
}

function build(stage, pos) {
	const g = layout(pos);
	const colW = 42, rowH = 58, pad = 22, R = 16;
	const W = Math.max(g.cols * colW + pad * 2, 200), H = (g.depth + 1) * rowH + pad;
	const xy = {};
	for (let p = 1; p < pos.length; p++) if (pos[p] !== null) xy[p] = { x: pad + g.x[p] * colW + colW / 2, y: pad + g.y[p] * rowH };
	stage.textContent = "";
	const wrap = document.createElement("div");
	wrap.className = "vz-tt-wrap";
	const svg = el("svg", { "class": "vz-tt", viewBox: "0 0 " + W + " " + H, width: W, role: "img", "aria-label": "binary tree" });
	svg.style.maxWidth = "100%";
	svg.style.height = "auto";
	const edges = {}, nodes = {};
	for (let p = 2; p < pos.length; p++) {
		if (pos[p] === null) continue;
		edges[p] = el("line", { "class": "tt-edge", x1: xy[p >> 1].x, y1: xy[p >> 1].y, x2: xy[p].x, y2: xy[p].y }, svg);
	}
	for (let p = 1; p < pos.length; p++) {
		if (pos[p] === null) continue;
		const gr = el("g", { "class": "tt-node" }, svg);
		el("circle", { cx: xy[p].x, cy: xy[p].y, r: R }, gr);
		el("text", { x: xy[p].x, y: xy[p].y }, gr).textContent = pos[p];
		const rk = el("text", { "class": "tt-rank", x: xy[p].x + R + 2, y: xy[p].y - R + 2 }, svg);
		nodes[p] = { g: gr, rank: rk };
	}
	// The cursor ring sits at the origin and is moved with a CSS transform, so it can glide.
	const cursor = el("circle", { "class": "tt-cursor", cx: 0, cy: 0, r: R + 4 }, svg);
	wrap.appendChild(svg);
	// Output = an array with one slot per node, filled in visit order
	// (the same big cells as the other array demos).
	const label = document.createElement("div");
	label.className = "vz-tt-outlabel";
	label.textContent = "output (visit order)";
	const out = document.createElement("div");
	out.className = "vz-row vz-tt-out";
	out.setAttribute("role", "group");
	out.setAttribute("aria-label", "output (visit order)");
	const cells = [];
	for (let p = 1; p < pos.length; p++) {
		if (pos[p] === null) continue;
		const col = document.createElement("div");
		col.className = "vz-col";
		col.innerHTML = '<div class="vz-cell is-empty"></div><div class="vz-idx">' + (cells.length + 1) + "</div>";
		out.appendChild(col);
		cells.push(col.firstChild);
	}
	stage.appendChild(wrap);
	stage.appendChild(label);
	stage.appendChild(out);
	return { key: pos.join(","), xy: xy, edges: edges, nodes: nodes, cursor: cursor, out: out, cells: cells, lastStep: -2, shownOut: -1 };
}

export function render(stage, frame) {
	ensureCss();
	const pos = frame.pos;
	const key = pos.join(",");
	let st = stage._tt;
	if (!st || st.key !== key || !stage.contains(st.out)) st = stage._tt = build(stage, pos);
	const forward = frame.step === st.lastStep + 1;

	const rankOf = {};
	frame.visited.forEach(function(p, k) { rankOf[p] = k + 1; });
	const justVisited = forward && frame.visited.length === st.shownOut + 1 ? frame.visited[frame.visited.length - 1] : 0;
	for (let p = 1; p < pos.length; p++) {
		if (pos[p] === null) continue;
		const c = ["tt-node"];
		if (rankOf[p]) c.push("is-visited");
		else if (frame.active.indexOf(p) >= 0) c.push("is-active");
		if (p === justVisited) c.push("is-just");
		st.nodes[p].g.setAttribute("class", c.join(" "));
		st.nodes[p].rank.textContent = rankOf[p] ? String(rankOf[p]) : "";
		// Highlight the edges along the current call stack (DFS only).
		if (st.edges[p]) {
			const on = frame.order !== "level" && frame.active.indexOf(p) >= 0 && frame.active.indexOf(p >> 1) >= 0;
			st.edges[p].setAttribute("class", "tt-edge" + (on ? " is-active" : ""));
		}
	}

	if (frame.cur && st.xy[frame.cur]) {
		const q = st.xy[frame.cur];
		// Glide only when stepping forward from a visible ring; otherwise jump there.
		const jump = !st.cursorShown || (!forward && frame.step !== st.lastStep);
		if (jump) st.cursor.style.transition = "none";
		st.cursor.style.transform = "translate(" + q.x + "px," + q.y + "px)";
		st.cursor.style.opacity = "1";
		if (jump) { void st.cursor.getBoundingClientRect(); st.cursor.style.transition = ""; }
		st.cursorShown = true;
	} else {
		st.cursor.style.opacity = "0";
		st.cursorShown = false;
	}

	// Output cells: fill slot k with the k-th visited node; the newest one drops in.
	st.cells.forEach(function(cell, k) {
		const p = frame.visited[k];
		const isNew = !!justVisited && k === frame.visited.length - 1;
		cell.textContent = p ? pos[p] : "";
		cell.className = "vz-cell " + (p ? "is-sorted" : "is-empty") + (isNew ? " is-new" : "");
	});
	st.shownOut = frame.visited.length;
	st.lastStep = frame.step;
}
