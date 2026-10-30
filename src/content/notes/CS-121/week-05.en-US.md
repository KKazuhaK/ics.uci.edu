---
title: "Text Processing, Term-Document Matrices"
summary: "Tokenizing problems, stopping, stemming (suffix-s, Porter, Krovetz), phrases with POS tagging and n-grams, document structure and anchor text, and the term-document incidence matrix."
---

# CS 121: Information Retrieval — Week 5: Text Processing, Term-Document Matrices

## Table of Contents

- [1. Where We Are: Text Transformation](#1-where-we-are-text-transformation)
- [2. Tokenizing Problems to Consider](#2-tokenizing-problems-to-consider)
- [3. The Tokenizing Process](#3-the-tokenizing-process)
- [4. Stopping](#4-stopping)
- [5. Stemming](#5-stemming)
- [6. The Porter Stemmer](#6-the-porter-stemmer)
- [7. Dictionary Stemmers, Krovetz, and a Comparison](#7-dictionary-stemmers-krovetz-and-a-comparison)
- [8. Phrases](#8-phrases)
- [9. Part-of-Speech Tagging](#9-part-of-speech-tagging)
- [10. Word N-Grams](#10-word-n-grams)
- [11. Document Structure and Markup](#11-document-structure-and-markup)
- [12. Links and Anchor Text](#12-links-and-anchor-text)
- [13. The Term-Document Incidence Matrix](#13-the-term-document-incidence-matrix)
- [14. Why the Matrix Doesn't Scale](#14-why-the-matrix-doesnt-scale)
- [15. Worked Examples (with Solutions)](#15-worked-examples-with-solutions)
- [16. Quick Reference & Top 5 Things to Remember](#16-quick-reference--top-5-things-to-remember)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Oct 28
> Built from the Lecture 13 and 14 slides (the YuJa videos are not included; the in-class Lecture 12.5 deck wasn't posted yet). Organized by concept, not by lecture.
> 📖 Readings this week: [Croft et al., Ch 4 up to and including §4.4](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Manning, Raghavan & Schütze, *Introduction to IR*, Ch 1](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

> 📅 **Class logistics**: Assignment 2 (web crawler) is due **Friday, Oct 30, 9:00 pm**.
> Online Quiz 2 is next Wednesday, **Nov 4**, in class on your laptop (opens 7:00 pm, 35 minutes).

---

## 1. Where We Are: Text Transformation

Both decks sit in the **Text Transformation/Processing** box of the architecture (L13 p2, p10 · L14 p2, p29; the full diagram is in [Week 1 §10](week-01.en-US.md#10-search-engine-architecture)). The topic is "Text processing & tokenization++": what happens to a document's text between the document store and the index.

**Tokenizing**, or **lexical analysis**, forms units of meaning from characters, usually from sequences of them. It is surprisingly complex in English and can be harder in other languages (L13 p4–5). The early-IR rule (runs of 3+ alphanumerics, ended by a space or special character, then lower-cased) and its result on the Bigcorp sentence are in [Week 2 §2.3](week-02.en-US.md#23-the-early-tokenization-methodology). Two things L13 adds:

- Turning upper case into lower case has several names: **case folding**, **normalization** or **downcasing**.
- That rule is too simple for search, or even for large-scale experiments, because **too much information is lost**. Small decisions in tokenizing can have a **major impact** on the effectiveness of some queries (L13 p6).

---

## 2. Tokenizing Problems to Consider

The slides' list of hard cases (L13 p7–9):

| Problem | Why it matters | Examples from the slides |
|---|---|---|
| **Small words** | Can be important in some queries, usually in combinations | xp, am, pm, el paso, world war II, "to be or not to be" |
| **Hyphens — merge** | Sometimes the hyphen isn't needed; both forms are common, so merge them | e-bay, wal-mart, active-x, cd-rom, t-shirts |
| **Hyphens — hard cases** | The hyphen may be part of the word or a word separator; harder to decide | winston-salem, mazda rx-7, e-cards, pre-diabetes, t-mobile, spanish-speaking |
| **Special characters** | Important parts of tags, URLs, code in documents | — |
| **Capitalized words** | May or may not mean the same as lower case | "Bush", "Apple" vs "bush", "apple" |
| **Apostrophes** | Part of a word, part of a possessive, or just a mistake | rosie o'donnell, can't, don't, 80's, 1890's, men's straw hats, master's degree, england's ten largest cities, shriner's |
| **Numbers** | Can be important, decimals included | nokia 3250, top 10 courses, united 93, quicktime 6.5 pro, 92.3 the beat, 288358, 3.14159265 |
| **Periods** | Appear in numbers, abbreviations, URLs, ends of sentences, … | I.B.M., Ph.D., cs.umass.edu, F.E.A.R. |

> ⚠️ **Pitfall**: In a search engine, the tokenizing steps for **queries must be identical** to the steps for documents (L13 p9). If documents index `ibm` but the query is tokenized to `i`, `b`, `m`, nothing matches.

> 🔗 **Go deeper**: [Croft §4.3.2 Tokenizing (book p. 87)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 3. The Tokenizing Process

Tokenizing is a **multiple-step process** (L13 p11). The first step uses a **tokenizer + parser** to identify which parts of the document to tokenize for search (the markup in [§11](#11-document-structure-and-markup) is where the parser earns its keep).

The most general strategy is to **defer complex decisions to other components**:

- A word is any set of alphanumeric characters, ended by a space or special character, with everything converted to lower case.
- **Everything is indexed**, and the system keeps track of additional information. Example: `92.3` → `92` `3`, but a search still finds documents with `92` and `3` **adjacent**.
- Add some special rules to reduce dependence on the query transformation components.

That's not very different from the simple tokenizing used in the past (L13 p12). Rules used with early **TREC** collections:

| Rule | Examples |
|---|---|
| Apostrophes in words ignored | o'connor → `oconnor`, bob's → `bobs` |
| Periods in abbreviations ignored | I.B.M. → `ibm`, Ph.D. → `phd` |

Difficult cases are still left to **post-processing**: information extraction and query transformation.

> 💡 **Key Insight**: The tokenizer stays simple on purpose and keeps enough information (like word positions) that later stages can recover what it threw away.

---

## 4. Stopping

**Function words** — determiners, prepositions — have little meaning on their own and very high occurrence frequencies (L13 p13). They can be treated as **stopwords**, i.e. removed, which:

- reduces index space,
- improves response time,
- improves effectiveness.

However, they can be important **in combinations**: "to be or not to be" is all stopwords.

Building the list (L13 p14): a stopword list can be made from the highest-frequency words or from a standard list. Lists are customized for applications, domains, and even **parts of documents** — "click" and "here" are good stopwords for anchor text.

> 💡 **Key Insight**: The usual best policy is to **index all words** in the documents and decide **at query time** which words to use (L13 p14). Removing a word at indexing time can't be undone.

> 🔗 **Go deeper**: [Croft §4.3.3 Stopping (book p. 90)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 5. Stemming

Stemming is also called **conflation**. Words are made of **morphemes** (L13 p15):

- **Stems** are the core units.
- **Affixes** are the units that adhere to stems. In "stems", STEM is the stem and S is the affix.

Many words have morphological variations: **inflectional** (plurals, tenses) and **derivational** (turning verbs into nouns by adding a suffix such as *-ation*). In most cases the variants have the same or very similar meanings.

**Stemmers** try to reduce those variations to a **common stem**, usually by removing suffixes. Like stopping, this can happen at indexing time and/or during query processing (L13 p16). The slide's example: a user searches "mark spitz swimming", but pages about past events say "swam". The stemmer has to turn both "swimming" and "swam" into the same stem (e.g. "swim") for them to match.

The payoff is usually **small but significant** (L13 p17): about 5–10% better effectiveness for English, and up to 50% for Arabic or Russian, where it can be crucial. Arabic builds many words around one root — the slide's table for the root *ktb*:

| Word | Meaning |
|---|---|
| kitab | a book |
| kitabi | my book |
| alkitab | the book |
| kitabuki | your book (f) |
| kitabuka | your book (m) |
| kitabuhu | his book |
| kataba | to write |
| maktaba | library, bookstore |
| maktab | office |

**Two basic types** (L13 p18–20), both language dependent:

- **Dictionary-based**: uses lists of related words.
- **Algorithmic**: uses a program to determine related words.

The simplest English algorithmic stemmer is **suffix-s**: remove an "s" ending, assuming it's a plural.

```python
def suffix_s(word):
    return word[:-1] if word.endswith("s") else word

for w in ["cats", "lakes", "wiis", "centuries", "is"]:
    print(w, "->", suffix_s(w))
# cats -> cat
# lakes -> lake
# wiis -> wii
# centuries -> centurie
# is -> i
```

It makes **many false negatives** (related words it fails to join: centuries ↛ century) and **some false positives** (unrelated words it joins: is → i).

> ⚠️ **Pitfall**: Mind the direction. A **false positive** conflates words that *shouldn't* match (is/I); a **false negative** misses words that *should* (centuries/century).

> 📝 **Practice**: [Worked Example 15.1](#151-suffix-s-false-positives-and-false-negatives-l13-p1820)

> 🔗 **Go deeper**: [Croft §4.3.4 Stemming (book p. 91)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 6. The Porter Stemmer

The **Porter stemmer** (L13 p21) is an algorithmic stemmer used in IR experiments since the 70s:

- It is a **series of rules**; at each step, the rule for the **longest applicable suffix** is executed.
- It is effective in TREC.
- It produces **stems, not words**.
- Drawback: it makes a number of errors and is difficult to modify.

The slide shows one of its five steps (L13 p22, "Example step (1 of 5)"):

```text
Step 1a:
- Replace sses by ss (e.g., stresses → stress).
- Delete s if the preceding word part contains a vowel not immediately
  before the s (e.g., gaps → gap but gas → gas).
- Replace ied or ies by i if preceded by more than one letter, otherwise
  by ie (e.g., ties → tie, cries → cri).
- If suffix is us or ss do nothing (e.g., stress → stress).
Step 1b:
- Replace eed, eedly by ee if it is in the part of the word after the
  first non-vowel following a vowel (e.g., agreed → agree, feed → feed).
- Delete ed, edly, ing, ingly if the preceding word part contains a
  vowel, and then if the word ends in at, bl, or iz add e (e.g., fished →
  fish, pirating → pirate), or if the word ends with a double letter that
  is not ll, ss or zz, remove the last letter (e.g., falling → fall,
  dripping → drip), or if the word is short, add e (e.g., hoping → hope).
- Whew!
```

Step through all twelve of the slide's examples below, or type your own words. The table fills in each word after 1a and after 1b — a purple cell means *that* step changed the word, and the final stem is bold — and the code panel highlights the rule that fired:

```viz porter-step1
{"title": "Porter Step 1a + 1b on the slide's examples (L13 p22)", "words": "stresses, gaps, gas, ties, cries, agreed, feed, fished, pirating, falling, dripping, hoping", "interactive": true}
```

Every example comes out as the slide says: stress, gap, gas, tie, cri, agree, feed, fish, pirate, fall, drip, hope. Note "cri": a stem, not a word.

Porter's mistakes (L13 p23–24):

| False positives (conflated, shouldn't be) | False negatives (not conflated, should be) |
|---|---|
| organization / organ | european / europe |
| generalization / generic | cylinder / cylindrical |
| numerical / numerous | matrices / matrix |
| policy / police | urgency / urgent |
| university / universe | create / creation |
| addition / additive | analysis / analyses |
| negligible / negligent | useful / usefully |
| execute / executive | noise / noisy |
| past / paste | decompose / decomposition |
| ignore / ignorant | sparse / sparsity |
| special / specialized | resolve / resolution |
| head / heading | triangle / triangular |

The **Porter2** stemmer addresses some of these issues, and you can include exceptions. A similar approach has been used for other languages.

> 📝 **Practice**: [Worked Example 15.2](#152-porter-step-1-by-hand-l13-p22)

> 🔗 **Go deeper**: [Porter stemmer (tartarus.org)](https://tartarus.org/martin/PorterStemmer/) · [Porter2 / Snowball English stemmer](http://snowball.tartarus.org/algorithms/english/stemmer.html)

---

## 7. Dictionary Stemmers, Krovetz, and a Comparison

**Dictionary stemmers** (L13 p25) use human-built word lists of `(word, stem)` pairs:

- **Very low false positive rate**.
- Related words don't need to look alike: "is", "be", "was".
- Important drawback: they **can't react automatically to new words**.
- Lists can be built semi-automatically by statistical analysis, then curated by humans. This is useful for **query expansion** in search applications.

The **Krovetz stemmer** (L13 p26–27) is a **hybrid** of algorithmic and dictionary. It rests on the observation that irregular words are usually the oldest in the language, while new words tend to follow regular grammatical conventions.

1. The word is checked in the dictionary. If it's there, it's left alone or replaced with its "exception".
2. If not, the word is checked for suffixes that could be removed.
3. After removal, the dictionary is checked again.

Its advantage: it usually produces **words, not stems**. It has a lower false positive rate and a somewhat higher false negative rate (depending on the size and curation of the dictionary). For search, effectiveness is comparable.

The slides' comparison on one text (L13 p28–29):

| | Text |
|---|---|
| **Original** | Document will describe marketing strategies carried out by U.S. companies for their agricultural chemicals, report predictions for market share of such chemicals, or report market statistics for agrochemicals, pesticide, herbicide, fungicide, insecticide, fertilizer, predicted sales, market share, stimulate demand, price cut, volume of sales. |
| **Porter** | document describ market strategi carri compani agricultur chemic report predict market share chemic report market statist agrochem pesticid herbicid fungicid insecticid fertil predict sale market share stimul demand price cut volum sale |
| **Krovetz** | document describe marketing strategy carry company agriculture chemical report prediction market share chemical report market statistic agrochemic pesticide herbicide fungicide insecticide fertilizer predict sale stimulate demand price cut volume sale |

Both outputs have also dropped the stopwords (will, out, by, for, their, of, such, or). Porter's tokens are stems like "strategi" and "compani"; Krovetz's are real words like "strategy" and "company".

> 💡 **Key Insight**: Algorithmic = rules, many errors, no dictionary to maintain. Dictionary = few false positives, can't handle new words. Krovetz = dictionary first, rules as a fallback.

---

## 8. Phrases

Phrases are important in search (L14 p4–6): many web search queries are **2–3 word phrases**. Phrases are:

- **More precise** than single words — documents containing "black sea" vs. the two words "black" and "sea". **Order matters**: do you want pages with "the sea turned black"?
- **Less ambiguous** — "big apple" vs. "apple".

They can be **difficult for ranking**, and the details depend on the model. Given the query "fishing supplies", how should you score documents with the exact phrase many times, the exact phrase once, the words in the same sentence, the same paragraph, the whole document, or variations on the words?

Two questions (L14 p7–8, p18): **what is a phrase?** and **how are phrases recognized?** There are three approaches, covered in the next three places:

1. Identify syntactic phrases with a **part-of-speech (POS) tagger** → [§9](#9-part-of-speech-tagging).
2. Use **word n-grams** → [§10](#10-word-n-grams).
3. Store **word positions** in the index and use **proximity operators** in queries.

> 🔗 **Go deeper**: [Croft §4.3.5 Phrases and N-grams (book p. 97)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 9. Part-of-Speech Tagging

POS taggers use **statistical / machine-learning models** of text to predict the syntactic tag of each word (L14 p9). Example tags:

| Tag | Meaning | Tag | Meaning |
|---|---|---|---|
| NN | singular noun | IN | preposition |
| NNS | plural noun | JJ | adjective |
| VB | verb | CC | conjunction (e.g. "and", "or") |
| VBD | verb, past tense | PRP | pronoun |
| VBN | verb, past participle | MD | modal auxiliary (e.g. "can", "will") |

Phrases can then be defined as **simple noun groups**. The Brill tagger on the comparison text from §7 (L14 p10):

```text
Document/NN will/MD describe/VB marketing/NN strategies/NNS carried/VBD
out/IN by/IN U.S./NNP companies/NNS for/IN their/PRP agricultural/JJ
chemicals/NNS ,/, report/NN predictions/NNS for/IN market/NN share/NN
of/IN such/JJ chemicals/NNS ,/, or/CC report/NN market/NN statistics/NNS
for/IN agrochemicals/NNS ,/, pesticide/NN ,/, herbicide/NN ,/,
fungicide/NN ,/, insecticide/NN ,/, fertilizer/NN ,/, predicted/VBN
sales/NNS ,/, market/NN share/NN ,/, stimulate/VB demand/NN ,/, price/NN
cut/NN ,/, volume/NN of/IN sales/NNS ./.
```

The most frequent noun phrases found this way in two collections (L14 p11):

| TREC freq. | TREC phrase | Patent freq. | Patent phrase |
|---|---|---|---|
| 65824 | united states | 975362 | present invention |
| 61327 | article type | 191625 | u.s. pat |
| 33864 | los angeles | 147352 | preferred embodiment |
| 18062 | hong kong | 95097 | carbon atoms |
| 17788 | north korea | 87903 | group consisting |
| 17308 | new york | 81809 | room temperature |
| 15513 | san diego | 78458 | seq id |
| 15009 | orange county | 75850 | brief description |
| 12869 | prime minister | 66407 | prior art |
| 12799 | first time | 59828 | perspective view |
| 12067 | soviet union | 58724 | first embodiment |
| 10811 | russian federation | 56715 | reaction mixture |
| 9912 | united nations | 54619 | detailed description |
| 8127 | southern california | 54117 | ethyl acetate |
| 7640 | south korea | 52195 | example 1 |
| 7620 | end recording | 52003 | block diagram |
| 7524 | european union | 46299 | second embodiment |
| 7436 | south africa | 41694 | accompanying drawings |
| 7362 | san francisco | 40554 | output signal |
| 7086 | news conference | 37911 | first end |
| 6792 | city council | 35827 | second end |
| 6348 | middle east | 34881 | appended claims |
| 6157 | peace process | 33947 | distal end |
| 5955 | human rights | 32338 | cross-sectional view |
| 5837 | white house | 30193 | outer surface |

---

## 10. Word N-Grams

POS tagging is **too slow for large collections** (L14 p12–13). The simpler definition: a phrase is **any sequence of n words**, an **n-gram** (also called a **shingle**). A bigram is 2 words, a trigram 3, a unigram a single word. N-grams are also used at the **character level**, for applications such as OCR.

N-grams are usually formed from **overlapping** word sequences: move an n-word "window" one word at a time through the document.

```python
def ngrams(words, n):
    return [" ".join(words[i:i + n])
            for i in range(len(words) - n + 1)]

words = "the sea turned black".split()
for n in (1, 2, 3):
    print(n, ngrams(words, n))
# 1 ['the', 'sea', 'turned', 'black']
# 2 ['the sea', 'sea turned', 'turned black']
# 3 ['the sea turned', 'sea turned black']
```

Run it below; the step counts the n-grams of a 1,000-word document:

```viz web-demo
{"title": "Word n-grams: a window moving one word at a time (L14 p4, p12–15)", "html": "<p>See the console.</p>", "js": "const words = \"the sea turned black\".split(\" \");\nfunction ngrams(ws, n) {\n  const out = [];\n  for (let i = 0; i + n <= ws.length; i++) out.push(ws.slice(i, i + n).join(\" \"));\n  return out;\n}\nconsole.log(\"unigrams\", ngrams(words, 1));\nconsole.log(\"bigrams \", ngrams(words, 2));\nconsole.log(\"trigrams\", ngrams(words, 3));", "steps": [{"note": "Count the windows instead of listing them: a document of N words has N − n + 1 n-grams of length n.", "js": "\n// L14 p14: n-gram instances in a 1,000-word document, 2 <= n <= 5\nlet total = 0;\nfor (let n = 2; n <= 5; n++) { console.log(\"n =\", n, \":\", 1000 - n + 1); total += 1000 - n + 1; }\nconsole.log(\"total\", total);"}], "height": 60, "interactive": true}
```

What n-grams buy you (L14 p14–15):

- **Frequent n-grams are more likely to be meaningful phrases.**
- N-grams form a **Zipf distribution** — a better fit than words alone (Zipf's law is in [Week 4 §11](week-04.en-US.md#11-text-statistics-and-zipfs-law)).
- You could **index all n-grams** up to a specified length. Advantage: **much faster than POS tagging**. Drawback: **uses a lot of storage** — a 1,000-word document contains **3,990** instances of word n-grams with 2 ≤ n ≤ 5.

**Google n-grams** (L14 p16–17): even at that storage cost, **many web search engines do index n-grams**. Google's sample:

| | Count |
|---|---|
| Tokens | 1,024,908,267,229 |
| Sentences | 95,119,665,584 |
| Unigrams | 13,588,391 |
| Bigrams | 314,843,401 |
| Trigrams | 977,069,902 |
| Fourgrams | 1,313,818,354 |
| Fivegrams | 1,176,470,663 |

The most frequent trigram in English on the web is **"all rights reserved"**; in Chinese, "limited liability corporation".

> 📝 **Practice**: [Worked Example 15.3](#153-how-many-n-grams-in-a-1000-word-document-l14-p1415)

---

## 11. Document Structure and Markup

**Some parts of a document are more important than others** (L14 p20–21). The document parser recognizes structure from markup such as HTML tags:

- **Headers, anchor text and bolded text** are all likely to contain important text.
- **Metadata** can also be important.
- **Links** are used for link analysis (later in the course).

The slides' example is the Wikipedia page "Tropical fish" (L14 p22–24). The rendered page has the title, "From Wikipedia, the free encyclopedia", and two paragraphs with many linked words (fish, tropical, freshwater, salt water, Fishkeepers, aquarium, iridescence, pigmented). Its HTML source, abridged as on the slide:

```html
<html>
<head>
<meta name="keywords" content="Tropical fish, Airstone, Albinism, Algae eater,
Aquarium, Aquarium fish feeder, Aquarium furniture, Aquascaping, Bath treatment
(fishkeeping),Berlin Method, Biotope" />
...
<title>Tropical fish - Wikipedia, the free encyclopedia</title>
</head>
<body>
...
<h1 class="firstHeading">Tropical fish</h1>
...
<p><b>Tropical fish</b> include <a href="/wiki/Fish" title="Fish">fish</a> found in <a
href="/wiki/Tropics" title="Tropics">tropical</a> environments around the world,
including both <a href="/wiki/Fresh_water" title="Fresh water">freshwater</a> and <a
href="/wiki/Sea_water" title="Sea water">salt water</a> species. <a
href="/wiki/Fishkeeping" title="Fishkeeping">Fishkeepers</a> often use the term
<i>tropical fish</i> to refer only those requiring fresh water, with saltwater tropical fish
referred to as <i><a href="/wiki/List_of_marine_aquarium_fish_species" title="List of
marine aquarium fish species">marine fish</a></i>.</p>
<p>Tropical fish are popular <a href="/wiki/Aquarium" title="Aquarium">aquarium</a>
fish , due to their often bright coloration. In freshwater fish, this coloration typically
derives from <a href="/wiki/Iridescence" title="Iridescence">iridescence</a>, while salt
water fish are generally <a href="/wiki/Pigment" title="Pigment">pigmented</a>.</p>
...
</body></html>
```

The markup tells the parser what's what: the `<title>`, the `<h1>` heading, the bold `<b>Tropical fish</b>`, the keywords `<meta>`, and every `<a href>` link. L14 p24 boxes the links (freshwater, salt water, aquarium, iridescence, pigmented): they lead into §12.

> 🔗 **Go deeper**: [Croft §4.4 Document Structure and Markup (book p. 101)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 12. Links and Anchor Text

Links are a key component of the Web: important for navigation, but also for search (L14 p25). In

```html
<a href="http://example.com">Example website</a>
```

"Example website" is the **anchor text** and `http://example.com` is the **destination link**. Search engines use both.

Anchor text is used as a **description of the content of the destination page** (L14 p26–28). The anchor text of **all links pointing to a page** is collected into an **additional text field** for that page. The slide's diagram shows the page `www.example.com` with four fields:

| Field | Content |
|---|---|
| text (the page's own body) | document text |
| anchor from other.com | example |
| anchor from null.com | click here |
| title | example site |

Anchor text tends to be **short, descriptive, and similar to query text**. Retrieval experiments have shown that it has a **significant impact on effectiveness for some types of queries — more than PageRank!**

> ⚠️ **Pitfall**: Anchor text describes the page the link **points to**, not the page it sits on. And "click here" is the kind of anchor text a stopword list for anchors removes (§4).

> 🔗 **Go deeper**: [Croft §4.5.1 Anchor Text (book p. 105)](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 13. The Term-Document Incidence Matrix

"Unstructured data in 1620" (L14 p31–32): **which plays of Shakespeare contain the words Brutus AND Caesar but NOT Calpurnia?** You could grep all the plays for Brutus and Caesar, then strip out the lines containing Calpurnia. Why isn't that the answer for search?

- It's **slow** for large corpora.
- **NOT Calpurnia** is non-trivial.
- Other operations, like finding the word *Romans* **near** *countrymen*, aren't feasible.
- **Ranked retrieval** isn't possible — and users want ordered documents.

A **term-document incidence matrix** (L14 p33–35) is a Boolean matrix: rows are **terms**, columns are **documents**, and an entry is 1 if the play contains the word, 0 otherwise.

| | Antony and Cleopatra | Julius Caesar | The Tempest | Hamlet | Othello | Macbeth |
|---|---|---|---|---|---|---|
| Antony | 1 | 1 | 0 | 0 | 0 | 1 |
| Brutus | 1 | 1 | 0 | 1 | 0 | 0 |
| Caesar | 1 | 1 | 0 | 1 | 1 | 1 |
| Calpurnia | 0 | 1 | 0 | 0 | 0 | 0 |
| Cleopatra | 1 | 0 | 0 | 0 | 0 | 0 |
| mercy | 1 | 0 | 1 | 1 | 1 | 1 |
| worser | 1 | 0 | 1 | 1 | 1 | 0 |

**Incidence vectors** (L14 p36–38): each term has a 0/1 vector, its row. To answer the query, take the rows for Brutus, Caesar and Calpurnia, **complement** Calpurnia's, and **bitwise AND** them:

$$R = I_{Bru} \wedge I_{Cae} \wedge \neg I_{Cal}$$

$I_t$ is term $t$'s row, $\wedge$ is bitwise AND, and $\neg$ flips every bit.

```text
(Brutus)         1 1 0 1 0 0  AND
(Caesar)         1 1 0 1 1 1  AND
(NOT Calpurnia)  1 0 1 1 1 1  =
                 1 0 0 1 0 0
```

The result's 1s are columns 1 and 4: **Antony and Cleopatra** and **Hamlet**. Step through it, or type another query (AND / OR / NOT over these terms):

```viz incidence-matrix
{"title": "Brutus AND Caesar AND NOT Calpurnia (L14 p33–38)", "terms": "Antony: 1 1 0 0 0 1; Brutus: 1 1 0 1 0 0; Caesar: 1 1 0 1 1 1; Calpurnia: 0 1 0 0 0 0; Cleopatra: 1 0 0 0 0 0; mercy: 1 0 1 1 1 1; worser: 1 0 1 1 1 0", "docs": "Antony and Cleopatra, Julius Caesar, The Tempest, Hamlet, Othello, Macbeth", "query": "Brutus AND Caesar AND NOT Calpurnia", "interactive": true}
```

The answers in the text (L14 p39):

- *Antony and Cleopatra*, Act III, Scene ii — Agrippa [aside to Domitius Enobarbus]: "Why, Enobarbus, / When Antony found Julius **Caesar** dead, / He cried almost to roaring; and he wept / When at Philippi he found **Brutus** slain."
- *Hamlet*, Act III, Scene ii — Lord Polonius: "I did enact Julius **Caesar** I was killed i' the / Capitol; **Brutus** killed me."

> 📝 **Practice**: [Worked Example 15.4](#154-brutus-and-caesar-and-not-calpurnia-l14-p3338)

> 🔗 **Go deeper**: [Manning et al., *Introduction to IR*, Ch 1 (this week's reading)](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 14. Why the Matrix Doesn't Scale

"Can you use this in bigger collections?" (L14 p40–43). Take:

- $N = 10^6$ documents, each with about $10^3$ words;
- about 6 bytes per word, including spaces and punctuation → about **6 GB** of data;
- $M = 500\text{K}$ **distinct** terms among them.

The term-document matrix is then $500\text{K} \times 1\text{M}$: **half a trillion** 0s and 1s, so it **can't be built in memory**. But it has **no more than one billion 1s** — at most $10^6 \times 10^3$, one per word occurrence. The matrix is **extremely sparse**.

> 💡 **Key Insight**: The better representation records **only the 1 positions** (L14 p43). For each term, keep the list of documents that contain it — that's where the inverted index of the next weeks starts.

> 📝 **Practice**: [Worked Example 15.5](#155-how-big-is-the-incidence-matrix-l14-p4043)

---

## 15. Worked Examples (with Solutions)

### 15.1 Suffix-s: false positives and false negatives (L13 p18–20)

Apply the suffix-s stemmer (remove an "s" ending, assuming a plural) to cats, lakes, wiis, centuries, is. Which results are false negatives and which are false positives?

> ✍️ **Try it first.**

**Solution.** cats → cat, lakes → lake and wiis → wii are correct. centuries → **centurie**, not century: it fails to conflate two related words, so it's a **false negative**. is → **i**: it conflates two unrelated words, so it's a **false positive**. Back to [§5](#5-stemming).

### 15.2 Porter Step 1 by hand (L13 p22)

Using only Step 1a then Step 1b as the slide states them, stem: stresses, gaps, gas, ties, cries, agreed, feed, fished, pirating, falling, dripping, hoping.

> ✍️ **Try it first.**

**Solution.**

| Word | Rule that fires | Result |
|---|---|---|
| stresses | 1a: sses → ss | stress |
| gaps | 1a: delete s (vowel "a" before the "p") | gap |
| gas | 1a: keep s (the vowel "a" is immediately before the s) | gas |
| ties | 1a: ies → ie (only one letter, "t", before it) | tie |
| cries | 1a: ies → i (more than one letter before it) | cri |
| agreed | 1b: eed → ee (the suffix is after "ag", the first non-vowel following a vowel) | agree |
| feed | 1b: eed kept (the suffix isn't in that region) | feed |
| fished | 1b: delete ed | fish |
| pirating | 1b: delete ing, then "at" → add e | pirate |
| falling | 1b: delete ing; "ll" is an allowed double letter | fall |
| dripping | 1b: delete ing, then double "p" → drop one | drip |
| hoping | 1b: delete ing, then short word → add e | hope |

The demo in [§6](#6-the-porter-stemmer) runs exactly these rules and gives the same twelve results.

### 15.3 How many n-grams in a 1,000-word document? (L14 p14–15)

A document has 1,000 words. How many word n-gram instances does it contain for 2 ≤ n ≤ 5, with an overlapping window?

> ✍️ **Try it first.**

**Solution.** A window of n words fits in $1000 - n + 1$ positions: 999 bigrams, 998 trigrams, 997 fourgrams and 996 fivegrams. That's $999 + 998 + 997 + 996 = 3{,}990$ — four times the document's length. That's the storage cost of indexing n-grams. Back to [§10](#10-word-n-grams).

### 15.4 Brutus AND Caesar AND NOT Calpurnia (L14 p33–38)

Using the incidence matrix in §13, which plays match *Brutus AND Caesar AND NOT Calpurnia*?

> ✍️ **Try it first.**

**Solution.** Brutus = 110100, Caesar = 110111, Calpurnia = 010000 → NOT Calpurnia = 101111. 110100 AND 110111 = 110100; AND 101111 = **100100**. Columns 1 and 4: **Antony and Cleopatra** and **Hamlet**. Julius Caesar has both names but also Calpurnia, so the NOT removes it. Back to [§13](#13-the-term-document-incidence-matrix).

### 15.5 How big is the incidence matrix? (L14 p40–43)

$N = 10^6$ documents of about $10^3$ words, about 6 bytes per word, $M = 500\text{K}$ distinct terms. How much text is that, how many cells does the matrix have, and at most how many 1s?

> ✍️ **Try it first.**

**Solution.** Text: $10^6 \times 10^3 \times 6$ bytes $= 6 \times 10^9$ bytes ≈ **6 GB**. Matrix: $5 \times 10^5 \times 10^6 = 5 \times 10^{11}$ cells, **half a trillion**. 1s: each word occurrence can add at most one, so at most $10^6 \times 10^3 = 10^9$, **one billion**. At most $10^9 / (5 \times 10^{11}) = 0.2\%$ of the cells are 1 (our division of the slide's numbers), so store only the 1 positions. Back to [§14](#14-why-the-matrix-doesnt-scale).

---

## 16. Quick Reference & Top 5 Things to Remember

| Text-processing step | What it does | Watch out for |
|---|---|---|
| Tokenizing | Characters → tokens; lower-case (case folding) | Hyphens, apostrophes, periods, numbers; queries must be tokenized like documents |
| Stopping | Remove function words | "to be or not to be"; best: index all, decide at query time |
| Stemming | Conflate morphological variants to a stem | False positives (is → i) vs false negatives (centuries ↛ century) |
| Phrases | Multi-word units | POS tagging (slow) vs n-grams (storage) vs positions + proximity |
| Structure / markup | Weight headers, anchors, bold, metadata | Anchor text describes the **destination** page |

| Stemmer | Type | Output | Errors |
|---|---|---|---|
| suffix-s | Algorithmic | Stem | Many false negatives, some false positives |
| Porter | Algorithmic (rules, longest suffix) | Stems, not words | Many errors, hard to modify |
| Porter2 | Algorithmic | Stems | Fixes some Porter issues, allows exceptions |
| Dictionary | Word lists | Words | Very few false positives; can't handle new words |
| Krovetz | Hybrid: dictionary, then suffix removal | Words | Fewer false positives, somewhat more false negatives |

| Incidence matrix | Value |
|---|---|
| Entry | 1 if the document contains the term |
| AND / NOT query | Bitwise AND of rows; NOT = complement |
| Size for $N = 10^6$, $M = 5 \times 10^5$ | $5 \times 10^{11}$ cells, ≤ $10^9$ ones → sparse, store only the 1s |

**Top 5 things to remember**

1. Tokenizing decisions are small but can change query effectiveness a lot — and queries must go through exactly the same steps as documents.
2. Usual policy for stopwords: index everything and decide at query time; stopwords matter in combinations.
3. Stemmers trade false positives against false negatives: Porter produces stems (cri), Krovetz produces words.
4. Phrases can be found by POS tagging (accurate, slow), n-grams (fast, storage-hungry: 3,990 per 1,000 words for n = 2–5), or positions + proximity operators; anchor text is a strong signal for the destination page.
5. The incidence matrix answers Boolean queries with bitwise AND/OR/NOT, but at web scale it's huge and sparse — store only the 1s.
