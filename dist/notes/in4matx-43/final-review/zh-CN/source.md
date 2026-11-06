# INF 43 期末复习 Notes（Cumulative Final Review）
### Introduction to Software Engineering · Prof. James (Jim) Jones · Spring 2026

> **考试信息**：Tuesday, June 9, 10:30–12:30，in-person，**closed notes**，纯 **multiple-choice / multiple-answer**（无 free-form）。
> 期末是 **cumulative**，且**绝大多数题目直接来自每周 Quiz**。本笔记按"考试大问题（Big Questions）"组织，每个主题都附 **核心概念 + 图示 + ⚠️ Quiz 易错点**。
>
> **复习方法**（教授原话）：*Study past quizzes；做 flash-card 式自测——盖住答案先自己答。* 本笔记最后有「⚡ 一页速记 + 高频易错点汇总」。

---

> 📌 **关于「➕ 补充考点」**：教授说过 *"the quiz will focus on these topics, but I reserve the right to ask about any other lecture/reading information as well."* 所以本笔记在多个主题末尾加了标注 **「➕ 补充考点」** 的小节——这些是 **Quiz 没有直接考、但 lecture / reading 讲过**、期末仍可能出的内容。


## 📚 导航：8 个大问题 ↔ 主题 ↔ Quiz

| # | Big Question（大问题） | 主题 | Lectures | Quiz |
|---|---|---|---|---|
| 1 | What is software engineering? | SE 基础 / 原则 / No Silver Bullet | L1–L2 | **Q1** |
| 2 | How do we know what to build? | 需求 Requirements | L3–L4 | **Q2** |
| 3 | （同上）| 用例 Use Cases | L5 | **Q3** |
| 4 | 如何自处？| 职业伦理 Ethics (ACM) | L6 | **Q3** |
| 5 | How do we structure the software? | 软件架构 Architecture + 6 风格 | L7–L8 | **Q4** |
| 6 | How do we structure it in detail? | 设计 Design + UML 类图 | L9–L10 | **Q5** |
| 7 | How do we meet the user's needs? | 用户中心设计 UCD + Nielsen | L11–L12 | **Q6** |
| 8 | How do we know the software works? | 测试 Testing（黑/白盒、覆盖）| L13–L16 | **Q7** |
| 9 | What process do we follow? | 过程模型 Process Models（8 种）| L17–L18 | **Q8（练习卷）** |

> 贯穿全课的 **INF 43 Recurring Fundamental Principles**（几乎每个主题都会回扣，要会用它解释设计/需求/架构的好处）：
> **Rigor & formality（严谨与形式化）· Separation of concerns（关注点分离 = modularity + divide-and-conquer + abstraction）· Anticipation of change（预见变化）· Generality（通用性）· Incrementality（增量性）。**

---

## 1️⃣ What is Software Engineering?（L1–L2 · Quiz 1）

### 1.1 SE 的定义（要能解释每个定义的关键词）

- **Tsui/Karam/Bernal**：a *broad field* touching all aspects of developing & supporting a software system。
- **Ghezzi 等**：building software so large it's built by *teams of engineers*。
- **Parnas**：*Multi-person construction of multi-version software*。（最常被引用：多人 + 多版本）
- **Schach**：production of *fault-free*, on-time, on-budget software that meets user's needs *and is easy to modify*。
- **INF 43 定义** ⭐：*The process of constructing software；development phases **other than programming**；principles & qualities of enduring value。*

> **Programming vs. Software Engineering（Q1.1）**：Programming 只是写代码；SE 还要 **管理大规模系统、团队、流程、复杂度**。

### 1.2 三种视角 Perspectives（谁最重要？关键词配对）

| Perspective | 关注点 What matters most |
|---|---|
| **Business**（Shawna, CEO）| **Money**（钱、成本、收益）|
| **Engineering**（Andy）| **Internal quality of the software**（内部质量）|
| **User**（Clara）| **"Everything that the user sees"**（用户所见的一切）|

> ⚠️ **Quiz 1 配对题**：Engineering→内部质量，Business→钱，User→用户所见。User 视角被认为**最重要**（一切以用户为中心）。

### 1.3 三大要素 Essential Ingredients

> **People + Processes + Tools**。其中 **People（人）最重要** ⭐（呼应 Davis "people are the key to success"）。
> ⚠️ Q1.2 答案是 **People**，不是 "all equally important"。

### 1.4 抽象等原则（识别例子）

> **Abstraction（抽象）**：用简单接口隐藏内部逻辑。*函数调用提供简单接口、隐藏实现* = abstraction（Q1.3）。

### 1.5 No Silver Bullet（Fred Brooks, 1986）⭐⭐⭐ 高频考点

- **"Silver bullet" 比喻**：一颗能杀死狼人的银弹 = 一个能让开发难度骤降 **10×** 的单一突破。Brooks 主张：**这样的银弹不存在**。
- **核心区分**：**Essential complexity（本质复杂度）** = 问题本身固有的难度（难以消除）；**Accidental complexity（偶然复杂度）** = 工具/语言/环境带来的难度（可被更好工具降低）。过去的突破多是攻击"偶然"，剩下的"本质"才是硬骨头。

**4 大本质困难 Essential Difficulties**（必背，会被单独考定义）：

| 困难 | 含义 |
|---|---|
| **Complexity** 复杂性 | 软件比任何人造物都复杂；*no two parts are alike* |
| **Conformity** 一致性/顺应 | 软件必须顺应人为的制度、系统（这些会变）|
| **Changeability** 易变性 | 成功的软件总是被要求修改（因为"看起来"容易改）|
| **Invisibility** 不可见性 | 软件没有物理形态，无法在几何空间中可视化 |

> ⚠️ **易错（Q1.4 / Q8.5 / Q8.12）**：
> - Brooks **最不可能**给的建议 = *"永远从零自己造、不要复用"* → 错，他主张 **buy vs. build（复用）**。
> - 他的论点是 *"十年内没有任何单一技术能带来 10× 提升"*；不是"AI 将成为银弹"，也不是"多个小进步叠加可达 10×"。
> - **学建模工具的难度 = accidental**；**理解业务流程的难度 = essential**。

---

### ➕ 补充考点：原则细节 & 银弹清单（lecture，Quiz 未直接考）

- **Software 不止代码**：code · documentation/user manuals · designs/specs · test cases · plans/schedules。**Engineering = 创造性地应用科学与数学**去设计建造，涉及 trade-offs、risk analysis、技能与知识。
- **三套经典 SE 原则（知道出处与代表词）**：
  - **Davis (1994)**：质量第一 · 尽早交付给客户 · 先理解问题 · 选合适过程 · **好管理 > 好技术** · 人是成功关键。
  - **Royce (1998)**：architecture-first · component-based（**buy vs. build**）· 频繁给客户预览版 · incremental releases。
  - **Wasserman (1996)**：modularity · abstraction · UI prototyping · reuse · metrics。
