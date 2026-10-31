// Python Tutor-style memory trace: stack frames on the left, heap objects on
// the right, pointer arrows drawn from the exact variable / field that holds
// them. The config is the same step list the notes skill's memdiag.py uses
// (full steps, or incremental "set" / "add_heap" / "add_vars" / "free" /
// "push_frame" / "pop_frame"), so a trace written for one works in the other.
import { checkParams } from "./_core.js";

export const meta = {
	name: "memory-trace",
	summary: "Step through stack and heap: every variable and field, pointer arrows, overwritten values struck through.",
	groupLabel: "step",
	params: {
		steps: { type: "json-array", required: true, minLength: 1, maxLength: 12, desc: "memdiag-style steps: { code, note, stack, heap } or incremental { code, note, set, add_heap, add_vars, push_frame, pop_frame, free }." }
	},
	example: { steps: [
		{ code: "int* p = new int(3);", stack: [{ frame: "main", vars: [{ name: "p", value: "->h1" }] }], heap: [{ id: "h1", type: "int", fields: [{ name: "", value: "3" }] }] },
		{ code: "*p = 4;", set: { "h1.": { value: "4", old: "3" } } },
		{ code: "delete p;", note: "p still holds the address: dangling", free: ["h1"], set: { "main.p": { value: "dangling" } } }
	] }
};

function clone(x) { return JSON.parse(JSON.stringify(x)); }

function isObj(x) { return x !== null && typeof x === "object" && !Array.isArray(x); }

function checkVar(v, where, errors) {
	if (!isObj(v) || typeof v.name !== "string" || v.value === undefined) errors.push(where + " needs a name and a value");
}

