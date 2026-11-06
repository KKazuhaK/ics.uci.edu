// robots.txt, step by step (CS 121 Lecture 7 p17–24, Lecture 6.5 p16–21):
// pick the group that applies to the crawler (a group naming the bot wins
// over "*" — only that group's rules count), then for each URL find the rule
// lines whose path matches and decide allowed / disallowed.
//   match "longest": RFC 9309 / Google — the longest matching path wins, Allow
//                    wins a tie, `*` and a trailing `$` are wildcards.
//   match "first":   the classic Python urllib.robotparser (e.g. 3.10–3.12):
//                    the first matching line in file order wins, paths are
//                    plain prefixes (`*` and `$` are literal characters).
import { checkParams } from "./_core.js";

const MAX_LINES = 40;
const MAX_URLS = 10;

export const meta = {
	name: "robots-txt",
	summary: "robots.txt rules + a list of URLs: which group applies, which rule line matches, allowed or not (incl. Allow inside a Disallowed folder).",
	groupLabel: "URL",
	params: {
		robots: { type: "string", required: true, desc: "The robots.txt file; lines separated by \\n." },
		urls: { type: "string", required: true, desc: "Paths or URLs to test, comma- or newline-separated (/audio/x.mp3, https://www.cnn.com/ads/)." },
		agent: { type: "string", default: "MyCrawler", desc: "The crawler's user-agent name." },
		match: { type: "enum", values: ["longest", "first"], default: "longest", desc: "\"longest\" = RFC 9309 / Google; \"first\" = classic urllib.robotparser (first matching line)." },
		code: { type: "enum", values: ["python", "none"], default: "python", desc: "Code beside the demo." }
	},
	example: {
		robots: "User-agent: *\nAllow: /audio/podcasts/\nAllow: /partners/ipad/live-video.json\nDisallow: /*.jsx$\nDisallow: /ads/\nDisallow: /audio/\nDisallow: /partners/\nDisallow: /search/",
		urls: "/audio/podcasts/ep1.mp3, /audio/live.html, /partners/ipad/live-video.json, /partners/ipad/x.json, /2026/10/14/world/index.html, /video/player.jsx"
	}
};

