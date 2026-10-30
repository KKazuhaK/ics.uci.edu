// ```viz <component> blocks → interactive step-through demos. Components and
// the player live in public/assets/viz/ (shared site-wide) and are imported at
// runtime; configs were already validated at build time (lib/viz-validate.ts).
import { escapeHtml } from "../../lib/markdown/code";

interface Player {
  mount(wrapper: HTMLElement, mod: unknown, config: unknown, source: string): void;
  renderError(wrapper: HTMLElement, problems: string[], source: string): void;
}

/** `version` busts the HTTP cache once per deploy, so a note using a newly
 *  added component param never meets a stale component. */
export async function applyVizRendering(container: HTMLElement, vizBase: string, version: string): Promise<void> {
  const blocks = Array.from(container.querySelectorAll<HTMLElement>('pre[data-language="viz"]'));
  if (!blocks.length) return;
  const at = (file: string) => new URL(vizBase + file + "?v=" + version, document.baseURI).href;

  let player: Player | null = null;
  let playerError: unknown = null;
  try {
    player = await import(/* @vite-ignore */ at("_player.js"));
  } catch (error) {
    playerError = error;
  }

  for (const pre of blocks) {
    const name = pre.dataset["viz"] || "";
    const source = pre.textContent || "";
    const wrapper = document.createElement("div");
    const problems: string[] = [];
    let config: unknown = null;

    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      problems.push(name ? 'invalid component name "' + name + '"' : "missing component name: write ```viz <component>");
    }
    try {
      config = source.trim() ? JSON.parse(source) : {};
    } catch (error) {
      problems.push("config is not valid JSON: " + (error as Error).message);
    }

    let mod: unknown = null;
    if (!problems.length) {
      try {
        mod = await import(/* @vite-ignore */ at(name + ".js"));
      } catch {
        problems.push('unknown component "' + name + '" (no assets/viz/' + name + ".js)");
      }
    }

    if (!player) {
      console.warn("viz player failed to load.", playerError);
      wrapper.className = "mermaid-block mermaid-error";
      wrapper.innerHTML = '<div class="mermaid-error-msg">Interactive demo failed to load.</div><pre><code>' + escapeHtml(source) + "</code></pre>";
    } else if (problems.length) {
      player.renderError(wrapper, problems, source);
    } else {
      try {
        player.mount(wrapper, mod, config, source);
      } catch (error) {
        console.warn("viz render failed.", error);
        player.renderError(wrapper, [error instanceof Error && error.message ? error.message : "render failed"], source);
      }
    }
    pre.replaceWith(wrapper);
  }
}
