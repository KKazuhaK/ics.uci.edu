// Term-document incidence matrix + a Boolean query, step by step
// (CS 121 Lecture 14 p33–38): take each query term's 0/1 row, complement it
// for NOT, and combine the rows column by column with bitwise AND / OR.
// The 1s left in the result row are the matching documents.
import { checkParams } from "./_core.js";

const MAX_TERMS = 10;
const MAX_DOCS = 8;
const MAX_OPERANDS = 5;

export const meta = {
	name: "incidence-matrix",
	summary: "Term-document incidence matrix: answer a Boolean query (AND / OR / NOT) with bitwise operations on the terms' 0/1 rows.",
	groupLabel: "term",
	params: {
		terms: { type: "string", required: true, desc: "One row per term: \"Brutus: 1 1 0 1 0 0; Caesar: 1 1 0 1 1 1\" (rows separated by ; or newlines)." },
		docs: { type: "string", required: true, desc: "Document (column) names, comma-separated; as many as each row has bits." },
		query: { type: "string", required: true, desc: "Terms joined by AND / OR, each optionally preceded by NOT, evaluated left to right: \"Brutus AND Caesar AND NOT Calpurnia\"." },
		lang: { type: "enum", values: ["en", "zh"], default: "en", desc: "Language of the messages and legend." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: {
		terms: "Antony: 1 1 0 0 0 1; Brutus: 1 1 0 1 0 0; Caesar: 1 1 0 1 1 1; Calpurnia: 0 1 0 0 0 0; Cleopatra: 1 0 0 0 0 0; mercy: 1 0 1 1 1 1; worser: 1 0 1 1 1 0",
		docs: "Antony and Cleopatra, Julius Caesar, The Tempest, Hamlet, Othello, Macbeth",
		query: "Brutus AND Caesar AND NOT Calpurnia"
	}
};

function parseTerms(text) {
	const rows = [];
	const parts = String(text).split(/[;\n]+/).map(function(s) { return s.trim(); }).filter(Boolean);
	for (const p of parts) {
		const m = /^([^:]+):\s*([01\s]+)$/.exec(p);
		if (!m) return { error: "\"terms\": \"" + p + "\" is not \"term: 0 1 0 …\"" };
		const bits = m[2].replace(/\s+/g, "").split("").map(Number);
		rows.push({ term: m[1].trim(), bits: bits });
	}
	return { rows: rows };
}

function splitDocs(text) {
	return String(text).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
}

// "A AND NOT B OR C" -> [{op: null, neg: false, term: "A"}, {op: "AND", neg: true, term: "B"}, ...]
function parseQuery(text) {
	const toks = String(text).trim().split(/\s+/).filter(Boolean);
	const out = [];
	let i = 0;
	while (i < toks.length) {
		let op = null;
		if (out.length) {
			const t = toks[i].toUpperCase();
			if (t !== "AND" && t !== "OR") return { error: "\"query\": expected AND or OR before \"" + toks[i] + "\"" };
			op = t; i++;
		}
		let neg = false;
		if (i < toks.length && toks[i].toUpperCase() === "NOT") { neg = true; i++; }
		if (i >= toks.length) return { error: "\"query\" ends without a term" };
		const term = toks[i];
		if (["AND", "OR", "NOT"].includes(term.toUpperCase())) return { error: "\"query\": expected a term, got \"" + term + "\"" };
		out.push({ op: op, neg: neg, term: term });
		i++;
	}
	if (!out.length) return { error: "\"query\" needs at least one term" };
	return { ops: out };
}

function findRow(rows, term) {
	const t = term.toLowerCase();
	return rows.find(function(r) { return r.term.toLowerCase() === t; });
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const t = parseTerms(config.terms);
	if (t.error) return [t.error];
	if (!t.rows.length) return ["\"terms\" needs at least one row"];
	if (t.rows.length > MAX_TERMS) errors.push("\"terms\" has " + t.rows.length + " rows; at most " + MAX_TERMS);
	const docs = splitDocs(config.docs);
	if (!docs.length) errors.push("\"docs\" needs at least one document name");
	if (docs.length > MAX_DOCS) errors.push("\"docs\" has " + docs.length + " names; at most " + MAX_DOCS);
	for (const r of t.rows) if (r.bits.length !== docs.length) errors.push("\"terms\": row \"" + r.term + "\" has " + r.bits.length + " bits but \"docs\" names " + docs.length + " documents");
	const q = parseQuery(config.query);
	if (q.error) errors.push(q.error);
	else {
		if (q.ops.length > MAX_OPERANDS) errors.push("\"query\" has " + q.ops.length + " terms; at most " + MAX_OPERANDS);
		for (const o of q.ops) if (!findRow(t.rows, o.term)) errors.push("\"query\": \"" + o.term + "\" is not a row of \"terms\"");
	}
	return errors;
}

export const code = {
	python: [
		"def answer(matrix, docs, query):",
		"    result = None",
		"    for op, neg, term in query:",
		"        row = matrix[term]      # 0/1 vector",
		"        if neg:                 # NOT",
		"            row = [1 - b for b in row]",
		"        if result is None:",
		"            result = row",
		"        elif op == \"AND\":",
		"            result = [a & b for a, b",
		"                      in zip(result, row)]",
		"        else:                   # OR",
		"            result = [a | b for a, b",
		"                      in zip(result, row)]",
		"    return [d for d, b in zip(docs, result)",
		"            if b]"
	]
};

const TEXT = {
	en: {
		legend: ["Row being used", "Complemented (NOT)", "1 in the result"],
		vars: ["query", "term", "row", "result"],
		resultRow: "result",
		intro: "Rows are terms, columns are documents: a 1 means the document contains the term. The query is answered with the rows alone — no document is read.",
		row: function(first, term, v) { return (first ? "Start with " : "Next operand: ") + "the row for `" + term + "` = " + v + "."; },
		not: function(term, v) { return "NOT flips every bit: NOT " + term + " = " + v + " (the documents that do *not* contain it)."; },
		start: function(v) { return "That row is the running result: " + v + "."; },
		combine: function(a, op, b, r) { return a + " " + op + " " + b + " = " + r + " — bitwise, column by column."; },
		hits: function(v, n, list) { return "Result " + v + " → " + n + " document(s): " + list + "."; },
		none: function(v) { return "Result " + v + " → no document matches."; }
	},
	zh: {
		legend: ["正在使用的行", "取反（NOT）", "结果中的 1"],
		vars: ["查询", "词项", "行", "结果"],
		resultRow: "结果",
		intro: "行是词项，列是文档：1 表示该文档包含这个词项。只用这些行就能回答查询——不需要读任何文档。",
		row: function(first, term, v) { return (first ? "先取 " : "下一个操作数：") + "`" + term + "` 的行 = " + v + "。"; },
		not: function(term, v) { return "NOT 把每一位取反：NOT " + term + " = " + v + "（*不*包含它的文档）。"; },
		start: function(v) { return "这一行就是当前结果：" + v + "。"; },
		combine: function(a, op, b, r) { return a + " " + op + " " + b + " = " + r + "——按位、逐列计算。"; },
		hits: function(v, n, list) { return "结果 " + v + " → " + n + " 篇文档：" + list + "。"; },
		none: function(v) { return "结果 " + v + " → 没有文档匹配。"; }
	}
};

function T(config) { return TEXT[config && config.lang === "zh" ? "zh" : "en"]; }

export function legend(config) {
	const l = T(config).legend;
	return [
		{ cls: "is-cmp", label: l[0] },
		{ cls: "is-min", label: l[1] },
		{ cls: "is-sorted", label: l[2] }
	];
}

export const input = {
	key: "query",
	label: "Query",
	format: function(config) { return config.query; },
	parse: function(text) {
		const q = parseQuery(text);
		if (q.error) return { error: q.error.replace("\"query\"", "the query") };
		return { value: String(text).trim() };
	},
	random: function(config) {
		const t = parseTerms(config.terms);
		const names = (t.rows || []).map(function(r) { return r.term; });
		const pick = names.slice().sort(function() { return Math.random() - 0.5; }).slice(0, Math.min(3, names.length));
		return pick.map(function(n, i) {
			const neg = i > 0 && Math.random() < 0.35 ? "NOT " : "";
			const op = i === 0 ? "" : (Math.random() < 0.7 ? "AND " : "OR ");
			return op + neg + n;
		}).join(" ");
	}
};

function vec(bits) { return bits.join(" "); }

export function steps(config) {
	const t = T(config);
	const rows = parseTerms(config.terms).rows;
	const docs = splitDocs(config.docs);
	const ops = parseQuery(config.query).ops;
	const frames = [];
	let result = null;

	function push(f) {
		frames.push({
			group: f.group,
			active: f.active || null,
			operand: f.operand || null,
			result: result ? result.slice() : null,
			final: !!f.final,
			lines: f.lines || [],
			msg: f.msg,
			vars: [
				[t.vars[0], config.query],
				[t.vars[1], f.term || "—"],
				[t.vars[2], f.operand ? vec(f.operand) : "—"],
				[t.vars[3], result ? vec(result) : "—"]
			],
			opLabel: f.term || "",
			resultRow: t.resultRow,
			rows: rows,
			docs: docs
		});
	}

	push({ group: 0, lines: [2], msg: t.intro });

	ops.forEach(function(o, k) {
		const row = findRow(rows, o.term);
		const g = k + 1;
		push({ group: g, active: row.term, term: row.term, operand: row.bits.slice(), lines: [3, 4],
			msg: t.row(k === 0, row.term, vec(row.bits)) });
		let operand = row.bits.slice();
		if (o.neg) {
			operand = operand.map(function(b) { return 1 - b; });
			push({ group: g, active: row.term, term: "NOT " + row.term, operand: operand, lines: [5, 6],
				msg: t.not(row.term, vec(operand)) });
		}
		if (result === null) {
			result = operand.slice();
			push({ group: g, active: row.term, term: (o.neg ? "NOT " : "") + row.term, operand: operand, lines: [7, 8],
				msg: t.start(vec(result)) });
		} else {
			const before = result.slice();
			result = result.map(function(a, i) { return o.op === "AND" ? (a & operand[i]) : (a | operand[i]); });
			push({ group: g, active: row.term, term: o.op + " " + (o.neg ? "NOT " : "") + row.term, operand: operand,
				lines: o.op === "AND" ? [9, 10, 11] : [12, 13, 14],
				msg: t.combine(vec(before), o.op, vec(operand), vec(result)) });
		}
	});

	const hits = docs.filter(function(d, i) { return result[i]; });
	push({ group: ops.length + 1, final: true, lines: [15, 16],
		msg: hits.length ? t.hits(vec(result), hits.length, hits.join(", ")) : t.none(vec(result)) });
	return frames;
}

const STYLE = `
.vz-im { overflow-x: auto; }
.vz-im table { border-collapse: collapse; font: 0.78rem/1.3 "Consolas", "Menlo", monospace; margin: 0 auto; }
.vz-im th, .vz-im td { border: 1px solid var(--vz-border); padding: 0.28rem 0.45rem; text-align: center; }
.vz-im thead th { font: 600 0.7rem/1.2 system-ui, sans-serif; color: var(--vz-muted); max-width: 5.5rem; white-space: normal; }
.vz-im tbody th { text-align: left; font-weight: 600; background: var(--vz-surface); }
.vz-im tr.is-cmp td, .vz-im tr.is-cmp th { background: var(--vz-cmp-bg); }
.vz-im tr.is-cmp th { box-shadow: inset 3px 0 0 var(--vz-cmp-bd); }
.vz-im tr.is-dim td, .vz-im tr.is-dim th { opacity: 0.45; }
.vz-im tr.vz-im-op td, .vz-im tr.vz-im-op th { background: var(--vz-min-bg); }
.vz-im tr.vz-im-res th { background: var(--vz-surface); }
.vz-im td.is-one { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); font-weight: 700; }
.vz-im th.is-hit { color: var(--vz-sorted-fg); background: var(--vz-sorted-bg); }
.vz-im tr.vz-im-gap td, .vz-im tr.vz-im-gap th { border: none; height: 0.35rem; padding: 0; }
`;

function ensureStyle() {
	if (document.getElementById("viz-incidence-matrix-style")) return;
	const s = document.createElement("style");
	s.id = "viz-incidence-matrix-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function esc(t) {
	return String(t).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

export function render(stage, frame) {
	ensureStyle();
	let html = '<div class="vz-im"><table><thead><tr><th></th>';
	frame.docs.forEach(function(d, i) {
		const hit = frame.final && frame.result && frame.result[i];
		html += '<th class="' + (hit ? "is-hit" : "") + '">' + esc(d) + "</th>";
	});
	html += "</tr></thead><tbody>";
	frame.rows.forEach(function(r) {
		const cls = frame.active === null ? "" : (r.term === frame.active ? "is-cmp" : "is-dim");
		html += '<tr class="' + cls + '"><th>' + esc(r.term) + "</th>" + r.bits.map(function(b) { return "<td>" + b + "</td>"; }).join("") + "</tr>";
	});
	const n = frame.docs.length;
	html += '<tr class="vz-im-gap"><th></th>' + "<td></td>".repeat(n) + "</tr>";
	const opLabel = frame.opLabel;
	if (frame.operand && opLabel.indexOf("NOT") >= 0) {
		html += '<tr class="vz-im-op"><th>' + esc(opLabel) + "</th>" + frame.operand.map(function(b) { return "<td>" + b + "</td>"; }).join("") + "</tr>";
	}
	html += '<tr class="vz-im-res"><th>' + esc(frame.resultRow) + '</th>' + (frame.result
		? frame.result.map(function(b) { return '<td class="' + (b ? "is-one" : "") + '">' + b + "</td>"; }).join("")
		: "<td>·</td>".repeat(n)) + "</tr>";
	stage.innerHTML = html + "</tbody></table></div>";
}
