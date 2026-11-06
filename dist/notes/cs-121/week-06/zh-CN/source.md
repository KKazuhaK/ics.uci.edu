# CS 121: Information Retrieval — Week 6：倒排索引、索引构建、查询处理

## 目录

- [1. 我们所在的位置：从矩阵到索引](#1-我们所在的位置从矩阵到索引)
- [2. 倒排索引：词典与 postings](#2-倒排索引词典与-postings)
- [3. 构建索引：索引器的步骤](#3-构建索引索引器的步骤)
- [4. 索引能放进内存吗？](#4-索引能放进内存吗)
- [5. 查询处理：用合并 postings 实现 AND](#5-查询处理用合并-postings-实现-and)
- [6. 布尔检索模型](#6-布尔检索模型)
- [7. 索引与排序：抽象模型](#7-索引与排序抽象模型)
- [8. 更丰富的 postings：计数、位置、区段与分数](#8-更丰富的-postings计数位置区段与分数)
- [9. 简单的内存索引器与 docID](#9-简单的内存索引器与-docid)
- [10. 扩展索引构建：硬件基础](#10-扩展索引构建硬件基础)
- [11. 课堂笔记与作业提示](#11-课堂笔记与作业提示)
- [12. 示例题（附解答）](#12-示例题附解答)
- [13. 速查与必记的 5 件事](#13-速查与必记的-5-件事)

> UCI CS 121 / IN4MATX 141: Information Retrieval — Prof. Alberto Krone-Martins, Fall 2026, week of Nov 4
> 整理自 Lecture 15 和 16 的幻灯片（YuJa 视频未收录；课堂用的 Lecture 14.5 幻灯片未发布）。按概念组织，而不是按讲次组织。
> 📖 本周阅读：[Croft et al.，第 5 章 Ranking with Indexes](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [Manning, Raghavan & Schütze，*Introduction to IR*，第 2 和第 4 章](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

> 📅 **课程安排**：Online Quiz 2 在 **11 月 4 日（周三）** 课上进行（请带笔记本电脑）。
> Assignment 3 Milestone 1（索引器）截止时间为 **11 月 6 日（周五）**。
> 下周：**11 月 11 日没有线下课**（退伍军人节）；Assignment 3 Milestone 2 截止时间为 **11 月 13 日（周五）**。

---

## 1. 我们所在的位置：从矩阵到索引

两份幻灯片都从架构图开始（L15 p2、p28 · L16 p2）；完整的架构图见[第 1 周第 10 节](week-01.zh-CN.md#10-搜索引擎架构)。本周的内容集中在两个方框里：**索引创建**（Index Creation，用处理过的文本建立索引）和**查询过程**（Querying Process，利用索引回答查询）。

L15 从回顾第 14 讲的结尾开始（L15 p3–9）：Shakespeare 查询 *Brutus AND Caesar but NOT Calpurnia*，词项-文档关联矩阵，以及在 0/1 的行上做**按位 AND** 得到结果 `1 0 0 1 0 0`（即 *Antony and Cleopatra* 和 *Hamlet*）。这些内容都在[第 5 周第 13 节](week-05.zh-CN.md#13-词项-文档关联矩阵)，并附有演示。

"Problem" 幻灯片（L15 p9）是通向本周内容的桥梁：这个矩阵因为规模太大，对大量文档**不可行**——**但矩阵是稀疏的**。数字见[第 5 周第 14 节](week-05.zh-CN.md#14-为什么这个矩阵无法扩展)。"所以……"——只存储其中的 1。这就是倒排索引。

---

## 2. 倒排索引：词典与 postings

### 2.1 每个词项一个列表

**对每个词项 *t*，存储一个包含 *t* 的所有文档的列表**（L15 p10–13）。每个文档由一个 **docID**（文档编号，即文档的序号）标识。

```text
Brutus    → 1  2  4  11  31  45  173  174
Caesar    → 1  2  4   5   6  16   57  132
Calpurnia → 2  31 54 101
```

幻灯片提出的问题：**能否用定长数组来存？** 如果把词 *Caesar* 加入文档 14，会发生什么？（答案见[例题 12.1](#121-把-caesar-加入文档-14l15-p1114)。）因此我们需要**变长的 postings 列表**（L15 p14）：

- **在磁盘上**，**连续存放的一串 postings** 是最优方案。
- **在内存中**，可以用链表、变长数组或关联数组——需要在**大小与插入的便利性**之间权衡。

该幻灯片上的词汇：

| 部分 | 含义 |
|---|---|
| **词典**（Dictionary） | 词项（Brutus、Caesar、Calpurnia） |
| **Postings** | 所有列表合在一起 |
| **Posting** | 列表中的一项（一个 docID） |

列表按 **docID 排序**（"稍后再讲为什么"——原因见[第 5 节](#5-查询处理用合并-postings-实现-and)中的合并）。

在代码中，倒排索引通常是一个映射（map / dictionary），以词项为键，以 postings 列表为值（L15 p15）：`friend → 2, 4, …`、`roman → 1, 2, …`、`countryman → 13, 16`。

### 2.2 索引的一般概念与术语

**索引是为加快搜索而设计的数据结构**（L15 p38–39 · L16 p3）。文本搜索有其独特的需求，因此也催生了独特的数据结构。其中最常见的是**倒排索引**：

- 它是**一类结构的统称**，而不是某种固定的布局；
- 之所以叫"倒排"，是因为它把**词与文档反过来关联**——文档与词相关联，而不是词与文档相关联，类似书末的索引（concordance）。

Croft 的术语（L15 p46）：

- 每个索引词项都关联一个**倒排列表**（inverted list）。它包含文档列表，或文档中词出现位置的列表，以及其他信息。
- 每一项是一个 **posting**。posting 中指向某个具体文档或位置的部分称为**指针**（pointer）。
- 文档集合中的每个文档都获得一个**唯一编号**。
- 列表通常按**文档顺序**排列（按文档编号排序）。

### 2.3 运行示例：S1–S4

两份幻灯片都使用的 Croft 示例（L15 p47 · L16 p9）对四个关于热带鱼的句子建立索引：

- **S1** Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species.
- **S2** Fishkeepers often use the term tropical fish to refer only those requiring fresh water, with saltwater tropical fish referred to as marine fish.
- **S3** Tropical fish are popular aquarium fish, due to their often bright coloration.
- **S4** In freshwater fish, this coloration typically derives from iridescence, while salt water fish are generally pigmented.

其简单倒排索引（每个 posting 是句子编号；共 46 个词项）：

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

> 💡 **关键见解**：索引从不存储 0。`fish` 有 4 个 posting，`marine` 只有 1 个——存储空间随（词项，文档）对的数量增长，而不是随词项数 × 文档数增长。

> 📝 **练习**：[例题 12.1](#121-把-caesar-加入文档-14l15-p1114)

> 🔗 **延伸阅读**：[Croft §5.3 Inverted Indexes 与 §5.3.1 Documents（书中第 129、131 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR 第 1–2 章](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 3. 构建索引：索引器的步骤

### 3.1 整体流程

倒排索引的构建流程（L15 p16–19，逐阶段逐帧展开）：

| 阶段 | 例子 |
|---|---|
| 待索引的文档 | `Friends, Romans, countrymen.` |
| **分词器**（Tokenizer）→ 词元流 | `Friends` `Romans` `Countrymen` |
| **文本处理：语言学模块** → 处理后的词元 | `friend` `roman` `countryman` |
| **索引器**（Indexer）→ 倒排索引 | `friend → 2 → 4`，`roman → 1 → 2`，`countryman → 13 → 16` |

**文本处理的典型最小阶段**（L15 p20）就是第 5 周的内容：**分词**（把字符序列切成词元；处理 "John's" 以及 *a state-of-the-art solution*）、**规范化**（把文本与查询词映射到同一形式：希望 *U.S.A.* 与 *USA* 能匹配）、**可选的词干提取**（*authorize*、*authorization*），以及**可选的停用词去除**（*the, a, to, of*——可以去掉，也可以保留）。详情见[第 5 周第 3 节 分词过程](week-05.zh-CN.md#3-分词过程)、[第 4 节 停用词去除](week-05.zh-CN.md#4-停用词去除)、[第 5 节 词干提取](week-05.zh-CN.md#5-词干提取)。

> ⚠️ **易错点**：对文档词元做的任何处理，都必须对**查询**词也做一遍（这就是"把文本与查询词映射到同一形式"的含义）。如果索引里对 *authorization* 做了词干提取，而查询里没做，查询就会漏掉结果。

### 3.2 词元序列、排序，以及词典与 postings

两份文档（L15 p21）：

- **Doc 1**：*I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me.*
- **Doc 2**：*So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious*

1. **词元序列**（L15 p21）：按文本顺序排列的 **（修正后的词元，文档 ID）对**序列——`(I, 1) (did, 1) (enact, 1) … (me, 1) (so, 2) … (ambitious, 2)`：共 29 对。
2. **排序**（L15 p22）：先按词项，再按 docID 排序：`(ambitious, 2) (be, 2) (brutus, 1) (brutus, 2) (caesar, 1) (caesar, 2) (caesar, 2) (capitol, 1) …`。
3. **合并与拆分**（L15 p22）：同一文档中某词项的多个条目被**合并**；结果被拆分为**词典**和 **postings**；**文档频率**（包含该词的文档数）被加入词典。"为什么要统计频率？之后再讨论。"

结果：22 个词项。有两个 posting 的是 `brutus`、`caesar`、`the`、`was`（df = 2，postings `1 → 2`）；其他词项的 df 都是 1。

> ⚠️ **幻灯片错误**（L15 p22）：排序表中列的是 `hath | 1`，但 *hath* 只出现在 Doc 2 中。同一张幻灯片上的 postings 列（以及 p23）正确地显示 `hath → 2`。同一张表还把 `capitol` 排在 `caesar` 之前。

逐步演示构建过程，或输入你自己的文档（`docID: text; docID: text`）：

```viz inverted-index
{"title": "Doc 1 与 Doc 2 的索引构建步骤（L15 p21–23）", "docs": "1: I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me. ; 2: So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious", "postings": "docs", "lang": "zh", "interactive": true}
```

### 3.3 存储的代价在哪里？

L15 p23 指向结果的两部分：**词项与计数**（词典），以及 **docID 列表**（postings）。IR 系统实现的两个问题是：**如何高效地建索引？** 以及**需要多少存储空间？**——见[第 4 节](#4-索引能放进内存吗)、[第 9 节](#9-简单的内存索引器与-docid)和[第 10 节](#10-扩展索引构建硬件基础)。

> 📝 **练习**：[例题 12.2](#122-为文档-1-和文档-2-建立索引l15-p2123)

> 🔗 **延伸阅读**：[Croft §5.6.1 Simple Construction（书中第 156 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR 第 1、2 章](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 4. 索引能放进内存吗？

**小数据的倒排索引**（L15 p24–25）。如果能放进内存，就用 Python 的字典 `{}`（或 Java 的 `HashMap`）：

- 建索引时往里填充，
- 把它写入文件，
- 搜索时再把它加载回字典 / HashMap。

实现起来非常简单……**但这在任何真实的网络搜索引擎中都行不通**。

**大数据的倒排索引**——一个粗略的估算（L15 p26）：

| 量 | 数值 |
|---|---|
| 词汇表 | 50,000 个词元 |
| 平均 postings 列表长度 | 20 |
| Postings 数 | 50,000 × 20 = **1,000,000** |
| DocID = URL，平均 50 个字符 | 每个约 100 字节（Python） |
| Postings 存储 | 1,000,000 × 100 = **100,000,000 字节 = 100 MB** |
| 每条 posting 的附加载荷（如 tf-idf），每个 4 字节 | 还要再多出好几 MB |

而网络上的文档远远超过 10⁶ 个（仅主机数就超过 10⁹）。所以**通常索引无法一次全部放进内存**，会出现内存不足（out-of-memory）错误。

> 💡 **关键见解**：这张幻灯片引出两个杠杆：让 postings 变小（用整数 docID 代替 URL，见[第 9.2 节](#92-docidurl-还是整数)），以及不再假设整个索引都放在内存中（见[第 10 节](#10-扩展索引构建硬件基础)）。

> 📝 **练习**：[例题 12.3](#123-索引有多大l15-p26)

---

## 5. 查询处理：用合并 postings 实现 AND

"我们刚建好的索引：如何处理查询？"（L15 p27–29；*可以处理哪些类型的查询*放在后面讲。）

查询 **Brutus AND Caesar**（L15 p30）：

1. 在词典中找到 *Brutus*，取出它的 postings。
2. 在词典中找到 *Caesar*，取出它的 postings。
3. **"合并"**（merge）两个 postings：对文档集合取**交集**。

```text
Brutus → 2 → 4 → 8 → 16 → 32 → 64 → 128
Caesar → 1 → 2 → 3 → 5 → 8 → 13 → 21 → 34
answer:  2, 8
```

**合并**（L15 p31）：同时遍历两个 postings，所需时间与两个 postings 的总条目数**呈线性关系**。若两个列表长度分别为 $x$ 和 $y$，查询时的合并需要 $O(x+y)$ 次操作。**关键：postings 必须按 docID 排序。**

算法（L15 p32）：

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

同样的算法用 Python 实现，用列表下标充当指针：

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

为什么较小的指针可以移动：如果 `p1[i] < p2[j]`，另一个列表已经越过了 `p1[i]`（列表是有序的），所以文档 `p1[i]` 不可能同时出现在两个列表中。输入你自己的列表（`list1 | list2`）试试：

```viz postings-intersect
{"title": "Brutus AND Caesar（L15 p30–32）", "lists": "2 4 8 16 32 64 128 | 1 2 3 5 8 13 21 34", "terms": "Brutus, Caesar", "lang": "zh", "interactive": true}
```

> ⚠️ **易错点**：$O(x+y)$ 的合并依赖于两个列表**都按 docID 排序**（L15 p31）——这就是 L15 p14 中"稍后再讲为什么"的原因。

> 📝 **练习**：[例题 12.4](#124-通过合并求-brutus-and-caesarl15-p3032)

> 🔗 **延伸阅读**：[Croft §5.7 Query Processing（书中第 165 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR 第 1 章（处理布尔查询）](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 6. 布尔检索模型

**布尔查询：精确匹配**（L15 p33–34）：

- 在**布尔检索模型**（Boolean retrieval model）中，查询是用 **AND、OR 和 NOT** 连接词项的布尔表达式。
- 它把每篇文档看作**一个词的集合**。
- 它很**精确**：文档要么**符合条件，要么不符合**——没有排序。
- 也许是构建 IR 系统最简单的模型；它是**三十年来主要的商用检索工具**。
- 许多搜索系统至今仍然是布尔式的：**电子邮件、图书馆目录、macOS Spotlight**。

**例子：WestLaw**（L15 p35–37）是最大的商用（付费订户）法律搜索服务：1975 年启动，1992 年加入排序，2010 年加入联邦搜索；数据量达数十 TB，约 70 万用户。幻灯片展示了它的高级搜索页面（包括词项、连接符与扩展符、日期和引用限制等字段）。**大多数用户仍然使用布尔查询**——在法律领域，**"精确"**的结果非常重要。

| 信息需求 | WestLaw 查询 |
|---|---|
| 在涉及联邦侵权索赔法（federal tort claims act）的案件中，诉讼时效是什么？ | `LIMIT! /3 STATUTE ACTION /S FEDERAL /2 TORT /3 CLAIM` |
| 残疾人进入工作场所的无障碍要求 | `disabl! /p access! /s work-site work-place (employment /3 place` |

`/3` = 3 个词之内，`/S` = 同一句之内。**注意，空格表示的是析取（OR），而不是合取（AND）！**

这些查询很长、很精确，带有邻近运算符，并且是逐步构造出来的——**与网络搜索完全不同**。许多专业检索人员仍然喜欢布尔搜索：**你确切知道自己会得到什么。**

> ⚠️ **易错点**：在 WestLaw 中，`work-site work-place` 表示 work-site **或** work-place。而在 Assignment 3 MS2 中则相反：`cristina lopes` 表示 AND（见[第 11 节](#11-课堂笔记与作业提示)）。空格运算符是每个系统自己的设计选择。

> 🔗 **延伸阅读**：[WestLaw（幻灯片链接）](http://www.westlaw.com/) · [IIR 第 1 章（布尔检索模型）](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 7. 索引与排序：抽象模型

**索引与排序**（L15 p40）：索引的设计是为了支持搜索——**更快的响应时间，以及更新**。网络搜索引擎使用一种特定的搜索形式，即**排序检索**（ranking）：文档按照根据文档表示、查询和排序算法计算出的**分数**，以**排好的顺序**返回。一个合理的**排序抽象模型**让我们可以在不涉及具体检索模型细节的情况下讨论索引。

**排序的抽象模型**（L15 p41–44 · L16 p4–7，分四帧逐步展开）。文档是 *Fred's Tropical Fish Shop*（"…the best place to find tropical fish at low, low prices. Whether you're looking for a little fish or a big fish… We even have fake seaweed for your fishtank (and little surfboards too)."）。

| 主题特征（来自文本） | 质量特征（关于文档本身） |
|---|---|
| 9.7 fish · 4.2 tropical · 22.1 tropical fish · 8.2 seaweed · 4.2 surfboards | 14 个入链 · 距上次更新 3 天 |

**特征函数**（feature function）把文本映射为一个实数，$f(\text{text}) \to \mathbb{R}$（L15 p43）。**排序函数**（ranking function）接收特征与查询（*tropical fish*），输出一个**文档分数**（抽象图中为 24.5）。

**更具体的模型**（L15 p45 · L16 p8）：

$$R(Q, D) = \sum_i g_i(Q)\, f_i(D)$$

$f_i$ 是**文档特征函数**，$g_i$ 是**查询特征函数**，$i$ 遍历各个特征。查询 *tropical fish* 有自己的特征值：

| 特征 $i$ | $f_i(D)$ | $g_i(Q)$ |
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

只有两边都有的特征才参与计算，得到幻灯片中的**文档分数 303.01**。

> 💡 **关键见解**：排序是对各特征求和（查询权重 × 文档取值）。索引的作用是让 $f_i(D)$ 能被快速找到——这也是为什么[第 8 节](#8-更丰富的-postings计数位置区段与分数)要在 postings 中放入更多信息。

> 📝 **练习**：[例题 12.5](#125-文档得分-30301l15-p45--l16-p8)

> 🔗 **延伸阅读**：[Croft §5.2 Abstract Model of Ranking（书中第 126 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf)

---

## 8. 更丰富的 postings：计数、位置、区段与分数

L16 p9–18 以[第 2.3 节](#23-运行示例s1s4)的 S1–S4 索引为起点，每次为每条 posting 增加一种信息。

### 8.1 计数

**带计数的倒排索引**（L16 p10）：每个 posting 是 `docID:count`，即该词在该文档中出现的次数。它**支持更好的排序算法**。

```text
fish      1:2  2:3  3:2  4:2
tropical  1:2  2:2  3:1
to        2:2  3:1
the       1:1  2:1
```

（其他词在每个所在文档中的计数都是 1。）

### 8.2 位置与邻近匹配

**带位置的倒排索引**（L16 p11）：每个 posting 是 `docID,position`（词在句子中的序号），每次出现对应一个 posting。它**支持邻近匹配**。

```text
tropical  1,1  1,7  2,6  2,17  3,1
fish      1,2  1,4  2,7  2,18  2,23  3,2  3,6  4,3  4,13
water     1,17  2,14  4,12
```

**邻近匹配**（L16 p12–13）：匹配**短语**（"tropical fish"），或**窗口内的词**（在 *fish* 的 5 个词之内找 *tropical*）。如果倒排索引的 posting 存储了位置——即 postings `[docID, 词位置]`——这些查询特征就能**高效**实现：对齐两个列表，查找同一文档中位于 *tropical* 位置 $p$、紧接其后位置 $p+1$ 处的 `fish`。

```text
tropical  1,1        1,7  2,6  2,17        3,1
fish      1,2  1,4        2,7  2,18  2,23  3,2  3,6  4,3  4,13
```

短语 *tropical fish* 出现在 1,1–2 · 2,6–7 · 2,17–18 · 3,1–2 处（S4 中没有 *tropical*）。完整的位置索引，逐步展示如下：

```viz inverted-index
{"title": "S1–S4 的位置索引（L16 p11）", "docs": "1: Tropical fish include fish found in tropical environments around the world, including both freshwater and salt water species. ; 2: Fishkeepers often use the term tropical fish to refer only those requiring fresh water, with saltwater tropical fish referred to as marine fish. ; 3: Tropical fish are popular aquarium fish, due to their often bright coloration. ; 4: In freshwater fish, this coloration typically derives from iridescence, while salt water fish are generally pigmented.", "postings": "positions", "lang": "zh"}
```

### 8.3 字段与区段

**文档结构对搜索有用**（L16 p14–15；[第 5 周第 11 节](week-05.zh-CN.md#11-文档结构与标记)）：

- **字段限制**——例如日期、`from:` 等；
- **某些字段中的词更重要**——例如标题！

在索引中捕获这一点的选项：

1. **为每种字段类型建立单独的倒排索引**；
2. **在 postings 中加入字段信息**；
3. 使用**区段列表**（extent lists）。

**区段列表**（L16 p16）：**区段**（extent）是文档中一段**连续的区域**，用词的位置表示。某个**字段类型**的倒排列表记录了该字段的所有区段：

```text
fish   1,2  1,4  2,7  2,18  2,23  3,2  3,6  4,3  4,13
title  1:(1,3)  2:(1,5)  4:(9,15)
```

`1:(1,3)` 表示文档 1 中的一个标题区段，由词位置 1 和 3 给出。要匹配**标题中的 fish**，对齐两个列表：`1,2` 落在 `1:(1,3)` 内，`4,13` 落在 `4:(9,15)` 内；文档 2 的标题区段 `(1,5)` 中没有 `fish` 的 posting，文档 3 没有标题区段。

### 8.4 分数与按分数排序的列表

**其他可能性**（L16 p17–18）：

- **存储预先计算的分数**：例如 *fish* 的列表为 `[(1:3.6), (3:2.2)]`，其中 3.6 是文档 1 的特征值总和。**提高了速度，但降低了灵活性**（如果更改排序方法，就必须重建索引）。
- **创建按分数排序的列表**：查询处理引擎可以**只关注每个倒排列表的顶部**，即分数最高的文档所在处。**对单词查询非常高效**。

| Posting 存储的内容 | 示例 | 支持的功能 |
|---|---|---|
| docID | `fish 1 2 3 4` | 布尔查询（AND/OR/NOT） |
| docID:count | `fish 1:2 2:3 3:2 4:2` | 更好的排序（词频） |
| docID,position | `fish 1,2 1,4 …` | 短语、邻近窗口 |
| 每个字段的区段列表 | `title 1:(1,3) …` | 字段限制、标题加权 |
| docID:score | `fish (1:3.6) (3:2.2)` | 快速排序；灵活性较低 |

> 📝 **练习**：[例题 12.6](#126-找出短语-tropical-fishl16-p1113)

> 🔗 **延伸阅读**：[Croft §5.3.2 Counts（第 133 页）、§5.3.3 Positions（第 134 页）、§5.3.4 Fields and Extents（第 136 页）、§5.3.5 Scores（第 138 页）、§5.3.6 Ordering（第 139 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR 第 2 章（位置 postings 与短语查询）](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 9. 简单的内存索引器与 docID

### 9.1 BuildIndex

**简单的内存索引器**（L16 p19–22；后续几帧分别高亮其中的部分）：

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

高亮处所指的内容：

- `n ← 0` / `n ← n + 1`（L16 p22）：**文档编号**——docID 是一个计数器，而不是 URL（[第 9.2 节](#92-docidurl-还是整数)）。
- `List<Posting>()` / `Posting(n)`（L16 p29）：posting 内部存放的内容（[第 9.3 节](#93-一个-posting-包含什么)）。
- `I ← HashTable()` 和 `return I`（L16 p32）：整个索引存放在一个内存哈希表中。"如果内存用完了会怎样？"（L16 p33）→ 见[第 10 节](#10-扩展索引构建硬件基础)。

带有幻灯片中 `Posting` 类（L16 p31，保存频率计数）的可运行 Python 版本：

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

与[第 3.2 节](#32-词元序列排序以及词典与-postings)基于排序的步骤得到的是同样的 22 个词项。文档按 docID 顺序处理，因此每个列表无需排序就已按 docID 排好。

### 9.2 docID：URL 还是整数

**如果 docID 是 URL**（L16 p23）：`https://www.ics.uci.edu/~aburtsev/238P/lectures/lecture03-calling-conventions` 有 **77 个字符**——在 C++ 中占 77 字节，在 Python 3 中占 126 字节，在 Java 中占 352 字节。DocID 用于 postings 列表，并且根据 posting 的结构，可能在同一列表中**多次出现**。**字符串的存储和比较都非常浪费。**

**在处理文档时把 URL 映射为整数**（L16 p24）：

```text
0 → https://www.ics.uci.edu/~aburtsev/238P/lectures/lecture03-calling-conventions
1 → https://www.ics.uci.edu/~goodrich/teach/ics247/notes
2 → https://www.ics.uci.edu/~thornton/ics184/MidtermSolutions.html
…
```

整数在 **C、C++ 和 Java 中占 4 字节，在 Python 中占 28 字节**——几乎总是相同的大小，与字符串长度无关。

Python 3 的估算（L16 p25–27）：10,000 个索引词项，每个词约 20 条 posting，平均 URL 为 51 个字符（约 100 字节）：

| DocID 形式 | 大小 |
|---|---|
| URL | 10,000 × 20 × 100 ≈ **20,000,000 字节（20 MB）** |
| 整数 | 10,000 × 20 × 28 ≈ **5,600,000 字节（5.6 MB）** |

**降到了字符串版本的 28%**——相当于能在内存中多放约 **4 倍**的 postings，而且**排序明显更快**。

**你必须把这个映射保存在某处**（L16 p28）：展示搜索结果时需要它（用户要的是 URL，而不是数字）。它通常**不属于倒排索引本身**，而是一个**辅助性质的记账结构，序列化保存到文件中**（辅助结构之后还会再讲）。

> ⚠️ **幻灯片说明**（L16 p24）：幻灯片上 "converts integers to longs when they overflow"（整数溢出时转换为 long）这句话描述的是 Python 2；Python 3 只有一种任意精度的 `int`。

### 9.3 一个 posting 包含什么

**postings 包含词项在文档中出现的上下文**（L16 p30–31）：**doc id**、**频率计数或 TF-IDF**、**字段**、**位置**，等等。整个列表被框起来，标注为 "Required for Project 3"（Project 3 必需），并且 L16 p30 用红色高亮了 doc id 和频率计数 / TF-IDF：

```python
class Posting:
    def __init__(self, docid, tfidf, fields):
        self.docid = docid
        self.tfidf = tfidf  # use freq counts for now
        self.fields = fields
```

> 📝 **练习**：[例题 12.7](#127-docid-用-url-还是整数l16-p2327)

> 🔗 **延伸阅读**：[Croft §5.5 Auxiliary Structures（第 154 页）、§5.6 Index Construction（第 156 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR 第 4 章（索引构建）](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 10. 扩展索引构建：硬件基础

**内存中的索引构建无法扩展**（L16 p33–37）：你无法把整个文档集合放进内存。如何在**考虑硬件约束**（内存、磁盘、速度等）的前提下，为非常大的文档集合构建索引？

**硬件基础**（L16 p38–42）：

- IR 系统中使用的服务器通常有**几 GB 的主存**，有时达数百 GB。可用**磁盘空间比内存大 2–3 个数量级**。
- 但**容错非常昂贵**：用**许多普通机器**比用一台容错机器便宜得多——而普通机器的内存要小得多。
- 大规模存储基于**机械硬盘**（spinning disk）。访问内存中的数据比访问磁盘上的数据**快得多**。
- **磁盘寻道**（disk seek）：磁头定位期间不传输任何数据。因此把**一大块**数据从磁盘传输到内存，比传输**许多小块**要快。
- **磁盘 I/O 以块为单位**：读写的是整块，而不是更小的数据片段。块大小为 **8 KB 到 256 KB**。

Jeff Dean 的 **"Latency Numbers Every Programmer Should Know"**（L16 p43，2020 年更新版）：

| 操作 | 延迟 |
|---|---|
| L1 缓存访问 | 0.5–1.5 ns |
| L2 缓存访问 | 5–7 ns |
| L3 缓存访问 | 16–25 ns |
| 互斥锁加锁 / 解锁 | 25 ns |
| 访问 64 MB 主存 | 50–75 ns |
| 通过 100 Gbps HPC 网络发送 4 KB | 1,040 ns |
| 用 Zippy 压缩 1 KB | 2,000 ns（2 µs） |
| 从内存顺序读取 1 MB | 3,000 ns（3 µs） |
| 通过 10 Gbps 以太网发送 4 KB | 10,000 ns（10 µs） |
| 从 SSD 顺序读取 1 MB | 49,000 ns（49 µs） |
| 从 HDD 顺序读取 1 MB | 825,000 ns（825 µs） |
| 磁盘寻道（最长） | 2,000,000 ns（2,000 µs） |
| 发送数据包 CA → 荷兰 → CA | 150,000,000 ns（150,000 µs） |

所以回到索引器的 `I ← HashTable()`：**它能直接是一个文件吗？**（L16 p36、p44）**不能。** 把最长 2 ms 的磁盘寻道与上表中 50–75 ns 的内存访问相比较即可。

> 💡 **关键见解**：一次磁盘寻道的代价相当于数万次内存访问，而且传输一大块数据比传输许多小块快（L16 p41）。如何构建无法放入内存的索引，之后再讲（Schedule 中的第 7 周：分布式索引）。

> 🔗 **延伸阅读**：[Jeff Dean（幻灯片链接）](https://ai.google/research/people/jeff/) · [原始数据（Norvig）](http://norvig.com/21-days.html#answers) · [2019 版（gist）](https://gist.github.com/eshelman/343a1c46cb3fba142c1afdcdeec17646) · [2020 交互版](https://colin-scott.github.io/personal_website/research/interactive_latency.html) · [Croft §5.6.2 Merging（书中第 157 页）](https://ciir.cs.umass.edu/downloads/SEIRiP.pdf) · [IIR 第 4 章（硬件基础）](https://nlp.stanford.edu/IR-book/pdf/irbookonlinereading.pdf)

---

## 11. 课堂笔记与作业提示

"On Assignment 3"（L16 p45–48）——搜索引擎分三个里程碑完成。

**MS1：简单的索引器**（L16 p46）。**从少量文件开始——开发周期要短！**

- 遍历文件夹并读取 JSON；
- 每次打开并读取**一个文件**；
- 解析（要处理**损坏的 HTML**！）；
- 分词与词干提取；
- 简单的**内存中**倒排索引；
- 将简单索引**序列化到磁盘**。

**逐步扩展！！暂时不需要扩大规模……**

**MS2：简单的布尔检索——仅支持 AND**（L16 p47）。查询中的每个词都做 AND：`cristina lopes`、`eppstein Wikipedia`、`master of software engineering` 都表示 AND。**必需：文本界面。** MS3 中的 Web GUI 可获得额外加分。暂时没有速度要求……

**MS3：排序检索**（L16 p48）。**扩大规模**；采用完全不同的方法（之后的课程会讲）；可能受益于位置信息。**必须在 300 ms 内完成**，最好约 100 ms，低于 300 ms 不扣分。在代码中加一个**计时器**，打印从查询到达到产生结果之间的时间（不计 Web GUI 的渲染时间）。

> 💡 **关键见解**：这些里程碑与本周的幻灯片相互对应——MS1 的内存索引正是[第 9.1 节](#91-buildindex)，MS2 的 AND 是[第 5 节](#5-查询处理用合并-postings-实现-and)，MS3 的扩大规模则是[第 10 节](#10-扩展索引构建硬件基础)的问题。postings 至少需要包含 doc id 和频率（或 TF-IDF）（[第 9.3 节](#93-一个-posting-包含什么)）。

---

## 12. 示例题（附解答）

### 12.1 把 Caesar 加入文档 14（L15 p11–14）

Caesar 的 postings 存储在定长数组 `1 2 4 5 6 16 57 132` 中。现在把 *Caesar* 加入文档 14。会发生什么？

> ✍️ **先自己试一试。**

**解答。** 列表必须保持按 docID 排序，所以 14 应该放在 6 和 16 之间：`1 2 4 5 6 14 16 57 132`。在定长数组中，这意味着把 16、57 和 132 **右移**一个位置——如果数组已满（Caesar 的数组有 8 个位置，且已存满 8 项），就需要一个**更大的数组**。列表会随词项而增长和缩小，所以定长数组行不通：我们需要**变长的 postings 列表**（L15 p14）——磁盘上是一段连续存放的内容，内存中则是链表、变长数组或关联数组，需要在大小与插入的便利性之间权衡。

### 12.2 为文档 1 和文档 2 建立索引（L15 p21–23）

Doc 1：*I did enact Julius Caesar I was killed i' the Capitol; Brutus killed me.* Doc 2：*So let it be with Caesar. The noble Brutus hath told you Caesar was ambitious*。建立词典（包含文档频率）和 postings。

> ✍️ **先自己试一试。**

**解答。**

1. 词元序列：29 个 (词项, docID) 对，其中 14 个来自 Doc 1，15 个来自 Doc 2（`I` 出现两次，`killed` 出现两次，Doc 2 中 `caesar` 出现两次）。
2. 按词项、再按 docID 排序。
3. 合并同一文档中的重复项，并统计文档数：

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

22 个词项。`killed` 在 Doc 1 中出现两次，但 df = 1 且只有一条 posting——合并是按文档进行的。（幻灯片的排序表中显示 `hath | 1`；实际应为 2。）

### 12.3 索引有多大？（L15 p26）

词汇表 50,000 个词元，平均 postings 列表长度 20，docID 为约 50 个字符的 URL，在 Python 中约 100 字节。postings 需要多少内存？

> ✍️ **先自己试一试。**

**解答。** Postings：50,000 × 20 = 1,000,000。字节数：1,000,000 × 100 = 100,000,000 ≈ **100 MB**——这还不包括附加载荷（tf-idf，每个 4 字节，会再增加）。这只是 10⁶ 条 postings；网络上的文档远远超过 10⁶ 个，所以索引通常**无法一次全部放进内存**。

### 12.4 通过合并求 Brutus AND Caesar（L15 p30–32）

Brutus → `2 4 8 16 32 64 128`，Caesar → `1 2 3 5 8 13 21 34`。运行 INTERSECT。

> ✍️ **先自己试一试。**

**解答。** 指针对（Brutus, Caesar）：

| 步骤 | 比较 | 操作 |
|---|---|---|
| 1 | 2 vs 1 | 1 < 2 → 前移 Caesar |
| 2 | 2 vs 2 | 相等 → **加入 2**，两个指针都前移 |
| 3 | 4 vs 3 | 3 < 4 → 前移 Caesar |
| 4 | 4 vs 5 | 4 < 5 → 前移 Brutus |
| 5 | 8 vs 5 | 5 < 8 → 前移 Caesar |
| 6 | 8 vs 8 | 相等 → **加入 8**，两个指针都前移 |
| 7 | 16 vs 13 | 13 < 16 → 前移 Caesar |
| 8 | 16 vs 21 | 16 < 21 → 前移 Brutus |
| 9 | 32 vs 21 | 21 < 32 → 前移 Caesar |
| 10 | 32 vs 34 | 32 < 34 → 前移 Brutus |
| 11 | 64 vs 34 | 34 < 64 → 前移 Caesar → Caesar 耗尽，停止 |

结果为 **[2, 8]**，共 11 次比较，在 $x + y = 7 + 8 = 15$ 的上界之内。128 从未被检查。

### 12.5 文档得分 303.01（L15 p45 · L16 p8）

使用 $R(Q,D) = \sum_i g_i(Q) f_i(D)$ 和[第 7 节](#7-索引与排序抽象模型)中的表格。

> ✍️ **先自己试一试。**

**解答。** 只有同时具有 $f_i$ 和 $g_i$ 的特征才计入（seaweed 和 surfboards 没有查询权重；chichlids 和 barbs 不在文档中）：

| 特征 | $g_i(Q) \cdot f_i(D)$ |
|---|---|
| fish | 5.2 × 9.7 = 50.44 |
| tropical | 3.4 × 4.2 = 14.28 |
| tropical fish | 9.9 × 22.1 = 218.79 |
| incoming links | 1.2 × 14 = 16.80 |
| update count | 0.9 × 3 = 2.70 |

$R = 50.44 + 14.28 + 218.79 + 16.80 + 2.70 = \mathbf{303.01}$，即幻灯片中的文档分数。短语特征 *tropical fish* 贡献了其中最大的部分。

### 12.6 找出短语 tropical fish（L16 p11–13）

tropical → `1,1 1,7 2,6 2,17 3,1`；fish → `1,2 1,4 2,7 2,18 2,23 3,2 3,6 4,3 4,13`。短语出现在哪里？

> ✍️ **先自己试一试。**

**解答。** 短语匹配要求：在与 `tropical` 位于位置 $p$ 的同一文档中，`fish` 位于位置 $p+1$：

| tropical | 需要 fish 位于 | 是否找到 |
|---|---|---|
| 1,1 | 1,2 | ✓ |
| 1,7 | 1,8 | ✗（S1 中第 8 个词是 *environments*） |
| 2,6 | 2,7 | ✓ |
| 2,17 | 2,18 | ✓ |
| 3,1 | 3,2 | ✓ |

短语出现 **4 次**，分别位于**文档 1、2 和 3** 中。文档 4 包含 *fish* 但不包含 *tropical*，因此只有文档级索引（`tropical 1 2 3`、`fish 1 2 3 4`）无法把短语与两个词分别出现在任何位置区分开来——这正是位置信息的价值。

### 12.7 docID 用 URL 还是整数？（L16 p23–27）

10,000 个索引词项，每个约 20 条 posting，平均 URL 为 51 个字符（Python 3 中约 100 字节），Python 整数为 28 字节。比较两者的 postings 大小。

> ✍️ **先自己试一试。**

**解答。** URL：10,000 × 20 × 100 = 20,000,000 字节 ≈ **20 MB**。整数：10,000 × 20 × 28 = 5,600,000 字节 ≈ **5.6 MB**——是 URL 版本的 28%，因此在相同内存中大约能多放 3.6 倍（100 / 28 ≈ 3.6，接近 4 倍）的 postings；而且整数的排序和比较快得多。代价是：需要一个 docID → URL 的辅助映射，保存到文件中，以便展示结果。

---

## 13. 速查与必记的 5 件事

**索引词汇**

| 术语 | 含义 |
|---|---|
| 词典（Dictionary） | 词项的集合（包含文档频率） |
| 倒排列表 / postings 列表（Postings list / inverted list） | 某个词项的 docID（及更多信息），按 docID 排序 |
| Posting | 一项记录；其中的文档部分称为*指针* |
| 文档频率（document frequency, df） | 包含该词项的文档数 |
| 区段（Extent） | 文档中一段连续的区域（一个字段），用词位置表示 |

**索引器步骤**

| 步骤 | 输出 |
|---|---|
| 分词 + 语言学模块 | 处理后的词元 |
| 生成对 | 按文本顺序排列的 (词项, docID) |
| 排序 | 先按词项，再按 docID |
| 合并 | 每个词项一条词典项 + df + postings |

**查询处理**

| 操作 | 代价 | 要求 |
|---|---|---|
| `t1 AND t2`（INTERSECT） | $O(x + y)$ | postings 按 docID 排序 |
| 短语 `"t1 t2"` | 按 docID 合并，然后比较位置 $p, p+1$ | 带位置的 postings |
| 排序 | $R(Q,D) = \sum_i g_i(Q) f_i(D)$ | 索引中存有特征（计数、位置、分数） |

**大小与延迟**

| 事实 | 数值 |
|---|---|
| 使用 URL docID 的 1M 条 postings（Python） | 约 100 MB（L15 p26） |
| URL 与整数 docID，20 万条 postings | 20 MB 对 5.6 MB（28%） |
| 整数大小 | C/C++/Java 为 4 字节，Python 为 28 字节 |
| 内存访问与磁盘寻道 | 50–75 ns 对最长 2 ms |
| 磁盘块大小 | 8–256 KB |

**必记的 5 件事**

1. 倒排索引把每个**词项 → docID 的 postings 列表**对应起来，只存储稀疏矩阵中的 1，并保持列表**按 docID 排序**。
2. 索引器生成 **(词项, docID) 对，按词项再按 docID 排序，并合并同一文档中的重复项**；**df** 是文档数，而不是出现次数。
3. **AND = 用两个指针合并两个有序的 postings**，时间为 $O(x+y)$；遇到不匹配时，前移**较小** docID 所在的指针。
4. Postings 可以携带**计数**（用于排序）、**位置**（用于短语与邻近）、**区段**（用于字段）或**预先计算的分数**（速度与灵活性之间的权衡）；分数为 $\sum_i g_i(Q) f_i(D)$。
5. 使用**整数 docID** 加上辅助的 URL 映射，并且不要直接在文件中构建索引（L16 p44：**不能**）——**一次磁盘寻道的代价相当于数万次内存访问**，而内存中的构建同样无法扩展。