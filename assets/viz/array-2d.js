// Multidimensional arrays in row-major order (Lecture 2): walk the elements
// in memory order, showing each one's place in the grid and in the flat
// block, then (optionally) work out one element's offset and address.
import { checkParams } from "./_core.js";

const MAX_CELLS = 48;

export const meta = {
	name: "array-2d",
	summary: "Row-major layout of a 2D or 3D C++ array: logical position ↔ flat offset ↔ address.",
	groupLabel: "row",
	params: {
		dims: { type: "int[]", required: true, minLength: 2, maxLength: 3, minValue: 1, maxValue: 8, desc: "Dimensions, e.g. [4, 5] for int a[4][5] or [3, 2, 4] for int a[3][2][4] (at most 48 elements)." },
		find: { type: "int[]", minLength: 2, maxLength: 3, minValue: 0, maxValue: 7, desc: "Optional element to locate at the end, e.g. [2, 3]." },
		base: { type: "int", default: 1000, min: 0, max: 1000000, desc: "Address of a[0][0] (illustrative)." },
		elemSize: { type: "int", default: 4, min: 1, max: 16, desc: "sizeof one element in bytes (int = 4)." },
		walk: { type: "bool", default: true, desc: "Step through every element in memory order before the lookup." }
	},
	example: { dims: [4, 5], find: [2, 3] }
};

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const total = config.dims.reduce(function(a, b) { return a * b; }, 1);
	if (total > MAX_CELLS) errors.push("\"dims\": " + config.dims.join(" × ") + " = " + total + " elements; keep it at most " + MAX_CELLS);
	if (config.find) {
		if (config.find.length !== config.dims.length) errors.push("\"find\" needs one index per dimension (" + config.dims.length + ")");
		else config.find.forEach(function(v, k) { if (v >= config.dims[k]) errors.push("\"find\"[" + k + "] = " + v + " is out of range 0…" + (config.dims[k] - 1)); });
	}
	if (config.walk === false && !config.find) errors.push("with \"walk\": false there is nothing to show — give \"find\"");
	return errors;
}

function decl(dims) { return "int a" + dims.map(function(d) { return "[" + d + "]"; }).join("") + ";"; }
function idxName(ix) { return "a" + ix.map(function(v) { return "[" + v + "]"; }).join(""); }
function unflatten(k, dims) {
	const out = [];
	for (let d = dims.length - 1; d >= 0; d--) { out.unshift(k % dims[d]); k = Math.floor(k / dims[d]); }
	return out;
}

export function steps(config) {
	const dims = config.dims;
	const total = dims.reduce(function(a, b) { return a * b; }, 1);
	const frames = [];
	const formula = dims.length === 2 ? "i·" + dims[1] + " + j" : "i·(" + dims[1] + "·" + dims[2] + ") + j·" + dims[2] + " + k";

	function push(f) {
		const ix = f.flat >= 0 ? unflatten(f.flat, dims) : null;
		frames.push({
			dims: dims, flat: f.flat, done: f.done, lookup: !!f.lookup, msg: f.msg, group: f.group,
			vars: [
				["declaration", decl(dims)],
				["element", ix ? idxName(ix) : "—"],
				["offset (" + formula + ")", f.flat >= 0 ? String(f.flat) : "—"],
				["address (base + offset·" + config.elemSize + ")", f.flat >= 0 ? String(config.base + f.flat * config.elemSize) : "—"]
			]
		});
	}

	push({ flat: -1, done: 0, group: -1, msg: "`" + decl(dims) + "` is one contiguous block of " + total + " ints (" + total * config.elemSize + " bytes). Row-major: the last index changes fastest." });
	if (config.walk) {
		for (let k = 0; k < total; k++) {
			const ix = unflatten(k, dims);
			const rowStart = ix[ix.length - 1] === 0;
			push({ flat: k, done: k, group: Math.floor(k / dims[dims.length - 1]),
				msg: idxName(ix) + " is element " + k + " of the block" + (rowStart && k > 0 ? " — a new " + (dims.length === 2 ? "row" : "row of the inner 2D array") + " starts right after the previous one ends" : "") + "." });
		}
	}
	if (config.find) {
		const f = config.find;
		const off = dims.length === 2 ? f[0] * dims[1] + f[1] : f[0] * dims[1] * dims[2] + f[1] * dims[2] + f[2];
		const work = dims.length === 2 ? f[0] + "·" + dims[1] + " + " + f[1] : f[0] + "·" + (dims[1] * dims[2]) + " + " + f[1] + "·" + dims[2] + " + " + f[2];
		push({ flat: off, done: config.walk ? total : 0, lookup: true, group: total,
			msg: "Where is " + idxName(f) + "? Skip " + (dims.length === 2 ? f[0] + " full row(s) of " + dims[1] : f[0] + " full " + dims[1] + "×" + dims[2] + " block(s) and " + f[1] + " row(s) of " + dims[2]) +
				": offset = " + work + " = " + off + ", address = " + config.base + " + " + off + "·" + config.elemSize + " = " + (config.base + off * config.elemSize) + "." });
	}
	return frames;
}

