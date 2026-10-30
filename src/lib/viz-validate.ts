// Build-time check of ```viz blocks against the real components in
// public/assets/viz/ (the same check the notes skills' check_md.py runs):
// valid JSON, component exists, its validate() passes, steps() yields frames.
// A broken demo fails the build instead of shipping a red error box.
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const VIZ_DIR = resolve("public/assets/viz");

interface VizModule {
  meta: { params: Record<string, unknown> };
  validate(config: unknown): string[];
  steps(config: unknown): unknown[];
}

const load = <T>(file: string): Promise<T> => import(/* @vite-ignore */ pathToFileURL(file).href);

export async function validateViz(blocks: { name: string; source: string }[], where: string): Promise<void> {
  const problems: string[] = [];
  for (const [i, { name, source }] of blocks.entries()) {
    const tag = `viz block #${i + 1} (${name || "no name"})`;
    if (!/^[a-z][a-z0-9-]*$/.test(name)) {
      problems.push(`${tag}: write \`\`\`viz <component>`);
      continue;
    }
    let config: unknown;
    try {
      config = source.trim() ? JSON.parse(source) : {};
    } catch (e) {
      problems.push(`${tag}: config is not valid JSON (${(e as Error).message})`);
      continue;
    }
    const file = `${VIZ_DIR}/${name}.js`;
    if (!existsSync(file)) {
      problems.push(`${tag}: no component public/assets/viz/${name}.js`);
      continue;
    }
    try {
      const mod = await load<VizModule>(file);
      const errors = mod.validate(config);
      if (errors.length) {
        problems.push(`${tag}: ${errors.join("; ")}`);
        continue;
      }
      const core = await load<{ withDefaults(p: unknown, c: unknown): unknown }>(`${VIZ_DIR}/_core.js`);
      const frames = mod.steps(core.withDefaults(mod.meta.params, config));
      if (!Array.isArray(frames) || !frames.length) problems.push(`${tag}: steps() returned no frames`);
    } catch (e) {
      problems.push(`${tag}: component crashed: ${(e as Error).message}`);
    }
  }
  if (problems.length) throw new Error(`${where}\n  ${problems.join("\n  ")}`);
}