- **不同角色"看见"软件的不同部分**：user=UI；programmer=源码/内部设计；society=影响/趋势/危险；business=利润/成本/培训；manager=团队/预算/进度。
- **"False" silver bullets（曾以为是、其实不是）**：high-level languages、time-sharing、OOP、AI、expert systems、自动/图形化编程、program verification、环境/工具、工作站。
- **Potential silver bullets（真有帮助但非银弹）**：**buy vs. build** · requirements refinement + rapid prototyping · incremental development · great designers。
- **软件三大持久质量**：**Correctness（正确性，第一位）· Efficiency · Robustness**。


## 2️⃣ 需求 Requirements（L3–L4 · Quiz 2）

### 2.1 软件失败 & 为什么要需求

- 行业数据触目惊心（CHAOS）：只有 ~29% 项目成功，~52% challenged，~19% failed。
- **Top 失败原因**多与需求相关：缺乏用户参与、需求不完整、需求变更、缺乏流程纪律/度量/资源。
- **需求缺陷占返工成本 70%+**；返工占总预算 30–50%。**越晚改越贵**（cost of change 指数上升）。

![软件生命周期成本：维护占 67%](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/lifecycle_costs.png)
*生命周期成本：维护（Maintenance）独占 ~67%；需求分析仅 ~2%，却决定后面一切。*

![变更成本随阶段指数上升](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/cost_of_change.png)
*Cost of change：越往后（实现/集成/维护）改一个需求越贵 → 所以前期要把需求做对。*

### 2.2 需求的定义

> **Requirements = WHAT the software should do, *without* saying HOW.** 描述用户**需要（needs）**，而非用户**想要（wants）**。
> ⚠️ 指定"用 Python 写后端" = **how / 实现决策**，不是需求（Q2.2 最差的需求例子）。

### 2.3 需求阶段：分析 vs. 规约

| 子阶段 | 英文 | 含义 |
|---|---|---|
| **需求分析** | Requirements **Analysis** | *coming to know & understand* 系统该做什么（**理解**）|
| **需求规约** | Requirements **Specification** | *documenting* 需求（**记录**）；也指**需求文档**本身 (SRS) |

> ⚠️ Q2.13/15/16/17 反复考这个区分：**Analysis = 理解；Specification = 文档/记录的动作**。

### 2.4 需求分析技术（哪个 NOT 是？）

Interview（访谈）· Observe（观察客户，CNBC 医疗文章）· Use cases/scenarios · Prototype（原型）· Research（研究既有方案）· **Data-driven**（数据分析 / **A/B testing**，Netflix 最出名）。

> ⚠️ **Testing（测试）NOT 是需求分析技术**（Q2.14）——测试是实现之后的验证活动。
> ⚠️ 美国**雇佣最多程序员**的类别 = **In-house staff**（公司内部为自己写软件），不是游戏/外包/开源（Q2.5）。

### 2.5 需求文档结构（每节放什么 = 必考）

| 文档章节 | 放什么 |
|---|---|
| **Executive Summary** | 简短（≤1 页）的产品概述：主要目标、关键特性、关键风险 |
| **Application Context** | 系统运行的**环境/场景**、它影响的所有对象/硬件/外部系统（如"iPad 放在图书馆大厅、连县图书馆数据库"）|
| **Environmental Requirements** | 平台、硬件、OS、是否 Web/移动/桌面、编程语言、标准 |
| **Functional Requirements** | 系统提供的**功能/特性/信息**（"系统该做什么"）|
| **Software Qualities（"ilities" / 非功能需求）** | correctness, reliability, efficiency, usability, security, scalability… "**secure and beautiful**" 属此节 |
| **Assumptions / Risks** | 假设的前提、未来不确定的风险（记录风险**在**需求工程师职责内）|
| **Future Changes** | 预见的变更；文档应结构化以易于吸收变化 |
| **Glossary** | 非标准术语的精确定义 |

> ⚠️ Q2 高频：iPad/扫描仪/数据库 → **Application Context**；"安全又美观" → **Software Qualities**；功能清单 → **Functional Requirements**。
> ⚠️ Q8.10：跑在 iOS 上 = **context**；2 秒内响应 = 性能（非功能）；client-server = 架构决策；用 Swift = 实现选择。

### 2.6 Ziv's Law ⭐

> **Ziv's Law**：软件开发本质上**不可预测**，需求等文档**永远无法被完全理解**；不确定性是 SE 固有且不可避免的。
> → 推论：**假设需求文档迟早会变**（不要当成"刻在石头上"）。（Agile 的 Ziv's Law 也在此回扣。）

---

### ➕ 补充考点：规约方法 / 验证 / 验收测试计划（lecture，Quiz 未直接考）

- **需求文档读者众多**：customers、developers、managers、testers、documenters、maintainers、system engineers、architects、marketing…（→ 必须清晰、无歧义）。
- **规约方法 Specification Methods**：① 自然语言（SRS、user stories）② 图（**data flow、finite state machines、Petri nets**）③ 形式语言（**Z、TLA+**）④ 模型（domain / usage / goal model）。
- **好需求的判据 / 规约验证**：每条是否 **complete、understandable、unambiguous、non-conflicting、verifiable、术语已定义、unbiased**？（todo-app 例子反复问 *Complete? Unambiguous? Non-conflicting? Verifiable?*）
- **Acceptance Test Plan（验收测试计划）**：常随需求规约一起；规定如何判定每条需求被满足；**通过全部测试即绑定客户验收**；可含具体测试用例 / 必须通过的数量。
- **近似 UI** 通常也是规约的一部分；文档结构本身就体现 rigor、separation of concerns、abstraction、anticipation of change 等原则。


## 3️⃣ 用例 Use Cases（L5 · Quiz 3）

### 3.1 是什么 / 为什么

> **Use case = 一段*文本*描述，刻画 actor 与系统之间为达成某*目标*的交互。** 注意：**use case 是文本的**，不要和 *use case diagram（图）* 混淆（Q3.6）。

- **为什么用**：贴近用户目标 / 易映射到设计与实现 / 易于**验证-确认**设计 → **在 Agile 中能很好地映射为 acceptance tests**（Q3.1）。
- **不擅长（NOT good for）**：User interfaces、Data formats、Business rules、**Non-functional requirements**（Q3.7）。需与其它需求方法配合。

### 3.2 三种 Flow（流）

| Flow | 含义 |
|---|---|
| **Basic Flow** | "Happy day" 正常成功场景 |
| **Alternative Flow** | 目标达成，但走了**不同路径** |
| **Exception Flow** | 目标**未达成**（失败）|

> use case 应覆盖所有 flow（成功与失败）。**Database schema 不属于 use case**（那是设计产物，Q3.3）。

### 3.3 Actors（参与者）

