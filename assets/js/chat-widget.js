/* Chat Widget - Floating bubble for all pages
   Reads current page content and sends it as context to the Mistral proxy.
   No password required; AI is restricted to page-related questions only. */

(function () {
  "use strict";

  var WORKER_URL = "https://ics-uci-edu-chat-ai.kazuhahub.workers.dev";

  // Don't load on the standalone chat page
  if (location.pathname.replace(/\/$/, "").endsWith("/tools/ask-ai")) return;

  /* ---------- helpers ---------- */
  var pageContextTruncated = false;

  function getPageContext() {
    var el =
      document.querySelector(".markdown-body") ||
      document.getElementById("main") ||
      document.querySelector("main") ||
      document.body;
    var text = (el.innerText || el.textContent || "").trim();
    text = text.replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ");
    pageContextTruncated = text.length > 32000;
    return text.slice(0, 32000);
  }

  /* ---------- inject styles ---------- */
  var css = document.createElement("style");
  css.textContent = [
    /* --- Bubble (theme-aware: Bento card pill) --- */
    "#cw-bubble {",
    "  position:fixed;",
    "  bottom:32px;",
    "  right:32px;",
    "  display:inline-flex;",
    "  align-items:center;",
    "  gap:6px;",
    "  height:auto;",
    "  padding:10px 18px 10px 14px;",
    "  border-radius:999px;",
    "  background:var(--card,#ffffff);",
    "  color:var(--uci-blue,#0064A4);",
    "  border:1px solid var(--hairline,rgba(15,23,42,0.08));",
    "  cursor:pointer;",
    "  font-family:'Inter','Noto Sans SC','Source Sans Pro',Helvetica,sans-serif;",
    "  font-size:15px;",
    "  font-weight:700;",
    "  line-height:1;",
    "  letter-spacing:0.04em;",
    "  box-shadow:0 4px 18px rgba(15,23,42,0.08);",
    "  z-index:99999;",
    "  text-transform:uppercase;",
    "  white-space:nowrap;",
    "  transition:filter .18s ease, box-shadow .18s ease, transform .18s ease;",
    "}",
    "html[data-theme=\"dark\"] #cw-bubble {",
    "  color:#58a6ff;",
    "  box-shadow:0 4px 18px rgba(0,0,0,0.4);",
    "}",
    "#cw-btn-group > * {",
    "  height:auto !important;",
    "  line-height:1 !important;",
    "  font-family:'Inter','Noto Sans SC','Source Sans Pro',Helvetica,sans-serif !important;",
    "  font-size:15px !important;",
    "  font-weight:700 !important;",
    "  padding:10px 18px 10px 14px !important;",
    "  gap:6px !important;",
    "  letter-spacing:0.04em !important;",
    "}",
    "#cw-btn-group > * svg {",
    "  width:16px !important;",
    "  height:16px !important;",
    "}",
    "#cw-bubble:hover, #cw-bubble:active, #cw-bubble:focus-visible {",
    "  filter:brightness(0.96);",
    "  transform:translateY(-1px);",
    "  box-shadow:0 6px 22px rgba(15,23,42,0.12);",
    "}",
    "html[data-theme=\"dark\"] #cw-bubble:hover,",
    "html[data-theme=\"dark\"] #cw-bubble:active,",
    "html[data-theme=\"dark\"] #cw-bubble:focus-visible {",
    "  filter:brightness(1.08);",
    "  box-shadow:0 6px 22px rgba(0,0,0,0.5);",
    "}",
    "#cw-bubble svg {",
    "  width:16px;",
    "  height:16px;",
    "  stroke:currentColor;",
    "  fill:none;",
    "  stroke-width:2.8;",
    "  stroke-linecap:round;",
    "  stroke-linejoin:round;",
    "  flex-shrink:0;",
    "}",

    /* --- Panel --- */
    "#cw-panel {",
    "  position:fixed; bottom:calc(32px + 46px); right:32px; width:380px; max-height:580px;",
    "  background:rgba(20,24,31,.97); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);",
    "  border:1px solid rgba(255,255,255,.06);",
    "  border-radius:16px; z-index:99999;",
    "  box-shadow:0 12px 48px rgba(0,0,0,.5), 0 0 1px rgba(255,255,255,.05);",
    "  display:none; flex-direction:column; overflow:hidden;",
    "  font-family:'Inter','Noto Sans SC','Source Sans Pro',Helvetica,sans-serif;",
    "  animation:cw-slideUp .2s ease;",
    "}",
    "#cw-panel.open { display:flex; }",
    "@keyframes cw-slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }",

    /* --- Header --- */
    "#cw-header {",
    "  padding:14px 18px; display:flex; justify-content:space-between; align-items:center;",
    "  border-bottom:1px solid rgba(88,166,255,.08);",
    "  background:linear-gradient(180deg, rgba(88,166,255,.04) 0%, transparent 100%);",
    "}",
    "#cw-header span {",
    "  color:#c8d6e0; font-size:13.5px; font-weight:600; letter-spacing:.3px;",
    "}",
    "#cw-header .cw-badge {",
    "  font-size:9px; color:#0f172a; font-weight:600;",
    "  margin-left:8px; letter-spacing:.5px; text-transform:uppercase;",
    "  background:rgba(255,255,255,.85); padding:2px 6px; border-radius:4px;",
    "  vertical-align:middle;",
    "}",
    "#cw-close {",
    "  all:unset; box-sizing:border-box; color:rgba(88,166,255,.4); cursor:pointer;",
    "  font-size:18px; line-height:1; transition:color .15s;",
    "}",
    "#cw-close:hover { color:#58a6ff; }",
    "#cw-new {",
    "  all:unset; box-sizing:border-box; cursor:pointer;",
    "  font-size:12.5px; font-weight:600; line-height:1; letter-spacing:.3px;",
    "  color:#58a6ff; background:rgba(88,166,255,.18);",
    "  border:1px solid rgba(88,166,255,.4); border-radius:6px;",
    "  padding:6px 12px; transition:all .15s; white-space:nowrap;",
    "}",
    "#cw-new:hover { color:#79c0ff; background:rgba(88,166,255,.28); border-color:rgba(88,166,255,.6); }",

    /* --- Messages --- */
    "#cw-messages {",
    "  flex:1; overflow-y:auto; padding:14px 16px;",
    "  display:flex; flex-direction:column; gap:10px;",
    "  min-height:400px; max-height:520px;",
    "}",
    "#cw-messages::-webkit-scrollbar { width:4px; }",
    "#cw-messages::-webkit-scrollbar-track { background:transparent; }",
    "#cw-messages::-webkit-scrollbar-thumb { background:rgba(88,166,255,.15); border-radius:4px; }",

    ".cw-msg {",
    "  max-width:82%; padding:9px 13px; border-radius:12px;",
    "  font-size:13.5px; line-height:1.55; word-wrap:break-word; white-space:pre-wrap;",
    "}",
    ".cw-msg.user {",
    "  align-self:flex-end; background:rgba(88,166,255,.14);",
    "  color:#e8f4fa; border-bottom-right-radius:4px; border:1px solid rgba(88,166,255,.28);",
    "}",
    ".cw-msg.assistant {",
    "  align-self:flex-start; background:rgba(255,255,255,.04);",
    "  color:#cbd5e1; border-bottom-left-radius:4px; border:1px solid rgba(255,255,255,.06);",
    "}",
    ".cw-msg.assistant a { color:#58a6ff; text-decoration:underline; text-underline-offset:2px; }",
    ".cw-msg.assistant a:hover { color:#79c0ff; }",
    ".cw-msg.assistant { white-space:normal; }",
    ".cw-msg.assistant strong { color:#e2ecf0; font-weight:600; }",
    ".cw-msg.assistant em { font-style:italic; color:#b8d8e8; }",
    ".cw-msg.assistant h1,.cw-msg.assistant h2,.cw-msg.assistant h3,.cw-msg.assistant h4 { color:#e2ecf0; margin:6px 0 2px; }",
    ".cw-msg.assistant h1 { font-size:15px; } .cw-msg.assistant h2 { font-size:14px; } .cw-msg.assistant h3 { font-size:13.5px; }",
    ".cw-msg.assistant ul,.cw-msg.assistant ol { margin:3px 0; padding-left:1.3em; }",
    ".cw-msg.assistant li { margin:1px 0; }",
    ".cw-msg.assistant hr { border:none; border-top:1px solid rgba(88,166,255,.12); margin:6px 0; }",
    ".cw-msg.assistant blockquote { border-left:2px solid rgba(88,166,255,.25); padding:1px 0 1px 10px; margin:4px 0; color:rgba(88,166,255,.5); font-style:italic; }",
    ".cw-msg.assistant blockquote p { margin:0; }",
    ".cw-msg.assistant del { text-decoration:line-through; opacity:.6; }",
    ".cw-msg.assistant table { border-collapse:collapse; margin:4px 0; font-size:12px; }",
    ".cw-msg.assistant th,.cw-msg.assistant td { border:1px solid rgba(88,166,255,.12); padding:4px 8px; }",
    ".cw-msg.assistant th { background:rgba(88,166,255,.06); font-weight:700; }",
    ".cw-msg.assistant p { margin:3px 0; }",
    ".cw-msg.assistant pre.cw-code {",
    "  display:block; background:rgba(0,0,0,.3); border:1px solid rgba(88,166,255,.1);",
    "  border-radius:6px; padding:8px 10px; margin:4px 0; font-size:12px;",
    "  font-family:'SF Mono','Fira Code',Consolas,monospace; overflow-x:auto;",
    "  white-space:pre; line-height:1.5; color:#c8d6e0;",
    "}",
    ".cw-msg.assistant pre.cw-code code {",
    "  font-family:inherit; font-size:inherit; background:none; padding:0;",
    "  border:none; color:inherit; white-space:pre; display:block;",
    "}",
    ".cw-msg.assistant .cw-inline-code {",
    "  background:rgba(0,0,0,.25); padding:1px 5px; border-radius:3px; font-size:12.5px;",
    "  font-family:'SF Mono','Fira Code',Consolas,monospace; color:#58a6ff; border:none;",
    "}",
    ".cw-msg.assistant .katex-display { margin:6px 0; overflow-x:auto; overflow-y:hidden; }",
    ".cw-msg.assistant .katex { font-size:1em; }",
    ".cw-msg.user img {",
    "  max-width:180px; max-height:120px; border-radius:6px; margin-top:6px; display:block;",
    "  border:1px solid rgba(255,255,255,.18); object-fit:cover;",
    "}",
    ".cw-msg.user .cw-file-badge {",
    "  display:flex; align-items:center; gap:5px; margin-top:6px;",
    "  padding:5px 10px; border-radius:6px; font-size:11px; font-weight:600;",
    "  background:rgba(255,255,255,.1); color:rgba(255,255,255,.85);",
    "  border:1px solid rgba(255,255,255,.12);",
    "}",
    ".cw-msg.user .cw-file-badge svg { width:12px; height:12px; flex-shrink:0; opacity:.7; }",
    "#cw-file-preview {",
    "  display:none; padding:6px 16px; border-top:1px solid rgba(88,166,255,.08);",
    "  align-items:center; gap:8px;",
    "}",
    "#cw-file-preview.active { display:flex; }",
    "#cw-file-preview img { max-height:40px; max-width:80px; border-radius:4px; border:1px solid rgba(88,166,255,.15); object-fit:cover; }",
    "#cw-file-preview .cw-file-icon {",
    "  width:32px; height:32px; min-width:32px; border-radius:4px;",
    "  background:rgba(88,166,255,.08); border:1px solid rgba(88,166,255,.15);",
    "  display:flex; align-items:center; justify-content:center;",
    "  color:rgba(88,166,255,.6); font-size:9px; font-weight:700; text-transform:uppercase;",
    "}",
    "#cw-file-preview .cw-file-name { flex:1; font-size:11px; color:rgba(88,166,255,.4); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }",
    "#cw-file-remove { all:unset; box-sizing:border-box; cursor:pointer; color:rgba(88,166,255,.4); font-size:16px; line-height:1; transition:color .15s; }",
    "#cw-file-remove:hover { color:#f5a0a0; }",
    "#cw-file-upload {",
    "  all:unset; box-sizing:border-box; cursor:pointer; color:rgba(88,166,255,.35);",
    "  width:42px; height:42px; min-width:42px; display:flex; align-items:center; justify-content:center;",
    "  border-radius:10px; border:1px solid rgba(88,166,255,.1); transition:all .15s; flex-shrink:0;",
    "}",
    "#cw-file-upload:hover { color:rgba(88,166,255,.7); border-color:rgba(88,166,255,.25); background:rgba(88,166,255,.06); }",
    "#cw-file-upload svg { width:16px; height:16px; }",
    ".cw-msg.error {",
    "  align-self:flex-start; background:rgba(220,80,80,.12);",
    "  color:#f5a0a0; border-bottom-left-radius:4px; border:1px solid rgba(220,80,80,.15);",
    "}",
    ".cw-msg.system-hint {",
    "  align-self:center; color:rgba(88,166,255,.35); font-size:12px;",
    "  background:none; border:none; padding:4px; text-align:center;",
    "}",
    ".cw-typing { display:inline-flex; gap:4px; padding:10px 14px; }",
    ".cw-typing span {",
    "  width:6px; height:6px; border-radius:50%; background:rgba(88,166,255,.35);",
    "  animation:cw-dot .9s infinite;",
    "}",
    ".cw-typing span:nth-child(2) { animation-delay:.15s; }",
    ".cw-typing span:nth-child(3) { animation-delay:.3s; }",
    "@keyframes cw-dot { 0%,60%,100%{opacity:.3;transform:scale(1)} 30%{opacity:1;transform:scale(1.3)} }",

    /* --- Input --- */
    "#cw-input-row {",
    "  display:flex; align-items:center; gap:8px;",
    "  padding:10px 14px; border-top:1px solid rgba(88,166,255,.08);",
    "}",
    "#cw-input-row button {",
    "  line-height:1 !important; box-shadow:none !important;",
    "  text-transform:none !important; letter-spacing:normal !important;",
    "}",
    "#cw-input {",
    "  all:unset; box-sizing:border-box;",
    "  flex:1; border:1px solid rgba(88,166,255,.1); background:rgba(255,255,255,.04);",
    "  color:#d4ecf5; padding:11px 14px; border-radius:10px; height:42px !important; min-height:42px;",
    "  font-size:13.5px; font-family:inherit; transition:border-color .15s;",
    "}",
    "#cw-input:focus { border-color:rgba(88,166,255,.3); }",
    "#cw-input::placeholder { color:rgba(88,166,255,.25); }",
    "#cw-send {",
    "  all:unset; box-sizing:border-box;",
    "  background:rgba(88,166,255,.12); border:1px solid rgba(88,166,255,.2);",
    "  color:#58a6ff; cursor:pointer; min-width:42px; min-height:42px; width:42px; height:42px;",
    "  border-radius:10px; display:flex; align-items:center; justify-content:center;",
    "  transition:all .15s; flex-shrink:0;",
    "}",
    "#cw-send:hover { background:rgba(88,166,255,.2); border-color:rgba(88,166,255,.35); }",
    "#cw-send:disabled { opacity:.3; cursor:default; }",
    "#cw-send svg { width:18px; height:18px; fill:currentColor; }",

    /* --- Light theme overrides --- */
    "html[data-theme=\"light\"] #cw-panel {",
    "  background:rgba(255,255,255,.97); border:1px solid rgba(15,23,42,.08);",
    "  box-shadow:0 12px 48px rgba(15,23,42,.14), 0 0 1px rgba(15,23,42,.08);",
    "}",
    "html[data-theme=\"light\"] #cw-header {",
    "  border-bottom:1px solid rgba(15,23,42,.06);",
    "  background:linear-gradient(180deg, rgba(0,100,164,.03) 0%, transparent 100%);",
    "}",
    "html[data-theme=\"light\"] #cw-header span { color:#1e2136; }",
    "html[data-theme=\"light\"] #cw-header .cw-badge { color:#fff; background:#1e2136; }",
    "html[data-theme=\"light\"] #cw-close { color:rgba(15,23,42,.4); }",
    "html[data-theme=\"light\"] #cw-close:hover { color:#0064A4; }",
    "html[data-theme=\"light\"] #cw-new {",
    "  color:#004577; background:rgba(0,100,164,.12); border:1px solid rgba(0,100,164,.28);",
    "}",
    "html[data-theme=\"light\"] #cw-new:hover {",
    "  color:#003355; background:rgba(0,100,164,.2); border-color:rgba(0,100,164,.45);",
    "}",
    "html[data-theme=\"light\"] #cw-messages::-webkit-scrollbar-thumb { background:rgba(15,23,42,.15); }",
    "html[data-theme=\"light\"] .cw-msg.user {",
    "  background:rgba(0,100,164,.08); color:#1e2136; border:1px solid rgba(0,100,164,.15);",
    "}",
    "html[data-theme=\"light\"] .cw-msg.assistant {",
    "  background:rgba(15,23,42,.04); color:#1e2136; border:1px solid rgba(15,23,42,.06);",
    "}",
    "html[data-theme=\"light\"] .cw-msg.assistant a { color:#0064A4; }",
    "html[data-theme=\"light\"] .cw-msg.assistant a:hover { color:#004577; }",
    "html[data-theme=\"light\"] .cw-msg.assistant strong { color:#0f172a; }",
    "html[data-theme=\"light\"] .cw-msg.assistant em { color:#334155; }",
    "html[data-theme=\"light\"] .cw-msg.assistant h1,",
    "html[data-theme=\"light\"] .cw-msg.assistant h2,",
    "html[data-theme=\"light\"] .cw-msg.assistant h3,",
    "html[data-theme=\"light\"] .cw-msg.assistant h4 { color:#0f172a; }",
    "html[data-theme=\"light\"] .cw-msg.assistant hr { border-top-color:rgba(15,23,42,.1); }",
    "html[data-theme=\"light\"] .cw-msg.assistant blockquote {",
    "  border-left-color:rgba(0,100,164,.3); color:#64748b;",
    "}",
    "html[data-theme=\"light\"] .cw-msg.assistant th,",
    "html[data-theme=\"light\"] .cw-msg.assistant td { border-color:rgba(15,23,42,.1); }",
    "html[data-theme=\"light\"] .cw-msg.assistant th { background:rgba(15,23,42,.04); }",
    "html[data-theme=\"light\"] .cw-msg.assistant pre.cw-code {",
    "  background:rgba(15,23,42,.05); border:1px solid rgba(15,23,42,.08); color:#1e2136;",
    "}",
    "html[data-theme=\"light\"] .cw-msg.assistant .cw-inline-code {",
    "  background:rgba(0,100,164,.08); color:#0064A4;",
    "}",
    "html[data-theme=\"light\"] .cw-msg.user img { border-color:rgba(15,23,42,.1); }",
    "html[data-theme=\"light\"] .cw-msg.user .cw-file-badge {",
    "  background:rgba(0,100,164,.1); color:#0064A4; border-color:rgba(0,100,164,.2);",
    "}",
    "html[data-theme=\"light\"] .cw-msg.error {",
    "  background:rgba(220,80,80,.08); color:#b91c1c; border:1px solid rgba(220,80,80,.2);",
    "}",
    "html[data-theme=\"light\"] .cw-msg.system-hint { color:rgba(15,23,42,.4); }",
    "html[data-theme=\"light\"] .cw-typing span { background:rgba(0,100,164,.4); }",
    "html[data-theme=\"light\"] #cw-input-row { border-top:1px solid rgba(15,23,42,.06); }",
    "html[data-theme=\"light\"] #cw-input {",
    "  background:#f1f5f9; border:1px solid rgba(15,23,42,.14); color:#1e2136;",
    "}",
    "html[data-theme=\"light\"] #cw-input:focus { border-color:rgba(0,100,164,.5); background:#fff; }",
    "html[data-theme=\"light\"] #cw-input::placeholder { color:rgba(15,23,42,.4); }",
    "html[data-theme=\"light\"] #cw-send {",
    "  background:rgba(0,100,164,.16); border:1px solid rgba(0,100,164,.32); color:#0064A4;",
    "}",
    "html[data-theme=\"light\"] #cw-send:hover { background:rgba(0,100,164,.26); border-color:rgba(0,100,164,.5); }",
    "html[data-theme=\"light\"] #cw-file-upload {",
    "  color:rgba(15,23,42,.55); border:1px solid rgba(15,23,42,.18);",
    "}",
    "html[data-theme=\"light\"] #cw-file-upload:hover {",
    "  color:#0064A4; border-color:rgba(0,100,164,.4); background:rgba(0,100,164,.1);",
    "}",
    "html[data-theme=\"light\"] #cw-file-preview { border-top:1px solid rgba(15,23,42,.06); }",
    "html[data-theme=\"light\"] #cw-file-preview img { border-color:rgba(15,23,42,.1); }",
    "html[data-theme=\"light\"] #cw-file-preview .cw-file-icon {",
    "  background:rgba(15,23,42,.05); border:1px solid rgba(15,23,42,.1); color:rgba(15,23,42,.5);",
    "}",
    "html[data-theme=\"light\"] #cw-file-preview .cw-file-name { color:rgba(15,23,42,.5); }",
    "html[data-theme=\"light\"] #cw-file-remove { color:rgba(15,23,42,.4); }",
    "html[data-theme=\"light\"] #cw-file-remove:hover { color:#dc2626; }",

    /* --- Mobile --- */
    "@media(max-width:768px) {",
    "  #cw-bubble { bottom:1rem; right:1rem; font-size:13px !important; padding:8px 14px 8px 10px !important; }",
    "  #cw-btn-group { bottom:1rem !important; right:1rem !important; gap:8px !important; }",
    "  #cw-btn-group > * { font-size:13px !important; padding:8px 14px 8px 10px !important; }",
    "  #cw-panel { right:10px; left:10px; bottom:calc(1rem + 46px); width:auto; max-height:65vh; }",
    "}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- KaTeX (on-demand) ---------- */
  var KATEX_CSS = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css";
  var KATEX_JS  = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js";
  var KATEX_AR  = "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js";
  var katexReady = null;

  function loadKatex() {
    if (!katexReady) {
      katexReady = new Promise(function (resolve) {
        var link = document.createElement("link");
        link.rel = "stylesheet"; link.href = KATEX_CSS; link.crossOrigin = "anonymous";
        document.head.appendChild(link);
        var s1 = document.createElement("script");
        s1.src = KATEX_JS; s1.crossOrigin = "anonymous";
        s1.onload = function () {
          var s2 = document.createElement("script");
          s2.src = KATEX_AR; s2.crossOrigin = "anonymous";
          s2.onload = resolve;
          document.head.appendChild(s2);
        };
        document.head.appendChild(s1);
      });
    }
    return katexReady;
  }

  // Pre-load KaTeX if needed, render inline via katex.renderToString
  function tryRenderMath(latex, displayMode) {
    if (typeof katex === "undefined") return null;
    try {
      return katex.renderToString(latex, { displayMode: displayMode, throwOnError: false });
    } catch (e) { return null; }
  }

  function renderMathInline(text) {
    // Display math: $$ ... $$ or \[ ... \]
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, function (_, m) {
      var r = tryRenderMath(m, true); return r || "$$" + m + "$$";
    });
    text = text.replace(/\\\[([\s\S]+?)\\\]/g, function (_, m) {
      var r = tryRenderMath(m, true); return r || "\\[" + m + "\\]";
    });
    // Inline math: $ ... $ or \( ... \)
    text = text.replace(/(?<!\$)\$(?!\$)(.+?)\$(?!\$)/g, function (_, m) {
      var r = tryRenderMath(m, false); return r || "$" + m + "$";
    });
    text = text.replace(/\\\((.+?)\\\)/g, function (_, m) {
      var r = tryRenderMath(m, false); return r || "\\(" + m + "\\)";
    });
    return text;
  }

  /* ---------- SVG icons ---------- */
  var chatIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var sendIcon = '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>';
  var attachIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';

  /* ---------- build DOM ---------- */
  var bubble = document.createElement("button");
  bubble.id = "cw-bubble";
  bubble.innerHTML = chatIcon + " Ask AI";
  bubble.title = "Ask about this page";
  document.body.appendChild(bubble);

  // Fade in & group with TOP button
  window.addEventListener("load", function () {
    var topBtn = document.getElementById("back-to-top");
    if (topBtn) {
      // Create a flex wrapper for both buttons
      var wrapper = document.createElement("div");
      wrapper.id = "cw-btn-group";
      wrapper.style.cssText = "position:fixed;bottom:2rem;right:2rem;display:flex;align-items:stretch;gap:10px;z-index:99999;";
      // Move TOP and ASK AI into wrapper
      var hadVisible = topBtn.classList.contains("visible");
      topBtn.classList.remove("visible");
      topBtn.style.position = "static";
      topBtn.style.bottom = "auto";
      topBtn.style.right = "auto";
      bubble.style.position = "static";
      bubble.style.bottom = "auto";
      bubble.style.right = "auto";
      wrapper.appendChild(topBtn);
      wrapper.appendChild(bubble);
      document.body.appendChild(wrapper);
      // If page is already scrolled, show TOP immediately without animation
      if (hadVisible || window.scrollY > 80) {
        topBtn.style.transition = "none";
        topBtn.classList.add("visible");
        // Restore transition after paint
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            topBtn.style.transition = "";
          });
        });
      }
    }
  });

  var panel = document.createElement("div");
  panel.id = "cw-panel";
  panel.innerHTML =
    '<div id="cw-header">' +
      '<span>Ask about this page<span class="cw-badge">Beta</span></span>' +
      '<div style="display:flex;gap:8px;align-items:center;">' +
        '<button id="cw-new" title="New chat"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right:0.3em;"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z"/></svg>New Chat</button>' +
        '<button id="cw-close" title="Close">&times;</button>' +
      '</div>' +
    '</div>' +
    '<div id="cw-messages">' +
      '<div class="cw-msg system-hint" id="cw-hint"></div>' +
    '</div>' +
    '<div id="cw-file-preview">' +
      '<div id="cw-file-visual"></div>' +
      '<span class="cw-file-name" id="cw-file-name"></span>' +
      '<button id="cw-file-remove" title="Remove">&times;</button>' +
    '</div>' +
    '<div id="cw-input-row">' +
      '<button id="cw-file-upload" title="Attach file">' + attachIcon + '</button>' +
      '<input id="cw-input" type="text" placeholder="Type a question..." autocomplete="off" />' +
      '<button id="cw-send" title="Send">' + sendIcon + '</button>' +
      '<input type="file" id="cw-file-input" accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.py,.java,.c,.cpp,.h,.html,.css,.xml,.yaml,.yml,.log" style="display:none" />' +
    '</div>';
  document.body.appendChild(panel);

  var messagesEl = document.getElementById("cw-messages");
  var inputEl = document.getElementById("cw-input");
  var sendBtn = document.getElementById("cw-send");
  var closeBtn = document.getElementById("cw-close");
  var newBtn = document.getElementById("cw-new");
  var fileUploadBtn = document.getElementById("cw-file-upload");
  var fileInput = document.getElementById("cw-file-input");
  var filePreviewBar = document.getElementById("cw-file-preview");
  var fileVisual = document.getElementById("cw-file-visual");
  var fileName = document.getElementById("cw-file-name");
  var fileRemoveBtn = document.getElementById("cw-file-remove");

  /* ---------- state ---------- */
  var chatHistory = [];
  var isStreaming = false;
  var pendingFile = null;

  /* ---------- hint ---------- */
  function getHintHtml() {
    getPageContext(); // ensure pageContextTruncated is set
    var msg = "AI can make mistakes. Please double-check responses.";
    if (pageContextTruncated) msg += "<br>This article is too long for AI to read in full. Answers about later sections may be incomplete.";
    return '<div class="cw-msg system-hint">' + msg + '</div>';
  }
  // Set initial hint
  var hintEl = document.getElementById("cw-hint");
  if (hintEl) { getPageContext(); hintEl.outerHTML = getHintHtml(); }

  /* ---------- toggle ---------- */
  bubble.addEventListener("click", function () {
    var open = panel.classList.toggle("open");
    bubble.classList.toggle("open", open);
    if (open) inputEl.focus();
  });
  closeBtn.addEventListener("click", function () {
    panel.classList.remove("open");
    bubble.classList.remove("open");
  });
  newBtn.addEventListener("click", function () {
    chatHistory = [];
    cwClearFile();
    messagesEl.innerHTML = getHintHtml();
    inputEl.focus();
  });

  /* ---------- file upload ---------- */
  var MAX_FILE_SIZE = 8 * 1024 * 1024;
  var TEXT_EXTS = ["txt","md","csv","json","js","ts","tsx","jsx","py","java","c","cpp","h","html","css","xml","yaml","yml","log","sh","bat","sql","r","go","rs"];

  function cwGetExt(name) { return (name.split(".").pop() || "").toLowerCase(); }
  function cwIsText(file) { return file.type.startsWith("text/") || TEXT_EXTS.indexOf(cwGetExt(file.name)) !== -1; }
  function cwIsImage(file) { return file.type.startsWith("image/"); }
  function cwIsPdf(file) { return file.type === "application/pdf" || cwGetExt(file.name) === "pdf"; }

  function cwClearFile() {
    pendingFile = null;
    filePreviewBar.classList.remove("active");
    fileVisual.innerHTML = "";
    fileName.textContent = "";
  }

  function cwShowPreview(pf) {
    pendingFile = pf;
    fileName.textContent = pf.name;
    if (pf.type === "image") {
      fileVisual.innerHTML = '<img src="' + pf.dataUrl + '" alt="preview" />';
    } else {
      fileVisual.innerHTML = '<div class="cw-file-icon">' + pf.ext.toUpperCase() + '</div>';
    }
    filePreviewBar.classList.add("active");
    inputEl.focus();
  }

  function cwHandleFile(file) {
    if (!file || file.size > MAX_FILE_SIZE) return;
    var ext = cwGetExt(file.name);
    if (cwIsImage(file) || cwIsPdf(file)) {
      var reader = new FileReader();
      reader.onload = function (e) {
        cwShowPreview({ type: cwIsImage(file) ? "image" : "pdf", dataUrl: e.target.result, name: file.name, ext: ext });
      };
      reader.readAsDataURL(file);
    } else if (cwIsText(file)) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var content = e.target.result;
        if (content.length > 30000) content = content.slice(0, 30000) + "\n...(truncated)";
        cwShowPreview({ type: "text", textContent: content, name: file.name, ext: ext });
      };
      reader.readAsText(file);
    }
  }

  fileUploadBtn.addEventListener("click", function () { fileInput.click(); });

  fileInput.addEventListener("change", function () {
    cwHandleFile(this.files && this.files[0]);
    this.value = "";
  });

  fileRemoveBtn.addEventListener("click", cwClearFile);

  // Paste image from clipboard
  panel.addEventListener("paste", function (e) {
    var items = e.clipboardData && e.clipboardData.items;
    if (!items) return;
    for (var i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        var file = items[i].getAsFile();
        if (!file || file.size > MAX_FILE_SIZE) continue;
        e.preventDefault();
        var reader = new FileReader();
        reader.onload = function (ev) {
          cwShowPreview({ type: "image", dataUrl: ev.target.result, name: "pasted-image.png", ext: "png" });
        };
        reader.readAsDataURL(file);
        break;
      }
    }
  });

  /* ---------- markdown renderer (marked.js) ---------- */
  var cwMarkedReady = false;
  (function() {
    var s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/marked@15.0.7/marked.min.js";
    s.onload = function() {
      marked.setOptions({ breaks: true, gfm: true });
      var renderer = new marked.Renderer();
      renderer.code = function(token) {
        var lang = (token.lang || "").trim();
        var escaped = token.text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
        return '<pre class="cw-code"' + (lang ? ' data-lang="' + lang + '"' : '') + '><code>' + escaped + '</code></pre>';
      };
      renderer.codespan = function(token) {
        return '<code class="cw-inline-code">' + token.text + '</code>';
      };
      marked.use({ renderer: renderer });
      cwMarkedReady = true;
    };
    document.head.appendChild(s);
  })();

  function renderMd(text) {
    var mathSlots = [];
    function stashMath(match, latex, display) {
      var r = tryRenderMath(latex, display);
      if (r) { mathSlots.push(r); return "\x00MATH" + (mathSlots.length - 1) + "\x00"; }
      mathSlots.push(match);
      return "\x00MATH" + (mathSlots.length - 1) + "\x00";
    }
    text = text.replace(/\$\$([\s\S]+?)\$\$/g, function(m, l) { return stashMath(m, l, true); });
    text = text.replace(/\\\[([\s\S]+?)\\\]/g, function(m, l) { return stashMath(m, l, true); });
    text = text.replace(/(?<!\$)\$(?!\$)(.+?)\$(?!\$)/g, function(m, l) { return stashMath(m, l, false); });
    text = text.replace(/\\\((.+?)\\\)/g, function(m, l) { return stashMath(m, l, false); });

    var s;
    if (cwMarkedReady) {
      s = marked.parse(text);
    } else {
      s = text.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br>");
    }
    s = s.replace(/\x00MATH(\d+)\x00/g, function(_, i) { return mathSlots[parseInt(i)]; });
    return s;
  }

  /* ---------- send message ---------- */
  function addMessage(role, text) {
    var div = document.createElement("div");
    div.className = "cw-msg " + role;
    if (text) {
      if (role === "assistant") {
        div.innerHTML = renderMd(text);
      } else {
        div.textContent = text;
      }
    }
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  function showTyping() {
    var div = document.createElement("div");
    div.className = "cw-msg assistant cw-typing";
    div.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function sendMessage() {
    var text = inputEl.value.trim();
    var file = pendingFile;
    if ((!text && !file) || isStreaming) return;

    // Build user message display
    var userDiv = document.createElement("div");
    userDiv.className = "cw-msg user";
    if (text) { var ts = document.createElement("div"); ts.textContent = text; userDiv.appendChild(ts); }
    if (file) {
      if (file.type === "image") {
        var img = document.createElement("img");
        img.src = file.dataUrl; img.alt = file.name;
        userDiv.appendChild(img);
      } else {
        var badge = document.createElement("div");
        badge.className = "cw-file-badge";
        var sn = file.name.length > 20 ? file.name.slice(0, 10) + "..." + file.name.slice(-8) : file.name;
        badge.innerHTML = attachIcon + " <span>" + sn + "</span>";
        badge.title = file.name;
        userDiv.appendChild(badge);
      }
    }
    messagesEl.appendChild(userDiv);
    messagesEl.scrollTop = messagesEl.scrollHeight;

    // Build content for API
    var msgContent;
    if (file) {
      msgContent = [];
      if (file.type === "text") {
        var fileText = "--- FILE: " + file.name + " ---\n" + file.textContent + "\n--- END FILE ---";
        msgContent.push({ type: "text", text: (text ? text + "\n\n" : "") + fileText });
      } else {
        if (text) msgContent.push({ type: "text", text: text });
        if (file.type === "image") msgContent.push({ type: "image_url", image_url: { url: file.dataUrl } });
        else if (file.type === "pdf") msgContent.push({ type: "document_url", document_url: file.dataUrl });
      }
    } else {
      msgContent = text;
    }
    chatHistory.push({ role: "user", content: msgContent });

    inputEl.value = "";
    cwClearFile();

    isStreaming = true;
    sendBtn.disabled = true;

    var typing = showTyping();
    var fullText = "";
    var katexLoading = false;

    try {
      var res = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "page",
          context: getPageContext(),
          messages: chatHistory,
        }),
      });

      if (!res.ok) {
        var err = await res.json().catch(function () {
          return { error: res.statusText };
        });
        throw new Error(err.error || "Request failed");
      }

      // Remove typing indicator, add real message bubble
      typing.remove();
      var assistantDiv = addMessage("assistant", "");

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = "";
      var userScrolledUp = false;
      messagesEl.addEventListener("scroll", function onScroll() {
        if (!isStreaming) { messagesEl.removeEventListener("scroll", onScroll); return; }
        userScrolledUp = messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight > 40;
      });

      while (true) {
        var result = await reader.read();
        if (result.done) break;
        buffer += decoder.decode(result.value, { stream: true });

        var lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line.startsWith("data: ")) continue;
          var data = line.slice(6);
          if (data === "[DONE]") continue;
          try {
            var json = JSON.parse(data);
            var delta =
              json.choices &&
              json.choices[0] &&
              json.choices[0].delta &&
              json.choices[0].delta.content;
            if (delta) {
              fullText += delta;
              // Preload KaTeX on first sign of math
              if (!katexLoading && /\$|\\[(\[]/.test(fullText)) {
                katexLoading = true; loadKatex();
              }
              assistantDiv.innerHTML = renderMd(fullText);
              if (!userScrolledUp) messagesEl.scrollTop = messagesEl.scrollHeight;
            }
          } catch (e) { /* skip */ }
        }
      }

      if (!fullText) assistantDiv.innerHTML = "(No response)";
      // Final re-render to catch any math that arrived after KaTeX loaded
      assistantDiv.innerHTML = renderMd(fullText);
      chatHistory.push({ role: "assistant", content: fullText });
    } catch (e) {
      typing.remove();
      var errDiv = addMessage("error", "Error: " + e.message);
    }

    isStreaming = false;
    sendBtn.disabled = false;
    inputEl.focus();
  }

  sendBtn.addEventListener("click", sendMessage);
  inputEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

})();
