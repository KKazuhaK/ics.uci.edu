// Postings-list intersection ("the merge"), step by step
// (CS 121 Lecture 15 p30–32): walk two docID-sorted postings lists with one
// pointer each; equal docIDs go to the answer and both pointers advance,
// otherwise only the pointer on the smaller docID advances. O(x + y).
import { checkParams } from "./_core.js";

const MAX_LEN = 20;
const MAX_ID = 99999;

export const meta = {
	name: "postings-intersect",
	summary: "Postings-list intersection (AND): two pointers walk two docID-sorted lists; matches go to the answer. O(x + y) comparisons.",
	groupLabel: "comparison",
	params: {
		lists: { type: "string", required: true, desc: "Two postings lists of docIDs, each strictly increasing, separated by |: \"2 4 8 16 | 1 2 3 5 8\" (at most 20 docIDs each)." },
		terms: { type: "string", default: "Brutus, Caesar", desc: "Names of the two terms, comma-separated." },
		lang: { type: "enum", values: ["en", "zh"], default: "en", desc: "Language of the messages and legend." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Python code beside the demo." }
	},
	example: {
		lists: "2 4 8 16 32 64 128 | 1 2 3 5 8 13 21 34",
		terms: "Brutus, Caesar"
	}
};

function parseLists(text) {
	const parts = String(text).split("|");
	if (parts.length !== 2) return { error: "\"lists\" needs exactly two lists separated by |" };
	const out = [];
	for (let k = 0; k < 2; k++) {
		const toks = parts[k].trim().split(/[\s,]+/).filter(Boolean);
		if (!toks.length) return { error: "\"lists\": list " + (k + 1) + " is empty" };
		if (toks.length > MAX_LEN) return { error: "\"lists\": list " + (k + 1) + " has " + toks.length + " docIDs; at most " + MAX_LEN };
		const ids = [];
		for (const t of toks) {
			if (!/^\d+$/.test(t)) return { error: "\"lists\": \"" + t + "\" is not a docID (a whole number ≥ 0)" };
			const v = Number(t);
			if (v > MAX_ID) return { error: "\"lists\": docID " + t + " is larger than " + MAX_ID };
			if (ids.length && v <= ids[ids.length - 1]) return { error: "\"lists\": list " + (k + 1) + " must be sorted by docID with no repeats (" + ids[ids.length - 1] + " then " + v + ")" };
			ids.push(v);
		}
		out.push(ids);
	}
	return { lists: out };
}

function names(config) {
	const n = String(config.terms == null ? meta.params.terms.default : config.terms).split(",").map(function(s) { return s.trim(); }).filter(Boolean);
	return [n[0] || "p1", n[1] || "p2"];
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const p = parseLists(config.lists);
	if (p.error) return [p.error];
	if (config.terms != null && String(config.terms).split(",").filter(function(s) { return s.trim(); }).length !== 2) {
		return ["\"terms\" needs exactly two names, comma-separated"];
	}
	return [];
}

export const code = {
	python: [
		"def intersect(p1, p2):",
		"    answer = []",
		"    i = j = 0",
		"    while i < len(p1) and j < len(p2):",
		"        if p1[i] == p2[j]:",
		"            answer.append(p1[i])",
		"            i += 1",
		"            j += 1",
		"        elif p1[i] < p2[j]:",
		"            i += 1",
		"        else:",
		"            j += 1",
		"    return answer"
	]
};

const TEXT = {
	en: {
		legend: ["Current pointer", "Match → answer", "Already passed"],
		vars: ["i", "j", "p1[i]", "p2[j]", "answer", "loop steps"],
		answer: "answer",
		intro: function(a, b, x, y) { return "Both lists are sorted by docID. Put a pointer at the start of " + a + " (" + x + " postings) and of " + b + " (" + y + " postings)."; },
		eq: function(v) { return "Equal docIDs (" + v + "): both terms are in document " + v + " → add it to the answer."; },
		both: function(v) { return v + " is in the answer; advance both pointers."; },
		lt: function(a, va, vb) { return va + " < " + vb + ": document " + va + " cannot contain both terms (the other list has already passed it) → advance the " + a + " pointer."; },
		end: function(t) { return "The " + t + " list is exhausted, so nothing left in the other list can match — stop."; },
		done: function(ans, n, x, y) { return "Answer: [" + ans + "] after " + n + " comparisons of p1[i] with p2[j] (at most x + y = " + (x + y) + ")."; }
	},
	zh: {
		legend: ["当前指针", "匹配 → 加入结果", "已经走过"],
		vars: ["i", "j", "p1[i]", "p2[j]", "结果", "比较次数"],
		answer: "结果",
		intro: function(a, b, x, y) { return "两个列表都按 docID 排好序。在 " + a + "（" + x + " 个 posting）和 " + b + "（" + y + " 个 posting）的开头各放一个指针。"; },
		eq: function(v) { return "docID 相等（" + v + "）：两个词项都出现在文档 " + v + " 中 → 加入结果。"; },
		both: function(v) { return v + " 已加入结果；两个指针都前进。"; },
		lt: function(a, va, vb) { return va + " < " + vb + "：文档 " + va + " 不可能同时包含两个词项（另一个列表已经越过它）→ 前进 " + a + " 的指针。"; },
		end: function(t) { return t + " 的列表已经走完，另一个列表里剩下的都不可能匹配——停止。"; },
		done: function(ans, n, x, y) { return "结果：[" + ans + "]，共比较 " + n + " 次（最多 x + y = " + (x + y) + " 次）。"; }
	}
};

function T(config) { return TEXT[config && config.lang === "zh" ? "zh" : "en"]; }

export function legend(config) {
	const l = T(config).legend;
	return [
		{ cls: "is-cmp", label: l[0] },
		{ cls: "is-sorted", label: l[1] },
		{ cls: "is-min", label: l[2] }
	];
}

export const input = {
	key: "lists",
	label: "Postings",
	format: function(config) { return config.lists; },
	parse: function(text) {
		const p = parseLists(text);
		if (p.error) return { error: p.error.replace("\"lists\"", "the lists") };
		return { value: p.lists.map(function(l) { return l.join(" "); }).join(" | ") };
	},
	random: function() {
		function list() {
			const n = 5 + Math.floor(Math.random() * 5);
			const s = new Set();
			while (s.size < n) s.add(1 + Math.floor(Math.random() * 40));
			return Array.from(s).sort(function(a, b) { return a - b; });
		}
		return list().join(" ") + " | " + list().join(" ");
	}
};

export function steps(config) {
	const t = T(config);
	const [p1, p2] = parseLists(config.lists).lists;
	const [a, b] = names(config);
	const frames = [];
	const answer = [];
	let i = 0, j = 0, n = 0;
	const matched1 = new Set(), matched2 = new Set();

	function push(f) {
		frames.push({
			group: f.group,
			lines: f.lines,
			msg: f.msg,
			final: !!f.final,
			p1: p1, p2: p2, names: [a, b],
			i: i, j: j,
			m1: Array.from(matched1), m2: Array.from(matched2),
			answer: answer.slice(),
			answerLabel: t.answer,
			vars: [
				[t.vars[0], String(i)],
				[t.vars[1], String(j)],
				[t.vars[2], i < p1.length ? String(p1[i]) : "—"],
				[t.vars[3], j < p2.length ? String(p2[j]) : "—"],
				[t.vars[4], "[" + answer.join(", ") + "]"],
				[t.vars[5], String(n)]
			]
		});
	}

	push({ group: 0, lines: [2, 3], msg: t.intro(a, b, p1.length, p2.length) });
	while (i < p1.length && j < p2.length) {
		n++;
		if (p1[i] === p2[j]) {
			push({ group: n, lines: [4, 5], msg: t.eq(p1[i]) });
			answer.push(p1[i]); matched1.add(i); matched2.add(j);
			i++; j++;
			push({ group: n, lines: [6, 7, 8], msg: t.both(p1[i - 1]) });
		} else if (p1[i] < p2[j]) {
			push({ group: n, lines: [9, 10], msg: t.lt(a, p1[i], p2[j]) });
			i++;
		} else {
			push({ group: n, lines: [11, 12], msg: t.lt(b, p2[j], p1[i]) });
			j++;
		}
	}
	push({ group: n + 1, lines: [4], msg: t.end(i >= p1.length ? a : b) });
	push({ group: n + 1, final: true, lines: [13], msg: t.done(answer.join(", "), n, p1.length, p2.length) });
	return frames;
}

const STYLE = `
.vz-pi { overflow-x: auto; font: 0.85rem/1.2 "Consolas", "Menlo", monospace; }
.vz-pi-row { display: flex; align-items: center; gap: 0.3rem; margin: 0.45rem 0; white-space: nowrap; }
.vz-pi-name { min-width: 5.5rem; font: 600 0.82rem/1.2 system-ui, sans-serif; text-align: right; padding-right: 0.4rem; }
.vz-pi-cell { min-width: 2.1rem; padding: 0.3rem 0.35rem; text-align: center; border: 1px solid var(--vz-border); border-radius: 0.25rem; background: var(--vz-surface); }
.vz-pi-cell.is-cmp { background: var(--vz-cmp-bg); border: 2px solid var(--vz-cmp-bd); font-weight: 700; }
.vz-pi-cell.is-passed { background: var(--vz-min-bg); border-color: var(--vz-min-bd); color: var(--vz-muted); }
.vz-pi-cell.is-match { background: var(--vz-sorted-bg); border-color: var(--vz-sorted-bd); color: var(--vz-sorted-fg); font-weight: 700; }
.vz-pi-arrow { color: var(--vz-muted); font-size: 0.7rem; }
.vz-pi-ans { border-top: 1px dashed var(--vz-border); padding-top: 0.45rem; }
.vz-pi-empty { color: var(--vz-muted); }
`;

function ensureStyle() {
	if (document.getElementById("viz-postings-intersect-style")) return;
	const s = document.createElement("style");
	s.id = "viz-postings-intersect-style";
	s.textContent = STYLE;
	document.head.appendChild(s);
}

function esc(x) {
	return String(x).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

function row(name, list, ptr, matched) {
	let html = '<div class="vz-pi-row"><span class="vz-pi-name">' + esc(name) + "</span>";
	list.forEach(function(v, k) {
		let cls = "";
		if (matched.indexOf(k) >= 0) cls = "is-match";
		else if (k === ptr) cls = "is-cmp";
		else if (k < ptr) cls = "is-passed";
		if (k) html += '<span class="vz-pi-arrow">→</span>';
		html += '<span class="vz-pi-cell ' + cls + '">' + v + "</span>";
	});
	return html + "</div>";
}

export function render(stage, frame) {
	ensureStyle();
	let html = '<div class="vz-pi">';
	html += row(frame.names[0], frame.p1, frame.i, frame.m1);
	html += row(frame.names[1], frame.p2, frame.j, frame.m2);
	html += '<div class="vz-pi-row vz-pi-ans"><span class="vz-pi-name">' + esc(frame.answerLabel) + "</span>";
	html += frame.answer.length
		? frame.answer.map(function(v) { return '<span class="vz-pi-cell is-match">' + v + "</span>"; }).join("")
		: '<span class="vz-pi-empty">[ ]</span>';
	stage.innerHTML = html + "</div></div>";
}
