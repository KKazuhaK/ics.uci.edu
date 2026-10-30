---
title: "Encodings, Storing Documents, Duplicates, Zipf's Law"
summary: "Document conversion and character encodings (Unicode, UTF-8), storing documents (TREC Web, compression, BigTable), exact and near-duplicate detection (checksums, n-gram fingerprints, Simhash), removing page noise, and text statistics with Zipf's law."
---

# CS 121: Information Retrieval — Week 4: Web Crawling, Text Processing

## Table of Contents

- [1. Conversion: From Many Formats to Text](#1-conversion-from-many-formats-to-text)
- [2. Character Encoding](#2-character-encoding)
- [3. Unicode and UTF-8](#3-unicode-and-utf-8)
- [4. Storing the Documents](#4-storing-the-documents)
- [5. The TREC Web Format](#5-the-trec-web-format)
- [6. Compression and BigTable](#6-compression-and-bigtable)
- [7. Exact Duplicates: Checksums and CRCs](#7-exact-duplicates-checksums-and-crcs)
- [8. Near Duplicates and N-gram Fingerprints](#8-near-duplicates-and-n-gram-fingerprints)
- [9. Simhash](#9-simhash)
- [10. Removing Noise: Finding Content Blocks](#10-removing-noise-finding-content-blocks)
- [11. Text Statistics and Zipf's Law](#11-text-statistics-and-zipfs-law)
- [12. Worked Examples (with Solutions)](#12-worked-examples-with-solutions)
- [13. Quick Reference & Top 5 Things to Remember](#13-quick-reference--top-5-things-to-remember)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Oct 21
> Built from the Lecture 10, 11 and 12 slides (the YuJa videos are not included). **Provisional**: the in-class Lecture 9.5 deck wasn't posted yet, so its in-class emphasis and tips are missing. Organized by concept, not by lecture.
> Slides credit Profs. C. Lopes, A. Krone-Martins, C. Manning, P. Nayak, H. Schütze and others, and Addison Wesley for the textbook figures.
> 📖 Readings this week: [Croft et al., *Search Engines: IR in Practice*, Ch 3 Crawls and Feeds, and Ch 4 Processing Text up to and including §4.4](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

> 📅 **Class logistics**: Online **Quiz 1** was in class on Wednesday, Oct 21, on your laptop (opened 7:00 pm, 30 minutes).
> **Assignment 2** (web crawler) is due **Friday, Oct 30, 9:00 pm**.

---

## 1. Conversion: From Many Formats to Text

This week follows a page from the crawler to the index. On the architecture map (L11 p3 · L12 p2, p31; explained in [Week 1 §10](week-01.en-US.md#10-search-engine-architecture)) that is **Text Acquisition → Local Document Store → Text Transformation/Processing**: convert the page to text (§1–3), store it (§4–6), throw away duplicates and noise (§7–10), then start looking at the words themselves (§11).

"Text pre-processing" starts with **conversion** (L10 p2–5, one bullet per frame):

- Text is stored in **hundreds of incompatible file formats**: raw text, RTF, HTML, XML, Microsoft Word, ODF, PDF.
- **Other types of files**, not dedicated to text, are also important: PowerPoint, Excel, Keynote, Pages.
- You typically use a **conversion tool or library**. It **converts the document content into a tagged text format such as HTML or XML** and **retains some of the important formatting** information.
- Some converters **don't retain formatting** — e.g. the Unix tools `pdftotxt`, `pdf2ps` + `pdf2ascii`.

> 🔗 **Go deeper**: [Croft §3.5 The Conversion Problem (book p. 49)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 2. Character Encoding

**Glyphs** (Greek γλυφή, "carving") are the symbols you see, which encode letters or meanings (L10 p6–7). A **character encoding** is a **mapping between bits and glyphs** — how you get from the bits in a file to the characters on a screen — and it **can be a major source of incompatibility**.

- **ASCII** (since 1963) is the basic encoding for English: **128** letters, numbers, special characters and control characters in **7 bits**, extended with an extra bit for storage in bytes.
- **Other languages have many more glyphs** (L10 p8–9): Chinese has more than **40,000** characters, over **3,000** in common use.
- Many languages have **multiple encoding schemes** — the CJK (Chinese-Japanese-Korean) family, Hindi, Arabic. With those older schemes you **must specify the encoding**, because **the file is not self-describing**, and you **can't have multiple languages in one file**.
- **Unicode** was developed in the late '80s to address these problems.

> 🔗 **Go deeper**: [Croft §3.5.1 Character Encodings (book p. 50)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 3. Unicode and UTF-8

**Unicode** is a **single mapping from numbers to glyphs** that tries to include every glyph in common use in all known languages (L10 p10–11). Using its reserved (private-use) area, you can even write invented scripts: the slide shows a line in one, next to an image credited to Wikipedia.

Unicode **solves the number → glyph problem** but **does not uniquely specify the bits → glyph mapping**. That's what the encodings **UTF-8, UTF-16, UTF-32** do: they turn the number (the **code point**) into bytes.

Why several encodings? **Compatibility and space** (L10 p12):

| Encoding | Bytes per character | Trade-off |
|---|---|---|
| UTF-8 | 1 for English (= ASCII), up to **4** (e.g. some traditional Chinese characters) | Variable length: less space, but string operations are harder (character *i* isn't at byte *i*) |
| UTF-32 | Always **4** | More memory, no backward compatibility with ASCII, but fixed width |

You can **mix both**: many applications use **UTF-32 internally** (fast random lookup) and **UTF-8 on disk** (less space).

**How UTF-8 works** (L10 p13). The code point's range picks a row of the table; each `x` is filled with the code point's bits, high bits first:

| Decimal | Hexadecimal | Encoding |
|---|---|---|
| 0–127 | 0–7F | `0xxxxxxx` |
| 128–2047 | 80–7FF | `110xxxxx 10xxxxxx` |
| 2048–55295 | 800–D7FF | `1110xxxx 10xxxxxx 10xxxxxx` |
| 55296–57343 | D800–DFFF | Undefined |
| 57344–65535 | E000–FFFF | `1110xxxx 10xxxxxx 10xxxxxx` |
| 65536–1114111 | 10000–10FFFF | `11110xxx 10xxxxxx 10xxxxxx 10xxxxxx` |

The slide's example: Greek **π is code point 960** = `00000011 11000000` in binary (3C0 hex). 960 is in the second row, so the encoding is `110xxxxx 10xxxxxx`: the **high 5 bits** go into the first byte, the **next 6 bits** into the second. The result is **`11001111 10000000` = `CF 80`**. Step through it, or type other characters:

```viz utf8-encode
{"title": "UTF-8 encoding of π (L10 p13)", "text": "π", "interactive": true}
```

The leading bits give the length (`110` = 2 bytes, `1110` = 3, `11110` = 4); continuation bytes start with `10`, so an ASCII byte (`0xxxxxxx`) is never part of a multi-byte character. Python agrees:

```python
print("π".encode("utf-8").hex(" "))       # cf 80
print("π".encode("utf-32-be").hex(" "))   # 00 00 03 c0
print(len("中".encode("utf-8")))           # 3
```

> 📝 **Practice**: [Worked Example 12.1](#121-utf-8-encoding-of-π-l10-p13)

> 🔗 **Go deeper**: [Croft §3.5.1 Character Encodings (book p. 50)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 4. Storing the Documents

After documents are converted you need to **store** them (L11 p4–5). Reasons to keep the converted text:

- it **saves crawling time** when the page hasn't been updated;
- it gives **efficient access to the text** for **snippet generation**, additional information extraction, and so on.

Database systems can provide document storage for some applications, but **web search engines use customized document storage systems**.

Requirements for a search engine's document store (L11 p6):

| Requirement | What it means |
|---|---|
| **Random access** | Request a document's content by its **URL**; normally a **hash function on the URL** finds it |
| **Compression and large files** | Reduce storage requirements and keep access efficient |
| **Update** | Handle large volumes of new and modified documents; add new **anchor text** (text of links *pointing to* the page, found later on other pages) |

**Large files** (L11 p7): web pages are small, so store **many pages in a smaller number of large files** instead of one file per document. This **avoids file I/O overhead** (open/close per page) and **reduces seek time relative to read time** — one seek, then a long sequential read. **Compound document formats** store multiple documents in a file, e.g. **TREC Web**.

> 🔗 **Go deeper**: [Croft §3.6 Storing the Documents (book p. 52)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.6.1 Using a Database System (book p. 53)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.6.2 Random Access (book p. 53)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.6.4 Update (book p. 56)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 5. The TREC Web Format

One file, two crawled pages (L11 p8):

```xml
<DOC>
<DOCNO>WTX001-B01-10</DOCNO>
<DOCHDR>
http://www.example.com/test.html 204.244.59.33 19970101013145 text/html 440
HTTP/1.0 200 OK
Date: Wed, 01 Jan 1997 01:21:13 GMT
Server: Apache/1.0.3
Content-type: text/html
Content-length: 270
Last-modified: Mon, 25 Nov 1996 05:31:24 GMT
</DOCHDR>
<HTML>
<TITLE>Tropical Fish Store</TITLE>
Coming soon!
</HTML>
</DOC>
<DOC>
<DOCNO>WTX001-B01-109</DOCNO>
<DOCHDR>
http://www.example.com/fish.html 204.244.59.33 19970101013149 text/html 440
HTTP/1.0 200 OK
Date: Wed, 01 Jan 1997 01:21:19 GMT
Server: Apache/1.0.3
Content-type: text/html
Content-length: 270
Last-modified: Mon, 25 Nov 1996 05:31:24 GMT
</DOCHDR>
<HTML>
<TITLE>Fish Information</TITLE>
This page will soon contain interesting
information about tropical fish.
</HTML>
</DOC>
```

The next five slides box one part at a time (L11 p9–13):

| Part | Where | Role |
|---|---|---|
| **Document blocks** | `<DOC>` … `</DOC>` | One crawled page each; many per file |
| **Headers** | `<DOCHDR>` … `</DOCHDR>` | Crawl record: URL, server IP, crawl timestamp (`19970101013145`), type, then the HTTP response headers |
| **Content** | `<HTML>` … `</HTML>` | The page itself |
| **Document identifier** | `<DOCNO>` | Unique ID (`WTX001-B01-10`, `WTX001-B01-109`) |
| **Modification tag** | `Last-modified:` | When the server says the page last changed — what a re-crawl compares against ([Week 3 §8](week-03.en-US.md#8-when-to-crawl-again-freshness-and-age)) |

> 💡 **Key Insight**: This is the "large file" idea in practice: a crawler appends `<DOC>` blocks to a big file, and a small index from `DOCNO` (or a URL hash) to a byte offset gives random access.

---

## 6. Compression and BigTable

### 6.1 Compression

**Text is highly redundant (or predictable)** (L11 p14–15; the slide shows the search result for Shannon's 1951 paper "Prediction and Entropy of Printed English"). **Lossless** compression exploits that redundancy to make files smaller **without losing any content**; indexes can be compressed too.

- Popular algorithms compress HTML and XML text by **80%**: e.g. **DEFLATE** (zip, gzip) and **LZW** (Unix `compress`, PDF).
- Large files may be compressed **in blocks** so that one document can be read without decompressing the whole file.

### 6.2 BigTable

**BigTable** is Google's document storage system (L11 p16), customized for **storing, finding and updating** web pages and handling large collections on **inexpensive computers**. The figure shows one **logical table** split into many **tablets**, each held by a server.

Organization (L11 p18–19):

- Logically organized into **rows**; **a row stores the data for a single web page**.
- **Columns can have multiple timestamps** (versions). **A row key, a column key and a timestamp point to a single cell.**
- A row can have a **huge number of columns**: all rows have the **same column groups**, but **not all rows have the same columns** — important for reducing disk reads.
- Rows are **partitioned into tablets by row key** (e.g. URLs starting with a certain letter in one tablet), which makes it simple to find the right server.

The slide's row for `www.example.com`:

| Row key | `text` | `anchor:other.com` | `anchor:null.com` | `title` |
|---|---|---|---|---|
| `www.example.com` | document text | example | click here | example site |

`anchor:` is a column group; each linking site gets its own column holding its anchor text — the "add new anchor text" update from §4.

Advantages and drawbacks (L11 p17):

- **No query language**: no complex queries to optimize.
- **Only row-level transactions.**
- Tablets live in a **replicated file system** accessible by all BigTable servers.
- Any change to a tablet is recorded in a **transaction log**, also in a shared file system.
- If a tablet server crashes, **another server reads the tablet data and log from the file system and takes over**.
- Tablets may be compressed.

> 🔗 **Go deeper**: [Croft §3.6.3 Compression and Large Files (book p. 54)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §3.6.5 BigTable (book p. 57)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 7. Exact Duplicates: Checksums and CRCs

Week 3 named the problem (30% of pages are duplicates; hashes for exact copies, fingerprints for near ones — [Week 3 §7](week-03.en-US.md#7-duplicates-data-noise-client-side-scripting-and-the-deep-web)). L11–L12 give the algorithms.

Duplicates and near duplicates come from **copies, versions, plagiarism, spam and mirror sites**; **30%** of the pages in a large crawl are exact or near duplicates of the rest (**Fetterly et al., 2003**) (L11 p21). They **consume significant resources** during crawling, indexing and search, and add little value to most users (but may add value in some use cases; the slide's "buy" is a typo for "but").

**Exact duplicate detection is relatively easy** (L11 p22–24). A **checksum** is a value computed from the document's content — e.g. the **sum of the bytes** in the file:

| T | r | o | p | i | c | a | l | (space) | f | i | s | h | Sum |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 54 | 72 | 6F | 70 | 69 | 63 | 61 | 6C | 20 | 66 | 69 | 73 | 68 | 508 |

All values are hexadecimal: 508 hex = **1,288** decimal.

- Files with different text **can have the same checksum** — a byte sum ignores order, so any rearrangement of the same bytes collides.
- A **cyclic redundancy check (CRC)** also considers the **positions** of the bytes. It's **still prone to collisions, but very rarely**. Other functions: **BLAKE2/3, MD5, SHA1, SHA2**, etc.
- Whatever you use **needs to be fast** — it runs on every page.

```python
import zlib

for s in [b"Tropical fish", b"Tropical fihs"]:
    print(s, sum(s), hex(sum(s)), hex(zlib.crc32(s)))
# b'Tropical fish' 1288 0x508 0x18f14f94
# b'Tropical fihs' 1288 0x508 0x3ba24de2
```

Swapping two letters keeps the byte sum but changes the CRC.

> 📝 **Practice**: [Worked Example 12.2](#122-a-byte-sum-checksum-l11-p24)

> 🔗 **Go deeper**: [Croft §3.7 Detecting Duplicates (book p. 60)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 8. Near Duplicates and N-gram Fingerprints

**Near-duplicate detection is harder** (L11 p25–27). Are two pages with the same text but different ads or format near duplicates? A near duplicate is **defined by a threshold on some similarity measure** between two documents — e.g. D1 is a near duplicate of D2 if **more than 90% of the words** are the same. "Do you see how you can use Assignment 1 here?" — A1's tokenizing and word counting is exactly what a word-overlap measure needs.

Two scenarios (L11 p28–29):

| Scenario | Task | Cost |
|---|---|---|
| **Search** | Find near duplicates of one document D | $O(N)$ comparisons |
| **Discovery** | Find **all pairs** of near duplicates in the collection | $O(N^2)$ comparisons |

Normal IR techniques work for search; for discovery, you need compact representations called **fingerprints**.

**The fingerprint algorithm** (L11 p30; the boxed parts):

1. **Parse the document into words**; punctuation, HTML tags and extra whitespace are removed.
2. **Group the words into contiguous n-grams** for some n — usually overlapping.
3. **Select some of the n-grams** to represent the document.
4. **Hash the selected n-grams** — faster retrieval, smaller representation.
5. **Store the hash values**, typically in an inverted index.
6. **Compare documents by the overlap of their fingerprints.**

The slide's example (L11 p31–34), built one stage per frame:

- (a) Text: "Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species."
- (b) 3-grams: tropical fish include, fish include fish, include fish found, …, salt water species — 18 words give **16** 3-grams.
- (c) Hash values: `938 664 463 822 492 798 78 969 143 236 913 908 694 553 870 779`.
- (d) Selected using **0 mod 4**: `664 492 236 908`.

(The example hashes every n-gram, then selects; step 3 before 4 in the list is the same idea.) Step through the 16 n-grams; edit the text to use a demo hash:

```viz shingle-fingerprint
{"title": "N-gram fingerprint of the tropical fish text (L11 p30–34)", "interactive": true}
```

**Comparing two fingerprints** (L11 p35–38). With fingerprints $F_A$ and $F_B$, the similarity is the size of the intersection over the size of the union:

$$S_{A,B} = \frac{|F_A \cap F_B|}{|F_A \cup F_B|} \qquad S_{A,B} \ge \tau \implies \text{A and B are near duplicates}$$

$|F|$ is the number of hash values in a set (the slide writes card), and $\tau$ is a threshold **you** choose: they are near duplicates "under your definition of threshold".

> ⚠️ **Pitfall**: "0 mod p" selection keeps only about $1/p$ of the n-grams, and which ones depends only on their hash values, so two copies of the same text select the same ones. Selecting by position ("every 4th n-gram") would not: insert one word at the top and every selected n-gram changes.

> 📝 **Practice**: [Worked Example 12.3](#123-the-tropical-fish-fingerprint-l11-p3134)

> 🔗 **Go deeper**: [Croft §3.7 Detecting Duplicates (book p. 60)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 9. Simhash

Similarity comparisons on **word-based representations** find near duplicates **more effectively** than n-gram fingerprints; their problem is **efficiency** (L12 p4–6). **Simhash** (Charikar, 2002) combines the advantages of word-based similarity with the efficiency of hash fingerprints: the **cosine correlation** between two pages is proportional to the **number of bits that are the same** in their simhash fingerprints.

The algorithm (L12 p7–10, boxed again on p16):

1. Process the document into a **set of features with weights** — here, **words weighted by their frequency**.
2. Generate a **b-bit hash** for each word (b = the fingerprint size); unique per word.
3. In a b-dimensional vector $V$, for every word **add its weight** to component $i$ if bit $i$ of its hash is **1**, **subtract** it if the bit is **0**.
4. After all words, the fingerprint's bit $i$ is **1 if $V_i$ is positive**, 0 otherwise.

The slide's example (L12 p11–15), same text as §8:

- (b) Words with weights: tropical 2, fish 2, include 1, found 1, environments 1, around 1, world 1, including 1, both 1, freshwater 1, salt 1, water 1, species 1 (in, the, and are left out).
- (c) 8-bit hash values:

| Word | Hash | Word | Hash | Word | Hash |
|---|---|---|---|---|---|
| tropical | `01100001` | fish | `10101011` | include | `11100110` |
| found | `00011110` | environments | `00101101` | around | `10001011` |
| world | `00101010` | including | `11000000` | both | `10101110` |
| freshwater | `00111111` | salt | `10110101` | water | `00100101` |
| species | `11101110` | | | | |

- (d) $V$ = **1 −5 9 −9 3 1 3 3**.
- (e) Fingerprint = **1 0 1 0 1 1 1 1**.

L12 p14 checks the last component: tropical `01100001` → `- + + - - - - +`, fish → `+ - + - + - + +`, include → `+ + + - - + + -`, and down the last column: $3 = 2 + 2 - 1 - 1 + 1 + 1 - 1 - 1 - 1 + 1 + 1 + 1 - 1$. The demo adds one word per step:

```viz simhash
{"title": "Simhash of the tropical fish text (L12 p7–16)", "interactive": true}
```

**Comparing two simhashes** (L12 p17–18): the similarity is the **fraction of the n bits that are the same**:

$$S_{A,B} = \frac{\sum_n (H_A \equiv_{\text{bitwise}} H_B)}{n} \qquad S_{A,B} \ge \tau \implies \text{near duplicates}$$

$H_A, H_B$ are the two fingerprints, $\equiv_{\text{bitwise}}$ counts 1 for each position where the bits agree, $n$ is the number of bits — equivalently $1 - \text{Hamming distance}/n$.

> ⚠️ **Pitfall**: Simhash is the opposite of a normal hash. A good hash changes completely when one byte changes (§7); simhash is built so that similar documents get fingerprints that differ in **few** bits — a one-word edit only moves $V$ by that word's weight.

> 📝 **Practice**: [Worked Example 12.4](#124-simhash-of-the-tropical-fish-text-l12-p1115)

> 🔗 **Go deeper**: [Croft §3.7 Detecting Duplicates (book p. 60)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 10. Removing Noise: Finding Content Blocks

Many web pages contain text, links and pictures **not related to the main content** (L12 p20). This material is mostly **noise** that could hurt the page's ranking. Techniques detect the **content blocks**; non-content material is **ignored or reduced in importance** at indexing time.

The noise example (L12 p21–22): a news page with its banner and side columns boxed as **noise blocks**, and a CNN.com "Science & Space" article ("Aquarium plays whale shark matchmaker") whose story text is boxed as the **content block**, surrounded by navigation, a search box and ads. "So how can you detect content?"

**Technique 1: cumulative distribution of tags** — the *document slope curve* (Finn, Kushmerick & Smyth, 2001), introduced in [Week 3 §7](week-03.en-US.md#7-duplicates-data-noise-client-side-scripting-and-the-deep-web) (L12 p23–24). Walk through the page's tokens and count the tags seen so far: **token count** (0–3,500) on x, **tag count** (0–1,000) on y. The curve climbs steadily through tag-heavy navigation, and the **main text is the "plateau" in the middle** (marked "Text area", around 1,000–1,500 tokens), where many tokens pass with almost no tags.

As an optimization problem (L12 p25–27): represent the page as a **sequence of bits**, $b_n = 1$ if the $n$th token is a **tag**. Find $i$ and $j$ that maximize the number of **tags below $i$ and above $j$** plus the number of **non-tag tokens between $i$ and $j$**:

$$\max_{i,\,j} \; \sum_{n=0}^{i-1} b_n \;+\; \sum_{n=i}^{j} (1 - b_n) \;+\; \sum_{n=j+1}^{N-1} b_n$$

$N$ is the number of tokens; tokens $i$ … $j$ are the content block. The first and last sums reward tags *outside* the block, the middle one rewards text *inside* it.

**Alternative** (L12 p28): cut the curve into vertical **slices**, determine the **slope** inside each, and iterate, reducing the slice size until you find **zero-slope windows**.

**Other approaches** (L12 p29) use the **Document Object Model (DOM)** structure and **visual (layout) features**: an HTML parser turns HTML into a DOM tree. The slide's CNN tree: `#document` → `HTML` → `HEAD`, `BODY` (`contentArea`), with `DIV`s and `TABLE`s named `cnnCeil`, `cnnBreakingNewsBanner`, `iframecnnBreakingNewsBanner`, `cnnCeilSearch`, `cnnArticleWireFrame`, `cnnFootBox`, `csiIframe` — and, highlighted, `TABLE` → `TBODY` → `TR` → **`TD` `cnnArticleContent`**, the article.

> 🔗 **Go deeper**: [Croft §3.8 Removing Noise (book p. 63)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 11. Text Statistics and Zipf's Law

**Processing text** is the essential step that converts documents to **index terms** (L12 p32). Why not index the raw strings?

- Matching **the exact string of characters** the user typed is **too restrictive** for web search — it doesn't work well for effectiveness (e.g. case-sensitive search may or may not be what you want).
- **Not all words are of equal value** in a search.
- Sometimes it isn't clear **where words begin and end** — not even what a word is, in languages like Chinese and Korean.

(Tokenizing, stopping and stemming are Week 5.)

**Text statistics** (L12 p33–34): text uses a huge variety of words, but **many statistical characteristics of word occurrences are predictable**, e.g. the distribution of word counts. **Retrieval models and ranking algorithms depend heavily on them**: the important words for retrieval **occur often in a document but are not frequent in the corpus**.

**Zipf's law** (L12 p35–36). The distribution of word frequencies is **very skewed**: a few words occur very often, many hardly ever. The two most common words ("the", "of") make up **about 10%** of all word occurrences. Zipf's "law": **the frequency of the $r$-th most common word is inversely proportional to $r$** — rank times frequency is about constant:

$$r \cdot f \approx k \qquad\text{or}\qquad r \cdot P_r \approx c, \quad c \approx 0.1 \text{ for English}$$

$r$ is the rank (words sorted by decreasing frequency), $f$ the word's frequency, $P_r$ its probability of occurrence (frequency / total word occurrences), and $k$, $c$ constants. L12 p37 plots $P_r$ (0–0.1) against rank (0–100) for English: a curve that starts near 0.1, drops steeply over the first ~10 ranks, then flattens close to 0 — the shape of $0.1/r$.

**AP89** (Associated Press 1989 news) statistics (L12 p38):

| Statistic | Value |
|---|---|
| Total documents | 84,678 |
| Total word occurrences | 39,749,179 |
| Vocabulary size (unique words) | 198,763 |
| Words occurring > 1000 times | 4,169 |
| Words occurring once | 70,064 |

AP89's most frequent words ($P_r$ in %):

| Word | Freq. | r | $P_r$ (%) | $r \cdot P_r$ | Word | Freq. | r | $P_r$ (%) | $r \cdot P_r$ |
|---|---|---|---|---|---|---|---|---|---|
| the | 2,420,778 | 1 | 6.49 | 0.065 | has | 136,007 | 26 | 0.37 | 0.095 |
| of | 1,045,733 | 2 | 2.80 | 0.056 | are | 130,322 | 27 | 0.35 | 0.094 |
| to | 968,882 | 3 | 2.60 | 0.078 | not | 127,493 | 28 | 0.34 | 0.096 |
| a | 892,429 | 4 | 2.39 | 0.096 | who | 116,364 | 29 | 0.31 | 0.090 |
| and | 865,644 | 5 | 2.32 | 0.120 | they | 111,024 | 30 | 0.30 | 0.089 |
| in | 847,825 | 6 | 2.27 | 0.140 | its | 111,021 | 31 | 0.30 | 0.092 |
| said | 504,593 | 7 | 1.35 | 0.095 | had | 103,943 | 32 | 0.28 | 0.089 |
| for | 363,865 | 8 | 0.98 | 0.078 | will | 102,949 | 33 | 0.28 | 0.091 |
| that | 347,072 | 9 | 0.93 | 0.084 | would | 99,503 | 34 | 0.27 | 0.091 |
| was | 293,027 | 10 | 0.79 | 0.079 | about | 92,983 | 35 | 0.25 | 0.087 |
| on | 291,947 | 11 | 0.78 | 0.086 | i | 92,005 | 36 | 0.25 | 0.089 |
| he | 250,919 | 12 | 0.67 | 0.081 | been | 88,786 | 37 | 0.24 | 0.088 |
| is | 245,843 | 13 | 0.65 | 0.086 | this | 87,286 | 38 | 0.23 | 0.089 |
| with | 223,846 | 14 | 0.60 | 0.084 | their | 84,638 | 39 | 0.23 | 0.089 |
| at | 210,064 | 15 | 0.56 | 0.085 | new | 83,449 | 40 | 0.22 | 0.090 |
| by | 209,586 | 16 | 0.56 | 0.090 | or | 81,796 | 41 | 0.22 | 0.090 |
| it | 195,621 | 17 | 0.52 | 0.089 | which | 80,385 | 42 | 0.22 | 0.091 |
| from | 189,451 | 18 | 0.51 | 0.091 | we | 80,245 | 43 | 0.22 | 0.093 |
| as | 181,714 | 19 | 0.49 | 0.093 | more | 76,388 | 44 | 0.21 | 0.090 |
| be | 157,300 | 20 | 0.42 | 0.084 | after | 75,165 | 45 | 0.20 | 0.091 |
| were | 153,913 | 21 | 0.41 | 0.087 | us | 72,045 | 46 | 0.19 | 0.089 |
| an | 152,576 | 22 | 0.41 | 0.090 | percent | 71,956 | 47 | 0.19 | 0.091 |
| have | 149,749 | 23 | 0.40 | 0.092 | up | 71,082 | 48 | 0.19 | 0.092 |
| his | 142,285 | 24 | 0.38 | 0.092 | one | 70,266 | 49 | 0.19 | 0.092 |
| but | 140,880 | 25 | 0.38 | 0.094 | people | 68,988 | 50 | 0.19 | 0.093 |

"Biggest variations: highest frequency words — but if you keep digging…": $r \cdot P_r$ swings from 0.056 to 0.140 in the top 10, then settles between 0.081 and 0.096 from rank 11 to 50, close to Zipf's $c \approx 0.1$.

**Zipf's law for AP89** (L12 p39) is a **log-log** plot: probability ($10^{-8}$ to 1) against rank (1 to $10^6$), with the Zipf line $P_r = 0.1/r$ (a straight line, slope −1) and the AP89 points. The points follow the line through the middle ranks, sit **below** it at the very top ranks (the first few words), and **fall away** below it for ranks past ~10,000, ending in flat steps of rare words. **Note the problems at high and low frequencies.** Words that occur only once are **hapax legomena** (ἅπαξ λεγόμενον, "said once") — 70,064 of AP89's 198,763 words, about 35%.

> ⚠️ **Pitfall**: The slide's $P_r$ column doesn't use the 39,749,179 total from the left-hand table: dividing by it gives "the" = 6.09%, not 6.49%. The column is consistent with a total of about 37.3 million occurrences, so every $P_r$ and $r \cdot P_r$ in it is ≈ 6% higher than the left table implies. The Zipf conclusion doesn't change. → [Worked Example 12.5](#125-checking-zipfs-law-on-ap89-l12-p3539)

> 🔗 **Go deeper**: [Croft §4.1 From Words to Terms (book p. 73)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §4.2 Text Statistics (book p. 75)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §4.2.1 Vocabulary Growth (book p. 80)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Croft §4.2.2 Estimating Collection and Result Set Sizes (book p. 83)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 12. Worked Examples (with Solutions)

### 12.1 UTF-8 encoding of π (L10 p13)

π is Unicode code point 960. What bytes does UTF-8 store? How many bytes in UTF-32?

> ✍️ **Try it first.**

**Solution.** 960 = `0x3C0` = `00000011 11000000`. It's in 128–2047, so the template is `110xxxxx 10xxxxxx`, with 5 + 6 = 11 payload bits: 960 in 11 bits is `01111000000`. High 5 bits `01111` → `110`+`01111` = `11001111`; next 6 bits `000000` → `10`+`000000` = `10000000`. Result **`CF 80`**, 2 bytes. UTF-32 always uses 4: `00 00 03 C0`. Back to [§3](#3-unicode-and-utf-8).

### 12.2 A byte-sum checksum (L11 p24)

Sum the bytes of "Tropical fish". Is a byte sum a safe way to detect exact duplicates?

> ✍️ **Try it first.**

**Solution.** In hex, 54 + 72 + 6F + 70 + 69 + 63 + 61 + 6C + 20 + 66 + 69 + 73 + 68 = **508 hex = 1,288**. It's not safe: the sum ignores order, so "Tropical fihs" also sums to 1,288. A CRC weighs bytes by position: CRC-32 gives `0x18f14f94` vs `0x3ba24de2`. Back to [§7](#7-exact-duplicates-checksums-and-crcs).

### 12.3 The tropical fish fingerprint (L11 p31–34)

With the slide's 3-grams and hash values, which values does "0 mod 4" select?

> ✍️ **Try it first.**

**Solution.** 18 words → 18 − 3 + 1 = 16 3-grams. Remainders mod 4:

| Hash | 938 | 664 | 463 | 822 | 492 | 798 | 78 | 969 | 143 | 236 | 913 | 908 | 694 | 553 | 870 | 779 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| mod 4 | 2 | **0** | 3 | 2 | **0** | 2 | 2 | 1 | 3 | **0** | 1 | **0** | 2 | 1 | 2 | 3 |

$F$ = {664, 492, 236, 908}: 4 of 16 values, from "fish include fish", "found in tropical", "the world including" and "including both freshwater". Comparing it with another document's fingerprint uses $|F_A \cap F_B| / |F_A \cup F_B| \ge \tau$. Back to [§8](#8-near-duplicates-and-n-gram-fingerprints).

### 12.4 Simhash of the tropical fish text (L12 p11–15)

Using the slide's weights and 8-bit hashes, compute $V$ and the fingerprint.

> ✍️ **Try it first.**

**Solution.** Each word adds +weight for a 1 bit and −weight for a 0 bit. Column by column:

| Bit | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|---|
| $V$ | 1 | −5 | 9 | −9 | 3 | 1 | 3 | 3 |
| Fingerprint | 1 | 0 | 1 | 0 | 1 | 1 | 1 | 1 |

Bit 8, as on L12 p14: tropical +2, fish +2, include −1, found −1, environments +1, around +1, world −1, including −1, both −1, freshwater +1, salt +1, water +1, species −1 → 3 > 0 → 1. Fingerprint **10101111**, matching the slide. Two documents with simhashes $H_A, H_B$ are compared by the fraction of the 8 bits that agree, against $\tau$. Back to [§9](#9-simhash).

### 12.5 Checking Zipf's law on AP89 (L12 p35–39)

From the AP89 tables: how much of the text are "the" and "of"? Does $r \cdot P_r$ stay near 0.1? What fraction of the vocabulary are hapax legomena?

> ✍️ **Try it first.**

**Solution.**

- "the" + "of": slide $P_r$ 6.49% + 2.80% = **9.29%** — the "about 10%". From the frequencies and the 39,749,179 total, it's 3,466,511 / 39,749,179 = **8.7%**.
- $r \cdot P_r$: rank 1 gives 0.065, rank 2 0.056, rank 6 0.140 (biggest swings); ranks 11–50 stay in **0.081–0.096**. Recomputing $r \times P_r$ from the slide's own rounded $P_r$ gives 0.116 for "and" (slide 0.120) and 0.136 for "in" (slide 0.140) — rounding.
- With the left table's total, $r \cdot P_r$ is lower, e.g. "the" 2,420,778 / 39,749,179 = 0.061, "people" 50 × 68,988 / 39,749,179 = 0.087; the slide's column implies a total of ≈ 37.3M (see the pitfall in §11).
- Hapax legomena: 70,064 / 198,763 = **35%** of the vocabulary occurs exactly once; only 4,169 words (2.1%) occur more than 1,000 times.

Zipf holds roughly in the middle and breaks at both ends — the problems at high and low frequencies of L12 p39. Back to [§11](#11-text-statistics-and-zipfs-law).

---

## 13. Quick Reference & Top 5 Things to Remember

| Encoding | Bytes per character | Note |
|---|---|---|
| ASCII | 1 (7 bits used) | 128 characters, English only |
| UTF-8 | 1–4 | ASCII-compatible; templates `0xxxxxxx`, `110xxxxx 10xxxxxx`, `1110xxxx` + 2, `11110xxx` + 3 |
| UTF-32 | 4 | Fixed width: fast random access, more memory |

| Duplicate-detection method | Detects | How | Similarity |
|---|---|---|---|
| Checksum (byte sum) | Exact | Sum of bytes | Equal or not; order-blind collisions |
| CRC, MD5, SHA, BLAKE | Exact | Position-aware hash | Equal or not; rare collisions |
| N-gram fingerprint | Near | n-grams → hashes → keep 0 mod p | $\lvert F_A \cap F_B\rvert / \lvert F_A \cup F_B\rvert \ge \tau$ |
| Simhash | Near | weights × ±hash bits → sign of $V$ | equal bits / n $\ge \tau$ |

| Storage / noise | Key idea |
|---|---|
| Large files, TREC Web | Many `<DOC>` blocks per file: less file I/O, seek once |
| Compression | Lossless, ~80% on HTML/XML (DEFLATE, LZW), in blocks |
| BigTable | Row = page; (row key, column key, timestamp) → cell; tablets by row key |
| Content blocks | Plateau of the cumulative tag curve; maximize tags outside + text inside $[i, j]$ |

| Zipf | Value |
|---|---|
| Law | $r \cdot f \approx k$, $r \cdot P_r \approx c \approx 0.1$ (English) |
| AP89 | 39.7M words, 198,763 unique, 70,064 hapax legomena |

**Top 5 things to remember**

1. Unicode maps glyphs to numbers; UTF-8/16/32 map numbers to bytes. π = U+03C0 = 960 → `110`01111 `10`000000 = `CF 80`.
2. Search engines store documents in big compound files (TREC Web) or BigTable — random access by URL hash, compression, updates — not one file per page.
3. Exact duplicates: checksums/CRCs; near duplicates: n-gram fingerprints ("0 mod p" selection, intersection over union ≥ τ) or simhash (fraction of equal bits ≥ τ).
4. Simhash: $V_i$ += weight if bit $i$ is 1, −= weight if 0; bit = 1 if $V_i > 0$ — similar documents get similar fingerprints.
5. Zipf: rank × probability ≈ 0.1; a few words dominate, and ~35% of AP89's vocabulary occurs once; the law bends at both ends.
