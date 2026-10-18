#!/usr/bin/env python3
"""
generate-sitemap.py  –  Auto-generate sitemap.json

Scans HTML pages, parses embedded notesCatalog / weekCatalog JS arrays,
and assembles a structured sitemap.json for the Ask AI knowledge base.

  - Course notes and demo notes are auto-discovered from the filesystem
  - Descriptions from pageCopy / weekCatalog are extracted automatically
  - Hand-edited descriptions in sitemap.json are preserved on regeneration
  - New tool directories are detected and flagged

Usage:  python3 tools/generate-sitemap.py
"""

import json, re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "sitemap.json"
BASE_URL = "https://ics.uci.edu/~kazuhak"

# ─── Known page descriptions (edit here when adding / renaming pages) ─

PAGE_META = {
    "/": {
        "title": "Home",
        "description": (
            "Kazuha Mo's personal website at UC Irvine. "
            "Landing page with navigation to Notes, Tools, and About sections."
        ),
    },
    "/about.html": {
        "title": "About Me",
        "description": "Personal biography, background, and contact information for Kazuha Mo.",
    },
    "/notes/": {
        "title": "Notes",
        "description": "Hub for all academic notes, including course notes and LA/TA demo notes.",
    },
    "/notes/course_notes/": {
        "title": "Course Notes",
        "description": "Index of all course notes, organized by course. Available in English and Chinese.",
    },
    "/notes/demo_notes/": {
        "title": "LA/TA Demo Notes",
        "description": (
            "Interactive demonstrations created for LA/TA sessions, "
            "with step-by-step code walkthroughs."
        ),
    },
    "/tools/": {
        "title": "Tools",
        "description": (
            "Hub for web-based utilities including Markdown Viewer, "
            "Markdown Editor, Code Runner, Speed Test, and AI Chat."
        ),
    },
    "/tools/md-viewer/": {
        "title": "Markdown Viewer",
        "description": (
            "Universal markdown renderer with syntax highlighting (Shiki), "
            "KaTeX math formulas, Table of Contents sidebar, and file upload support."
        ),
    },
    "/tools/md-editor/": {
        "title": "Markdown Editor",
        "description": (
            "Markdown editor with live preview, syntax highlighting (Shiki), "
            "KaTeX math, and export support."
        ),
    },
    "/tools/code-runner/": {
        "title": "Code Runner",
        "description": "Browser-based code runner supporting Python, C++, Java, and JavaScript execution, plus a Web mode (HTML/CSS/JS) with live preview and console.",
    },
    "/tools/ask-ai/": {
        "title": "Ask AI",
        "description": (
            "Free-form AI chat (sign-in required). "
            "Supports Markdown rendering and KaTeX math."
        ),
    },
    "/tools/speedtest/": {
        "title": "Speed Test",
        "description": "HTML5-based internet speed test tool for testing download, upload, ping, and jitter.",
    },
}


# ━━ Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _read(p):
    return Path(p).read_text("utf-8", errors="replace")


def _balanced(text, pos):
    """Return balanced [...] or {...} substring starting at *pos*."""
    open_c = text[pos]
    close_c = "]" if open_c == "[" else "}"
    depth, i, n = 0, pos, len(text)
    while i < n:
        c = text[i]
        if c == open_c:
            depth += 1
        elif c == close_c:
            depth -= 1
            if depth == 0:
                return text[pos : i + 1]
        elif c in ('"', "'"):
            q, i = c, i + 1
            while i < n and text[i] != q:
                if text[i] == "\\":
                    i += 1
                i += 1
        i += 1
    return None


def _js2json(s):
    """Best-effort JS object/array literal -> JSON string."""
    s = re.sub(r"//.*$", "", s, flags=re.MULTILINE)
    s = re.sub(r"/\*.*?\*/", "", s, flags=re.DOTALL)
    # Split into string literals and code; only transform code parts so we
    # don't accidentally quote things like `, word::other` inside a string.
    parts = re.split(r'("(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\')', s)
    for i in range(0, len(parts), 2):
        # Quote bare keys: word: -> "word":
        parts[i] = re.sub(r"(?<=[{\[,\n])\s*(\w+)\s*:", r' "\1":', parts[i])
        # Remove trailing commas before } or ]
        parts[i] = re.sub(r",(\s*[}\]])", r"\1", parts[i])
    return "".join(parts)


def _jsvar(html, name):
    """Extract JS var/const/let *name* = [...] or {...} and parse to Python."""
    m = re.search(rf"(?:const|var|let)\s+{re.escape(name)}\s*=\s*([{{\[])", html)
    if not m:
        return None
    raw = _balanced(html, m.start(1))
    if not raw:
        return None
    try:
        return json.loads(_js2json(raw))
    except json.JSONDecodeError:
        return None


