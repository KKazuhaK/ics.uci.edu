/* Bento site — minimal vanilla JS for theme toggle + heatmap animation.
   Kept tiny on purpose: no framework, no jQuery. */

(function () {
  "use strict";

  // ── Theme toggle ────────────────────────────────
  var THEME_KEY = "kzh-theme";
  var root = document.documentElement;

  var mql = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");

  // Local preview: deployed links use /~kazuhak/... on the UCI server.
  // Under file:// those would point at the machine root; under localhost they
  // would point at a missing /~kazuhak/ folder. Rewrite them to the preview root.
  function rewriteLocalFileLinks() {
    var isLocalHost = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (location.protocol !== "file:" && !isLocalHost) return;

    var script = document.currentScript || document.querySelector('script[src$="assets/js/bento.js"]');
    if (!script || !script.src) return;

    var siteRoot;
    try {
      siteRoot = new URL("../..", script.src);
    } catch (e) {
      return;
    }

    var deployedPrefix = "/~kazuhak/";
    var skipProtocol = /^(?:mailto|tel|sms|javascript|data|blob):/i;
    var hasProtocol = /^[a-z][a-z0-9+.-]*:/i;

    function rewriteLinkHref(link) {
      if (!link || !link.getAttribute) return;
      var raw = link.getAttribute("href");
      if (!raw || raw.charAt(0) === "#" || skipProtocol.test(raw)) return;

      var url;
      try {
        url = new URL(raw, location.href);
      } catch (e) {
        return;
      }

      var target = null;
      var isDeployedPath = url.pathname.indexOf(deployedPrefix) === 0;
      var isKnownSiteUrl = url.hostname === "ics.uci.edu" && isDeployedPath;

      if (isDeployedPath && (raw.indexOf(deployedPrefix) === 0 || isKnownSiteUrl || url.protocol === "file:")) {
        var localPath = url.pathname.slice(deployedPrefix.length);
        if (!localPath || localPath.slice(-1) === "/") localPath += "index.html";
        target = new URL(localPath, siteRoot);
        target.search = url.search;
        target.hash = url.hash;
      } else if (!hasProtocol.test(raw) && url.protocol === "file:" && url.pathname.slice(-1) === "/") {
        target = new URL(url.href);
        target.pathname += "index.html";
      }

      if (target) link.setAttribute("href", target.href);
    }

    document.querySelectorAll("a[href]").forEach(rewriteLinkHref);

    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
      if (link) rewriteLinkHref(link);
    }, true);

    if (window.MutationObserver && document.body) {
      var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (mutation.type === "attributes") {
            rewriteLinkHref(mutation.target);
            return;
          }
          Array.prototype.forEach.call(mutation.addedNodes || [], function (node) {
            if (!node || node.nodeType !== 1) return;
            if (node.matches && node.matches("a[href]")) rewriteLinkHref(node);
            if (node.querySelectorAll) {
              node.querySelectorAll("a[href]").forEach(rewriteLinkHref);
            }
          });
        });
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["href"]
      });
    }
  }

  rewriteLocalFileLinks();

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

  // ── Deployment-local footer config ──────────────
  function mountLocalFooterConfig() {
    if (!window.fetch) return;

    var footers = Array.prototype.slice.call(document.querySelectorAll(".foot"));
    if (!footers.length) return;

    var script = document.currentScript || document.querySelector('script[src$="assets/js/bento.js"]');
    if (!script || !script.src) return;

    var configUrl;
    try {
      configUrl = new URL("../../assets/config/site.local.json", script.src);
    } catch (e) {
      return;
    }

    fetch(configUrl.href, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) return null;
        return response.json();
      })
      .then(function (config) {
        var record = normalizeFooterRecord(config);
        if (!record || !record.text) return;
        footers.forEach(function (footer) {
          appendFooterRecord(footer, record);
        });
      })
      .catch(function () {});
  }

  function normalizeFooterRecord(config) {
    if (!config) return null;
    var footer = config.footer || {};
    var source = footer.icp || footer.record || config.icp || config.record;
    if (!source) return null;

    if (typeof source === "string") {
      return { text: source, href: "https://beian.miit.gov.cn/" };
    }

    var text = source.text || source.label || source.icp || "";
    if (!text) return null;
    return {
      text: text,
      href: source.href || source.url || "https://beian.miit.gov.cn/"
    };
  }

  function appendFooterRecord(footer, record) {
    if (footer.querySelector("[data-local-footer-record]")) return;

    var span = document.createElement("span");
    span.className = "foot-local-record";
    span.setAttribute("data-local-footer-record", "");

    if (record.href) {
      var link = document.createElement("a");
      link.href = record.href;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = record.text;
      span.appendChild(link);
    } else {
      span.textContent = record.text;
    }

    footer.appendChild(span);
  }

  mountLocalFooterConfig();

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