// Build the full state for every step. Returns { states } or { errors }.
function build(stepsIn) {
	const errors = [];
	const states = [];
	let cur = null;
	stepsIn.forEach(function(st, k) {
		const where = "\"steps\"[" + k + "]";
		if (!isObj(st)) { errors.push(where + " must be an object"); return; }
		const allowed = ["code", "note", "stack", "heap", "set", "add_heap", "add_vars", "push_frame", "pop_frame", "free"];
		Object.keys(st).forEach(function(key) { if (!allowed.includes(key)) errors.push(where + ": unknown key \"" + key + "\""); });
		if (typeof st.code !== "string") errors.push(where + " needs a \"code\" string");
		if (st.stack !== undefined || st.heap !== undefined) {
			cur = { stack: clone(st.stack || []), heap: clone(st.heap || []) };
		} else {
			if (!cur) { errors.push(where + ": the first step must give the full \"stack\" and \"heap\""); return; }
			cur = clone(cur);
			cur.stack.forEach(function(f) { f.vars.forEach(function(v) { delete v.old; delete v.old_target; }); });
			cur.heap.forEach(function(o) { (o.fields || []).forEach(function(v) { delete v.old; delete v.old_target; }); });
			if (st.pop_frame) cur.stack.shift();
			if (st.push_frame) cur.stack.unshift(clone(st.push_frame));
			Object.entries(st.add_vars || {}).forEach(function(e) {
				const f = cur.stack.find(function(fr) { return fr.frame === e[0]; });
				if (!f) errors.push(where + ".add_vars: no frame \"" + e[0] + "\"");
				else f.vars.push.apply(f.vars, clone(e[1]));
			});
			(st.add_heap || []).forEach(function(o) { cur.heap.push(clone(o)); });
			Object.entries(st.set || {}).forEach(function(e) {
				const key = e[0];
				const dot = key.indexOf(".");
				if (dot < 0) { errors.push(where + ".set: key \"" + key + "\" must be <frame>.<var> or <heap id>.<field>"); return; }
				const owner = key.slice(0, dot);
				const name = key.slice(dot + 1);
				const f = cur.stack.find(function(fr) { return fr.frame === owner; });
				const o = cur.heap.find(function(h) { return h.id === owner; });
				const list = f ? f.vars : o ? o.fields : null;
				if (!list) { errors.push(where + ".set: no frame or heap object \"" + owner + "\""); return; }
				const v = list.find(function(x) { return x.name === name; });
				if (!v) { errors.push(where + ".set: \"" + owner + "\" has no \"" + name + "\""); return; }
				Object.assign(v, e[1]);
			});
			(st.free || []).forEach(function(id) {
				const o = cur.heap.find(function(h) { return h.id === id; });
				if (!o) errors.push(where + ".free: no heap object \"" + id + "\"");
				else o.freed = true;
			});
		}
		// Shape and reference checks.
		if (!Array.isArray(cur.stack) || !Array.isArray(cur.heap)) { errors.push(where + ": stack and heap must be arrays"); return; }
		const ids = new Set();
		cur.heap.forEach(function(o, j) {
			if (!isObj(o) || typeof o.id !== "string") errors.push(where + ".heap[" + j + "] needs an \"id\"");
			else ids.add(o.id);
			(o.fields || []).forEach(function(v, i) { checkVar(v, where + ".heap[" + j + "].fields[" + i + "]", errors); });
		});
		const varKeys = new Set();
		cur.stack.forEach(function(f, j) {
			if (!isObj(f) || typeof f.frame !== "string" || !Array.isArray(f.vars)) { errors.push(where + ".stack[" + j + "] needs \"frame\" and \"vars\""); return; }
			f.vars.forEach(function(v, i) { checkVar(v, where + ".stack[" + j + "].vars[" + i + "]", errors); varKeys.add(f.frame + "." + v.name); });
		});
		function checkTarget(v) {
			if (!v || typeof v.value !== "string") return;
			if (v.value.startsWith("->")) {
				const t = v.value.slice(2);
				if (!ids.has(t) && !(v.ref && varKeys.has(t))) errors.push(where + ": \"" + v.name + "\" points to \"" + t + "\", which doesn't exist");
			}
			if (v.old_target && !ids.has(v.old_target)) errors.push(where + ": old_target \"" + v.old_target + "\" doesn't exist");
		}
		cur.stack.forEach(function(f) { (f.vars || []).forEach(checkTarget); });
		cur.heap.forEach(function(o) { (o.fields || []).forEach(checkTarget); });
		states.push({ code: st.code, note: st.note || "", stack: clone(cur.stack), heap: clone(cur.heap) });
	});
	if (errors.length > 8) return { errors: errors.slice(0, 8).concat(["… and " + (errors.length - 8) + " more"]) };
	return errors.length ? { errors: errors } : { states: states };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	return build(config.steps).errors || [];
}

export function steps(config) {
	return build(config.steps).states.map(function(s, k) {
		return {
			state: s,
			msg: "`" + s.code + "`" + (s.note ? " — " + s.note : ""),
			group: k
		};
	});
}

