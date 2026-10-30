// The tools shelf: Tools page, homepage tools card, sitemap.json.
export interface Tool {
  slug: string; // URL under tools/ and the homepage chip label
  name: string;
  desc: string; // Tools page card
  about: string; // sitemap.json (fed to the AI assistant)
  beta?: boolean;
  color: string;
  icon: string; // Lucide SVG inner markup
}

export const TOOLS: Tool[] = [
  {
    slug: "md-viewer",
    name: "Markdown Viewer",
    desc: "Render Markdown course notes in a clean layout — no install, no server.",
    about: "Universal markdown renderer with syntax highlighting (Shiki), KaTeX math, Mermaid diagrams, Table of Contents sidebar, and file upload / paste support.",
    color: "#58a6ff",
    icon: '<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
  },
  {
    slug: "md-editor",
    name: "Markdown Editor",
    desc: "Split-pane editor with live rendering, syntax highlighting, KaTeX math, one-click export.",
    about: "Markdown editor with live preview, syntax highlighting (Shiki), KaTeX math, and export support.",
    color: "#7ee787",
    icon: '<path d="M15.707 21.293a1 1 0 0 1-1.414 0l-1.586-1.586a1 1 0 0 1 0-1.414l5.586-5.586a1 1 0 0 1 1.414 0l1.586 1.586a1 1 0 0 1 0 1.414z"/><path d="m18 13-1.375-6.874a1 1 0 0 0-.746-.776L3.235 2.028a1 1 0 0 0-1.207 1.207L5.35 15.879a1 1 0 0 0 .776.746L13 18"/><path d="m2.3 2.3 7.286 7.286"/><circle cx="11" cy="11" r="2"/>',
  },
  {
    slug: "code-runner",
    name: "Code Runner",
    desc: "Write and run Python, C++, Java, JavaScript in your browser, or build a web page (HTML/CSS/JS) with live preview and console.",
    about: "Browser-based code runner supporting Python, C++, Java, and JavaScript execution, plus a Web mode (HTML/CSS/JS) with live preview and console.",
    beta: true,
    color: "#f2cc60",
    icon: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  },
  {
    slug: "ask-ai",
    name: "Ask AI",
    desc: "Chat with an AI assistant. Ask questions, upload files, get coursework help. SSO or access code.",
    about: "Free-form AI chat (sign-in required). Supports Markdown rendering and KaTeX math.",
    beta: true,
    color: "#bc8cff",
    icon: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  },
  {
    slug: "speedtest",
    name: "Speed Test",
    desc: "Self-hosted OpenSpeedTest — download, upload, ping, jitter from the browser.",
    about: "HTML5-based internet speed test tool for testing download, upload, ping, and jitter.",
    color: "#ff7b72",
    icon: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  },
];
