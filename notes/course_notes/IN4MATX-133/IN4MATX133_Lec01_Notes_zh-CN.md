# IN4MATX 133: User Interface Software — Lecture 1：简介与历史

## 目录

- [1. 为什么 UI 实现很重要](#1-为什么-ui-实现很重要)
- [2. Weiser 与计算的三次浪潮](#2-weiser-与计算的三次浪潮)
- [3. 第一次浪潮：大型机计算](#3-第一次浪潮大型机计算)
- [4. 第二次浪潮：个人计算](#4-第二次浪潮个人计算)
- [5. 第三次浪潮：普适计算](#5-第三次浪潮普适计算)
- [6. 为什么 Web 工具成为标准](#6-为什么-web-工具成为标准)
- [7. 课程目标与作业](#7-课程目标与作业)
- [8. 课程团队与政策](#8-课程团队与政策)
- [9. 课堂问题与演示（附解答）](#9-课堂问题与演示附解答)
- [10. 速查与必记的 5 个要点](#10-速查与必记的-5-个要点)

> UCI IN4MATX 133: User Interface Software — Prof. Travis Linden Reid，2026 年秋季学期，9/25（周四）
> 内容整理自 Lecture 1 的幻灯片（共 72 页）。本讲在课程仓库中没有对应的 demo 文件夹。按概念组织，而不是按来源组织。

> 📅 **课程安排**：PollEverywhere 投票从 9 月 29 日（周二，Lecture 2）开始。
> 出勤计分从 10 月 13 日（周二）开始（add/drop 截止之后）。
> 下周五的 discussion section：Git 和 GitHub 入门（课上不会讲）。

---

## 1. 为什么 UI 实现很重要

幻灯片用一个简化的**产品设计流程**来引入本课：Ideate（构思）→ Refine（打磨）→ Design（设计）→ Implement（实现）→ Test（测试）→ Deploy（部署），并且 Deploy 有一条箭头回到 Ideate（这是一个循环，而不是一条直线）。本课聚焦在 **Implement** 这一步。

用户界面实现：

- 有能力把想法变成现实；
- 往往决定了设计决策和时间线，不论好坏；
- 无法回避：要么你自己来实现，要么你得和负责实现的同事沟通。

**今天的界面实现是什么？** 通常是 **HTML、CSS 和 JavaScript**，以及建立在它们之上的各种框架。幻灯片上的 logo 墙有：Angular、Bootstrap、React JS、Backbone.js、Meteor、Ionic、Node、Vue.js、Ember。其中本课作业会用到 Bootstrap、Angular 和 Ionic（见[第 7 节](#7-课程目标与作业)）。

这就引出了本讲的核心问题：*语言和开发框架有那么多，为什么大多数人都用 Web 工具？* 第 2–5 节的历史会逐步构建答案，答案在[第 6 节](#6-为什么-web-工具成为标准)给出。

> 📝 **练习**：[问题 1：为什么大多数人用 Web 工具？](#91-问题-1为什么-web-工具是界面开发的标准幻灯片-6-和-38)

## 2. Weiser 与计算的三次浪潮

**《The Computer for the 21st Century》**，作者 Mark Weiser，Xerox PARC 的首席科学家，1991 年发表于 *Scientific American*。这篇文章**提出了“Ubiquitous Computing”（普适计算）**这个词。幻灯片称它既是*回顾性的*（reflective，回看计算是如何发展的），也是*推测性的*（speculative，设想接下来会发生什么）。

本讲把计算史划分为**三次浪潮**，每一次由“多少人共用多少台计算机”来定义：

| 浪潮 | 幻灯片中的年代 | 人 : 计算机 | 幻灯片标签 |
|---|---|---|---|
| 1. 大型机计算（Mainframe computing） | 1940s–1960s | 多人共用一台计算机 | "Many to one" |
| 2. 个人计算（Personal computing） | 1970s–1990s | 一人一台计算机 | "One to one" |
| 3. 普适计算（Ubiquitous computing） | 今天 | 一人多台计算机 | "One to many" |

```mermaid
flowchart LR
  w1["1 · 大型机计算 — Many to one"] --> w2["2 · 个人计算 — One to one"] --> w3["3 · 普适计算 — One to many"]
```

> 💡 **核心要点**：many-to-one、one-to-one、one-to-many 这三个比例，是本讲历史部分的一句话总结。

> 🔗 **延伸阅读**：[Weiser, "The Computer for the 21st Century" (ACM DL)](https://dl.acm.org/citation.cfm?id=329126)

## 3. 第一次浪潮：大型机计算

### 3.1 Harvard Mark I 与批处理

**Harvard Mark I** 是幻灯片中的大型机范例：

- **体积大**：宽 55 英尺，高 8 英尺，重 5 吨。
- **价格高**：仅外壳在 1945 年就花了 50,000 美元。
- 曾用于**曼哈顿计划**（Manhattan Project）中计算内爆（implosion）。

大型机通过**批处理（batch processing）**工作：

1. 把程序写在穿孔卡片上。
2. 排队等计算机轮到你。
3. 运行程序，祈祷它能跑通。
4. 如果不行，修改后再等下一次轮到你。

结果：**交互性很差**。许多人共用一台机器——**“many to one”**。

### 3.2 Vannevar Bush 与《As We May Think》

**Vannevar Bush**：MIT 教员；主管国家国防研究委员会（National Defense Research Committee），该委员会领导了曼哈顿计划；战后帮助确立了**美国国家科学基金会（National Science Foundation）**的使命：

- 联邦政府资助大学；
- 大学从事基础科学研究；
- 这些研究有益于经济和国防。

他的文章**《As We May Think》**（*Atlantic Monthly*，1945）在一定程度上规划了战后的科研议程。与 Weiser 的论文不同，它是**推测性的，而非回顾性的**——它设想的是当时还不存在的设备。

### 3.3 Memex（1945 年的推测性设计）

文中设想的设备是 **Memex**，一台桌子大小的机器，用于：

- **跨设备、跨来源地链接信息**——也就是**超文本（hypertext），Web 的基础**；
- 对一手资料进行**笔式批注**。

幻灯片里的动画来自 1995 年（在 SIGIR 上展示），而不是 1945 年——Memex 从未被造出来。

### 3.4 命令行界面（1960s）

- 最初用在**连接到大型机的终端**上；后来被整合进个人计算（Unix 等）。
- 人可以**根据输出来改变执行**。
- 这使得**实时调试**成为可能——相比在穿孔卡片时代排队等候，是很大的进步。

### 3.5 Doug Engelbart 的 NLS（1968）

1968 年对 NLS（“oN-Line System”）的演示展示了：

- **第一个可用的超文本系统**（把 Memex 的想法真正做了出来）；
- **鼠标的发明**；
- 简单图形（更早的系统就有，但这里是在一个完整系统中使用）；
- 还有其他想法：**和弦键盘（chording keyboard）**和**远程协作**。

反响不一：有人认为他是“造假”，也有人觉得无关紧要，因为“终端也能做同样的事”。Engelbart 于 **1997 年获得图灵奖**。

> ⚠️ **易错点**：要分清年代和角色——Bush *设想了*超文本（Memex，1945）；Engelbart *做出了*第一个可用的超文本系统和鼠标（NLS，1968）。

> 🔗 **延伸阅读**：[Bush, "As We May Think" (The Atlantic, 1945)](http://www.theatlantic.com/magazine/print/1945/07/as-we-may-think/3881/) · [Memex 动画（1995，YouTube）](https://www.youtube.com/watch?v=c539cK58ees) · [Engelbart 1968 年演示](http://www.dougengelbart.org/firsts/1968-demo-interactive.html)

## 4. 第二次浪潮：个人计算

个人计算最早由 **Xerox** 推出：

| 系统 | 年份 | 幻灯片中的说明 |
|---|---|---|
| Xerox Alto | 1973 | 鼠标、和弦键盘 |
| Xerox Star | 1981 | 软件在**窗口**中运行；带**图标的桌面**，用来在文件和程序之间切换；“super slow!”（超级慢！） |
| Apple Macintosh | 1984 | （截图：带窗口、文件夹、计算器的 Mac 桌面） |
| Windows 1.0 | 1985 | （截图：平铺窗口——文件列表、Reversi、时钟、Write） |
| Windows 3.0 & 3.1 | 1990 & 1992 | **窗口化成为主流**；加入了纸牌（Solitaire）、扫雷（Minesweeper）和 FreeCell——一个**训练鼠标操作**的小花招 |
| Mosaic 网页浏览器 | 1993 | 最初面向 Unix，后来移植到 Mac 和 Windows；“第一个”图形化网页浏览器 |

Xerox 的机型**在商业上并不成功**：价格依然昂贵，而且应用太少。关于浏览器：Microsoft IE 出现于 1995 年；Apple 直到 2003 年的 Safari 才有自己的浏览器。

此时一个人有了一台计算机——**“one to one”**。

> 🔗 **延伸阅读**：[Xerox Star 演示（1981，YouTube）](https://www.youtube.com/watch?v=ODZBL80JPqw)

## 5. 第三次浪潮：普适计算

Weiser 推测人们会与**三种类型的计算机**交互，并且设备会是**共享所有权**：

| Weiser 的术语 | 尺度 | 类比 | 今天（按幻灯片） |
|---|---|---|---|
| Tabs | 英寸级 | 便利贴（post-it） | 手机和手表 |
| Pads | 英尺级 | 纸 | 平板和笔记本 |
| Boards | 码级 | 白板 | 交互式投影仪？智能电视？增强现实（AR）？ |

这与我们今天使用的设备大体吻合（幻灯片展示了手机、平板、智能电视、笔记本、智能手表和 VR/AR 头显）。最大的偏差是：**设备所有权的观念依然很强**，而不是共享设备。

此时一个人使用多台计算机——**“one to many”**。

## 6. 为什么 Web 工具成为标准

开头那个问题的答案：**普适计算在很大程度上就是 Web 工具成为当前界面开发标准的原因。**

画面是这样的：**一个人，多台设备，通过云同步**（手机、智能音箱、手表、平板、台式机、笔记本都连到同一个云）。Web 技术栈正好与之对应：

| 任务 | Web 工具 |
|---|---|
| 向云端发送数据并接收数据 | **HTTP 请求**——JavaScript 很早就提供了相关工具 |
| 渲染这些数据 | **HTML** |
| 给它们设置样式 | **CSS** |

Web 工具成为标准的原因（幻灯片 42）：

- 几乎每个平台都需要与云系统通信。
- 大多数平台需要一个 Web 浏览器，方便人们访问网站。
- 共用的编程语言和开发环境能带来高效的工作方式。
- 开发者可以**一次编写，部署到多个平台**——并且希望能针对设备定制样式和功能。
- “还有其他原因吗？”——留作课堂讨论。

> 💡 **核心要点**：“针对设备定制样式和功能”就是响应式设计（responsive design）的雏形，A1 以及 Lecture 3–4 会讲到。

> 📝 **练习**：[问题 1：为什么 Web 工具是标准？](#91-问题-1为什么-web-工具是界面开发的标准幻灯片-6-和-38)

## 7. 课程目标与作业

### 7.1 课程目标

学完本课后，你应该能够：

- 用 HTML、CSS 和 JavaScript 构建**对屏幕尺寸和用户能力敏感**的网页；
- 遵循设计最佳实践，用 **TypeScript 框架构建移动应用**；
- 利用**外部 Web API**（数据库、信息源）和**设备资源**（照片、传感器）来降低开发负担并实现新功能；
- 针对给定的设计，**选择合适的设备**来支持，并选择合适的开发框架。

### 7.2 五个作业

| # | 标题 | 技术 | 学习目标 |
|---|---|---|---|
| A1 | Responsive Portfolio | HTML、CSS（概览页上有 Bootstrap logo） | 熟悉 HTML 和 CSS（所有 Web 设计的基础）；应用**响应式（responsive）**设计——适配屏幕尺寸和方向 |
| A2 | Runkeeper Tweet Report | JavaScript 和 TypeScript | 熟练使用 JavaScript；用 JavaScript 库做可视化和交互 |
| A3 | Spotify Browser | Angular | 把界面与数据、交互分离的 Web 框架（**Model-View-Controller**）；一个可交互的 Spotify 曲库浏览器 |
| A4 | Sleep Tracker | Ionic | 利用移动框架中的 UI 组件，遵循良好的移动设计原则；一个记录每日睡眠的应用 |
| A5 | GenAI and Design Systems | 生成式 AI（ZotGPT logo） | 遵循某个设计系统（design system）重新设计网页样式，借助 GenAI 帮助写代码；反思 GenAI 在界面开发中的优势与不足 |

**作业流程**：从 GitHub 仓库 fork 起始代码 → 阅读说明、写代码、搞坏、修好，直到全部跑通 → 把完成的作业和补充材料（截图、视频等）打包成 zip，在 Canvas 上提交 `.zip`。不确定 Git 或 GitHub 怎么用？下周五去 discussion。

### 7.3 这是一门什么样的课

- 这是一门**编程量很大的应用型课程**：大约一半讲实现技术，另一半讲指导设计与开发的理论概念。
- 原则和语言只做高层次的讲解；**API 和包的具体细节需要你自己学**。课程团队乐意帮忙，但并没有用过每个 API 的每个方面。
- 往届学生的评价（幻灯片引用）：你会学到很多（“在上这门课之前，我从没尝试过 Web 开发……现在感觉非常有信心”），但会很难（“对于从未接触过 JavaScript 和应用开发的人来说，作业有些挑战”）。
- 期望很高，但课程团队关心学生也愿意倾听——有情况就告诉他们。要“全情投入”；如果你还没准备好投入，请现在就退课，把名额让给别人。

## 8. 课程团队与政策

### 8.1 课程团队

| 角色 | 姓名 | 幻灯片中的介绍 |
|---|---|---|
| Professor | Travis Reid (he/him) | Louisiana State 计算机科学 B.S.；曾在 Blizzard、EA 以及创业公司/独立工作室担任游戏工程师；2024 年起在 UCI 任教并制作独立游戏；平时教 GDIM 31–33，第一次教 INF 133。12 岁时在 Neopets 上开始写代码，通过复制和修改页面模板学会了 HTML 和 CSS（还有 MySpace）。 |
| TA | Ziqi Yang (she/her) | Informatics 博士三年级；信息科学 M.S.（UMich），ECE B.S.（上海交通大学）；研究兴趣为 HCI、女性健康、健康信息学；多次担任本课 TA。 |
| Readers | Andy Nguyen (he/him) & Evy Sanchez (she/her) | Reader = 协助批改作业的本科生。Andy：Informatics 四年级，HCI 方向，对 UI/UX 和无障碍（accessibility）感兴趣。 |

> 🔗 **延伸阅读**：[Neopets 宠物页面模板（幻灯片 47 引用）](https://sunnyneo.com/petpages.php)

### 8.2 成绩构成

| 组成部分 | 权重 |
|---|---|
| 作业（5 × 17%） | 85% |
| 课堂参与（课堂调查） | 15% |
| 额外加分：Slack 参与 | 最多 5% |
| 考试 | **无** |

Slack 加分在学期末综合评估：你必须**回答**问题，而不只是提问，并且对课堂氛围有积极贡献。

### 8.3 参与和出勤

- 课堂调查问题、think-share 和讨论，通过 **PollEverywhere（PollEV）**完成。投票从 9 月 29 日（周二）开始；出勤计分从 10 月 13 日（周二）开始（add/drop 之后）。
- 课堂为线下授课；必须**同步、线下作答**才能获得分数。
- 按**是否完成**打分，**不看对错**。
- 你可以漏答 **2 道题（约 1 节课）**而不扣分——这一节缺席会自动被视为已豁免。除非是在 add/drop 截止日期之后，**并且**缺课超过一节，否则不要申请豁免某节课。
- 在 Slack 上回答同学的问题也能获得参与分。

### 8.4 迟交（“Flexibility”）

- 在合理范围内，只要你**至少在截止时间前 48 小时**给课程团队发邮件，就允许**无惩罚**迟交。
- 通常延期 1–2 天；遇到特殊的重大变故最多 1 周。
- **最后一个作业不允许迟交。**
- 请把延期当作最后手段。

> ⚠️ **易错点**：延期申请必须在截止时间*之前*（提前 48 小时）提出——错过之后再申请不算数，而且 A5 完全不能延期。

### 8.5 沟通与 office hours

| 渠道 | 用途 |
|---|---|
| Slack（公开频道） | 作业答疑与求助；信息会先在 Slack 上发布。课程团队**不会回复私信**。 |
| Email | 个人事务（缺席、顾虑）：Prof. Reid `lindenr@uci.edu`，TA Ziqi `ziqiy30@uci.edu` |
| Canvas | 作业提交；公告；Discussion & Office Hours Updates 页面 |
| 重新评分表（Regrade form） | 申请重新评分（链接在 syllabus 中） |

- **Office hours**：Prof. Reid，周四 2:30–3:30 PM，DBH 5221。TA Ziqi：待定（见 Canvas 的 Discussion & Office Hours Updates 页面）。
- **Discussion sections** 是选修的：对课上主题做更深入的讲解，有时是开放的 office hours。下周五的内容是 Git 和 GitHub，课上不会讲。

## 9. 课堂问题与演示（附解答）

### 9.1 问题 1：为什么 Web 工具是界面开发的标准？（幻灯片 6 和 38）

幻灯片 6：*“There are lot of languages and development frameworks. Why do most people use web tools?”*（语言和开发框架有那么多，为什么大多数人都用 Web 工具？）——在幻灯片 38 以 Think & Share 的形式再次提出：*“Why are web tools now the standard for interface development?”*（开放式讨论，没有选项）。

> ✍️ **先自己试试。**

**答案**（幻灯片自己给出的，p39–42）：**普适计算**。现在一个人使用多台通过云同步的设备。每个平台都需要和云通信（HTTP 请求，JavaScript 很早就提供了相关工具），而且大多数平台都有浏览器；HTML 渲染数据，CSS 给数据设置样式。共用的语言和环境让开发者可以一次编写、部署到多个平台，并针对每种设备做定制。回到[第 6 节](#6-为什么-web-工具成为标准)。

## 10. 速查与必记的 5 个要点

**时间线**

| 年份 | 事件 |
|---|---|
| 1945 | Harvard Mark I（曼哈顿计划）；Bush 的《As We May Think》/ Memex |
| 1960s | 终端上的命令行界面 |
| 1968 | Engelbart 的 NLS：第一个可用的超文本、鼠标 |
| 1973 | Xerox Alto |
| 1981 | Xerox Star：窗口、桌面图标 |
| 1984 | Apple Macintosh |
| 1985 | Windows 1.0 |
| 1990/92 | Windows 3.0 / 3.1 |
| 1991 | Weiser 提出“Ubiquitous Computing” |
| 1993 | Mosaic，第一个图形化网页浏览器 |
| 1995 | Internet Explorer |
| 1997 | Engelbart 获图灵奖 |
| 2003 | Safari |

**课程数字**：作业 85%（5 × 17%）· 课堂参与 15% · Slack 加分 5% · 无考试 · 可免费漏 1 节课（2 道题）· 延期：至少提前 48 小时发邮件，通常 1–2 天，最多 1 周，A5 不可延期。

**必记的 5 点**

1. 三次浪潮 = 大型机（“many to one”）→ 个人计算（“one to one”）→ 普适计算（“one to many”）。
2. Weiser（1991）提出普适计算：tabs（手机/手表）、pads（平板/笔记本）、boards（电视/投影仪/AR）；他预测错了共享所有权这一点。
3. Bush 在 Memex（1945）中设想了超文本；Engelbart 的 NLS 把它做了出来，并引入了鼠标（1968）。
4. Web 工具成为标准，很大程度上*正是因为*普适计算：用 HTTP + JavaScript 获取云端数据，HTML 渲染，CSS 设置样式，一次编写，到处部署。
5. 从 10 月 13 日起，课堂参与需要线下、实时的投票作答；迟交需要在截止前 48 小时发邮件，且最后一个作业不能迟交。

> ➡️ **下一讲**：[Lecture 2 笔记](?kind=course_notes&course=IN4MATX-133&lang=zh-CN&note=IN4MATX133_Lec02_Notes_zh-CN.md)
