# CS 121: Information Retrieval — Week 5：文本处理、词项-文档矩阵

## 目录

- [1. 我们所在的位置：文本转换](#1-我们所在的位置文本转换)
- [2. 分词时要考虑的问题](#2-分词时要考虑的问题)
- [3. 分词过程](#3-分词过程)
- [4. 停用词去除](#4-停用词去除)
- [5. 词干提取](#5-词干提取)
- [6. Porter 词干提取器](#6-porter-词干提取器)
- [7. 词典词干提取器、Krovetz 与对比](#7-词典词干提取器krovetz-与对比)
- [8. 短语](#8-短语)
- [9. 词性标注](#9-词性标注)
- [10. 词 N-gram](#10-词-n-gram)
- [11. 文档结构与标记](#11-文档结构与标记)
- [12. 链接与锚文本](#12-链接与锚文本)
- [13. 词项-文档关联矩阵](#13-词项-文档关联矩阵)
- [14. 为什么这个矩阵无法扩展](#14-为什么这个矩阵无法扩展)
- [15. 示例题（附解答）](#15-示例题附解答)
- [16. 速查与必记的 5 件事](#16-速查与必记的-5-件事)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Oct 28
> 整理自 Lecture 13 和 14 的幻灯片（YuJa 视频未收录；课堂用的 Lecture 12.5 尚未发布）。按概念组织，而不是按讲次组织。
> 📖 本周阅读：[Croft et al.，第 4 章（到 §4.4 为止）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Manning, Raghavan & Schütze, *Introduction to IR*，第 1 章](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

> 📅 **课程安排**：Assignment 2（网络爬虫）截止时间为 **10 月 30 日（周五）晚 9:00**。
> Online Quiz 2 在下周三 **11 月 4 日**，课上用笔记本电脑进行（晚 7:00 开放，时长 35 分钟）。

---

## 1. 我们所在的位置：文本转换

两份幻灯片都位于架构图中的**文本转换/处理**模块（L13 p2、p10 · L14 p2、p29；完整的架构图见[第 1 周第 10 节](?kind=course_notes&course=CS-121&lang=zh-CN&note=CS121_Week01_Notes_zh-CN.md#10-搜索引擎架构)）。本周主题是 "Text processing & tokenization++"：文档的文本从文档库到索引之间要经过哪些处理。

**分词**（tokenizing），又叫**词法分析**（lexical analysis），是把字符（通常是字符序列）组成有意义的单元。它在英语中就出乎意料地复杂，在其他语言中可能更难（L13 p4–5）。早期 IR 的规则（3 个及以上字母数字字符组成一个词，以空格或特殊字符结尾，再转为小写）以及它在 Bigcorp 句子上的结果，见[第 2 周 2.3 节](?kind=course_notes&course=CS-121&lang=zh-CN&note=CS121_Week02_Notes_zh-CN.md#23-早期的分词方法)。L13 补充了两点：

- 把大写转为小写有几个名字：**case folding**、**normalization** 或 **downcasing**。
- 这条规则用于搜索、甚至用于大规模实验都过于简单，因为**丢失了太多信息**。分词中的小决定，可能对某些查询的效果产生**重大影响**（L13 p6）。

---

## 2. 分词时要考虑的问题

幻灯片列出的难点（L13 p7–9）：

| 问题 | 为什么重要 | 幻灯片中的例子 |
|---|---|---|
| **短词** | 在某些查询中很重要，通常是组合出现时 | xp, am, pm, el paso, world war II, "to be or not to be" |
| **连字符：可合并** | 有时连字符并不必要；两种写法都常见，可以合并 | e-bay, wal-mart, active-x, cd-rom, t-shirts |
| **连字符：难以判断** | 连字符可能是词的一部分，也可能是分隔符，更难决定 | winston-salem, mazda rx-7, e-cards, pre-diabetes, t-mobile, spanish-speaking |
| **特殊字符** | 是标签、URL、文档中代码的重要组成部分 | — |
| **大写词** | 含义可能与小写形式相同，也可能不同 | "Bush"、"Apple" 与 "bush"、"apple" |
| **撇号** | 可能是词的一部分、所有格的一部分，或者只是个错误 | rosie o'donnell, can't, don't, 80's, 1890's, men's straw hats, master's degree, england's ten largest cities, shriner's |
| **数字** | 可能很重要，包括小数 | nokia 3250, top 10 courses, united 93, quicktime 6.5 pro, 92.3 the beat, 288358, 3.14159265 |
| **句点** | 出现在数字、缩写、URL、句末等各种情况中 | I.B.M., Ph.D., cs.umass.edu, F.E.A.R. |

> ⚠️ **易错点**：在搜索引擎中，**查询的分词步骤必须与文档的分词步骤完全相同**（L13 p9）。如果文档索引的是 `ibm`，而查询被分成 `i`、`b`、`m`，就什么也匹配不上。

> 🔗 **延伸阅读**：[Croft §4.3.2 Tokenizing（书中第 87 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 3. 分词过程

分词是一个**多步骤的过程**（L13 p11）。第一步用**分词器 + 解析器**找出文档中哪些部分需要为搜索而分词（[第 11 节](#11-文档结构与标记)中的标记正是解析器派上用场的地方）。

最通用的策略是**把复杂的决定推迟给其他组件**：

- 一个词是任意一串字母数字字符，以空格或特殊字符结尾，全部转为小写。
- **所有内容都建索引**，系统同时记录额外信息。例子：`92.3` → `92` `3`，但搜索仍然能找到 `92` 和 `3` **相邻**的文档。
- 加入一些特殊规则，减少对查询转换组件的依赖。

这与过去使用的简单分词过程差别不大（L13 p12）。早期 **TREC** 集合使用的规则：

| 规则 | 例子 |
|---|---|
| 忽略词中的撇号 | o'connor → `oconnor`，bob's → `bobs` |
| 忽略缩写中的句点 | I.B.M. → `ibm`，Ph.D. → `phd` |

困难的情况仍然交给**后处理**：信息抽取和查询转换。

> 💡 **关键见解**：分词器刻意保持简单，同时保留足够的信息（比如词的位置），让后续阶段能找回它丢掉的东西。

---

## 4. 停用词去除

**功能词**（限定词、介词）本身几乎没有意义，而且出现频率非常高（L13 p13）。它们可以被当作**停用词**（stopword）去掉，这样可以：

- 减少索引空间，
- 缩短响应时间，
- 提高检索效果。

但它们在**组合中**可能很重要："to be or not to be" 全部是停用词。

构建停用词表（L13 p14）：可以取最高频的词，也可以用标准词表。词表会针对应用、领域，甚至**文档的不同部分**定制——"click" 和 "here" 就是锚文本中很好的停用词。

> 💡 **关键见解**：通常最好的做法是**为文档中所有词建索引**，**在查询时**再决定使用哪些词（L13 p14）。在建索引时删掉的词就再也找不回来了。

> 🔗 **延伸阅读**：[Croft §4.3.3 Stopping（书中第 90 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 5. 词干提取

词干提取（stemming）也叫**合并**（conflation）。词由**语素**（morpheme）构成（L13 p15）：

- **词干**（stem）是核心单元。
- **词缀**（affix）是附着在词干上的单元。在 "stems" 中，STEM 是词干，S 是词缀。

很多词都有形态变化：**屈折变化**（复数、时态）和**派生变化**（加上 *-ation* 之类的后缀把动词变成名词）。大多数情况下，这些变体的意思相同或非常接近。

**词干提取器**（stemmer）试图把这些变化归并到一个**共同的词干**，通常是去掉后缀。和停用词一样，它可以在建索引时做，也可以在查询处理时做，或者两者都做（L13 p16）。幻灯片的例子：用户搜索 "mark spitz swimming"，但讲过去赛事的网页写的是 "swam"。词干提取器要把 "swimming" 和 "swam" 都变成同一个词干（例如 "swim"），二者才能匹配。

效果通常是**小但显著的提升**（L13 p17）：英语大约提升 5–10%，阿拉伯语或俄语可达 50%，对这些语言可能至关重要。阿拉伯语围绕一个词根构造出很多词——幻灯片中词根 *ktb* 的表：

| 词 | 意思 |
|---|---|
| kitab | a book（一本书） |
| kitabi | my book（我的书） |
| alkitab | the book（这本书） |
| kitabuki | your book (f)（你的书，阴性） |
| kitabuka | your book (m)（你的书，阳性） |
| kitabuhu | his book（他的书） |
| kataba | to write（写） |
| maktaba | library, bookstore（图书馆、书店） |
| maktab | office（办公室） |

**两种基本类型**（L13 p18–20），都与语言有关：

- **基于词典**：使用相关词的列表。
- **基于算法**：用程序判断哪些词相关。

最简单的英语算法词干提取器是 **suffix-s**：去掉结尾的 "s"，假定它是复数。

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

它会产生**很多假阴性**（该合并的相关词没合并：centuries ↛ century），也有**一些假阳性**（把不相关的词合并了：is → i）。

> ⚠️ **易错点**：注意方向。**假阳性**（false positive）是把*不该*匹配的词合并了（is/I）；**假阴性**（false negative）是漏掉了*应该*匹配的词（centuries/century）。

> 📝 **练习**：[例题 15.1](#151-suffix-s假阳性与假阴性l13-p1820)

> 🔗 **延伸阅读**：[Croft §4.3.4 Stemming（书中第 91 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 6. Porter 词干提取器

**Porter 词干提取器**（L13 p21）是一种算法词干提取器，自 70 年代起就用于 IR 实验：

- 它由**一系列规则**组成；每一步都执行**适用的最长后缀**所对应的规则。
- 在 TREC 中效果很好。
- 它产生的是**词干，不一定是词**。
- 缺点：会犯不少错误，而且很难修改。

幻灯片展示了它五个步骤中的一个（L13 p22，"Example step (1 of 5)"）：

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

规则大意：Step 1a 处理复数 -s 结尾——sses 变 ss；ied/ies 前面多于一个字母时变 i，否则变 ie；以 us 或 ss 结尾不动；以 s 结尾时，如果 s 前面那个字母之前还有元音，就删掉 s。Step 1b 处理 -ed / -ing——eed/eedly 位于"第一个元音之后的第一个非元音"之后的部分时变 ee；ed/edly/ing/ingly 前面有元音就删掉，然后：以 at、bl、iz 结尾加 e，以 ll、ss、zz 以外的双写字母结尾去掉一个，短词加 e。

下面可以逐步演示幻灯片的全部 12 个例子，也可以输入你自己的词。表格会依次填出每个词经过 1a、1b 后的结果，代码面板会高亮触发的规则：

```viz porter-step1
{"title": "Porter 第 1a + 1b 步：幻灯片中的例子（L13 p22）", "words": "stresses, gaps, gas, ties, cries, agreed, feed, fished, pirating, falling, dripping, hoping", "interactive": true}
```

所有例子的结果都和幻灯片一致：stress、gap、gas、tie、cri、agree、feed、fish、pirate、fall、drip、hope。注意 "cri"：是词干，不是词。

Porter 会犯的错误（L13 p23–24）：

| 假阳性（被合并了，但不该合并） | 假阴性（没合并，但应该合并） |
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

**Porter2** 词干提取器解决了其中一部分问题，并且可以加入例外。其他语言也用过类似的方法。

> 📝 **练习**：[例题 15.2](#152-手算-porter-第-1-步l13-p22)

> 🔗 **延伸阅读**：[Porter 词干提取器（tartarus.org）](https://tartarus.org/martin/PorterStemmer/) · [Porter2 / Snowball 英语词干提取器](http://snowball.tartarus.org/algorithms/english/stemmer.html)

---

## 7. 词典词干提取器、Krovetz 与对比

**词典词干提取器**（L13 p25）使用人工构建的 `(词, 词干)` 对列表：

- **假阳性率非常低**。
- 相关的词不需要长得像："is"、"be"、"was"。
- 重要缺点：**无法自动应对新词**。
- 词表可以先用统计分析半自动构建，再由人工整理。这对搜索应用中的**查询扩展**很有用。

**Krovetz 词干提取器**（L13 p26–27）是算法与词典的**混合**。它基于这样的观察：不规则的词通常是语言中最古老的，新词往往遵循更规则的语法惯例。

1. 先在词典中查这个词。如果在词典里，就保持不变，或替换为它的"例外"形式。
2. 如果不在，就检查有哪些后缀可以去掉。
3. 去掉后缀后，再查一次词典。

它的优点：通常产生的是**词，而不是词干**。它的假阳性率更低，假阴性率稍高（取决于词典的大小和整理质量）。用于搜索时，效果相当。

幻灯片在同一段文本上的对比（L13 p28–29）：

| | 文本 |
|---|---|
| **原文** | Document will describe marketing strategies carried out by U.S. companies for their agricultural chemicals, report predictions for market share of such chemicals, or report market statistics for agrochemicals, pesticide, herbicide, fungicide, insecticide, fertilizer, predicted sales, market share, stimulate demand, price cut, volume of sales. |
| **Porter** | document describ market strategi carri compani agricultur chemic report predict market share chemic report market statist agrochem pesticid herbicid fungicid insecticid fertil predict sale market share stimul demand price cut volum sale |
| **Krovetz** | document describe marketing strategy carry company agriculture chemical report prediction market share chemical report market statistic agrochemic pesticide herbicide fungicide insecticide fertilizer predict sale stimulate demand price cut volume sale |

两种输出都已经去掉了停用词（will、out、by、for、their、of、such、or）。Porter 的输出是 "strategi"、"compani" 这样的词干；Krovetz 的输出是 "strategy"、"company" 这样的真实单词。

> 💡 **关键见解**：算法型 = 规则，错误多，不需要维护词典。词典型 = 假阳性少，处理不了新词。Krovetz = 先查词典，规则兜底。

---

## 8. 短语

短语在搜索中很重要（L14 p4–6）：很多网络搜索查询都是 **2–3 个词的短语**。短语：

- **比单个词更精确**——包含 "black sea" 的文档，与分别包含 "black" 和 "sea" 两个词的文档不同。**顺序也重要**：你想要包含 "the sea turned black" 的页面吗？
- **歧义更少**——"big apple" 与 "apple"。

短语**给排序带来困难**，具体取决于模型。给定查询 "fishing supplies"，下面这些文档该怎么打分：完整短语出现多次、完整短语只出现一次、两个词在同一句话中、同一段中、同一文档中、词的各种变体？

两个问题（L14 p7–8、p18）：**什么是短语？**以及**如何识别短语？**有三种方法，分别在接下来三个地方讲：

1. 用**词性（POS）标注器**识别句法短语 → [第 9 节](#9-词性标注)。
2. 使用**词 n-gram** → [第 10 节](#10-词-n-gram)。
3. 在索引中存储**词的位置**，在查询中使用**邻近运算符**。

> 🔗 **延伸阅读**：[Croft §4.3.5 Phrases and N-grams（书中第 97 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 9. 词性标注

词性标注器用文本的**统计 / 机器学习模型**预测每个词的句法标签（L14 p9）。标签示例：

| 标签 | 含义 | 标签 | 含义 |
|---|---|---|---|
| NN | 单数名词 | IN | 介词 |
| NNS | 复数名词 | JJ | 形容词 |
| VB | 动词 | CC | 连词（如 "and"、"or"） |
| VBD | 动词过去式 | PRP | 代词 |
| VBN | 动词过去分词 | MD | 情态助动词（如 "can"、"will"） |

然后就可以把短语定义为**简单名词组**。Brill 标注器在第 7 节那段对比文本上的输出（L14 p10）：

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

用这种方法在两个集合中找到的最高频名词短语（L14 p11）：

| TREC 频次 | TREC 短语 | 专利频次 | 专利短语 |
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

## 10. 词 N-gram

词性标注**对大型集合来说太慢**（L14 p12–13）。更简单的定义：短语就是**任意 n 个词组成的序列**，即 **n-gram**（也叫 **shingle**）。bigram 是 2 个词，trigram 是 3 个词，unigram 是单个词。n-gram 也用于**字符级别**，比如 OCR 之类的应用。

n-gram 通常由**重叠**的词序列构成：在文档中让一个 n 词"窗口"每次移动一个词。

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

下面可以直接运行；下一步会数出一个 1,000 词文档中的 n-gram 个数：

```viz web-demo
{"title": "词 n-gram：每次移动一个词的窗口（L14 p4、p12–15）", "html": "<p>See the console.</p>", "js": "const words = \"the sea turned black\".split(\" \");\nfunction ngrams(ws, n) {\n  const out = [];\n  for (let i = 0; i + n <= ws.length; i++) out.push(ws.slice(i, i + n).join(\" \"));\n  return out;\n}\nconsole.log(\"unigrams\", ngrams(words, 1));\nconsole.log(\"bigrams \", ngrams(words, 2));\nconsole.log(\"trigrams\", ngrams(words, 3));", "steps": [{"note": "不列出窗口，只数个数：N 个词的文档有 N − n + 1 个长度为 n 的 n-gram。", "js": "\n// L14 p14: n-gram instances in a 1,000-word document, 2 <= n <= 5\nlet total = 0;\nfor (let n = 2; n <= 5; n++) { console.log(\"n =\", n, \":\", 1000 - n + 1); total += 1000 - n + 1; }\nconsole.log(\"total\", total);"}], "height": 60, "interactive": true}
```

n-gram 带来了什么（L14 p14–15）：

- **高频的 n-gram 更可能是有意义的短语。**
- n-gram 服从 **Zipf 分布**——比单个词拟合得更好（Zipf 定律见[第 4 周](?kind=course_notes&course=CS-121&lang=zh-CN&note=CS121_Week04_Notes_zh-CN.md)）。
- 可以为指定长度以内的**所有 n-gram 建索引**。优点：**比词性标注快得多**。缺点：**占用大量存储**——一个 1,000 词的文档包含 **3,990** 个 2 ≤ n ≤ 5 的词 n-gram 实例。

**Google n-gram**（L14 p16–17）：尽管存储开销大，**很多网络搜索引擎仍然会为 n-gram 建索引**。Google 的样本：

| | 数量 |
|---|---|
| 词元（tokens） | 1,024,908,267,229 |
| 句子 | 95,119,665,584 |
| Unigram | 13,588,391 |
| Bigram | 314,843,401 |
| Trigram | 977,069,902 |
| Fourgram | 1,313,818,354 |
| Fivegram | 1,176,470,663 |

网络上英语中最常见的 trigram 是 **"all rights reserved"**；中文中是"有限责任公司"（limited liability corporation）。

> 📝 **练习**：[例题 15.3](#153-1000-词的文档里有多少个-n-graml14-p1415)

---

## 11. 文档结构与标记

**文档中某些部分比其他部分更重要**（L14 p20–21）。文档解析器通过 HTML 标签之类的标记识别结构：

- **标题、锚文本和加粗文本**很可能包含重要内容。
- **元数据**也可能很重要。
- **链接**用于链接分析（课程后面会讲）。

幻灯片的例子是维基百科页面 "Tropical fish"（L14 p22–24）。渲染后的页面有标题、"From Wikipedia, the free encyclopedia"，以及两段包含很多链接词的文字（fish、tropical、freshwater、salt water、Fishkeepers、aquarium、iridescence、pigmented）。它的 HTML 源码（按幻灯片节选）：

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

标记告诉解析器每部分是什么：`<title>`、`<h1>` 标题、加粗的 `<b>Tropical fish</b>`、关键词 `<meta>`，以及每个 `<a href>` 链接。L14 p24 把链接（freshwater、salt water、aquarium、iridescence、pigmented）框了出来：它们引出了第 12 节。

> 🔗 **延伸阅读**：[Croft §4.4 Document Structure and Markup（书中第 101 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 12. 链接与锚文本

链接是 Web 的关键组成部分：对导航重要，对搜索也重要（L14 p25）。在

```html
<a href="http://example.com">Example website</a>
```

中，"Example website" 是**锚文本**（anchor text），`http://example.com` 是**目标链接**。搜索引擎两者都会用。

锚文本被用作**目标页面内容的描述**（L14 p26–28）。**所有指向某个页面的链接**的锚文本，会被收集成该页面的一个**额外文本字段**。幻灯片的示意图中，页面 `www.example.com` 有四个字段：

| 字段 | 内容 |
|---|---|
| text（页面自身的正文） | document text |
| 来自 other.com 的锚文本 | example |
| 来自 null.com 的锚文本 | click here |
| title | example site |

锚文本往往**简短、有描述性，并且与查询文本相似**。检索实验表明，它对**某些类型的查询**的效果有**显著影响——比 PageRank 还大！**

> ⚠️ **易错点**：锚文本描述的是链接**指向的**页面，而不是链接所在的页面。另外，"click here" 正是锚文本专用停用词表会去掉的那种文字（第 4 节）。

> 🔗 **延伸阅读**：[Croft §4.5.1 Anchor Text（书中第 105 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 13. 词项-文档关联矩阵

"Unstructured data in 1620"（L14 p31–32）：**莎士比亚的哪些剧本包含 Brutus AND Caesar，但 NOT Calpurnia？**你可以对所有剧本 grep Brutus 和 Caesar，再去掉包含 Calpurnia 的行。为什么这不是搜索的答案？

- 对大型语料库来说**太慢**。
- **NOT Calpurnia** 并不简单。
- 其他操作，比如找出 *Romans* 在 *countrymen* **附近**出现的地方，无法实现。
- 无法做**排序检索**——而用户想要的是排好序的文档。

**词项-文档关联矩阵**（term-document incidence matrix，L14 p33–35）是一个布尔矩阵：行是**词项**，列是**文档**；剧本包含该词时值为 1，否则为 0。

| | Antony and Cleopatra | Julius Caesar | The Tempest | Hamlet | Othello | Macbeth |
|---|---|---|---|---|---|---|
| Antony | 1 | 1 | 0 | 0 | 0 | 1 |
| Brutus | 1 | 1 | 0 | 1 | 0 | 0 |
| Caesar | 1 | 1 | 0 | 1 | 1 | 1 |
| Calpurnia | 0 | 1 | 0 | 0 | 0 | 0 |
| Cleopatra | 1 | 0 | 0 | 0 | 0 | 0 |
| mercy | 1 | 0 | 1 | 1 | 1 | 1 |
| worser | 1 | 0 | 1 | 1 | 1 | 0 |

**关联向量**（L14 p36–38）：每个词项有一个 0/1 向量，就是它所在的行。回答查询时，取出 Brutus、Caesar 和 Calpurnia 的行，把 Calpurnia 的行**取反**，再做**按位 AND**：

$$R = I_{Bru} \wedge I_{Cae} \wedge \neg I_{Cal}$$

$I_t$ 是词项 $t$ 的行，$\wedge$ 是按位 AND，$\neg$ 把每一位取反。

```text
(Brutus)         1 1 0 1 0 0  AND
(Caesar)         1 1 0 1 1 1  AND
(NOT Calpurnia)  1 0 1 1 1 1  =
                 1 0 0 1 0 0
```

结果中的 1 在第 1 列和第 4 列：**Antony and Cleopatra** 和 **Hamlet**。下面可以逐步演示，也可以输入别的查询（对这些词项使用 AND / OR / NOT）：

```viz incidence-matrix
{"title": "Brutus AND Caesar AND NOT Calpurnia（L14 p33–38）", "terms": "Antony: 1 1 0 0 0 1; Brutus: 1 1 0 1 0 0; Caesar: 1 1 0 1 1 1; Calpurnia: 0 1 0 0 0 0; Cleopatra: 1 0 0 0 0 0; mercy: 1 0 1 1 1 1; worser: 1 0 1 1 1 0", "docs": "Antony and Cleopatra, Julius Caesar, The Tempest, Hamlet, Othello, Macbeth", "query": "Brutus AND Caesar AND NOT Calpurnia", "interactive": true}
```

原文中的答案（L14 p39）：

- *Antony and Cleopatra*，第三幕第二场——Agrippa [对 Domitius Enobarbus 旁白]："Why, Enobarbus, / When Antony found Julius **Caesar** dead, / He cried almost to roaring; and he wept / When at Philippi he found **Brutus** slain."
- *Hamlet*，第三幕第二场——Lord Polonius："I did enact Julius **Caesar** I was killed i' the / Capitol; **Brutus** killed me."

> 📝 **练习**：[例题 15.4](#154-brutus-and-caesar-and-not-calpurnial14-p3338)

> 🔗 **延伸阅读**：[Manning et al., *Introduction to IR*，第 1 章（本周阅读）](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 14. 为什么这个矩阵无法扩展

"Can you use this in bigger collections?"（L14 p40–43）设：

- $N = 10^6$ 篇文档，每篇约 $10^3$ 个词；
- 每个词约 6 字节（含空格和标点）→ 约 **6 GB** 数据；
- 其中有 $M = 500\text{K}$ 个**不同**的词项。

那么词项-文档矩阵是 $500\text{K} \times 1\text{M}$：**五千亿**个 0 和 1，所以**无法在内存中构建**。但其中**最多只有十亿个 1**——最多 $10^6 \times 10^3$ 个，每个词的出现最多贡献一个。这个矩阵**极其稀疏**。

> 💡 **关键见解**：更好的表示方式是**只记录 1 的位置**（L14 p43）。对每个词项，保存包含它的文档列表——这正是之后几周倒排索引的起点。

> 📝 **练习**：[例题 15.5](#155-关联矩阵有多大l14-p4043)

---

## 15. 示例题（附解答）

### 15.1 suffix-s：假阳性与假阴性（L13 p18–20）

对 cats、lakes、wiis、centuries、is 使用 suffix-s 词干提取器（去掉结尾的 "s"，假定是复数）。哪些结果是假阴性，哪些是假阳性？

> ✍️ **先自己试一试。**

**解答。** cats → cat、lakes → lake、wiis → wii 都是对的。centuries → **centurie**，而不是 century：两个相关的词没能合并，这是**假阴性**。is → **i**：两个不相关的词被合并了，这是**假阳性**。返回[第 5 节](#5-词干提取)。

### 15.2 手算 Porter 第 1 步（L13 p22）

只按幻灯片上的 Step 1a 和 Step 1b，依次对下面的词提取词干：stresses、gaps、gas、ties、cries、agreed、feed、fished、pirating、falling、dripping、hoping。

> ✍️ **先自己试一试。**

**解答。**

| 词 | 触发的规则 | 结果 |
|---|---|---|
| stresses | 1a：sses → ss | stress |
| gaps | 1a：删除 s（"p" 之前有元音 "a"） | gap |
| gas | 1a：保留 s（元音 "a" 紧挨在 s 前面） | gas |
| ties | 1a：ies → ie（前面只有一个字母 "t"） | tie |
| cries | 1a：ies → i（前面多于一个字母） | cri |
| agreed | 1b：eed → ee（后缀位于 "ag" 之后，即第一个元音后的第一个非元音之后） | agree |
| feed | 1b：保留 eed（后缀不在那个区域内） | feed |
| fished | 1b：删除 ed | fish |
| pirating | 1b：删除 ing，然后以 "at" 结尾 → 加 e | pirate |
| falling | 1b：删除 ing；"ll" 是允许的双写字母 | fall |
| dripping | 1b：删除 ing，然后双写 "p" → 去掉一个 | drip |
| hoping | 1b：删除 ing，然后短词 → 加 e | hope |

[第 6 节](#6-porter-词干提取器)中的演示正是按这些规则运行的，12 个结果完全相同。

### 15.3 1,000 词的文档里有多少个 n-gram？（L14 p14–15）

一篇文档有 1,000 个词。使用重叠窗口时，它包含多少个 2 ≤ n ≤ 5 的词 n-gram 实例？

> ✍️ **先自己试一试。**

**解答。** n 个词的窗口可以放在 $1000 - n + 1$ 个位置：999 个 bigram、998 个 trigram、997 个 fourgram、996 个 fivegram。合计 $999 + 998 + 997 + 996 = 3{,}990$——是文档长度的四倍。这就是为 n-gram 建索引的存储代价。返回[第 10 节](#10-词-n-gram)。

### 15.4 Brutus AND Caesar AND NOT Calpurnia（L14 p33–38）

使用第 13 节的关联矩阵，哪些剧本满足 *Brutus AND Caesar AND NOT Calpurnia*？

> ✍️ **先自己试一试。**

**解答。** Brutus = 110100，Caesar = 110111，Calpurnia = 010000 → NOT Calpurnia = 101111。110100 AND 110111 = 110100；再 AND 101111 = **100100**。第 1 列和第 4 列：**Antony and Cleopatra** 和 **Hamlet**。Julius Caesar 两个名字都有，但也有 Calpurnia，所以被 NOT 排除了。返回[第 13 节](#13-词项-文档关联矩阵)。

### 15.5 关联矩阵有多大？（L14 p40–43）

$N = 10^6$ 篇文档，每篇约 $10^3$ 个词，每词约 6 字节，$M = 500\text{K}$ 个不同词项。文本有多少？矩阵有多少个格子？最多有多少个 1？

> ✍️ **先自己试一试。**

**解答。** 文本：$10^6 \times 10^3 \times 6$ 字节 $= 6 \times 10^9$ 字节 ≈ **6 GB**。矩阵：$5 \times 10^5 \times 10^6 = 5 \times 10^{11}$ 个格子，即**五千亿**个。1 的个数：每个词的出现最多贡献一个，所以最多 $10^6 \times 10^3 = 10^9$ 个，即**十亿**个。最多只有 $10^9 / (5 \times 10^{11}) = 0.2\%$ 的格子是 1（这是我们用幻灯片数字算出的比例），所以只存 1 的位置。返回[第 14 节](#14-为什么这个矩阵无法扩展)。

---

## 16. 速查与必记的 5 件事

| 文本处理步骤 | 作用 | 注意 |
|---|---|---|
| 分词 | 字符 → 词元；转小写（case folding） | 连字符、撇号、句点、数字；查询必须和文档用同样的分词方式 |
| 停用词去除 | 去掉功能词 | "to be or not to be"；最好全部建索引，查询时再决定 |
| 词干提取 | 把形态变体合并成一个词干 | 假阳性（is → i）与假阴性（centuries ↛ century） |
| 短语 | 多词单元 | 词性标注（慢）、n-gram（占存储）、位置 + 邻近运算符 |
| 结构 / 标记 | 重视标题、锚文本、加粗、元数据 | 锚文本描述的是**目标**页面 |

| 词干提取器 | 类型 | 输出 | 错误 |
|---|---|---|---|
| suffix-s | 算法型 | 词干 | 假阴性多，也有一些假阳性 |
| Porter | 算法型（规则，最长后缀） | 词干，不一定是词 | 错误多，难以修改 |
| Porter2 | 算法型 | 词干 | 修正了部分 Porter 的问题，可加入例外 |
| 词典型 | 词表 | 词 | 假阳性极少；处理不了新词 |
| Krovetz | 混合：先查词典，再去后缀 | 词 | 假阳性更少，假阴性稍多 |

| 关联矩阵 | 值 |
|---|---|
| 元素 | 文档包含该词项时为 1 |
| AND / NOT 查询 | 对行做按位 AND；NOT = 取反 |
| $N = 10^6$、$M = 5 \times 10^5$ 时的大小 | $5 \times 10^{11}$ 个格子，≤ $10^9$ 个 1 → 稀疏，只存 1 |

**必记的 5 件事**

1. 分词中的小决定可能大幅改变查询效果——查询必须和文档经过完全相同的步骤。
2. 停用词的常用策略：全部建索引，查询时再决定；停用词在组合中有意义。
3. 词干提取器在假阳性和假阴性之间权衡：Porter 产生词干（cri），Krovetz 产生词。
4. 短语可以用词性标注（准确、慢）、n-gram（快、占存储：n = 2–5 时每 1,000 词有 3,990 个）、或位置 + 邻近运算符来识别；锚文本是目标页面的强信号。
5. 关联矩阵用按位 AND/OR/NOT 回答布尔查询，但在 Web 规模下它巨大且稀疏——只存 1。