> Actor = 与系统交互的**外部实体**：**人 / 硬件设备 / 另一个软件系统**（Q3.4）。发起用例的是 **primary actor（主要参与者）**。

### 3.4 用例图 Use Case Diagram

![用例图（ATM 示例）：actor、系统边界、用例](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/usecase_diagram_atm.png)
*用例图 = actors（小人）+ 系统边界（方框）+ use cases（椭圆）+ 之间的连线。它是**图形**视图。*

![用例图（图书馆系统）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/usecase_diagram_library.png)
*更复杂的例子：Patron / Staff / Browser 等 actor 连到各用例。读图技巧：某用例的 **primary actor** = 与它相连、发起它的那个 actor。*

> ⚠️ Q3 读图题：只连"Prospective customer"的用例 = **Creating profile**；"Get ingredient request"的主 actor = **Procurement**。

---

### ➕ 补充考点：Include / Extend 关系 & 用例模型（lecture，Quiz 未直接考）⭐

- **用例之间的关系（会画在用例图里）**：
  - **«include»（包含）**：一个用例**总是**用到另一个用例的行为——抽取公共子流程（如多个用例都 "Validate user"）。
  - **«extend»（扩展）**：在**特定条件下可选**地加入额外行为；基础用例**不依赖**扩展用例。
  - **Extension points（扩展点）**：基础用例中允许被扩展的位置。
- **用例模板字段**（知道大致构成）：Name · Actors · Goal · **Precondition / Postcondition** · **Trigger** · Basic/Alternative/Exception flows · Includes/Extends · Special/Performance/Data requirements。
- **找 actor / use case 的提问**："谁用/安装/启动/关闭系统？谁提供/获取信息？哪些外部设备或系统直接交互？所有功能需求都能被用例覆盖吗？"
- **Use case model = 一个或多个用例图 + 用例的文字描述**；它是贯穿开发、连接各类 stakeholder 的**统一线索（unifying thread）/ 沟通工具**。


## 4️⃣ 职业伦理 Ethics（L6 · Quiz 3）

> **ACM/IEEE Software Engineering Code of Ethics**，8 条原则。最高优先级是 **Public First（公众优先）**。

| # | 原则 | 关键词 |
|---|---|---|
| 1 | **Public** ⭐ | 以公众利益为先：安全、健康、隐私、福祉**高于一切**；披露危险、报告重大风险 |
| 2 | Client & Employer | 维护客户/雇主利益——但**受限于"伦理边界与公众利益"** |
| 3 | Product | 高质量、可靠、充分测试、可维护；发布前修复已知缺陷 |
| 4 | Judgment | 保持诚信与独立，基于**证据**决策，拒绝贿赂 |
| 5 | Management | 倡导健康/合伦理的开发环境、现实排期、QA、鼓励上报顾虑 |
| 6 | Profession | 维护行业声誉与标准 |
| 7 | Colleagues | 公平、署名、建设性评审、反歧视 |
| 8 | **Self** | **终身学习**、提升能力、知道自己的能力边界 |

> ⚠️ Quiz 3 高频：ACM 首要考量 = **Public good**；管理者应营造 **healthy workplaces**；尊重隐私 = **minimize data collection**；终身学习重要因为**知识很快过时**。
> **客户利益 vs 公众利益冲突时 → 公众赢**（Principle 1 > Principle 2）。

---

## 5️⃣ 软件架构 Architecture（L7–L8 · Quiz 4 + 出勤 Quiz）

### 5.1 定义与价值

> **软件架构 = the set of *principal* design decisions about a system**（系统的**主要**设计决策集合）。是系统**构建与演化的蓝图（blueprint）**。关键词是 **"principal"**——不是源代码、不是 UI 外观、不是测试计划。

**"principal" 决策涉及**：Structure（结构）· Behavior（行为）· Interaction（交互）· Non-functional properties（非功能属性）。

**为什么要架构（好处）**：Intellectual control（智力掌控）· **Conceptual integrity（概念完整性）** · Effective communication（沟通）· **Reusability** · **Maintainability**。
> ⚠️ Q4.8：架构**不保证 correctness**（正确性仍靠实现+测试+验证）。
> ⚠️ **Conceptual integrity**（Brooks 称其为系统设计最重要的考量）= 让不同团队遵循**统一连贯的愿景**（Q4.7）。

### 5.2 架构的元素

![架构元素：Components / Connectors / Configuration](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_elements.png)

| 元素 | 含义 |
|---|---|
| **Component（组件）** | 主要的**计算单元 / 数据存储**（系统的主要构建块）|
| **Connector（连接器）** | 组件之间的**交互/通信**机制 |
| **Configuration（配置）** | 把 components + connectors 编排成的**架构图（拓扑）** |

### 5.3 Prescriptive vs. Descriptive + 架构侵蚀

| | 含义 |
|---|---|
| **Prescriptive architecture**（规定式）| as-designed / as-intended，**设计/意图**中的架构 |
| **Descriptive architecture**（描述式）| as-implemented / as-realized，**代码里真实**的架构 |

> **Architectural erosion（架构侵蚀）**：系统演化时本应先改 prescriptive，但实践中常直接改代码 → 两者出现差距。
> ⚠️ 侵蚀原因（Q4.12）：**short deadlines（时间压力）**、开发者随意、缺乏文档化的规定架构、代码优化、工具支持不足。（"文档太多/工具太多/概念完整性过强"反而**保护**架构，不会侵蚀。）

### 5.4 建筑类比的局限（Q4.3）

> 软件 vs. 建筑的关键差异：软件**用途范围广得多**、更**可塑（malleable）**、**不可见（invisible）**、部署后**频繁变化**。共同点 = 都先有**蓝图再施工**。

### 5.5 六大架构风格 Architectural Styles ⭐⭐⭐

> **风格 = 一组命名的架构设计决策**，适用于特定情境、**约束**设计决策、为系统带来**有益质量**；即一套命名的 components/connectors/configurations。
> ⚠️ 出勤 Quiz：用某风格**不保证**系统更高效（"always more efficient" 是错的）。

#### ① Model-View-Controller (MVC)
![MVC](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_mvc.png)

- **Model**：数据 + 业务逻辑（账户余额、规则）。
- **View**：把数据**显示**给用户。
- **Controller**：接收**用户输入**，决定调用哪个 model 操作，再让 view 更新。
- **好处**：Modularity、Anticipation of change（**关注点分离**——UI 与数据逻辑可独立演化）。
> ⚠️ ATM 点 "Withdraw" → **Controller** 决定做什么（View 只是侦测点击；Q8.16）。

#### ② Client-Server
![Client-Server](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_client_server.png)

- 客户端向服务器**请求**，服务器**响应**；**集中**数据/安全/访问。
- **好处**：跨大量客户端共享数据与服务、**集中控制**。
> ⚠️ 客户端**不直接互相通信**（那是 P2P）。云计算让 client-server 多跑在云端（AWS 起家）。

