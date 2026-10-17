// Postfix (reverse Polish) evaluation with one stack (Lecture 5, slide 17):
// a value is pushed; an operator pops v1 (right operand) then v2 (left
// operand) and pushes v2 op v1.
import { checkParams } from "./_core.js";

const MAX_TOKENS = 25;

export const meta = {
	name: "postfix-eval",
	summary: "Evaluate a postfix expression with one stack: operands pushed, each operator pops two and pushes the result.",
	groupLabel: "token",
	params: {
		expression: { type: "string", required: true, desc: "Postfix, tokens separated by spaces, e.g. \"2 3 + 4 5 * *\". Integers 0–9999 and + - * /." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code beside the demo." }
	},
	example: { expression: "2 3 + 4 5 * *" }
};

function applyOp(op, left, right) {
	if (op === "+") return left + right;
	if (op === "-") return left - right;
	if (op === "*") return left * right;
	return Math.trunc(left / right);
}

function plan(config) {
	const tokens = String(config.expression).trim().split(/\s+/).filter(Boolean);
	if (!tokens.length) return { errors: ["\"expression\" is empty"] };
	if (tokens.length > MAX_TOKENS) return { errors: ["\"expression\" can have at most " + MAX_TOKENS + " tokens"] };
	const st = [];
	for (const t of tokens) {
		if (/^\d+$/.test(t)) {
			if (Number(t) > 9999) return { errors: ["\"expression\": numbers must be 0–9999 (" + t + ")"] };
			st.push(Number(t));
		} else if (/^[-+*/]$/.test(t)) {
			if (st.length < 2) return { errors: ["\"expression\": operator " + t + " needs two operands but the stack has " + st.length + " — separate tokens with spaces"] };
			const v1 = st.pop();
			const v2 = st.pop();
			if (t === "/" && v1 === 0) return { errors: ["\"expression\": division by zero"] };
			st.push(applyOp(t, v2, v1));
		} else return { errors: ["\"expression\": unexpected token \"" + t + "\" (postfix has no parentheses; separate tokens with spaces)"] };
	}
	if (st.length !== 1) return { errors: ["\"expression\": " + st.length + " values left on the stack at the end — too few operators"] };
	return { tokens: tokens };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	return plan(config).errors || [];
}

export const code = {
	cpp: [
		"while (in >> tok) {",
		"    if (isOperator(tok)) {          // + - * /",
		"        long v1 = s.pop();",
		"        long v2 = s.pop();",
		"        s.push(applyOp(tok, v2, v1));",
		"    } else {",
		"        s.push(std::stol(tok));",
		"    }",
		"}",
		"long result = s.pop();"
	]
};

export const legend = [
	{ cls: "is-cmp", label: "Current token" },
	{ cls: "is-sorted", label: "Just pushed" },
	{ cls: "is-swap", label: "Popped" }
];

export const input = {
	key: "expression",
	label: "Expression",
	format: function(config) { return config.expression; },
	parse: function(text) { return String(text).trim() ? { value: String(text).trim() } : { error: "type a postfix expression like 2 3 + 4 *" }; },
	random: function() {
		const out = [];
		let depth = 0;
		for (let k = 0; k < 9 || depth > 1; k++) {
			if (depth >= 2 && (Math.random() < 0.45 || k >= 9)) { out.push("+-*"[Math.floor(Math.random() * 3)]); depth--; }
			else { out.push(String(1 + Math.floor(Math.random() * 9))); depth++; }
		}
		return out.join(" ");
	}
};

export function steps(config) {
	const tokens = plan(config).tokens;
	const st = [];
	const frames = [];

	function push(f) {
		frames.push({
			tokens: tokens, pos: f.pos === undefined ? -1 : f.pos, vals: st.slice(),
			newVal: !!f.newVal, popped: f.popped || null,
			lines: f.lines || [], msg: f.msg, group: f.group,
			vars: [
				["tok", f.pos === undefined || f.pos < 0 || f.pos >= tokens.length ? "—" : "\"" + tokens[f.pos] + "\""],
				["stack (top last)", st.length ? st.join(", ") : "empty"]
			]
		});
	}

	push({ group: -1, msg: "Start: read the tokens left to right with one empty stack. No parentheses and no precedence rules are needed." });
	tokens.forEach(function(t, k) {
		if (/^\d+$/.test(t)) { st.push(Number(t)); push({ group: k, pos: k, newVal: true, lines: [7], msg: "Operand " + t + ": push it." }); }
		else {
			const v1 = st.pop();
			const v2 = st.pop();
			push({ group: k, pos: k, popped: [v1 + " (v1)", v2 + " (v2)"], lines: [2, 3, 4], msg: "Operator " + t + ": pop v1 = " + v1 + " (right operand, popped first), then v2 = " + v2 + " (left operand)." });
			const r = applyOp(t, v2, v1);
			st.push(r);
			push({ group: k, pos: k, newVal: true, lines: [5], msg: "Push v2 " + t + " v1 = " + v2 + " " + t + " " + v1 + " = " + r + "." + (t === "-" || t === "/" ? " (Order matters here: v1 " + t + " v2 would give " + applyOp(t, v1, v2) + ".)" : "") });
		}
	});
	push({ group: tokens.length, pos: tokens.length, lines: [10], msg: "End of input: pop the result, " + st[0] + ". The stack is now empty, so the expression was well formed." });
	return frames;
}

const STYLE = `
.vz-ev { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.vz-ev-toks { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.25rem; font: 0.95rem "Consolas", "Menlo", monospace; }
.vz-ev-tok { min-width: 1.6rem; padding: 0.25rem 0.35rem; text-align: center; border: 1.5px solid var(--vz-border); border-radius: 0.4rem; background: var(--vz-surface); }
.vz-ev-tok.is-done { opacity: 0.45; }
.vz-ev-tok.is-cmp { border-color: var(--vz-cmp-bd); box-shadow: 0 0 0 2px var(--vz-cmp-bd); background: var(--vz-cmp-bg); }
.vz-ev-stacks { display: flex; gap: 2rem; justify-content: center; align-items: flex-end; flex-wrap: wrap; }
.vz-ev-col { display: flex; flex-direction: column; align-items: stretch; min-width: 5rem; }
.vz-ev-cap { color: var(--vz-muted); font-size: 0.78rem; text-align: center; margin-bottom: 0.3rem; }
.vz-ev-cell { margin-top: 0.3rem; padding: 0.35rem 0.6rem; text-align: center; border: 1.5px solid var(--vz-border); border-radius: 0.5rem; background: var(--vz-surface); font-weight: 600;
	transition: background-color 0.25s, border-color 0.25s, color 0.25s; }
.vz-ev-cell.is-sorted { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-color: var(--vz-sorted-bd); }
.vz-ev-cell.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); border-color: var(--vz-swap-bd); border-style: dashed; }
.vz-ev-base { margin-top: 0.3rem; border-top: 2px solid var(--vz-muted); color: var(--vz-muted); font: 0.72rem "Consolas", "Menlo", monospace; text-align: center; padding-top: 0.15rem; }
`;

function ensureStyle() {
	if (document.getElementById("viz-eval-style")) return;
	const s = document.createElement("style");
	s.id = "viz-eval-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function escapeHtml(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

export function render(stage, frame) {
	ensureStyle();
	let html = '<div class="vz-ev"><div class="vz-ev-toks">';
	frame.tokens.forEach(function(t, k) {
		const cls = ["vz-ev-tok"];
		if (k === frame.pos) cls.push("is-cmp");
		else if (k < frame.pos) cls.push("is-done");
		html += '<span class="' + cls.join(" ") + '">' + escapeHtml(t) + "</span>";
	});
	html += '</div><div class="vz-ev-stacks"><div class="vz-ev-col"><div class="vz-ev-cap">stack</div>';
	(frame.popped || []).forEach(function(p) { html += '<div class="vz-ev-cell is-swap">' + escapeHtml(p) + "</div>"; });
	for (let k = frame.vals.length - 1; k >= 0; k--) {
		html += '<div class="vz-ev-cell' + (k === frame.vals.length - 1 && frame.newVal ? " is-sorted" : "") + '">' + escapeHtml(frame.vals[k]) + "</div>";
	}
	html += '<div class="vz-ev-base">' + (frame.vals.length ? "bottom" : "empty") + "</div></div></div></div>";
	stage.innerHTML = html;
}
