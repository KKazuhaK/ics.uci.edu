# Informatics 43 — 第六周课程笔记

> 涵盖 **Lecture 11 与 Lecture 12**：*"如何让软件真正满足用户的需求？（第 1、2 部分）"*

## 目录

1. [从设计走向用户 — Lecture 11 的起点](#1-从设计走向用户--lecture-11-的起点)
2. [为什么可用性重要](#2-为什么可用性重要)
3. [以用户为中心设计的商业理由](#3-以用户为中心设计的商业理由)
4. [可用性失败案例 — 一组教训陈列](#4-可用性失败案例--一组教训陈列)
5. [三句值得背下来的名言](#5-三句值得背下来的名言)
6. [可用性工程为什么这么难](#6-可用性工程为什么这么难)
7. [UX 设计师这一职位的兴起](#7-ux-设计师这一职位的兴起)
8. [八种以用户为中心的设计方法（Lecture 12）](#8-八种以用户为中心的设计方法lecture-12)
9. [方法 1：访谈与观察](#9-方法-1访谈与观察)
10. [方法 2：人物画像（Personas）](#10-方法-2人物画像personas)
11. [方法 3：场景（Scenarios）](#11-方法-3场景scenarios)
12. [方法 4：故事板（Storyboards）](#12-方法-4故事板storyboards)
13. [方法 5：线框图与原型（Wireframes & Mockups）](#13-方法-5线框图与原型wireframes--mockups)
14. [方法 6：设计准则（Design Guidelines）](#14-方法-6设计准则design-guidelines)
15. [方法 7：启发式评估（Nielsen）](#15-方法-7启发式评估nielsen)
16. [方法 8：用户测试](#16-方法-8用户测试)
17. [Quiz 6 复习要点](#17-quiz-6-复习要点)
18. [总结与记忆框架](#18-总结与记忆框架)

---

## 1. 从设计走向用户 — Lecture 11 的起点

第五周以**设计原则**收尾 —— 高内聚、低耦合、信息隐藏 —— 并提出更宏观的论断：*软件工程是构建一组相关模型来表示待建系统的过程*。这些模型刻画系统的**结构、行为、交互和非功能属性**。

第六周补上缺失的一块：一个系统可以被切分得无懈可击、解耦得漂亮、架构上无瑕疵，**却仍然不可用**。所以本周的问题从"系统是怎么构造的？"再退一步，变成：

$$\boxed{\textbf{How do we make software that meets the } \textit{user's} \textbf{ needs?}}$$

至此，我们正在搭建的演进顺序是：

$$\boxed{\textbf{Requirements} \;\longrightarrow\; \textbf{Architecture} \;\longrightarrow\; \textbf{Design (in detail)} \;\longrightarrow\; \textbf{User-Oriented Methods} \;\longrightarrow\; \textbf{Code}}$$

Lecture 11 解释**为什么**面向用户（可用性）很重要；Lecture 12 走过**八种**以用户为中心的设计方法，本季度后续课程都会建立在它们之上。

---

## 2. 为什么可用性重要

讲座一开篇有意混搭了一组图 —— MRI 机器、电厂控制墙、客机驾驶舱 —— 想说明一件事：可用性不是叠加在*重要*软件之上的"锦上添花"，而是**嵌入在使用该软件的后果之中**。驾驶舱面板上一个被读错的开关、MRI 控制台上一个看不明白的按钮，都不是"UI 小问题"，而是安全事件。

Obama '08 竞选的例子在低得多的语境下重申了同一个论点。竞选团队 A/B 测试了两个版本的主页，它们在**两个**维度上不同 —— 主图（Obama 单人肖像 vs 一家人合影）和 CTA 按钮（`SIGN UP` vs `LEARN MORE`）。家庭照 + `LEARN MORE` 那个版本把注册转化**提升了大约 40%**，竞选方后来估计这相当于多带来**约 6000 万美元**的捐款。生死攸关的系统里成立的逻辑，在营销里同样成立：**界面的视觉和措辞共同改变了用户行为**。

![两个 A/B 测试中的 Obama '08 主页变体：左版在 Obama 单人肖像下放红色 "SIGN UP" 按钮；右版在一张家庭合影下放 "LEARN MORE" 按钮。同一个竞选、同样的邮箱+邮编表单 —— 唯一的差别是主图与 CTA 措辞，而这两处合起来显著改变了转化率（≈ 多 40% 的注册、≈ 多 6000 万美元的捐款）。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/obama-08-ab-test-signup-vs-learnmore.png)

> 真正的要点不是"可用性是为了把按钮做好看"，而是**用户的行为本身就是系统的一部分**。不考虑这部分行为去做设计，等于只设计了系统的一半。

---

## 3. 以用户为中心设计的商业理由

讲座列出了把以用户为中心设计（UCD）做对的五项回报：

| 回报 | 落到实处的含义 |
|------|------|
| **简单（Simple）** | UCD 的方法（访谈、人物画像、原型、启发式检查）并不玄乎 —— 大多是纸笔活 |
| **便宜（Inexpensive）** | 比起在产品发布后再重做 UI，这些方法的成本要低得多 |
| **更高的销量** | 可用的产品把更多首次访客转化为付费用户 |
| **更高的满意度** | 用户能顺利完成任务，不被挫败感打断 |
| **更高的效率** | 用户更快完成任务，犯的错误更少 |

Lecture 11 末尾的总结幻灯片把这张清单压缩成四个要点 —— **销量上升、性能提升、流量增加、挫败感下降**，配上那句口号：*"It's all about the user."*

幻灯片还埋了一个更微妙的点：

> UCD 的收益会随时间**从转化（首次客户）转向忠诚度（回头客）**。早期，好 UX 帮你赢得用户；后期，好 UX 帮你*留住*用户。

但即便如此，**这些方法常常不被使用**。Lecture 11 的剩余部分就在展示不用它们时会发生什么。

---

## 4. 可用性失败案例 — 一组教训陈列

Lecture 11 列出了一系列真实世界中的可用性失败。它们都很搞笑，但每一个都对应着 Lecture 12 中的一条 Nielsen 启发法。

| 失败案例 | 哪里出了问题 | 违反的启发法 |
|------|------|------|
| 打印机消息：*"There is no help available for this"* | 帮助系统承诺帮助，转头又拒绝给出 | 帮助与文档 |
| HP 打印机：*"PC LOAD LETTER"* | 晦涩错误信息 —— 工程师的语言，不是用户的 | 系统与现实世界匹配 |
| 警告对话框：*"继续 Delete 操作将抹掉硬盘内容。[Proceed] [Delete]"* | 两个按钮听起来都同样危险 | 错误预防；用户控制 |
| ATM 屏幕上 **"Yes"/"No"** 标签和实体按钮位置错位 | 触摸标签与实体按钮的位置对不上 | 一致性；与现实世界匹配 |
| Marriott 酒店系统 —— 1980 年代绿底黑字的大型机界面 | 一家市值数十亿美元的公司还在跑无可用性的遗留系统 | 多重 —— 极简设计、识别优于回忆 |
| UI Generator 里出现 `cr_int_sprd`、`tax_on_dr_int` 这样的字段名 | 内部缩写直接漏到面向用户的 UI 上 | 系统与现实世界匹配 |
| Office 97 宏警告 vs. Office 2010 的细横条 | 旧版本用一大段文字打断用户；新版本用一条小横幅做渐进披露 | 极简设计 |
| **夏威夷误发导弹警报（2018）** | 操作员从一个标签设计糟糕的列表里挑错了项（`PACOM (CDW) - STATE ONLY` vs `DRILL-PACOM (DEMO) STATE ONLY`），结果真警报被发了出去 | 错误预防；识别优于回忆；状态可见性 |
| 两个小便池被装进一个角落，距离近到使用者会面对面 | 这是物理 UX，不是软件 —— 但原理完全一样 | 设计师没考虑真实使用场景 |

其中几个值得"看一下"而不仅是"读一下" —— 这些搞笑的图把启发法违规演绎得比任何文字都清楚。

![Windows XP "Warning" 对话框：红色 X 图标，消息为 "Proceeding with the operation 'Delete' will erase the contents of your hard drive. What do you wish to do?" —— 然后是**两个听起来都一样危险的按钮**：`Proceed` 和 `Delete`。用户根本看不出哪个才是安全选项。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-proceed-or-delete-dialog.png)

![一台 ATM 的实拍：屏幕提示 "WANT RECEIPT? YES OR NO"，但屏幕外框上的实体 Yes/No 按钮位置和这两个标签对不上 —— 用户必须靠猜哪个是 "Yes"。一致性 / 与现实世界匹配的双重失败。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-atm-yes-no-mismatch.jpg)

![Office 97 vs. Office 2010 的宏警告。Office 97（上）用一个文字塞满的警告对话框打断用户：三个让人分不清的按钮（`Disable Macros` / `Enable Macros` / `Do Not Open`）外加一个复选框。Office 2010（下）把整套东西换成一条窄窄的黄色 Security Warning 横幅 + 单一的 `Enable Content` 按钮 —— 极简 + 渐进披露。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-office-97-vs-2010-macros.png)

![夏威夷误发导弹警报（2018）的下拉菜单。"State EOC" 子菜单平铺列出了几条几乎一模一样的项：`1. TEST Message`、`DRILL-PACOM (DEMO) STATE ONLY`、`False Alarm BMD (CEM) - STATE ONLY`、`Monthly Test (RMT) - STATE ONLY`、`PACOM (CDW) - STATE ONLY`。操作员误选了真警报 —— 识别 / 错误预防的现实级失败。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/fail-hawaii-missile-alert-dropdown.jpg)

接下来是对比页：

| "典型 Apple 产品" | "Google 产品" | "你公司的应用" |
|------|------|------|
| 一个词：**Touch** | 一个输入框 + 一个按钮：**Find** | 四十个字段、十二个按钮、五颜六色的混乱（`SSN`、`FT/PT`、`TQP STAT`、`CAT CD`……） |

![三个并排的方框，分别标注 "Typical Apple product…"、"A Google product…"、"Your company's app…"。Apple 那栏只有一个词 "TOUCH"；Google 那栏只有一个搜索框配 "FIND" 按钮；公司那栏却是一张密密麻麻的表单，挤满 `SSN`、`FT/PT`、`TQP STAT`、`CAT CD` 等晦涩缩写，再加一整排 `OKAY`、`APPLY`、`SAVE`、`UNDO`、`HELP`、`DELETE`、`EDIT`、`SELECT`、`BROWSE`、`ERRORS` 的按钮。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/first-impressions-apple-google-vs-app.png)

要点是：**第一印象很重要**。同一个任务（让用户开始使用产品），在 Apple 上是一个按钮，在 Google 上是一个搜索框，在典型的企业应用上却是一墙看不懂的缩写。用户在几秒钟内就会决定这个产品值不值得学。

---

## 5. 三句值得背下来的名言

讲座引用了三句对"好 UI"的定义，它们捕捉到了整个第六周的精神：

> **"A user interface is well-designed when the program behaves exactly how the user thought it would."**
> （界面设计得好，是当程序的行为完全符合用户的预期。）
> — Joel on Software

> **"A GUI should provide GUIdance!"**
> （GUI 应当提供"指引（GUIdance）"。）
> — hallofshame.gp.co.at

> **"Focus on the user, and all else will follow."**
> （专注于用户，其他一切自然会跟来。）
> — Google

第一句是可操作的定义：可用性 = **用户心智模型**与**程序行为**之间的匹配。第二句是设计指令：界面应该主动*引导*用户完成任务。第三句是战略原则：把用户摆在第一位，其他指标（销售、效率、留存）会自然跟上。

---

## 6. 可用性工程为什么这么难

如果 UCD 的回报这么明显、方法又简单又便宜，为什么好用的产品仍然稀少？Lecture 11 给出两条理由：

### 6.1 可用性涉及 CS 之外的多门学科

| 学科 | 它贡献的部分 |
|------|------|
| **心理学** | 人如何感知、注意、记忆 |
| **认知科学** | 人如何形成心智模型、做决策 |
| **美学** | 什么样的视觉感觉平衡、整洁、可信 |
| **艺术** | 构图、色彩、字体排版 |

传统的 CS 课程基本不训练这些。软件工程师被训练得擅长推理正确性和性能，但不擅长推理色彩对比或工作记忆容量。

### 6.2 受众错位的问题

$$\boxed{\textbf{Software engineers are generally } \textit{not} \textbf{ the audience of the software they develop.}}$$

工程师对"什么是显然的"那种直觉，是对工程师校准过的，不是对真实用户 —— 会计、医生、司机、小学生、退休老人。要为一个并不像你的用户做出好设计，必须用*刻意的方法*来跨越这道鸿沟。Lecture 12 的八种方法正是干这个的。

---

## 7. UX 设计师这一职位的兴起

正因为可用性涉及那么多 CS 之外的领域，一个独立的角色就被分化出来了：

| 视觉 / 工艺类技能 | 流程 / 研究类技能 |
|------|------|
| 绘画 | 编程 |
| 色彩理论 | 信息架构 |
| 设计基础 | 研究方法 |
| 字体排版 | 人类行为 |
| 逻辑 | 用户测试 |
| 艺术 | 创意发想（Ideation） |
| 历史 | 原型制作 |
| 人类学 | 沟通 |
| 数学 | 协作 |

> UX 设计师处在艺术、社会科学、工程的交叉口。软件工程师不需要*成为* UX 设计师，但需要**和他们合作**，并且在小项目里自己运用基本的 UCD 方法。

---

## 8. 八种以用户为中心的设计方法（Lecture 12）

Lecture 12 引入**八种**以用户为中心的设计方法，本单元后续课程会一种一种讲。这张清单需要背下来 —— 复习指南明确写了"the 8 user-centered design methods"。

| # | 方法 | 一句话作用 |
|---|------|------|
| 1 | **对终端用户的访谈与观察** | 弄清楚用户*实际上*在做什么 |
| 2 | **人物画像（Personas）** | 把用户研究压缩成令人难忘的原型角色 |
| 3 | **场景（Scenarios）** | 用叙事描述某个 persona 在使用系统 |
| 4 | **故事板（Storyboards）** | 把场景画成连环画的形式 |
| 5 | **线框图与原型** | 真实 UI 的低保真草图 |
| 6 | **设计准则（Design guidelines）** | 用于视觉一致性的可复用规则与组件 |
| 7 | **启发式评估** | 专家对照可用性原则清单做评审 |
| 8 | **用户测试** | 真实用户、真实任务、被观察的表现 |

这些方法大致沿着**理解用户 → 描述用户 → 画出系统 → 评估设计**的路径推进。它们并非严格顺序 —— 大多数项目会在多个方法之间循环往返，随设计成熟而多次回访。

---

## 9. 方法 1：访谈与观察

第一种方法也是最基础的：**去找真实用户、跟他们说话、看他们做事**。讲座里的图把这点说得很直白 —— 驾驶舱里的飞行员、塔台里的空管员、多屏工作台前的分析师、运营中心里的调度员。每种环境都有自己的约束（光线、噪声、时间压力、多任务），坐在办公桌前是猜不出来的。

| 活动 | 它产出什么 |
|------|------|
| **访谈** | 直接的口头数据 —— 用户说他们在做什么、想要什么、被什么困扰 |
| **观察** | 间接的行为数据 —— 用户*实际上*在做什么，包括他们在访谈里不会提到的东西 |

> 两者互补。访谈捕捉用户的意图和挫败感；观察捕捉到用户已经习惯到忘记自己有的那些变通办法和习惯。

---

## 10. 方法 2：人物画像（Personas）

**Persona** 是一个虚构但具体的用户原型 —— 由访谈/观察数据构造而来 —— 设计团队在整个项目里都可以引用它（"Blake 会这么做吗？"）。

### 10.1 一份 persona 包含什么

MyFlix 例子（Blake、Carrie）和 OpenMoko 例子（John "The Greenhorn"、Emily "The Casual User"、Akiko "The Texter"、Stephan "The Business User"、Roberto "The Power User"、Ricky "The Hacker"）都共享一致的结构：

![Blake —— MyFlix Content Consumer 人物画像卡。Blake 戴眼镜、穿印花 T 恤的照片；左侧人口统计栏（27 岁、男、单身、无子女、软件工程学士、程序员）。右栏：一句话引言（"我太兴奋了，本地新开了一家独立电影院，我得发推告诉朋友们"）、简介（"Blake 是科幻迷，也喜欢独立和先锋的电影与电视剧……"）、目标（保持与同好的联系、发现新内容、分享观点）、任务（和朋友一起看小众剧、在社交媒体上分享观点、在一家软件公司工作）、技术能力（"对常见 app 的工作方式很熟悉，使用多种数码设备"）、环境（"通勤时用 iPhone，在家用电视看"）。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/persona-blake-myflix-consumer.jpg)

| 部分 | 内容 |
|------|------|
| **照片和姓名** | 让 persona 像一个人，而不是表格里的一行 |
| **人口统计学** | 年龄、性别、婚姻状况、子女、学历、职业 |
| **引言（Quote）** | 一句捕捉其语气的第一人称话 |
| **简介 / 个人档案** | 一段描述他/她是谁、关心什么 |
| **目标（Goals）** | 他/她想完成的事（在产品里以及在生活里） |
| **任务（Tasks）** | 他/她具体在做的事 |
| **技术能力** | 对相关技术的熟练程度 |
| **环境** | 在哪里、什么时候使用产品 |

### 10.2 为什么 persona 有效

一份"用户需求清单"是抽象的；一份 persona 是具体的。当设计师问*"Blake（27 岁、程序员、科幻迷、和朋友一起看电视）真的会点这个按钮吗？"*时，答案比*"用户会点这个按钮吗？"*要锐利得多。Persona 让用户**具体到可以与之争论**。

### 10.3 Persona 是成组出现的

真实系统有多种用户类型。比如 MyFlix 项目区分：

- **Blake** —— 内容消费者（顾客）
- **Carrie** —— 一家电影制片厂的应用管理员（后台用户）

一份完整的 persona 集合涵盖每一种有意义不同的用户角色。OpenMoko 的集合更进一步，用六个 persona 覆盖从"完全非技术的（Greenhorn）"到"深度技术的（Hacker）"的全频谱，这样任何设计决策都不会意外只优化某一片受众。

---

## 11. 方法 3：场景（Scenarios）

**Scenario**（场景）是一段简短的*叙事*，描述某个具体 persona 在用系统达成某个具体目标。它用平实的语言、第三人称、现在时讲故事的语气来写。

### 11.1 两个 MyFlix 场景示例

**场景 1：加入 MyFlix**

> *Blake 在网上搜索本地是否有影院在放一部新上映的独立电影时，发现这部电影的简介页同时也在 MyFlix 上有发布。他兴奋于可以在自家公寓舒服地看这部片以及类似的电影，于是注册账号并开始按月付费。他通过电视上的浏览器登录账号，成功流式观看影片。*

**场景 2：发现内容**

> *Blake 对电影和电视剧的口味相当具体。在公司他会在 MyFlix 网站上浏览各种分类，并阅读自己感兴趣分类下的影评。读到几条匹配他偏好的简介与推荐后，他把这些片子加进越来越长的待看列表里，方便以后快速挑一部来看。*

### 11.2 Scenario 起到的作用

| 功能 | 怎样做到 |
|------|------|
| **把 persona 接入系统** | persona 不再是静态的档案，而开始*做事* |
| **浮现需求** | "账号注册"、"待看列表"、"电视浏览器支持" —— 功能从叙事中自然冒出来 |
| **保持领域中性** | 此时还没有按钮、屏幕、控件 —— 只有用户目标和结果 |

> Scenario 就是 **persona + 目标 + 上下文，写成故事**。它是从"用户是谁"（persona）到"我们需要构建什么"（原型、需求）的桥梁。每个 persona 通常有多个 scenario，每个对应一个主要目标。

---

## 12. 方法 4：故事板（Storyboards）

**Storyboard** 是 scenario 的*视觉版本* —— 一连串连环画式的格子，每一格展示用户体验中的一个时刻，常常配手写说明文字、对话气泡和心理气泡。

### 12.1 一个 storyboard 格子通常包含什么

| 元素 | 作用 |
|------|------|
| **场景画面** | 用户、设备、环境 |
| **对话气泡** | 角色们说了什么 |
| **心理气泡** | 用户在*想*什么（用来浮现困惑的关键） |
| **说明文字** | 把这一格连接到下一格的旁白 |

### 12.2 B&Q 购物示例

讲座展示了一个八格的 storyboard：Sarah 在 B&Q 五金店使用一个画笔造型的结账系统 —— 她进店刷卡，设备喊出她的名字，她扫描一桶涂料，得到一条"你可能也会喜欢……"的推荐，去找画笔，向店员求助，得到真人帮助，然后离店 —— *购物加上帮助这么多事，这趟逛得真成功！* 每一格在叙事里加上一拍。

![一个手绘的八格漫画 storyboard，描述 Sarah 在 B&Q 五金店使用画笔造型的结账系统。第 1 格：进店、刷会员卡。第 2 格：设备喊出她的名字。第 3 格：扫涂料，设备推荐画笔。第 4 格：她去找画笔。第 5 格：她在迷茫，心理气泡写着 "我确实需要一支画笔，到底在哪里能找到呢……"。第 6 格：她向店员问 "Help?"。第 7 格：店员在帮她。第 8 格：她离店，旁白写着 "购物加上帮助这么多事，这趟逛得真成功！"。第 5 格的心理气泡是这个 storyboard 的核心 —— 它把用户体验中的一个摩擦时刻浮现了出来。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/storyboard-bq-paintbrush-sarah.jpg)

### 12.3 为什么 storyboard 比纯文本更强

Scenario 用语言捕捉目标，storyboard 则用图画捕捉**情绪、环境和时序**。第三格里一个挫败的心理气泡（*"我确实需要一支画笔，到底在哪里能找到呢……"*）传达可用性问题的力度，比一段文字描述要鲜活得多。Storyboard 也强迫设计师去想*物理*情境 —— 用户站在哪里、手里拿着什么、周围有谁。

> Storyboard 故意要画得粗糙、像手稿。把它打磨得很精致是浪费 —— 它的目的是激发关于*体验*的讨论，而不是好看。

---

## 13. 方法 5：线框图与原型（Wireframes & Mockups）

**线框图（wireframe）或原型（mockup）**是产品某个真实屏幕的低保真草图 —— 包括布局、控件、标签、导航 —— 但不承诺最终的颜色、字体或图片。

### 13.1 保真度光谱

| 保真度 | 例子 | 适用阶段 |
|------|------|------|
| **手绘草稿** | 铅笔加纸 | 最早期的头脑风暴，一次性的 |
| **低保真线框** | Balsamiq Mockups（故意做成手绘风） | 早期评审，想讨论*结构*而不是颜色 |
| **高保真原型** | Figma、Sketch、Photoshop | 后期阶段，接近最终视觉设计 |
| **可交互原型** | 可点击的 Figma、InVision | 准备做用户测试时 |

### 13.2 MyFlix Zombie Romance 线框图

讲座的例子是 MyFlix 上 "Zombie Romance" 这部电影的详情页：

- 顶部一个浏览器外壳框（后退 / 前进 / 停止 / 主页 / 地址栏）
- 站点头部：左边 `MyFlix | Categories | …`，中间一个搜索框，右边 `Signup - Login`
- 左侧导航：`Browse Movies`、`Read Reviews`、`Sign Up`
- 面包屑：`Home > Horror > New Releases > Zombie Romance`
- 电影标题、上映年份、剧情简介、`Cast and Crew` 链接
- 一个 `Sign Up to Watch` 的 CTA 按钮
- 一行 "Similar Movies On MyFlix"，里面三个占位缩略图（画成画了 X 的方块）

![MyFlix "Zombie Romance" 电影详情页的 Balsamiq 风格线框图。顶部：浏览器外壳，包含后退/前进/停止/主页按钮和地址栏 `myflix.com/zombie-romance`。站点头部：左边 `MyFlix | Categories | …`，中间搜索框，右边 `Signup - Login`。左侧栏：`Browse Movies`、`Read Reviews`、`Sign Up`。主栏：面包屑 `Home > Horror > New Releases > Zombie Romance`、电影标题 "Zombie Romance"、年份 "Released in 2014"、剧情简介、`Cast and Crew` 链接、`Sign Up to Watch` 按钮、一行 "Similar Movies On MyFlix" 含三个占位缩略图（画了 X 的方块）。没有真实图片、没有最终字体、没有品牌色 —— 这是有意为之。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/wireframe-myflix-zombie-romance.png)

注意它*没有*的东西：没有真实图片（只有占位）、没有最终字体、没有品牌色。线框图就是为了浮现关于**布局、标签、信息层级**的决策，而不是视觉打磨。

### 13.3 Balsamiq 风格的"草稿感"在传达什么

像 Balsamiq 这样的工具故意把线框图渲染成手绘的样子，理由是社会性的：它在传达一个信号 —— *"这是粗稿，请评论结构，不要评论打磨。"* 如果太早把像素级精致的原型给到一位关键人，他会去挑剔字体选择，而不是信息架构。

---

## 14. 方法 6：设计准则（Design Guidelines）

**设计准则**是可复用的规则和预制组件，用来在一个组织的多个产品之间保证一致性。没有它，每支团队都会自己发明按钮、颜色和表单形态 —— 结果就是混乱的用户体验。

### 14.1 "Before" —— 没有准则会发生什么

讲座的 "Before" 幻灯片汇集了大约两打来自美国政府网站的按钮，它们大致都在做同一件事 —— 提交表单、登录、搜索：

`SUBMIT`、`JOIN US`、`Log in`、`Register`、`Search`、`GET THE LATEST`、`Apply Now`、`Get started`、`Sign In`、`Subscribe`、`Create an account`、`LOG IN`、`Where's My Refund?`、`Q Search`、`Apply`、`Search`、`Reset`、`Learn more`、`Login`、`TRY OUR VISA WIZARD`、`Get Weather`、`All Outbreaks`、`Search`、`go`……

![一面 "Before" 墙，约两打来自美国政府网站的真实按钮，都大致在做同一件事：`SUBMIT`、`JOIN US`、`Log in`、`Register`、`Search`、`GET THE LATEST`、`Apply Now`、`Get started`、`Sign In`、`Subscribe`、`Create an account`、`LOG IN`、`Where's My Refund?`、`Q Search`、`Apply`、`Search`、`Reset`、`Learn more`、`Login`、`TRY OUR VISA WIZARD`、`Get Weather`、`All Outbreaks`、`Search`、`go`…… 每个按钮颜色、形状、大小、动词都不一样 —— 用户在一个站点学到的东西，到下一个站点就要从头再学。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/design-guidelines-before-button-chaos.png)

每个按钮都用不同的颜色、形状、大小、动词。用户在一个站点学到的东西，在下一个站点就要从头再学。

### 14.2 "After" —— 美国 Web Design Standards

一份典型的设计准则文档通常包含：

| 部分 | 内容 |
|------|------|
| **视觉风格** | 主色和辅色调色板（如 `#0071bc` 主蓝色、`#205493` 较深、`#112e51` 最深、`#212121` 基础色）、字体搭配、间距尺度 |
| **字体排版** | 认可的字体、字体搭配规则、链接样式 |
| **组件** | 按钮、表单控件、表格、提示框、折叠面板 —— 每一个都附示例 |
| **线框图 / 模式** | 可复用的布局（例如密码重置表单：先把要求摆出来、用户输入时实时显示进度、允许查看所输入的字符、不满足要求前禁用提交） |
| **代码** | 可直接复制粘贴的 HTML/CSS，开发者不必再重复实现组件 |

> 设计准则就是**把"做对的方式"打包成组件**。它让设计师不必反复决定，让开发者不必反复实现，让用户不必反复学习。

### 14.3 准则为什么有效

| 没有准则时 | 有准则时 |
|------|------|
| 每支团队自创按钮 | 按钮从共享库里引入 |
| 各个站点之间调色板飘移 | 一个调色板、一个品牌 |
| 表单形态千奇百怪 | 密码重置、登录、搜索行为一致 |
| 新设计师靠模仿现有作品入门 | 新设计师读一遍准则就能产出符合品牌的工作 |

---

## 15. 方法 7：启发式评估（Nielsen）

**启发式评估** = 用研究支持的原则去评估和改进系统的可用性，*不需要*真实用户在场。它也叫"折扣可用性测试（discount usability testing）"，因为成本远低于完整的用户研究。

### 15.1 流程

| 步骤 | 发生什么 |
|------|------|
| **挑任务** | 选用户会做的代表性事情（例如"注册并看一部电影"） |
| **有人扮演用户** | 一位评估者走过每一个任务 |
| **评估者聚焦于一个角度** | 每个评估者一次只用一条启发法的视角看系统 |
| **有人记笔记** | 发现被记录下来，供之后排优先级 |

### 15.2 Nielsen 十大启发法 —— Quiz 6 的核心

复习指南明确说："Know and understand all the Nielsen heuristics." 下面是这十条，附讲座里给出的例子。

#### 15.2.1 系统状态可见（Visibility of system status）

系统应当通过**及时合理的反馈**始终告诉用户**正在发生什么**。

> 例：Picnik（图片编辑器）在加载时显示一条绿色进度条，配上俏皮的提示语 *"Fluffing clouds…"*。或者一条行内确认信息：*"Your password has been emailed."*。用户永远不会困惑系统是否注意到了自己的点击。

#### 15.2.2 系统与现实世界匹配（Match between system and the real world）

系统应当**说用户的语言**，遵循现实世界的约定，而不是内部行话。

> 例：macOS Finder 用**文件夹**图标表示文件夹，用**文档**图标表示文档，用**相机**图标表示相机应用。iTunes 用 **Library / Music / Movies / TV Shows / Podcasts / Audiobooks / Radio** —— 都是听音乐的人本来就懂的词。对比 Lecture 11 失败案例里的 `cr_int_sprd`。

#### 15.2.3 用户控制与自由（User control and freedom）

用户**会犯错**，需要一个清晰标记的"紧急出口" —— 撤销、重做、取消、后退、退出。

> 例：每个浏览器都有**后退键**；每个编辑器都有 **Ctrl+Z**；每个多步表单都在主操作旁边放一个 **Cancel** 按钮。Photoshop 的编辑工具栏把撤销 / 重做和剪切 / 复制 / 粘贴排在一起。

#### 15.2.4 一致性与标准（Consistency and standards）

用户**不应当被迫去琢磨**不同的词、情境、操作是不是同一个意思。要遵循**平台约定**。

> 例：Microsoft Office 在 Word、Excel、PowerPoint 里使用同一套 ribbon、同一套图标、同一套快捷键。移动端有标准图标（电话、搜索、爱心、播放、邮件、设置），在不同 app 里含义都一样。Google Translate 把语言切换器放在每次都同样的位置。

#### 15.2.5 错误预防（Error prevention）

比"好的错误信息"更好的是**让错误根本无法发生**的精心设计。

> 例：表单的 `Update` 按钮在用户输入内容之前一直保持*禁用*（灰掉），这样根本无法提交空内容。PowerPoint 在关闭之前问 *"Do you want to save the changes made to 'Lecture7-1'? [Don't Save] [Cancel] [Save]"* —— 三个清晰可分的选项，**Save 是主操作**（高亮），Cancel 是次要操作，让用户不会误删自己的工作。

#### 15.2.6 识别优于回忆（Recognition rather than recall）

通过让对象、操作、选项*可见*来**减轻用户的记忆负担**。用户不应当被迫记住对话框中一个部分的信息以便用在另一个部分。

> 例：macOS 字体选择器把每个字体名**用其字体本身渲染**，让你直接认出长相。PHP / IDE 的自动补全弹出 `str_pad`、`str_repeat`、`str_replace`、`str_rot13`、`strcasecmp`、`strchr`、`strcmp`…… —— 开发者识别出对的函数，而不是从零回忆出来。

#### 15.2.7 灵活性与高效率（Accelerators，加速器）

**加速器** —— 键盘快捷键、手势、命令面板 —— 让**专家用户提速**，又不拖累新手。

> 例：OmniFocus 的 "Common Shortcuts" 面板：`Return` 表示 Add Action、`⌘N` 表示 New Window、`^⌘S` 表示 Synchronize with Server、`⌘K` 表示 Clean Up、`⌘1` / `⌘2` 表示 Planning / Context 模式、`⌥⌘1` 表示 Inbox、`^⌥Space` 表示 Quick Entry。新手永远不必学这些；专家依赖它们。

#### 15.2.8 美学与极简设计（Aesthetic and minimalist design）

对话框中不应包含无关信息。**每一个多余的元素都在与相关元素争夺**用户的注意。

> 例：一个博客的搜索下拉，使用了**对比（contrast）**（一个突出的搜索按钮）、**重复（repetition）**（一致风格的单选按钮 `Everything / Entries / Photos / Videos / Audio / Users`）、**对齐（alignment）**（所有元素整齐成列）、**邻近（proximity）**（相关选项被组在一起）。这四个原则 —— **contrast、repetition、alignment、proximity** —— 是值得背下来的极简设计配方。

![一个博客头部和搜索下拉，演示极简设计的四个原则。顶部导航：`Home / Entries / Photos / Videos / Audio` 和一个突出的蓝色 `Q Search` 按钮（contrast）。下方的 "Search:" 面板里是一致风格的单选按钮 `Everything / Entries / Photos / Videos / Audio / Users`（repetition），全部对齐成整齐一列（alignment），"Tags" 组紧挨着范围组（proximity）。没有任何装饰性元素 —— 每个元素都是该有的。](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/week-6/heuristic-8-minimalist-search-dropdown.png)

#### 15.2.9 帮助用户识别、诊断、从错误中恢复（Help users recognize, diagnose, and recover from errors）

错误一旦发生，错误信息应当用**平实的语言**，**精确描述问题**，并**建设性地提出解决方案**。

> 例：一个有三处错误的注册表单，每处错误都显示在相关字段旁边，用友好的语气写：*"bert is already taken. Please choose a different username."* / *"Passwords must be at least 6 characters and can only contain letters and numbers."* / *"The email provided does not appear to be valid."*。或者一个 404 页面写着 *"Oh no! It seems the page you were trying to find on my site isn't around anymore. Report it missing using my contact form, or browse my articles listing or browse my blog."*。

#### 15.2.10 帮助与文档（Help and documentation）

即使系统应当无需文档也能使用，**帮助也应当存在** —— 而且要易搜、聚焦于用户的任务、列出具体步骤、不要太长。

> 例：Picnik 的引导提示 *"Welcome to Picnik Collages! Making collages from your photos has never been easier."* 配 "1 of 8" 的步骤计数器。或者在容易让人困惑的字段旁边放一个小小的 `?` 图标，点击会弹出 *"Which one is right for me? Use Windows when… Use SNMP for… SSH works best for…"* —— 上下文相关的帮助，正好出现在它该出现的地方。

### 15.3 总结表

| # | 启发法 | 一句话总结 |
|---|------|------|
| 1 | **系统状态可见** | 永远显示正在发生什么 |
| 2 | **系统与现实世界匹配** | 说用户的语言 |
| 3 | **用户控制与自由** | 提供撤销、退出、取消 |
| 4 | **一致性与标准** | 同一个词 / 图标 = 同一个意思；遵循平台约定 |
| 5 | **错误预防** | 在错误发生前阻止它 |
| 6 | **识别优于回忆** | 把选项摆出来，而不是要求用户记住 |
| 7 | **加速器** | 给专家提供快捷方式，对新手保留默认路径 |
| 8 | **极简设计** | 用 contrast、repetition、alignment、proximity；其余的都去掉 |
| 9 | **帮助用户从错误中恢复** | 用平实语言写消息，给出具体下一步 |
| 10 | **帮助与文档** | 可搜索、面向任务、具体 |

---

## 16. 方法 8：用户测试

**用户测试** = 把真实用户放到（真实的或原型的）系统前面，给他们代表性任务，观察会发生什么。启发式评估用专家加清单；用户测试用**真实用户**加**被观察的行为**。

### 16.1 测试之前先改进

用户测试很贵 —— 不要把一场测试浪费在一个明显有缺陷的设计上。先做更便宜的检查：

| 测试前的方法 | 它能抓到什么 |
|------|------|
| **检查清单** | 通用的 UI 质量问题（间距、对齐、标签清晰度） |
| **启发式评估** | 违反 Nielsen 十条启发法的地方 |
| **认知遍历（Cognitive walkthrough）** | 一步步问"用户在这一步知道该怎么做吗？" |

只有过了这些，再去预约真实用户才划算。

### 16.2 规划一场用户测试 —— 五件要设计的事

| 要素 | 要做的决定 |
|------|------|
| **被试（Subjects）** | 多少用户？什么人口结构？怎么招募？ |
| **系统（The system）** | 哪个版本 —— 纸面原型、可点击原型、Beta 版、还是线上版？ |
| **任务（Tasks）** | 让用户做什么？（要现实，不能是人造的） |
| **场次（The session）** | 在哪？多长？谁来主持？要不要 think-aloud 指引？ |
| **测度（Measures taken）** | 记录什么 —— 完成时间、错误数、满意度评分、视频、眼动？ |

> 注意它和任意其他领域的对照实验是平行的：被试、材料、流程、测度。用户测试就是经验研究，只是专门用在 UI 上。

### 16.3 用户测试的两种场景

#### 16.3.1 专业可用性实验室

带有**单向镜**的专用设施：一间受控的测试间（用户在一台计算机前工作，有时配眼动设备），一间观察间（研究者实时观察）。整场过程被录像以便后续编码分析。昂贵但严谨。

#### 16.3.2 不太正式的用户测试

很多真实世界的测试要简单得多：

- **Beta 发布**搭配反馈通道 —— 讲座展示了一个 "Super Secret β" 页面，被真实用户用红笔批注得满满的
- **数据看板（Analytics dashboards）** —— 实时图表显示 session 时长、每场屏数、最常访问的屏、目标完成、应用内收入。它们揭示用户*在做什么*；但不一定能解释*为什么*
- **A/B 测试** —— 给一半用户看 A 版，给另一半看 B 版，测哪个转化更高（Lecture 11 里的 Obama 竞选例子就是这种）

> 大项目用实验室；日常的产品工作靠 beta 周期、数据、A/B 测试。两者都是"用户测试"，因为都靠真实用户驱动数据。

---

## 17. Quiz 6 复习要点

复习指南幻灯片明确点出了**三**项内容：

### 17.1 八种以用户为中心的设计方法

你应当能说出每一种并简短描述：

| # | 方法 | 它产出什么 |
|---|------|------|
| 1 | **访谈与观察** | 来自真实用户的、关于他们说什么和做什么的直接数据 |
| 2 | **Personas** | 虚构但有研究支撑的原型角色（带照片、人口统计、目标、任务、环境） |
| 3 | **Scenarios** | persona 在使用系统达成目标的简短叙事 |
| 4 | **Storyboards** | scenario 的连环画化（格子、说明、心理气泡） |
| 5 | **线框图与原型** | 真实屏幕的低保真草图（Balsamiq 风格） |
| 6 | **设计准则** | 可复用的颜色、字体、组件、代码（如 U.S. Web Design Standards） |
| 7 | **启发式评估** | 专家对照 Nielsen 十条启发法做评审 |
| 8 | **用户测试** | 真实用户 + 真实任务 + 观察，可以在实验室或非正式场景 |

### 17.2 全部十条 Nielsen 启发法

把 §15.2 的十条背下来。一个有用的助记法是把它们分组：

- **告诉用户正在发生什么：** (1) 状态可见、(2) 与现实世界匹配、(10) 帮助与文档
- **让用户掌方向盘：** (3) 用户控制、(7) 加速器
- **让系统可预期：** (4) 一致性、(8) 极简设计
- **优雅处理错误：** (5) 预防、(6) 识别优于回忆、(9) 恢复

### 17.3 在线阅读材料的主要观点

（见 Canvas 的两份短读物；这两份的主要观点也算考点。）

### 17.4 其他可能出现的概念

- **为什么可用性重要**（销量 / 满意度 / 效率 / 忠诚度；第一印象；安全相关情境）
- **可用性工程为什么难**（涉及心理学 / 认知科学 / 美学 / 艺术；工程师 ≠ 受众）
- **三句名言**（Joel：程序按用户预期行为；"GUI 应当提供 GUIdance"；Google：聚焦用户）
- **极简设计的四原则**（contrast、repetition、alignment、proximity）
- **用户测试规划的五要素**（subjects、system、tasks、session、measures）
- **测试前改进的方法**（检查清单、启发式评估、认知遍历）

---

## 18. 总结与记忆框架

```text
Week 6 知识结构
|
+-- 我们在哪里
|   +-- Requirements -> Architecture -> Design -> USER METHODS -> Code
|   +-- 本周的问题：怎么让软件满足
|       USER 的需求？
|
+-- 为什么可用性重要 (Lecture 11)
|   +-- 风险：从 MRI / 驾驶舱安全 到 网页转化
|   +-- 回报：simple、inexpensive、sales+、satisfaction+、
|   |        efficiency+、随时间转向 loyalty
|   +-- 三句名言：
|   |   +-- Joel：UI 设计得好 = 程序按用户预期行为
|   |   +-- "GUI should provide GUIdance"
|   |   +-- Google：聚焦用户，其余自然跟来
|   +-- 为什么难：
|       +-- 需要心理学、认知科学、美学、艺术
|       +-- 工程师不是受众 -> 需要刻意的方法
|
+-- 八种以用户为中心的设计方法 (Lecture 12)
|   +-- 1. 访谈与观察
|   |       -> 来自真实用户的直接数据
|   +-- 2. Personas
|   |       -> 照片 + 人口统计 + 引言 + 简介 +
|   |          目标 + 任务 + 技术能力 + 环境
|   |       -> 成组覆盖多种用户角色
|   +-- 3. Scenarios
|   |       -> 简短叙事：persona + 目标 + 上下文
|   |       -> 平实语言、第三人称
|   +-- 4. Storyboards
|   |       -> scenario 的连环画化
|   |       -> 心理气泡浮现困惑
|   +-- 5. 线框图 / 原型
|   |       -> 真实屏幕的低保真草图
|   |       -> Balsamiq 风格的"草稿感"传达
|   |          "评论结构，不是打磨"
|   +-- 6. 设计准则
|   |       -> 调色板 + 字体 + 组件 +
|   |          线框图 + 代码
|   |       -> US Web Design Standards 是典范
|   +-- 7. 启发式评估 (Nielsen) **
|   |       -> 流程：选任务、扮演用户、
|   |          逐启发法评审、记笔记
|   |       -> 十条启发法（背下来）：
|   |          1. 系统状态可见
|   |          2. 系统与现实世界匹配
|   |          3. 用户控制与自由
|   |          4. 一致性与标准
|   |          5. 错误预防
|   |          6. 识别优于回忆
|   |          7. 加速器（灵活性 & 高效率）
|   |          8. 美学与极简设计
|   |             (contrast, repetition, alignment, proximity)
|   |          9. 帮助用户识别 / 从错误中恢复
|   |         10. 帮助与文档
|   +-- 8. 用户测试
|           -> 测试前先改进（检查清单、启发式评估、
|              认知遍历）
|           -> 规划：Subjects、System、Tasks、Session、Measures
|           -> 正式实验室 OR 非正式（beta、数据、A/B）
|
+-- Quiz 6 复习要点
    +-- 八种以用户为中心的设计方法
    +-- 全部十条 Nielsen 启发法
    +-- 在线阅读材料的主要观点
```

### 一句话总结

> 以用户为中心的设计之所以存在，是因为**一个架构得再好的系统，如果忽视用户，仍然会失败** —— 而软件工程师并不是自己的受众，需要刻意的方法去跨越这道鸿沟；这些方法从理解用户（**访谈与观察**）开始，到描述用户（**personas、scenarios、storyboards**），到画出系统（**线框图 / 原型、设计准则**），再到评估它（**对照 Nielsen 十条原则做启发式评估，再用真实用户做用户测试 —— 在实验室里或通过 beta / 数据 / A/B**），而贯穿其中的"好"的可操作定义就是 Joel 那句：界面设计得好，是当程序的行为完全符合用户的预期。
