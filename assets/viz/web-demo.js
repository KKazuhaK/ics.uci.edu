// Live HTML / CSS / JavaScript demo: the source in tabs, the page rendered in a
// sandboxed iframe, and a console showing console.log output, alerts and errors.
// Optional steps apply edits one at a time (CSS rules and JS are cumulative,
// HTML replaces) and can change the simulated viewport width, so a media query
// or a DOM edit can be stepped through like any other demo.
//
// DOM-free at import time: validate() and steps() run under node in check_md.
import { checkParams } from "./_core.js";

// Libraries a demo may load (pinned versions, CDN). Add here when a lecture needs one.
const LIBS = {
	"bootstrap": {
		css: ["https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"],
		js: ["https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"]
	},
	"mathjs": { css: [], js: ["https://cdn.jsdelivr.net/npm/mathjs@13.2.0/lib/browser/math.js"] },
	"moment": { css: [], js: ["https://cdn.jsdelivr.net/npm/moment@2.30.1/moment.min.js"] },
	"vega-lite": {
		css: [],
		js: [
			"https://cdn.jsdelivr.net/npm/vega@5.30.0/build/vega.min.js",
			"https://cdn.jsdelivr.net/npm/vega-lite@5.21.0/build/vega-lite.min.js",
			"https://cdn.jsdelivr.net/npm/vega-embed@6.26.0/build/vega-embed.min.js"
		]
	}
};

const MAX_SOURCE = 8000; // characters across html + css + js + all steps
const STEP_KEYS = ["note", "html", "css", "js", "width"];

export const meta = {
	name: "web-demo",
	summary: "Live HTML/CSS/JS: source tabs, rendered page in a sandboxed iframe, console; optional steps and viewport widths.",
	groupLabel: "step",
	msgPosition: "top",
	params: {
		html: { type: "string", required: true, desc: "Body HTML (no <html>/<head>/<body> tags)." },
		css: { type: "string", default: "", desc: "Stylesheet for the page." },
		js: { type: "string", default: "", desc: "Script run at the end of <body> (DOMContentLoaded listeners still fire)." },
		libs: { type: "json-array", default: [], maxLength: 4, desc: "Libraries to load: " + Object.keys(LIBS).join(", ") + "." },
		width: { type: "int", min: 240, max: 1400, desc: "Simulated viewport width in px (default: the demo's own width). Wider pages are scaled down to fit." },
		height: { type: "int", default: 220, min: 60, max: 800, desc: "Height of the rendered page in px (before scaling)." },
		steps: { type: "json-array", default: [], maxLength: 10, desc: "Edits applied one per step: { note, css?, js?, html?, width? }. css/js are appended, html replaces." },
		tab: { type: "enum", values: ["html", "css", "js"], desc: "Source tab to open on (default: the one the current step edits, else the first non-empty)." },
		source: { type: "enum", values: ["tabs", "none"], default: "tabs", desc: "\"none\" hides the source panel (e.g. when the note shows the code right above)." }
	},
	example: {
		title: "Box model",
		html: "<div class=\"box\">content</div>",
		css: ".box { background: #fde68a; border: 4px solid #b45309; }",
		steps: [
			{ note: "Padding adds space inside the border.", css: ".box { padding: 20px; }" },
			{ note: "Margin adds space outside the border.", css: ".box { margin: 24px; }" }
		]
	}
};

export function validate(config) {
	const errors = checkParams(meta.params, config);
	if (errors.length) return errors;
	(config.libs || []).forEach(function(name, k) {
		if (typeof name !== "string" || !LIBS[name]) {
			errors.push("\"libs\"[" + k + "] must be one of " + Object.keys(LIBS).map(function(n) { return JSON.stringify(n); }).join(", "));
		}
	});
	let total = config.html.length + (config.css || "").length + (config.js || "").length;
	(config.steps || []).forEach(function(s, k) {
		const where = "\"steps\"[" + k + "]";
		if (s === null || typeof s !== "object" || Array.isArray(s)) {
			errors.push(where + " must be an object like { \"note\": \"…\", \"css\": \"…\" }");
			return;
		}
		Object.keys(s).forEach(function(key) {
			if (!STEP_KEYS.includes(key)) errors.push(where + ": unknown key \"" + key + "\" (allowed: " + STEP_KEYS.join(", ") + ")");
		});
		if (typeof s.note !== "string" || !s.note.trim()) errors.push(where + ".note is required (one sentence saying what this step changes)");
		if (typeof s.html === "string" && /<\/?(html|head|body)[\s>]/i.test(s.html)) errors.push(where + ".html is body content only: leave out <html>, <head> and <body>");
		["html", "css", "js"].forEach(function(key) {
			if (s[key] !== undefined && typeof s[key] !== "string") errors.push(where + "." + key + " must be a string");
			else if (typeof s[key] === "string") total += s[key].length;
		});
		if (s.width !== undefined && (!Number.isInteger(s.width) || s.width < 240 || s.width > 1400)) {
			errors.push(where + ".width must be an integer between 240 and 1400");
		}
		if (s.html === undefined && s.css === undefined && s.js === undefined && s.width === undefined) {
			errors.push(where + " changes nothing: give it html, css, js or width");
		}
	});
	if (/<\/?(html|head|body)[\s>]/i.test(config.html)) errors.push("\"html\" is the body content only: leave out <html>, <head> and <body>");
	if (total > MAX_SOURCE) errors.push("source too long (" + total + " characters, at most " + MAX_SOURCE + "): trim the demo to the lines the slide is about");
	return errors;
}