#### ③ Layered（分层）
![Layered](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_layered.png)

- 每层只**依赖相邻下层**（如 Android 系统、餐厅协议）。
- **好处**：Modularity、Abstraction、Anticipation of change、**Reuse**。
> ⚠️ 出勤 Quiz：**下层（lower layers）最可复用**（提供通用服务给上层）。

#### ④ Peer-to-Peer (P2P)
![P2P](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_peer_to_peer.png)

- 每个 peer 既是客户端又是服务器，**无中央服务器**（Skype 多人视频）。
- **好处**：Efficient、Robust。

#### ⑤ Pipe-and-Filter（管道-过滤器）
![Pipe-and-Filter](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_pipe_filter.png)

- **Filter = 组件**（处理数据）；**Pipe = 连接器**（传数据流）。例：编译器 scanner→parser→translator；`ls -l | grep "Aug" | sort`。
- **好处**：Modularity、Reuse、Anticipation of change。

#### ⑥ Publish-Subscribe（pub-sub）
![Pub-Sub](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/arch_pub_sub.png)

- 发布者把事件发给订阅管理器，**订阅者只收自己订阅的事件**（股票行情）。
- **好处**：Efficiency、Scalability。

| 风格 | 一句话 | 主要好处 |
|---|---|---|
| MVC | UI/逻辑/数据三分 | 模块化、预见变化 |
| Client-Server | 客户端请求中央服务器 | 集中控制、共享 |
| Layered | 层层向下依赖 | 模块化、抽象、复用 |
| P2P | 对等、无中心 | 高效、健壮 |
| Pipe-Filter | 数据流经过滤器 | 模块化、复用 |
| Pub-Sub | 按订阅推送事件 | 高效、可扩展 |

> **演化 Evolution**：所有成功软件都会演化；趋势 **Monolithic → Microservices**（每个服务独立部署、自管数据以**降低耦合**）。混用多种风格很常见。

---

### ➕ 补充考点：REST/Web 架构 & 真实案例（lecture，Quiz 未直接考）

- **WWW = REST reference architecture**（经典案例，要理解其特征）：
  - Web 是**资源（resources）**的集合，每个资源有唯一名字 **URL**；URL 可定位到 Internet 上的 **origin server**。
  - **Client（user agent / 浏览器）向 server 请求**资源；客户端操作的是资源的**表示（representations）**。
  - 通信用**统一、通用的协议 HTTP**；且每次通信必须**自包含 / 无状态（self-contained / stateless）**。
  - **没有单一代码实现该架构**，风格约束在代码里看不出来——只能从**架构视角**理解。
- **功能 vs 非功能需求（Facebook 例）**：功能=好友/动态/News Feed/消息/照片…；非功能=performance、scalability、availability、security、privacy、reliability、portability。
- **真实架构案例**（知道大致是 client-server / 分层 / 混合）：Email（client↔server）、AUTOSAR（汽车）、Netflix、Reddit。**混用多种风格很常见**。
- **AI 辅助架构（Week 5 reading）**：把 Claude 当"架构导师"——你是 architect、AI 是 consultant；学生项目几乎都是 **client-server（Frontend 显示 / Backend 逻辑 / Database 存储）**，可混入 layered 后端 + MVC/组件化前端；连接器协议常用 **HTTP/REST**（请求-响应、JSON），实时用 **WebSocket**，服务间用 **RPC/gRPC**。最小可运行 = 一个端点打通"前端→后端→数据库"的 round-trip。


## 6️⃣ 详细设计 Design + UML（L9–L10 · Quiz 5 + 出勤 Quiz）

### 6.1 设计 vs. 架构

> **Software design = 关于"系统*如何*实现"的全部创造性决策**（the "how" to requirements' "what"）。
> **Architecture = design 决策的*子集*——其中"principal / 系统级"的那些**。架构决策**更难改**（牵一发动全身）。

> ⚠️ Q8.6 错误说法："架构关乎内部结构与实现，而设计主要关乎外观与 UI" → 错。架构是设计的**子集**；设计远不止 UI（含数据结构、算法、模块接口、类组织…）。
> ⚠️ 系统级设计决策的例子：**选用哪种通信协议**（影响每个组件）；变量拼写是局部的、不算。

### 6.2 设计的 6 种途径（按"被什么主导"分类）

![Functional Decomposition（功能分解）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/functional_decomposition.png)
*Functional decomposition：递归地把**功能**拆成子功能，直到叶子小到能用一个函数/方法实现。*

| 途径 | 由什么主导 |
|---|---|
| Software architecture | 主要结构决策 |
| **Functional decomposition** | 拆**功能 functionality** |
| **Relational database design** | 拆**数据 data**（实体/属性/关系→表）|
| **Object-oriented design (UML)** | 拆**实体**——**数据 + 计算二者兼顾** |
| **User interface design** | **设想并迭代** UI（草图、原型、反馈）|
| Sketching | 速写 |

> **Class（类）= 造对象的蓝图**；**Object（对象）= 数据 + 方法**（封装 encapsulation）。OO 的优势 = 把数据与计算统一在"对象"里。

### 6.3 设计的本质：目的、迭代、抽象

> **设计的 3 个目的**：**to Think（思考）· to Talk（沟通）· to Prescribe（规定要造什么）**。
> 设计是**迭代**发展的（不是开头一次定死，也不是写完代码才做）。

> **Abstraction（抽象）= 去掉无关信息、保留/突出相关信息**（选择性省略）。每种**设计记号（notation）只支持某一种抽象** → 所以需要多种图。多模型 = 系统的**互补视角**（类图=结构、时序图=交互、状态图=生命周期），彼此互补不重复（Q8.9）。
> 一句话定义：**SE = 构建一组相关模型来表示 system-to-be 的过程。**

### 6.4 UML 类图 Class Diagram ⭐⭐

![UML 类图结构：name / attributes / operations + 可见性](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_class_structure.png)

- **三个隔间（compartments）**：上=**类名 Name**，中=**属性 Attributes**，下=**操作 Operations**。
- **可见性符号**：`+` **public** · `−` **private** · `#` **protected** · `~` **package**。

![类→代码（Airplane 示例）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_class_airplane.png)
*`+getSpeed():int`、`-speed:int` → 对应 public 方法 / private 字段。*

### 6.5 类之间的关系 Relationships

![Inheritance（继承）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_inheritance.png)
![Association（关联）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_association.png)

- **Inheritance（继承 / is-a）**：general→specific（Animal ← Hippo）。**空心三角箭头**指向父类（Q5.20）。
- **Association（关联）**：类之间的连接（teaches / listens to）。
- **Multiplicity（多重性）**：一端的数字 = 对方**一个**实例对应**多少个**本类实例。**从对面端读**。

