# CS 121: Information Retrieval — Week 6: Inverted Index, Index Construction, Query Processing

## Table of Contents

- [1. Where We Are: From the Matrix to the Index](#1-where-we-are-from-the-matrix-to-the-index)
- [2. The Inverted Index: Dictionary and Postings](#2-the-inverted-index-dictionary-and-postings)
- [3. Building It: The Indexer Steps](#3-building-it-the-indexer-steps)
- [4. Does the Index Fit in Memory?](#4-does-the-index-fit-in-memory)
- [5. Query Processing: AND by Merging Postings](#5-query-processing-and-by-merging-postings)
- [6. The Boolean Retrieval Model](#6-the-boolean-retrieval-model)
- [7. Indexes and Ranking: The Abstract Model](#7-indexes-and-ranking-the-abstract-model)
- [8. Richer Postings: Counts, Positions, Extents, Scores](#8-richer-postings-counts-positions-extents-scores)
- [9. The Simple In-Memory Indexer and DocIDs](#9-the-simple-in-memory-indexer-and-docids)
- [10. Scaling Index Construction: Hardware Basics](#10-scaling-index-construction-hardware-basics)
- [11. In-class Notes & Assignment Tips](#11-in-class-notes--assignment-tips)
- [12. Worked Examples (with Solutions)](#12-worked-examples-with-solutions)
- [13. Quick Reference & Top 5 Things to Remember](#13-quick-reference--top-5-things-to-remember)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Nov 4
> Built from the Lecture 15 and 16 slides (the YuJa videos are not included; the in-class Lecture 14.5 deck wasn't posted). Organized by concept, not by lecture.
> 📖 Readings this week: [Croft et al., Ch 5 Ranking with Indexes](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Manning, Raghavan & Schütze, *Introduction to IR*, Ch 2 and 4](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

> 📅 **Class logistics**: Online Quiz 2 is in class on **Wednesday, Nov 4** (bring your laptop).
> Assignment 3 Milestone 1 (the indexer) is due **Friday, Nov 6**.
> Next week: **no in-person class on Nov 11** (Veterans Day); Assignment 3 Milestone 2 is due **Friday, Nov 13**.

---

## 1. Where We Are: From the Matrix to the Index

Both decks open on the architecture diagram (L15 p2, p28 · L16 p2; the full diagram is in [Week 1 §10](week-01.en-US.md#10-search-engine-architecture)). This week lives in two boxes: **Index Creation** (building the index from processed text) and the **Querying Process** side (using the index to answer a query).

L15 starts by replaying the end of Lecture 14 (L15 p3–9): the Shakespeare query *Brutus AND Caesar but NOT Calpurnia*, the term-document **incidence matrix**, and answering it with **bitwise AND** over 0/1 rows (result `1 0 0 1 0 0` = *Antony and Cleopatra* and *Hamlet*). That's all in [Week 5 §13](week-05.en-US.md#13-the-term-document-incidence-matrix), with a demo.

The "Problem" slide (L15 p9) is the bridge to this week: the matrix is **unfeasible for a large number of documents** because of its size — **but the matrix is sparse**. The numbers are in [Week 5 §14](week-05.en-US.md#14-why-the-matrix-doesnt-scale). "So…" → store only the 1s. That's the inverted index.

---

## 2. The Inverted Index: Dictionary and Postings

### 2.1 One list per term

**For each term *t*, store a list of all documents that contain *t*** (L15 p10–13). Each document is identified by a **docID**, a document serial number.

```text
Brutus    → 1  2  4  11  31  45  173  174
Caesar    → 1  2  4   5   6  16   57  132
Calpurnia → 2  31 54 101
```

The slide's question: **can we use fixed-size arrays for this?** What happens if the word *Caesar* is added to document 14? (Answer in [Worked Example 12.1](#121-adding-caesar-to-document-14-l15-p1114).) So we need **variable-size postings lists** (L15 p14):

- **On disk**, a **continuous run of postings** is the optimal solution.
- **In memory**, use linked lists, variable-length arrays, or associative arrays — with some **trade-offs in size and ease of insertion**.

The vocabulary on that slide:

| Part | What it is |
|---|---|
| **Dictionary** | The terms (Brutus, Caesar, Calpurnia) |
| **Postings** | All the lists together |
| **Posting** | One entry of a list (one docID) |

The lists are **sorted by docID** ("more later on why" — the reason is the merge in [§5](#5-query-processing-and-by-merging-postings)).

In code, the inverted index is normally a **map/dictionary with the term as the key and the postings list as the value** (L15 p15): `friend → 2, 4, …`, `roman → 1, 2, …`, `countryman → 13, 16`.

### 2.2 Indexes in general, and the terminology

**Indexes are data structures designed to make search faster** (L15 p38–39 · L16 p3). Text search has unique requirements, which leads to unique data structures. The most common one is the **inverted index**:

- it's a **general name for a class of structures**, not one fixed layout;
- it's "**inverted**" because **documents are associated with words**, rather than words with documents — similar to a **concordance** (the index at the back of a book).

Croft's terms (L15 p46):

- Each index term is associated with an **inverted list**. It contains lists of documents, or lists of word occurrences in documents, plus other information.
- Each entry is a **posting**. The part of the posting that refers to a specific document or location is the **pointer**.
- Each document in the collection gets a **unique number**.
- Lists are usually **document-ordered** (sorted by document number).

### 2.3 The running example: S1–S4

The Croft example used in both decks (L15 p47 · L16 p9) indexes four sentences about tropical fish:

- **S1** Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species.
- **S2** Fishkeepers often use the term tropical fish to refer only those requiring fresh water, with saltwater tropical fish referred to as marine fish.
- **S3** Tropical fish are popular aquarium fish, due to their often bright coloration.
- **S4** In freshwater fish, this coloration typically derives from iridescence, while salt water fish are generally pigmented.

Its **simple inverted index** (each posting = a sentence number; 46 terms):

```text
and          1          marine       2           species      1
aquarium     3          often        2 3         term         2
are          3 4        only         2           the          1 2
around       1          pigmented    4           their        3
as           2          popular      3           this         4
both         1          refer        2           those        2
bright       3          referred     2           to           2 3
coloration   3 4        requiring    2           tropical     1 2 3
derives      4          salt         1 4         typically    4
due          3          saltwater    2           use          2
environments 1          fish         1 2 3 4     water        1 2 4
fishkeepers  2          found        1           while        4
fresh        2          freshwater   1 4         with         2
from         4          generally    4           world        1
in           1 4        include      1
including    1          iridescence  4
```

> 💡 **Key Insight**: The index never stores the 0s. `fish` has 4 postings, `marine` has 1 — space grows with the number of (term, document) pairs, not terms × documents.

> 📝 **Practice**: [Worked Example 12.1](#121-adding-caesar-to-document-14-l15-p1114)

> 🔗 **Go deeper**: [Croft §5.3 Inverted Indexes and §5.3.1 Documents (book p. 129, 131)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR Ch 1–2](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 3. Building It: The Indexer Steps

### 3.1 The pipeline

Inverted index construction (L15 p16–19, built up one stage per frame):

| Stage | Example |
|---|---|
| Documents to be indexed | `Friends, Romans, countrymen.` |
| **Tokenizer** → token stream | `Friends` `Romans` `Countrymen` |
| **Text processing: linguistic modules** → modified tokens | `friend` `roman` `countryman` |
| **Indexer** → inverted index | `friend → 2 → 4`, `roman → 1 → 2`, `countryman → 13 → 16` |

The **typical minimal stages of text processing** (L15 p20) are the Week 5 topics: **tokenization** (cut the character sequence into word tokens; deal with "John's", *a state-of-the-art solution*), **normalization** (map text and query terms to the same form: you want *U.S.A.* and *USA* to match), **stemming, perhaps** (*authorize*, *authorization*), and **stop words, perhaps** (*the, a, to, of* — may be omitted, or not). Details: [Week 5 §3 Tokenizing](week-05.en-US.md#3-the-tokenizing-process), [§4 Stopping](week-05.en-US.md#4-stopping), [§5 Stemming](week-05.en-US.md#5-stemming).

> ⚠️ **Pitfall**: Whatever you do to document tokens, you must do to **query** terms too (that's what "map text and query term to the same form" means). Stem *authorization* in the index but not in the query, and the query misses.

### 3.2 Token sequence → sort → dictionary and postings

The two documents (L15 p21):

- **Doc 1**: *I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me.*
- **Doc 2**: *So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious*

1. **Token sequence** (L15 p21): a sequence of **(modified token, document ID) pairs**, in text order — `(I, 1) (did, 1) (enact, 1) … (me, 1) (so, 2) … (ambitious, 2)`: 29 pairs.
2. **Sort** (L15 p22) by term, then by docID: `(ambitious, 2) (be, 2) (brutus, 1) (brutus, 2) (caesar, 1) (caesar, 2) (caesar, 2) (capitol, 1) …`.
3. **Merge and split** (L15 p22): multiple entries of a term in a single document are **merged**; the result is split into a **dictionary** and **postings**; **document frequency** (number of documents containing the term) is added to the dictionary. "Why frequency? Will discuss later."

Result: 22 terms. The ones with two postings are `brutus`, `caesar`, `the`, `was` (df = 2, postings `1 → 2`); every other term has df = 1.

> ⚠️ **Slide error** (L15 p22): the sorted table lists `hath | 1`, but *hath* is only in Doc 2. The postings column on the same slide (and on p23) correctly shows `hath → 2`. The same table also lists `capitol` before `caesar`.

Step through the construction — or type your own documents (`docID: text; docID: text`):

```viz inverted-index
{"title": "Indexer steps on Doc 1 and Doc 2 (L15 p21–23)", "docs": "1: I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me. ; 2: So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious", "postings": "docs", "interactive": true}
```

### 3.3 Where do we pay in storage?

L15 p23 points at the two parts of the result: the **terms and counts** (the dictionary) and the **lists of docIDs** (the postings). The two questions for IR system implementation: **how do we index efficiently?** and **how much storage do we need?** — [§4](#4-does-the-index-fit-in-memory), [§9](#9-the-simple-in-memory-indexer-and-docids) and [§10](#10-scaling-index-construction-hardware-basics).

> 📝 **Practice**: [Worked Example 12.2](#122-index-doc-1-and-doc-2-l15-p2123)

> 🔗 **Go deeper**: [Croft §5.6.1 Simple Construction (book p. 156)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR Ch 1, Ch 2](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 4. Does the Index Fit in Memory?

**Inverted index for small data** (L15 p24–25). If it fits in memory, use Python's dictionaries `{}` (or Java's `HashMap`):

- fill it during indexing,
- write it to a file,
- load it back into the dict/HashMap for search.

Very simple to implement… **but this will not work in any realistic web search engine**.

**Inverted index for large data** — a back-of-the-envelope calculation (L15 p26):

| Quantity | Value |
|---|---|
| Vocabulary | 50,000 tokens |
| Average postings list size | 20 |
| Postings | 50,000 × 20 = **1,000,000** |
| DocID = URL, average 50 characters | ≈ 100 bytes each (Python) |
| Postings storage | 1,000,000 × 100 = **100,000,000 bytes = 100 MB** |
| Plus payload per posting (e.g. tf-idf), 4 bytes each | many more MB |

And the web comprises **far more than 10⁶ documents** (hosts alone are more than 10⁹). So **usually the index does not fit in memory all at once** → out-of-memory errors.

> 💡 **Key Insight**: Two levers come out of this slide: make postings smaller (integer docIDs instead of URLs, [§9.2](#92-docids-urls-vs-integers)) and stop assuming the whole index is in RAM ([§10](#10-scaling-index-construction-hardware-basics)).

> 📝 **Practice**: [Worked Example 12.3](#123-how-big-is-the-index-l15-p26)

---

## 5. Query Processing: AND by Merging Postings

"The index we just built: how do we process a query?" (L15 p27–29; *what kinds of queries can we process* comes later.)

Query **Brutus AND Caesar** (L15 p30):

1. Locate *Brutus* in the dictionary; retrieve its postings.
2. Locate *Caesar* in the dictionary; retrieve its postings.
3. **"Merge"** the two postings: **intersect** the document sets.

```text
Brutus → 2 → 4 → 8 → 16 → 32 → 64 → 128
Caesar → 1 → 2 → 3 → 5 → 8 → 13 → 21 → 34
answer:  2, 8
```

**The merge** (L15 p31): walk through the two postings **simultaneously**, in time **linear in the total number of postings entries**. If the list lengths are $x$ and $y$, the merge at query time takes $O(x+y)$ operations. **Crucial: postings sorted by docID.**

The algorithm (L15 p32):

```text
INTERSECT(p1, p2)
 1  answer ← ⟨ ⟩
 2  while p1 ≠ NIL and p2 ≠ NIL
 3  do if docID(p1) = docID(p2)
 4        then ADD(answer, docID(p1))
 5             p1 ← next(p1)
 6             p2 ← next(p2)
 7        else if docID(p1) < docID(p2)
 8                then p1 ← next(p1)
 9                else p2 ← next(p2)
10  return answer
```

The same thing in Python, with list indexes as the pointers:

```python
def intersect(p1, p2):
    """INTERSECT from L15 p32, on Python lists."""
    answer = []
    i = j = 0
    while i < len(p1) and j < len(p2):
        if p1[i] == p2[j]:
            answer.append(p1[i])
            i += 1
            j += 1
        elif p1[i] < p2[j]:
            i += 1
        else:
            j += 1
    return answer

brutus = [2, 4, 8, 16, 32, 64, 128]
caesar = [1, 2, 3, 5, 8, 13, 21, 34]
print(intersect(brutus, caesar))   # [2, 8]
```

Why the smaller pointer may move: if `p1[i] < p2[j]`, the other list has already passed `p1[i]` (it's sorted), so document `p1[i]` can't be in both. Try your own lists (`list1 | list2`):

```viz postings-intersect
{"title": "Brutus AND Caesar (L15 p30–32)", "lists": "2 4 8 16 32 64 128 | 1 2 3 5 8 13 21 34", "terms": "Brutus, Caesar", "interactive": true}
```

> ⚠️ **Pitfall**: The $O(x+y)$ merge depends on both lists being **sorted by docID** (L15 p31) — that's the "more later on why" of L15 p14.

> 📝 **Practice**: [Worked Example 12.4](#124-brutus-and-caesar-by-merging-l15-p3032)

> 🔗 **Go deeper**: [Croft §5.7 Query Processing (book p. 165)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR Ch 1 (processing Boolean queries)](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 6. The Boolean Retrieval Model

**Boolean queries: exact match** (L15 p33–34):

- In the **Boolean retrieval model**, queries are Boolean expressions joining terms with **AND, OR and NOT**.
- It views each document as a **set of words**.
- It is **precise**: a document **matches the condition or not** — no ranking.
- Perhaps the simplest model to build an IR system on; the **primary commercial retrieval tool for 3 decades**.
- Many search systems are still Boolean: **email, library catalogs, macOS Spotlight**.

**Example: WestLaw** (L15 p35–37), the largest commercial (paying subscribers) legal search service: started 1975, ranking added 1992, federated search added 2010; tens of terabytes of data, ~700,000 users. The slide shows its Advanced Search page (fields for terms, connectors and expanders, date and citation restrictions). **The majority of users still use Boolean queries** — in law, it is important to have **"exact"** results.

| Information need | WestLaw query |
|---|---|
| What is the statute of limitations in cases involving the federal tort claims act? | `LIMIT! /3 STATUTE ACTION /S FEDERAL /2 TORT /3 CLAIM` |
| Requirements for disabled people to be able to access a workplace | `disabl! /p access! /s work-site work-place (employment /3 place` |

`/3` = within 3 words, `/S` = in the same sentence. **Note that SPACE is disjunction (OR), not conjunction!**

These are long, precise queries with proximity operators, developed incrementally — **not like web search**. Many professional searchers still like Boolean search: **you know exactly what you are getting**.

> ⚠️ **Pitfall**: In WestLaw, `work-site work-place` means work-site **OR** work-place. In Assignment 3 MS2 it's the opposite: `cristina lopes` means AND ([§11](#11-in-class-notes--assignment-tips)). The space operator is a design choice of each system.

> 🔗 **Go deeper**: [WestLaw (slide link)](http://www.westlaw.com/) · [IIR Ch 1 (the Boolean retrieval model)](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 7. Indexes and Ranking: The Abstract Model

**Indexes and ranking** (L15 p40): indexes are designed to support search — **faster response time, and updates**. Web search engines use a particular form of search, **ranking**: documents are retrieved **in sorted order** according to a **score** computed from the document representation, the query and a ranking algorithm. A reasonable **abstract model of ranking** lets us discuss indexes without the details of a retrieval model.

**Abstract model of ranking** (L15 p41–44 · L16 p4–7, built up over four frames). The document is *Fred's Tropical Fish Shop* ("…the best place to find tropical fish at low, low prices. Whether you're looking for a little fish or a big fish… We even have fake seaweed for your fishtank (and little surfboards too).").

| Topical features (from the text) | Quality features (about the document) |
|---|---|
| 9.7 fish · 4.2 tropical · 22.1 tropical fish · 8.2 seaweed · 4.2 surfboards | 14 incoming links · 3 days since last update |

A **feature function** maps text to a real number, $f(\text{text}) \to \mathbb{R}$ (L15 p43). The **ranking function** takes the features and the query (*tropical fish*) and produces a **document score** (24.5 in the abstract picture).

**More concrete model** (L15 p45 · L16 p8):

$$R(Q, D) = \sum_i g_i(Q)\, f_i(D)$$

$f_i$ is a **document feature function**, $g_i$ is a **query feature function**, and $i$ runs over the features. The query *tropical fish* has its own feature values:

| Feature $i$ | $f_i(D)$ | $g_i(Q)$ |
|---|---|---|
| fish | 9.7 | 5.2 |
| tropical | 4.2 | 3.4 |
| tropical fish | 22.1 | 9.9 |
| seaweed | 8.2 | — |
| surfboards | 4.2 | — |
| chichlids | — | 1.2 |
| barbs | — | 0.7 |
| incoming links | 14 | 1.2 |
| update count | 3 | 0.9 |

Only features present on **both** sides contribute, giving the slide's **document score 303.01**.

> 💡 **Key Insight**: Ranking is a sum over features of (query weight × document value). The index's job is to make the $f_i(D)$ cheap to find — which is why [§8](#8-richer-postings-counts-positions-extents-scores) puts more information into postings.

> 📝 **Practice**: [Worked Example 12.5](#125-the-document-score-30301-l15-p45--l16-p8)

> 🔗 **Go deeper**: [Croft §5.2 Abstract Model of Ranking (book p. 126)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 8. Richer Postings: Counts, Positions, Extents, Scores

L16 p9–18 takes the S1–S4 index from [§2.3](#23-the-running-example-s1s4) and adds information to each posting, one kind at a time.

### 8.1 Counts

**Inverted index with counts** (L16 p10): each posting is `docID:count`, the number of times the term occurs in that document. It **supports better ranking algorithms**.

```text
fish      1:2  2:3  3:2  4:2
tropical  1:2  2:2  3:1
to        2:2  3:1
the       1:1  2:1
```

(every other term has count 1 in each of its documents).

### 8.2 Positions and proximity matches

**Inverted index with positions** (L16 p11): each posting is `docID,position` (word number in the sentence), one posting per occurrence. It **supports proximity matches**.

```text
tropical  1,1  1,7  2,6  2,17  3,1
fish      1,2  1,4  2,7  2,18  2,23  3,2  3,6  4,3  4,13
water     1,17  2,14  4,12
```

**Proximity matches** (L16 p12–13): matching **phrases** ("tropical fish") or **words within a window** ("find *tropical* within 5 words of *fish*"). An inverted index whose postings store positions — postings `[docID, word pos]` — makes these query features **efficient**: align the two lists and look for `fish` at position $p+1$ after `tropical` at $p$, in the same document.

```text
tropical  1,1        1,7  2,6  2,17        3,1
fish      1,2  1,4        2,7  2,18  2,23  3,2  3,6  4,3  4,13
```

The phrase *tropical fish* occurs at 1,1–2 · 2,6–7 · 2,17–18 · 3,1–2 (S4 has no *tropical*). The full positional index, built step by step:

```viz inverted-index
{"title": "Positional index of S1–S4 (L16 p11)", "docs": "1: Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species. ; 2: Fishkeepers often use the term tropical fish to refer only those requiring fresh water, with saltwater tropical fish referred to as marine fish. ; 3: Tropical fish are popular aquarium fish, due to their often bright coloration. ; 4: In freshwater fish, this coloration typically derives from iridescence, while salt water fish are generally pigmented.", "postings": "positions"}
```

### 8.3 Fields and extents

**Document structure is useful in search** (L16 p14–15; [Week 5 §11](week-05.en-US.md#11-document-structure-and-markup)):

- **field restrictions** — e.g. date, `from:`, etc.;
- **words in some fields are more important** — e.g. the title!

Options to capture this in the index:

1. **separate inverted indexes for each field type**;
2. **add information about fields to postings**;
3. use **extent lists**.

**Extent lists** (L16 p16): an **extent** is a **contiguous region of a document**, represented with word positions. The inverted list for a **field type** records all extents of that field:

```text
fish   1,2  1,4  2,7  2,18  2,23  3,2  3,6  4,3  4,13
title  1:(1,3)  2:(1,5)  4:(9,15)
```

`1:(1,3)` = a title extent in document 1, given by word positions 1 and 3. To match *fish in the title*, align the two lists: `1,2` falls in `1:(1,3)` and `4,13` falls in `4:(9,15)`; document 2's title `(1,5)` contains no `fish` posting, and document 3 has no title extent.

### 8.4 Scores and score-ordered lists

**Other possibilities** (L16 p17–18):

- **Store precomputed scores** in the inverted list, e.g. the list for *fish* `[(1:3.6), (3:2.2)]`, where 3.6 is the total feature value for document 1. **Improves speed but reduces flexibility** (change the ranking and you must rebuild).
- **Create score-ordered lists**: the query processing engine can **focus only on the top part of each inverted list**, where the highest-scoring documents are. **Very efficient for single-word queries**.

| Posting stores | Example | Enables |
|---|---|---|
| docID | `fish 1 2 3 4` | Boolean queries (AND/OR/NOT) |
| docID:count | `fish 1:2 2:3 3:2 4:2` | better ranking (term frequency) |
| docID,position | `fish 1,2 1,4 …` | phrases, proximity windows |
| extent list per field | `title 1:(1,3) …` | field restrictions, title boosts |
| docID:score | `fish (1:3.6) (3:2.2)` | fast ranking; less flexible |

> 📝 **Practice**: [Worked Example 12.6](#126-find-the-phrase-tropical-fish-l16-p1113)

> 🔗 **Go deeper**: [Croft §5.3.2 Counts (p. 133), §5.3.3 Positions (p. 134), §5.3.4 Fields and Extents (p. 136), §5.3.5 Scores (p. 138), §5.3.6 Ordering (p. 139)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR Ch 2 (positional postings and phrase queries)](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 9. The Simple In-Memory Indexer and DocIDs

### 9.1 BuildIndex

**Simple in-memory indexer** (L16 p19–22; later frames highlight parts of it):

```text
procedure BuildIndex(D)                      ▷ D is a set of text documents
    I ← HashTable()                          ▷ Inverted list storage
    n ← 0                                    ▷ Document numbering
    for all documents d ∈ D do
        n ← n + 1
        T ← Parse(d)                         ▷ Parse document into tokens
        Remove duplicates from T
        for all tokens t ∈ T do
            if I_t ∉ I then
                I_t ← List<Posting>()
            end if
            I_t.append(Posting(n))
        end for
    end for
    return I
end procedure
```

What the highlights point at:

- `n ← 0` / `n ← n + 1` (L16 p22): **document numbering** — docIDs are a counter, not the URL ([§9.2](#92-docids-urls-vs-integers)).
- `List<Posting>()` / `Posting(n)` (L16 p29): what's inside a posting ([§9.3](#93-what-a-posting-holds)).
- `I ← HashTable()` and `return I` (L16 p32): the whole index lives in one in-memory hash table. "What happens if you run out of memory?" (L16 p33) → [§10](#10-scaling-index-construction-hardware-basics).

A runnable Python version, with the slide's `Posting` class (L16 p31) holding a frequency count:

```python
import re

class Posting:
    def __init__(self, docid, tfidf, fields):
        self.docid = docid
        self.tfidf = tfidf  # use freq counts for now
        self.fields = fields

def parse(text):
    return re.findall(r"[a-z0-9']+", text.lower())

def build_index(docs):
    """BuildIndex(D) from L16 p20, with docIDs 1, 2, ..."""
    index = {}                          # I <- HashTable()
    n = 0                               # document numbering
    for d in docs:
        n += 1
        tokens = parse(d)               # T <- Parse(d)
        for t in set(tokens):           # remove duplicates
            if t not in index:
                index[t] = []           # List<Posting>()
            index[t].append(Posting(n, tokens.count(t), []))
    return index

docs = ["I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me.",
        "So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious"]
index = build_index(docs)
for term in ["brutus", "caesar", "killed", "hath"]:
    print(term, [(p.docid, p.tfidf) for p in index[term]])
print(len(index), "terms")
```

```text
brutus [(1, 1), (2, 1)]
caesar [(1, 1), (2, 2)]
killed [(1, 2)]
hath [(2, 1)]
22 terms
```

Same 22 terms as the sort-based steps of [§3.2](#32-token-sequence--sort--dictionary-and-postings). Documents are processed in docID order, so each list comes out sorted by docID without a sort.

### 9.2 DocIDs: URLs vs integers

**If docIDs are URLs** (L16 p23): `https://www.ics.uci.edu/~aburtsev/238P/lectures/lecture03-calling-conventions` is **77 characters** — 77 bytes in C++, 126 bytes in Python 3, 352 bytes in Java. DocIDs are used in postings lists, and depending on the posting structure can appear **several times in the same list**. **Strings are very wasteful to store and to compare.**

**Map URLs to integers as you process documents** (L16 p24):

```text
0 → https://www.ics.uci.edu/~aburtsev/238P/lectures/lecture03-calling-conventions
1 → https://www.ics.uci.edu/~goodrich/teach/ics247/notes
2 → https://www.ics.uci.edu/~thornton/ics184/MidtermSolutions.html
…
```

Integers are **4 bytes in C, C++ and Java**, **28 bytes in Python** — almost always the same size, independent of the string.

The estimate for Python 3 (L16 p25–27): 10,000 index terms, ~20 postings per term, average URL 51 characters (~100 bytes):

| DocIDs as | Size |
|---|---|
| URLs | 10,000 × 20 × 100 ≈ **20,000,000 bytes (20 MB)** |
| integers | 10,000 × 20 × 28 ≈ **5,600,000 bytes (5.6 MB)** |

**Reduced to 28%** of the string version → about **4× more postings fit in memory**, and it is **significantly faster to sort**.

**You must keep that mapping stored somewhere** (L16 p28): you need it to show the search results (users want URLs, not numbers). It's typically **not part of the inverted index itself**, but an **auxiliary bookkeeping structure, serialized to a file** (more on auxiliary structures later).

> ⚠️ **Slide note** (L16 p24): the "converts integers to longs when they overflow" remark describes Python 2; Python 3 has a single arbitrary-precision `int`.

### 9.3 What a posting holds

**Postings contain the context of the term occurrence in a document** (L16 p30–31): the **doc id**, a **frequency count or TF-IDF**, **fields**, **positions**, … The whole list is bracketed **"Required for Project 3"**, and L16 p30 highlights doc id and frequency count / TF-IDF in red:

```python
class Posting:
    def __init__(self, docid, tfidf, fields):
        self.docid = docid
        self.tfidf = tfidf  # use freq counts for now
        self.fields = fields
```

> 📝 **Practice**: [Worked Example 12.7](#127-docids-as-urls-vs-integers-l16-p2327)

> 🔗 **Go deeper**: [Croft §5.5 Auxiliary Structures (p. 154), §5.6 Index Construction (p. 156)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR Ch 4 (index construction)](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 10. Scaling Index Construction: Hardware Basics

**In-memory index construction does not scale** (L16 p33–37): you can't fit the entire collection into memory. How do we construct an index for very large collections — **taking into account hardware constraints**: memory, disk, speed, etc.?

**Hardware basics** (L16 p38–42):

- Servers used in IR systems typically have **several GB of main memory**, sometimes hundreds of GB. Available **disk space is 2–3 orders of magnitude larger**.
- But **fault tolerance is very expensive**: it's much cheaper to use **many regular machines** rather than one fault-tolerant machine — and regular machines have **much smaller RAM**.
- Large-scale storage is based on **spinning disks**. Access to data in memory is **much** faster than access to data on disk.
- **Disk seeks**: no data is transferred while the disk head is being positioned. So transferring **one large chunk** from disk to memory is faster than transferring **many small chunks**.
- **Disk I/O is block-based**: whole blocks are read and written, not smaller chunks. Block sizes: **8 KB to 256 KB**.

Jeff Dean's **"Latency Numbers Every Programmer Should Know"** (L16 p43, 2020 update):

| Operation | Latency |
|---|---|
| L1 cache reference | 0.5–1.5 ns |
| L2 cache reference | 5–7 ns |
| L3 cache reference | 16–25 ns |
| Mutex lock/unlock | 25 ns |
| 64 MB main memory reference | 50–75 ns |
| Send 4 KB over 100 Gbps HPC fabric | 1,040 ns |
| Compress 1 KB with Zippy | 2,000 ns (2 µs) |
| Read 1 MB sequentially from memory | 3,000 ns (3 µs) |
| Send 4 KB over 10 Gbps ethernet | 10,000 ns (10 µs) |
| Read 1 MB sequentially from SSD | 49,000 ns (49 µs) |
| Read 1 MB sequentially from HDD | 825,000 ns (825 µs) |
| Disk seek (up to) | 2,000,000 ns (2,000 µs) |
| Send packet CA → Netherlands → CA | 150,000,000 ns (150,000 µs) |

So back to the indexer's `I ← HashTable()`: **could this be a file, directly?** (L16 p36, p44) **NO.** Compare a disk seek of up to 2 ms with a 50–75 ns memory reference in the table above.

> 💡 **Key Insight**: A disk seek costs tens of thousands of memory references, and one large chunk transfers faster than many small ones (L16 p41). How to build an index that doesn't fit in memory comes next (Week 7 in the Schedule: distributed indexing).

> 🔗 **Go deeper**: [Jeff Dean (slide link)](https://ai.google/research/people/jeff/) · [Original numbers (Norvig)](http://norvig.com/21-days.html#answers) · [2019 version (gist)](https://gist.github.com/eshelman/343a1c46cb3fba142c1afdcdeec17646) · [2020 interactive version](https://colin-scott.github.io/personal_website/research/interactive_latency.html) · [Croft §5.6.2 Merging (book p. 157)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR Ch 4 (hardware basics)](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 11. In-class Notes & Assignment Tips

"On Assignment 3" (L16 p45–48) — the search engine, in three milestones.

**MS1: a simple indexer** (L16 p46). **Start with a small set of files — short development cycle!**

- traversing folders and reading JSON;
- opening and reading **one file at a time**;
- parsing (dealing with **broken HTML**!);
- tokenization & stemming;
- a simple **in-memory** inverted index;
- simple index **serialization to disk**.

**Expand gradually!! No need to scale up yet…**

**MS2: simple Boolean retrieval — AND only** (L16 p47). Every query's words are ANDed: `cristina lopes`, `eppstein Wikipedia`, `master of software engineering` each mean AND. **Required: a text interface.** Bonus points for a web GUI in MS3. No speed restrictions yet…

**MS3: ranked retrieval** (L16 p48). **Scale up**; a completely different approach (covered in future lectures); may benefit from **positional information**. **Must perform under 300 ms**, ideally ~100 ms, with no penalty for anything under 300 ms. Add a **timer** to your code that prints the time between the arrival of the query and the production of the result (not counting the rendering of a web GUI).

> 💡 **Key Insight**: The milestones follow this week's slides — MS1's in-memory index is exactly [§9.1](#91-buildindex), MS2's AND is [§5](#5-query-processing-and-by-merging-postings), and MS3's scale-up is the problem of [§10](#10-scaling-index-construction-hardware-basics). Postings need doc id and frequency (or TF-IDF) at least ([§9.3](#93-what-a-posting-holds)).

---

## 12. Worked Examples (with Solutions)

### 12.1 Adding Caesar to document 14 (L15 p11–14)

Caesar's postings are stored in a fixed-size array `1 2 4 5 6 16 57 132`. Then *Caesar* is added to document 14. What happens?

> ✍️ **Try it first.**

**Solution.** The list must stay sorted by docID, so 14 belongs between 6 and 16: `1 2 4 5 6 14 16 57 132`. In a fixed-size array that means **shifting** 16, 57 and 132 one slot right — and if the array is full (Caesar's has 8 slots and 8 entries), you need a **bigger array**. Lists grow and shrink by term, so fixed-size arrays don't work: we need **variable-size postings lists** (L15 p14) — a continuous run on disk, and linked lists / variable-length arrays / associative arrays in memory, trading size against ease of insertion.

### 12.2 Index Doc 1 and Doc 2 (L15 p21–23)

Doc 1: *I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me.* Doc 2: *So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious*. Build the dictionary (with doc. frequency) and postings.

> ✍️ **Try it first.**

**Solution.**

1. Token sequence: 29 (term, docID) pairs, 14 from Doc 1 and 15 from Doc 2 (`I` counted twice, `killed` twice, `caesar` twice in Doc 2).
2. Sort by term, then docID.
3. Merge repeats within a document, count documents:

```text
term       df  postings     term       df  postings
ambitious  1   2            julius     1   1
be         1   2            killed     1   1
brutus     2   1 → 2        let        1   2
caesar     2   1 → 2        me         1   1
capitol    1   1            noble      1   2
did        1   1            so         1   2
enact      1   1            the        2   1 → 2
hath       1   2            told       1   2
i          1   1            was        2   1 → 2
i'         1   1            with       1   2
it         1   2            you        1   2
```

22 terms. `killed` occurs twice in Doc 1 but has df = 1 and one posting — merging is per document. (The slide's sorted table shows `hath | 1`; it's 2.)

### 12.3 How big is the index? (L15 p26)

Vocabulary 50,000 tokens, average postings list size 20, docID = URL of about 50 characters ≈ 100 bytes in Python. How much memory do the postings take?

> ✍️ **Try it first.**

**Solution.** Postings: 50,000 × 20 = 1,000,000. Bytes: 1,000,000 × 100 = 100,000,000 ≈ **100 MB** — before any payload (tf-idf, 4 bytes each, adds more). That's for 10⁶ postings; the web has far more than 10⁶ documents, so the index usually **does not fit in memory all at once**.

### 12.4 Brutus AND Caesar by merging (L15 p30–32)

Brutus → `2 4 8 16 32 64 128`, Caesar → `1 2 3 5 8 13 21 34`. Run INTERSECT.

> ✍️ **Try it first.**

**Solution.** Pointer pairs (Brutus, Caesar):

| Step | Compare | Action |
|---|---|---|
| 1 | 2 vs 1 | 1 < 2 → advance Caesar |
| 2 | 2 vs 2 | equal → **add 2**, advance both |
| 3 | 4 vs 3 | 3 < 4 → advance Caesar |
| 4 | 4 vs 5 | 4 < 5 → advance Brutus |
| 5 | 8 vs 5 | 5 < 8 → advance Caesar |
| 6 | 8 vs 8 | equal → **add 8**, advance both |
| 7 | 16 vs 13 | 13 < 16 → advance Caesar |
| 8 | 16 vs 21 | 16 < 21 → advance Brutus |
| 9 | 32 vs 21 | 21 < 32 → advance Caesar |
| 10 | 32 vs 34 | 32 < 34 → advance Brutus |
| 11 | 64 vs 34 | 34 < 64 → advance Caesar → Caesar exhausted, stop |

Answer **[2, 8]** after 11 comparisons, within the $x + y = 7 + 8 = 15$ bound. 128 is never looked at.

### 12.5 The document score 303.01 (L15 p45 · L16 p8)

Use $R(Q,D) = \sum_i g_i(Q) f_i(D)$ with the table in [§7](#7-indexes-and-ranking-the-abstract-model).

> ✍️ **Try it first.**

**Solution.** Only features with both an $f_i$ and a $g_i$ count (seaweed and surfboards have no query weight; chichlids and barbs aren't in the document):

| Feature | $g_i(Q) \cdot f_i(D)$ |
|---|---|
| fish | 5.2 × 9.7 = 50.44 |
| tropical | 3.4 × 4.2 = 14.28 |
| tropical fish | 9.9 × 22.1 = 218.79 |
| incoming links | 1.2 × 14 = 16.80 |
| update count | 0.9 × 3 = 2.70 |

$R = 50.44 + 14.28 + 218.79 + 16.80 + 2.70 = \mathbf{303.01}$, the slide's document score. The phrase feature *tropical fish* contributes most of it.

### 12.6 Find the phrase "tropical fish" (L16 p11–13)

tropical → `1,1 1,7 2,6 2,17 3,1`; fish → `1,2 1,4 2,7 2,18 2,23 3,2 3,6 4,3 4,13`. Where does the phrase occur?

> ✍️ **Try it first.**

**Solution.** A phrase match needs `fish` at position $p+1$ in the same document as `tropical` at $p$:

| tropical | needs fish at | found? |
|---|---|---|
| 1,1 | 1,2 | ✓ |
| 1,7 | 1,8 | ✗ (S1 word 8 is *environments*) |
| 2,6 | 2,7 | ✓ |
| 2,17 | 2,18 | ✓ |
| 3,1 | 3,2 | ✓ |

The phrase occurs **4 times**, in **documents 1, 2 and 3**. Document 4 contains *fish* but not *tropical*, so a document-only index (`tropical 1 2 3`, `fish 1 2 3 4`) can't tell the phrase from the two words appearing anywhere — that's what positions buy.

### 12.7 DocIDs as URLs vs integers (L16 p23–27)

10,000 index terms, ~20 postings per term, average URL 51 characters (~100 bytes in Python 3), Python int 28 bytes. Compare the postings size.

> ✍️ **Try it first.**

**Solution.** URLs: 10,000 × 20 × 100 = 20,000,000 bytes ≈ **20 MB**. Integers: 10,000 × 20 × 28 = 5,600,000 bytes ≈ **5.6 MB** — 28% of the URL version, so roughly 4× (100 / 28 ≈ 3.6) more postings fit in the same memory, and integers are much faster to sort and compare. The price: an auxiliary docID → URL map, saved to a file, to show results.

---

## 13. Quick Reference & Top 5 Things to Remember

**Index vocabulary**

| Term | Meaning |
|---|---|
| Dictionary | The set of terms (with doc. frequency) |
| Postings list / inverted list | The docIDs (and more) for one term, sorted by docID |
| Posting | One entry; its document part is the *pointer* |
| Document frequency (df) | Number of documents containing the term |
| Extent | Contiguous region of a document (a field), as word positions |

**Indexer steps**

| Step | Output |
|---|---|
| Tokenize + linguistic modules | modified tokens |
| Emit pairs | (term, docID) in text order |
| Sort | by term, then docID |
| Merge | one dictionary entry per term + df + postings |

**Query processing**

| Operation | Cost | Requirement |
|---|---|---|
| `t1 AND t2` (INTERSECT) | $O(x + y)$ | postings sorted by docID |
| Phrase `"t1 t2"` | merge on docID, then position $p, p+1$ | positional postings |
| Ranking | $R(Q,D) = \sum_i g_i(Q) f_i(D)$ | features in the index (counts, positions, scores) |

**Sizes and latencies**

| Fact | Value |
|---|---|
| 1M postings with URL docIDs (Python) | ~100 MB (L15 p26) |
| URL vs int docIDs, 200K postings | 20 MB vs 5.6 MB (28%) |
| Int size | 4 bytes C/C++/Java, 28 bytes Python |
| Memory reference vs disk seek | 50–75 ns vs up to 2 ms |
| Disk block size | 8–256 KB |

**Top 5 things to remember**

1. An inverted index maps each **term → postings list of docIDs**, stores only the 1s of the sparse matrix, and keeps lists **sorted by docID**.
2. The indexer emits **(term, docID) pairs, sorts by term then docID, and merges** repeats within a document; **df** = number of documents, not occurrences.
3. **AND = intersect two sorted postings** with two pointers in $O(x+y)$; on a mismatch, advance the pointer on the **smaller** docID.
4. Postings can carry **counts** (ranking), **positions** (phrases, proximity), **extents** (fields) or **precomputed scores** (speed vs flexibility); the score is $\sum_i g_i(Q) f_i(D)$.
5. Use **integer docIDs** with an auxiliary URL map, and don't build the index directly in a file (L16 p44: **NO**) — **a disk seek costs tens of thousands of memory references**, and in-memory construction doesn't scale either.