// One frame per state of the page. Each frame carries the full source so the
// player can jump to any step. Per tab, `added` lists the 1-based lines this
// step introduced and `removed` where lines were taken out (a line diff
// against the previous frame).
export function steps(config) {
	const frames = [];
	let html = config.html;
	let css = config.css || "";
	let js = config.js || "";
	let width = config.width || null;
	const list = config.steps || [];

	function push(msg, added, removed, group) {
		frames.push({
			html: html, css: css, js: js, width: width,
			added: added, removed: removed, msg: msg, group: group,
			libs: config.libs || [],
			vars: list.length || width ? [
				["viewport", width ? width + "px" : "demo width"],
				["changes applied", list.length ? (group + " of " + list.length) : "—"]
			] : []
		});
	}

	push(list.length
		? "Start: the page as written. Step forward to apply each change (changed lines are marked in the source)."
		: "The page rendered live. Console output, alerts and errors appear in the console below the page.",
		{}, {}, 0);

	list.forEach(function(s, k) {
		const added = {};
		const removed = {};
		const before = { html: html, css: css, js: js };
		if (s.html !== undefined) html = s.html;
		if (s.css !== undefined) css = css ? css + "\n" + s.css : s.css;
		if (s.js !== undefined) js = js ? js + "\n" + s.js : s.js;
		const after = { html: html, css: css, js: js };
		["html", "css", "js"].forEach(function(key) {
			const d = lineDiff(before[key], after[key]);
			if (d.added.length) added[key] = d.added;
			if (d.removed.length) removed[key] = d.removed;
		});
		if (s.width !== undefined) { width = s.width; added.width = true; }
		push(s.note, added, removed, k + 1);
	});
	return frames;
}

// Longest-common-subsequence line diff. `added`: 1-based line numbers of
// `next` not in the LCS. `removed`: { at, lines } runs of `prev` lines that
// were dropped just before line `at` of `next` (at = length + 1: at the end).
function lineDiff(prev, next) {
	const out = { added: [], removed: [] };
	if (prev === next) return out;
	const a = prev ? prev.split("\n") : [];
	const b = next ? next.split("\n") : [];
	const n = a.length, m = b.length;
	const t = [];
	for (let i = 0; i <= n; i++) t.push(new Uint16Array(m + 1));
	for (let i = n - 1; i >= 0; i--) {
		for (let j = m - 1; j >= 0; j--) {
			t[i][j] = a[i] === b[j] ? t[i + 1][j + 1] + 1 : Math.max(t[i + 1][j], t[i][j + 1]);
		}
	}
	let i = 0, j = 0;
	while (i < n || j < m) {
		if (i < n && j < m && a[i] === b[j]) { i++; j++; }
		else if (i < n && (j >= m || t[i + 1][j] >= t[i][j + 1])) {
			const last = out.removed[out.removed.length - 1];
			if (last && last.at === j + 1) last.lines.push(a[i]);
			else out.removed.push({ at: j + 1, lines: [a[i]] });
			i++;
		}
		else { out.added.push(j + 1); j++; }
	}
	return out;
}

// ---------------------------------------------------------------- browser only

// Same Shiki build and theme as md-viewer's code blocks (VS Code Dark+).
const SHIKI_URL = "https://esm.sh/shiki@3.0.0";
const SHIKI_LANG = { html: "html", css: "css", js: "javascript" };
let highlighter = null;
let highlighterPromise = null;

function loadHighlighter() {
	if (!highlighterPromise) {
		highlighterPromise = import(SHIKI_URL)
			.then(function(m) { return m.createHighlighter({ themes: ["dark-plus"], langs: ["html", "css", "javascript"] }); })
			.then(function(h) { highlighter = h; return h; })
			.catch(function() { return null; });
	}
	return highlighterPromise;
}

// Source split into lines of highlighted HTML (plain escaped text until Shiki loads).
function sourceLines(text, tab) {
	const plain = text.split("\n");
	if (highlighter) {
		try {
			const rows = highlighter.codeToTokens(text, { lang: SHIKI_LANG[tab], theme: "dark-plus" }).tokens;
			if (rows.length === plain.length) {
				return rows.map(function(tokens) {
					return tokens.map(function(t) {
						return '<span style="color:' + t.color + (t.fontStyle & 1 ? ";font-style:italic" : "") + '">' + esc(t.content) + "</span>";
					}).join("");
				});
			}
		} catch (e) { /* fall through to plain text */ }
	}
	return plain.map(esc);
}