// Parse into lines + groups. Returns { lines, groups } or { error }.
function parseRobots(text) {
	const raw = String(text).split(/\r?\n/);
	if (raw.length > MAX_LINES) return { error: "\"robots\" has " + raw.length + " lines; at most " + MAX_LINES };
	const lines = [];
	const groups = [];
	let cur = null, lastWasAgent = false;
	raw.forEach(function(textLine, k) {
		const body = textLine.replace(/#.*$/, "").trim();
		const entry = { n: k + 1, text: textLine, kind: "other" };
		lines.push(entry);
		if (!body) { return; }
		const m = /^([A-Za-z-]+)\s*:\s*(.*)$/.exec(body);
		if (!m) { entry.kind = "bad"; return; }
		const key = m[1].toLowerCase(), val = m[2].trim();
		if (key === "user-agent") {
			if (!cur || !lastWasAgent) { cur = { agents: [], rules: [], first: k + 1, last: k + 1 }; groups.push(cur); }
			cur.agents.push(val);
			cur.last = k + 1;
			entry.kind = "agent";
			lastWasAgent = true;
			return;
		}
		lastWasAgent = false;
		if (key === "allow" || key === "disallow") {
			entry.kind = key;
			if (!cur) { entry.kind = "orphan"; return; }
			cur.rules.push({ n: k + 1, allow: key === "allow", path: val });
			cur.last = k + 1;
		} else if (key === "sitemap") entry.kind = "sitemap";
		else if (key === "crawl-delay") { entry.kind = "delay"; if (cur) cur.last = k + 1; }
	});
	return { lines: lines, groups: groups };
}

function splitUrls(text) {
	return String(text).split(/[,\n]+/).map(function(s) { return s.trim(); }).filter(Boolean);
}

function pathOf(u) {
	const m = /^[a-z]+:\/\/[^\/]+(\/.*)?$/i.exec(u);
	if (m) return m[1] || "/";
	return u;
}

function escapeRe(s) { return s.replace(/[.+?^{}()|[\]\\]/g, "\\$&"); }

// Length of the match + 1 (0 = no match), mirroring robotparser's applies_to.
function matchLen(rule, path, mode) {
	if (mode === "first") {
		if (rule.path === "") return 1; // robotparser: empty "Disallow:" = Allow everything (matches any path)
		return path.indexOf(rule.path) === 0 ? rule.path.length + 1 : 0;
	}
	if (rule.path === "") return 0; // RFC 9309: an empty rule matches nothing
	let p = rule.path, anchored = false;
	if (p.endsWith("$")) { anchored = true; p = p.slice(0, -1); }
	if (p.indexOf("*") >= 0 || anchored) {
		const re = new RegExp("^" + p.split("*").map(escapeRe).join(".*") + (anchored ? "$" : ""));
		const m = re.exec(path);
		return m ? m[0].length + 1 : 0;
	}
	return path.indexOf(p) === 0 ? p.length + 1 : 0;
}

function productToken(agent) { return String(agent).split("/")[0].trim().toLowerCase(); }

function pickGroup(groups, agent, mode) {
	const tok = productToken(agent);
	let star = null;
	for (const g of groups) {
		for (const a of g.agents) {
			if (a === "*") { if (!star) star = g; continue; }
			const al = a.toLowerCase();
			if (mode === "first" ? tok.indexOf(al) >= 0 : tok === al) return { group: g, by: a };
		}
	}
	return star ? { group: star, by: "*" } : { group: null, by: null };
}

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	const r = parseRobots(config.robots);
	if (r.error) return [r.error];
	const bad = r.lines.filter(function(l) { return l.kind === "bad"; });
	if (bad.length) errors.push("\"robots\" line " + bad[0].n + " (\"" + bad[0].text + "\") is not \"Field: value\"");
	if (!r.groups.length) errors.push("\"robots\" needs at least one \"User-agent:\" line");
	for (const g of r.groups) for (const rule of g.rules) {
		const body = rule.path.replace(/\$$/, "");
		if (body.indexOf("$") >= 0) errors.push("\"robots\" line " + rule.n + ": \"$\" is only allowed at the end of a path");
		if (rule.path && rule.path[0] !== "/" && rule.path[0] !== "*") errors.push("\"robots\" line " + rule.n + ": a rule path must start with / or *");
	}
	const urls = splitUrls(config.urls);
	if (!urls.length) errors.push("\"urls\" needs at least one path such as /index.html");
	if (urls.length > MAX_URLS) errors.push("\"urls\" has " + urls.length + " entries; at most " + MAX_URLS);
	for (const u of urls) if (pathOf(u)[0] !== "/") errors.push("\"urls\": \"" + u + "\" must be a path starting with / or a full http(s):// URL");
	if (!String(config.agent === undefined ? "x" : config.agent).trim()) errors.push("\"agent\" must not be empty");
	return errors;
}

export const code = {
	python: [
		"def can_fetch(groups, agent, path, mode):",
		"    # a group naming the bot beats \"*\"",
		"    rules = groups.get(agent, groups.get(\"*\"))",
		"    if rules is None:",
		"        return True       # no group applies",
		"    hits = [r for r in rules",
		"            if r.matches(path)]",
		"    if not hits:",
		"        return True       # no rule: allowed",
		"    if mode == \"first\":   # old robotparser",
		"        win = hits[0]",
		"    else:                 # RFC 9309",
		"        win = max(hits, key=lambda r:",
		"                  (len(r.path), r.allow))",
		"    return win.allow"
	]
};

export const legend = [
	{ cls: "is-min", label: "Group that applies" },
	{ cls: "is-cmp", label: "Rule line that matches" },
	{ cls: "is-sorted", label: "Winning Allow" },
	{ cls: "is-swap", label: "Winning Disallow" }
];

export const input = {
	key: "urls",
	label: "URLs",
	format: function(config) { return config.urls; },
	parse: function(text) {
		const t = String(text).trim();
		if (!t) return { error: "type paths like /audio/x.mp3, /ads/" };
		for (const u of splitUrls(t)) if (pathOf(u)[0] !== "/") return { error: "\"" + u + "\" must start with /" };
		return { value: t };
	},
	random: function() {
		const pool = ["/", "/index.html", "/audio/", "/audio/podcasts/a.mp3", "/audio/live.html", "/partners/", "/partners/ipad/live-video.json",
			"/ads/banner.gif", "/search/?q=ir", "/video/app.jsx", "/video/app.jsx?v=2", "/2026/10/14/world/index.html", "/tmp/x", "/cgi-bin/run"];
		const out = [];
		while (out.length < 5) { const p = pool[Math.floor(Math.random() * pool.length)]; if (!out.includes(p)) out.push(p); }
		return out.join(", ");
	}
};

