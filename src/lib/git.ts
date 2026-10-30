// Last-edited dates for notes, from git history (follows renames).
// Commits listed in .lastmod-ignore-revs (bulk moves/reformatting) don't count as edits.
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";

const ignored = new Set(
  existsSync(".lastmod-ignore-revs")
    ? readFileSync(".lastmod-ignore-revs", "utf8").split("\n").map((l) => l.replace(/#.*/, "").trim()).filter(Boolean)
    : [],
);

function git(args: string[]): string {
  try {
    return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
  } catch {
    return "";
  }
}

const cache = new Map<string, Date>();

export function lastModified(path: string): Date {
  let date = cache.get(path);
  if (!date) cache.set(path, (date = lookup(path)));
  return date;
}

function lookup(path: string): Date {
  if (git(["status", "--porcelain", "--", path]).trim()) return statSync(path).mtime;
  for (const line of git(["log", "--follow", "--format=%H %cI", "--", path]).split("\n")) {
    const [hash, date] = line.split(" ");
    if (hash && date && ![...ignored].some((rev) => hash.startsWith(rev))) return new Date(date);
  }
  return statSync(path).mtime;
}

// Both languages read the date in Irvine time, whatever machine runs the build.
const TZ = "America/Los_Angeles";

export function formatLastModified(date: Date, lang: "en-US" | "zh-CN"): string {
  if (lang === "zh-CN") {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: TZ, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(date).map((x) => [x.type, x.value]));
    return `最后编辑于 ${p["year"]} 年 ${p["month"]} 月 ${p["day"]} 日`;
  }
  return "Last edited on " + date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: TZ });
}
