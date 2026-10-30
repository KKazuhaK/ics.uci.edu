// Markdown Viewer tool page (src/pages/tools/md-viewer/index.astro).
// Inputs: file picker / drag-drop, clipboard button, page-level paste, and a
// draft handed over from md-editor via localStorage.
import { renderMarkdown } from "../lib/markdown/render";
import { bindCodeUi } from "./reader/code-ui";
import { setupGoto } from "./reader/goto";
import { applyMermaidRendering } from "./reader/mermaid";
import { buildToc, resetToc } from "./reader/toc";
import { applyVizRendering } from "./reader/viz";

const FROM_EDITOR_KEY = "mv-transfer"; // md-editor -> viewer
const TO_EDITOR_KEY = "me-transfer"; // viewer -> md-editor
const MAX_MB = 5;
const ALLOWED = [".md", ".markdown", ".txt"];
const DEFAULT_TITLE = "Markdown Viewer";

export function initMdViewer(): void {
  const root = document.querySelector<HTMLElement>("[data-md-viewer]");
  if (!root) return;
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const content = $<HTMLElement>("content");
  const viewerCard = $<HTMLElement>("viewer-card");
  const prompt = $<HTMLElement>("upload-prompt");
  const openAnother = $<HTMLButtonElement>("open-another");
  const pageTitle = $<HTMLElement>("page-title");
  const zone = $<HTMLLabelElement>("upload-zone");
  const fileInput = $<HTMLInputElement>("file-input");
  const editBtn = $<HTMLButtonElement>("edit-in-editor-upload");
  const d = root.dataset;

  let raw: string | null = null;
  let renderSeq = 0;
  const goto = setupGoto(content, [$<HTMLButtonElement>("goto-heading-viewer-upload")]);
  bindCodeUi(content, "en-US", goto.refresh);

  function setTitle(name: string): void {
    pageTitle.textContent = name;
    document.title = name + " | Kazuha Mo — UC Irvine";
  }

  function showError(msg: string): void {
    let err = document.getElementById("upload-error");
    if (!err) {
      err = document.createElement("div");
      err.id = "upload-error";
      err.className = "error";
      prompt.insertBefore(err, prompt.firstChild);
    }
    err.textContent = msg;
    fileInput.value = "";
  }

  function clearError(): void {
    document.getElementById("upload-error")?.remove();
  }

  async function render(text: string, name: string): Promise<void> {
    const seq = ++renderSeq;
    raw = text;
    setTitle(name);
    openAnother.hidden = false;
    prompt.hidden = true;
    editBtn.querySelector("span")!.textContent = "Open in Editor";
    let html: string;
    try {
      ({ html } = await renderMarkdown(text, { lang: "en-US" }));
    } catch (error) {
      if (seq !== renderSeq) return;
      console.warn("Render failed.", error);
      reset();
      showError("Couldn't render this document (" + (error instanceof Error ? error.message : "unknown error") + "). Check your connection and try again.");
      return;
    }
    if (seq !== renderSeq) return;
    content.innerHTML = html;
    viewerCard.hidden = false;
    buildToc(content);
    goto.refresh();
    await Promise.all([
      applyMermaidRendering(content, "en-US").catch((e) => console.warn("Mermaid rendering failed.", e)),
      applyVizRendering(content, d["vizBase"]!, d["vizVersion"]!).catch((e) => console.warn("viz rendering failed.", e)),
    ]);
    goto.refresh();
  }

  function loadText(text: string, name?: string): void {
    if (!text || !text.trim()) return;
    const bytes = new TextEncoder().encode(text).length;
    if (bytes > MAX_MB * 1024 * 1024) {
      showError(`Pasted content is too large (${(bytes / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_MB} MB.`);
      return;
    }
    clearError();
    const h1 = (text.match(/^#\s+(.+)$/m) || [])[1];
    void render(text, name ?? (h1 ? h1.trim().slice(0, 80) : "Pasted Markdown"));
  }

  function loadFile(file: File | undefined): void {
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED.includes(ext)) {
      showError(`Unsupported file type "${ext}". Please select a .md, .markdown, or .txt file.`);
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      showError(`File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is ${MAX_MB} MB.`);
      return;
    }
    clearError();
    file.text().then((text) => render(text, file.name)).catch(() => showError("Couldn't read that file."));
  }

  function reset(): void {
    renderSeq++;
    raw = null;
    openAnother.hidden = true;
    prompt.hidden = false;
    clearError();
    content.innerHTML = "";
    viewerCard.hidden = true;
    fileInput.value = "";
    editBtn.querySelector("span")!.textContent = "Open Editor";
    setTitle(DEFAULT_TITLE);
    resetToc();
    goto.refresh();
  }

  openAnother.addEventListener("click", reset);
  fileInput.addEventListener("change", () => loadFile(fileInput.files?.[0]));
  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", (e) => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    loadFile(e.dataTransfer?.files[0]);
  });

  $<HTMLButtonElement>("paste-clipboard-btn").addEventListener("click", async () => {
    if (!navigator.clipboard?.readText) {
      showError("Your browser doesn't support reading the clipboard. Use ⌘V / Ctrl+V instead.");
      return;
    }
    try {
      const text = await navigator.clipboard.readText();
      if (!text.trim()) showError("Clipboard is empty.");
      else loadText(text);
    } catch {
      showError("Couldn't read the clipboard. Use ⌘V / Ctrl+V instead.");
    }
  });

  document.addEventListener("paste", (e) => {
    if (prompt.hidden) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.tagName === "TEXTAREA" || t.tagName === "INPUT" || t.isContentEditable)) return;
    const text = e.clipboardData?.getData("text");
    if (!text || !text.trim()) return;
    e.preventDefault();
    loadText(text);
  });

  editBtn.addEventListener("click", () => {
    if (raw) {
      try { localStorage.setItem(TO_EDITOR_KEY, raw); } catch {}
    }
    window.open(d["editorUrl"], "_blank");
  });

  const backToTop = $<HTMLButtonElement>("back-to-top");
  window.addEventListener("scroll", () => backToTop.classList.toggle("visible", window.scrollY > 320), { passive: true });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  // Draft handed over from md-editor's "Open in Viewer".
  let transferred: string | null = null;
  try {
    transferred = localStorage.getItem(FROM_EDITOR_KEY);
    localStorage.removeItem(FROM_EDITOR_KEY);
  } catch {}
  if (transferred) loadText(transferred, "Transferred Document");
}