// Split layout (code | page) needs this much room; below it the demo stacks.
const SPLIT_MIN = 720;
const LAYOUT_KEY = "viz-web-demo-layout";
const SPLIT_KEY = "viz-web-demo-split";
const RUNNER_KEY = "cr-web-transfer"; // read once by tools/code-runner on ?from=viz
const LINE = 21; // px, code line height (gutter, highlight and textarea must agree)

function stored(key) {
	try { return localStorage.getItem(key); } catch (e) { return null; }
}

function store(key, value) {
	try { localStorage.setItem(key, value); } catch (e) { /* just not remembered */ }
}

// Every web-demo on the page, for layout changes that apply to all of them.
function allDemos() {
	return Array.from(document.querySelectorAll(".vz-wd")).map(function(el) {
		return el.parentElement && el.parentElement._webDemo;
	}).filter(Boolean);
}

const STYLE = `
.vz-wd { display: grid; gap: 0.6rem; }
.vz-wd-bar { display: flex; gap: 0.3rem; flex-wrap: wrap; align-items: center; }
.vz-wd-tabs { display: flex; gap: 0.3rem; }
.vz-wd-tab { padding: 0.2rem 0.7rem; border: 1px solid var(--vz-border); border-radius: 999px; background: var(--vz-surface);
	color: var(--vz-muted); font: 600 0.78rem system-ui, sans-serif; cursor: pointer; }
.vz-wd-tab.is-on { color: var(--vz-blue); border-color: var(--vz-blue); }
.vz-wd-tab.is-changed::after { content: " •"; color: #d97706; }
.vz-wd-tab.is-edited::before { content: "✎ "; }
.vz-wd-spacer { flex: 1; }
.vz-wd-badge { color: var(--vz-muted); font-size: 0.78rem; font-variant-numeric: tabular-nums; }
.vz-wd-bar .viz-btn { padding: 0.25rem 0.65rem; font-size: 0.78rem; }
.vz-wd-body { display: grid; gap: 0.6rem; }
.vz-wd.is-split .vz-wd-body { grid-template-columns: minmax(0, calc(var(--vz-wd-split, 50%) - 7px)) 14px minmax(0, 1fr); gap: 0; align-items: stretch; }
.vz-wd-divider { display: none; }
.vz-wd.is-split .vz-wd-divider { display: block; position: relative; cursor: col-resize; touch-action: none; }
.vz-wd-divider::after { content: ""; position: absolute; top: 50%; left: 50%; width: 4px; height: 2.6rem; margin: -1.3rem 0 0 -2px;
	border-radius: 999px; background: var(--vz-border); transition: background 0.15s; }
.vz-wd-divider:hover::after, .vz-wd-divider.is-dragging::after { background: var(--vz-blue); }
.vz-wd-right { display: grid; gap: 0.6rem; align-content: start; min-width: 0; }
.vz-wd-left { position: relative; min-width: 0; }
.vz-wd-code { display: grid; grid-template-columns: auto minmax(0, 1fr); overflow: auto; max-height: min(30rem, 70vh);
	border: 1px solid var(--vz-border); border-radius: 0.6rem; background: #1e1e1e; color: #d4d4d4;
	font: 13px/${LINE}px "Consolas", "Menlo", "Monaco", monospace; tab-size: 2; }
.vz-wd.is-split .vz-wd-code { position: absolute; inset: 0; max-height: none; }
.vz-wd-code:focus-within { border-color: var(--vz-blue); }
.vz-wd-gutter { position: sticky; left: 0; z-index: 2; padding: 10px 6px 10px 12px; background: #1e1e1e;
	color: #6e7681; text-align: right; user-select: none; }
.vz-wd-gutter .is-added { color: #e2c08d; }
.vz-wd-gutter .has-del, .vz-wd-gutter .has-del-after { color: #f14c4c; cursor: help; }
.vz-wd-edit { position: relative; min-width: max-content; }
.vz-wd-hl { padding: 10px 14px 10px 6px; white-space: pre; min-width: max-content; }
.vz-wd-l { padding-left: 8px; border-left: 3px solid transparent; }
.vz-wd-l.is-added { background: rgba(250, 204, 21, 0.13); border-left-color: #e2b93b; animation: vz-wd-flash 1.4s ease-out; }
.vz-wd-l.has-del, .vz-wd-gutter .has-del { box-shadow: inset 0 2px 0 #f14c4c; }
.vz-wd-l.has-del-after, .vz-wd-gutter .has-del-after { box-shadow: inset 0 -2px 0 #f14c4c; }
@keyframes vz-wd-flash { from { background: rgba(250, 204, 21, 0.4); } }
.vz-wd-edit textarea { position: absolute; inset: 0; width: 100%; height: 100%; box-sizing: border-box; margin: 0;
	padding: 10px 14px 10px 17px; border: 0; outline: 0; resize: none; overflow: hidden; background: transparent;
	color: transparent; caret-color: #aeafad; font: inherit; tab-size: inherit; white-space: pre; }
.vz-wd-edit textarea::selection { background: rgba(38, 79, 120, 0.9); }
.vz-wd-window { overflow: hidden; border: 1px solid var(--vz-border); border-radius: 0.6rem; background: rgba(15, 23, 42, 0.06); }
.vz-wd-chrome { display: flex; align-items: center; gap: 6px; padding: 6px 10px; background: #eceff3; border-bottom: 1px solid rgba(15, 23, 42, 0.1); }
.vz-wd-chrome i { flex: none; width: 9px; height: 9px; border-radius: 50%; background: #ff5f57; }
.vz-wd-chrome i:nth-child(2) { background: #febc2e; }
.vz-wd-chrome i:nth-child(3) { background: #28c840; }
.vz-wd-chrome .vz-wd-badge { flex: 1; min-width: 0; margin-left: 8px; padding: 1px 10px; border-radius: 999px; background: #fff; color: #5f6368;
	font: 11.5px/1.6 system-ui, sans-serif; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
html[data-theme="dark"] .vz-wd-window { background: rgba(255, 255, 255, 0.04); }
html[data-theme="dark"] .vz-wd-chrome { background: #2a2f38; border-bottom-color: rgba(255, 255, 255, 0.08); }
html[data-theme="dark"] .vz-wd-chrome .vz-wd-badge { background: #1b1f26; color: #9aa4b2; }
.vz-wd-frame { position: relative; overflow: hidden; background: #fff; }
.vz-wd-frame iframe { display: block; border: 0; background: #fff; transform-origin: 0 0; }
.vz-wd-frame.is-dragging iframe { pointer-events: none; }
.vz-wd-resize { position: absolute; top: 0; right: 0; bottom: 0; width: 12px; cursor: ew-resize; touch-action: none; z-index: 1; }
.vz-wd-resize::after { content: ""; position: absolute; top: 50%; right: 3px; width: 4px; height: 2.4rem; margin-top: -1.2rem;
	border-radius: 999px; background: rgba(15, 23, 42, 0.25); transition: background 0.15s; }
.vz-wd-resize:hover::after, .vz-wd-frame.is-dragging .vz-wd-resize::after { background: var(--vz-blue); }
.vz-wd-console { margin: 0; min-height: 1.6rem; max-height: 9rem; overflow: auto; padding: 0.45rem 0.75rem; border: 1px solid var(--vz-border);
	border-radius: 0.6rem; background: var(--vz-surface); font: 0.78rem/1.45 "Consolas", "Menlo", monospace; white-space: pre-wrap; }
.vz-wd-console:empty::before { content: "console (empty)"; color: var(--vz-muted); }
.vz-wd-console .is-error { color: #dc2626; }
.vz-wd-console .is-warn { color: #b45309; }
.vz-wd-console .is-info { color: var(--vz-muted); }
.is-expanded .vz-wd-console { max-height: 14rem; }
`;

