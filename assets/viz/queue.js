// Queue (FIFO), step by step: enqueue at the tail, dequeue at the head of a
// singly linked list with a tail pointer (Lecture 5). Accepts calls —
// enqueue(x); dequeue() — or the algs4 shorthand from the slides:
// "to be or not to - be - -", where a word enqueues it and "-" dequeues.
import { checkParams } from "./_core.js";

const MAX_OPS = 24;
const MAX_LEN = 8;

export const meta = {
	name: "queue",
	summary: "Queue on a singly linked list with head (front) and tail (rear): both operations O(1).",
	groupLabel: "operation",
	params: {
		ops: { type: "string", required: true, desc: "enqueue(x); dequeue(); peek() — or shorthand \"to be - or\" (word = enqueue, - = dequeue)." },
		code: { type: "enum", values: ["cpp", "none"], default: "cpp", desc: "Code beside the demo." }
	},
	example: { ops: "to be or not to - be - - that - - - is" }
};

// ---- ops parsing (same helper in linked-list / stack / queue) ----
function splitArgs(text) {
	const out = [];
	let cur = "", quote = null, quoted = false;
	for (const ch of text) {
		if (quote) {
			if (ch === quote) quote = null; else cur += ch;
		} else if (ch === '"' || ch === "'") {
			quote = ch; quoted = true;
		} else if (ch === ",") {
			out.push({ raw: quoted ? cur : cur.trim(), quoted: quoted }); cur = ""; quoted = false;
		} else cur += ch;
	}
	if (quote) return null;
	if (cur.trim() || quoted || out.length) out.push({ raw: quoted ? cur : cur.trim(), quoted: quoted });
	return out;
}

function parseCalls(text) {
	const calls = [];
	const parts = String(text).split(/[;\n]+/).map(function(s) { return s.trim(); }).filter(Boolean);
	for (const part of parts) {
		const m = /^([A-Za-z]+)\s*\((.*)\)$/.exec(part);
		if (!m) return { error: "can't read \"" + part + "\" — write calls like add(x); remove()" };
		const pieces = m[2].trim() ? splitArgs(m[2]) : [];
		if (pieces === null) return { error: "unclosed quote in \"" + part + "\"" };
		const args = pieces.map(function(a) {
			return !a.quoted && /^-?\d+$/.test(a.raw) ? { int: Number(a.raw), text: a.raw } : { text: a.raw };
		});
		calls.push({ name: m[1], args: args, src: part });
	}
	return { calls: calls };
}