> ⚠️ **多重性陷阱（Q5.22）**：X —— `*` Y，则每个 X 关联**多个** Y → X 里应有一个 **Y 的集合（collection/List）**，不是单个 Y、更不是数字 1。

![Aggregation（聚合，空心菱形）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_aggregation.png)
![Composition（组合，实心菱形）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/uml_composition.png)

**Aggregation vs. Composition（必考）**——用 **destruction test（销毁测试）**：

| | 关系 | 部件能否独立存在？ | 菱形 |
|---|---|---|---|
| **Aggregation** | whole-part（has-a）| **能**（整体销毁，部件存活）| 空心 ◇ |
| **Composition** | whole-part 的**更强**形式，含 **existence dependency（存在依赖）** | **不能**（整体销毁，部件随之销毁）| 实心 ◆ |

> ⚠️ Q8.11 错误说法："Aggregation 意味着部件不能独立存在" → 那是 **composition** 的规则。

### 6.6 设计原则

![High Cohesion / Low Coupling](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/cohesion_coupling.png)

> **High Cohesion（高内聚）**：把**相关**功能聚在一起（模块内元素关联强）。
> **Low Coupling（低耦合）**：减少模块间**依赖**。
> 目标 = **高内聚 + 低耦合** → 变更不扩散、易复用。
> ⚠️ Q8.2 陷阱：**"Cohesion 衡量模块对其它模块的依赖程度" = 错**（那是 **coupling** 的定义）。

> **Information Hiding（信息隐藏）**：隐藏**最可能变化**的设计决策，保护程序其它部分不受其变更影响。

---

### ➕ 补充考点：其它 UML 图 & 设计记号（lecture，Quiz 未直接考）

- **不同阶段用不同"语言"**：Requirements→**English**；Design→**Diagrams / UML**；Coding/Testing→**Java / Python**。*"好的记号把大脑从无谓劳动中解放出来。" —Whitehead*。
- **UML 表示系统的不同方面**：**Class diagram = 结构（structure）**；**Activity diagram = 流程/行为（workflow）**；**Sequence diagram = 交互（随时间的消息传递）**；Use case diagram = 用户-系统交互。
- **其它设计图/记号**：UI mockups / wireframes（如 Balsamiq）、pseudocode、**ER diagram（实体-关系）**、architecture diagrams、storyboards、sketches。
- 每种记号支持**某一种抽象** → 需要多种图从不同角度描述同一系统。一句话：**SE = 构建一组相关模型来表示 system-to-be**。


## 7️⃣ 用户中心设计 UCD（L11–L12 · Quiz 6）

### 7.1 为什么 Usability 重要

> *"界面设计得好 = 程序行为完全符合用户的预期。"* UCD 简单、便宜，却能提升销量、满意度、效率。软件工程师**通常不是**自己软件的用户 → 需要专门方法。

### 7.2 八种 UCD 方法（必背 + 会区分）

| 方法 | 是什么 / 关键区分 |
|---|---|
| **Interviews（访谈）** | 问用户**说**他们做什么——会**漏掉隐性/协作**工作 |
| **Observations（观察 / 民族志）** | 看用户**实际**怎么做——能揭示访谈漏掉的默会实践（如交接班）|
| **Personas（人物画像）** | 把抽象用户角色**人格化**的设计工具（"19 岁通勤学生 Alex"）；**不是统计样本**，不替代用户测试 |
| **Scenarios（场景）** | 一段**文字叙事**：用户的目标/情境（→推导设计含义）|
| **Storyboards（故事板）** | 场景的**视觉版**：连环画式展示周遭环境与交互序列 |
| **Wireframes / Mockups** | 低保真界面草图 |
| **Design Guidelines（设计规范/标准）** | 组件+样式+代码样例+可访问性默认值；解决**大组织里各团队重复造轮子→不一致**的问题（如 U.S. Web Design Standards）|
| **Heuristic Evaluation（启发式评估）** | 专家**按既定原则**（Nielsen 10 条）检查界面 |
| **User Testing（用户测试）** | 真实用户做真实任务、**出声思考**、观察其卡顿/错误 |

> ⚠️ Q6 高频区分：
> - 访谈漏掉的协作工作 → 要用**观察**补。
> - **Heuristic eval（原则驱动、专家）** vs **User testing（行为驱动、真实用户）**——两者任何阶段都能做、都可用任务，区别在"原则 vs 行为"。
> - 三个政府网站三套密码规则 → 违反 **跨服务的一致性与复用**（design standards）。
> - 共享的 508-compliant 组件 → **默认即可达成可访问性与一致性、减少重复实现**。

### 7.3 Nielsen 十大启发式（配例子 = 考法）⭐⭐

| Heuristic | 一句话 | Quiz 里的例子 |
|---|---|---|
| **Visibility of system status** | 让用户知道当前状态/进度 | 只有转圈、不告诉要 5 秒还是 5 分钟 |
| **Match system & real world** | 用用户的语言，别用行话 | 打印机显示 "PC LOAD LETTER"（工程师黑话）|
| **User control & freedom** | 提供撤销/退出（"紧急出口"）| 裁剪图片**没有 undo** |
| **Consistency & standards** | 一致的外观/行为 | 大学站点跳转后导航/品牌全变，疑似离开官网 |
| **Error prevention** | 防止错误发生 | 删除对话框按钮叫 "Proceed" / "Delete"，没有明确 "Cancel" |
| **Recognition rather than recall** | 让信息可见，减轻记忆负担 | 要求记住上一页的 12 位确认码；菜单用图片＞纯文字 |
| **Flexibility & efficiency（Accelerators）** | 为高手提供快捷方式 | 新手看不到、老手可用的键盘快捷键；老顾客跳过引导 |
| **Aesthetic & minimalist design** | 界面简洁、只放必要信息 | 对比/重复/对齐/亲密性 |
| **Help users recognize/recover from errors** | 错误信息清楚、给出解法 | — |
| **Help & documentation** | 必要时提供帮助文档 | — |

> **餐厅可用性阅读（Nielsen Group）的教训**：*"Just take the money"*（别在结账前强塞注册/问卷/会员）·*Use pictures*（图片＞回忆，呼应 recognition>recall）·*Retain valued features*（改版别破坏熟悉感）·让老用户**跳过新手引导**直达常用操作。

---

### ➕ 补充考点：可用性测试细节 & 极简设计原则（lecture，Quiz 未直接考）

- **极简设计的视觉原则（CRAP）**：**Contrast（对比）· Repetition（重复）· Alignment（对齐）· Proximity（亲密性）**。
- **Cognitive walkthrough（认知走查）**：评估者站在新用户视角，逐步走查完成任务的每一步是否自然合理。
- **规划用户测试的要素**：**Subjects（被试）· The system · Tasks（任务）· The session · Measures taken（度量）**；先用 checklist / 启发式评估改进设计，**再**拿给真实用户。
- 为什么难：UX 设计基于心理学、认知科学、美学、艺术——而**软件工程师通常不是自己软件的目标用户**，所以才需要这些 UCD 方法。