function ensureStyle() {
	if (document.getElementById("viz-web-demo-style")) return;
	const style = document.createElement("style");
	style.id = "viz-web-demo-style";
	style.textContent = STYLE;
	document.head.appendChild(style);
}

function esc(text) {
	return String(text).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

// Runs inside the iframe before the page's own code: forwards console output,
// alert/confirm/prompt (modals are blocked in the sandbox) and errors to the parent.
// Values are formatted the way Node prints them, holes in arrays included.
function hookScript(token) {
	return "(function(){var T=" + JSON.stringify(token) + ",P=window.parent;" +  // capture now: a page-level `var parent = …` replaces window.parent
		"function f(v,d){d=d||0;if(typeof v==='string')return v;" +
		"if(v===undefined)return 'undefined';if(v===null)return 'null';if(typeof v==='function')return '[Function: '+(v.name||'(anonymous)')+']';" +
		"if(typeof v!=='object')return String(v);if(d>2)return Array.isArray(v)?'[Array]':'[Object]';" +
		"if(v instanceof Element){return '<'+v.tagName.toLowerCase()+(v.id?'#'+v.id:'')+(v.className&&typeof v.className==='string'?'.'+v.className.trim().split(/\\s+/).join('.'):'')+'>';}" +
		"if(typeof NodeList!=='undefined'&&(v instanceof NodeList||v instanceof HTMLCollection)){return (v instanceof NodeList?'NodeList':'HTMLCollection')+'('+v.length+') ['+Array.prototype.map.call(v,function(x){return f(x,d+1)}).join(', ')+']';}" +
		"if(Array.isArray(v)){var o=[],h=0;for(var i=0;i<v.length;i++){if(!(i in v)){h++;continue}if(h){o.push('<'+h+' empty item'+(h>1?'s':'')+'>');h=0}o.push(q(v[i],d))}if(h)o.push('<'+h+' empty item'+(h>1?'s':'')+'>');return o.length?'[ '+o.join(', ')+' ]':'[]';}" +
		"var k=Object.keys(v);if(!k.length)return '{}';return '{ '+k.map(function(n){return (/^[A-Za-z_$][\\w$]*$/.test(n)?n:\"'\"+n+\"'\")+': '+q(v[n],d)}).join(', ')+' }';}" +
		"function q(v,d){return typeof v==='string'?\"'\"+v.replace(/'/g,\"\\\\'\")+\"'\":f(v,d+1)}" +
		"function s(kind,args){try{P.postMessage({__webDemo:T,kind:kind,text:Array.prototype.map.call(args,function(a){return f(a)}).join(' ')},'*')}catch(e){}}" +
		"['log','info','warn','error','debug'].forEach(function(m){console[m]=function(){s(m==='debug'?'log':m,arguments)}});" +
		"window.alert=function(m){s('info',['[alert] '+(m===undefined?'':m)])};" +
		"window.confirm=function(m){s('info',['[confirm] '+(m===undefined?'':m)+' → true']);return true};" +
		"window.prompt=function(m){s('info',['[prompt] '+(m===undefined?'':m)+' → \"\"']);return ''};" +
		"window.addEventListener('error',function(e){var m=String(e.message||'');if(!/^Uncaught/.test(m))m='Uncaught '+(e.error&&e.error.name&&m.indexOf(e.error.name)!==0?e.error.name+': ':'')+m;s('error',[m])});" +
		"document.addEventListener('submit',function(e){if(!e.defaultPrevented){e.preventDefault();s('info',['[form submitted] (not sent: the demo stays on the page)'])}});" +
		"window.addEventListener('unhandledrejection',function(e){s('error',['Uncaught (in promise) '+(e.reason&&e.reason.message||e.reason)])});" +
		"})();";
}

function buildDoc(frame, token, src) {
	return pageDocument(src, token, frame.libs);
}

// The page for { html, css, js } as one document. `html` is body content, or a
// whole document (<!doctype>/<html>/<head>), which keeps its own structure.
// With a `token`, the console/alert/error hook runs first (see hookScript);
// without one the result is a clean standalone file. Also used by Code Runner.
export function pageDocument(src, token, libNames) {
	const libs = (libNames || []).map(function(n) { return LIBS[n]; }).filter(Boolean);
	const css = src.css || "";
	const js = src.js || "";
	const head = (token ? "<script>" + hookScript(token) + "</script>\n" : "") +
		libs.map(function(l) { return l.css.map(function(u) { return "<link rel=\"stylesheet\" href=\"" + u + "\">\n"; }).join(""); }).join("") +
		(css ? "<style>\n" + css.replace(/<\/(style)/gi, "<\\/$1") + "\n</style>\n" : "");
	const tail = libs.map(function(l) { return l.js.map(function(u) { return "<script src=\"" + u + "\"></script>\n"; }).join(""); }).join("") +
		(js ? "<script>\n" + js.replace(/<\/(script)/gi, "<\\/$1") + "\n</script>\n" : "");
	let doc = src.html || "";
	if (/<!doctype|<html[\s>]|<head[\s>]/i.test(doc)) {
		const at = doc.match(/<head(?=[\s>])[^>]*>/i) || doc.match(/<html[^>]*>/i) || doc.match(/<!doctype[^>]*>/i);
		const wrapped = /<head[\s>]/i.test(at[0]) ? head : "<head>\n" + head + "</head>\n";
		doc = doc.slice(0, at.index + at[0].length) + "\n" + wrapped + doc.slice(at.index + at[0].length);
		return /<\/body>/i.test(doc) ? doc.replace(/<\/body>(?![\s\S]*<\/body>)/i, tail + "</body>") : doc + "\n" + tail;
	}
	return "<!doctype html>\n<html>\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
		head + "</head>\n<body>\n" + doc + "\n" + tail + "</body>\n</html>\n";
}



const ICONS = {
	split: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 3v18"/>',
	stack: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 12h18"/>',
	runner: '<path d="m7 11 2-2-2-2"/><path d="M11 13h4"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>',
	copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
	check: '<path d="M20 6 9 17l-5-5"/>'
};

function svg(name) {
	return '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
}

// Drag helper: calls move(dx, dy) while the pointer is down on `el`.
function draggable(el, start, move, end) {
	el.addEventListener("pointerdown", function(e) {
		if (e.button !== 0) return;
		e.preventDefault();
		el.setPointerCapture(e.pointerId);
		const x0 = e.clientX;
		start();
		function onMove(ev) { move(ev.clientX - x0, ev); }
		function onUp() {
			el.removeEventListener("pointermove", onMove);
			el.removeEventListener("pointerup", onUp);
			el.removeEventListener("pointercancel", onUp);
			end();
		}
		el.addEventListener("pointermove", onMove);
		el.addEventListener("pointerup", onUp);
		el.addEventListener("pointercancel", onUp);
	});
}

export function render(stage, frame, config) {
	ensureStyle();
	let st = stage._webDemo;
	if (!st) st = setup(stage, config);

	st.config = config;
	if (frame !== st.frame) st.userWidth = null; // a step sets its own viewport
	st.frame = frame;
	st.edited = st.edits.get(frame) || null;
	if (!st.tab || changedTab(frame)) {
		st.tab = changedTab(frame) || (st.tab || config.tab || ["html", "css", "js"].find(function(k) { return frame[k]; }) || "html");
	}
	if (st.tab !== "html" && !frame[st.tab] && !(st.edits.get(frame) || {})[st.tab]) st.tab = "html"; // that tab isn't shown in this step
	applyLayout(st);
	paintSource(st, frame);
	load(st, current(st), false);
	fit(st, config);
	follow(st);
}

// The block was moved (expanded into the modal or back): its iframe reloads.
export function moved(stage, config) {
	const st = stage._webDemo;
	if (!st) return;
	st.cons.textContent = "";
	applyLayout(st);
	fit(st, config);
}

function changedTab(frame) {
	return ["html", "css", "js"].find(function(k) {
		return (frame.added && frame.added[k]) || (frame.removed && frame.removed[k]);
	});
}

function current(st) {
	return st.edited ? Object.assign({}, st.frame, st.edited) : st.frame;
}

function setup(stage, config) {
	stage.textContent = "";
	const st = stage._webDemo = {
		token: "wd" + Math.random().toString(36).slice(2), stage: stage, tab: null, docKey: null,
		edited: null, edits: new WeakMap(), codeHeight: 0, userWidth: null, near: false, pending: null
	};
	const showSource = config.source !== "none";
	const editable = showSource && !!config.interactive;
	const root = document.createElement("div");
	root.className = "vz-wd";
	root.innerHTML =
		'<div class="vz-wd-bar">' +
			(showSource ? '<span class="vz-wd-tabs"></span>' : "") +
			'<span class="vz-wd-spacer"></span>' +
			(editable ? '<button type="button" class="viz-btn" data-wd="run" title="Run the edited code (Ctrl/⌘ + Enter)">Run edited code</button>' +
				'<button type="button" class="viz-btn" data-wd="revert" title="Back to this step\'s code">Revert</button>' : "") +
			(showSource ? '<button type="button" class="viz-btn" data-wd="copy" title="Copy this tab\'s code">' + svg("copy") + "<span>Copy</span></button>" : "") +
			'<button type="button" class="viz-btn" data-wd="runner" title="Open this code in Code Runner (new tab)">' + svg("runner") + "<span>Code Runner</span></button>" +
			(showSource ? '<button type="button" class="viz-btn" data-wd="layout"></button>' : "") +
		"</div>" +
		'<div class="vz-wd-body">' +
			(showSource ?
				'<div class="vz-wd-left"><div class="vz-wd-code">' +
					'<div class="vz-wd-gutter"></div>' +
					'<div class="vz-wd-edit"><div class="vz-wd-hl"' + (editable ? ' aria-hidden="true"' : "") + "></div>" +
					(editable ? '<textarea spellcheck="false" autocomplete="off" autocapitalize="off" autocorrect="off" wrap="off" aria-label="Source (editable)"></textarea>' : "") +
				"</div></div></div>" +
				'<div class="vz-wd-divider" role="separator" aria-orientation="vertical" title="Drag to resize · double-click to reset"></div>' : "") +
			'<div class="vz-wd-right">' +
				'<div class="vz-wd-window">' +
					'<div class="vz-wd-chrome" aria-hidden="true"><i></i><i></i><i></i><span class="vz-wd-badge"></span></div>' +
					'<div class="vz-wd-frame"><iframe sandbox="allow-scripts allow-forms" title="Live result"></iframe>' +
						'<div class="vz-wd-resize" title="Drag to change the viewport width · double-click to reset"></div></div>' +
				"</div>" +
				'<pre class="vz-wd-console" aria-live="polite"></pre>' +
			"</div>" +
		"</div>";
	stage.appendChild(root);
	const q = function(sel) { return root.querySelector(sel); };
	Object.assign(st, {
		root: root, iframe: q("iframe"), box: q(".vz-wd-frame"), cons: q(".vz-wd-console"), tabs: q(".vz-wd-tabs"),
		badge: q(".vz-wd-badge"), left: q(".vz-wd-left"), code: q(".vz-wd-code"), gutter: q(".vz-wd-gutter"),
		hl: q(".vz-wd-hl"), ta: q("textarea"), layoutBtn: q('[data-wd="layout"]'), revertBtn: q('[data-wd="revert"]')
	});
	const split = stored(SPLIT_KEY);
	if (split) root.style.setProperty("--vz-wd-split", split + "%");

	window.addEventListener("message", function(e) {
		const d = e.data;
		if (!d || d.__webDemo !== st.token || e.source !== st.iframe.contentWindow) return;
		const line = document.createElement("div");
		if (d.kind !== "log") line.className = "is-" + d.kind;
		line.textContent = d.text;
		st.cons.appendChild(line);
		st.cons.scrollTop = st.cons.scrollHeight;
	});

	if (st.tabs) st.tabs.addEventListener("click", function(e) {
		const b = e.target.closest("[data-tab]");
		if (!b) return;
		st.tab = b.dataset.tab;
		paintSource(st, st.frame);
		follow(st);
	});

	root.addEventListener("click", function(e) {
		const b = e.target.closest("[data-wd]");
		if (!b) return;
		e.stopPropagation();
		const act = b.dataset.wd;
		if (act === "run") load(st, current(st), true);
		else if (act === "revert") {
			st.edits.delete(st.frame);
			st.edited = null;
			paintSource(st, st.frame);
			load(st, st.frame, true);
		} else if (act === "copy") {
			const done = function() {
				b.innerHTML = svg("check") + "<span>Copied</span>";
				setTimeout(function() { b.innerHTML = svg("copy") + "<span>Copy</span>"; }, 1200);
			};
			if (navigator.clipboard) navigator.clipboard.writeText(st.text).then(done, function() {});
		} else if (act === "runner") {
			const src = current(st);
			store(RUNNER_KEY, JSON.stringify({ html: src.html, css: src.css, js: src.js, libs: st.frame.libs }));
			window.open(new URL("../../tools/code-runner/?from=viz", import.meta.url).href, "_blank", "noopener");
		} else if (act === "layout") {
			store(LAYOUT_KEY, st.root.classList.contains("is-split") ? "stack" : "split");
			allDemos().forEach(function(o) { applyLayout(o); fit(o, o.config); });
		}
	});

	if (st.ta) {
		st.ta.addEventListener("input", function() {
			st.edited = st.edited || { html: st.frame.html, css: st.frame.css, js: st.frame.js };
			st.edited[st.tab] = st.ta.value;
			st.edits.set(st.frame, st.edited);
			st.text = st.ta.value;
			paintTabs(st, st.frame);
			paintCode(st);
		});
		st.ta.addEventListener("keydown", function(e) {
			if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
				e.preventDefault();
				load(st, current(st), true);
			}
		});
	}

	// Split divider: drag to share the width between code and page.
	const divider = q(".vz-wd-divider");
	if (divider) {
		let rect = null;
		draggable(divider, function() {
			rect = root.querySelector(".vz-wd-body").getBoundingClientRect();
			divider.classList.add("is-dragging");
			st.box.classList.add("is-dragging");
		}, function(dx, ev) {
			const pct = Math.max(25, Math.min(75, (ev.clientX - rect.left) / rect.width * 100));
			root.style.setProperty("--vz-wd-split", pct.toFixed(1) + "%");
			fit(st, st.config);
		}, function() {
			divider.classList.remove("is-dragging");
			st.box.classList.remove("is-dragging");
			const pct = root.style.getPropertyValue("--vz-wd-split").replace("%", "");
			if (!pct) return; // clicked without dragging
			store(SPLIT_KEY, pct);
			allDemos().forEach(function(o) { o.root.style.setProperty("--vz-wd-split", pct + "%"); fit(o, o.config); });
		});
		divider.addEventListener("dblclick", function() {
			store(SPLIT_KEY, "50");
			allDemos().forEach(function(o) { o.root.style.setProperty("--vz-wd-split", "50%"); fit(o, o.config); });
		});
	}

	// Right-edge handle: drag to change the simulated viewport width (media queries react live).
	const handle = q(".vz-wd-resize");
	let w0 = 0, scale0 = 1;
	draggable(handle, function() {
		w0 = st.simWidth;
		scale0 = st.scale;
		st.box.classList.add("is-dragging");
	}, function(dx) {
		st.userWidth = Math.round(Math.max(240, Math.min(1400, w0 + dx / scale0)));
		fit(st, st.config);
	}, function() {
		st.box.classList.remove("is-dragging");
	});
	handle.addEventListener("dblclick", function() {
		st.userWidth = null;
		fit(st, st.config);
	});

	// Build the page only when the demo is about to scroll into view.
	if (typeof IntersectionObserver !== "undefined") {
		const io = new IntersectionObserver(function(entries) {
			if (!entries.some(function(en) { return en.isIntersecting; })) return;
			io.disconnect();
			st.near = true;
			if (st.pending !== null) { st.iframe.srcdoc = st.pending; st.pending = null; }
		}, { rootMargin: "600px 0px" });
		io.observe(root);
	} else st.near = true;

	if (st.hl) loadHighlighter().then(function(h) { if (h) paintCode(st); });
	if (typeof ResizeObserver !== "undefined") {
		new ResizeObserver(function() { applyLayout(st); fit(st, st.config); }).observe(stage);
	}
	return st;
}

