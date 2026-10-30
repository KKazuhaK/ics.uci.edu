// Entry point for note pages (components/NoteReader.astro).
import { isLang } from "../../lib/i18n";
import { setLangPref } from "../lang-pref";
import { bindCodeUi } from "./code-ui";
import { setupGoto } from "./goto";
import { applyMermaidRendering } from "./mermaid";
import { restoreAfterLangSwitch, setupReadingBar } from "./reading-bar";
import { buildToc } from "./toc";
import { applyVizRendering } from "./viz";

const EDITOR_TRANSFER_KEY = "me-transfer";

export function initNoteReader(): void {
  const root = document.querySelector<HTMLElement>("[data-note-reader]");
  const content = document.getElementById("content");
  if (!root || !content) return;
  const d = root.dataset;
  const lang = isLang(d["lang"]) ? d["lang"] : "en-US";
  setLangPref(lang);

  const goto = setupGoto(content, [document.querySelector<HTMLButtonElement>("#goto-heading-viewer")]);
  bindCodeUi(content, lang, goto.refresh);
  buildToc(content);
  restoreAfterLangSwitch(content);

  Promise.all([
    applyMermaidRendering(content, lang).catch((e) => console.warn("Mermaid rendering failed.", e)),
    applyVizRendering(content, d["vizBase"]!, d["vizVersion"]!).catch((e) => console.warn("viz rendering failed.", e)),
  ]).then(goto.refresh);

  const bar = document.querySelector<HTMLElement>("[data-reading-bar]");
  const intro = document.getElementById("notes-intro");
  if (bar && intro) {
    setupReadingBar({
      content, intro, bar,
      progress: bar.querySelector("[data-reading-progress]"),
      prevUrl: d["prevUrl"], nextUrl: d["nextUrl"], altUrl: d["altUrl"],
    });
  }

  document.querySelector("[data-open-editor]")?.addEventListener("click", async () => {
    // Open the tab synchronously (popup blockers), then hand over the source.
    const tab = window.open("", "_blank");
    try {
      const res = await fetch(d["sourceUrl"]!);
      localStorage.setItem(EDITOR_TRANSFER_KEY, await res.text());
    } catch (e) {
      console.warn("Could not load note source.", e);
    }
    if (tab) tab.location.href = d["editorUrl"]!;
    else window.open(d["editorUrl"], "_blank");
  });

  const backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    window.addEventListener("scroll", () => backToTop.classList.toggle("visible", window.scrollY > 320), { passive: true });
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }
}
