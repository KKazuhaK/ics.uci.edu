// ```mermaid blocks → rendered diagrams in a GitHub-style pan/zoom viewer.
// Ported from the legacy md-viewer; mermaid itself is bundled and loaded on demand.
import type { Lang } from "../../lib/i18n";

let mermaidIdCounter = 0;

function currentMermaidTheme(): "dark" | "default" {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "default";
}

const LUCIDE = {
  plus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  minus: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
  reset: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
};

function attachMermaidPanZoom(wrapper: HTMLElement, svg: SVGSVGElement, lang: Lang): void {
  const stage = document.createElement("div");
  stage.className = "mermaid-stage";
  stage.appendChild(svg);

  const controls = document.createElement("div");
  controls.className = "mermaid-controls";
  controls.innerHTML =
    '<button type="button" data-action="zoom-in" title="Zoom in" aria-label="Zoom in">' + LUCIDE.plus + "</button>" +
    '<button type="button" data-action="zoom-out" title="Zoom out" aria-label="Zoom out">' + LUCIDE.minus + "</button>" +
    '<button type="button" data-action="reset" title="Reset view" aria-label="Reset view">' + LUCIDE.reset + "</button>";

  const indicator = document.createElement("div");
  indicator.className = "mermaid-zoom-indicator";
  indicator.textContent = "100%";

  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const zoomKey = isMac ? "⌘" : "Ctrl";
  const hint = document.createElement("div");
  hint.className = "mermaid-zoom-hint";
  hint.textContent = lang === "zh-CN" ? "按住 " + zoomKey + " 滚动以缩放" : "Hold " + zoomKey + " and scroll to zoom";

  const resizeHandle = document.createElement("div");
  resizeHandle.className = "mermaid-resize-handle";
  resizeHandle.title = "Drag to resize";

  wrapper.append(stage, controls, indicator, hint, resizeHandle);

  svg.removeAttribute("style");
  const vb = svg.viewBox && svg.viewBox.baseVal;
  const naturalW = vb && vb.width ? vb.width : parseFloat(svg.getAttribute("width") || "") || 800;
  const naturalH = vb && vb.height ? vb.height : parseFloat(svg.getAttribute("height") || "") || 600;
  svg.setAttribute("width", String(naturalW));
  svg.setAttribute("height", String(naturalH));

  const MIN_SCALE = 0.2;
  const MAX_SCALE = 6;
  let scale = 1;
  let tx = 0;
  let ty = 0;

  function apply(): void {
    svg.style.transform = "translate(" + tx + "px, " + ty + "px) scale(" + scale + ")";
    indicator.textContent = Math.round(scale * 100) + "%";
  }

  function defaultScale(): number {
    const stageW = stage.clientWidth || 1;
    let initial = 1;
    if (naturalW * initial > stageW * 0.95) initial = (stageW * 0.92) / naturalW;
    return Math.max(MIN_SCALE, Math.min(MAX_SCALE, initial));
  }

  function defaultView(): void {
    const stageW = stage.clientWidth || 1;
    const stageH = stage.clientHeight || 1;
    scale = defaultScale();
    tx = (stageW - naturalW * scale) / 2;
    const spare = stageH - naturalH * scale;
    ty = spare > 0 ? spare / 2 : Math.min(0, spare / 2);
    apply();
  }

  // Shrink the block to the diagram's height at the default scale; the CSS
  // height (30rem / 22rem mobile) stays the upper bound. Runs once, before any
  // manual resize, so a short diagram doesn't sit in a mostly empty box.
  const AUTO_FIT_PAD = 24;
  const AUTO_FIT_MIN = 160;
  function autoFitHeight(): void {
    const cap = wrapper.offsetHeight;
    const chrome = cap - stage.clientHeight; // resize-handle strip
    const wanted = Math.ceil(naturalH * defaultScale() + AUTO_FIT_PAD * 2 + chrome);
    const fitted = Math.max(AUTO_FIT_MIN, Math.min(cap, wanted));
    if (fitted < cap) wrapper.style.height = fitted + "px";
  }

  function initView(): void {
    autoFitHeight();
    defaultView();
  }

  function zoomAt(factor: number, originX: number, originY: number): void {
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    const realFactor = newScale / scale;
    if (realFactor === 1) return;
    tx = originX - (originX - tx) * realFactor;
    ty = originY - (originY - ty) * realFactor;
    scale = newScale;
    apply();
  }

  let dragging = false;
  let startX = 0, startY = 0, startTx = 0, startTy = 0;
  let activePointer: number | null = null;

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    dragging = true;
    activePointer = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startTx = tx;
    startTy = ty;
    stage.classList.add("is-grabbing");
    try { stage.setPointerCapture(event.pointerId); } catch {}
  });

  stage.addEventListener("pointermove", (event) => {
    if (!dragging || event.pointerId !== activePointer) return;
    tx = startTx + (event.clientX - startX);
    ty = startTy + (event.clientY - startY);
    apply();
  });

  function endDrag(event: PointerEvent): void {
    if (!dragging || event.pointerId !== activePointer) return;
    dragging = false;
    activePointer = null;
    stage.classList.remove("is-grabbing");
  }
  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", endDrag);

  // Plain wheel scrolls the page (like GitHub); zoom needs Ctrl/⌘ or a trackpad pinch (reported as ctrlKey).
  let hintTimer: ReturnType<typeof setTimeout> | undefined;
  stage.addEventListener("wheel", (event) => {
    if (!event.ctrlKey && !event.metaKey) {
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        hint.classList.add("is-visible");
        clearTimeout(hintTimer);
        hintTimer = setTimeout(() => hint.classList.remove("is-visible"), 1200);
      }
      return;
    }
    event.preventDefault();
    hint.classList.remove("is-visible");
    const rect = stage.getBoundingClientRect();
    // Proportional to delta: a mouse notch (~100) ≈ ×1.13, a pinch tick (a few px) is gentle
    const factor = Math.exp(-Math.max(-50, Math.min(50, event.deltaY)) * 0.0025);
    zoomAt(factor, event.clientX - rect.left, event.clientY - rect.top);
  }, { passive: false });

  controls.addEventListener("click", (event) => {
    const target = (event.target as Element).closest("button");
    if (!target) return;
    const action = target.dataset["action"];
    const cx = stage.clientWidth / 2;
    const cy = stage.clientHeight / 2;
    if (action === "zoom-in") zoomAt(1.25, cx, cy);
    else if (action === "zoom-out") zoomAt(1 / 1.25, cx, cy);
    else if (action === "reset") defaultView();
  });

  let resizing = false;
  let resizeStartY = 0, resizeStartH = 0;

  resizeHandle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    resizing = true;
    resizeStartY = event.clientY;
    resizeStartH = wrapper.offsetHeight;
    resizeHandle.classList.add("is-resizing");
    try { resizeHandle.setPointerCapture(event.pointerId); } catch {}
    event.preventDefault();
  });

  resizeHandle.addEventListener("pointermove", (event) => {
    if (!resizing) return;
    const delta = event.clientY - resizeStartY;
    const minH = Math.min(240, resizeStartH);
    const maxH = Math.max(minH + 60, window.innerHeight - 80);
    wrapper.style.height = Math.max(minH, Math.min(maxH, resizeStartH + delta)) + "px";
  });

  function endResize(event: PointerEvent): void {
    if (!resizing) return;
    resizing = false;
    resizeHandle.classList.remove("is-resizing");
    try { resizeHandle.releasePointerCapture(event.pointerId); } catch {}
  }
  resizeHandle.addEventListener("pointerup", endResize);
  resizeHandle.addEventListener("pointercancel", endResize);

  if (stage.clientWidth > 0 && stage.clientHeight > 0) initView();
  else requestAnimationFrame(initView);
}

