// "Go to heading" palette (Ctrl/Cmd+Shift+O), like VS Code's @-symbol picker.
import { escapeHtml } from "../../lib/markdown/code";
import { HEADING_SELECTOR } from "./toc";

interface Item { level: number; text: string; element: HTMLElement }

export function setupGoto(content: HTMLElement, triggers: (HTMLButtonElement | null)[]): { refresh(): void } {
  let headings: Item[] = [];
  let filtered: Item[] = [];
  let paletteIdx = 0;

  const overlay = document.createElement("div");
  overlay.className = "mv-palette-overlay";
  overlay.hidden = true;
  overlay.innerHTML =
    '<div class="mv-palette" role="dialog" aria-label="Go to heading">' +
    '<input type="text" class="mv-palette-input" placeholder="@ Type to filter headings…" autocomplete="off" />' +
    '<div class="mv-palette-list"></div>' +
    "</div>";
  document.body.appendChild(overlay);
  const paletteInput = overlay.querySelector<HTMLInputElement>(".mv-palette-input")!;
  const paletteList = overlay.querySelector<HTMLElement>(".mv-palette-list")!;

  function collectHeadings(): Item[] {
    if (content.hidden) return [];
    return Array.from(content.querySelectorAll<HTMLElement>(HEADING_SELECTOR)).map((el) => ({
      level: Number(el.tagName[1]),
      text: (el.textContent || "").trim() || "Untitled heading",
      element: el,
    }));
  }

  function refresh(): void {
    headings = collectHeadings();
    const available = headings.length > 0;
    for (const btn of triggers) {
      if (!btn) continue;
      btn.hidden = !available;
      btn.disabled = !available;
    }
    if (!available) closePalette();
  }

  function renderPalette(): void {
    const q = paletteInput.value.toLowerCase().trim();
    filtered = headings.filter((h) => !q || h.text.toLowerCase().includes(q));
    paletteIdx = 0;
    if (!filtered.length) {
      paletteList.innerHTML = '<div class="mv-palette-empty">No matching headings</div>';
      return;
    }
    paletteList.innerHTML = filtered
      .map((h, i) =>
        '<div class="mv-palette-item h' + h.level + (i === 0 ? " active" : "") + '" data-idx="' + i + '">' +
        '<span class="mv-palette-badge">H' + h.level + "</span>" +
        '<span class="mv-palette-text">' + escapeHtml(h.text) + "</span>" +
        "</div>")
      .join("");
  }

  function openPalette(): void {
    refresh();
    if (!headings.length) return;
    paletteInput.value = "";
    renderPalette();
    overlay.hidden = false;
    setTimeout(() => paletteInput.focus(), 0);
  }

  function closePalette(): void {
    overlay.hidden = true;
  }

  function jumpToHeading(h: Item | undefined): void {
    if (!h) return;
    h.element.scrollIntoView({ behavior: "smooth", block: "start" });
    if (h.element.id) history.pushState(null, "", "#" + encodeURIComponent(h.element.id));
    closePalette();
  }

  function setActiveItem(nextIdx: number): void {
    const items = paletteList.querySelectorAll(".mv-palette-item");
    if (!items.length) return;
    items[paletteIdx]?.classList.remove("active");
    paletteIdx = ((nextIdx % items.length) + items.length) % items.length;
    items[paletteIdx]!.classList.add("active");
    items[paletteIdx]!.scrollIntoView({ block: "nearest" });
  }

  paletteInput.addEventListener("input", renderPalette);
  paletteInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closePalette();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItem(paletteIdx + (e.key === "ArrowDown" ? 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      jumpToHeading(filtered[paletteIdx]);
    }
  });
  paletteList.addEventListener("click", (e) => {
    const item = (e.target as Element).closest<HTMLElement>(".mv-palette-item");
    if (item) jumpToHeading(filtered[Number(item.dataset["idx"])]);
  });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePalette();
  });
  for (const btn of triggers) btn?.addEventListener("click", openPalette);
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "o" || e.key === "O")) {
      refresh();
      if (!headings.length) return;
      e.preventDefault();
      e.stopPropagation();
      openPalette();
    }
  }, true);

  refresh();
  return { refresh };
}