const STYLE = `
.vz-mt { position: relative; display: flex; gap: 3rem; margin-top: 1.4rem; justify-content: safe center; align-items: flex-start; flex-wrap: nowrap; padding: 0.9rem 2.6rem 1.7rem 1.6rem; overflow-x: auto; }
.vz-mt-col { display: flex; flex-direction: column; gap: 0.7rem; min-width: 8rem; }
.vz-mt-heap { flex-direction: row; flex-wrap: wrap; align-items: flex-start; gap: 2rem 2.2rem; max-width: 30rem; }
.vz-mt-col { flex: none; }
/* Too narrow for stack | heap side by side (phones): stack above heap; arrows use the right-hand gutter. */
.vz-mt.is-stacked { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
.vz-mt.is-stacked .vz-mt-heap { flex-direction: column; max-width: none; gap: 1.2rem; }
/* Still too wide when stacked: tighten type and padding. */
.vz-mt.is-compact { padding-right: 2rem; }
.vz-mt.is-compact .vz-mt-box { font-size: 0.7rem; }
.vz-mt.is-compact .vz-mt-name, .vz-mt.is-compact .vz-mt-val, .vz-mt.is-compact .vz-mt-head { padding-left: 0.4rem; padding-right: 0.4rem; }
.vz-mt-cap { color: var(--vz-muted); font-size: 0.78rem; }
.vz-mt-box { display: grid; grid-template-columns: max-content minmax(3rem, 1fr); border: 1.5px solid var(--vz-border); border-radius: 0.55rem; background: var(--vz-surface); overflow: hidden; font: 0.84rem/1.35 "Consolas", "Menlo", monospace; }
.vz-mt-head { grid-column: 1 / -1; padding: 0.3rem 0.6rem; color: var(--vz-muted); background: var(--vz-soft); border-bottom: 1px solid var(--vz-border); white-space: nowrap; }
.vz-mt-row { display: contents; }
.vz-mt-row > span { border-top: 1px solid var(--vz-border); }
.vz-mt-head + .vz-mt-row > span { border-top: none; }
.vz-mt-name { padding: 0.3rem 0.55rem; color: var(--vz-muted); border-right: 1px solid var(--vz-border); white-space: nowrap; }
.vz-mt-val { display: flex; align-items: center; gap: 0.35rem; padding: 0.3rem 0.6rem; white-space: nowrap; }
.vz-mt-val.has-ptr { justify-content: flex-end; padding-right: 0.5rem; }
.vz-mt-val del { color: var(--vz-muted); }
.vz-mt-val.is-changed { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); }
.vz-mt-ptr { display: inline-block; flex: none; width: 0.55rem; height: 0.55rem; border-radius: 50%; background: var(--vz-blue); vertical-align: middle; }
.vz-mt-null { color: var(--vz-muted); }
.vz-mt-alias { color: var(--vz-muted); font-style: italic; }
.vz-mt-dang { color: #c2410c; font-weight: 600; }
.vz-mt-box.is-freed { border-style: dashed; opacity: 0.55; }
.vz-mt-box.is-freed .vz-mt-head::after { content: "  (deleted)"; color: #c2410c; }
.vz-mt-svg { position: absolute; left: 0; top: 0; pointer-events: none; overflow: visible; }
`;