function plan(config) {
	const text = String(config.ops).trim();
	if (!text) return { errors: ["\"ops\" needs at least one operation"] };
	let ops = [];
	if (/\(/.test(text)) {
		const p = parseCalls(text);
		if (p.error) return { errors: ["\"ops\": " + p.error] };
		for (const c of p.calls) {
			if (c.name === "enqueue" && c.args.length === 1) ops.push({ kind: "enqueue", item: c.args[0].text, src: c.src });
			else if ((c.name === "dequeue" || c.name === "peek") && c.args.length === 0) ops.push({ kind: c.name, src: c.src });
			else return { errors: ["\"ops\": " + c.src + " — use enqueue(x), dequeue(), peek()"] };
		}
	} else {
		ops = text.split(/\s+/).map(function(w) {
			return w === "-" ? { kind: "dequeue", src: "-  (dequeue)" } : { kind: "enqueue", item: w, src: w + "  (enqueue)" };
		});
	}
	if (ops.length > MAX_OPS) return { errors: ["\"ops\" can have at most " + MAX_OPS + " operations"] };
	let n = 0;
	for (const o of ops) {
		if (o.kind === "enqueue") {
			if (o.item.length < 1 || o.item.length > 8) return { errors: ["\"ops\": items must be 1–8 characters (" + o.item + ")"] };
			n++;
			if (n > MAX_LEN) return { errors: ["\"ops\": the queue grows past " + MAX_LEN + " items — keep the demo smaller"] };
		} else if (n === 0) {
			return { errors: ["\"ops\": " + o.src.trim() + " on an empty queue — that would throw"] };
		} else if (o.kind === "dequeue") n--;
	}
	return { ops: ops };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	return plan(config).errors || [];
}

export const code = {
	cpp: [
		"void enqueue(const T& item) {",
		"    Node* node = new Node(item);",
		"    if (tail == nullptr) head = tail = node;",
		"    else { tail->next = node;  tail = node; }",
		"    n++;",
		"}",
		"T dequeue() {",
		"    Node* temp = head;",
		"    head = head->next;",
		"    if (head == nullptr) tail = nullptr;",
		"    T item = temp->item;",
		"    delete temp;  n--;",
		"    return item;",
		"}",
		"const T& peek() const {",
		"    return head->item;",
		"}"
	]
};

export const legend = [
	{ cls: "is-sorted", label: "Just enqueued" },
	{ cls: "is-min", label: "Front (peek)" },
	{ cls: "is-swap", label: "Dequeued" }
];

export const input = {
	key: "ops",
	label: "Operations",
	format: function(config) { return config.ops; },
	parse: function(text) {
		return String(text).trim() ? { value: String(text).trim() } : { error: "type e.g. a b - c - -" };
	},
	random: function() {
		const words = ["to", "be", "or", "not", "that", "is", "the", "question"];
		const out = [];
		let n = 0;
		for (let k = 0; k < 12; k++) {
			if (n > 0 && Math.random() < 0.4) { out.push("-"); n--; }
			else if (n < MAX_LEN) { out.push(words[Math.floor(Math.random() * words.length)]); n++; }
		}
		return out.join(" ");
	}
};

export function steps(config) {
	const ops = plan(config).ops;
	const q = [];
	const out = [];
	const frames = [];

	function push(f) {
		frames.push({
			items: q.slice(),
			gone: f.gone === undefined ? null : f.gone,
			mark: f.mark || "",
			lines: f.lines || [],
			msg: f.msg,
			group: f.group,
			vars: [
				["op", f.op || "—"],
				["n (size)", String(q.length)],
				["head (front)", q.length ? "\"" + q[0] + "\"" : "nullptr"],
				["tail (rear)", q.length ? "\"" + q[q.length - 1] + "\"" : "nullptr"],
				["dequeued so far", out.length ? out.join(" ") : "—"]
			]
		});
	}

	push({ group: -1, msg: "Start: an empty queue (`head == tail == nullptr`). Enqueue at the tail, dequeue at the head." });
	ops.forEach(function(o, g) {
		if (o.kind === "enqueue") {
			const wasEmpty = q.length === 0;
			q.push(o.item);
			push({ group: g, op: o.src, mark: "is-sorted", lines: wasEmpty ? [2, 3, 5] : [2, 4, 5],
				msg: "enqueue " + o.item + ": " + (wasEmpty ? "the queue was empty, so `head` and `tail` both point at the new node." : "link it after the old tail and move `tail` to it.") + " O(1)." });
		} else if (o.kind === "peek") {
			push({ group: g, op: o.src, mark: "is-min", lines: [15], msg: "peek(): return the front item \"" + q[0] + "\" without removing it." });
		} else {
			const item = q.shift();
			out.push(item);
			push({ group: g, op: o.src, gone: item, lines: q.length ? [8, 9, 11, 12, 13] : [8, 9, 10, 11, 12, 13],
				msg: "dequeue(): the front \"" + item + "\" leaves first (first in, first out); `head` moves to the next node." +
					(q.length ? "" : " The queue is now empty, so `tail = nullptr` too — forget that and `tail` dangles.") + " O(1)." });
		}
	});
	push({ group: ops.length, msg: "Done. Left in the queue (front → rear): " + (q.length ? q.join(", ") : "nothing") + ". Dequeued in order: " + (out.join(" ") || "nothing") + "." });
	return frames;
}

const STYLE = `
.vz-q { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; overflow-x: auto; padding-bottom: 0.2rem; }
.vz-q-row { display: flex; align-items: flex-start; gap: 0.15rem; }
.vz-q-node { display: flex; flex-direction: column; align-items: center; }
.vz-q-box { padding: 0.45rem 0.65rem; border: 1.5px solid var(--vz-border); border-radius: 0.55rem; background: var(--vz-surface); font-weight: 600; white-space: nowrap;
	transition: background-color 0.25s, border-color 0.25s, color 0.25s; }
.vz-q-box.is-sorted { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-color: var(--vz-sorted-bd); }
.vz-q-box.is-min { background: var(--vz-min-bg); color: var(--vz-min-fg); border-color: var(--vz-min-bd); }
.vz-q-box.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); border-color: var(--vz-swap-bd); border-style: dashed; }
.vz-q-arrow { margin-top: 0.45rem; color: var(--vz-muted); padding: 0 0.1rem; }
.vz-q-ptrs { min-height: 1.4em; margin-top: 0.3rem; display: flex; flex-direction: column; align-items: center; font: 0.76rem/1.25 "Consolas", "Menlo", monospace; color: var(--vz-muted); }
.vz-q-gone { display: flex; flex-direction: column; align-items: center; }
.vz-q-cap { color: var(--vz-muted); font-size: 0.78rem; text-align: center; margin-bottom: 0.3rem; }
.vz-q-empty { color: var(--vz-muted); font: 0.85rem "Consolas", "Menlo", monospace; }
`;

function ensureStyle() {
	if (document.getElementById("viz-queue-style")) return;
	const s = document.createElement("style");
	s.id = "viz-queue-style";
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
	let html = '<div class="vz-q">';
	if (!frame.items.length) {
		html += '<div class="vz-q-empty">head → nullptr ← tail</div>';
	} else {
		html += '<div class="vz-q-row">';
		frame.items.forEach(function(it, k) {
			const last = k === frame.items.length - 1;
			const cls = ["vz-q-box"];
			if (k === 0 && frame.mark === "is-min") cls.push("is-min");
			if (last && frame.mark === "is-sorted") cls.push("is-sorted");
			const ptrs = [];
			if (k === 0) ptrs.push("head ↑ front");
			if (last) ptrs.push("tail ↑ rear");
			html += '<div class="vz-q-node"><div class="' + cls.join(" ") + '">' + escapeHtml(it) + '</div><div class="vz-q-ptrs">' +
				ptrs.map(function(p) { return "<span>" + p + "</span>"; }).join("") + "</div></div>";
			if (!last) html += '<span class="vz-q-arrow">→</span>';
		});
		html += "</div>";
	}
	if (frame.gone !== null) html += '<div class="vz-q-gone"><div class="vz-q-cap">dequeued</div><div class="vz-q-box is-swap">' + escapeHtml(frame.gone) + "</div></div>";
	stage.innerHTML = html + "</div>";
}
