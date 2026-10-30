// KaTeX. `raw` keeps its delimiters ($…$ inline, $$…$$ display), like the
// legacy auto-render setup; bad formulas render KaTeX's red error text.
import type katexType from "katex";

let katex: typeof katexType | null = null;

export async function loadMath(): Promise<void> {
  katex ??= (await import("katex")).default;
}

export function renderMath(raw: string): string {
  if (!katex) throw new Error("loadMath() not awaited");
  const display = raw.startsWith("$$");
  const tex = display ? raw.slice(2, -2) : raw.slice(1, -1);
  return katex.renderToString(tex, { displayMode: display, throwOnError: false });
}