function expanded(st) {
	return !!st.stage.closest(".is-expanded");
}

// Side by side when the demo is wide enough: always in the expanded view,
// otherwise unless the reader chose stacked.
function applyLayout(st) {
	if (!st.code) return;
	const wide = st.stage.clientWidth >= SPLIT_MIN;
	const split = wide && (expanded(st) || stored(LAYOUT_KEY) !== "stack");
	st.root.classList.toggle("is-split", split);
	st.left.style.minHeight = split ? st.codeHeight + "px" : "";
	st.layoutBtn.hidden = !wide || expanded(st);
	st.layoutBtn.title = split ? "Show the code above the page" : "Show the code beside the page";
	st.layoutBtn.innerHTML = svg(split ? "stack" : "split") + "<span>" + (split ? "Stacked" : "Side by side") + "</span>";
}

function paintTabs(st, frame) {
	if (!st.tabs) return;
	st.tabs.innerHTML = ["html", "css", "js"].filter(function(k) { return frame[k] || k === "html"; }).map(function(k) {
		const changed = (frame.added && frame.added[k]) || (frame.removed && frame.removed[k]);
		const edited = st.edited && st.edited[k] !== frame[k];
		return '<button type="button" class="vz-wd-tab' + (k === st.tab ? " is-on" : "") + (changed ? " is-changed" : "") +
			(edited ? " is-edited" : "") + '" data-tab="' + k + '"' + (edited ? ' title="Edited (Revert to undo)"' : "") + ">" +
			k.toUpperCase() + "</button>";
	}).join("");
	if (st.revertBtn) st.revertBtn.disabled = !st.edited;
}