export async function applyMermaidRendering(container: HTMLElement, lang: Lang): Promise<void> {
  const blocks = Array.from(container.querySelectorAll<HTMLElement>('pre[data-language="mermaid"]'));
  if (!blocks.length) return;

  let mermaid: typeof import("mermaid").default;
  try {
    mermaid = (await import("mermaid")).default;
  } catch (error) {
    console.warn("Mermaid failed to load. Falling back to plain code blocks.", error);
    return;
  }

  try {
    mermaid.initialize({ startOnLoad: false, theme: currentMermaidTheme(), securityLevel: "loose", fontFamily: "Inter, system-ui, sans-serif" });
  } catch (error) {
    console.warn("Mermaid initialize failed.", error);
  }

  for (const pre of blocks) {
    const source = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
    const id = "mermaid-" + ++mermaidIdCounter + "-" + Date.now().toString(36);
    const wrapper = document.createElement("div");
    wrapper.className = "mermaid-block";

    try {
      const result = await mermaid.render(id, source);
      const template = document.createElement("template");
      template.innerHTML = result.svg.trim();
      const svgEl = template.content.querySelector("svg");
      if (!svgEl) throw new Error("Mermaid produced no SVG element");
      attachMermaidPanZoom(wrapper, svgEl, lang);
      try { result.bindFunctions?.(wrapper); } catch {}
    } catch (error) {
      console.warn("Mermaid rendering failed.", error);
      wrapper.classList.add("mermaid-error");
      const errDetail = document.createElement("div");
      errDetail.className = "mermaid-error-msg";
      errDetail.textContent = error instanceof Error && error.message ? error.message : "Mermaid render failed";
      const fallbackPre = document.createElement("pre");
      const fallbackCode = document.createElement("code");
      fallbackCode.textContent = source;
      fallbackPre.appendChild(fallbackCode);
      wrapper.append(errDetail, fallbackPre);
    }

    pre.replaceWith(wrapper);
    const orphan = document.getElementById(id);
    if (orphan && !wrapper.contains(orphan)) orphan.remove();
  }
}
