// Floating reading bar + keyboard shortcuts + keeping your place when switching language.
//   [ / ]  previous / next note      L  switch language
// Shown once the intro card has scrolled away; tucks up while scrolling down
// and returns on scroll up.
import { HEADING_SELECTOR } from "./toc";

const RESUME_KEY = "kzh-lang-switch-resume";

interface Resume {
  /** Path of the page we're switching to, so a stale entry never applies elsewhere. */
  to: string;
  heading: number;
  headingCount: number;
  /** How far past that heading we were, as a fraction of its section. */
  within: number;
  /** Fallback: overall scroll fraction. */
  ratio: number;
}

function headingsOf(content: HTMLElement): HTMLElement[] {
  return Array.from(content.querySelectorAll<HTMLElement>(HEADING_SELECTOR));
}

function docTop(el: HTMLElement): number {
  return el.getBoundingClientRect().top + window.scrollY;
}

function scrollable(): number {
  return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
}

function captureResume(content: HTMLElement, to: string): Resume {
  const hs = headingsOf(content);
  const y = window.scrollY + 130;
  let idx = -1;
  for (let i = 0; i < hs.length; i++) {
    if (docTop(hs[i]!) <= y) idx = i;
    else break;
  }
  let within = 0;
  if (idx >= 0) {
    const start = docTop(hs[idx]!);
    const end = hs[idx + 1] ? docTop(hs[idx + 1]!) : docTop(content) + content.offsetHeight;
    within = Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start)));
  }
  return { to, heading: idx, headingCount: hs.length, within, ratio: window.scrollY / scrollable() };
}

/** Restore the reading position saved by the page we came from (other language). */
export function restoreAfterLangSwitch(content: HTMLElement): void {
  let resume: Resume | null = null;
  try {
    resume = JSON.parse(sessionStorage.getItem(RESUME_KEY) || "null");
    sessionStorage.removeItem(RESUME_KEY);
  } catch {}
  if (!resume || resume.to !== location.pathname || location.hash) return;
  const r = resume;
  const apply = () => {
    const hs = headingsOf(content);
    // Translations share heading structure; if the count differs, fall back to scroll fraction.
    if (r.heading >= 0 && hs.length === r.headingCount && hs[r.heading]) {
      const start = docTop(hs[r.heading]!);
      const end = hs[r.heading + 1] ? docTop(hs[r.heading + 1]!) : docTop(content) + content.offsetHeight;
      window.scrollTo({ top: start + (end - start) * r.within - 130, behavior: "instant" });
    } else {
      window.scrollTo({ top: r.ratio * scrollable(), behavior: "instant" });
    }
  };
  apply();
  // Mermaid / viz blocks change height after they render; settle once more.
  setTimeout(apply, 600);
}

function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

export function setupReadingBar(opts: {
  content: HTMLElement;
  intro: HTMLElement;
  bar: HTMLElement;
  progress: HTMLElement | null;
  prevUrl: string | undefined;
  nextUrl: string | undefined;
  altUrl: string | undefined;
}): void {
  const { content, intro, bar, progress, prevUrl, nextUrl, altUrl } = opts;

  // Language switch links remember where we are.
  document.querySelectorAll<HTMLAnchorElement>("a[data-lang-switch]").forEach((a) => {
    a.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      try {
        sessionStorage.setItem(RESUME_KEY, JSON.stringify(captureResume(content, new URL(a.href).pathname)));
      } catch {}
    });
  });

  // Visibility: after the intro card leaves the viewport.
  let pastIntro = false;
  new IntersectionObserver(([entry]) => {
    pastIntro = !entry!.isIntersecting;
    bar.hidden = !pastIntro;
    if (!pastIntro) bar.classList.remove("is-tucked");
  }).observe(intro);

  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = window.scrollY;
      if (Math.abs(y - lastY) > 6) {
        if (pastIntro) bar.classList.toggle("is-tucked", y > lastY && y > 400);
        lastY = y;
      }
      if (progress) {
        const top = docTop(content);
        const p = (y + window.innerHeight * 0.3 - top) / Math.max(1, content.offsetHeight);
        progress.style.setProperty("--progress", String(Math.min(1, Math.max(0, p))));
      }
    });
  }, { passive: true });

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    if (document.querySelector(".mv-palette-overlay:not([hidden])")) return;
    if (e.key === "[" && prevUrl) location.href = prevUrl;
    else if (e.key === "]" && nextUrl) location.href = nextUrl;
    else if ((e.key === "l" || e.key === "L") && altUrl) {
      document.querySelector<HTMLAnchorElement>("a[data-lang-switch]")?.click();
    } else return;
    e.preventDefault();
  });
}