## 8️⃣ 测试 Testing（L13–L16 · Quiz 7 + Quiz 8）⭐⭐⭐ 考点最密集

### 8.1 QA：Verification vs. Validation

| | 问题 | 含义 |
|---|---|---|
| **Verification（验证）** | *"Are we building the system **right**?"* | 是否符合**规约/设计文档** |
| **Validation（确认）** | *"Are we building the **right** system?"* | 是否满足**用户真实需求** |

> **QA = 所有测量并改进产品质量的活动**。技术：**Formal methods、Static analysis、Reviews/Inspections、Testing**（混合使用）。
> ⚠️ Q7.2 / Q8.15：检查代码是否符合**技术设计文档** = **verification**；用户觉得难用/分析无意义 = **validation**。系统可以**通过 verification 却 fail validation**（规约实现得很对，但规约本身不符用户需要）。

### 8.2 IEEE 术语链：Mistake → Fault → Error → Failure ⭐⭐⭐

![IEEE 链：Mistake → Fault → Error → Failure](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/ieee_fault_chain.png)

| 术语 | 定义 |
|---|---|
| **Mistake（失误）** | 人的行为产生了错误结果（写代码时的人为疏忽）|
| **Fault / Bug（缺陷）** | 代码中错误的步骤/数据定义——**能在代码里指出来**（"defect" 通常指 fault）|
| **Error（错误）** | 运行时计算结果与正确结果的差异（**内部**错误状态）|
| **Failure（失败）** | fault 的（错误）结果——**外部可见**的异常行为/输出 |

> ⚠️ 判定题套路：
> - "员工拿到**错误的加班费**" / "AssertionError: expected x but was y" = **Failure**（外部可见）。
> - **一个 fault 不一定造成 failure**（该路径未执行，或错误状态被后续逻辑覆盖）。

![测试层级：unit → integration → system](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/testing_levels.png)

### 8.3 测试基础

> **Dijkstra**：*"Testing can show the presence of bugs, but never their absence."*（测试只能证明 bug 存在，永远不能证明不存在。）
> ⚠️ 因此 "更好的测试就能让软件没有 bug" / "测到所有 bug 都修了" = **错**（Q7.5 / Q7.9 / Q8.15）。

- **谁来测**：程序员、测试员、用户（acceptance / **alpha** / **beta** testing）、众包/bug bounty。
- **测试层级（速度 快→慢、范围 小→大）**：**Unit（单元，毫秒）→ Integration（集成，秒）→ System（系统/验收，分钟）**——"测试金字塔"。
- **Test Oracle（测试预言）**：判定一次测试**通过/失败**的机制（给定输入的期望输出）；难以自动化。⚠️ oracle **不是**"预测哪里最可能有 fault"。两个独立实现可互为 oracle（**N-version programming**）。
- **Peer code review（同行代码评审）** = 合并前由人**审阅代码改动**（如 GitHub PR）。
- **何时停止测试**：固定时间/预算内尽量多找 fault；新 fault 发现率趋近于零；达到既定质量要求/完成计划的 QA 活动。⚠️ **不能**是"所有 bug 都找到并修复"。

### 8.4 黑盒 Black-box（规约驱动）

> 用**规约**导出测试，不看代码内部。

- **Equivalence Class Partitioning（等价类划分）**：把输入域分成"对找错而言等价"的类；类应**覆盖完整输入域**且**互不重叠**；每类取代表值测一次即可。
- **Boundary Value Analysis（边界值分析 BVA）**：很多错误发生在**边界**（`<` vs `<=` 混淆）→ 在每个类的**边界**取值测试。
- **系统步骤**：① 确定输入域 domain ② 找划分依据（大小/结构/正确性/直觉）③ 划分成子域 ④ 每子域取代表值 ⑤ 测代表值 + 边界值。
- **Combinatorial testing**：多参数时，各自划分取值后**组合**。

> ⚠️ **BVA 范围陷阱（Q7.13 / Q7.14，最易错）**：
> - 密码长度 8–16 → 三个分区 too-short(<8) / valid / too-long(>16)；测**所有分区的边界** = **{7, 8, 16, 17}**。
> - 但若问"分区 **18 ≤ age < 50** 自己的边界值" = **{18, 49}**（49 是满足 <50 的最大整数；50 在区外）。⚠️ {17,18,49,50} 是**跨所有分区**的完整 BVA 集——看清问的是"整个域"还是"某一分区"。
> - 等价类划分的步骤**不含** "收集用户反馈做 validation"（那是 validation，不是黑盒步骤）。

### 8.5 白盒 White-box（结构/代码驱动）

> 用**源代码**导出测试：建**控制流图（CFG）**，用图覆盖来表达测试。

![控制流图 CFG（getSecondElement）](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/control_flow_graph.png)

- **CFG 规则**：每图有 **entry** 与 **exit** 节点；每节点≈一条原子指令（约一行）；边有向；**任何有 ≥2 条出边的节点**，出边要按条件**加标签**（谓词 T/F、switch 取值）——这些就是 **branches（分支）**。
> ⚠️ Q7.11：多出边要加标签，因为标签**标明每条路径对应的条件**。

![Statement / Node Coverage](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/statement_coverage.png)
![Branch / Edge Coverage](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/branch_coverage.png)

| 覆盖准则 | 要求 |
|---|---|
| **Statement / Node coverage** | 每个**节点（语句）**至少执行一次 |
| **Branch / Edge coverage** | 每条**分支（边）**都走到——比语句覆盖**更强**、更易发现逻辑错误 |
| **Condition / Method / Method-call / Data-flow** | 各条件、各方法、各调用点、各定义-使用 |
| **Path coverage** | 每条**路径**都走——**最强**，但循环导致路径爆炸，常**不可行** |

> **覆盖层级（必考）**：**Path ⊇ Branch ⊇ Statement**。
> ⚠️ **Branch 严格强于 Statement**：达到 branch 覆盖 **自动**满足 statement 覆盖，反之**不然**。例 `if (x) doThing();` 只测 `x=true` → 语句全覆盖，但只覆盖一半分支。
> ⚠️ 所以 "100% statement 覆盖 ⇒ 100% branch 覆盖" = **错**（Q7.8）。

**最少测试用例计数（高频计算题）**：
- `if(A){ print; if(B){print} print }` → **statement 覆盖最少 1 个**（A=true,B=true 一次走完所有语句）。
- 三个**顺序**（非嵌套）`if(A) / if(B) / if(C)` → 共 **6 个分支**（3×2）；**branch 覆盖最少 2 个**用例（全 true 一次 + 全 false 一次）。

### 8.6 其它 QA 手段