const STYLE = `
.vz-a2 { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.vz-a2-cap { color: var(--vz-muted); font-size: 0.78rem; text-align: center; margin-bottom: 0.3rem; }
.vz-a2-blocks { display: flex; gap: 1.2rem; flex-wrap: wrap; justify-content: center; }
.vz-a2-grid { display: grid; gap: 0.25rem; }
.vz-a2-c { min-width: 2.6rem; padding: 0.3rem 0.2rem; text-align: center; border: 1.5px solid var(--vz-border); border-radius: 0.4rem; background: var(--vz-surface);
	font: 0.72rem "Consolas", "Menlo", monospace; color: var(--vz-muted); transition: background-color 0.2s, border-color 0.2s, color 0.2s; }
.vz-a2-c.is-done { background: var(--vz-sorted-bg); border-color: var(--vz-sorted-bd); color: var(--vz-sorted-fg); }
.vz-a2-c.is-cur { background: var(--vz-min-bg); border-color: var(--vz-min-bd); color: var(--vz-min-fg); font-weight: 600; }
.vz-a2-flat { display: flex; flex-wrap: wrap; gap: 0.15rem; justify-content: center; max-width: 48rem; }
.vz-a2-f { display: flex; flex-direction: column; align-items: center; }
.vz-a2-f .vz-a2-c { min-width: 1.75rem; padding: 0.3rem 0.1rem; }
.vz-a2-f small { color: var(--vz-muted); font: 0.62rem "Consolas", "Menlo", monospace; margin-top: 0.1rem; }
.vz-a2-f.is-rowstart .vz-a2-c { box-shadow: -3px 0 0 0 var(--vz-blue); }
`;

function ensureStyle() {
	if (document.getElementById("viz-array-2d-style")) return;
	const s = document.createElement("style");
	s.id = "viz-array-2d-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function cellCls(k, frame) {
	if (k === frame.flat) return "vz-a2-c is-cur";
	if (k < frame.done) return "vz-a2-c is-done";
	return "vz-a2-c";
}

export function render(stage, frame) {
	ensureStyle();
	const dims = frame.dims;
	const R = dims[dims.length - 2];
	const C = dims[dims.length - 1];
	const blocks = dims.length === 3 ? dims[0] : 1;
	let html = '<div class="vz-a2"><div><div class="vz-a2-cap">logical view</div><div class="vz-a2-blocks">';
	for (let b = 0; b < blocks; b++) {
		html += "<div>" + (blocks > 1 ? '<div class="vz-a2-cap">a[' + b + "]</div>" : "") + '<div class="vz-a2-grid" style="grid-template-columns: repeat(' + C + ', auto)">';
		for (let i = 0; i < R; i++) for (let j = 0; j < C; j++) {
			const k = b * R * C + i * C + j;
			html += '<div class="' + cellCls(k, frame) + '">' + (blocks > 1 ? "[" + b + "]" : "") + "[" + i + "][" + j + "]</div>";
		}
		html += "</div></div>";
	}
	html += '</div></div><div><div class="vz-a2-cap">memory (one contiguous block, offset under each cell)</div><div class="vz-a2-flat">';
	const total = blocks * R * C;
	for (let k = 0; k < total; k++) {
		html += '<div class="vz-a2-f' + (k > 0 && k % C === 0 ? " is-rowstart" : "") + '"><div class="' + cellCls(k, frame) + '">' + k + "</div><small>" + (k % C === 0 ? "row " + Math.floor(k / C) : "") + "</small></div>";
	}
	stage.innerHTML = html + "</div></div></div>";
}