export function steps(config) {
	const mode = config.match || "longest";
	const agent = config.agent === undefined ? "MyCrawler" : config.agent;
	const r = parseRobots(config.robots);
	const urls = splitUrls(config.urls);
	const pick = pickGroup(r.groups, agent, mode);
	const g = pick.group;
	const results = [];
	const frames = [];

	function push(f) {
		frames.push({
			group: f.group,
			grp: g ? [g.first, g.last] : null,
			hits: f.hits || [],
			win: f.win === undefined ? null : f.win,
			results: results.slice(),
			current: f.current === undefined ? -1 : f.current,
			code: f.code || [],
			msg: f.msg,
			vars: [
				["agent", agent],
				["group", g ? (pick.by === "*" ? "User-agent: * (lines " + g.first + "–" + g.last + ")" : "User-agent: " + pick.by + " (lines " + g.first + "–" + g.last + ")") : "none"],
				["mode", mode === "longest" ? "longest match (RFC 9309)" : "first match (old robotparser)"],
				["path", f.path || "—"],
				["matching lines", f.hits && f.hits.length ? f.hits.join(", ") : "—"],
				["verdict", f.verdict || "—"]
			]
		});
	}
	const groupMsg = !g
		? "No group names `" + agent + "` and there is no `User-agent: *` group, so nothing restricts this crawler."
		: pick.by === "*"
			? "No group names `" + agent + "`, so the `User-agent: *` group (lines " + g.first + "–" + g.last + ") applies."
			: "Lines " + g.first + "–" + g.last + " name `" + pick.by + "`: only that group's rules apply to `" + agent + "` — the `*` rules are ignored (the precedence rule, L6.5 p21).";
	push({ group: 0, code: g ? [2, 3] : [3, 4, 5], msg: groupMsg });

	urls.forEach(function(u, i) {
		const path = pathOf(u);
		if (!g) {
			results.push({ url: u, ok: true, why: "no group" });
			push({ group: i + 1, current: i, path: path, verdict: "allowed", code: [4, 5], msg: "`" + path + "`: no group applies → allowed." });
			return;
		}
		const hits = [];
		g.rules.forEach(function(rule) { const L = matchLen(rule, path, mode); if (L) hits.push({ rule: rule, len: L }); });
		const hitNs = hits.map(function(h) { return h.rule.n; });
		push({ group: i + 1, current: i, path: path, hits: hitNs, code: [6, 7],
			msg: "`" + path + "`: " + (hits.length ? hits.length + " rule line(s) match: " + hits.map(function(h) {
				return "line " + h.rule.n + " `" + (h.rule.allow ? "Allow" : "Disallow") + ": " + h.rule.path + "`";
			}).join(", ") + "." : "no rule line matches.") });
		if (!hits.length) {
			results.push({ url: u, ok: true, why: "no rule matches" });
			push({ group: i + 1, current: i, path: path, verdict: "allowed", code: [8, 9], msg: "No rule matches `" + path + "` → allowed (anything not disallowed may be crawled)." });
			return;
		}
		let win;
		if (mode === "first") win = hits[0];
		else {
			win = hits[0];
			hits.forEach(function(h) { if (h.len > win.len || (h.len === win.len && h.rule.allow && !win.rule.allow)) win = h; });
		}
		let ok = win.rule.allow;
		let note = "";
		if (mode === "first" && win.rule.path === "") { ok = true; note = " (an empty `Disallow:` means allow everything)"; }
		const why = mode === "first"
			? "the first matching line in file order wins"
			: (hits.length > 1 ? "the longest matching path wins" + (hits.some(function(h) { return h !== win && h.len === win.len; }) ? " (tie → Allow)" : "") : "it is the only match");
		results.push({ url: u, ok: ok, why: "line " + win.rule.n });
		push({ group: i + 1, current: i, path: path, hits: hitNs, win: win.rule.n, verdict: ok ? "allowed" : "disallowed", code: mode === "first" ? [10, 11, 15] : [12, 13, 14, 15],
			msg: "Line " + win.rule.n + " wins because " + why + note + " → `" + path + "` is " + (ok ? "ALLOWED" : "DISALLOWED") + "." });
	});
	const nOk = results.filter(function(x) { return x.ok; }).length;
	push({ group: urls.length + 1, code: [], msg: "Done: " + nOk + " of " + results.length + " URL(s) allowed for `" + agent + "`. robots.txt works on an honor basis — it is not a security mechanism (L7 p19)." });
	frames.forEach(function(f) { f.lines = f.code; f.rlines = r.lines; f.urlList = urls; delete f.code; });
	return frames;
}