- **Inspections & Reviews（人读文档/代码找缺陷）**：出奇地有效；还能传递知识、共享代码所有权。
- **Formal Methods（形式化方法）**：正确性证明——**仅 verification**，常配形式化规约。
- **Static Analysis（静态分析）**：不运行代码就分析源码找潜在缺陷（如 FindBugs）；结果需人复核（很多警告是误报）。

---

### ➕ 补充考点：覆盖准则全表 / oracle 例 / 未覆盖的测试类型（lecture，Quiz 未直接考）

- **黑盒等价类划分 worked example（成绩 0–100 → 字母）**：分区 F(0–59) / D(60–69) / C(70–79) / B(80–89) / A(90–100) + 非法(<0、>100)；边界值如 -1, 0, 59, 60, 69, 70, 79, 80, 89, 90, 100, 101。每个分区取代表值 + 边界值。
- **其它覆盖准则**（白盒）：**Condition coverage**（每个条件 T/F 都测，如 `a>b || c>d`）· **Method coverage**（每个方法都执行）· **Method-call coverage**（每个调用点到达每个方法，含多态）· **Data-flow**（定义→使用）· **Path coverage**（每条路径；循环取 0/1/平均/最大次数；最强但常**不可行**）。
- **白盒的局限**：可覆盖所有 node/edge 却仍漏掉明显 fault；某些 node/edge/循环组合**不可行（infeasible）**。
- **Test Oracle 例（cosine）**：怎么判断 cos(0.5)=0.8776 对不对？——用已知数学性质或参照实现作 oracle。
- **课程未深入、但要知道存在的测试类型**：Regression（回归）· Integration（集成）· Interaction/Mocking · Debugging · Mutation · Fuzz · Exploratory testing。
- **置信度 vs 测试数量**：用例越多置信度越高，但有"性价比甜点"，并非越多越好（且永远到不了"证明无 bug"）。


## 9️⃣ 软件过程模型 Process Models（L17–L18 · Quiz 8）⭐⭐

> **为什么要过程**：SE 很难（complexity/conformity/changeability/invisibility）→ 用**定义好的过程**确保"做对的事 / 把事做对 / 不遗漏"。过程**不是银弹**（Brooks）。
> **Model（模型）= 简化表示**；过程模型既可 **prescriptive（规定）** 也可 **descriptive（描述）**。

**8 个生命周期模型**（high-level process）：Build-and-Fix · Waterfall · Rapid Prototyping · Incremental · Spiral · RUP · XP · Agile。

### ① Build-and-Fix（构建-修补）
![Build-and-Fix](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_build_and_fix.png)
先写第一版，再不断改到客户满意。**优**：适合**小程序**。**劣**：对非平凡项目**不够严谨**。

### ② Waterfall（瀑布）
![Waterfall](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_waterfall.png)
线性阶段：Requirements → Design → Implementation → Integration → Testing → Maintenance。
**优**：先吃透需求、纪律严谨、文档多；适合**需求清楚且稳定**的项目。**劣**：僵化、难应对变更、用户参与少、常没时间测试（Healthcare.gov）。
> ⚠️ Q8.13：waterfall **假设需求相对稳定**。

### ③ Rapid Prototyping（快速原型）
![Rapid Prototyping](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_rapid_prototyping.png)
先**造一个简单原型再丢弃**，借此搞清需求，再正式开发。*"People don't know what they want until you show it to them." —Jobs / Humphrey's Law*。

### ④ Incremental（增量）
![Incremental](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_incremental.png)
先做需求 + 架构设计，然后**对每个增量**做详细设计/实现/集成/测试/交付。（MS 从 Win8 的 "ta-da" 转向 Win10 的迭代 + 用户反馈 + A/B。）

### ⑤ Spiral（螺旋）⭐⭐ 高频
![Spiral](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_spiral.png)
每个回路**固定以 Risk Analysis（风险分析）开始**，中间步骤**随风险分析结果变化**，回路末尾**验证**。
**优**：适合**需求不确定、复杂的新项目**；**最高风险的部分最先做**。**劣**：开发者要擅长风险分析；"项目终点"可能不明确。
> ⚠️ Q8.13 反转陷阱：Spiral **不是**"把最高风险的需求推迟到后面"——恰恰相反，它**尽早**攻克最高风险项。组织原则 = **risk management**。Spiral 与 Agile 都是**迭代**的。