function ensureStyle() {
	if (document.getElementById("viz-memory-trace-style")) return;
	const s = document.createElement("style");
	s.id = "viz-memory-trace-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function escapeHtml(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

function valueHtml(v) {
	const old = v.old !== undefined ? "<del>" + escapeHtml(v.old) + "</del>" : "";
	const val = String(v.value);
	let body;
	if (val.startsWith("->") && v.ref && val.indexOf(".") > 0) body = '<span class="vz-mt-alias">→ ' + escapeHtml(val.slice(val.indexOf(".") + 1)) + "</span>";
	else if (val.startsWith("->")) body = '<span class="vz-mt-ptr"></span>';
	else if (val === "nullptr") body = '<span class="vz-mt-null">nullptr</span>';
	else if (val === "dangling") body = '<span class="vz-mt-dang">dangling</span>';
	else body = escapeHtml(val);
	return old + body;
}

function rowHtml(v, key) {
	const changed = v.old !== undefined || v.old_target !== undefined;
	const val = String(v.value);
	const ptr = val.startsWith("->") && !(v.ref && val.indexOf(".") > 0);
	return '<div class="vz-mt-row"><span class="vz-mt-name">' + escapeHtml(v.name || "value") + "</span>" +
		'<span class="vz-mt-val' + (changed ? " is-changed" : "") + (ptr ? " has-ptr" : "") + '" data-key="' + escapeHtml(key) + '">' + valueHtml(v) + "</span></div>";
}

function draw(stage) {
	const root = stage.querySelector(".vz-mt");
	const frame = stage._vzMtFrame;
	if (!root || !frame) return;
	const old = root.querySelector(".vz-mt-svg");
	if (old) old.remove();
	// Side by side when it fits, otherwise stacked (decided on every redraw, so rotating a phone works).
	root.classList.remove("is-stacked", "is-compact");
	if (root.scrollWidth > root.clientWidth + 1) root.classList.add("is-stacked");
	// a stacked column shrinks to the stage, so look for a box whose own content is clipped
	if (root.classList.contains("is-stacked") && (root.scrollWidth > root.clientWidth + 1 ||
		Array.prototype.some.call(root.querySelectorAll(".vz-mt-box"), function(b) { return b.scrollWidth > b.clientWidth + 1; }))) {
		root.classList.add("is-compact");
	}
	const box = root.getBoundingClientRect();
	const svgNS = "http://www.w3.org/2000/svg";
	const svg = document.createElementNS(svgNS, "svg");
	svg.setAttribute("class", "vz-mt-svg");
	svg.setAttribute("width", box.width);
	svg.setAttribute("height", box.height);
	const color = getComputedStyle(root).getPropertyValue("--vz-blue").trim() || "#2563eb";
	const muted = getComputedStyle(root).getPropertyValue("--vz-muted").trim() || "#6b7280";
	svg.innerHTML = '<defs><marker id="vzmt-a" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="' + color + '"/></marker>' +
		'<marker id="vzmt-o" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6"><circle cx="5" cy="5" r="3.5" fill="' + color + '"/></marker><marker id="vzmt-x" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="8" markerHeight="8"><path d="M1,1 L9,9 M9,1 L1,9" stroke="' + muted + '" stroke-width="2"/></marker></defs>';

	function rel(el) {
		const r = el.getBoundingClientRect();
		return { l: r.left - box.left, r: r.right - box.left, t: r.top - box.top, b: r.bottom - box.top, cy: (r.top + r.bottom) / 2 - box.top };
	}
	// Every box on the stage, for routing around them.
	const boxes = Array.prototype.map.call(root.querySelectorAll(".vz-mt-box"), rel);
	const gutterLanes = new Map();
	let topLanes = 0;
	const jobs = [];

	function roundedPath(pts) {
		// Orthogonal polyline with rounded corners.
		let d = "M" + pts[0][0] + "," + pts[0][1];
		for (let i = 1; i < pts.length - 1; i++) {
			const p = pts[i - 1], c = pts[i], n = pts[i + 1];
			const r = Math.min(8, Math.hypot(c[0] - p[0], c[1] - p[1]) / 2, Math.hypot(n[0] - c[0], n[1] - c[1]) / 2);
			const ux = Math.sign(c[0] - p[0]), uy = Math.sign(c[1] - p[1]);
			const vx = Math.sign(n[0] - c[0]), vy = Math.sign(n[1] - c[1]);
			d += " L" + (c[0] - ux * r) + "," + (c[1] - uy * r) + " Q" + c[0] + "," + c[1] + " " + (c[0] + vx * r) + "," + (c[1] + vy * r);
		}
		const last = pts[pts.length - 1];
		return d + " L" + last[0] + "," + last[1];
	}

	// Queue an arrow; routes are computed once all are known so lanes can be shared out.
	function arrow(fromEl, toEl, style) {
		if (!fromEl || !toEl) return;
		const dot = fromEl.querySelector(".vz-mt-ptr");
		const cell = rel(fromEl);
		const src = rel(fromEl.closest(".vz-mt-box") || fromEl);
		const isObj = toEl.classList.contains("vz-mt-box");
		const tgt = rel(isObj ? toEl : (toEl.closest(".vz-mt-box") || toEl));
		const head = isObj ? rel(toEl.querySelector(".vz-mt-head") || toEl) : rel(toEl);
		const sx = dot ? (rel(dot).l + rel(dot).r) / 2 : src.r;
		const sy = cell.cy;
		// a reference into a row lands a little below the row's own outgoing arrow
		const ty = isObj ? head.cy : head.cy;
		jobs.push({ sx: sx, sy: sy, src: src, tgt: tgt, ty: ty, style: style, alias: !isObj });
	}

	let leftLanes = 0, underLanes = 0;
	function route(j) {
		const src = j.src, tgt = j.tgt;
		if (j.alias) {
			// a reference to another variable: a short loop down the left side of the frame
			const x = Math.min(src.l, tgt.l) - 9 - 7 * leftLanes++;
			j.start = true;
			return roundedPath([[src.l, j.sy], [x, j.sy], [x, j.ty], [tgt.l - 1, j.ty]]);
		}
		if (tgt.l >= src.r + 8) {
			const ex = tgt.l - 1;
			// any other box sitting between source and target?
			const lo = Math.min(j.sy, j.ty) - 4, hi = Math.max(j.sy, j.ty) + 4;
			const blockers = boxes.filter(function(b) {
				return b.l > src.r - 1 && b.r < tgt.l + 1 && b.b > lo && b.t < hi;
			});
			if (blockers.length) {
				// go under them: down in the gap after the source, across, then up into the target's
				// bottom edge (the gap just left of the target is where direct curves arrive)
				const lane = underLanes++;
				const below = Math.max(tgt.b, Math.max.apply(null, blockers.map(function(b) { return b.b; }))) + 12 + 7 * lane;
				const x1 = src.r + 14, tx = Math.min(tgt.r - 10, tgt.l + 22 + 10 * lane);
				j.bottom = true;
				return roundedPath([[j.sx, j.sy], [x1, j.sy], [x1, below], [tx, below], [tx, tgt.b + 1]]);
			}
			// target in a column to the right: smooth curve into its left edge
			const dx = Math.max(24, (ex - j.sx) / 2);
			return "M" + j.sx + "," + j.sy + " C" + (j.sx + dx) + "," + j.sy + " " + (ex - dx) + "," + j.ty + " " + ex + "," + j.ty;
		}
		if (tgt.r <= src.l - 8) {
			// target to the left: out to the right, over the top of both boxes, down into its header
			const top = Math.min(src.t, tgt.t) - 10 - 7 * topLanes++;
			const out = src.r + 10;
			const tx = (tgt.l + tgt.r) / 2;
			return roundedPath([[j.sx, j.sy], [out, j.sy], [out, top], [tx, top], [tx, tgt.t - 1]]);
		}
		// same column: run down a gutter to the right of every box in the way, enter from the right
		const lo = Math.min(j.sy, j.ty) - 2, hi = Math.max(j.sy, j.ty) + 2;
		const reach = Math.max(src.r, tgt.r);
		let base = reach;
		boxes.forEach(function(b) { if (b.b > lo && b.t < hi && b.l < reach) base = Math.max(base, b.r); });
		base = Math.round(base);
		const lane = gutterLanes.get(base) || 0;
		gutterLanes.set(base, lane + 1);
		const x = base + 12 + 8 * lane;
		return roundedPath([[j.sx, j.sy], [x, j.sy], [x, j.ty], [tgt.r + 1, j.ty]]);
	}

	function side(j) {
		if (j.alias) return "alias";
		if (j.tgt.l >= j.src.r + 8) {
			const lo = Math.min(j.sy, j.ty) - 4, hi = Math.max(j.sy, j.ty) + 4;
			const blocked = boxes.some(function(b) { return b.l > j.src.r - 1 && b.r < j.tgt.l + 1 && b.b > lo && b.t < hi; });
			return blocked ? "bottom" : "left";           // under-route enters from below
		}
		if (j.tgt.r <= j.src.l - 8) return "top";
		return "right";                                  // gutter, enters the right edge
	}

	// Several arrows into the same side of the same box: fan their landing points out
	// down that edge, in the order of their sources, so they neither stack nor cross.
	function spreadArrivals() {
		const groups = new Map();
		jobs.forEach(function(j) {
			const sd = side(j);
			if (sd !== "left" && sd !== "right") return;
			const key = sd + "|" + Math.round(j.tgt.l) + "," + Math.round(j.tgt.t);
			if (!groups.has(key)) groups.set(key, []);
			groups.get(key).push(j);
		});
		groups.forEach(function(list) {
			if (list.length < 2) return;
			list.sort(function(a, b) { return a.sy - b.sy; });
			const tgt = list[0].tgt;
			const first = list[0].ty;                       // header middle
			const room = Math.max(0, tgt.b - 7 - first);
			const step = Math.min(13, room / (list.length - 1));
			list.forEach(function(j, k) { j.ty = first + k * step; });
		});
	}

	function flush() {
		spreadArrivals();
		// shorter vertical runs get the inner lanes, so lanes nest instead of crossing
		jobs.sort(function(a, b) { return Math.abs(a.sy - a.ty) - Math.abs(b.sy - b.ty); });
		jobs.forEach(function(j) {
			const p = document.createElementNS(svgNS, "path");
			p.setAttribute("d", route(j));
			p.setAttribute("fill", "none");
			p.setAttribute("stroke", j.style === "old" ? muted : color);
			p.setAttribute("stroke-width", j.style === "old" ? "1.3" : "1.8");
			p.setAttribute("stroke-linejoin", "round");
			if (j.style === "ref") p.setAttribute("stroke-dasharray", "2 3");
			if (j.start) p.setAttribute("marker-start", "url(#vzmt-o)");
			if (j.style === "old") { p.setAttribute("stroke-dasharray", "4 3"); p.setAttribute("marker-end", "url(#vzmt-x)"); p.setAttribute("opacity", "0.7"); }
			else p.setAttribute("marker-end", "url(#vzmt-a)");
			svg.appendChild(p);
		});
	}
	const s = frame.state;
	function link(v, key) {
		const from = root.querySelector('[data-key="' + CSS.escape(key) + '"]');
		const val = String(v.value);
		if (val.startsWith("->")) {
			const t = val.slice(2);
			const to = root.querySelector('[data-obj="' + CSS.escape(t) + '"]') || root.querySelector('[data-key="' + CSS.escape(t) + '"]');
			arrow(from, to, v.ref ? "ref" : "ptr");
		}
		if (v.old_target) arrow(from, root.querySelector('[data-obj="' + CSS.escape(v.old_target) + '"]'), "old");
	}
	s.stack.forEach(function(f) { f.vars.forEach(function(v) { link(v, f.frame + "." + v.name); }); });
	s.heap.forEach(function(o) { (o.fields || []).forEach(function(v) { link(v, o.id + "." + v.name); }); });
	flush();
	root.appendChild(svg);
}

export function render(stage, frame) {
	ensureStyle();
	const s = frame.state;
	let html = '<div class="vz-mt"><div class="vz-mt-col"><div class="vz-mt-cap">Stack</div>';
	s.stack.forEach(function(f) {
		html += '<div class="vz-mt-box"><div class="vz-mt-head">' + escapeHtml(f.frame) + "</div>" +
			f.vars.map(function(v) { return rowHtml(v, f.frame + "." + v.name); }).join("") + "</div>";
	});
	if (!s.stack.length) html += '<div class="vz-mt-null">(no frames)</div>';
	html += '</div><div class="vz-mt-col"><div class="vz-mt-cap">Heap</div><div class="vz-mt-col vz-mt-heap">';
	s.heap.forEach(function(o) {
		html += '<div class="vz-mt-box' + (o.freed ? " is-freed" : "") + '" data-obj="' + escapeHtml(o.id) + '"><div class="vz-mt-head">' + escapeHtml(o.type || o.id) + "</div>" +
			(o.fields || []).map(function(v) { return rowHtml(v, o.id + "." + v.name); }).join("") + "</div>";
	});
	if (!s.heap.length) html += '<div class="vz-mt-null">(empty)</div>';
	stage.innerHTML = html + "</div></div></div>";
	stage._vzMtFrame = frame;
	draw(stage);
	if (!stage._vzMtObserved && typeof ResizeObserver !== "undefined") {
		stage._vzMtObserved = true;
		new ResizeObserver(function() { draw(stage); }).observe(stage);
	}
}