const STYLE = `
.vz-rt { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 0.7rem; align-items: start; }
@media (max-width: 640px) { .vz-rt { grid-template-columns: minmax(0, 1fr); } }
.vz-rt-file { border: 1px solid var(--vz-border); border-radius: 0.6rem; background: var(--vz-surface); padding: 0.35rem 0; font: 0.76rem/1.45 "Consolas", "Menlo", monospace; overflow-x: auto; }
.vz-rt-line { display: flex; gap: 0.6rem; padding: 0 0.55rem; border-left: 3px solid transparent; white-space: pre; }
.vz-rt-n { color: var(--vz-muted); min-width: 1.4rem; text-align: right; user-select: none; }
.vz-rt-line.is-min { background: var(--vz-min-bg); }
.vz-rt-line.is-dim { opacity: 0.45; }
.vz-rt-line.is-cmp { border-left-color: var(--vz-cmp-bd); background: var(--vz-cmp-bg); }
.vz-rt-line.is-sorted { border-left-color: var(--vz-sorted-bd); background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); font-weight: 600; }
.vz-rt-line.is-swap { border-left-color: var(--vz-swap-bd); background: var(--vz-swap-bg); color: var(--vz-swap-fg); font-weight: 600; }
.vz-rt-urls { display: flex; flex-direction: column; gap: 0.3rem; font: 0.78rem/1.3 "Consolas", "Menlo", monospace; }
.vz-rt-url { display: flex; justify-content: space-between; gap: 0.5rem; padding: 0.3rem 0.5rem; border: 1px dashed var(--vz-border); border-radius: 0.45rem; color: var(--vz-muted); }
.vz-rt-url > span:first-child { overflow-wrap: anywhere; min-width: 0; }
.vz-rt-url.is-cur { border: 1.5px solid var(--vz-cmp-bd); color: var(--vz-ink); }
.vz-rt-url.is-ok { border: 1px solid var(--vz-sorted-bd); background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); }
.vz-rt-url.is-no { border: 1px solid var(--vz-swap-bd); background: var(--vz-swap-bg); color: var(--vz-swap-fg); }
.vz-rt-v { white-space: nowrap; font-weight: 600; }
`;

function ensureStyle() {
	if (document.getElementById("viz-robots-txt-style")) return;
	const s = document.createElement("style");
	s.id = "viz-robots-txt-style";
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
	let html = '<div class="vz-rt"><div class="vz-rt-file">';
	frame.rlines.forEach(function(l) {
		const c = ["vz-rt-line"];
		const inGroup = frame.grp && l.n >= frame.grp[0] && l.n <= frame.grp[1];
		if (frame.win === l.n) {
			const allowWin = l.kind === "allow" || /^\s*disallow\s*:\s*$/i.test(l.text);
			c.push(allowWin ? "is-sorted" : "is-swap");
		} else if (frame.hits.includes(l.n)) c.push("is-cmp");
		else if (inGroup && l.kind === "agent") c.push("is-min");
		else if (frame.grp && (l.kind === "allow" || l.kind === "disallow") && !inGroup) c.push("is-dim");
		html += '<div class="' + c.join(" ") + '"><span class="vz-rt-n">' + l.n + "</span><span>" + esc(l.text) + "</span></div>";
	});
	html += '</div><div class="vz-rt-urls">';
	frame.urlList.forEach(function(u, i) {
		const res = frame.results[i];
		const c = ["vz-rt-url"];
		if (res) c.push(res.ok ? "is-ok" : "is-no");
		else if (i === frame.current) c.push("is-cur");
		html += '<div class="' + c.join(" ") + '"><span>' + esc(u) + '</span><span class="vz-rt-v">' + (res ? (res.ok ? "✓ allowed" : "✗ disallowed") : (i === frame.current ? "checking…" : "")) + "</span></div>";
	});
	stage.innerHTML = html + "</div></div>";
}
