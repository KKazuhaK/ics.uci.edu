// Heading ids. TOC anchors and links people have shared depend on these exact rules.
export function plainTextForSlug(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

export function slugifyHeading(text: string, slugCounts: Map<string, number>): string {
  const base =
    plainTextForSlug(text)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s_-]/gu, "")
      .replace(/\s/g, "-")
      .replace(/^-+|-+$/g, "") || "section";

  const seen = slugCounts.get(base) || 0;
  slugCounts.set(base, seen + 1);
  return seen === 0 ? base : base + "-" + seen;
}