### ⑥ Rational Unified Process (RUP)
![RUP](https://cdn.jsdelivr.net/gh/KKazuhaK/assets@main/ics.uci.edu/in4matx-43/final-review/pm_rup.png)
三大特征：**Use-case driven · Architecture-centric · Iterative & incremental**。四个阶段：**Inception → Elaboration → Construction → Transition**；每次迭代走完所有 workflow。
**优**：风险驱动、增量、工具支持多、指导详尽。**劣**：**重量级（Very heavyweight）**、复杂、需专门专长。

### ⑦ Extreme Programming (XP)
对瀑布等**重量级**过程的"极端"反弹（针对：周期长、难应对变更、假设需求开始就完全清楚、依赖英雄式投入、方法复杂、重复劳动）。
**核心实践（≈12–14 条）**：Whole team · **Small releases** · Customer tests · **Simple design** · **Pair programming（结对编程）** · **Test-driven development (TDD)** · Design improvement (refactoring) · **Continuous integration** · Collective code ownership · Coding standards · Sustainable pace · Open space · Shared understanding · Rapid fine feedback。
> ⚠️ **Pair programming = 两人一台机器**（driver 写、navigator 审，轮换）——XP 招牌实践（Q8.1 / Q8.14）。XP **比 RUP 轻**。

### ⑧ Agile（敏捷）
从 XP / Scrum / Crystal / Kanban 演化而来。**Agile Manifesto (2001) 四大价值**（"重视左项胜过右项"）：

| 重视 | 胜过 |
|---|---|
| **Individuals & interactions** | processes & tools |
| **Working software** | comprehensive documentation |
| **Customer collaboration** | contract negotiation |
| **Responding to change** | following a plan |

**原则**：欢迎需求变更、业务与开发者每日协作、围绕积极的人、面对面沟通、持续交付。
**优**：客户/开发者满意、适应变化、适合需求不清/小团队。**劣**：文档少、需求不稳、技术债；原版 Agile 不适合大团队 / 安全攸关 / 客户无法参与的项目。
> ⚠️ Agile **不**要求实现前把需求完全定死（那是 anti-Agile）。

### 过程模型对比速查

| 模型 | 迭代? | 适合 | 一句话记忆 |
|---|---|---|---|
| Build-and-Fix | 否 | 小程序 | 先做再补 |
| Waterfall | 否 | 需求**稳定**清楚 | 线性、文档多、僵化 |
| Rapid Prototyping | — | 需求不清 | 造原型→丢弃→再做 |
| Incremental | 是 | 可分块交付 | 一块块加 |
| **Spiral** | 是 | 不确定/高风险新项目 | **风险驱动、最险先做** |
| RUP | 是 | 大型、需指导 | 用例驱动+架构中心，**重量级** |
| XP | 是 | 变化快 | 结对+TDD+小发布 |
| Agile | 是 | 需求多变/小团队 | 拥抱变化、轻文档 |

> **大趋势**：从 **rigid / heavyweight / 文档驱动** → **lightweight / agile**。

---

### ➕ 补充考点：RUP 四阶段 / Boehm 风险 / Scrum / model 含义（lecture，Quiz 未直接考）

- **RUP 四阶段（按顺序）**：**Inception（初始）→ Elaboration（细化）→ Construction（构造）→ Transition（移交）**；每个 iteration 都会走完所有 workflow（Business Modeling、Requirements、Analysis & Design、Implementation、Test、Deployment + 支持类）。
- **Spiral 的 Boehm Top-10 风险（例 + 应对）**：人员不足→招顶尖人才/培训；不现实的进度预算→详细估算/复用/增量；做错功能→用户调研/原型；需求不断变→信息隐藏/增量；外部组件/任务不达标→兼容性分析/参考核查。
- **Scrum**：最流行的 Agile 框架（按 sprint 迭代）。
- **"model" 的两层含义**：model = **ideal（理想/范例）** 或 model = **simplified representation（简化表示）**；软件过程模型可 **prescriptive（规定）** 也可 **descriptive（描述）**。
- **其它课程主题（背景了解）**：**AI 辅助开发**（见 §5 Week 5 reading）· **version control / GitHub** · project estimation · **社会责任（= 伦理，见 §4）**。


## ⚡ 一页速记 + 高频易错点汇总（考前最后 10 分钟）

**🔑 必背清单**
- **3 ingredients**：People（最重要）+ Processes + Tools
- **3 perspectives**：Business=钱 / Engineering=内部质量 / User=所见一切（最重要）
- **4 essential difficulties**（Brooks）：Complexity, Conformity, Changeability, Invisibility
- **Essential（本质，难消除）vs Accidental（偶然，工具可降）complexity**
- **Requirements = WHAT not HOW**；needs not wants；Ziv's Law=需求必变
- **Analysis=理解 / Specification=记录(=文档)**
- **Use case = 文本**；flows=basic/alternative/exception；actor=人/硬件/软件；**不擅长非功能需求**
- **ACM**：Public First 最高优先；客户利益 vs 公众 → 公众赢
- **Architecture = principal design decisions**；元素=Components/Connectors/Configuration；**不保证 correctness**
- **Prescriptive(设计) vs Descriptive(代码)**；erosion 主因=short deadlines
- **6 风格**：MVC / Client-Server / Layered（下层最可复用）/ P2P / Pipe-Filter / Pub-Sub
- **MVC**：Model=数据&逻辑 / View=显示 / Controller=处理输入
- **Class=蓝图, Object=数据+方法**；UML 隔间=Name/Attributes/Operations；`+`public `−`private `#`protected `~`package
- **Multiplicity `*` → 持有 collection**（从对面读）
- **Aggregation(空心◇,可独立) vs Composition(实心◆,存在依赖)** — destruction test
- **高内聚 + 低耦合**（cohesion=内部关联；coupling=模块间依赖，别搞反）
- **8 UCD 方法** + **Nielsen 10 heuristics**（会配例子）
- **V&V**：Verification=build right（符合规约）/ Validation=build the right thing（符合用户）
- **Mistake→Fault→Error→Failure**；fault 不一定→failure
- **Dijkstra**：测试只证 bug 存在、不证不存在 → "测完所有 bug" 永远是错
- **Branch ⊇ Statement**；branch 自动满足 statement，反之不然；Path 最强但常不可行
- **测试层级**：Unit→Integration→System（快→慢）
- **Spiral**：每环以 risk analysis 开始、**最险先做**（不是推迟）
- **XP**：pair programming + TDD；比 RUP 轻
- **Agile 4 价值**；不要求前期定死需求

**⚠️ 最易掉坑 Top 10**
1. statement 与 branch 覆盖的**最少用例数**、以及 "statement⇒branch" 是**错的**。
2. **BVA 看清范围**：整个输入域 vs 单个分区的边界（{7,8,16,17} vs {18,49}）。
3. **Coupling/Cohesion 定义别反**（cohesion=内部；coupling=对外依赖）。
4. **Aggregation vs Composition**：能否独立存在 → composition 不能。
5. **Verification ≠ Validation**（符合规约 vs 符合用户需要）。
6. **Failure** = 外部可见（错误加班费 / AssertionError）；不是 fault。
7. **Spiral 把最险的先做**，不是推迟；风险驱动。
8. **Requirements 是 what**；指定语言/协议/iOS-用 Swift = how/实现，不是需求；iOS 平台 = context。
9. **Client-Server ≠ P2P**（客户端不互相直连）。
10. **Architecture 不保证 correctness**；architecture 是 design 的**子集**（设计远不止 UI）。

---

## 🌳 知识树（Knowledge Tree）

```
INF 43 Software Engineering
├── What is SE?            → 定义 · 3视角 · 3要素(People) · 原则 · No Silver Bullet(4困难)
├── 需求 Requirements      → what≠how · analysis/spec · 文档结构 · Ziv's Law
│   └── Use Cases          → 文本 · flows · actors · 用例图（非功能除外）
├── Ethics (ACM)           → 8原则 · Public First
├── 架构 Architecture      → principal decisions · 组件/连接器/配置 · 规定vs描述 · erosion
│   └── 6 风格              → MVC · Client-Server · Layered · P2P · Pipe-Filter · Pub-Sub
├── 设计 Design + UML      → 6途径 · think/talk/prescribe · 抽象 · 类图/关系 · 内聚耦合
├── 用户中心 UCD           → 8方法 · Nielsen 10 heuristics
├── 测试 Testing           → V&V · IEEE链 · 层级 · 黑盒(EP/BVA) · 白盒(CFG/coverage) · Dijkstra
└── 过程模型 Process       → Build-Fix · Waterfall · Prototyping · Incremental · Spiral · RUP · XP · Agile
```

> **一句话总结**：软件工程 = *构建一组相关模型来表示 system-to-be 的过程*——从"该造什么（需求/用例）"，到"怎么搭（架构/设计/UML）"，到"如何贴合用户（UCD）"，到"怎么验证它能工作（测试）"，再到"按什么流程推进（过程模型）"，全程回扣 **rigor、separation of concerns、anticipation of change** 等基本原则。

---

*Notes 依据：INF 43 Lectures 1–19（PPT）+ Quiz 1–8（含 Practice Final）+ 出勤 Quiz。图示取自课程幻灯片；架构风格图与 IEEE 链为依据课程内容重绘。祝考试顺利！💪*