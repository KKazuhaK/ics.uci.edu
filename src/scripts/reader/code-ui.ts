// Behaviour for the copy / collapse buttons that lib/markdown/code.ts puts on
// every code block. One delegated listener per container.
import type { Lang } from "../../lib/i18n";
import { CODE_ICONS, CODE_STRINGS } from "../../lib/markdown/code";

function writeClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
  return new Promise((resolve, reject) => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    ok ? resolve() : reject(new Error("execCommand copy failed"));
  });
}

export function bindCodeUi(container: HTMLElement, lang: Lang, onLayoutChange?: () => void): void {
  const s = CODE_STRINGS[lang];
  const resetTimers = new WeakMap<HTMLElement, ReturnType<typeof setTimeout>>();

  container.addEventListener("click", (event) => {
    const target = event.target as Element;

    const copyBtn = target.closest<HTMLButtonElement>(".code-copy-btn");
    if (copyBtn) {
      const pre = copyBtn.parentElement?.querySelector("pre");
      if (!pre) return;
      writeClipboard((pre.textContent || "").replace(/\n$/, "")).then(() => {
        copyBtn.classList.add("is-copied");
        copyBtn.innerHTML = CODE_ICONS.check + "<span>" + s.copied + "</span>";
        clearTimeout(resetTimers.get(copyBtn));
        resetTimers.set(copyBtn, setTimeout(() => {
          copyBtn.classList.remove("is-copied");
          copyBtn.innerHTML = CODE_ICONS.copy;
        }, 1600));
      }).catch((error) => console.warn("Copy failed.", error));
      return;
    }

    const toggle = target.closest<HTMLButtonElement>(".code-collapse-btn");
    if (toggle) {
      const wrap = toggle.parentElement!;
      const collapsing = !wrap.classList.contains("is-collapsed");
      wrap.classList.toggle("is-collapsed");
      const lines = Number(toggle.dataset["lines"]);
      toggle.innerHTML = CODE_ICONS.chevron + "<span>" + (collapsing ? s.showAll(lines) : s.collapse) + "</span>";
      toggle.setAttribute("aria-expanded", String(!collapsing));
      // After folding a long block, bring its top back into view.
      if (collapsing && wrap.getBoundingClientRect().top < 0) wrap.scrollIntoView({ block: "start" });
      onLayoutChange?.();
    }
  });
}