function paintSource(st, frame) {
	paintTabs(st, frame);
	if (!st.hl) return;
	st.text = (st.edited || frame)[st.tab] || "";
	if (st.ta) st.ta.value = st.text;
	paintCode(st);
}

// Line numbers + highlighted lines. Lines this step added get a gold bar; a red
// rule marks where lines were removed (hover the line number to see them).
// Edited code shows no marks: they describe the step, not the edit.
function paintCode(st) {
	if (!st.hl) return;
	const added = new Set(st.edited ? [] : (st.frame.added && st.frame.added[st.tab]) || []);
	const removed = new Map();
	if (!st.edited) ((st.frame.removed && st.frame.removed[st.tab]) || []).forEach(function(r) { removed.set(r.at, r.lines); });
	const rows = sourceLines(st.text, st.tab);
	const delClass = function(k) {
		return removed.has(k + 1) ? " has-del" : (k === rows.length - 1 && removed.has(rows.length + 1) ? " has-del-after" : "");
	};
	st.gutter.innerHTML = rows.map(function(_, k) {
		const gone = removed.get(k + 1) || (k === rows.length - 1 && removed.get(rows.length + 1));
		return '<div class="' + (added.has(k + 1) ? "is-added" : "") + delClass(k) + '"' +
			(gone ? ' title="' + esc(gone.length + " line" + (gone.length > 1 ? "s" : "") + " removed here:\n" + gone.join("\n")) + '"' : "") +
			">" + (k + 1) + "</div>";
	}).join("");
	st.hl.innerHTML = rows.map(function(line, k) {
		return '<div class="vz-wd-l' + (added.has(k + 1) ? " is-added" : "") + delClass(k) + '">' + (line || " ") + "</div>";
	}).join("");
	st.marks = Array.from(added).concat(Array.from(removed.keys()).map(function(at) { return Math.min(at, rows.length); }))
		.sort(function(a, b) { return a - b; });
	// In the split layout the code column is at least as tall as its content (capped), or the page beside it.
	st.codeHeight = Math.min(rows.length * LINE + 22, 480);
	if (st.root.classList.contains("is-split")) st.left.style.minHeight = st.codeHeight + "px";
}

