// Notion-style TOC sidebar: minimap bars when collapsed, full list on hover,
// tracks the current heading. Shown for notes with 4+ headings.
import { escapeHtml } from "../../lib/markdown/code";

export const HEADING_SELECTOR = ":is(h1, h2, h3, h4):not(.footnotes *)";

// Listeners of the current TOC; md-viewer re-renders, so each build replaces the last.
let active: AbortController | null = null;

export function resetToc(): void {
  active?.abort();
  active = null;
  const sidebar = document.getElementById("toc-sidebar");
  if (sidebar) sidebar.hidden = true;
  for (const id of ["toc-marks-track", "toc-panel"]) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  }
}

export function buildToc(contentEl: HTMLElement): void {
  resetToc();
  const sidebar = document.getElementById("toc-sidebar");
  const panelEl = document.getElementById("toc-panel");
  const trackEl = document.getElementById("toc-marks-track");
  if (!sidebar || !panelEl || !trackEl) return;
  active = new AbortController();
  const { signal } = active;
  const headings = Array.from(contentEl.querySelectorAll<HTMLElement>(HEADING_SELECTOR));
  if (headings.length < 4) return;

  // marks (collapsed view) — fixed spacing, scrolls with page
  trackEl.innerHTML = headings.map((h) => '<span class="toc-mark mark-h' + h.tagName[1] + '"></span>').join("");

  // panel (expanded view)
  panelEl.innerHTML = headings
    .map((h) => {
      const id = escapeHtml(h.id);
      return '<div class="toc-item toc-h' + h.tagName[1] + '" data-id="' + id + '"><a href="#' + id + '">' + escapeHtml((h.textContent || "").trim()) + "</a></div>";
    })
    .join("");

  sidebar.hidden = false;

  const marks = Array.from(trackEl.querySelectorAll<HTMLElement>(".toc-mark"));
  const items = Array.from(panelEl.querySelectorAll<HTMLElement>(".toc-item"));
  let tocClickScrolling = false;
  let tocClickTimer: ReturnType<typeof setTimeout> | undefined;

  function updateActive(): void {
    const scrollY = window.scrollY + 130;
    let activeIdx = 0;
    for (let j = 0; j < headings.length; j++) {
      if (headings[j]!.offsetTop <= scrollY) activeIdx = j;
      else break;
    }
    marks.forEach((m, i) => m.classList.toggle("mark-active", i === activeIdx));
    items.forEach((el, i) => el.classList.toggle("active", i === activeIdx));

    if (tocClickScrolling) return;

    // scroll track so active mark is visible
    const totalH = trackEl!.scrollHeight;
    const viewH = trackEl!.clientHeight;
    if (totalH > viewH) {
      const progress = headings.length > 1 ? activeIdx / (headings.length - 1) : 0;
      trackEl!.scrollTop = Math.round(progress * (totalH - viewH));
    }

    // scroll panel so active item stays visible
    const activeItem = items[activeIdx];
    if (activeItem) {
      const elTop = activeItem.offsetTop;
      const elH = activeItem.offsetHeight;
      const pH = panelEl!.clientHeight;
      const pScroll = panelEl!.scrollTop;
      if (elTop < pScroll || elTop + elH > pScroll + pH) panelEl!.scrollTop = elTop - pH / 2 + elH / 2;
    }
  }

  window.addEventListener("scroll", updateActive, { passive: true, signal });
  updateActive();

  panelEl.addEventListener("click", (e) => {
    const a = (e.target as Element).closest("a");
    if (!a) return;
    e.preventDefault();
    const href = a.getAttribute("href")!;
    const target = document.getElementById(decodeURIComponent(href.slice(1)));
    if (target) {
      tocClickScrolling = true;
      clearTimeout(tocClickTimer);
      tocClickTimer = setTimeout(() => (tocClickScrolling = false), 800);
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", href);
    }
  }, { signal });
}
