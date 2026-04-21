/* Bento site — minimal vanilla JS for theme toggle + heatmap animation.
   Kept tiny on purpose: no framework, no jQuery. Works alongside chat-widget.js. */

(function () {
  "use strict";

  // ── Theme toggle ────────────────────────────────
  var THEME_KEY = "kzh-theme";
  var root = document.documentElement;

  var mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  try {
    var saved = localStorage.getItem(THEME_KEY);
    var theme = saved || (mql && mql.matches ? "dark" : "light");
    root.setAttribute("data-theme", theme);
  } catch (e) {
    root.setAttribute("data-theme", "light");
  }

  // Follow system theme changes when the user has no explicit override.
  if (mql && typeof mql.addEventListener === "function") {
    mql.addEventListener("change", function (e) {
      try {
        if (localStorage.getItem(THEME_KEY)) return;
      } catch (err) {}
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".theme-btn");
    if (!btn) return;
    var current = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    var systemDark = mql && mql.matches;
    var systemTheme = systemDark ? "dark" : "light";
    root.setAttribute("data-theme", current);
    try {
      // If user toggles back to match the system, clear the override
      // so future system changes continue to flow through.
      if (current === systemTheme) localStorage.removeItem(THEME_KEY);
      else localStorage.setItem(THEME_KEY, current);
    } catch (err) {}
  });

  // ── Active nav link (prefix match so /tools/X activates Tools) ─────
  // Pages can override the active nav by setting document.body.dataset.navPath
  // before bento.js runs (e.g., md-viewer points course notes at /notes/).
  function setActiveNav() {
    var override = document.body && document.body.dataset ? document.body.dataset.navPath : "";
    var path = (override || location.pathname).replace(/\/index\.html$/, "/");
    var links = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
    // Find the nav link whose target pathname is the longest prefix of current path.
    var best = null, bestLen = 0;
    links.forEach(function (link) {
      link.classList.remove("active");
      var href = link.getAttribute("href");
      if (!href) return;
      var target = new URL(href, location.href).pathname.replace(/\/index\.html$/, "/");
      // Home (just `/~kazuhak/`) should only match exactly; otherwise prefix.
      var isRoot = /\/~[^\/]+\/$/.test(target) || target === "/";
      var match = isRoot ? path === target : path.indexOf(target) === 0;
      if (match && target.length > bestLen) { best = link; bestLen = target.length; }
    });
    if (best) best.classList.add("active");
  }
  setActiveNav();

  // ── Heatmap mount animation ────────────────────
  function mountHeatmap() {
    var cells = document.querySelectorAll(".hm-cell");
    if (!cells.length) return;
    setTimeout(function () {
      cells.forEach(function (cell, i) {
        cell.style.transitionDelay = (i * 14) + "ms";
        cell.classList.add("mounted");
      });
    }, 80);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountHeatmap);
  } else {
    mountHeatmap();
  }

  // ── Cloudflare Web Analytics beacon ────────────
  (function () {
    var s = document.createElement("script");
    s.defer = true;
    s.src = "https://static.cloudflareinsights.com/beacon.min.js";
    s.setAttribute("data-cf-beacon", '{"token": "cbcd40d8fdf349d98568e9c8e65e3beb"}');
    document.body.appendChild(s);
  })();
})();