def _title(html):
    """First segment of <title> (before | or site-name suffix)."""
    m = re.search(r"<title>([^<]+)</title>", html)
    return m.group(1).split("|")[0].strip() if m else "Untitled"


def _load_existing_descs():
    """Load descriptions from current sitemap.json for preservation."""
    if not OUTPUT.exists():
        return {}
    try:
        data = json.loads(OUTPUT.read_text("utf-8"))
    except (json.JSONDecodeError, OSError):
        return {}
    descs = {}
    for p in data.get("pages", []):
        if "description" in p:
            descs[p["path"]] = p["description"]
        for d in p.get("demos", []):
            if "description" in d:
                descs[d["path"]] = d["description"]
    return descs


# ━━ About Page ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _parse_about():
    p = ROOT / "about.html"
    if not p.exists():
        return None
    html = _read(p)

    grab = lambda pat: (re.search(pat, html).group(1).strip() if re.search(pat, html) else "")

    name  = grab(r'class="about-title"[^>]*>([^<]+)</h1>')
    email = grab(r'mailto:([^"]+)')

    # Degree + school come from the same "X \u00b7 Y" line in .about-role
    degree = ""
    school = "University of California, Irvine"
    role = grab(r'class="about-role"[^>]*>([^<]+)</p>')
    if role:
        parts = [s.strip() for s in role.replace("&middot;", "\u00b7").split("\u00b7")]
        if parts and parts[0]:
            degree = parts[0]
        if len(parts) >= 2:
            school = parts[-1]

    # Bio paragraphs from the .about-bio card (balanced-div slice)
    bio = []
    opener = re.search(r'<div\b[^>]*class="[^"]*\babout-bio\b[^"]*"[^>]*>', html)
    if opener:
        i, depth, n = opener.end(), 1, len(html)
        while i < n and depth > 0:
            m = re.search(r'</?div\b', html[i:])
            if not m:
                break
            j = i + m.start()
            depth += 1 if html[j + 1] != "/" else -1
            i = j + m.end() - m.start()
        panel_html = html[opener.end():j] if opener and depth == 0 else ""
        for m in re.finditer(r"<p[^>]*>(.+?)</p>", panel_html, re.DOTALL):
            t = re.sub(r"<[^>]+>", "", m.group(1))
            t = t.replace("&mdash;", "\u2014").replace("&middot;", "\u00b7").strip()
            if len(t) > 50:
                bio.append(t)

    links = {}
    gh = grab(r'github\.com/([^"]+)')
    if gh:
        links["github"] = f"https://github.com/{gh.rstrip('/')}"
    ws = grab(r'(https://www\.kazuhahub\.com[^"]*)')
    if ws:
        links["website"] = ws

    return {
        "name": name, "degree": degree, "school": school,
        "email": email, "bio": bio[:3], "links": links,
    }


# ━━ Course Notes Scanner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _scan_course(cdir, existing_descs):
    idx = cdir / "index.html"
    if not idx.exists():
        return None
    html  = _read(idx)
    course = cdir.name
    title  = _title(html)

    # Description priority: pageCopy > existing > auto-generated
    desc = ""
    pc = _jsvar(html, "pageCopy")
    if pc and "en-US" in pc:
        desc = pc["en-US"].get("heroPrimary", "")
    if not desc:
        desc = existing_descs.get(f"/notes/course_notes/{course}/", "")
    if not desc:
        desc = f"Course notes for {title.replace(' Notes', '')}."

    # Parse notesCatalog
    catalog   = _jsvar(html, "notesCatalog") or []
    md_on_disk = {f.name for f in cdir.glob("*.md")}

    notes = []
    for entry in catalog:
        avail = entry.get("availability", {})
        if not avail:
            continue  # "Coming Soon" slot
        langs, base = [], ""
        for lang in sorted(avail):
            fname = avail[lang].get("note", "")
            if fname in md_on_disk:
                langs.append(lang)
                if not base:
                    base = re.sub(r"_[a-z]{2}-[A-Z]{2}\.md$", "", fname)
        if not base or not langs:
            continue
        week = entry.get("week", "")
        # Default language for the viewer URL: prefer zh-CN, then en-US, else first available
        default_lang = "zh-CN" if "zh-CN" in langs else ("en-US" if "en-US" in langs else langs[0])
        default_note = f"{base}_{default_lang}.md"
        notes.append({
            "file": base,
            "title": f"{week} Notes",
            "languages": langs,
            "viewer_url": f"/tools/md-viewer/?kind=course_notes&course={course}&lang={default_lang}&note={default_note}",
        })

    out = {"path": f"/notes/course_notes/{course}/", "title": title,
           "description": desc, "category": "notes"}
    if notes:
        out["notes"] = notes
    return out


