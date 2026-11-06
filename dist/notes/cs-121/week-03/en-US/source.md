# CS 121: Information Retrieval — Week 3: Web Crawling

## Table of Contents

- [1. The Basic Crawl Algorithm](#1-the-basic-crawl-algorithm)
- [2. Permission to Crawl: robots.txt](#2-permission-to-crawl-robotstxt)
- [3. Sitemaps: Information to Crawlers](#3-sitemaps-information-to-crawlers)
- [4. Why the Basic Algorithm Is Not Enough](#4-why-the-basic-algorithm-is-not-enough)
- [5. Politeness and Performance](#5-politeness-and-performance)
- [6. Crawler Traps](#6-crawler-traps)
- [7. Duplicates, Data Noise, Client-Side Scripting and the Deep Web](#7-duplicates-data-noise-client-side-scripting-and-the-deep-web)
- [8. When to Crawl Again: Freshness and Age](#8-when-to-crawl-again-freshness-and-age)
- [9. Distributed Crawling](#9-distributed-crawling)
- [10. Other Types of Crawling: Focused, Desktop, Document Feeds](#10-other-types-of-crawling-focused-desktop-document-feeds)
- [11. Ethics and the Law](#11-ethics-and-the-law)
- [12. Privacy: What Your Crawler Leaves Behind](#12-privacy-what-your-crawler-leaves-behind)
- [13. Copyright, Fair Use and Legal Cases](#13-copyright-fair-use-and-legal-cases)
- [14. In-class Notes & Assignment Tips](#14-in-class-notes--assignment-tips)
- [15. Worked Examples (with Solutions)](#15-worked-examples-with-solutions)
- [16. Quick Reference & Top 5 Things to Remember](#16-quick-reference--top-5-things-to-remember)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Oct 14
> Built from the Lecture 6.5 (in class), 7, 8 and 9 slides (the YuJa videos, including the tmux bonus video, are not included). Organized by concept, not by lecture.
> Slides credit Profs. C. Lopes, A. Krone-Martins, C. Manning, P. Nayak, H. Schütze and others, and Addison Wesley (2008) for the crawler figures.
> 📖 Readings this week: [Croft et al., *Search Engines: IR in Practice*, Ch 3 Crawls and Feeds](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

> 📅 **Class logistics**: **Quiz 1 is next Wednesday, Oct 21, in class**: online via Canvas, on your laptop, in the lecture hall. It covers the material up to the quiz date, open-book and open-slides; you can't access Canvas from more than two IPs (L6.5 p9–10).
> **Assignment 2 (crawler) is open**: the cache server is online, groups of 1–4 students (L6.5 p3–8).
> A2 **Test period** until Oct 23, 9:00 pm — you must develop your crawler during the test period. The server stays up the weekend of Oct 17–18, but with no guarantee it comes back if it dies.
> A2 **Deployment period** from Oct 26, 8:00 am, until **Oct 30, 9 pm** (Canvas due date; the last frame, p8, says "Nov 30th" — a typo, the frames before say Oct 30). Crawl during deployment, at most 3 times. The server may be down for up to ~8 h in the test period and ~4 h in deployment (unless it dies at night).
> You **and all your group members** must come to the A2 oral interview.
> A1 bonus point: record a short video explaining your code and reasoning, and upload it to Canvas (the link comes next week, L6.5 p2).

---

## 1. The Basic Crawl Algorithm

Week 2 introduced the crawler: a program that, like a person clicking around, gets HTML pages and follows their links ([Week 2 §14](week-02.en-US.md#14-toward-web-crawling-what-counts-as-an-algorithm)). On the architecture map, crawling is the **Text Acquisition** box ([Week 1 §10](week-01.en-US.md#10-search-engine-architecture); L7 p3, p25 · L6.5 p12). This week covers the full algorithm and everything that goes wrong with it.

The basic crawl algorithm (L7 p4–9, built one bullet per frame):

1. Initialize a queue of URLs — the **seeds**.
2. Repeat until there are no more URLs in the queue:
   - get one URL from the queue;
   - if the page can be crawled, fetch the associated page;
   - store a representation of the page;
   - extract the URLs from the page and add them to the queue.

The queue is called the **frontier**. L7 p10–12 draws three zones — **crawled web pages**, the **URL frontier**, **the rest of the web** — with the web spider starting from the seed pages: each fetch moves a page into "crawled", and its links pull new pages from "the rest of the web" into the frontier.

The pseudocode, in Croft's version (L7 p13–15, p26 · L6.5 p13, p15 · L9 p3, p23):

```text
procedure CrawlerThread(frontier)
    while not frontier.done() do
        website ← frontier.nextSite()
        url ← website.nextURL()
        if website.permitsCrawl(url) then
            text ← retrieveURL(url)
            storeDocument(url, text)
            for each url in parse(text) do
                frontier.addURL(url)
            end for
        end if
        frontier.releaseSite(website)
    end while
end procedure
```

Two major jobs: **download web pages if authorized, and discover new URLs** (L9 p3). L7 p14–15 highlights `website.permitsCrawl(url)` — *how do you know if the website allows you to crawl?* ([section 2](#2-permission-to-crawl-robotstxt)). The frontier hands out a *site* first, then a URL from it; that's where politeness lives ([section 5](#5-politeness-and-performance)).

"How the crawler sees the web" (L9 p4, adapted from Addison Wesley) shows four hosts with three pages each (`www.cs.umass.edu`, `www.bbc.co.uk`, `www.whitehouse.gov`, `www.cnn.com`), links inside and across hosts, and one machine, `crawler.searchengine.com`, talking to all four; arrows mark `nextSite()` and `nextURL()`. The demo crawls that graph (the slide gives no seeds; I used the umass and cnn index pages). Step through it, or edit the graph and press Run:

```viz crawl-frontier
{"title": "Basic crawl (L7 p4–15) over “How the crawler sees the web” (L9 p4)", "web": "www.cs.umass.edu/index.html -> www.cs.umass.edu/courses, www.cs.umass.edu/news; www.cs.umass.edu/news -> www.bbc.co.uk/index.html, www.cnn.com/2006/09/story.html; www.bbc.co.uk/index.html -> www.bbc.co.uk/today, www.bbc.co.uk/2005/story.html; www.bbc.co.uk/2005/story.html -> www.whitehouse.gov/index.html; www.whitehouse.gov/index.html -> www.whitehouse.gov/news.html, www.whitehouse.gov/about.html; www.cnn.com/index.html -> www.cnn.com/2006/09/story.html, www.cnn.com/2003/04/story.html", "seeds": "www.cs.umass.edu/index.html, www.cnn.com/index.html", "interactive": true}
```

All 12 pages are crawled in 12 fetches, in FIFO (breadth-first) order. `www.cnn.com/2006/09/story.html` is linked twice but queued once: the frontier remembers which URLs it has seen.

> ⚠️ **Pitfall**: "Repeat until no more URLs in queue" only ends if the frontier refuses URLs it has already seen — without a seen-set, two pages linking to each other loop forever. That's separate from duplicate *content* detection ([section 7](#7-duplicates-data-noise-client-side-scripting-and-the-deep-web)).

> 🔗 **Go deeper**: [Croft §3.2 Crawling the Web (book p. 32)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.2.2 The Web Crawler (book p. 35)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 2. Permission to Crawl: robots.txt

**Be polite: ask the website whether you may crawl it first** (L7 p17, p19). The **Robots Exclusion Standard**, a.k.a. `robots.txt`, is a file that sites may put at their root (`http://www.cnn.com/robots.txt`, `http://en.wikipedia.org/robots.txt`). The syntax is very simple, but there's "no formal/official standard yet". It works on an **honor basis** — **it's not a security mechanism**: a crawler that ignores it still gets the pages.

The five classic examples (L7 p18 · L6.5 p16–20, from robotstxt.org):

| Goal | robots.txt |
|---|---|
| Exclude all robots from the whole server | `User-agent: *` / `Disallow: /` |
| Allow all robots complete access | `User-agent: *` / `Disallow:` (empty) |
| Exclude all robots from part of the site | `User-agent: *` / `Disallow: /cgi-bin/` / `Disallow: /tmp/` / `Disallow: /junk/` |
| Exclude a single robot | `User-agent: BadBot` / `Disallow: /` |
| Allow a single robot | `User-agent: Google` / `Disallow:` — blank line — `User-agent: *` / `Disallow: /` |

(` / ` separates lines of the file.) `Disallow:` followed by nothing disallows nothing, so it means "allow all". `Disallow: /` blocks everything, because every path starts with `/`.

> 🗣️ **In class**: "THERE IS A PRECEDENCE RULE: if there is a section that is specific for a bot, the rules that are valid for that bot are **only** the rules on that section!" (L6.5 p21). In "allow a single robot", Google reads only its own group (`Disallow:` = everything allowed) and never sees the `*` group's `Disallow: /`.

**Allow inside a Disallowed folder** (L7 p24): you can disallow a folder but allow one resource in it — e.g. a page listing the links you *want* indexed. CNN's file (L7 p21, p24) is six `Sitemap:` lines, `User-agent: *`, the `Allow` lines, then ~35 `Disallow` lines (`/*.jsx$`, `/ads/`, `/aol/`, `/audio/`, … `/partners/`, … `/search/`, … `/webview/`). The p24 snapshot boxes the pairs `Allow: /audio/podcasts/` vs `Disallow: /audio/` and `Allow: /partners/ipad/live-video.json` vs `Disallow: /partners/` (the p21 snapshot has only the second `Allow`).

The slides don't say *why* the `Allow` wins. Today's rule (RFC 9309, Google, and recent Python) is **longest match**: the longest matching path wins, `Allow` wins a tie. The demo applies it to an abridged copy of CNN's file:

```viz robots-txt
{"title": "CNN robots.txt, abridged (L7 p21, p24)", "robots": "User-agent: *\nAllow: /audio/podcasts/\nAllow: /partners/ipad/live-video.json\nDisallow: /*.jsx$\nDisallow: /ads/\nDisallow: /audio/\nDisallow: /partners/\nDisallow: /search/", "urls": "/audio/podcasts/ep1.mp3, /audio/live.html, /partners/ipad/live-video.json, /partners/ipad/x.json, /2026/10/14/world/index.html, /video/player.jsx", "interactive": true}
```

Allowed: the podcast, `live-video.json` and the article (no rule matches). Disallowed: `/audio/live.html`, `/partners/ipad/x.json`, and `/video/player.jsx` (wildcard rule `/*.jsx$`). In Python:

```python
from urllib.robotparser import RobotFileParser

rules = """User-agent: *
Allow: /audio/podcasts/
Allow: /partners/ipad/live-video.json
Disallow: /*.jsx$
Disallow: /audio/
Disallow: /partners/
"""
rp = RobotFileParser()
rp.parse(rules.splitlines())   # or set_url(...) + read()
for path in ["/audio/podcasts/ep1.mp3", "/audio/live.html",
             "/partners/ipad/live-video.json",
             "/video/player.jsx"]:
    url = "https://www.cnn.com" + path
    print(path, rp.can_fetch("MyCrawler", url))
```

```text
Python 3.13.17                       Python 3.11.17 / 3.12.3
/audio/podcasts/ep1.mp3 True         True
/audio/live.html False               False
/partners/ipad/live-video.json True  True
/video/player.jsx False              True
```

> ⚠️ **Pitfall**: Older Pythons' robotparser (3.11.17 and 3.12.3 tested; openlab's 3.10 is older still) takes the **first matching line in file order** and treats `*` and `$` literally. CNN lists its `Allow` lines first, so only `/*.jsx$` breaks — but put `Disallow: /audio/` *above* `Allow: /audio/podcasts/` and the old parser blocks the podcasts. Set `"match": "first"` in the demo to see it.

> 📝 **Practice**: [Worked Example 15.3](#153-which-robotstxt-rule-applies-l7-p18--l65-p1621) · [Worked Example 15.4](#154-allow-inside-a-disallowed-folder-l7-p24)

> 🔗 **Go deeper**: [cnn.com/robots.txt](http://www.cnn.com/robots.txt) · [en.wikipedia.org/robots.txt](http://en.wikipedia.org/robots.txt) · [robotstxt.org: About /robots.txt](http://www.robotstxt.org/robotstxt.html) · [Croft §3.2.2 The Web Crawler (book p. 35)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 3. Sitemaps: Information to Crawlers

robots.txt tells crawlers where **not** to go. **Sitemaps** (introduced by Google) let web masters send crawlers **positive** information (L7 p20 · L9 p11):

- They contain **lists of URLs** and data about them, such as **modification time** and **modification frequency**.
- They're **listed in robots.txt** (CNN's first six lines, starting `Sitemap: https://www.cnn.com/sitemaps/cnn/index.xml`).
- They're generated by the server administrators, usually by scripts.
- They can tell the crawler about **pages it might not find** — pages that aren't linked from anywhere.
- They give the crawler their **relative importance** and a **hint about when to check a page for changes** (update frequency).

CNN's `index.xml` (L7 p22 · L6.5 p23) is a **sitemap index**: a `<sitemapindex>` listing more sitemaps (`video-2020-01.xml`, `article-2020-01.xml`, …), each with a `<lastmod>`. Each of those (L7 p23 · L6.5 p24 · L9 p12) is a `<urlset>` with one `<url>` per page:

```xml
<url>
  <loc>https://www.cnn.com/2012/01/25/world/gallery/wus-us-mia/index.html</loc>
  <lastmod>2012-01-25T18:24:37Z</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.5</priority>
  <image:image>
    <image:loc>https://i2.cdn.turner.com/cnnnext/dam/assets/120111071718-jpac1-plane-story-top.jpg</image:loc>
    <image:caption>Gunnery Sgt. Bryon Bebout with the wreckage of a B-24 …</image:caption>
  </image:image>
</url>
```

`<loc>` = URL, `<lastmod>` = modification time, `<changefreq>` = modification frequency, `<priority>` = relative importance. The arrows (L7 p23, L9 p12) mark `<lastmod>` and `<changefreq>` — what a crawler uses to decide *when* to come back ([section 8](#8-when-to-crawl-again-freshness-and-age)).

> 🔗 **Go deeper**: [CNN sitemap index](https://www.cnn.com/sitemaps/cnn/index.xml) · [Croft §3.2.6 Sitemaps (book p. 43)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 4. Why the Basic Algorithm Is Not Enough

The basic algorithm is **theoretically correct** but **seriously lacking in practice** (L7 p27–34, one item per frame). It:

| # | Problem | Covered in |
|---|---|---|
| 1 | Will upset web admins (impolite) — it's abusing the web servers | [§5](#5-politeness-and-performance) |
| 2 | Is very slow — 1 page at a time | [§5](#5-politeness-and-performance) |
| 3 | Will get caught in traps and infinite sequences | [§6](#6-crawler-traps) |
| 4 | Will fetch duplicates without noticing | [§7](#7-duplicates-data-noise-client-side-scripting-and-the-deep-web) |
| 5 | Will bring in data noise | [§7](#7-duplicates-data-noise-client-side-scripting-and-the-deep-web) |
| 6 | Will miss content due to client-side scripting | [§7](#7-duplicates-data-noise-client-side-scripting-and-the-deep-web) |

L6.5's agenda says the duplicate and noise ideas get "more math later" in the course.

---

## 5. Politeness and Performance

### 5.1 Politeness

**Avoid hitting any site too often: sites are for people, not for bots** (L7 p35). Ignore politeness and your crawler is a **denial-of-service (DoS) attack**. Be polite: **use artificial delays** between requests to the same server.

### 5.2 Performance: the crawler mostly waits

Retrieving one page takes several network round trips (L9 p5):

1. The crawler (a client program) connects to a **DNS** server.
2. DNS translates the host name into an **IP address**.
3. The crawler connects to the server host on a specific **port**.
4. It sends an **HTTP request** for the page, usually a `GET`.

Back of the envelope (L7 p36): at 500 ms per fetch, **1 million pages one at a time take 500,000 s ≈ 5.8 days** — and "it's worse than that" with unresponsive servers. Most of that time the thread is **waiting for network data**. → [Worked Example 15.1](#151-crawl-time-for-1-million-pages-l7-p36)

L9 p6–9 lays out the trade-off one bullet at a time:

| | |
|---|---|
| Problem | Web crawlers spend a lot of time **waiting** for responses to requests |
| Solution | Use **threads** and fetch hundreds of pages at once (or distribute the crawl, L7 p36) |
| Drawback | Crawlers could **flood sites** with requests |
| Mitigation | **Politeness policies**: e.g. distribute requests between different servers, delay between requests to the same web server, … |

With threads, politeness is harder to control but possible, e.g. different threads on different servers (L7 p36).

**Where to enforce politeness?** (L9 p10) "Can be here": `website ← frontier.nextSite()`; "and here": `url ← website.nextURL()`. In the demo each host must rest 2 ticks after a fetch; `nextSite()` skips resting hosts, and the thread waits when all of them are resting:

```viz crawl-frontier
{"title": "Politeness: 2-tick rest per host (L7 p35 · L9 p6–10)", "web": "www.cs.umass.edu/index.html -> www.cs.umass.edu/courses, www.cs.umass.edu/news; www.cs.umass.edu/news -> www.bbc.co.uk/index.html, www.cnn.com/2006/09/story.html; www.bbc.co.uk/index.html -> www.bbc.co.uk/today, www.bbc.co.uk/2005/story.html; www.bbc.co.uk/2005/story.html -> www.whitehouse.gov/index.html; www.whitehouse.gov/index.html -> www.whitehouse.gov/news.html, www.whitehouse.gov/about.html; www.cnn.com/index.html -> www.cnn.com/2006/09/story.html, www.cnn.com/2003/04/story.html", "seeds": "www.cs.umass.edu/index.html, www.cnn.com/index.html", "politeness": 2, "start": 8}
```

The same 12 pages now take 22 ticks instead of 12 — 10 spent waiting. With one thread politeness costs time, which is why crawlers spread many threads over many hosts.

### 5.3 DNS lookups

Before any fetch, the crawler must turn a domain name into an IP address (L7 p37): `www.ics.uci.edu` → `128.195.1.83`. DNS is a distributed set of servers: **latency can be high (2 s is not unusual)**, common implementations are **blocking** (one request at a time), and results are **cached**. At 800 ms per lookup, how long to look up the entire Web? The slide gives no host count; per million names it's ≈ **9.3 days** (≈ 23 days at 2 s). → [Worked Example 15.2](#152-dns-lookups-at-800-ms-l7-p37)

> 💡 **Key Insight**: A crawler is **I/O-bound** — goroutines in Go, threads or async I/O in Python — and caching DNS per host is the cheapest speed-up.

> 🔗 **Go deeper**: [Croft §3.2.1 Retrieving Web Pages (book p. 33)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.2.2 The Web Crawler (book p. 35)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 6. Crawler Traps

A trap **may trap the crawler on a site forever**: the web server responds with **ever-changing URLs and content**, typically from dynamic pages (L7 p38). Traps can be:

- **Unintentional**: e.g. **the ICS calendar is a crawler trap**. Every month page links to the next month, forever.
- **Intentional**: some web admins create traps to penalize impolite crawlers (fleiner.com/bots) — e.g. very large documents, *disallowed in robots.txt*, built to consume resources or break the poorly designed parsers of crawlers that ignore robots.txt.

The demo's calendar always links to a never-seen URL (`?n=1`, `?n=2`, …), so the seen-set never helps; only the 10-fetch budget stops it:

```viz crawl-frontier
{"title": "A crawler trap: the ICS calendar (L7 p38)", "web": "www.ics.uci.edu/ -> www.ics.uci.edu/calendar, www.ics.uci.edu/about; www.ics.uci.edu/about -> www.ics.uci.edu/", "seeds": "www.ics.uci.edu/", "trap": "www.ics.uci.edu/calendar", "maxFetches": 10}
```

The site has 3 real pages, but 8 of the 10 fetches go to the calendar and the frontier is still not empty.

> ⚠️ **Pitfall**: The intentional traps are aimed at crawlers that **ignore robots.txt**. Honoring robots.txt is the first defense; a cap on pages per host / URL depth, and noticing near-identical pages, catch the unintentional ones.

> 🔗 **Go deeper**: [fleiner.com/bots — keeping bad robots away](http://www.fleiner.com/bots/)

---

## 7. Duplicates, Data Noise, Client-Side Scripting and the Deep Web

**Duplicates** (L7 p39). Exact and near duplication are widespread: copies, mirror sites, versions, spam, plagiarism. Studies find **30% of web pages are [near-]duplicates of the other 70%**. They have little or no value: they're noise to the search engine and the user, who should see only one copy (perhaps with a "show similar" link).

| | Exact duplicates | Near duplicates |
|---|---|---|
| Detection | Easy: **hashes, checksums** | Harder: **page fingerprints** |
| How common | Rare | Common |

**Data noise** (L7 p40–41 · L6.5 p26). Pages carry content not related to the page — **ads, templates** — and noise hurts retrieval; the screenshot boxes the top banner ad and the left and right columns. **Finding content blocks**, technique 1: the **cumulative distribution of tags** (*document slope curve*, Finn, Kushmerick & Smyth, 2001). The plot has **token count** (0–3,500) on x and **tag count** (0–900) on y; it climbs where tags are dense and goes nearly **flat in the "text area"** (≈ 1,000–1,500 tokens) — the main content. Other techniques exist in the literature.

**Client-side scripting** (L7 p42–43). Modern sites are heavily scripted (JavaScript, TypeScript), with content behind `XMLHttpRequest`s. Reaching it means interacting with the scripts — **user-interaction emulation** (e.g. Selenium), which is hard; most crawlers don't, so that content is never indexed.

**The deep web** (L7 p44) is the places crawlers rarely go: content behind **login forms**, content behind **JavaScript/TypeScript**, and sites that **aren't linked from anywhere** (sitemaps help with these, [§3](#3-sitemaps-information-to-crawlers)). It's estimated to be **400–500× larger than the shallow web**.

> 🔗 **Go deeper**: [Deep web estimate (doi:10.3998/3336451.0007.104)](http://dx.doi.org/10.3998/3336451.0007.104) · [Croft §3.2.5 Deep Web (book p. 41)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.7 Detecting Duplicates (book p. 60)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.8 Removing Noise (book p. 63)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 8. When to Crawl Again: Freshness and Age

### 8.1 Freshness

Pages are constantly **added, deleted and modified** (L9 p13); **stale** copies no longer reflect the real pages, so the crawler must keep **revisiting** to maintain **freshness**. HTTP's **`HEAD`** request returns information *about* the page, not the page itself (L9 p14–15):

```text
Client request:  HEAD /csinfo/people.html HTTP/1.1
                 Host: www.cs.umass.edu

Server response: HTTP/1.1 200 OK
                 Date: Thu, 03 Apr 2008 05:17:54 GMT
                 Server: Apache/2.0.52 (CentOS)
                 Last-Modified: Fri, 04 Jan 2008 15:28:39 GMT
                 ETag: "239c33-2576-2a2837c0"
                 Accept-Ranges: bytes
                 Content-Length: 9590
                 Connection: close
                 Content-Type: text/html; charset=ISO-8859-1
```

The arrow points at **`Last-Modified`**: compare it with the date of your stored copy. Try it yourself (L9 p15):

```bash
curl --head https://www.ics.uci.edu/~algol/index.html
```

You can't check every page constantly: check **important** and **frequently changing** pages (L9 p16). **Freshness** = the proportion of fresh pages in the collection, and optimizing it is **dangerous**: a site that is always updated is almost never fresh in your copy, so a freshness-maximizing engine would *stop crawling it*. Another metric: **age**.

### 8.2 Freshness vs. age

The figure (L9 p17 · L6.5 p31–32), on one time axis: crawl, updates, crawl, update, crawl.

| Event | Freshness | Age |
|---|---|---|
| Crawl | 1 (copy matches the page) | 0 |
| Page updates after the crawl | drops to 0 | starts growing linearly from 0 |
| More updates before the next crawl | stays 0 | keeps growing (it counts from the *first* missed change) |
| Next crawl | back to 1 | back to 0 |

Freshness is a yes/no step; age measures **how long** the copy has been out of date.

### 8.3 Expected age

The expected age of a page $t$ days after it was last crawled (L9 p18–20):

$$\text{Age}(\lambda, t) = \int_0^t P(\text{page changed at time } x)\,(t - x)\,dx$$

$P(\text{page changed at time } x)$ is the probability the page changed at time $x$; $(t - x)$ is the time between that change and now — how long the copy has been stale (L9 p19). Updates follow a **Poisson process** on average (Cho & Garcia-Molina, 2003), so the time to the next update is **exponential** with mean change frequency $\lambda$ (changes per day):

$$\text{Age}(\lambda, t) = \int_0^t \lambda e^{-\lambda x}\,(t - x)\,dx = t - \frac{1 - e^{-\lambda t}}{\lambda}$$

(The closed form is mine, checked numerically.) L9 p21 plots it for $\lambda = 1/7$ (one change per week), $t$ from 0 to ≈ 7 days: the curve bends **upward** — 0.26 at $t = 2$, 0.95 at $t = 4$, 1.97 at $t = 6$, $7/e \approx 2.58$ at $t = 7$.

> 💡 **Key Insight**: "The older a page gets, the more it costs not to crawl it" (L9 p21): expected age grows *faster* than linearly, so each extra day of waiting costs more than the last — sooner for pages with a large $\lambda$.

> 📝 **Practice**: [Worked Example 15.6](#156-expected-age-for-one-change-per-week-l9-p1821)

> 🔗 **Go deeper**: [Croft §3.2.3 Freshness (book p. 37)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 9. Distributed Crawling

Three reasons to use multiple computers for crawling (L9 p22):

1. It puts the crawler **closer to the sites it crawls** → lower network requirements.
2. It **reduces the number of sites each crawler has to remember** → lower local memory requirements.
3. It **reduces the locally required resources** in general.

Distributed crawlers may use a **hash function to assign URLs** to computers/threads, computed on the **host part** of each URL — so one crawler owns each host and can keep it polite. L9 p23–24 shows `CrawlerThread` five times, each with `(frontier)` highlighted: **the frontier information should be shared** (one seen-set, one politeness state).

> 🔗 **Go deeper**: [Croft §3.2.7 Distributed Crawling (book p. 44)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 10. Other Types of Crawling: Focused, Desktop, Document Feeds

**Focused crawling** (L9 p26) downloads only pages **about a particular topic** (or around specific events in time), for vertical search or to improve an engine on one topic. Pages on a topic tend to **link to pages on the same topic**; popular pages are the seeds (e.g. pages many users click after searching a keyword), and a **text classifier** decides whether a page is on topic.

**Desktop crawls** (L9 p27), for desktop and enterprise search, differ from web crawling: data is much easier to find (file system ~ sitemap); responding quickly to updates matters more; they must be conservative with disk, memory and CPU (transparent to the user); they must cope with many document formats; and data privacy matters much more.

**Document feeds** (L9 p28–29). Many documents are just **published** — created once and rarely updated (news, blog posts, press releases, e-mail). Published documents from one source form a sequence, a **document feed**; crawlers find new documents at **the end of the feed**. Two types:

- A **push feed** alerts the subscriber to new documents (e.g. news agencies). Push involves a subscription, e.g. **WebSub**.
- A **pull feed** requires the subscriber to check periodically for new documents. The most common pull format is **RSS** — Really Simple Syndication / RDF Site Summary / Rich Site Summary.

An RSS example (L9 p30–33):

```xml
<?xml version="1.0"?>
<rss version="2.0">
  <channel>
    <title>Search Engine News</title>
    <link>http://www.search-engine-news.org/</link>
    <description>News about search engines.</description>
    <language>en-us</language>
    <pubDate>Tue, 19 Jun 2008 05:17:00 GMT</pubDate>
    <ttl>60</ttl>

    <item>
      <title>Upcoming SIGIR Conference</title>
      <link>http://www.sigir.org/conference</link>
      <description>The annual SIGIR conference is coming!
        Mark your calendars and check for cheap
        flights.</description>
      <pubDate>Tue, 05 Jun 2008 09:50:11 GMT</pubDate>
      <guid>http://search-engine-news.org#500</guid>
    </item>
    ...
    <item>
      <title>New Search Engine Textbook</title>
      <link>http://www.cs.umass.edu/search-book</link>
      <description>A new textbook about search engines
        will be published soon.</description>
      <pubDate>Tue, 05 Jun 2008 09:33:01 GMT</pubDate>
      <guid>http://search-engine-news.org#499</guid>
    </item>
  </channel>
</rss>
```

Before the first `<item>` is the **feed channel info**; each `<item>` is **item info** (L9 p31); arrows (p32–33) mark the `<pubDate>`s and `<ttl>`. For crawlers (L9 p34):

- `<ttl>` (time to live) is how long, **in minutes**, the contents should be cached — here 60.
- Feeds are accessed like web pages, with HTTP `GET`; use `HEAD` to check whether the feed changed.
- Feeds are easy to parse (just XML), and new information is easy to find: `GET`, parse, and grab any new `<item>` … `</item>` entries.

> 🔗 **Go deeper**: [W3C WebSub](https://www.w3.org/TR/websub/) · [Croft §3.2.4 Focused Crawling (book p. 41)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.3 Crawling Documents and Email (book p. 46)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.4 Document Feeds (book p. 47)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 11. Ethics and the Law

> 🗣️ **In class**: **"Just because you can, doesn't mean you should."** The main point of Lecture 8 (L8 p3, p18), repeated in class (L6.5 p29).

**Guidelines for bot writers** (L8 p4) — an old (1993!) but still very relevant text from robotstxt.org:

| Guideline | Meaning |
|---|---|
| **Reconsider** | Do you really need a bot? |
| **Be accountable** | If your actions cause problems, be available to take prompt action in response |
| **Test locally** | Expand the scope gradually before you unleash your crawler on others |
| **Don't hog resources** | Web servers are for people primarily. Walk, don't run |
| **Stay with it** | "It's vital to know what your robot is doing, and that it remains under control" |

Also **find out the site's crawling policy** and **contact the web admins** (L8 p5). The example is GitHub's §5 "Scraping and API Usage Restrictions": researchers may scrape public, non-personal information *if* their publications are open access; archivists may scrape public data; scraping for spam or to sell user personal information (to recruiters, headhunters, job boards) is forbidden; all use must follow GitHub's Privacy Statement.

**Ethics is bigger than law** (L8 p6): *Laws* is a small circle inside the large circle of *Ethical Issues*.

**The Web and the law** (L8 p7–14). The Web is only ~30 years old — a "Wild Wild West (or Wild Wild Web…)" with very few laws, untested or outdated, so **your own judgments and actions matter**. It was born at CERN for physics research: Tim Berners-Lee's 1989 proposal addresses the loss of information about complex evolving systems at CERN with a distributed hypertext system. The ~1993 first website is still online (p9), and p10 shows a 1993 NeXT screenshot.

**The first web search engines** (L8 p11):

| Year | Engine | What was new |
|---|---|---|
| 1993 | W3Catalogue | Primitive catalogue |
| 1993 | World Wide Web Wanderer | First web crawler, built to measure the size of the web |
| 1993 | JumpSearch | Crawling, indexing, searching: first "modern" engine |
| 1994 | Excite and RankDex | Ranking system that inspired Google's PageRank |
| 1994 | WebCrawler | Full-text indexing |

(The slide writes "JumpSearch", but its own screenshot is titled "NCSA Mosaic – **JumpStation II** Document Search Page".)

> 🔗 **Go deeper**: [robotstxt.org: Guidelines for robot writers](http://www.robotstxt.org/guidelines.html) · [GitHub: scraping and API usage restrictions](https://help.github.com/en/github/site-policy/github-acceptable-use-policies#5-scraping-and-api-usage-restrictions) · [Berners-Lee's 1989 proposal](https://www.w3.org/History/1989/proposal.html) · [The first website](http://info.cern.ch/hypertext/WWW/TheProject.html) · [NeXT browser screenshot, 1993](http://info.cern.ch/NextBrowser1.html)

---

## 12. Privacy: What Your Crawler Leaves Behind

"Who can offend who" (L8 p15): a yin-yang of **Users** and **Providers**, harming each other through **personal information (privacy)** and **content (security)**. Sites may publish **privacy statements** — what they collect and how it's used (L8 p16). Your crawler is on the record too: L8 p17 shows Apache access-log lines:

```text
66.249.66.18 - - [25/Jan/2012:00:18:27 -0800] "GET /xwiki/bin/export/Stats/CurrentYearActivity?format=rtf HTTP/1.1" 404 335 "-" "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
180.76.6.28 - - [25/Jan/2012:00:18:31 -0800] "GET / HTTP/1.1" 200 45 "-" "Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)"
66.249.66.18 - - [25/Jan/2012:00:19:02 -0800] "GET /calswim/coverage-s1.png HTTP/1.1" 200 961543 "-" "Googlebot-Image/1.0"
173.192.98.90 - - [25/Jan/2012:00:33:00 -0800] "GET / HTTP/1.1" 404 290 "-" "Python-urllib/2.4"
80.165.186.186 - - [25/Jan/2012:01:21:24 -0800] "GET /events-dataset-api/ HTTP/1.1" 200 3214 "http://www.kdnuggets.com/datasets/index.html" "Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1"
180.76.5.65 - - [25/Jan/2012:02:18:20 -0800] "GET / HTTP/1.1" 200 45 "-" "Mozilla/5.0 (compatible; Baiduspider/2.0; …
```

Each line records client **IP**, **time**, **request**, **status**, **bytes**, **referrer** and **user agent**. Googlebot and Baiduspider identify themselves with a URL; `Python-urllib/2.4` is an anonymous script; the Firefox line is a person coming from KDnuggets. The admin sees who crawls what, how often. → [Worked Example 15.5](#155-reading-an-apache-log-line-l8-p17)

> 💡 **Key Insight**: Give your crawler an honest, identifying User-Agent. The log line is how a web admin decides whether to contact you or to block you.

> 🔗 **Go deeper**: [UCI privacy statement](http://uci.edu/privacy.php)

---

## 13. Copyright, Fair Use and Legal Cases

**Copyright** (L8 p19–20). Products of intellect — web content, source code — are ruled by copyright law: "a form of protection grounded in the U.S. Constitution and granted by law for original works of authorship fixed in a tangible medium of expression", published or not (copyright.gov). So can you use web material?

**Fair use** (L8 p21–22). Reproduction may be considered fair for purposes such as **criticism, comment, news, teaching, scholarship, research** — but it's a very grey area. Four factors decide whether a particular use is fair:

1. The **purpose and character** of the use, including whether it's commercial or for nonprofit educational purposes.
2. The **nature** of the copyrighted work.
3. The **amount and substantiality** of the portion used, relative to the work as a whole.
4. The **effect on the potential market** for, or value of, the work.

**Legal cases** (L8 p23–24). Both were won on **"trespass to chattels"**: interfering with someone else's property, here their computer systems.

| Case | Date | What happened | Finding |
|---|---|---|---|
| eBay vs. Bidder's Edge | May 24, 2000 | eBay stopped Bidder's Edge's crawlers | Intentional, unauthorized interference with eBay's computer system that caused damage |
| American Airlines vs. FareChase | Mar 10, 2003 | AA stopped FareChase scraping AA.com "web fares" (fare comparison) | Intentional, without consent; harms AA's network and property. Settled later that year |

For more, there's a Computer Law graduate course at UCI (L8 p25).

> ⚠️ **Pitfall**: Both cases were about **crawling** (load on, and unauthorized use of, the servers), not about copying text. Respecting robots.txt and politeness is the legal side of the story too, not just good manners.

> 🔗 **Go deeper**: [copyright.gov](http://www.copyright.gov) · [Copyright FAQ](https://www.copyright.gov/help/faq/faq-general.html) · [Fair use (FL-102)](https://www.copyright.gov/fls/fl102.html) · [eBay v. Bidder's Edge (Justia)](https://law.justia.com/cases/federal/district-courts/FSupp2/100/1058/2478126/) · [AA v. FareChase injunction (EFF)](https://www.eff.org/document/preliminary-injunction-american-airlines-v-farechase-inc) · [UCI Computer Law course](https://www.ics.uci.edu/~kay/courses/269/)

---

## 14. In-class Notes & Assignment Tips

From L6.5 p2, p11, p35–39:

- **A1 bonus point**: record a short video explaining your code and your reasoning, and upload it to Canvas (link next week).
- **tmux** (extra YuJa video this week) keeps a long A2 crawl alive after you log out:

| Action | Command |
|---|---|
| Create a new session named "mycrawler" | `tmux new -s mycrawler` |
| Attach to a previously created session | `tmux attach -t mycrawler` |
| List sessions on the machine | `tmux ls` |
| Split screen into panes | `Ctrl+B`, release, then `%` (vertical split) or `"` (horizontal split) |
| Kill pane | `Ctrl+B` + `x` |
| Move between panes | `Ctrl+B`, release, then an arrow key |
| Detach (leave tmux without killing it) | `Ctrl+B`, release, then `d` |

> ⚠️ **Pitfall**: **If in openlab, keep a note of the machine you are on!** A tmux session lives on one machine. Log back into openlab and you may land on a different one, where `tmux attach` finds nothing.

- **`_pickle.PicklingError` in the A2 crawler** (L6.5 p39). An error like `Can't pickle local object <class 'spacetime.node.get_app.<locals>.App'>` (… "when serializing spacetime.node.get_app.`<locals>`.App class/object") is fixed by explicitly selecting the `fork` start method in `launch.py`:

```python
import multiprocessing
# ... existing imports ...

if __name__ == "__main__":
    multiprocessing.set_start_method("fork")   # first line in the main guard
    parser = ArgumentParser()
    # Keep the remaining code here unchanged.
```


---

## 15. Worked Examples (with Solutions)

### 15.1 Crawl time for 1 million pages (L7 p36)

One page fetch takes 500 ms. How long does it take to crawl 1 million pages one at a time? What changes with threads?

> ✍️ **Try it first.**

**Solution.** $10^6 \times 0.5\ \text{s} = 500{,}000\ \text{s}$ ≈ 138.9 h ≈ **5.8 days** — worse in practice (unresponsive servers), and almost all of it waiting on the network. With $k$ threads in parallel (on different servers, to stay polite) the ideal is $500{,}000 / k$ s: 10 threads ≈ 13.9 h, 100 ≈ 1.4 h, 500 ≈ 17 min. Back to [section 5](#52-performance-the-crawler-mostly-waits).

### 15.2 DNS lookups at 800 ms (L7 p37)

One DNS lookup takes 800 ms, and common resolvers are blocking (one request at a time). How long would it take to "look up the entire Web"?

> ✍️ **Try it first.**

**Solution.** No host count is given, so per million names: $10^6 \times 0.8\ \text{s} = 800{,}000\ \text{s} \approx 9.3$ days; at 2 s, ≈ 23 days. Fixes: **cache** (one lookup serves all of a host's URLs) and don't block — resolve concurrently. Back to [section 5.3](#53-dns-lookups).

### 15.3 Which robots.txt rule applies? (L7 p18 · L6.5 p16–21)

For each file in the L7 p18 table, may `BadBot`, `Google` and `MyCrawler` fetch `/`, `/tmp/a.html` and `/index.html`?

> ✍️ **Try it first.**

**Solution.** First pick the group (a group naming the bot wins over `*`), then match the paths. These results were checked with Python's `urllib.robotparser`:

| File | BadBot | Google | MyCrawler |
|---|---|---|---|
| Exclude all (`*`: `Disallow: /`) | none | none | none |
| Allow all (`*`: `Disallow:`) | all | all | all |
| Exclude part (`*`: `/cgi-bin/`, `/tmp/`, `/junk/`) | `/`, `/index.html` (not `/tmp/a.html`) | same | same |
| Exclude a single robot (`BadBot`: `Disallow: /`) | none | all (no group applies) | all |
| Allow a single robot (`Google`: `Disallow:` + `*`: `Disallow: /`) | none | **all** | none |

The last row is the precedence rule: Google's own group allows everything, and the `*` group doesn't apply to it. Check:

```viz robots-txt
{"title": "Allow a single robot + the precedence rule (L7 p18 · L6.5 p21)", "robots": "User-agent: Google\nDisallow:\n\nUser-agent: *\nDisallow: /", "urls": "/index.html, /tmp/a.html", "agent": "Google"}
```

(robotparser matches the group name as a substring, so `Googlebot/2.1` also gets the `Google` group; RFC 9309 wants the exact token.) Back to [section 2](#2-permission-to-crawl-robotstxt).

### 15.4 Allow inside a Disallowed folder (L7 p24)

With CNN's rules `Allow: /audio/podcasts/`, `Allow: /partners/ipad/live-video.json`, `Disallow: /audio/` and `Disallow: /partners/`, decide `/audio/podcasts/ep1.mp3`, `/audio/live.html`, `/partners/ipad/live-video.json` and `/partners/ipad/x.json`.

> ✍️ **Try it first.**

**Solution.** Find every rule whose path is a prefix of the URL path, and let the longest one win:

| Path | Matching rules | Winner | Verdict |
|---|---|---|---|
| `/audio/podcasts/ep1.mp3` | `Allow: /audio/podcasts/` (16), `Disallow: /audio/` (7) | Allow | **allowed** |
| `/audio/live.html` | `Disallow: /audio/` | Disallow | disallowed |
| `/partners/ipad/live-video.json` | `Allow: …/live-video.json` (30), `Disallow: /partners/` (10) | Allow | **allowed** |
| `/partners/ipad/x.json` | `Disallow: /partners/` | Disallow | disallowed |

The folder is closed except for the resource the site wants crawled. First-match gives the same answers only because CNN lists its `Allow` lines first. Back to [section 2](#2-permission-to-crawl-robotstxt).

### 15.5 Reading an Apache log line (L8 p17)

Split `80.165.186.186 - - [25/Jan/2012:01:21:24 -0800] "GET /events-dataset-api/ HTTP/1.1" 200 3214 "http://www.kdnuggets.com/datasets/index.html" "Mozilla/5.0 (Windows NT 5.1; rv:9.0.1) Gecko/20100101 Firefox/9.0.1"` into fields. Is it a bot?

> ✍️ **Try it first.**

**Solution.** Parsed with a combined-log-format regex:

| Field | Value |
|---|---|
| Client IP | `80.165.186.186` |
| Identity, user | `-`, `-` (unknown) |
| Time | `25/Jan/2012:01:21:24 -0800` |
| Request | `GET /events-dataset-api/ HTTP/1.1` |
| Status | `200` (OK) |
| Bytes | `3214` |
| Referrer | `http://www.kdnuggets.com/datasets/index.html` |
| User agent | Firefox 9.0.1 on Windows NT 5.1 |

A person, not a bot: a browser user agent, arriving from a KDnuggets link (the referrer). Compare the `Python-urllib/2.4` line: no referrer, a bare library user agent — a script that doesn't say who runs it. Back to [section 12](#12-privacy-what-your-crawler-leaves-behind).

### 15.6 Expected age for one change per week (L9 p18–21)

With $\lambda = 1/7$ changes per day, what is the expected age of a page 2, 4, 6 and 7 days after it was crawled?

> ✍️ **Try it first.**

**Solution.** Integrating $\lambda e^{-\lambda x}(t - x)$ from 0 to $t$ gives $\text{Age}(\lambda, t) = t - (1 - e^{-\lambda t})/\lambda$:

| $t$ (days) | 1 | 2 | 4 | 6 | 7 |
|---|---|---|---|---|---|
| Expected age (days) | 0.07 | 0.26 | 0.95 | 1.97 | 2.58 |

This matches the L9 p21 curve (≈ 2.5 at the right edge, bending upward); at $t = 7$ the age is exactly $7e^{-1}$. Days 4→6 add ≈ 1 day of expected age; days 0→2 added only ≈ 0.26. Back to [section 8](#83-expected-age).

---

## 16. Quick Reference & Top 5 Things to Remember

| robots.txt | Meaning |
|---|---|
| `User-agent: Name` | Group for that bot; if present, **only** its rules apply to it (L6.5 p21) |
| `Disallow: /` / `Disallow:` | Block everything / block nothing |
| `Disallow: /tmp/` | Block paths starting with `/tmp/` |
| `Allow: /audio/podcasts/` under `Disallow: /audio/` | Re-opens one resource in a closed folder (longest match wins) |
| `Sitemap: URL` | Where the sitemaps are |

| Crawler problem (L7 p27–34) | Fix from the slides |
|---|---|
| Impolite | Artificial delays per host; enforce in `nextSite()` / `nextURL()` |
| Slow (waiting on the network, DNS) | Threads / distributed crawling; cache DNS |
| Traps | Honor robots.txt; watch for ever-changing URLs (e.g. the ICS calendar) |
| Duplicates | Hashes/checksums (exact), fingerprints (near) |
| Noise | Content blocks: cumulative tag distribution |
| Client-side scripting | User-interaction emulation (Selenium) — most crawlers skip it |

| Term | Meaning |
|---|---|
| Frontier | Queue of URLs still to crawl; starts with the seeds |
| `HEAD` | HTTP request for headers only (`Last-Modified`) |
| Freshness | Fraction of the collection that is up to date |
| Age | How long a copy has been out of date; $\text{Age}(\lambda,t) = \int_0^t \lambda e^{-\lambda x}(t-x)\,dx$ |
| Distributed crawl | Hash the **host** → crawler; share the frontier |
| Push / pull feed | Publisher alerts you (WebSub) / you poll (RSS, `<ttl>` in minutes) |
| Deep web | Behind logins, scripts, or unlinked; 400–500× the shallow web |
| Trespass to chattels | The claim in eBay v. Bidder's Edge and AA v. FareChase |

**Top 5 things to remember**

1. Crawl loop: frontier → permitted? → fetch → store → extract → add the **unseen** links; politeness lives in `nextSite()`/`nextURL()`.
2. robots.txt: a bot-specific group overrides `*` completely; `Allow` inside a `Disallow`ed folder wins by **longest match**; and it's honor-based, not security.
3. Crawling is I/O-bound: 1M pages × 500 ms ≈ 5.8 days on one thread, so use many threads — and stay polite per host.
4. Optimizing **freshness** can make you abandon fast-changing sites; **age** grows faster than linearly with time since the last crawl.
5. "Just because you can, doesn't mean you should": follow the bot-writer guidelines, identify your bot, and remember that both legal cases were about crawling (trespass to chattels).