// Scroll the code panel (not the page) so this step's changes are in view.
function follow(st) {
	if (!st.hl || !st.marks || !st.marks.length) return;
	const first = st.hl.children[st.marks[0] - 1];
	const last = st.hl.children[st.marks[st.marks.length - 1] - 1];
	if (!first || !last) return;
	const box = st.code.getBoundingClientRect();
	const top = first.getBoundingClientRect().top;
	const bottom = last.getBoundingClientRect().bottom;
	st.code.scrollLeft = 0;
	if (top >= box.top && bottom <= box.bottom) return;
	st.code.scrollTop += top - box.top - 2 * LINE;
}

function load(st, src, force) {
	const key = JSON.stringify([src.html, src.css, src.js]);
	if (!force && key === st.docKey) return;
	st.docKey = key;
	st.cons.textContent = "";
	st.token = "wd" + Math.random().toString(36).slice(2);
	const doc = buildDoc(st.frame, st.token, src);
	if (st.near) st.iframe.srcdoc = doc;
	else st.pending = doc;
}

// Size the iframe to the simulated viewport and scale it down if it's wider than its column.
// The expanded view gives the page more height.
function fit(st, config) {
	const avail = st.box.parentElement.clientWidth || 600;
	const w = st.userWidth || st.frame.width || avail;
	const h = expanded(st) ? Math.max(config.height, Math.round(window.innerHeight * 0.55)) : config.height;
	const scale = Math.min(1, avail / w);
	st.simWidth = w;
	st.scale = scale;
	st.iframe.style.width = w + "px";
	st.iframe.style.height = h + "px";
	st.iframe.style.transform = scale < 1 ? "scale(" + scale + ")" : "";
	st.box.style.height = Math.ceil(h * scale) + "px";
	st.box.style.width = scale < 1 ? "" : (st.userWidth || st.frame.width ? w + "px" : "");
	st.badge.textContent = "viewport " + w + "px" + (scale < 1 ? " · shown at " + Math.round(scale * 100) + "%" : "") +
		(st.userWidth ? " · resized" : "");
}