# ━━ Demo Notes Scanner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def _scan_demos(ddir, existing_descs):
    idx = ddir / "index.html"
    if not idx.exists():
        return None
    html   = _read(idx)
    course = ddir.name
    title  = _title(html)

    # Description: existing > auto-generated
    rel = f"/notes/demo_notes/{course}/"
    desc = existing_descs.get(rel, f"Interactive demos for {title.replace(' Demos', '')}.")

    catalog    = _jsvar(html, "weekCatalog") or []
    week_files = set()
    demos      = []

    for w in catalog:
        if w.get("hidden"):
            continue
        f = w.get("file", "")
        if not f or not (ddir / f).exists():
            continue
        week_files.add(f)
        dtitle = _title(_read(ddir / f))
        d = {"path": f"/notes/demo_notes/{course}/{f}", "title": dtitle}
        if w.get("summary"):
            d["description"] = w["summary"]
        demos.append(d)

    # Standalone demo pages (not in weekCatalog)
    for hp in sorted(ddir.glob("*.html")):
        if hp.name == "index.html" or hp.name in week_files:
            continue
        dtitle = _title(_read(hp))
        dpath  = f"/notes/demo_notes/{course}/{hp.name}"
        demos.append({
            "path": dpath,
            "title": dtitle,
            "description": existing_descs.get(dpath, f"Interactive demo: {dtitle}."),
        })

    out = {"path": rel, "title": title, "description": desc, "category": "notes"}
    if demos:
        out["demos"] = demos
    return out


# ━━ Generator ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def generate():
    about          = _parse_about()
    existing_descs = _load_existing_descs()
    pages          = []

    def _meta(path):
        m   = PAGE_META[path]
        cat = "notes" if path.startswith("/notes") else "tools" if path.startswith("/tools") else "main"
        return {"path": path, "title": m["title"], "description": m["description"], "category": cat}

    # ── Main section ──
    pages.append(_meta("/"))
    ap = _meta("/about.html")
    if about:
        ap["content"] = about
    pages.append(ap)

    # ── Notes section ──
    pages.append(_meta("/notes/"))
    pages.append(_meta("/notes/course_notes/"))

    cr = ROOT / "notes" / "course_notes"
    if cr.is_dir():
        for d in sorted(cr.iterdir()):
            if d.is_dir():
                e = _scan_course(d, existing_descs)
                if e:
                    pages.append(e)

    pages.append(_meta("/notes/demo_notes/"))

    dr = ROOT / "notes" / "demo_notes"
    if dr.is_dir():
        for d in sorted(dr.iterdir()):
            if d.is_dir():
                e = _scan_demos(d, existing_descs)
                if e:
                    pages.append(e)

    # ── Tools section ──
    pages.append(_meta("/tools/"))
    known_tools = {"/tools/"}
    for p in PAGE_META:
        if p.startswith("/tools/") and p != "/tools/":
            pages.append(_meta(p))
            known_tools.add(p)

    # Auto-discover new tools
    tr = ROOT / "tools"
    if tr.is_dir():
        for d in sorted(tr.iterdir()):
            if d.is_dir() and (d / "index.html").exists():
                rel = f"/tools/{d.name}/"
                if rel not in known_tools:
                    t = _title(_read(d / "index.html"))
                    desc = existing_descs.get(rel, f"{t} tool.")
                    pages.append({"path": rel, "title": t, "description": desc, "category": "tools"})
                    print(f"  \u2139  New tool: {rel} \u2014 add to PAGE_META for a better description")

    # ── Assemble ──
    site = {
        "name": f"{about['name']} - UC Irvine" if about else "Kazuha Mo - UC Irvine",
        "base_url": BASE_URL,
        "owner": about["name"] if about else "Kazuha Mo",
        "affiliation": "University of California, Irvine",
        "email": about["email"] if about else "kazuhak@uci.edu",
        "updated": str(date.today()),
    }
    return {"site": site, "pages": pages}


# ━━ Entry point ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

def main():
    sm = generate()
    OUTPUT.write_text(json.dumps(sm, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    np = len(sm["pages"])
    nn = sum(len(p.get("notes", [])) for p in sm["pages"])
    nd = sum(len(p.get("demos", [])) for p in sm["pages"])
    print(f"\u2713 {OUTPUT.name}: {np} pages, {nn} notes, {nd} demos  ({date.today()})")


if __name__ == "__main__":
    main()
