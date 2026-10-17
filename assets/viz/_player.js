// Shared player for viz components: toolbar (prev / next / play / end of
// group / reset / speed), stage, legend, message, code panel with the
// running line highlighted, variable watch, and the optional input bar.
// A component only supplies steps(config) + render(stage, frame); see
// selection-sort.js for the full contract and viz/README.md for the list.
import { withDefaults } from "./_core.js";

const ICONS = {
	prev: '<path d="m15 18-6-6 6-6"/>',
	next: '<path d="m9 18 6-6-6-6"/>',
	play: '<polygon points="6 3 20 12 6 21 6 3"/>',
	pause: '<rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/>',
	skip: '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" x2="19" y1="5" y2="19"/>',
	reset: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
	expand: '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
	collapse: '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>',
	shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-7.6a4 4 0 0 1 3.3-1.7H22"/><path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"/><path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"/>'
};

function icon(name) {
	return '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + "</svg>";
}

// Delay between steps for speed 1 (slow) … 5 (fast).
const SPEED_MS = [1500, 1050, 700, 420, 220];

function escapeHtml(text) {
	return String(text).replace(/[&<>"']/g, function(ch) {
		return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
	});
}

// Messages may use `backticks` for code; everything else is plain text.
function formatMessage(text) {
	return escapeHtml(text).replace(/`([^`]+)`/g, "<code>$1</code>");
}

// Minimal C++ tokenizer, VS Code Dark+ colours (matches Shiki dark-plus in the notes).
const CPP_CONTROL = new Set("for while do if else return break continue switch case default new delete throw try catch".split(" "));
const CPP_KEYWORD = new Set("int void bool char double float long short unsigned signed auto const constexpr static struct class template typename public private protected virtual override nullptr true false this size_t using namespace std".split(" "));

function highlightCpp(line) {
	const re = /(\/\/.*$)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z_\d])/g;
	let out = "";
	let m;
	while ((m = re.exec(line))) {
		const [tok, comment, str, num, ident, space] = m;
		if (comment) out += '<span style="color:#6a9955">' + escapeHtml(tok) + "</span>";
		else if (str) out += '<span style="color:#ce9178">' + escapeHtml(tok) + "</span>";
		else if (num) out += '<span style="color:#b5cea8">' + tok + "</span>";
		else if (ident) {
			const rest = line.slice(re.lastIndex);
			let color = "#9cdcfe";
			if (CPP_CONTROL.has(tok)) color = "#c586c0";
			else if (CPP_KEYWORD.has(tok)) color = "#569cd6";
			else if (/^\s*\(/.test(rest)) color = "#dcdcaa";
			out += '<span style="color:' + color + '">' + tok + "</span>";
		} else if (space) out += tok;
		else out += escapeHtml(tok);
	}
	return out;
}

const STYLE = `
.viz-block {
	--vz-ink: var(--notes-ink, #1f2937);
	--vz-muted: var(--notes-muted, #6b7280);
	--vz-border: var(--notes-border, rgba(15, 23, 42, 0.12));
	--vz-blue: var(--notes-blue, #2563eb);
	--vz-surface: #ffffff;
	--vz-soft: rgba(36, 79, 143, 0.05);
	--vz-btn-hover: rgba(36, 79, 143, 0.08);
	--vz-sorted-bg: #dcf3e1; --vz-sorted-fg: #1d6b30; --vz-sorted-bd: #a6dcb2;
	--vz-min-bg: #fbe5b8;    --vz-min-fg: #7a4a00;    --vz-min-bd: #efc673;
	--vz-cmp-bd: #3b82f6;    --vz-cmp-bg: #eef5ff;
	--vz-swap-bg: #ece2fd;   --vz-swap-fg: #4c1d95;   --vz-swap-bd: #bba0f2;
	margin: 1.25rem 0;
	padding: 1rem 1.1rem 1.1rem;
	border: 1px solid var(--vz-border);
	border-radius: 1rem;
	background: var(--vz-soft);
	color: var(--vz-ink);
	font-size: 0.95rem;
}
html[data-theme="dark"] .viz-block {
	--vz-surface: rgba(255, 255, 255, 0.04);
	--vz-soft: rgba(255, 255, 255, 0.025);
	--vz-btn-hover: rgba(255, 255, 255, 0.08);
	--vz-sorted-bg: rgba(74, 200, 115, 0.18); --vz-sorted-fg: #8fe0a5; --vz-sorted-bd: rgba(74, 200, 115, 0.42);
	--vz-min-bg: rgba(236, 184, 106, 0.2);    --vz-min-fg: #f3c983;    --vz-min-bd: rgba(236, 184, 106, 0.5);
	--vz-cmp-bd: #6aa3f5;                      --vz-cmp-bg: rgba(106, 163, 245, 0.12);
	--vz-swap-bg: rgba(167, 139, 250, 0.2);   --vz-swap-fg: #cdb9ff;   --vz-swap-bd: rgba(167, 139, 250, 0.5);
}
.viz-block:focus-visible { outline: 2px solid var(--vz-blue); outline-offset: 2px; }
.viz-head { display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.75rem; }
.viz-title { flex: 1; margin: 0; font-weight: 600; font-size: 0.95rem; }
.viz-head .viz-expand { margin-left: auto; padding: 0.3rem 0.45rem; }
.viz-msg.is-top { margin: 0.75rem 0 0; }
html.viz-modal-open { overflow: hidden; }
.viz-modal { width: min(96vw, 1800px); height: 94vh; max-width: none; max-height: none; padding: 0; border: 0;
	border-radius: 1rem; background: var(--card, #fff); color: inherit; overflow: auto; }
.viz-modal::backdrop { background: rgba(8, 12, 20, 0.62); backdrop-filter: blur(2px); }
.viz-modal > .viz-block { margin: 0; min-height: 100%; box-sizing: border-box; border: 0; border-radius: 0; }
.viz-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; }
.viz-block.is-static > .viz-toolbar { display: none; }
.viz-btn {
	display: inline-flex; align-items: center; gap: 0.35rem;
	padding: 0.4rem 0.75rem; border: 1px solid var(--vz-border); border-radius: 999px;
	background: var(--vz-surface); color: var(--vz-ink);
	font: inherit; font-size: 0.85rem; line-height: 1.2; cursor: pointer;
}
.viz-btn:hover:not(:disabled) { background: var(--vz-btn-hover); }
.viz-btn:disabled { opacity: 0.4; cursor: default; }
.viz-btn.is-icon { padding: 0.4rem 0.55rem; }
.viz-spacer { flex: 1; }
.viz-step { color: var(--vz-muted); font-size: 0.82rem; font-variant-numeric: tabular-nums; }
.viz-speed { display: inline-flex; align-items: center; gap: 0.4rem; color: var(--vz-muted); font-size: 0.82rem; }
.viz-speed input { width: 5.5rem; accent-color: var(--vz-blue); }
.viz-stage { margin: 1.1rem 0 0.4rem; }
.viz-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.35rem 1rem; color: var(--vz-muted); font-size: 0.8rem; }
.viz-legend span { display: inline-flex; align-items: center; gap: 0.35rem; }
.viz-legend .vz-swatch { width: 0.8rem; height: 0.8rem; border-radius: 0.2rem; border: 1px solid var(--vz-border); }
.viz-msg {
	margin: 0.85rem 0 0; padding: 0.65rem 0.9rem; min-height: 2.9em;
	border-left: 3px solid var(--vz-blue); border-radius: 0 0.6rem 0.6rem 0;
	background: var(--vz-surface); line-height: 1.55;
}
.viz-msg code { font-size: 0.9em; }
.viz-panels { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 0.75rem; margin-top: 0.75rem; }
.viz-panels.is-single { grid-template-columns: minmax(0, 1fr); }
.viz-code {
	margin: 0; padding: 0.7rem 0; border-radius: 0.75rem; overflow-x: auto;
	background: #1e1e1e; color: #d4d4d4; border: 1px solid rgba(255, 255, 255, 0.08);
	font: 0.84em/1.65 "Consolas", "Cascadia Code", "Fira Code", "Menlo", monospace;
}
.viz-line { display: flex; padding-right: 0.9rem; border-left: 3px solid transparent; white-space: pre; }
.viz-line.is-active { background: rgba(106, 163, 245, 0.22); border-left-color: #6aa3f5; }
.viz-ln { flex: none; width: 2.2rem; padding-right: 0.7rem; text-align: right; color: #6e7681; user-select: none; }
.viz-vars {
	display: grid; grid-template-columns: auto 1fr; align-content: start; gap: 0.3rem 0.9rem;
	padding: 0.7rem 0.9rem; border: 1px solid var(--vz-border); border-radius: 0.75rem; background: var(--vz-surface);
	font: 0.84em/1.5 "Consolas", "Cascadia Code", "Fira Code", "Menlo", monospace;
}
.viz-vars .vz-name { color: var(--vz-muted); }
.viz-vars .vz-val { font-variant-numeric: tabular-nums; }
.viz-vars .vz-val.is-changed { color: var(--vz-blue); font-weight: 600; }
.viz-input { display: flex; flex-wrap: wrap; align-items: center; gap: 0.4rem; margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px dashed var(--vz-border); }
.viz-input label { color: var(--vz-muted); font-size: 0.85rem; }
.viz-input input {
	flex: 1 1 12rem; min-width: 0; padding: 0.4rem 0.7rem; border: 1px solid var(--vz-border); border-radius: 999px;
	background: var(--vz-surface); color: var(--vz-ink); font: 0.85rem "Consolas", "Menlo", monospace;
}
.viz-input-err { flex-basis: 100%; color: #c2410c; font-size: 0.82rem; }
.viz-input-err:empty { display: none; }

/* Array cells, shared by array-based components. */
.vz-row { display: flex; justify-content: center; gap: 0.45rem; }
.vz-col { flex: 0 1 3.6rem; min-width: 0; display: flex; flex-direction: column; align-items: center; }
.vz-cell {
	width: 100%; aspect-ratio: 1 / 1.05; display: grid; place-items: center;
	border: 1.5px solid var(--vz-border); border-radius: 0.6rem; background: var(--vz-surface);
	font-size: 1.15rem; font-weight: 600; font-variant-numeric: tabular-nums;
	transition: background-color 0.25s, border-color 0.25s, color 0.25s, box-shadow 0.25s;
}
.vz-cell.is-sorted { background: var(--vz-sorted-bg); color: var(--vz-sorted-fg); border-color: var(--vz-sorted-bd); }
.vz-cell.is-min { background: var(--vz-min-bg); color: var(--vz-min-fg); border-color: var(--vz-min-bd); }
.vz-cell.is-swap { background: var(--vz-swap-bg); color: var(--vz-swap-fg); border-color: var(--vz-swap-bd); }
.vz-cell.is-cmp { border-color: var(--vz-cmp-bd); box-shadow: 0 0 0 2px var(--vz-cmp-bd); }
.vz-cell.is-cmp:not(.is-min):not(.is-sorted):not(.is-swap) { background: var(--vz-cmp-bg); }
.viz-legend .vz-swatch.is-sorted { background: var(--vz-sorted-bg); border-color: var(--vz-sorted-bd); }
.viz-legend .vz-swatch.is-min { background: var(--vz-min-bg); border-color: var(--vz-min-bd); }
.viz-legend .vz-swatch.is-swap { background: var(--vz-swap-bg); border-color: var(--vz-swap-bd); }
.viz-legend .vz-swatch.is-cmp { background: var(--vz-cmp-bg); border: 2px solid var(--vz-cmp-bd); }
.vz-idx { margin-top: 0.3rem; color: var(--vz-muted); font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.vz-ptrs { min-height: 2.5em; display: flex; flex-direction: column; align-items: center; font: 0.78rem/1.25 "Consolas", "Menlo", monospace; }
.vz-ptr { color: var(--vz-ink); white-space: nowrap; }
.vz-ptr.is-min { color: var(--vz-min-fg); }
.vz-ptr.is-cmp { color: var(--vz-blue); }

.viz-block.viz-error { border-color: var(--notes-error-border, #f3b5b5); background: var(--notes-error-bg, #fff1f1); }
.viz-error-msg { color: var(--notes-error-text, #8b1e1e); font-size: 0.88rem; line-height: 1.5; }
.viz-error-msg ul { margin: 0.35rem 0 0.6rem; padding-left: 1.2rem; }
.viz-error pre { margin: 0; }

@media (max-width: 736px) {
	.viz-block { padding: 0.85rem 0.75rem 0.9rem; }
	.viz-panels { grid-template-columns: minmax(0, 1fr); }
	.viz-btn .vz-label-long { display: none; }
	.vz-row { gap: 0.25rem; }
	.vz-cell { font-size: 0.95rem; border-radius: 0.45rem; }
	.vz-ptrs { font-size: 0.68rem; }
}
@media (prefers-reduced-motion: reduce) {
	.vz-cell { transition: none; }
}
`;

function ensureStyle() {
	if (document.getElementById("viz-player-style")) return;
	const style = document.createElement("style");
	style.id = "viz-player-style";
	style.textContent = STYLE;
	document.head.appendChild(style);
}

// Replace `wrapper`'s contents with a red error box listing what's wrong.
export function renderError(wrapper, messages, source) {
	ensureStyle();
	wrapper.className = "viz-block viz-error";
	wrapper.innerHTML =
		'<div class="viz-error-msg"><strong>viz block could not be shown</strong><ul>' +
		messages.map(function(m) { return "<li>" + escapeHtml(m) + "</li>"; }).join("") +
		"</ul></div><pre><code>" + escapeHtml(source) + "</code></pre>";
}

// Build the demo for component module `mod` inside `wrapper`.
export function mount(wrapper, mod, rawConfig, source) {
	ensureStyle();
	const errors = mod.validate(rawConfig);
	if (errors.length) {
		renderError(wrapper, errors, source);
		return;
	}

	let config = withDefaults(mod.meta.params, rawConfig);
	let frames = mod.steps(config);
	let idx = Math.min(config.start, frames.length) - 1;
	let timer = null;
	let speed = 3;
	const groupLabel = mod.meta.groupLabel || "group";
	const codeLines = (config.code && config.code !== "none" && mod.code && mod.code[config.code]) || null;

	wrapper.className = "viz-block";
	wrapper.tabIndex = 0;
	wrapper.setAttribute("role", "group");
	wrapper.setAttribute("aria-label", (config.title || mod.meta.name) + " — interactive demo; use the arrow keys to step");

	// Components whose stage is tall (web-demo) keep the step note next to the controls.
	const msgTop = mod.meta.msgPosition === "top";
	const hasGroups = frames.some(function(f) { return f.group !== undefined; });
	const hasVars = frames.some(function(f) { return f.vars && f.vars.length; });

	wrapper.innerHTML =
		'<div class="viz-head">' + (config.title ? '<div class="viz-title">' + escapeHtml(config.title) + "</div>" : "") +
			'<button type="button" class="viz-btn is-icon viz-expand" data-act="expand" title="Expand" aria-label="Expand">' + icon("expand") + "</button>" +
		"</div>" +
		'<div class="viz-toolbar">' +
			'<button type="button" class="viz-btn" data-act="prev">' + icon("prev") + '<span class="vz-label-long">Prev</span></button>' +
			'<button type="button" class="viz-btn" data-act="next"><span class="vz-label-long">Next</span>' + icon("next") + "</button>" +
			'<button type="button" class="viz-btn" data-act="play">' + icon("play") + "<span>Play</span></button>" +
			(hasGroups ? '<button type="button" class="viz-btn" data-act="group" title="Jump to the end of this ' + groupLabel + '">' + icon("skip") + '<span class="vz-label-long">End of ' + groupLabel + "</span></button>" : "") +
			'<button type="button" class="viz-btn is-icon" data-act="reset" title="Back to the start" aria-label="Back to the start">' + icon("reset") + "</button>" +
			'<span class="viz-spacer"></span>' +
			'<span class="viz-step" aria-live="off"></span>' +
			'<label class="viz-speed">Speed <input type="range" min="1" max="5" step="1" value="3" data-act="speed"></label>' +
		"</div>" +
		(msgTop ? '<div class="viz-msg is-top" aria-live="polite"></div>' : "") +
		'<div class="viz-stage"></div>' +
		(mod.legend && mod.legend.length ? '<div class="viz-legend">' + mod.legend.map(function(l) {
			return '<span><i class="vz-swatch ' + l.cls + '"></i>' + escapeHtml(l.label) + "</span>";
		}).join("") + "</div>" : "") +
		(msgTop ? "" : '<div class="viz-msg" aria-live="polite"></div>') +
		(codeLines || hasVars ? '<div class="viz-panels' + (codeLines && hasVars ? "" : " is-single") + '">' +
			(codeLines ? '<div class="viz-code">' + codeLines.map(function(line, k) {
				return '<div class="viz-line"><span class="viz-ln">' + (k + 1) + "</span><span>" + (highlightCpp(line) || " ") + "</span></div>";
			}).join("") + "</div>" : "") +
			(hasVars ? '<div class="viz-vars"></div>' : "") +
		"</div>" : "") +
		(config.interactive && mod.input ?
			'<div class="viz-input">' +
				"<label>" + escapeHtml(mod.input.label) + "</label>" +
				'<input type="text" spellcheck="false" autocomplete="off" aria-label="' + escapeHtml(mod.input.label) + '">' +
				'<button type="button" class="viz-btn" data-act="apply">Run</button>' +
				(mod.input.random ? '<button type="button" class="viz-btn" data-act="random">' + icon("shuffle") + "<span>Random</span></button>" : "") +
				'<span class="viz-input-err" role="alert"></span>' +
			"</div>" : "");

	const $ = function(sel) { return wrapper.querySelector(sel); };
	const stage = $(".viz-stage");
	const msgEl = $(".viz-msg");
	const stepEl = $(".viz-step");
	const varsEl = $(".viz-vars");
	const lineEls = Array.from(wrapper.querySelectorAll(".viz-line"));
	const playBtn = $('[data-act="play"]');
	const inputEl = $(".viz-input input");
	const inputErr = $(".viz-input-err");
	if (inputEl) inputEl.value = mod.input.format(config);

	function update() {
		const frame = frames[idx];
		// A single-frame demo has nothing to step through: hide the toolbar.
		wrapper.classList.toggle("is-static", frames.length < 2);
		const prev = idx > 0 ? frames[idx - 1] : null;
		mod.render(stage, frame, config);
		msgEl.innerHTML = formatMessage(frame.msg || "");
		stepEl.textContent = "Step " + (idx + 1) + " / " + frames.length;
		lineEls.forEach(function(el, k) {
			el.classList.toggle("is-active", (frame.lines || []).includes(k + 1));
		});
		if (varsEl) {
			const before = new Map(prev && prev.vars ? prev.vars : []);
			varsEl.innerHTML = (frame.vars || []).map(function(pair) {
				const changed = prev && before.get(pair[0]) !== pair[1];
				return '<span class="vz-name">' + escapeHtml(pair[0]) + '</span><span class="vz-val' + (changed ? " is-changed" : "") + '">' + escapeHtml(pair[1]) + "</span>";
			}).join("");
		}
		$('[data-act="prev"]').disabled = idx === 0;
		$('[data-act="next"]').disabled = idx === frames.length - 1;
		const groupBtn = $('[data-act="group"]');
		if (groupBtn) groupBtn.disabled = idx === frames.length - 1;
	}

	function setPlaying(on) {
		if (timer) {
			clearTimeout(timer);
			timer = null;
		}
		playBtn.innerHTML = on ? icon("pause") + "<span>Pause</span>" : icon("play") + "<span>Play</span>";
		if (on) tick();
	}

	function tick() {
		timer = setTimeout(function() {
			// The note may have been replaced (new file opened); stop quietly.
			if (!wrapper.isConnected) {
				timer = null;
				return;
			}
			if (idx < frames.length - 1) {
				idx++;
				update();
			}
			if (idx < frames.length - 1) tick();
			else setPlaying(false);
		}, SPEED_MS[speed - 1]);
	}

	function go(target) {
		idx = Math.max(0, Math.min(frames.length - 1, target));
		update();
	}

	// Last frame of the current group; if already there, the end of the next one.
	function endOfGroup() {
		let k = idx;
		if (k + 1 < frames.length && frames[k + 1].group !== frames[k].group) k++;
		const g = frames[k].group;
		while (k + 1 < frames.length && frames[k + 1].group === g) k++;
		return k;
	}

	// Expand: move this same block (state and all) into a near-fullscreen modal
	// dialog, leaving a placeholder of the same height so the page doesn't jump.
	let dialog = null;
	let placeholder = null;

	function toggleExpand() {
		const btn = $('[data-act="expand"]');
		if (dialog) {
			wrapper.classList.remove("is-expanded");
			placeholder.replaceWith(wrapper);
			dialog.close();
			dialog.remove();
			dialog = null;
			placeholder = null;
			document.documentElement.classList.remove("viz-modal-open");
			btn.innerHTML = icon("expand");
			btn.title = "Expand";
			btn.setAttribute("aria-label", "Expand");
			wrapper.focus({ preventScroll: true });
		} else {
			placeholder = document.createElement("div");
			placeholder.style.height = wrapper.offsetHeight + "px";
			placeholder.style.margin = "1.25rem 0";
			wrapper.replaceWith(placeholder);
			dialog = document.createElement("dialog");
			dialog.className = "viz-modal";
			dialog.setAttribute("aria-label", (config.title || mod.meta.name) + " (expanded)");
			dialog.addEventListener("cancel", function(e) { e.preventDefault(); toggleExpand(); });
			dialog.addEventListener("click", function(e) { if (e.target === dialog) toggleExpand(); });
			dialog.appendChild(wrapper);
			document.body.appendChild(dialog);
			wrapper.classList.add("is-expanded");
			document.documentElement.classList.add("viz-modal-open");
			dialog.showModal();
			btn.innerHTML = icon("collapse");
			btn.title = "Close (Esc)";
			btn.setAttribute("aria-label", "Close expanded view");
			wrapper.focus({ preventScroll: true });
		}
		// Moving a block reloads any iframe in it; let the component catch up.
		if (mod.moved) mod.moved(stage, config);
	}

	function rebuild(newConfig) {
		setPlaying(false);
		config = newConfig;
		frames = mod.steps(config);
		idx = 0;
		update();
	}

	function applyInput(value) {
		const raw = Object.assign({}, rawConfig);
		raw[mod.input.key] = value;
		const errs = mod.validate(raw);
		if (errs.length) {
			inputErr.textContent = errs.join("; ");
			return;
		}
		inputErr.textContent = "";
		rebuild(withDefaults(mod.meta.params, raw));
	}

	wrapper.addEventListener("click", function(e) {
		const btn = e.target.closest("[data-act]");
		if (!btn || !wrapper.contains(btn)) return;
		const act = btn.dataset.act;
		if (act === "prev") { setPlaying(false); go(idx - 1); }
		else if (act === "next") { setPlaying(false); go(idx + 1); }
		else if (act === "play") {
			if (timer) setPlaying(false);
			else {
				if (idx === frames.length - 1) go(0);
				setPlaying(true);
			}
		}
		else if (act === "expand") toggleExpand();
		else if (act === "group") { setPlaying(false); go(endOfGroup()); }
		else if (act === "reset") { setPlaying(false); go(0); }
		else if (act === "apply") {
			const r = mod.input.parse(inputEl.value);
			if (r.error) inputErr.textContent = r.error;
			else applyInput(r.value);
		}
		else if (act === "random") {
			const value = mod.input.random();
			const raw = Object.assign({}, config);
			raw[mod.input.key] = value;
			inputEl.value = mod.input.format(raw);
			applyInput(value);
		}
	});

	$('[data-act="speed"]').addEventListener("input", function(e) {
		speed = Number(e.target.value);
	});

	if (inputEl) {
		inputEl.addEventListener("keydown", function(e) {
			if (e.key === "Enter") {
				e.preventDefault();
				$('[data-act="apply"]').click();
			}
		});
	}

	wrapper.addEventListener("keydown", function(e) {
		if (e.target.closest("input, textarea, select")) return;
		if (e.key === "ArrowRight") { e.preventDefault(); setPlaying(false); go(idx + 1); }
		else if (e.key === "ArrowLeft") { e.preventDefault(); setPlaying(false); go(idx - 1); }
		else if (e.key === " " && e.target === wrapper) { e.preventDefault(); playBtn.click(); }
	});

	update();
}
